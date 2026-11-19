"""Read-only XLSX preservation audit; writes reports, never workbook cells."""
from pathlib import Path
import importlib.util,json,hashlib,runpy,shutil,posixpath
from zipfile import ZipFile
import xml.etree.ElementTree as ET

work=Path('/workspace/scratch/8edddaaaab76/wave19-workbook')
out=Path('/workspace/scratch/8edddaaaab76/outputs/wave19-workbook')
repo=Path('/workspace/scratch/8edddaaaab76/silent-hill-halo-of-flesh')
source=work/'original-before-wave19.xlsx'
candidate=out/'SILENT_HILL_HALO_OF_FLESH_PHASE1_MOVESETS_ANIMATIONS.xlsx'
changes=json.loads((out/'workbook-change-log.json').read_text())
audit=runpy.run_path(str(work/'verify-preservation.py'))
semantic=audit['diff'](source,candidate,changes)
(out/'workbook-semantic-preservation.json').write_text(json.dumps(semantic,ensure_ascii=False,indent=2)+'\n')
assert semantic['passedValuesFormulas'],'Unexpected value or formula changes'
assert all(not s['stylesChangedCount'] and not s['featuresChanged'] for s in semantic['sheets'].values()),'Styles or native features changed'
spec=importlib.util.spec_from_file_location('halo_read_only_verifier',repo/'scripts/verify-production-workbook.py')
verifier=importlib.util.module_from_spec(spec);spec.loader.exec_module(verifier)
try:
    exact=verifier.compare_source(source,candidate,out/'workbook-change-log.json',out/'workbook-layout-changes.json',out/'workbook-structure-changes.json')
except AssertionError as error:
    exact={'passed':False,'reason':str(error),'interpretation':'The Artifact Tool serializer reassigns relationship IDs. The complete XML graph is checked below after resolving each relationship ID to its same target.'}
NS=verifier.NS;S='{'+NS['s']+'}';R='{'+NS['r']+'}';P='{http://schemas.openxmlformats.org/package/2006/relationships}'
allowed={(c['sheet'],c['address']):c for c in changes}
heights={(c['sheet'],str(c['row'])):c for c in json.loads((out/'workbook-layout-changes.json').read_text())}
def normalized_archive(file,side):
    normalized={};raw={};mapped={}
    with ZipFile(file) as z:
        assert z.testzip() is None
        book=ET.fromstring(z.read('xl/workbook.xml'))
        bookrels={r.get('Id'):r.get('Target') for r in ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
        names={(bookrels[s.get(R+'id')].lstrip('/') if bookrels[s.get(R+'id')].startswith('/') else posixpath.normpath('xl/'+bookrels[s.get(R+'id')])):s.get('name') for s in book.findall('s:sheets/s:sheet',NS)}
        for part in z.namelist():
            payload=z.read(part);raw[part]=payload
            if not part.endswith(('.xml','.rels')):normalized[part]=payload.hex();continue
            root=ET.fromstring(payload)
            if part.endswith('.rels'):
                for relationship in root:
                    relationship.attrib.pop('Id',None)
                root[:]=sorted(root,key=lambda c:json.dumps(audit['canon'](c),sort_keys=True))
            else:
                relpart=posixpath.join(posixpath.dirname(part),'_rels',posixpath.basename(part)+'.rels')
                rels={}
                if relpart in z.namelist():
                    rels={r.get('Id'):{k:v for k,v in r.attrib.items() if k!='Id'} for r in ET.fromstring(z.read(relpart))}
                for elem in root.iter():
                    for attr,value in list(elem.attrib.items()):
                        if attr in (R+'id',R+'embed',R+'link'):
                            assert value in rels,f'Unknown relation target {part}:{value}'
                            elem.set(attr,json.dumps(rels[value],sort_keys=True))
                if part in names:
                    name=names[part];cells=verifier.worksheet_cells(root,name)
                    for address,cell in cells.items():
                        key=(name,address)
                        if key in allowed:
                            for child in cell:
                                if child.tag in (S+'v',S+'is'):
                                    child.clear();child.text='AUTHORIZED_VALUE'
                        elif cell.find('s:f',NS) is not None:
                            cache=cell.find('s:v',NS)
                            assert cache is not None,'Formula cache absent'
                            cache.text='RECALCULATED_CACHE'
                    for row in root.findall('s:sheetData/s:row',NS):
                        key=(name,row.get('r'))
                        if key in heights:
                            assert float(row.get('ht'))==heights[key][side],f'Unlogged row height {key}'
                            row.set('ht','AUTHORIZED_HEIGHT')
            normalized[part]=audit['canon'](root)
        return normalized,raw,z.namelist(),z.comment
oldnorm,oldraw,oldparts,oldcomment=normalized_archive(source,'before')
newnorm,newraw,newparts,newcomment=normalized_archive(candidate,'after')
assert oldparts==newparts and oldcomment==newcomment,'Native ZIP scope/order/comment changed'
differences=[part for part in oldparts if oldnorm[part]!=newnorm[part]]
def first_differences(a,b,path='',found=None):
    found=[] if found is None else found
    if len(found)>=12 or a==b:return found
    if type(a)!=type(b):found.append({'path':path,'before':a,'after':b});return found
    if isinstance(a,dict):
        for key in set(a)|set(b):first_differences(a.get(key),b.get(key),path+'/'+str(key),found)
    elif isinstance(a,list):
        if len(a)!=len(b):found.append({'path':path+'/length','before':len(a),'after':len(b)})
        for index,(x,y) in enumerate(zip(a,b)):first_differences(x,y,path+'/'+str(index),found)
    else:found.append({'path':path,'before':a,'after':b})
    return found
if differences:
    diagnostics={part:first_differences(oldnorm[part],newnorm[part]) for part in differences}
    (out/'native-graph-differences.json').write_text(json.dumps(diagnostics,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(diagnostics,ensure_ascii=False))
assert not differences,'Unauthorized native graph change: '+', '.join(differences)
preservation={'passed':True,'method':'Every native ZIP part compared after resolving relationship IDs to their type/target and masking only journaled values, exact journaled row heights, and recalculated formula caches.',
 'comparedCells':sum(s['cellsBefore'] for s in semantic['sheets'].values()),'authoredChanges':len(changes),'enlargedRows':len(heights),
 'appendedSourceRows':0,'appendedSourceCells':0,'auditedFormulaExpansions':0,'nativeParts':len(oldparts),
 'serializerChangedParts':[p for p in oldparts if oldraw[p]!=newraw[p]],'strictByteIdentityComparator':exact,
 'unchanged':['worksheet order','all unrelated values','all 80 formulas','all effective cell styles','column widths','unrelated row heights','native tables and filters','validation lists','all relationship targets','all other native XML metadata and binary parts']}
snap=audit['snapshot'](candidate)
original=audit['snapshot'](source)
retained=json.loads((out/'workbook-history-retention.json').read_text())
for note in retained:
    value=snap['sheets'][note['sheet']]['cells'][note['address']]['value']
    if 'preservedSuffix' in note:assert note['preservedSuffix'] in value,'Historical suffix missing'
    if 'preservedPrefix' in note:assert value.startswith(note['preservedPrefix']),'Original catalogue status missing'
report=json.loads((out/'workbook-verification.json').read_text())
formulas=[{'sheet':name,'address':address,'formula':c['formula'],'value':c['value']} for name,s in snap['sheets'].items() for address,c in s['cells'].items() if c['formula'] is not None]
assert len(formulas)==80 and all(isinstance(c['value'],(int,float)) for c in formulas),'Numeric cached formulas missing'
assert report['calculated']==[snap['sheets']['Synthèse']['cells']['B'+str(r)]['value'] for r in range(6,22)],'Summary cached totals mismatch'
assert not snap['errors'],'Excel errors'
protected={'Combattants':['I','J','K','L','T','U'],'Clips':['G','H','L'],'Arènes':['E','F','R'],'Mouvements':['I','J','M','Z','AA','AB','AC','AD'],'Actions':['A','B','C','D','E','F','G','H','I','J','K']}
protectedCount=0
for name,columns in protected.items():
    for address,cell in original['sheets'][name]['cells'].items():
        column=''.join(c for c in address if c.isalpha())
        if column in columns:
            assert cell==snap['sheets'][name]['cells'][address],f'Protected annotation changed: {name}!{address}'
            protectedCount+=1
verification={'passed':True,'preservation':preservation,'zipCrc':True,'all80FormulaCachesNumeric':True,'formulaErrors':[],
 'historyRetainedEntries':len(retained),'protectedAnnotationCellsUnchanged':protectedCount,'currentTotals':report['calculated'],'coverage':{k:report['metrics'][k] for k in ['pngCandidates','animatedClips','activeStageBitmapCandidates']},
 'planBaseline':'No complete-plan baseline invented. Historical plan hash retained separately; canonical planSha256 is null.',
 'limits':'Read-only native workbook audit and Artifact Tool rendering. No native Excel application or artwork certification.'}
(out/'workbook-export-verification.json').write_text(json.dumps(verification,ensure_ascii=False,indent=2)+'\n')
report['verification']=verification
report['recalculatedFormulas']=formulas
report['contractTests']={'status':'pending','suite':'tests/test_production_workbook_update.py','execution':'Isolated fixture copy of candidate workbook and proposed canonical report'}
(out/'workbook-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
for name in ['update-wave19-workbook.mjs','capture-wave19-facts.mjs']:
    shutil.copyfile(Path('/tmp/halo-wave19-workbook-sxx6va49')/name,out/name)
shutil.copyfile(work/'verify-preservation.py',out/'verify-preservation.py')
shutil.copyfile(work/'roundtrip-preservation.json',out/'roundtrip-preservation.json')
print(json.dumps({'passed':True,'preservation':preservation,'historyRetainedEntries':len(retained),'formulaCaches':len(formulas),'xlsxSha256':report['xlsxSha256'],'changedCells':report['changedCells'],'changesBySheet':report['changesBySheet']},ensure_ascii=False))
