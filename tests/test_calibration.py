import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from PIL import Image, ImageDraw

BASE = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('calibration', BASE / 'scripts/apply-sprite-calibration.py')
calibration = importlib.util.module_from_spec(spec)
spec.loader.exec_module(calibration)

class CalibrationTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        (self.root / 'art').mkdir()
        (self.root / 'assets/sprites').mkdir(parents=True)
        im = Image.new('RGBA', (256, 128))
        ImageDraw.Draw(im).ellipse((40, 15, 200, 112), fill=(190, 110, 80, 255))
        import io
        b = io.BytesIO(); im.save(b, 'PNG'); raw = b.getvalue()
        self.sha = hashlib.sha256(raw).hexdigest()
        self.image = 'assets/sprites/test.'+self.sha[:12]+'.png'
        (self.root / self.image).write_bytes(raw)
        frame = dict(path=self.image, sha256=self.sha, anchor=[.5,.9], bodyHeight=.8, facing=1)
        self.original = {'schema':1, 'assets': {'test': {'fighterId':'test', 'source':'sh2', 'origin':'artist-created', 'fidelity':'unverified', 'frames':[frame], 'portrait':dict(frame)}}}
        self.path = self.root / 'art/registry.json'
        self.path.write_text(json.dumps(self.original))
        self.packet = dict(previousFrames=[copy.deepcopy(frame)], schema=2, kind='halo-sprite-calibration', fighterId='test', source='sh2', frames=[dict(frame, anchor=[.6,.91], facing=-1)])
    def tearDown(self): self.tmp.cleanup()
    def apply(self, packet=None, apply=True): return calibration.apply_packet(self.root, packet or self.packet, apply)
    def test_dry_run_preserves_registry(self):
        before=self.path.read_bytes();self.assertFalse(self.apply(apply=False)['applied']);self.assertEqual(self.path.read_bytes(),before)
    def test_applies_exact_frame_and_portrait_direction(self):
        raw=(self.root/self.image).read_bytes();self.apply();art=json.loads(self.path.read_text())['assets']['test']
        self.assertEqual(art['frames'][0]['anchor'],[.6,.91]);self.assertEqual(art['portrait']['facing'],-1);self.assertEqual(art['origin'],'artist-created');self.assertEqual(art['fidelity'],'unverified');self.assertEqual((self.root/self.image).read_bytes(),raw)
    def test_stale_frame_fails_without_writing(self):
        self.packet['frames'][0]['sha256']='0'*64;before=self.path.read_bytes()
        with self.assertRaises(ValueError):self.apply()
        self.assertEqual(self.path.read_bytes(),before)
    def test_wrong_source_fails(self):
        self.packet['source']='film'
        with self.assertRaises(ValueError):self.apply()
    def test_no_metadata_or_path_injection(self):
        self.packet['frames'][0]['origin']='fake'
        with self.assertRaises(ValueError):self.apply()
    def test_invalid_values_fail(self):
        for key,value in [('anchor',[float('nan'),.5]),('bodyHeight',True),('facing',True),('bodyHeight',0),('facing',0)]:
            packet=copy.deepcopy(self.packet);packet['frames'][0][key]=value
            with self.subTest(key=key,value=value),self.assertRaises(ValueError):self.apply(packet)
    def test_modified_image_fails_without_writing(self):
        (self.root/self.image).write_bytes(b'not a PNG');before=self.path.read_bytes()
        with self.assertRaises((ValueError,OSError)):self.apply()
        self.assertEqual(self.path.read_bytes(),before)
    def test_existing_lock_is_not_removed(self):
        lock=self.root/'art/.import.lock';lock.write_text('other job')
        with self.assertRaises(ValueError):self.apply()
        self.assertEqual(lock.read_text(),'other job')
    def test_duplicate_entry_fails(self):
        self.packet['frames'].append(copy.deepcopy(self.packet['frames'][0]))
        with self.assertRaises(ValueError):self.apply()
    def test_registry_symlink_refused(self):
        other=self.root/'external.json';self.path.rename(other);self.path.symlink_to(other)
        with self.assertRaises(ValueError):self.apply()

    def test_old_export_cannot_overwrite_new_calibration(self):
        self.apply()
        before=self.path.read_bytes()
        self.packet['frames'][0]['anchor']=[.3,.8]
        with self.assertRaisesRegex(ValueError, 'Stale calibration'): self.apply()
        self.assertEqual(self.path.read_bytes(), before)
    def test_fresh_export_can_update_existing_calibration(self):
        self.apply()
        current=json.loads(self.path.read_text())['assets']['test']['frames']
        self.packet['previousFrames']=copy.deepcopy(current)
        self.packet['frames'][0]['anchor']=[.3,.8]
        self.apply()
        self.assertEqual(json.loads(self.path.read_text())['assets']['test']['frames'][0]['anchor'], [.3,.8])
    def test_legacy_is_dry_run_only(self):
        self.packet.pop('previousFrames');self.packet['schema']=1
        self.assertFalse(self.apply(apply=False)['applied'])
        with self.assertRaisesRegex(ValueError, 'Legacy'): self.apply()
    def test_boolean_schema_and_extra_fields_rejected(self):
        for key,value in [('schema',True),('unexpected','anything')]:
            packet=copy.deepcopy(self.packet);packet[key]=value
            with self.assertRaises(ValueError): self.apply(packet)
    def test_missing_previous_frame_guard_rejected(self):
        self.packet.pop('previousFrames')
        with self.assertRaises(ValueError): self.apply()
    def test_changed_orientation_invalidates_export(self):
        registry=copy.deepcopy(self.original);registry['assets']['test']['frames'][0]['facing']=-1
        self.path.write_text(json.dumps(registry))
        with self.assertRaisesRegex(ValueError, 'Stale calibration'): self.apply()
    def test_asset_directory_symlink_rejected(self):
        images=self.root/'assets/sprites';other=self.root/'moved';images.rename(other);images.symlink_to(other)
        with self.assertRaises(ValueError): self.apply()
