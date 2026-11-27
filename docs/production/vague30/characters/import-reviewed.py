#!/usr/bin/env python3
"""Reproduce the three reviewed wave30 static imports with the existing importer.

No art generation, PNG editing, manifest regeneration, commits or network calls.
Requires Pillow and the baseline Git object (checkout with fetch-depth: 0).
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def git_blob(raw):
    return hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[4])
    parser.add_argument("--check", action="store_true", help="Validate the completed import without writing files.")
    args = parser.parse_args()
    root = args.root.resolve()
    folder = root / "docs/production/vague30/characters"
    plan = json.loads((folder / "import-plan.json").read_text())
    baseline_raw = subprocess.check_output(
        ["git", "show", plan["baselineCommit"] + ":art/registry.json"], cwd=root
    )
    require(git_blob(baseline_raw) == plan["baselineRegistryGitBlob"], "Baseline registry Git blob mismatch.")
    baseline = json.loads(baseline_raw)
    registry_path = root / "art/registry.json"
    before_raw = registry_path.read_bytes()
    before = json.loads(before_raw)
    importer_path = root / "scripts/import-sprite.py"
    require(git_blob(importer_path.read_bytes()) == plan["importerGitBlob"], "Importer changed; review its new contract first.")
    spec = importlib.util.spec_from_file_location("wave30_existing_importer", importer_path)
    importer = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(importer)
    require(len(plan["plans"]) == 3 and len({p["id"] for p in plan["plans"]}) == 3, "Exactly three reviewed owners are required.")
    require(len(baseline["assets"]) == 204, "Unexpected baseline owner count.")
    require({k: v for k, v in before.items() if k != "assets"} ==
            {k: v for k, v in baseline.items() if k != "assets"}, "Registry header changed.")
    require(set(before["assets"]) == set(baseline["assets"]), "No owner may be added or removed.")
    targeted = {p["id"] for p in plan["plans"]}
    for ident, asset in baseline["assets"].items():
        if ident not in targeted:
            require(before["assets"][ident] == asset, "Unrelated registry owner changed: " + ident)

    reviewed = []
    expected = copy.deepcopy(baseline)
    for p in plan["plans"]:
        old = baseline["assets"][p["id"]]
        require(old["fighterId"] == p["id"] and old["source"] == p["source"], "Wrong exact owner/source.")
        require(old["combatView"] == "side-view-candidate", "Baseline has no admitted combat base.")
        require(len(old["frames"]) == 1 and set(old["clips"]) == {"idle"} and old["animatedClips"] == 0,
                "Baseline poses changed; a new review is required.")
        require(old["frames"][0]["path"] == p["baselineIdlePath"] and old["portrait"]["path"] == p["baselinePortraitPath"],
                "Baseline portrait or idle differs from reviewed input.")
        require(p["loop"] is False and p["ticksPerFrame"] == 1 and p["singleSubjectReviewed"] is True,
                "Only one reviewed static frame per pose is authorized.")
        png = root / p["path"]
        raw = importer.read_image_snapshot(png)
        meta = importer.inspect_image(png, raw=raw)
        for key in ("sha256", "bytes", "width", "height", "visibleBounds", "transparentFraction"):
            require(meta[key] == p[key], "Reviewed PNG audit mismatch: " + p["id"] + " / " + key)
        require(git_blob(raw) == p["gitBlob"], "Stored image differs from the recovered Git blob.")
        require(p["path"] == "assets/sprites/" + p["id"] + "." + meta["sha256"][:12] + "." + meta["extension"],
                "Unexpected content-addressed image path.")
        frame = {k: meta[k] for k in ("sha256", "bytes", "width", "height", "visibleBounds", "pixelSHA256", "transparentFraction")}
        frame.update(path=p["path"], facing=p["facing"], anchor=p["anchor"], bodyHeight=p["bodyHeight"],
                     sourceFile=p["originalSourceFile"], sourceSHA256=meta["sha256"], origin=p["origin"],
                     purpose="combat", view="side-view")
        new = expected["assets"][p["id"]]
        new["frames"].append(frame)
        new["clips"][p["pose"]] = {"frames": [1], "ticksPerFrame": 1, "loop": False}
        # Existing entries already carry the same origin and zero animated clips.
        require(new["origin"] == p["origin"], "Mixed-origin append requires explicit review.")
        require(before["assets"][p["id"]] in (old, new), "Existing partial import conflicts with the reviewed pose.")
        reviewed.append((p, raw, meta, new))

    if args.check:
        require(before == expected, "Import is not complete; run this script without --check first.")
    else:
        with tempfile.TemporaryDirectory(prefix="shhf-wave30-reviewed-") as temporary:
            for p, raw, meta, new in reviewed:
                current = json.loads(registry_path.read_text())
                if current["assets"][p["id"]] == new:
                    continue
                source = Path(temporary) / p["originalSourceFile"]
                source.write_bytes(raw)
                command = [
                    sys.executable, str(importer_path), str(source), "--root", str(root),
                    "--fighter", p["id"], "--source", p["source"], "--pose", p["pose"], "--append",
                    "--single-subject-reviewed", "--origin", p["origin"], "--facing", str(p["facing"]),
                    "--anchor-x", str(p["anchor"][0]), "--anchor-y", str(p["anchor"][1]),
                    "--body-height", str(p["bodyHeight"]), "--ticks", "1",
                ]
                receipt = json.loads(subprocess.check_output(command, cwd=root, text=True))
                require(receipt["technical"] == meta and receipt["pose"] == p["pose"] and receipt["path"] == p["path"],
                        "Existing importer returned an unexpected audit.")
                require(receipt["animatedClips"] == 0 and receipt["frames"] == 2 and receipt["dryRun"] is False,
                        "Import did not remain one static pose.")
                after_step = json.loads(registry_path.read_text())
                only_expected_step = copy.deepcopy(current)
                only_expected_step["assets"][p["id"]] = new
                require(after_step == only_expected_step, "Importer changed data outside this reviewed append.")
        require(json.loads(registry_path.read_text()) == expected, "Completed registry differs from the exact authorized delta.")

    after_raw = registry_path.read_bytes()
    receipts = {
        "schemaVersion": 1, "wave": 30, "baselineCommit": plan["baselineCommit"],
        "status": "completed-and-verified", "method": "scripts/import-sprite.py; Pillow audit from original PNG bytes",
        "counts": plan["counts"], "poses": [
            {"fighterId": p["id"], "source": p["source"], "pose": p["pose"], "path": p["path"],
             "sourceFile": p["originalSourceFile"], "technical": meta, "frames": 2,
             "ticksPerFrame": 1, "loop": False, "animatedClips": 0,
             "portraitPath": p["baselinePortraitPath"], "calibration": {
                 "anchor": p["anchor"], "bodyHeight": p["bodyHeight"], "facing": p["facing"]}}
            for p, raw, meta, new in reviewed
        ],
        "limits": ["Single-frame poses only; no source timing or 1:1 fidelity certification.",
                   "Gameplay screenshots and calibration review are separate from this import audit."]
    }
    preservation = {
        "schemaVersion": 1, "passed": True, "baselineCommit": plan["baselineCommit"],
        "baselineRegistryGitBlob": git_blob(baseline_raw),
        "resultRegistryGitBlob": git_blob(after_raw),
        "baselineSHA256": hashlib.sha256(baseline_raw).hexdigest(),
        "beforeRunSHA256": hashlib.sha256(before_raw).hexdigest(),
        "resultSHA256": hashlib.sha256(after_raw).hexdigest(),
        "ownerCountBefore": 204, "ownerCountAfter": len(expected["assets"]),
        "unchangedOtherOwners": len(baseline["assets"]) - len(targeted),
        "preserved": ["All prior frames and clips", "All portraits and their provenance",
                      "All pre-existing owner metadata", "All other registry entries", "Registry schema and policy"],
        "delta": plan["counts"], "newClipContract": {"frames": [1], "ticksPerFrame": 1, "loop": False},
        "verification": "Full parsed-registry equality with baseline plus the three audited appends."
    }
    if not args.check:
        for name, value in (("import-receipts.json", receipts), ("registry-preservation.json", preservation)):
            importer.atomic_write(folder / name, (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode())
    print(json.dumps({"passed": True, "checkOnly": args.check, "registryGitBlob": git_blob(after_raw),
                      "importedStaticPoses": 3, "animatedClipsAdded": 0}, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, KeyError, RuntimeError, subprocess.CalledProcessError) as error:
        print("Wave30 reviewed import failed: " + str(error), file=sys.stderr)
        sys.exit(1)
