#!/usr/bin/env python3
"""Compare two XLSX packages without modifying either workbook.

Only JSON evidence is written. No formulas are evaluated. Style indexes and
relationship IDs are resolved to their contents so normal ZIP renumbering is
not itself a failure. See --help for the exact preservation scope.
"""
from __future__ import annotations

import argparse
from collections import Counter
from decimal import Decimal, InvalidOperation
import hashlib
import json
from pathlib import Path
import posixpath
import sys
from typing import Any
import xml.etree.ElementTree as ET
import zipfile

MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
Q = lambda name: "{" + MAIN + "}" + name

BOOL_ATTRIBUTES = {
    "hidden", "customHeight", "customFormat", "customWidth", "bestFit",
    "collapsed", "thickTop", "thickBot", "phonetic", "quotePrefix", "pivotButton",
    "applyAlignment", "applyBorder", "applyFill", "applyFont",
    "applyNumberFormat", "applyProtection", "locked", "showDropDown",
    "allowBlank", "showInputMessage", "showErrorMessage", "disablePrompts",
    "showFirstColumn", "showLastColumn", "showRowStripes", "showColumnStripes",
    "showGridLines", "showRowColHeaders", "showZeros", "tabSelected",
    "rightToLeft", "showOutlineSymbols", "showRuler", "showWhiteSpace",
    "defaultGridColor", "totalsRowShown", "stopIfTrue", "aboveAverage",
    "percent", "bottom", "equalAverage", "wrapText", "shrinkToFit",
}
FONT_FLAGS = {"b", "i", "strike", "outline", "shadow", "condense", "extend"}
DEFAULTS = {
    "table": {"headerRowCount": "1", "totalsRowCount": "0", "totalsRowShown": "0"},
    "tableStyleInfo": {"showFirstColumn": "0", "showLastColumn": "0",
                       "showRowStripes": "0", "showColumnStripes": "0"},
    "dataValidation": {"allowBlank": "0", "showInputMessage": "0",
                       "showErrorMessage": "0", "showDropDown": "0",
                       "errorStyle": "stop", "imeMode": "noControl"},
    "dataValidations": {"disablePrompts": "0"},
    "sheetView": {"showGridLines": "1", "showRowColHeaders": "1", "showZeros": "1",
                  "tabSelected": "0", "rightToLeft": "0", "view": "normal",
                  "showOutlineSymbols": "1", "defaultGridColor": "1"},
}
BUILTIN_FORMATS = {
    0: "General", 1: "0", 2: "0.00", 3: "#,##0", 4: "#,##0.00",
    9: "0%", 10: "0.00%", 11: "0.00E+00", 12: "# ?/?", 13: "# ??/??",
    14: "mm-dd-yy", 15: "d-mmm-yy", 16: "d-mmm", 17: "mmm-yy",
    18: "h:mm AM/PM", 19: "h:mm:ss AM/PM", 20: "h:mm", 21: "h:mm:ss",
    22: "m/d/yy h:mm", 37: "#,##0 ;(#,##0)", 38: "#,##0 ;[Red](#,##0)",
    39: "#,##0.00;(#,##0.00)", 40: "#,##0.00;[Red](#,##0.00)",
    45: "mm:ss", 46: "[h]:mm:ss", 47: "mmss.0", 48: "##0.0E+0", 49: "@",
}


def local(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def numeric(text: str | None) -> str | None:
    if text is None or text == "":
        return None
    try:
        value = Decimal(text)
        if not value.is_finite():
            return text
        return format(value.normalize(), "f")
    except InvalidOperation:
        return text


def boolean(text: str) -> str:
    return {"true": "1", "false": "0"}.get(text, text)


def canonical(node: ET.Element | None, *, styles=None, unordered=False,
              omit_attributes=()) -> Any:
    if node is None:
        return None
    tag = local(node.tag)
    attrs = {}
    for key, value in node.attrib.items():
        name = local(key)
        if name in omit_attributes:
            continue
        if name in BOOL_ATTRIBUTES:
            value = boolean(value)
        if DEFAULTS.get(tag, {}).get(name) == value:
            continue
        if name == "dxfId" and styles is not None:
            attrs[name] = styles.differential(int(value))
        else:
            attrs[key] = value
    if unordered and tag in FONT_FLAGS:
        value = boolean(node.attrib.get("val", "1"))
        if value == "0":
            return None
        attrs["val"] = "1"
    children = [
        canonical(child, styles=styles, unordered=unordered)
        for child in node
    ]
    children = [child for child in children if child is not None]
    if unordered:
        children.sort(key=lambda obj: json.dumps(obj, sort_keys=True, ensure_ascii=False))
    text = node.text if node.text and node.text.strip() else None
    return {"tag": node.tag, "attributes": attrs, "text": text, "children": children}


class Styles:
    def __init__(self, root: ET.Element | None):
        root = root if root is not None else ET.Element(Q("styleSheet"))
        self.fonts = list(root.find(Q("fonts")) or [])
        self.fills = list(root.find(Q("fills")) or [])
        self.borders = list(root.find(Q("borders")) or [])
        self.style_xfs = list(root.find(Q("cellStyleXfs")) or [])
        self.cell_xfs = list(root.find(Q("cellXfs")) or [])
        self.dxfs = list(root.find(Q("dxfs")) or [])
        self.number_formats = {
            int(e.attrib["numFmtId"]): e.attrib["formatCode"]
            for e in root.findall(Q("numFmts") + "/" + Q("numFmt"))
        }
        self.root = root
        self.cache = {}

    def component(self, values, index):
        if not values and index == 0:
            return None
        if index < 0 or index >= len(values):
            raise ValueError("Invalid style component index: " + str(index))
        return canonical(values[index], unordered=True)

    def differential(self, index):
        return self.component(self.dxfs, index)

    def xf(self, element, parent=False):
        properties = {}
        identifiers = {"numFmtId", "fontId", "fillId", "borderId", "xfId"}
        for key, value in element.attrib.items():
            if key in identifiers:
                continue
            if key in BOOL_ATTRIBUTES:
                value = boolean(value)
            properties[key] = value
        number_id = int(element.attrib.get("numFmtId", "0"))
        result = {
            "properties": properties,
            "numberFormat": self.number_formats.get(number_id, BUILTIN_FORMATS.get(number_id, "builtin:" + str(number_id))),
            "font": self.component(self.fonts, int(element.attrib.get("fontId", "0"))),
            "fill": self.component(self.fills, int(element.attrib.get("fillId", "0"))),
            "border": self.component(self.borders, int(element.attrib.get("borderId", "0"))),
            "children": sorted(
                [canonical(e, unordered=True) for e in element],
                key=lambda obj: json.dumps(obj, sort_keys=True, ensure_ascii=False)
            ),
        }
        if not parent:
            index = int(element.attrib.get("xfId", "0"))
            if self.style_xfs:
                if index >= len(self.style_xfs):
                    raise ValueError("Invalid parent style index: " + str(index))
                result["parent"] = self.xf(self.style_xfs[index], parent=True)
        return result

    def cell(self, index=0):
        if index not in self.cache:
            if not self.cell_xfs and index == 0:
                self.cache[index] = None
            else:
                if index < 0 or index >= len(self.cell_xfs):
                    raise ValueError("Invalid cell style index: " + str(index))
                self.cache[index] = self.xf(self.cell_xfs[index])
        return self.cache[index]

    def named(self):
        result = {}
        for element in self.root.findall(Q("cellStyles") + "/" + Q("cellStyle")):
            name = element.attrib["name"]
            index = int(element.attrib["xfId"])
            if index >= len(self.style_xfs):
                raise ValueError("Invalid named style: " + name)
            result[name] = {
                "attributes": {k: v for k, v in element.attrib.items() if k != "xfId"},
                "style": self.xf(self.style_xfs[index], parent=True),
            }
        return result


def target_path(part, target):
    result = posixpath.normpath(
        target.lstrip("/") if target.startswith("/")
        else posixpath.join(posixpath.dirname(part), target)
    )
    if result.startswith("../") or result == "..":
        raise ValueError("Relationship escapes XLSX package.")
    return result


def relationships(archive, part):
    relationship_part = posixpath.join(
        posixpath.dirname(part), "_rels", posixpath.basename(part) + ".rels"
    )
    if relationship_part not in archive.namelist():
        return {}
    root = ET.fromstring(archive.read(relationship_part))
    return {
        e.attrib["Id"]: {
            "type": e.attrib["Type"],
            "external": e.attrib.get("TargetMode") == "External",
            "target": e.attrib["Target"] if e.attrib.get("TargetMode") == "External"
            else target_path(part, e.attrib["Target"]),
        }
        for e in root
    }


def string_value(node):
    if node is None:
        return "", None
    text = "".join(e.text or "" for e in node.iter(Q("t")))
    runs = list(node.findall(Q("r")))
    rich = [canonical(e, unordered=False) for e in runs] if runs else None
    return text, rich


def parse_cell(cell, shared_strings, styles):
    typ = cell.attrib.get("t", "n")
    raw = cell.find(Q("v"))
    value = raw.text if raw is not None else None
    rich = None
    if typ == "s":
        value, rich = shared_strings[int(value)]
        typ = "string"
    elif typ == "inlineStr":
        value, rich = string_value(cell.find(Q("is")))
        typ = "string"
    elif typ == "str":
        typ = "string"
    elif typ == "b":
        value = boolean(value or "0")
    elif typ == "n":
        value = numeric(value)
    if value is None:
        typ = "blank"
    return {
        "value": {"type": typ, "value": value, "richText": rich},
        "formula": canonical(cell.find(Q("f"))),
        "style": styles.cell(int(cell.attrib.get("s", "0"))),
    }


def load_package(path):
    with zipfile.ZipFile(path) as archive:
        names = set(archive.namelist())
        wb_part = "xl/workbook.xml"
        workbook = ET.fromstring(archive.read(wb_part))
        rels = relationships(archive, wb_part)
        style_part = next((r["target"] for r in rels.values() if r["type"].endswith("/styles")), "xl/styles.xml")
        styles = Styles(ET.fromstring(archive.read(style_part)) if style_part in names else None)
        string_part = next((r["target"] for r in rels.values() if r["type"].endswith("/sharedStrings")), "xl/sharedStrings.xml")
        shared = [string_value(e) for e in ET.fromstring(archive.read(string_part))] if string_part in names else []
        sheets = {}
        order = []
        metadata_tags = [
            "sheetPr", "sheetViews", "sheetFormatPr", "dataValidations",
            "conditionalFormatting", "sheetProtection", "autoFilter",
            "mergeCells", "printOptions", "pageMargins", "pageSetup",
            "headerFooter", "rowBreaks", "colBreaks",
        ]
        for entry in workbook.find(Q("sheets")):
            name = entry.attrib["name"]
            order.append({"name": name, "state": entry.attrib.get("state", "visible")})
            relation = rels[entry.attrib["{" + REL + "}id"]]
            if not relation["type"].endswith("/worksheet"):
                raise ValueError("Unsupported non-worksheet sheet: " + name)
            part = relation["target"]
            sheet = ET.fromstring(archive.read(part))
            sheet_rels = relationships(archive, part)
            cells = {}
            rows = {}
            data = sheet.find(Q("sheetData"))
            for row in data if data is not None else []:
                row_id = int(row.attrib["r"])
                attrs = {k: boolean(v) if k in BOOL_ATTRIBUTES else numeric(v) if k == "ht" else v
                         for k, v in row.attrib.items() if k not in {"r", "spans", "s"}}
                if "s" in row.attrib:
                    attrs["style"] = styles.cell(int(row.attrib["s"]))
                if attrs:
                    rows[str(row_id)] = attrs
                for cell in row.findall(Q("c")):
                    cells[cell.attrib["r"]] = parse_cell(cell, shared, styles)
            columns = {}
            for col in sheet.findall(Q("cols") + "/" + Q("col")):
                attrs = {k: boolean(v) if k in BOOL_ATTRIBUTES else numeric(v) if k == "width" else v
                         for k, v in col.attrib.items() if k not in {"min", "max", "style"}}
                if "style" in col.attrib:
                    attrs["style"] = styles.cell(int(col.attrib["style"]))
                for index in range(int(col.attrib["min"]), int(col.attrib["max"]) + 1):
                    columns[str(index)] = attrs
            metadata = {
                tag: [canonical(e, styles=styles) for e in sheet.findall(Q(tag))]
                for tag in metadata_tags
            }
            tables = {}
            for table_ref in sheet.findall(Q("tableParts") + "/" + Q("tablePart")):
                table_rel = sheet_rels[table_ref.attrib["{" + REL + "}id"]]
                table = ET.fromstring(archive.read(table_rel["target"]))
                tables[table.attrib["name"]] = canonical(table, styles=styles, omit_attributes=("id",))
            hyperlinks = []
            for link in sheet.findall(Q("hyperlinks") + "/" + Q("hyperlink")):
                attrs = dict(link.attrib)
                relation_id = attrs.pop("{" + REL + "}id", None)
                if relation_id:
                    attrs["resolvedRelationship"] = sheet_rels[relation_id]
                hyperlinks.append(attrs)
            # Preserve extension metadata as well, notably x14 conditional formats.
            extension = canonical(sheet.find(Q("extLst")), styles=styles)
            sheets[name] = {
                "cells": cells, "defaultStyle": styles.cell(0), "rows": rows,
                "columns": columns, "metadata": metadata, "tables": tables,
                "hyperlinks": hyperlinks, "extensions": extension,
            }
        themes = [
            canonical(ET.fromstring(archive.read(r["target"])))
            for r in rels.values() if r["type"].endswith("/theme") and not r["external"]
        ]
        return {
            "sheetOrder": order, "definedNames": canonical(workbook.find(Q("definedNames"))),
            "namedStyles": styles.named(),
            "tableStyles": canonical(styles.root.find(Q("tableStyles")), styles=styles),
            "indexedColors": canonical(styles.root.find(Q("colors"))),
            "themes": themes, "sheets": sheets,
        }


def first_difference(expected, actual, path=""):
    if type(expected) is not type(actual):
        return path, expected, actual
    if isinstance(expected, dict):
        for key in sorted(set(expected) | set(actual)):
            if key not in expected or key not in actual:
                return path + "/" + key, expected.get(key), actual.get(key)
            if expected[key] != actual[key]:
                return first_difference(expected[key], actual[key], path + "/" + key)
    elif isinstance(expected, list):
        if len(expected) != len(actual):
            return path + "/length", len(expected), len(actual)
        for i, (left, right) in enumerate(zip(expected, actual)):
            if left != right:
                return first_difference(left, right, path + "/" + str(i))
    return path, expected, actual


def short(value):
    data = json.dumps(value, ensure_ascii=False, sort_keys=True)
    return value if len(data) <= 700 else {"preview": data[:700], "truncated": True,
                                            "sha256": hashlib.sha256(data.encode()).hexdigest()}


def compare_models(source, exported, stage_ids, *, stage_sheet="Stages", require_active=False):
    differences = []
    categories = Counter()
    allowed_changes = []
    allowed_row_height_changes = []
    transitions = []

    def compare(category, location, expected, actual):
        if expected == actual:
            return
        categories[category] += 1
        if len(differences) < 200:
            suffix, before, after = first_difference(expected, actual)
            differences.append({"category": category, "location": location + suffix,
                                "source": short(before), "export": short(after)})

    for key in ["sheetOrder", "definedNames", "namedStyles", "tableStyles", "indexedColors", "themes"]:
        compare("workbook-" + key, key, source[key], exported[key])
    source_sheets, exported_sheets = source["sheets"], exported["sheets"]
    if stage_sheet not in source_sheets or stage_sheet not in exported_sheets:
        raise ValueError("Missing stage sheet: " + stage_sheet)

    blank_value = {"type": "blank", "value": None, "richText": None}

    def cell(sheet, address):
        return sheet["cells"].get(address, {"value": blank_value, "formula": None,
                                           "style": sheet["defaultStyle"]})

    def target_row(sheet, stage_id):
        matches = [
            row for row in range(9, 132)
            if cell(sheet, "A" + str(row))["value"]["value"] == stage_id
        ]
        if len(matches) != 1:
            raise ValueError("Stage ID must occur exactly once in A9:A131: " + stage_id)
        return matches[0]

    allowed = {"B4", "E4"}
    allowed_height_rows = set()
    for stage_id in stage_ids:
        before_row = target_row(source_sheets[stage_sheet], stage_id)
        after_row = target_row(exported_sheets[stage_sheet], stage_id)
        compare("stable-stage-row", stage_sheet + "/" + stage_id, before_row, after_row)
        allowed.update(col + str(before_row) for col in ["D", "G", "J"])
        allowed_height_rows.add(str(before_row))
        before = cell(source_sheets[stage_sheet], "D" + str(before_row))["value"]["value"]
        after = cell(exported_sheets[stage_sheet], "D" + str(after_row))["value"]["value"]
        transitions.append({"stageId": stage_id, "row": before_row, "source": before, "export": after})
        if require_active:
            compare("stage-status", stage_sheet + "/D" + str(after_row), "Actif", after)

    for name in sorted(set(source_sheets) | set(exported_sheets)):
        if name not in source_sheets or name not in exported_sheets:
            compare("sheet-presence", name, name in source_sheets, name in exported_sheets)
            continue
        before, after = source_sheets[name], exported_sheets[name]
        for key in ["columns", "tables", "hyperlinks", "extensions"]:
            compare("sheet-" + key, name + "/" + key, before[key], after[key])
        for row_id in sorted(set(before["rows"]) | set(after["rows"]), key=int):
            left, right = before["rows"].get(row_id, {}), after["rows"].get(row_id, {})
            if name == stage_sheet and row_id in allowed_height_rows:
                height_keys = {"ht", "customHeight"}
                compare("sheet-row-properties", name + "/rows/" + row_id,
                        {k: v for k, v in left.items() if k not in height_keys},
                        {k: v for k, v in right.items() if k not in height_keys})
                old_height = {k: left[k] for k in height_keys if k in left}
                new_height = {k: right[k] for k in height_keys if k in right}
                if old_height != new_height:
                    allowed_row_height_changes.append({"sheet": name, "row": int(row_id),
                                                       "source": old_height, "export": new_height})
            else:
                compare("sheet-row-properties", name + "/rows/" + row_id, left, right)
        for tag in before["metadata"]:
            compare("sheet-" + tag, name + "/" + tag, before["metadata"][tag], after["metadata"][tag])
        compare("cell-default-style", name, before["defaultStyle"], after["defaultStyle"])
        for address in sorted(set(before["cells"]) | set(after["cells"])):
            left, right = cell(before, address), cell(after, address)
            compare("cell-formula", name + "/" + address, left["formula"], right["formula"])
            compare("cell-style", name + "/" + address, left["style"], right["style"])
            if name == stage_sheet and address in allowed:
                if left["value"] != right["value"]:
                    allowed_changes.append({"sheet": name, "cell": address,
                                            "source": short(left["value"]), "export": short(right["value"])})
            else:
                compare("cell-value", name + "/" + address, left["value"], right["value"])
    count = sum(categories.values())
    return {
        "passed": count == 0, "differenceCount": count, "differencesByCategory": dict(categories),
        "differences": differences, "differencesTruncated": count > len(differences),
        "allowedValueCells": {stage_sheet: sorted(allowed)},
        "allowedValueChanges": allowed_changes,
        "allowedRowHeightRows": {stage_sheet: sorted(map(int, allowed_height_rows))},
        "allowedRowHeightChanges": allowed_row_height_changes,
        "stageStatusTransitions": transitions,
        "requireActiveStages": require_active,
    }


def sha(path):
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True, type=Path, help="Untouched original XLSX.")
    parser.add_argument("--export", dest="exported", required=True, type=Path, help="Exported XLSX to inspect.")
    parser.add_argument("--stage-ids", required=True, help="Four unique stable stage IDs, comma separated.")
    parser.add_argument("--stage-sheet", default="Stages")
    parser.add_argument("--require-active-stages", action="store_true",
                        help="Also require the four exported status cells to be Actif.")
    parser.add_argument("--report", required=True, type=Path, help="Fresh JSON evidence path; never overwrite.")
    args = parser.parse_args()
    ids = args.stage_ids.split(",")
    if len(ids) != 4 or len(set(ids)) != 4 or any(not value.strip() or value != value.strip() for value in ids):
        parser.error("--stage-ids must contain exactly four unique IDs without surrounding spaces.")
    source, exported, output = args.source.resolve(), args.exported.resolve(), args.report.resolve()
    if output in {source, exported}:
        parser.error("Report path must differ from both XLSX paths.")
    if output.exists():
        parser.error("Report already exists; use a fresh path.")
    report = {
        "schema": 1, "kind": "xlsx-package-semantic-preservation",
        "source": str(source), "export": str(exported), "stageIds": ids,
        "workbooksWritten": 0, "formulasRecalculated": False,
        "scope": [
            "All worksheet cell values except explicit permitted cells; every formula and effective cell style.",
            "Native validations and conditional formats, including resolved differential styles.",
            "Table definitions and filters; row and column formats/heights/widths; sheet views and frozen panes.",
            "Only the four target stage rows may change ht/customHeight; before/after are recorded. No width or cell-style changes are permitted.",
            "Named styles, custom table styles, indexed colors, themes, defined names and hyperlinks.",
            "Sheet protection, merges, print metadata and sheet extension metadata."
        ],
        "limits": [
            "No formula evaluation, rendering or visual-fidelity assessment.",
            "ZIP entry order, timestamps, relationship IDs and unused style records may differ without failure.",
            "Not a comparison of arbitrary OOXML parts such as charts, images, comments, macros or digital signatures.",
            "Unknown or unsupported worksheet structures fail or remain outside the stated comparison scope.",
            "Allowed value changes are permitted, not computed here; the authoring verification validates their contents."
        ],
    }
    status = 2
    try:
        before_source, before_export = sha(source), sha(exported)
        report["sourceSHA256"], report["exportSHA256"] = before_source, before_export
        report.update(compare_models(load_package(source), load_package(exported), ids,
                                     stage_sheet=args.stage_sheet, require_active=args.require_active_stages))
        report["inputFilesUnchanged"] = sha(source) == before_source and sha(exported) == before_export
        if not report["inputFilesUnchanged"]:
            report["passed"] = False
            report["concurrentChange"] = "An input changed while being read; rerun on stable copies."
        status = 0 if report["passed"] else 1
    except Exception as error:
        report["passed"] = False
        report["error"] = type(error).__name__ + ": " + str(error)
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("x", encoding="utf-8") as stream:
        json.dump(report, stream, indent=2, ensure_ascii=False)
        stream.write("\n")
    print(json.dumps({"passed": report["passed"], "report": str(output),
                      "differenceCount": report.get("differenceCount"), "error": report.get("error")}))
    return status


if __name__ == "__main__":
    sys.exit(main())
