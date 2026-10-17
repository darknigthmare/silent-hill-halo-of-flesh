"""Small synthetic pixel fixtures test publication; these are never production sprites."""
import copy
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('clips', ROOT / 'scripts/apply-sprite-clip.py')
module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)

class ClipTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); self.root = Path(self.tmp.name)
        (self.root/'art').mkdir(); (self.root/'assets/sprites').mkdir(parents=True)
        frames=[]
        for n in range(2):
            path=self.root/f'source{n}.png';im=Image.new('RGBA',(300,200));im.paste((120+n*30,80,90,255),(30,20,270,180));im.save(path)
            meta=module.importer.inspect_image(path);name=f"assets/sprites/a.{meta['sha256'][:12]}.png";(self.root/name).write_bytes(path.read_bytes())
            frames.append(dict(path=name,sha256=meta['sha256'],origin='artist-created',anchor=[.5,.9],bodyHeight=.8,facing=1))
        self.asset=dict(fighterId='a',source='sh1',fidelity='unverified',status='integrated-candidate',frames=frames,animatedClips=0,clips={'idle':dict(frames=[0],ticksPerFrame=1,loop=False)})
        self.path=self.root/'art/registry.json';self.path.write_text(json.dumps({'schema':1,'assets':{'a':self.asset}}))
        self.packet=dict(schema=1,kind='halo-sprite-clip',fighterId='a',source='sh1',pose='idle',frameSet=[dict(path=f['path'],sha256=f['sha256']) for f in frames],previousClip=copy.deepcopy(self.asset['clips']['idle']),clip=dict(frames=[0,1,0],frameTicks=[3,5,2],ticksPerFrame=1,loop=True))
    def tearDown(self): self.tmp.cleanup()
    def apply(self, packet=None, **options): return module.apply_packet(self.root, packet or self.packet, **options)
    def test_default_is_dry_run(self):
        before=self.path.read_bytes();r=self.apply();self.assertFalse(r['applied']);self.assertEqual(self.path.read_bytes(),before);self.assertEqual(r['distinctImages'],2)
    def test_review_required_to_publish(self):
        before=self.path.read_bytes()
        with self.assertRaises(ValueError):self.apply(apply=True)
        self.assertEqual(self.path.read_bytes(),before)
    def test_only_clip_and_count_change(self):
        raws=[(self.root/f['path']).read_bytes() for f in self.asset['frames']];self.apply(apply=True,pose_reviewed=True)
        actual=json.loads(self.path.read_text())['assets']['a'];self.assertEqual(actual['animatedClips'],1)
        self.assertEqual(actual['frames'],self.asset['frames']);self.assertEqual(actual['fidelity'],'unverified')
        self.assertEqual(raws,[(self.root/f['path']).read_bytes() for f in actual['frames']])
    def test_old_export_cannot_overwrite_a_new_timeline(self):
        self.apply(apply=True,pose_reviewed=True);before=self.path.read_bytes()
        with self.assertRaisesRegex(ValueError,'Stale'):self.apply(apply=True,pose_reviewed=True)
        self.assertEqual(self.path.read_bytes(),before)
    def test_frame_order_guard(self):
        self.packet['frameSet'].reverse()
        with self.assertRaises(ValueError):self.apply()
    def test_source_and_identity_guard(self):
        for key,value in [('source','film'),('fighterId','other')]:
            p=copy.deepcopy(self.packet);p[key]=value
            with self.subTest(key=key),self.assertRaises(ValueError):self.apply(p)
    def test_unknown_fields_do_not_modify_gameplay(self):
        self.packet['damage']=1000
        with self.assertRaises(ValueError):self.apply()
    def test_booleans_do_not_masquerade_as_integers(self):
        for key in ['schema']:
            p=copy.deepcopy(self.packet);p[key]=True
            with self.assertRaises(ValueError):self.apply(p)
        for patching in [dict(frames=[True]),dict(ticksPerFrame=True),dict(frameTicks=[True,2,3])]:
            p=copy.deepcopy(self.packet);p['clip'].update(patching)
            with self.assertRaises(ValueError):self.apply(p)
    def test_invalid_durations_and_indices(self):
        for fields in [dict(frames=[-1]),dict(frames=[2]),dict(frames=[]),dict(frameTicks=[0,2,3]),dict(frameTicks=[2]),dict(ticksPerFrame=601),dict(loop=1)]:
            p=copy.deepcopy(self.packet);p['clip'].update(fields)
            with self.subTest(fields=fields),self.assertRaises(ValueError):self.apply(p)
    def test_attack_cannot_loop(self):
        self.packet.update(pose='neutralLight',previousClip=None)
        with self.assertRaisesRegex(ValueError,'Attacks'):self.apply()
    def test_only_idle_cannot_make_a_new_action(self):
        self.packet.update(pose='neutralLight',previousClip=None,clip=dict(frames=[0],ticksPerFrame=1,loop=False))
        with self.assertRaisesRegex(ValueError,'dedicated'):self.apply()
    def test_dedicated_action_can_include_idle_recovery(self):
        self.packet.update(pose='neutralLight',previousClip=None);self.packet['clip']['loop']=False
        self.assertTrue(self.apply(apply=True,pose_reviewed=True)['applied'])
    def test_repeated_frame_does_not_inflate_animation_count(self):
        self.packet['clip']=dict(frames=[0,0],frameTicks=[4,7],ticksPerFrame=1,loop=True)
        r=self.apply(apply=True,pose_reviewed=True);self.assertFalse(r['animated']);self.assertEqual(json.loads(self.path.read_text())['assets']['a']['animatedClips'],0)
    def test_actual_image_is_rechecked(self):
        (self.root/self.asset['frames'][1]['path']).write_bytes(b'corrupt')
        with self.assertRaises((ValueError,OSError)):self.apply()
    def test_lock_not_owned_is_never_deleted(self):
        lock=self.root/'art/.import.lock';lock.write_text('other')
        with self.assertRaises(ValueError):self.apply(apply=True,pose_reviewed=True)
        self.assertEqual(lock.read_text(),'other')
    def test_registry_race_leaves_newer_data_untouched(self):
        original=module.importer.inspect_image
        changed=self.path.read_bytes()+b'\n'
        def mutate(path,*args,**kwargs):
            result=original(path,*args,**kwargs);self.path.write_bytes(changed);return result
        with patch.object(module.importer,'inspect_image',side_effect=mutate),self.assertRaisesRegex(ValueError,'Registry changed'):
            self.apply(apply=True,pose_reviewed=True)
        self.assertEqual(self.path.read_bytes(),changed);self.assertFalse((self.root/'art/.import.lock').exists())
    def test_linked_asset_directory_refused(self):
        path=self.root/'assets/sprites';path.rename(self.root/'moved');path.symlink_to(self.root/'moved',target_is_directory=True)
        with self.assertRaises(ValueError):self.apply()
    def test_total_duration_and_step_limits(self):
        for clip in [dict(frames=[0]*257,ticksPerFrame=1,loop=False),dict(frames=[0]*61,ticksPerFrame=600,loop=False)]:
            self.packet['clip']=clip
            with self.assertRaises(ValueError):self.apply()
    def test_publication_reuses_importer_key_contract(self):
        self.assertEqual(module.POSE_KEYS,module.importer.POSE_KEYS)
        self.assertEqual(len(set(module.POSE_KEYS)),38)
    def test_each_presentation_can_publish_dedicated_frames_once(self):
        for pose in module.PRESENTATION_KEYS:
            with self.subTest(pose=pose):
                packet=copy.deepcopy(self.packet);packet.update(pose=pose,previousClip=None);packet['clip']['loop']=False
                report=self.apply(packet,apply=True,pose_reviewed=True)
                self.assertEqual(report['pose'],pose);self.assertTrue(report['applied']);self.assertFalse(report['artworkCertified'])
                clip=json.loads(self.path.read_text())['assets']['a']['clips'][pose]
                self.assertFalse(clip['loop']);self.assertEqual(clip['frameTicks'],[3,5,2])
    def test_every_presentation_refuses_loop_and_idle_only(self):
        before=self.path.read_bytes()
        for pose in module.PRESENTATION_KEYS:
            packet=copy.deepcopy(self.packet);packet.update(pose=pose,previousClip=None)
            with self.subTest(pose=pose),self.assertRaisesRegex(ValueError,'Presentations'):self.apply(packet)
            packet['clip']=dict(frames=[0,0],ticksPerFrame=2,loop=False)
            with self.subTest(pose=pose),self.assertRaisesRegex(ValueError,'dedicated'):self.apply(packet)
        self.assertEqual(self.path.read_bytes(),before)
    def test_presentation_exports_keep_frame_and_stale_guards(self):
        packet=copy.deepcopy(self.packet);packet.update(pose='finished',previousClip=None);packet['clip']['loop']=False
        wrong=copy.deepcopy(packet);wrong['frameSet'][0]['sha256']='changed'
        with self.assertRaisesRegex(ValueError,'Frame order or content'):self.apply(wrong)
        self.apply(packet,apply=True,pose_reviewed=True);before=self.path.read_bytes()
        with self.assertRaisesRegex(ValueError,'Stale'):self.apply(packet,apply=True,pose_reviewed=True)
        self.assertEqual(self.path.read_bytes(),before)
