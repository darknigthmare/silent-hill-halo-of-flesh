#!/usr/bin/env python3
"""Narrow, verified OOXML update without a spreadsheet application.

Usage: update-production-workbook.py PLAN EXISTING_XLSX PREVIOUS_REPORT OUTPUT_DIR PREVIOUS_PLAN
Row scope is fixed except an audited append at the end of Sources.
Untouched ZIP members and unrelated XML are preserved.
Only the workbook's COUNTA/COUNTIFS/SUM arithmetic is supported; other formulas
fail closed. No source timings, art approvals or certification are invented.
"""
from __future__ import annotations

import argparse
from collections import Counter
from copy import deepcopy
import gzip
import hashlib
import importlib.util
import json
import math
import os
from pathlib import Path
import posixpath
import re
import tempfile
from xml.sax.saxutils import escape
import xml.etree.ElementTree as ET
from zipfile import ZipFile

MAIN = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
NS = {'s': MAIN}
REL = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'
TABLES = {'Combattants': 'fighters', 'Mouvements': 'moves', 'Finishers': 'finishers',
          'Présentations': 'presentations', 'Clips': 'poses', 'Arènes': 'stages',
          'Animations arènes': 'stageAnimations', 'Actions': 'tasks',
          'Gestes référencés': 'observations', 'Sources': 'sources'}
ROLES = {'combatant': 'Combattant', 'stationary-boss': 'Boss fixe',
         'multi-body': 'Plusieurs corps', 'scripted-encounter': 'Rencontre scriptée',
         'environmental-obstacle': 'Obstacle du décor', 'noncombatant': 'Non-combattant',
         'unverified': 'Rôle à vérifier'}
ANNOTATED = {'owner', 'delivery', 'productionStatus', 'sourceFrameRate',
             'sourceStart', 'sourceImpact', 'sourceEnd'}
SOURCE_FIELDS = {'id': 'A', 'title': 'B', 'type': 'C', 'scope': 'D',
                 'caveat': 'E', 'consultedAt': 'F', 'url': 'G'}


def scalar(value, field=None):
    if field == 'targetRole':
        return ROLES.get(value, value)
    if isinstance(value, bool):
        return 'Oui' if value else 'Non'
    if isinstance(value, list):
        return ', '.join(str(item) for item in value)
    if isinstance(value, dict):
        return json.dumps(value, ensure_ascii=False, separators=(',', ':'))
    if isinstance(value, float) and not math.isfinite(value):
        raise ValueError('Non-finite worksheet value')
    return value


def normalize(value):
    return None if value == '' else value


def column_number(column):
    number = 0
    for char in column:
        number = number * 26 + ord(char) - ord('A') + 1
    return number


def column_name(number):
    result = ''
    while number:
        number, remainder = divmod(number - 1, 26)
        result = chr(65 + remainder) + result
    return result


def text_value(text):
    # Literal CR must survive XML line-end normalization.
    if any(ord(char) < 32 and char not in '\t\n\r' for char in text):
        raise ValueError('Invalid XML control character')
    return escape(text).replace('\r', '&#13;')


def summary_text(metrics, legacy=False):
    art = (f'{metrics["pngCandidates"]} PNG candidats, {metrics["animatedClips"]} clip animé'
           if legacy else f'{metrics["pngCandidates"]} profils avec PNG candidats, {metrics["animatedClips"]} montage animé candidat')
    return (f'{metrics["reviewedCombatProfiles"]} fiches appliquées ; {metrics["authoredFinishers"]} montages de finisher ; '
            f'{metrics["referenceStageTracks"]} éléments d’arène ; {metrics["presentationHooks"]} hooks. '
            f'{metrics["disabledMoves"]} commandes bloquées. Images : {art}, '
            f'{metrics["certifiedOneToOne"]} fidélité 1:1 certifiée.')


class WorkbookEditor:
    """Read cells with ElementTree; replace only authored byte spans on export."""

    def __init__(self, path):
        self.path = Path(path)
        with ZipFile(path) as archive:
            if archive.testzip() is not None:
                raise ValueError('Invalid workbook ZIP CRC')
            self.infos = archive.infolist()
            if len({info.filename for info in self.infos}) != len(self.infos):
                raise ValueError('Duplicate workbook ZIP member')
            self.parts = {info.filename: archive.read(info) for info in self.infos}
            self.comment = archive.comment
        self.shared_path = 'xl/sharedStrings.xml'
        self.shared_root = ET.fromstring(self.parts[self.shared_path]) if self.shared_path in self.parts else None
        self.shared_items = list(self.shared_root) if self.shared_root is not None else []
        self.shared = [''.join(item.itertext()) for item in self.shared_items]
        self.shared_new = []
        book = ET.fromstring(self.parts['xl/workbook.xml'])
        relationships = {item.get('Id'): item.get('Target')
                         for item in ET.fromstring(self.parts['xl/_rels/workbook.xml.rels'])}
        self.sheets = {}
        self.changes = []
        self.layout_changes = []
        self.structure_changes = []
        self.added_cells = set()
        for item in book.findall('s:sheets/s:sheet', NS):
            target = relationships[item.get(REL + 'id')]
            location = target.lstrip('/') if target.startswith('/') else posixpath.normpath('xl/' + target)
            raw = self.parts[location].decode('utf-8')
            xml = ET.fromstring(raw)
            prefix = re.search(r'<([A-Za-z_][\w.-]*:)?worksheet\b', raw)
            if xml.tag != '{' + MAIN + '}worksheet' or prefix is None:
                raise ValueError('Unsupported worksheet XML namespace')
            cells = {cell.get('r'): cell for cell in xml.findall('s:sheetData/s:row/s:c', NS)}
            values = {address: self._read_cell(cell) for address, cell in cells.items()}
            self.sheets[item.get('name')] = {
                'path': location, 'raw': raw, 'xml': xml, 'prefix': prefix.group(1) or '',
                'cells': cells, 'values': values, 'writes': {}, 'heights': {}, 'formula_writes': {},
                'rows': {row.get('r'): row for row in xml.findall('s:sheetData/s:row', NS)}}

    def _read_cell(self, cell):
        raw = cell.findtext('s:v', None, NS)
        kind = cell.get('t')
        if kind == 's':
            return self.shared[int(raw)]
        if kind == 'inlineStr':
            return ''.join(cell.find('s:is', NS).itertext())
        if kind == 'b':
            return 'Oui' if raw == '1' else 'Non'
        if kind == 'e':
            raise ValueError('Cached Excel error: ' + str(raw))
        if raw is None or kind == 'str':
            return raw
        number = float(raw)
        if not math.isfinite(number):
            raise ValueError('Non-finite cached number')
        return int(number) if number.is_integer() else number

    def value(self, sheet, address):
        if sheet not in self.sheets:
            raise ValueError('Unknown worksheet: ' + sheet)
        return self.sheets[sheet]['values'].get(address.replace('$', ''))

    def set_value(self, name, address, after, *, formula_cache=False):
        sheet = self.sheets[name]
        if address not in sheet['cells']:
            raise ValueError(f'Cell scope changed: {name}!{address}')
        cell = sheet['cells'][address]
        has_formula = cell.find('s:f', NS) is not None
        if has_formula != formula_cache:
            raise ValueError(f'Refuse changing formula content: {name}!{address}')
        before = sheet['values'][address]
        added = (name, address) in self.added_cells
        if normalize(before) == normalize(after) and not added:
            return
        after = scalar(after)
        self.changes.append({'sheet': name, 'address': address, 'before': before, 'after': after,
                             **({'kind': 'source-append-cell'} if added else {'kind': 'formula-cache'} if formula_cache else {})})
        sheet['values'][address] = after
        sheet['writes'][address] = (after, formula_cache)
        if isinstance(after, str) and after and not formula_cache and name != 'Synthèse':
            column, row = re.fullmatch(r'([A-Z]+)([0-9]+)', address).groups()
            index = column_number(column)
            widths = [float(col.get('width')) for col in sheet['xml'].findall('s:cols/s:col', NS)
                      if int(col.get('min')) <= index <= int(col.get('max'))]
            if len(widths) != 1 or widths[0] <= 3:
                raise ValueError(f'Unreadable column width: {name}:{column}')
            required = min(390, 18 + 13 * sum(max(1, math.ceil(len(line) / max(8, widths[0] - 3)))
                                             for line in after.split('\n')))
            current = float(sheet['rows'][row].get('ht'))
            if required > current:
                sheet['heights'][row] = max(required, sheet['heights'].get(row, current))

    def append_sources(self, records, layout, old_count):
        """Only extend the existing seven-column Sources table, never insert rows."""
        if not records or layout.get('fields') != SOURCE_FIELDS or layout.get('columns') != 7:
            raise ValueError('Row scope changed: Sources (unsupported append layout)')
        sheet = self.sheets['Sources']
        old_end, new_end = old_count + 5, old_count + 5 + len(records)
        old_range, new_range = f'A5:G{old_end}', f'A5:G{new_end}'
        if layout.get('rows') != old_count or layout.get('range') != old_range:
            raise ValueError('Row scope changed: Sources (stale table range)')
        if not sheet['rows'] or max(map(int, sheet['rows'])) != old_end:
            raise ValueError('Refuse appending over reserved or annotated source rows')
        template = sheet['rows'][str(old_end)]
        if set(template.attrib) - {'r', 'ht', 'customHeight'} or not 0 < float(template.get('ht', '0')) <= 390:
            raise ValueError('Unsupported source template row properties')
        source_formula = f"COUNTA('Sources'!$A$6:$A${old_end})"
        target_formula = f"COUNTA('Sources'!$A$6:$A${new_end})"
        formulas = [(name, address, cell.findtext('s:f', None, NS))
                    for name, item in self.sheets.items() for address, cell in item['cells'].items()
                    if 'Sources' in (cell.findtext('s:f', None, NS) or '')]
        if formulas != [('Synthèse', 'B16', source_formula)]:
            raise ValueError('Only the native Sources count formula may be extended')
        rel_path = posixpath.join(posixpath.dirname(sheet['path']), '_rels', posixpath.basename(sheet['path']) + '.rels')
        parts = sheet['xml'].findall('s:tableParts/s:tablePart', NS)
        if len(parts) != 1 or rel_path not in self.parts:
            raise ValueError('Missing native Sources table')
        relations = {item.get('Id'): item.get('Target') for item in ET.fromstring(self.parts[rel_path])}
        target = relations.get(parts[0].get(REL + 'id'))
        if not target:
            raise ValueError('Missing native Sources table relationship')
        table_path = target.lstrip('/') if target.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(sheet['path']), target))
        table_raw = self.parts[table_path].decode('utf8')
        table = ET.fromstring(table_raw)
        filters = table.findall('s:autoFilter', NS)
        if (table.get('name') != 'Plansources' or table.get('displayName') != 'Plansources'
                or table.get('ref') != old_range or len(filters) != 1 or filters[0].get('ref') != old_range
                or len(table.findall('s:tableColumns/s:tableColumn', NS)) != 7
                or table.get('totalsRowCount', '0') != '0'):
            raise ValueError('Unsupported native Sources table')
        prefix = sheet['prefix']
        rows_xml = []
        for number, record in enumerate(records, old_end + 1):
            if any(field not in record or not isinstance(record[field], str) for field in SOURCE_FIELDS):
                raise ValueError('Source append requires every mapped source field as text')
            if not record['id'] or not record['url'].startswith('https://'):
                raise ValueError('Source append requires an ID and HTTPS URL')
            cells = []
            for column in SOURCE_FIELDS.values():
                old_cell = sheet['cells'].get(column + str(old_end))
                if old_cell is None or old_cell.find('s:f', NS) is not None:
                    raise ValueError('Unsupported source template cells')
                address = column + str(number)
                style = old_cell.get('s', '0')
                if not style.isdigit():
                    raise ValueError('Invalid source cell style')
                cells.append(f'<{prefix}c r="{address}" s="{style}" t="str"/>')
                self.added_cells.add(('Sources', address))
            attrs = {'r': str(number), 'ht': template.get('ht')}
            if template.get('customHeight') is not None:
                attrs['customHeight'] = template.get('customHeight')
            rows_xml.append('<' + prefix + 'row ' + ' '.join(f'{key}="{value}"' for key, value in attrs.items()) + '>' + ''.join(cells) + '</' + prefix + 'row>')
        closing = f'</{prefix}sheetData>'
        if sheet['raw'].count(closing) != 1:
            raise ValueError('Ambiguous source sheetData')
        raw = sheet['raw'].replace(closing, ''.join(rows_xml) + closing)
        dimension = sheet['xml'].find('s:dimension', NS)
        old_dimension = dimension.get('ref') if dimension is not None else None
        new_dimension = None
        if old_dimension is not None:
            match = re.fullmatch(r'(A[1-5]:G)' + str(old_end), old_dimension)
            if match is None:
                raise ValueError('Unsupported source dimension')
            new_dimension = match[1] + str(new_end)
            raw, count = re.subn(r'(<(?:[\w.-]+:)?dimension\b[^>]*\bref=")' + re.escape(old_dimension) + '"', lambda m: m[1] + new_dimension + '"', raw)
            if count != 1:
                raise ValueError('Ambiguous source dimension')
        sheet['raw'], sheet['xml'] = raw, ET.fromstring(raw)
        for row in sheet['xml'].findall('s:sheetData/s:row', NS):
            if int(row.get('r')) <= old_end:
                continue
            sheet['rows'][row.get('r')] = row
            for cell in row:
                sheet['cells'][cell.get('r')] = cell
                sheet['values'][cell.get('r')] = None
        table_raw, count = re.subn(r'(<(?:[\w.-]+:)?(?:table|autoFilter)\b[^>]*\bref=")' + re.escape(old_range) + '"', lambda m: m[1] + new_range + '"', table_raw)
        if count != 2:
            raise ValueError('Ambiguous source table range expansion')
        self.parts[table_path] = table_raw.encode('utf8')
        summary = self.sheets['Synthèse']
        summary['cells']['B16'].find('s:f', NS).text = target_formula
        summary['formula_writes']['B16'] = (source_formula, target_formula)
        summary['writes']['B16'] = (summary['values']['B16'], True)
        self.structure_changes.append({'kind': 'append-sources', 'sheet': 'Sources',
            'oldRows': old_count, 'newRows': new_end - 5, 'oldRange': old_range, 'newRange': new_range,
            'templateRow': old_end, 'appendedRows': list(range(old_end + 1, new_end + 1)),
            'appendedIds': [record['id'] for record in records], 'columns': list(SOURCE_FIELDS.values()),
            'tablePath': table_path, 'oldDimension': old_dimension, 'newDimension': new_dimension,
            'formula': {'sheet': 'Synthèse', 'address': 'B16', 'before': source_formula, 'after': target_formula}})
        for number, record in enumerate(records, old_end + 1):
            for field, column in SOURCE_FIELDS.items():
                self.set_value('Sources', column + str(number), record[field])

    def _shared_index(self, value, original_index):
        if any(item.tag == '{' + MAIN + '}r' for item in self.shared_items[original_index]):
            raise ValueError('Refuse replacing a rich shared string')
        try:
            return self.shared.index(value)
        except ValueError:
            self.shared.append(value)
            self.shared_new.append(value)
            return len(self.shared) - 1

    def _rewrite_cell(self, sheet, address, original, after, formula_cache):
        prefix = re.escape(sheet['prefix'])
        opening = re.match(r'<[^>]+>', original)[0]
        self_closing = opening.endswith('/>')
        body = '' if self_closing else original[len(opening):-len('</' + sheet['prefix'] + 'c>')]
        kind = sheet['cells'][address].get('t')
        if after is None or after == '':
            payload, new_kind = '', 'str'
        elif kind == 's' and isinstance(after, str) and not formula_cache:
            index = int(sheet['cells'][address].findtext('s:v', namespaces=NS))
            payload = f'<{sheet["prefix"]}v>{self._shared_index(after, index)}</{sheet["prefix"]}v>'
            new_kind = 's'
        elif kind == 'inlineStr' and isinstance(after, str) and not formula_cache:
            if sheet['cells'][address].find('s:is/s:r', NS) is not None:
                raise ValueError('Refuse replacing a rich inline string')
            payload = f'<{sheet["prefix"]}is><{sheet["prefix"]}t xml:space="preserve">{text_value(after)}</{sheet["prefix"]}t></{sheet["prefix"]}is>'
            new_kind = 'inlineStr'
        else:
            new_kind = 'str' if isinstance(after, str) else 'n'
            rendered = text_value(after) if isinstance(after, str) else json.dumps(after, allow_nan=False)
            payload = f'<{sheet["prefix"]}v>{rendered}</{sheet["prefix"]}v>'
        value_pattern = re.compile(rf'<{prefix}(?:v|is)\b[^>]*?(?:/>|>.*?</{prefix}(?:v|is)>)', re.S)
        matches = list(value_pattern.finditer(body))
        if len(matches) > 1:
            raise ValueError('Ambiguous cell payload: ' + address)
        if matches:
            match = matches[0]
            body = body[:match.start()] + payload + body[match.end():]
        else:
            # Value follows the formula, and precedes extension metadata.
            formula = re.search(rf'<{prefix}f\b[^>]*?(?:/>|>.*?</{prefix}f>)', body, re.S)
            insertion = formula.end() if formula else 0
            body = body[:insertion] + payload + body[insertion:]
        if address in sheet['formula_writes']:
            _, updated_formula = sheet['formula_writes'][address]
            body, count = re.subn(rf'(<{prefix}f\b[^>]*>).*?(</{prefix}f>)', lambda m: m[1] + text_value(updated_formula) + m[2], body, flags=re.S)
            if count != 1:
                raise ValueError('Ambiguous source count formula')
        if re.search(r'\bt=', opening):
            opening = re.sub(r'\bt=("[^"]*"|\x27[^\x27]*\x27)', f't="{new_kind}"', opening, count=1)
        else:
            opening = opening[:-2] + f' t="{new_kind}" />' if self_closing else opening[:-1] + f' t="{new_kind}">'
        if self_closing:
            opening = opening[:-2] + '>'
        return opening + body + '</' + sheet['prefix'] + 'c>'

    def write(self, destination):
        rewritten = {}
        self.layout_changes = []
        for name, sheet in self.sheets.items():
            if not sheet['writes'] and not sheet['heights']:
                continue
            raw, prefix = sheet['raw'], re.escape(sheet['prefix'])
            spans = {}
            for match in re.finditer(rf'<{prefix}c\b[^>]*?(?:/>|>.*?</{prefix}c>)', raw, re.S):
                address = re.search(r'\br="([A-Z]+[0-9]+)"', match[0])
                if address:
                    if address[1] in spans:
                        raise ValueError('Duplicate XML cell address')
                    spans[address[1]] = match
            replacements = []
            for address, (value, formula_cache) in sheet['writes'].items():
                match = spans.get(address)
                if match is None:
                    raise ValueError('Cannot find authored XML cell: ' + address)
                replacements.append((match.start(), match.end(), self._rewrite_cell(sheet, address, match[0], value, formula_cache)))
            for row, height in sheet['heights'].items():
                pattern = rf'<{prefix}row\b(?=[^>]*\br="{row}")[^>]*>'
                matches = list(re.finditer(pattern, raw))
                if len(matches) != 1 or not re.search(r'\bht="[^"]+"', matches[0][0]):
                    raise ValueError('Ambiguous row layout')
                match = matches[0]
                updated = re.sub(r'\bht="[^"]+"', f'ht="{height}"', match[0], count=1)
                replacements.append((match.start(), match.end(), updated))
                self.layout_changes.append({'sheet': name, 'row': int(row),
                                            'before': float(sheet['rows'][row].get('ht')), 'after': height,
                                            'reason': 'Wrap newly updated production text'})
            previous_start = len(raw)
            for start, end, replacement in sorted(replacements, reverse=True):
                if end > previous_start:
                    raise ValueError('Overlapping XML changes')
                raw = raw[:start] + replacement + raw[end:]
                previous_start = start
            ET.fromstring(raw)  # Refuse malformed replacement text before export.
            rewritten[sheet['path']] = raw.encode('utf-8')
        if self.shared_new:
            raw = self.parts[self.shared_path].decode('utf-8')
            prefix = re.search(r'<([A-Za-z_][\w.-]*:)?sst\b', raw).group(1) or ''
            opening = re.search(r'<(?:[A-Za-z_][\w.-]*:)?sst\b[^>]*>', raw)
            tag = opening[0]
            if re.search(r'\buniqueCount=', tag):
                tag = re.sub(r'\buniqueCount="[^"]*"', f'uniqueCount="{len(self.shared)}"', tag)
            if tag.endswith('/>'):
                raise ValueError('Shared-string source cannot be empty when referenced')
            raw = raw[:opening.start()] + tag + raw[opening.end():]
            addition = ''.join(f'<{prefix}si><{prefix}t xml:space="preserve">{text_value(value)}</{prefix}t></{prefix}si>' for value in self.shared_new)
            raw = raw.replace(f'</{prefix}sst>', addition + f'</{prefix}sst>')
            ET.fromstring(raw)
            rewritten[self.shared_path] = raw.encode('utf-8')
        with ZipFile(destination, 'w') as output:
            output.comment = self.comment
            for info in self.infos:
                output.writestr(info, rewritten.get(info.filename, self.parts[info.filename]))


class FormulaEvaluator:
    """A small closed Excel grammar; no Python eval or external references."""

    TOKEN = re.compile(r'''\s*(?:(?P<ref>(?:'(?:[^']|'')+'!)?\$?[A-Z]+\$?[0-9]+(?::\$?[A-Z]+\$?[0-9]+)?)|(?P<number>[0-9]+(?:\.[0-9]+)?)|(?P<string>"(?:[^"]|"")*")|(?P<name>[A-Za-z_][A-Za-z_0-9]*)|(?P<symbol>[(),+\-]))''')

    def __init__(self, workbook):
        self.workbook = workbook
        self.active = set()
        self.cache = {}

    def cell(self, sheet, address):
        address = address.replace('$', '')
        key = (sheet, address)
        if sheet not in self.workbook.sheets:
            raise ValueError('Unknown formula worksheet: ' + sheet)
        cell = self.workbook.sheets[sheet]['cells'].get(address)
        formula = cell.findtext('s:f', None, NS) if cell is not None else None
        if formula is None:
            return self.workbook.value(sheet, address)
        if key in self.active:
            raise ValueError('Circular formula reference')
        if key not in self.cache:
            self.active.add(key)
            try:
                self.cache[key] = self.evaluate(formula, sheet)
            finally:
                self.active.remove(key)
        return self.cache[key]

    def reference(self, value, current_sheet):
        if '!' in value:
            sheet, value = value.split('!', 1)
            sheet = sheet[1:-1].replace("''", "'")
        else:
            sheet = current_sheet
        if ':' not in value:
            return self.cell(sheet, value)
        start, end = value.replace('$', '').split(':')
        first = re.fullmatch(r'([A-Z]+)([0-9]+)', start)
        last = re.fullmatch(r'([A-Z]+)([0-9]+)', end)
        c1, r1, c2, r2 = column_number(first[1]), int(first[2]), column_number(last[1]), int(last[2])
        if c2 < c1 or r2 < r1 or (c2 - c1 + 1) * (r2 - r1 + 1) > 1_000_000:
            raise ValueError('Unsupported formula range')
        return (r2 - r1 + 1, c2 - c1 + 1, [self.cell(sheet, column_name(c) + str(r))
                for r in range(r1, r2 + 1) for c in range(c1, c2 + 1)])

    @staticmethod
    def matches(value, criterion):
        criterion = '' if criterion is None else str(criterion)
        match = re.match(r'^(<>|>=|<=|>|<|=)?(.*)$', criterion, re.S)
        operator, text = match[1] or '=', match[2]
        if operator in ('>', '<', '>=', '<='):
            try:
                number, limit = float(0 if value is None else value), float(text)
            except (TypeError, ValueError):
                raise ValueError('Only numeric relational COUNTIFS criteria are supported') from None
            return {'>': number > limit, '<': number < limit, '>=': number >= limit, '<=': number <= limit}[operator]
        # Excel comparison is case-insensitive and supports * / ? / ~ escaping.
        regex, index = '', 0
        while index < len(text):
            char = text[index]
            if char == '~' and index + 1 < len(text):
                index += 1
                regex += re.escape(text[index])
            else:
                regex += '.*' if char == '*' else '.' if char == '?' else re.escape(char)
            index += 1
        equal = re.fullmatch(regex, '' if value is None else str(value), re.I | re.S) is not None
        return not equal if operator == '<>' else equal

    def evaluate(self, formula, sheet):
        formula = formula.removeprefix('=')
        tokens, position = [], 0
        while position < len(formula):
            match = self.TOKEN.match(formula, position)
            if match is None:
                if not formula[position:].strip():
                    break
                raise ValueError('Unsupported formula syntax: ' + formula[position:position + 40])
            tokens.append((match.lastgroup, match.group(match.lastgroup)))
            position = match.end()
        cursor = 0

        def take(symbol):
            nonlocal cursor
            if cursor >= len(tokens) or tokens[cursor] != ('symbol', symbol):
                raise ValueError('Unsupported formula structure')
            cursor += 1

        def term():
            nonlocal cursor
            if cursor >= len(tokens):
                raise ValueError('Incomplete formula')
            kind, value = tokens[cursor]
            cursor += 1
            if kind == 'number':
                return float(value) if '.' in value else int(value)
            if kind == 'string':
                return value[1:-1].replace('""', '"')
            if kind == 'ref':
                return self.reference(value, sheet)
            if kind == 'symbol' and value == '(':
                result = expression()
                take(')')
                return result
            if kind != 'name' or value.upper() not in ('COUNTA', 'COUNTIFS', 'SUM'):
                raise ValueError('Unsupported formula function: ' + value)
            function = value.upper()
            take('(')
            args = [expression()]
            while cursor < len(tokens) and tokens[cursor] == ('symbol', ','):
                cursor += 1
                args.append(expression())
            take(')')
            if function in ('COUNTA', 'SUM'):
                if not all(isinstance(arg, tuple) and len(arg) == 3 for arg in args):
                    raise ValueError('COUNTA/SUM arguments must be worksheet ranges')
                values = [item for arg in args for item in arg[2]]
                return sum(item is not None for item in values) if function == 'COUNTA' else sum(item for item in values if isinstance(item, (int, float)) and not isinstance(item, bool))
            if len(args) < 2 or len(args) % 2 or not all(isinstance(arg, tuple) and len(arg) == 3 for arg in args[::2]):
                raise ValueError('Invalid COUNTIFS arguments')
            ranges, criteria = args[::2], args[1::2]
            if any(r[:2] != ranges[0][:2] for r in ranges) or any(isinstance(c, tuple) for c in criteria):
                raise ValueError('COUNTIFS ranges differ in shape or criterion is not scalar')
            return sum(all(self.matches(values[i], criterion) for (_, _, values), criterion in zip(ranges, criteria)) for i in range(len(ranges[0][2])))

        def expression():
            nonlocal cursor
            result = term()
            while cursor < len(tokens) and tokens[cursor][0] == 'symbol' and tokens[cursor][1] in ('+', '-'):
                operator = tokens[cursor][1]
                cursor += 1
                other = term()
                if not isinstance(result, (int, float)) or not isinstance(other, (int, float)):
                    raise ValueError('Formula arithmetic requires numeric values')
                result = result + other if operator == '+' else result - other
            return result

        result = expression()
        if cursor != len(tokens) or not isinstance(result, (int, float)) or not math.isfinite(result):
            raise ValueError('Unsupported or non-numeric formula result')
        return result

    def recalculate(self):
        results = []
        for name, sheet in self.workbook.sheets.items():
            for address, cell in sheet['cells'].items():
                formula = cell.findtext('s:f', None, NS)
                if formula is not None:
                    value = self.cell(name, address)
                    self.workbook.set_value(name, address, value, formula_cache=True)
                    results.append({'sheet': name, 'address': address, 'formula': formula, 'value': value})
        return results


def apply_plan(workbook, plan, previous_plan, previous_report):
    expected_sheets = ['Synthèse', *TABLES]
    if list(workbook.sheets) != expected_sheets or set(previous_report['sheets']) != set(TABLES):
        raise ValueError('Worksheet scope/order changed')
    for name, table in TABLES.items():
        layout = previous_report['sheets'][name]
        old_rows, new_rows = previous_plan[table], plan[table]
        appending_sources = name == 'Sources' and len(new_rows) > len(old_rows)
        if appending_sources:
            old_ids, new_ids = [row.get('id') for row in old_rows], [row.get('id') for row in new_rows]
            if (len(old_rows) != layout['rows'] or new_ids[:len(old_ids)] != old_ids
                    or any(not isinstance(value, str) or not value for value in new_ids)
                    or len(set(new_ids)) != len(new_ids)):
                raise ValueError('Row scope changed: Sources (only unique trailing IDs may be appended)')
            workbook.append_sources(new_rows[len(old_rows):], layout, len(old_rows))
        elif len(old_rows) != len(new_rows) or len(new_rows) != layout['rows']:
            raise ValueError('Row scope changed: ' + name)
        for index, (old, new) in enumerate(zip(old_rows, new_rows), 6):
            if old['id'] != new['id'] or workbook.value(name, 'A' + str(index)) != old['id']:
                raise ValueError('Order or IDs changed: ' + name)
            for field, column in layout['fields'].items():
                if field not in old or field not in new:
                    raise ValueError(f'Missing mapped field: {name}:{field}')
                before = workbook.value(name, column + str(index))
                baseline, after = scalar(old[field], field), scalar(new[field], field)
                annotated = field in ANNOTATED or name == 'Actions' and field == 'status'
                if normalize(baseline) == normalize(after) and annotated:
                    # Unchanged editable cells stay exactly as the user left them.
                    continue
                if annotated and normalize(before) not in (normalize(baseline), normalize(after)):
                    raise ValueError(f'Annotated field must be reconciled: {name}:{old["id"]}:{field}')
                workbook.set_value(name, column + str(index), after)
    summary = summary_text(plan['metrics'])
    if workbook.value('Synthèse', 'A32') not in (summary_text(previous_plan['metrics']), summary_text(previous_plan['metrics'], legacy=True), summary):
        raise ValueError('Annotated summary must be reconciled: Synthèse!A32')
    workbook.set_value('Synthèse', 'A32', summary)
    for address, before, after in [('A17', 'PNG candidats déjà présents', 'Profils avec PNG candidats'),
                                   ('A18', 'Clips animés déjà présents', 'Montages animés candidats')]:
        current = workbook.value('Synthèse', address)
        if current is None:  # Minimal test fixtures may omit these labels.
            continue
        if current not in (before, after):
            raise ValueError(f'Annotated summary must be reconciled: Synthèse!{address}')
        workbook.set_value('Synthèse', address, after)


def load_validator():
    spec = importlib.util.spec_from_file_location('halo_workbook_verifier', Path(__file__).with_name('verify-production-workbook.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def update_workbook(plan_path, source_path, report_path, output_path, previous_plan_path):
    plan_path, source_path, report_path, output_path, previous_plan_path = map(Path, (plan_path, source_path, report_path, output_path, previous_plan_path))
    plan_bytes, previous_bytes = plan_path.read_bytes(), previous_plan_path.read_bytes()
    plan, previous_plan, previous_report = json.loads(plan_bytes), json.loads(previous_bytes), json.loads(report_path.read_bytes())
    if hashlib.sha256(previous_bytes).hexdigest() != previous_report['planSha256']:
        raise ValueError('Previous plan does not match the existing workbook report')
    if (output_path / source_path.name).resolve() == source_path.resolve():
        raise ValueError('Output must not overwrite the source workbook')
    names = [source_path.name, 'workbook-change-log.json', 'workbook-layout-changes.json', 'workbook-structure-changes.json',
             'workbook-change-log.json.gz', 'workbook-layout-changes.json.gz',
             'workbook-structure-changes.json.gz',
             'workbook-verification.json', 'workbook-export-verification.json']
    if any((output_path / name).exists() for name in names):
        raise ValueError('Output files already exist; choose a new review directory')
    workbook = WorkbookEditor(source_path)
    apply_plan(workbook, plan, previous_plan, previous_report)
    formulas = FormulaEvaluator(workbook).recalculate()
    if len(formulas) != 80:
        raise ValueError('Summary formula scope changed')
    calculated = [workbook.value('Synthèse', 'B' + str(row)) for row in range(6, 22)]
    expected = [plan['metrics'][key] for key in ['fighters', 'stages', 'moves', 'supers', 'fighterFinishers',
                'stageFinishers', 'presentations', 'poses', 'stageAnimations', 'observations', 'sources',
                'pngCandidates', 'animatedClips', 'certifiedOneToOne']]
    expected += [sum(t['status'] != 'Validé' for t in plan['tasks']),
                 sum(t['priority'] == 'P0' and t['status'] != 'Validé' for t in plan['tasks'])]
    if calculated != expected:
        raise ValueError('Recalculated totals differ from the updated plan; reconcile annotations')
    output_path.mkdir(parents=True, exist_ok=True)
    validator = load_validator()
    with tempfile.TemporaryDirectory(prefix='.halo-workbook-', dir=output_path) as temporary:
        staging = Path(temporary)
        candidate = staging / source_path.name
        workbook.write(candidate)
        change_bytes = (json.dumps(workbook.changes, ensure_ascii=False, indent=2) + '\n').encode()
        layout_bytes = (json.dumps(workbook.layout_changes, ensure_ascii=False, indent=2) + '\n').encode()
        structure_bytes = (json.dumps(workbook.structure_changes, ensure_ascii=False, indent=2) + '\n').encode()
        for name, payload in [('workbook-change-log', change_bytes), ('workbook-layout-changes', layout_bytes), ('workbook-structure-changes', structure_bytes)]:
            (staging / (name + '.json')).write_bytes(payload)
            (staging / (name + '.json.gz')).write_bytes(gzip.compress(payload, mtime=0))
        validation = validator.verify(plan_path, candidate)
        validation['preservation'] = validator.compare_source(source_path, candidate,
            staging / 'workbook-change-log.json', staging / 'workbook-layout-changes.json', staging / 'workbook-structure-changes.json')
        (staging / 'workbook-export-verification.json').write_text(json.dumps(validation, ensure_ascii=False, indent=2) + '\n')
        report = {'schema': previous_report['schema'], 'input': plan_path.name,
                  'planSha256': hashlib.sha256(plan_bytes).hexdigest(), 'file': source_path.name,
                  'sheets': deepcopy(previous_report['sheets']), 'metrics': plan['metrics'], 'calculated': calculated,
                  'engine': 'Python stdlib OOXML narrow update; native Excel desktop not executed',
                  'operation': 'Narrow update of existing workbook',
                  'sourceSha256': hashlib.sha256(source_path.read_bytes()).hexdigest(),
                  'changedCells': len(workbook.changes),
                  'changesBySheet': dict(Counter(change['sheet'] for change in workbook.changes)),
                  'enlargedRows': len(workbook.layout_changes), 'recalculatedFormulas': formulas,
                  'changeLogSha256': hashlib.sha256(change_bytes).hexdigest(),
                  'changeLog': 'workbook-change-log.json.gz', 'layoutChangeLog': 'workbook-layout-changes.json.gz',
                  'structureChangeLog': 'workbook-structure-changes.json.gz',
                  'structureChangeLogSha256': hashlib.sha256(structure_bytes).hexdigest(),
                  'appendedSources': sum(len(change['appendedRows']) for change in workbook.structure_changes),
                  'verification': {'passed': True, 'preservation': validation['preservation']},
                  'limits': 'No visual preview, native Excel session, source timing measurement or art certification performed.'}
        if workbook.structure_changes:
            change = workbook.structure_changes[0]
            report['sheets']['Sources'].update(rows=change['newRows'], range=change['newRange'])
        (staging / 'workbook-verification.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
        for name in names:
            os.replace(staging / name, output_path / name)
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('plan', type=Path)
    parser.add_argument('existing_xlsx', type=Path)
    parser.add_argument('previous_report', type=Path)
    parser.add_argument('output_directory', type=Path)
    parser.add_argument('previous_plan', type=Path)
    args = parser.parse_args()
    report = update_workbook(args.plan, args.existing_xlsx, args.previous_report, args.output_directory, args.previous_plan)
    print(json.dumps({'file': str(args.output_directory / report['file']), 'changedCells': report['changedCells'],
                      'openActions': report['calculated'][14], 'recalculatedFormulas': len(report['recalculatedFormulas']),
                      'preservationPassed': report['verification']['preservation']['passed']}, ensure_ascii=False))


if __name__ == '__main__':
    main()
