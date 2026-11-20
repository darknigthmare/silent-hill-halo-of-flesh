"""Rebuild the aggregate from twelve already executed, successful native cases.

No rendering or tests are rerun. Child reports, executed harnesses, capture bytes,
current production source/asset hashes and process observations must agree.
"""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json

QA = Path(__file__).resolve().parent
REPO = QA.parents[3]
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
read = lambda p: json.loads(Path(p).read_text())
integration_path = REPO / 'docs/production/vague21/integration.json'
ids = [s['stageId'] for s in read(integration_path)['stages']]
assert len(ids) == len(set(ids)) == 12
variants = {
 sha(QA/'qa-stage-pass21-native-128.executed.mjs'): {
  'file':'qa-stage-pass21-native-128.executed.mjs',
  'nodeExecArgv':['--max-old-space-size=128'],
  'changes':'Diagnostic RSS logs only; original engine logic, assertions and native decoder unchanged.',
  'stageIds':[]},
 sha(QA/'qa-stage-pass21-native-shepherd-gc.executed.mjs'): {
  'file':'qa-stage-pass21-native-shepherd-gc.executed.mjs',
  'nodeExecArgv':['--expose-gc','--max-old-space-size=64','--max-semi-space-size=1'],
  'changes':'Explicit garbage collection after Sharp decoding and before native preflight, plus finer RSS logs; engine logic, assertions and actor state unchanged.',
  'stageIds':[]}
}
checks, cases, captures, processes = [], [], [], []
assets, sources = {}, {}
method, limits, dependencies, version = None, [], None, None
for stage_id in ids:
 case_dir = QA/'cases'/stage_id
 case_path = case_dir/'report.json'
 one = read(case_path)
 process = read(case_dir/'process-observation.json')
 assert one['passed'] is True and not one['errors']
 assert one['stageIds'] == [stage_id] and len(one['cases']) == len(one['captures']) == 1
 assert one['browserTest'] is one['httpTest'] is one['actorStateInjected'] is False
 assert one['checks'] and all(c['passed'] for c in one['checks'])
 assert process['passed'] and process['exitCode'] == 0 and process['signal'] is None
 assert process['reportSHA256'] == sha(case_path)
 assert one['harnessSHA256'] == process['harnessSHA256']
 assert one['harnessSHA256'] in variants
 variant = variants[one['harnessSHA256']]
 assert process['nodeExecArgv'] == variant['nodeExecArgv']
 variant['stageIds'].append(stage_id)
 if stage_id == 'shepherds_glen':
  assert one['memoryPolicy']['explicitGcAfterSharpDecodeBeforeNativePreflight']
  assert one['memoryPolicy']['nodeExecArgv'] == process['nodeExecArgv']
 if method is not None: assert method == one['method']
 method = one['method']
 if dependencies is not None: assert dependencies == one['dependencies']
 dependencies = one['dependencies']
 if version is not None: assert version == one['version']
 version = one['version']
 limits = list(dict.fromkeys(limits + one['limits']))
 for path, hashes in one['sourceHashes'].items():
  assert hashes['before'] == hashes['after'] == sha(REPO/path)
  if path in sources: assert sources[path]['before'] == hashes['before']
  sources.setdefault(path, {'before':hashes['before'],'after':hashes['after'],'verifiedCases':[]})['verifiedCases'].append(stage_id)
 for asset in one['assets']:
  p = REPO/asset['path']
  assert sha(p) == asset['sha256'] and p.stat().st_size == asset['bytes']
  if asset['path'] in assets: assert assets[asset['path']] == asset
  assets[asset['path']] = asset
 capture = one['captures'][0]
 assert capture['stageId'] == stage_id and capture['file'] == stage_id+'.png'
 assert sha(case_dir/capture['file']) == sha(QA/capture['file']) == capture['sha256']
 assert (QA/capture['file']).stat().st_size == capture['bytes']
 captures.append({**capture,'caseFile':'cases/'+stage_id+'/'+capture['file'],'transfer':'hardlink; byte-identical SHA256 verified'})
 checks.extend({**c,'processStageId':stage_id,'report':'cases/'+stage_id+'/report.json'} for c in one['checks'])
 cases.extend({**c,'report':'cases/'+stage_id+'/report.json','harnessSHA256':one['harnessSHA256']} for c in one['cases'])
 log_file = QA/process.get('combinedLog',process.get('stderr',''))
 samples=[]
 for line in log_file.read_text().splitlines():
  try: value=json.loads(line)
  except json.JSONDecodeError: continue
  if 'diagnostic' in value and 'rssBytes' in value:samples.append(value)
 assert samples
 process['memoryObservations']={'maximumSampledRSSBytes':max(s['rssBytes'] for s in samples),'lastDiagnostic':samples[-1],'sampleCount':len(samples),'logSHA256':sha(log_file),'note':'Maximum of logged RSS samples, not a certified continuous peak.'}
 processes.append(process)

assert len(cases) == len(captures) == len(processes) == 12
assert len(checks) == sum(read(QA/'cases'/i/'report.json')['checks'].__len__() for i in ids)
history = read(QA/'attempt-history.json')
assert history['passed'] is False
assert history['subsequentSingleProcessAttempt']['passed'] is False
assert history['sequentialFinalCaseInterruption']['passed'] is False
report = {
 'schema':1,'label':'stage-pass21-native-consolidated','generatedAt':datetime.now(timezone.utc).isoformat(),
 'completedAt':max(p['completedAt'] for p in processes),'root':str(REPO),'stageIds':ids,
 'status':'passed','passed':True,'browserTest':False,'httpTest':False,'actorStateInjected':False,
 'version':version,'dependencies':dependencies,
 'executionMode':'Eleven successful sequential128MiB cases retained; only Shepherds Glen rerun once in an authorized isolated64MiB/GC diagnostic case. This aggregation does not rerun rendering or count interrupted attempts as successes.',
 'method':method,'limits':limits,
 'harnessVariants':[{'sha256':h,**v} for h,v in variants.items()],
 'orchestrator':{'file':'scripts/qa-stage-pass21-batched-native.mjs','sha256':sha(REPO/'scripts/qa-stage-pass21-batched-native.mjs')},
 'aggregation':{'file':'aggregate-successful-cases.py','sha256':sha(__file__),'noTestsRerun':True},
 'integration':{'path':str(integration_path),'sha256':sha(integration_path)},
 'initialAttempt':history,
 'priorAttemptNote':'Grouped exit137, initial single-process SIGKILL and Shepherds Glen128MiB SIGKILL remain failed/interrupted and archived separately. The successful isolated Old Silent Hill diagnostic is also excluded from the twelve selected cases and assertion totals.',
 'causalityLimit':'Heap limits, GC policy, tool attachment interval and concurrent workload changed across attempts. The prior SIGKILL cause is not isolated to a single variable.',
 'checks':checks,'errors':[],'assets':list(assets.values()),'cases':cases,'captures':captures,'sourceHashes':sources,'processes':processes,
 'counts':{'requestedStages':12,'selectedSuccessfulProcesses':12,'stageCases':12,'captures':12,'checkExecutions':len(checks),'passedChecks':len(checks),'failedChecks':0,'uniqueAssets':len(assets),'sourceFiles':len(sources),'archivedInterruptedAttempts':3},
 'checkCountNote':'Actual assertion executions from the twelve selected successful child reports, including repeated common assertions; not a count of unique assertions. No assertion totals are inferred from interrupted cases.'
}
(QA/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':report['status'],'counts':report['counts'],'reportSHA256':sha(QA/'report.json'),'harnessVariants':[{'sha256':h,'stageCount':len(v['stageIds'])} for h,v in variants.items()]},indent=2))
