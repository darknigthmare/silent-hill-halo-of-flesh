#!/usr/bin/env python3
"""Read the four original fill-only text rules, without writing an XLSX.

This intentionally rejects richer or changed rules. The builder can then restore
the original solid fills through the documented artifact-tool API, and the
independent package comparator checks the resulting native definitions.
"""
import argparse
import hashlib
import json
from pathlib import Path
import posixpath
import xml.etree.ElementTree as ET
import zipfile

NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
REL = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
EXPECTED = {"Corpus": ["G9:G74", "E9:E74"], "Stages": ["D9:D131", "E9:E131"]}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def read_rules(path):
    raw = path.read_bytes()
    rules = []
    with zipfile.ZipFile(path) as package:
        styles = ET.fromstring(package.read("xl/styles.xml"))
        dxfs = styles.find("s:dxfs", NS)
        require(dxfs is not None and len(dxfs) == 4, "Expected the four original dxf definitions.")
        relationships = ET.fromstring(package.read("xl/_rels/workbook.xml.rels"))
        targets = {r.get("Id"): r.get("Target") for r in relationships}
        workbook = ET.fromstring(package.read("xl/workbook.xml"))
        sheets = workbook.find("s:sheets", NS)
        require([s.get("name") for s in sheets] == list(EXPECTED), "Unexpected sheet names/order.")
        for sheet in sheets:
            name = sheet.get("name")
            target = targets[sheet.get(REL)]
            part = target.lstrip("/") if target.startswith("/") else posixpath.normpath(posixpath.join("xl", target))
            xml = ET.fromstring(package.read(part))
            conditional = xml.findall("s:conditionalFormatting", NS)
            require([c.get("sqref") for c in conditional] == EXPECTED[name], "Unexpected conditional-format ranges.")
            for index, block in enumerate(conditional):
                require(set(block.attrib) == {"sqref"} and len(block) == 1, "Complex rule block cannot be rehydrated.")
                rule = block[0]
                require(rule.tag == "{" + NS["s"] + "}cfRule" and len(rule) == 0, "Rule has unsupported children.")
                require(set(rule.attrib) == {"type", "dxfId", "priority", "operator", "text"}, "Unexpected rule attributes.")
                require(rule.get("type") == rule.get("operator") == "containsText", "Only the original text rules are supported.")
                require(int(rule.get("priority")) == index + 1, "Unexpected rule priority.")
                dxf_id = int(rule.get("dxfId"))
                dxf = dxfs[dxf_id]
                require(not dxf.attrib and len(dxf) == 1 and dxf[0].tag == "{" + NS["s"] + "}fill", "Not a fill-only differential format.")
                fill = dxf[0]
                require(not fill.attrib and len(fill) == 1 and fill[0].tag == "{" + NS["s"] + "}patternFill", "Unsupported differential fill.")
                pattern = fill[0]
                require(pattern.attrib == {"patternType": "solid"} and len(pattern) == 1, "Expected a solid background-color fill.")
                color = pattern[0]
                require(color.tag == "{" + NS["s"] + "}bgColor" and set(color.attrib) == {"rgb"} and not len(color), "Unsupported fill color.")
                rgb = color.get("rgb")
                require(len(rgb) == 8 and rgb.startswith("FF") and all(c in "0123456789ABCDEF" for c in rgb), "Expected an opaque ARGB color.")
                rules.append({"sheet": name, "range": block.get("sqref"), "type": "containsText",
                              "operator": "containsText", "text": rule.get("text"),
                              "priority": int(rule.get("priority")), "sourceDxfId": dxf_id,
                              "patternType": "solid", "fill": "#" + rgb[2:]})
    require(sorted(r["sourceDxfId"] for r in rules) == list(range(4)), "The four source differential formats must each have one rule.")
    require(path.read_bytes() == raw, "Source changed during read-only inspection.")
    return {"schema": 1, "source": str(path.resolve()), "sourceSHA256": hashlib.sha256(raw).hexdigest(),
            "readOnly": True, "rules": rules}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    args = parser.parse_args()
    print(json.dumps(read_rules(args.source), ensure_ascii=False))
