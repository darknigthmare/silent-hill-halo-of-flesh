#!/usr/bin/env python3
"""Import or check four reviewed static poses with the existing project importer.
Original PNG bytes are preserved. No image transformations or shared generators.
"""
from pathlib import Path
import argparse, copy, hashlib, importlib.util, json, subprocess, sys
ROOT = Path(__file__).resolve().parents[4]
FOLDER = ROOT / "docs/production/vague32/characters"
def require(condition, message):
    if not condition: raise RuntimeError(message)
def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    plan = json.loads((FOLDER / "import-plan.json").read_text())
    baseline_raw = subprocess.check_output(["git","show",plan["baselineCommit"]+":art/registry.json"],cwd=ROOT)
    baseline = json.loads(baseline_raw)
    path = ROOT / "art/registry.json"
    before_raw = path.read_bytes()
    before = json.loads(before_raw)
    targets = {p["id"] for p in plan["plans"]}
    require(set(before["assets"]) == set(baseline["assets"]), "Registry owner set changed.")
    for ident, asset in baseline["assets"].items():
        if ident not in targets: require(before["assets"][ident] == asset, "Unrelated owner changed: "+ident)
    spec = importlib.util.spec_from_file_location("wave32_importer", ROOT/"scripts/import-sprite.py")
    importer = importlib.util.module_from_spec(spec); spec.loader.exec_module(importer)
    receipts = []
    for p in plan["plans"]:
        current = json.loads(path.read_text())
        owner = current["assets"][p["id"]]
        base = baseline["assets"][p["id"]]
        require(owner["source"] == p["source"] and owner["fighterId"] == p["id"], "Wrong owner/source.")
        require(owner["frames"][:len(base["frames"])] == base["frames"], "Prior frames changed.")
        require(all(owner["clips"].get(k) == v for k,v in base["clips"].items()), "Prior clips changed.")
        expected_clip = {"frames":[p["frameIndex"]],"ticksPerFrame":1,"loop":False}
        source = ROOT / p["path"]
        if p["pose"] not in owner["clips"]:
            require(not args.check, "Missing pose: "+p["pose"])
            source = Path(plan["generatedDirectory"]) / p["originalSourceFile"]
            if not source.exists(): source = ROOT / p["path"]
            require(hashlib.sha256(source.read_bytes()).hexdigest() == p["sha256"], "Source bytes mismatch.")
            require(len(owner["frames"]) == p["frameIndex"], "Unexpected next index.")
            command = [sys.executable,str(ROOT/"scripts/import-sprite.py"),str(source),"--root",str(ROOT),
                "--fighter",p["id"],"--source",p["source"],"--pose",p["pose"],"--append",
                "--single-subject-reviewed","--origin",p["origin"],"--facing","1",
                "--anchor-x",str(p["anchor"][0]),"--anchor-y",str(p["anchor"][1]),
                "--body-height",str(p["bodyHeight"]),"--ticks","1"]
            receipt = json.loads(subprocess.check_output(command,cwd=ROOT,text=True))
            require(receipt["path"] == p["path"] and receipt["animatedClips"] == 0, "Unexpected import.")
            owner = json.loads(path.read_text())["assets"][p["id"]]
        source = ROOT/p["path"]
        meta = importer.inspect_image(source)
        require(meta["sha256"] == p["sha256"], "Imported bytes mismatch.")
        require(owner["clips"][p["pose"]] == expected_clip, "Clip is not one static pose.")
        frame = owner["frames"][p["frameIndex"]]
        require(frame["path"] == p["path"] and frame["anchor"] == p["anchor"] and frame["bodyHeight"] == p["bodyHeight"], "Unexpected calibration.")
        for k in ("sha256","bytes","width","height","visibleBounds","pixelSHA256","transparentFraction"):
            require(frame[k] == meta[k], "PNG metadata differs: "+k)
        require(frame["facing"] == 1 and frame["origin"] == p["origin"], "Wrong presentation/origin.")
        receipts.append({"id":p["id"],"source":p["source"],"pose":p["pose"],"frameIndex":p["frameIndex"],
            "path":p["path"],"originalSourceFile":p["originalSourceFile"],"technical":meta,
            "anchor":p["anchor"],"bodyHeight":p["bodyHeight"],"facing":1,"ticksPerFrame":1,"loop":False,
            "animatedClips":0,"fidelity":"unverified"})
    final_raw = path.read_bytes(); final = json.loads(final_raw)
    require(set(final["assets"]) == set(baseline["assets"]), "Unexpected owner changes.")
    for ident, old in baseline["assets"].items():
        new = final["assets"][ident]
        if ident not in targets: require(new == old, "Unrelated owner changed: "+ident); continue
        planned = [p for p in plan["plans"] if p["id"] == ident]
        require(len(new["frames"]) == len(old["frames"])+len(planned), "Unexpected frame count.")
        require(new["frames"][:len(old["frames"])] == old["frames"], "Historical frame changed.")
        require(set(new["clips"]) == set(old["clips"]) | {p["pose"] for p in planned}, "Unexpected clip set.")
        require(all(new["clips"][k] == v for k,v in old["clips"].items()), "Historical clip changed.")
        require({k:v for k,v in new.items() if k not in ("frames","clips")} ==
                {k:v for k,v in old.items() if k not in ("frames","clips")}, "Owner metadata/portrait changed.")
        require(new["animatedClips"] == 0 and new["fidelity"] == "unverified", "False animation/fidelity status.")
    if not args.check:
        (FOLDER/"import-receipts.json").write_text(json.dumps({"schemaVersion":1,"wave":32,"status":"passed",
            "method":"scripts/import-sprite.py with original PNG bytes","counts":plan["counts"],"poses":receipts},ensure_ascii=False,indent=2)+"\n")
        (FOLDER/"registry-preservation.json").write_text(json.dumps({"schemaVersion":1,"wave":32,"passed":True,
            "baselineCommit":plan["baselineCommit"],"baselineSHA256":hashlib.sha256(baseline_raw).hexdigest(),
            "beforeRunSHA256":hashlib.sha256(before_raw).hexdigest(),"resultSHA256":hashlib.sha256(final_raw).hexdigest(),
            "ownerCountBefore":len(baseline["assets"]),"ownerCountAfter":len(final["assets"]),
            "unchangedOtherOwners":len(baseline["assets"])-len(targets),"targetedOwners":sorted(targets),
            "preserved":["All historical frames and clips","All portraits and provenance","All owner metadata","All other owners"],
            "newStaticPoses":4,"newAnimatedClips":0,"certifiedOneToOne":False},ensure_ascii=False,indent=2)+"\n")
    print(json.dumps({"passed":True,"checkOnly":args.check,"counts":plan["counts"],"poses":[{k:p[k] for k in ("id","pose","frameIndex","path")} for p in plan["plans"]]},indent=2))
if __name__=="__main__": main()
