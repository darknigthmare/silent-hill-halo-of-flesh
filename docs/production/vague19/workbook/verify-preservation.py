"""Read-only semantic audit of an Artifact Tool XLSX round trip or narrow edit."""
from pathlib import Path
from zipfile import ZipFile
from functools import lru_cache
import hashlib, json, posixpath, re, sys
import xml.etree.ElementTree as ET

NS={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
S='{'+NS['s']+'}'

def canon(node):
    if node is None:return None
    return [node.tag,dict(sorted(node.attrib.items())),node.text or '',[canon(c) for c in node]]

def snapshot(file):
    result={'sheets':{},'parts':[],'errors':[]}
    with ZipFile(file) as z:
        assert z.testzip() is None,'ZIP CRC failed'
        result['parts']=z.namelist()
        strings=[''.join(x.itertext()) for x in ET.fromstring(z.read('xl/sharedStrings.xml'))] if 'xl/sharedStrings.xml' in z.namelist() else []
        styles=ET.fromstring(z.read('xl/styles.xml'))
        xfs=list(styles.find('s:cellXfs',NS))
        fonts,fills,borders=[list(styles.find('s:'+tag,NS)) for tag in ['fonts','fills','borders']]
        fmts={x.get('numFmtId'):x.get('formatCode') for x in styles.findall('s:numFmts/s:numFmt',NS)}
        @lru_cache(None)
        def style(index):
            xf=xfs[int(index or 0)]
            refs={'fontId','fillId','borderId','numFmtId'}
            return {'xf':{k:v for k,v in xf.attrib.items() if k not in refs},'children':[canon(c) for c in xf],
                    'font':canon(fonts[int(xf.get('fontId','0'))]),'fill':canon(fills[int(xf.get('fillId','0'))]),
                    'border':canon(borders[int(xf.get('borderId','0'))]),'format':fmts.get(xf.get('numFmtId'),xf.get('numFmtId'))}
        book=ET.fromstring(z.read('xl/workbook.xml'))
        result['definedNames']=canon(book.find('s:definedNames',NS))
        rels={r.get('Id'):r.get('Target') for r in ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
        for item in book.findall('s:sheets/s:sheet',NS):
            name=item.get('name');target=rels[item.get('{'+NS['r']+'}id')]
            location=target.lstrip('/') if target.startswith('/') else posixpath.normpath('xl/'+target)
            xml=ET.fromstring(z.read(location));cells={};rows={}
            for row in xml.findall('s:sheetData/s:row',NS):
                rows[row.get('r')]={k:v for k,v in row.attrib.items() if k!='r'}
                for c in row.findall('s:c',NS):
                    a=c.get('r');assert a not in cells,f'Duplicate address {name}!{a}'
                    raw=c.findtext('s:v',None,NS)
                    if c.get('t')=='s':v=strings[int(raw)]
                    elif c.get('t')=='inlineStr':v=''.join(c.find('s:is',NS).itertext())
                    elif raw is None:v=None
                    elif c.get('t') in ('str','e'):v=raw
                    else:
                        try:v=float(raw)
                        except ValueError:v=raw
                    if c.get('t')=='e':result['errors'].append([name,a,v])
                    cells[a]={'value':v,'formula':c.findtext('s:f',None,NS),'style':style(c.get('s'))}
            features={tag:[canon(e) for e in xml.findall('s:'+tag,NS)] for tag in ['cols','sheetFormatPr','mergeCells','dataValidations','conditionalFormatting','sheetProtection','autoFilter','drawing','legacyDrawing','hyperlinks','pageMargins','pageSetup','printOptions']}
            features['pane']=canon(xml.find('s:sheetViews/s:sheetView/s:pane',NS))
            features['dimension']=canon(xml.find('s:dimension',NS))
            tableparts=xml.findall('s:tableParts/s:tablePart',NS);tables=[]
            if tableparts:
                relpath=posixpath.join(posixpath.dirname(location),'_rels',posixpath.basename(location)+'.rels')
                tablerels={r.get('Id'):r.get('Target') for r in ET.fromstring(z.read(relpath))}
                for part in tableparts:
                    t=tablerels[part.get('{'+NS['r']+'}id')]
                    t=t.lstrip('/') if t.startswith('/') else posixpath.normpath(posixpath.join(posixpath.dirname(location),t))
                    tables.append(canon(ET.fromstring(z.read(t))))
            features['tables']=tables
            result['sheets'][name]={'cells':cells,'features':features,'rows':rows}
    return result

def diff(source,target,allowed=None):
    before,after=snapshot(source),snapshot(target)
    allowed={(c['sheet'],c['address']):c for c in (allowed or [])}
    report={'source':str(source),'target':str(target),'sourceSha256':hashlib.sha256(Path(source).read_bytes()).hexdigest(),
      'targetSha256':hashlib.sha256(Path(target).read_bytes()).hexdigest(),'sheetOrderPreserved':list(before['sheets'])==list(after['sheets']),
      'definedNamesPreserved':before['definedNames']==after['definedNames'],'removedParts':sorted(set(before['parts'])-set(after['parts'])),
      'addedParts':sorted(set(after['parts'])-set(before['parts'])),'errors':after['errors'],'sheets':{}}
    for name,a in before['sheets'].items():
        b=after['sheets'][name];changes=[];formulas=[];styles=[];added=[];removed=[]
        for addr in set(a['cells'])|set(b['cells']):
            ca=a['cells'].get(addr);cb=b['cells'].get(addr)
            if ca is None:added.append(addr);continue
            if cb is None:removed.append(addr);continue
            if ca['value']!=cb['value']:
                expected=allowed.get((name,addr));changes.append({'address':addr,'before':ca['value'],'after':cb['value'],'expected':bool(expected and expected['before']==ca['value'] and expected['after']==cb['value']),'formulaCache':bool(ca['formula'])})
            if ca['formula']!=cb['formula']:formulas.append({'address':addr,'before':ca['formula'],'after':cb['formula']})
            if ca['style']!=cb['style']:styles.append({'address':addr,'before':ca['style'],'after':cb['style']})
        feat={k:{'before':v,'after':b['features'][k]} for k,v in a['features'].items() if v!=b['features'][k]}
        rowdiff=[{'row':r,'before':a['rows'].get(r),'after':b['rows'].get(r)} for r in set(a['rows'])|set(b['rows']) if a['rows'].get(r)!=b['rows'].get(r)]
        report['sheets'][name]={'cellsBefore':len(a['cells']),'cellsAfter':len(b['cells']),'formulasBefore':sum(c['formula'] is not None for c in a['cells'].values()),'formulasAfter':sum(c['formula'] is not None for c in b['cells'].values()),'addedCells':added,'removedCells':removed,'valuesChanged':changes,'formulasChanged':formulas,'stylesChangedCount':len(styles),'styleExamples':styles[:2],'featuresChanged':feat,'rowChangesCount':len(rowdiff),'rowExamples':rowdiff[:2]}
    report['passedValuesFormulas']=report['sheetOrderPreserved'] and not report['errors'] and all(not s['addedCells'] and not s['removedCells'] and not s['formulasChanged'] and all(c['expected'] or c['formulaCache'] for c in s['valuesChanged']) for s in report['sheets'].values())
    return report

if __name__=='__main__':
    src,dst,out=sys.argv[1:4];changes=json.loads(Path(sys.argv[4]).read_text()) if len(sys.argv)>4 else None
    report=diff(src,dst,changes);Path(out).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'report':out,'passedValuesFormulas':report['passedValuesFormulas'],'errors':len(report['errors']),'removedParts':report['removedParts'],'addedParts':report['addedParts'],'sheets':{n:{k:v for k,v in s.items() if k in ['cellsBefore','cellsAfter','formulasBefore','formulasAfter','stylesChangedCount','rowChangesCount']}|{'valueChanges':len(s['valuesChanged']),'formulaChanges':len(s['formulasChanged']),'featuresChanged':list(s['featuresChanged'])} for n,s in report['sheets'].items()}},ensure_ascii=False))
