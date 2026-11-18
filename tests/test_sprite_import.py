"""Importer tests use simple synthetic fixtures for validation, never production artwork."""
import importlib.util
import json
from hashlib import sha256
from unittest.mock import patch
from pathlib import Path
import tempfile
import unittest
from PIL import Image
spec=importlib.util.spec_from_file_location('import_sprite',Path(__file__).parents[1]/'scripts/import-sprite.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
class ImportTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name)
  (self.root/'art').mkdir();(self.root/'data').mkdir()
  (self.root/'art/registry.json').write_text(json.dumps({'schema':1,'assets':{}}))
  (self.root/'data/roster.json').write_text(json.dumps([{'id':'a','source':'sh1'},{'id':'b','source':'sh2'}]))
  self.image=self.root/'test.png';im=Image.new('RGBA',(300,200));im.paste((122,133,144,255),(30,20,270,180));im.save(self.image)
 def tearDown(self):self.tmp.cleanup()
 def args(self,*extra):return module.parser().parse_args([str(self.image),'--root',str(self.root),'--fighter','a','--source','sh1','--single-subject-reviewed','--anchor-x','.5','--anchor-y','.9','--body-height','.8',*extra])
 def test_real_rgba_accepted(self):
  result=module.import_sprite(self.args());self.assertTrue((self.root/result['path']).exists());self.assertEqual(result['animatedClips'],0);self.assertEqual(result['fidelity'],'unverified')
 def test_dry_run_does_not_write(self):
  module.import_sprite(self.args('--dry-run'));self.assertFalse((self.root/'assets').exists());self.assertEqual(json.loads((self.root/'art/registry.json').read_text())['assets'],{})
 def test_exact_source(self):
  with self.assertRaises(ValueError):module.import_sprite(self.args('--source','sh2'))
 def test_no_review_claim_by_default(self):
  a=self.args();a.single_subject_reviewed=False
  with self.assertRaises(ValueError):module.import_sprite(a)
 def test_black_background_rejected(self):
  Image.new('RGB',(300,200),'black').save(self.image)
  with self.assertRaises(ValueError):module.import_sprite(self.args())
 def test_opaque_alpha_rejected(self):
  Image.new('RGBA',(300,200),'white').save(self.image)
  with self.assertRaises(ValueError):module.import_sprite(self.args())
 def test_empty_rejected(self):
  Image.new('RGBA',(300,200)).save(self.image)
  with self.assertRaises(ValueError):module.import_sprite(self.args())
 def test_tiny_rejected(self):
  Image.new('RGBA',(32,32)).save(self.image)
  with self.assertRaises(ValueError):module.import_sprite(self.args())
 def test_edge_clipping_rejected(self):
  im=Image.open(self.image);im.putpixel((0,10),(255,255,255,255));im.save(self.image)
  with self.assertRaises(ValueError):module.import_sprite(self.args())
 def test_duplicate_id_requires_permission(self):
  module.import_sprite(self.args())
  with self.assertRaises(ValueError):module.import_sprite(self.args())
 def test_cross_profile_clone_rejected(self):
  module.import_sprite(self.args())
  with self.assertRaises(ValueError):module.import_sprite(self.args('--fighter','b','--source','sh2'))
 def test_identical_frame_not_an_animation(self):
  module.import_sprite(self.args())
  with self.assertRaises(ValueError):module.import_sprite(self.args('--append','--pose','walk'))
 def test_distinct_frames_are_counted_not_files(self):
  module.import_sprite(self.args());im=Image.open(self.image);im.putpixel((130,100),(100,44,33,255));im.save(self.image)
  a=module.import_sprite(self.args('--append','--pose','walk','--ticks','5','--loop'));self.assertEqual(a['animatedClips'],0)
  im.putpixel((131,100),(10,244,33,255));im.save(self.image)
  a=module.import_sprite(self.args('--append','--pose','walk','--ticks','5','--loop'));self.assertEqual(a['animatedClips'],1)
 def test_symlink_source_rejected(self):
  link=self.root/'link.png';link.symlink_to(self.image);a=self.args();a.image=link
  with self.assertRaises(ValueError):module.import_sprite(a)
 def test_nan_calibration_rejected(self):
  with self.assertRaises(ValueError):module.import_sprite(self.args('--anchor-x','nan'))
 def test_neutral_provenance_is_not_claimed_as_generated(self):
  module.import_sprite(self.args());a=json.loads((self.root/'art/registry.json').read_text())['assets']['a']
  self.assertEqual(a['origin'],'external-unspecified');self.assertEqual(a['frames'][0]['origin'],'external-unspecified')
 def test_explicit_provenance_is_preserved(self):
  module.import_sprite(self.args('--origin','artist-created'));a=json.loads((self.root/'art/registry.json').read_text())['assets']['a']
  self.assertEqual(a['origin'],'artist-created')
 def test_mixed_origin_animation_keeps_per_frame_provenance(self):
  module.import_sprite(self.args('--origin','conversation-image-generation'));im=Image.open(self.image);im.putpixel((130,100),(50,33,70,255));im.save(self.image)
  module.import_sprite(self.args('--append','--pose','walk','--origin','artist-created'));a=json.loads((self.root/'art/registry.json').read_text())['assets']['a']
  self.assertEqual(a['origin'],'mixed');self.assertEqual([f['origin'] for f in a['frames']],['conversation-image-generation','artist-created'])
 def test_portrait_records_native_facing(self):
  module.import_sprite(self.args('--facing','-1'));a=json.loads((self.root/'art/registry.json').read_text())['assets']['a'];self.assertEqual(a['portrait']['facing'],-1)
 def test_source_rewrite_after_validation_does_not_change_published_bytes(self):
  original=self.image.read_bytes();inspect=module.inspect_image
  def replace_after(path,**kwargs):
   result=inspect(path,**kwargs);Image.new('RGB',(20,20),'black').save(path);return result
  with patch.object(module,'inspect_image',side_effect=replace_after):result=module.import_sprite(self.args())
  actual=(self.root/result['path']).read_bytes();self.assertEqual(actual,original);self.assertEqual(sha256(actual).hexdigest(),result['technical']['sha256'])
 def test_validation_uses_the_snapshot_not_a_reopened_path(self):
  original=self.image.read_bytes();self.image.write_bytes(b'not an image')
  result=module.inspect_image(self.image,raw=original);self.assertEqual(result['sha256'],sha256(original).hexdigest());self.assertEqual(result['width'],300)
 def test_source_deleted_after_validation_still_copies_validated_snapshot(self):
  original=self.image.read_bytes();inspect=module.inspect_image
  def delete_after(path,**kwargs):
   result=inspect(path,**kwargs);path.unlink();return result
  with patch.object(module,'inspect_image',side_effect=delete_after):result=module.import_sprite(self.args())
  self.assertEqual((self.root/result['path']).read_bytes(),original)

 def test_reencoded_clone_refused_for_another_profile(self):
  module.import_sprite(self.args());im=Image.open(self.image);im.save(self.image,compress_level=0)
  with self.assertRaises(ValueError):module.import_sprite(self.args('--fighter','b','--source','sh2'))
 def test_reencoded_frame_is_not_an_animation(self):
  module.import_sprite(self.args());im=Image.open(self.image);im.save(self.image,compress_level=0)
  with self.assertRaises(ValueError):module.import_sprite(self.args('--append','--pose','walk'))
 def test_invisible_rgb_changes_are_not_new_art(self):
  module.import_sprite(self.args());im=Image.open(self.image);im.putpixel((0,0),(123,42,30,0));im.save(self.image)
  with self.assertRaises(ValueError):module.import_sprite(self.args('--append','--pose','walk'))


 def test_append_preserves_variable_frame_ticks(self):
  module.import_sprite(self.args());path=self.root/'art/registry.json';reg=json.loads(path.read_text());reg['assets']['a']['clips']['idle']['frameTicks']=[7];path.write_text(json.dumps(reg))
  im=Image.open(self.image);im.putpixel((130,100),(51,63,77,255));im.save(self.image)
  module.import_sprite(self.args('--append','--ticks','3'))
  clip=json.loads(path.read_text())['assets']['a']['clips']['idle'];self.assertEqual(clip['frameTicks'],[7,3]);self.assertEqual(clip['frames'],[0,1])
 def test_append_promotes_different_uniform_duration(self):
  module.import_sprite(self.args('--ticks','4'));im=Image.open(self.image);im.putpixel((130,100),(21,93,107,255));im.save(self.image)
  module.import_sprite(self.args('--append','--ticks','8'));clip=json.loads((self.root/'art/registry.json').read_text())['assets']['a']['clips']['idle'];self.assertEqual(clip['frameTicks'],[4,8])
 def test_import_rejects_unknown_or_looping_attack(self):
  for options in [('--pose','unusedPose'),('--pose','neutralLight','--loop')]:
   with self.subTest(options=options),self.assertRaises(ValueError):module.import_sprite(self.args(*options))
 def test_linked_art_folder_is_not_modified(self):
  art=self.root/'art';art.rename(self.root/'otherart');art.symlink_to(self.root/'otherart',target_is_directory=True)
  with self.assertRaises(ValueError):module.import_sprite(self.args())
 def test_all_presentation_keys_import_dedicated_one_shot_frames(self):
  module.import_sprite(self.args());im=Image.open(self.image)
  for n,pose in enumerate(module.PRESENTATION_KEYS):
   with self.subTest(pose=pose):
    im.putpixel((130+n,100),(10+n,50+n,120+n,255));im.save(self.image)
    report=module.import_sprite(self.args('--append','--pose',pose,'--ticks','7'))
    self.assertEqual(report['pose'],pose)
    asset=json.loads((self.root/'art/registry.json').read_text())['assets']['a']
    self.assertFalse(asset['clips'][pose]['loop']);self.assertEqual(asset['clips'][pose]['ticksPerFrame'],7)
    self.assertEqual(asset['source'],'sh1');self.assertEqual(asset['fidelity'],'unverified')
 def test_presentation_loop_refused_without_writing(self):
  module.import_sprite(self.args());before=(self.root/'art/registry.json').read_bytes()
  for pose in module.PRESENTATION_KEYS:
   with self.subTest(pose=pose),self.assertRaisesRegex(ValueError,'play once'):
    module.import_sprite(self.args('--append','--pose',pose,'--loop'))
  self.assertEqual((self.root/'art/registry.json').read_bytes(),before)
 def test_presentation_requires_existing_idle_and_distinct_pixels(self):
  with self.assertRaisesRegex(ValueError,'first frame'):module.import_sprite(self.args('--pose','intro'))
  module.import_sprite(self.args())
  with self.assertRaisesRegex(ValueError,'Repeated'):module.import_sprite(self.args('--append','--pose','finisher'))
 def test_append_refuses_an_existing_asset_from_another_source(self):
  module.import_sprite(self.args());path=self.root/'art/registry.json';reg=json.loads(path.read_text());reg['assets']['a']['source']='film';path.write_text(json.dumps(reg))
  before=path.read_bytes()
  with self.assertRaisesRegex(ValueError,'fighter/source'):module.import_sprite(self.args('--append','--pose','winRound'))
  self.assertEqual(path.read_bytes(),before)

 def test_selection_only_profile_has_no_combat_clip(self):
  result=module.import_sprite(self.args('--selection'))
  a=json.loads((self.root/'art/registry.json').read_text())['assets']['a']
  self.assertEqual(a['combatView'],'selection-only');self.assertEqual(a['frames'],[]);self.assertEqual(a['clips'],{})
  self.assertEqual(a['portrait']['path'],result['path']);self.assertEqual(a['animatedClips'],0)
  with self.assertRaisesRegex(ValueError,'without an idle'):module.import_sprite(self.args('--append'))

 def test_reclassify_shared_idle_preserves_exact_portrait_and_png(self):
  module.import_sprite(self.args('--facing','-1'));path=self.root/'art/registry.json'
  before=json.loads(path.read_text())['assets']['a'];pixels=(self.root/before['portrait']['path']).read_bytes()
  module.import_sprite(self.args('--selection-only'))
  after=json.loads(path.read_text())['assets']['a']
  self.assertEqual(after['portrait'],before['portrait']);self.assertEqual(after['frames'],[]);self.assertEqual(after['clips'],{})
  self.assertEqual((self.root/after['portrait']['path']).read_bytes(),pixels)
  self.assertEqual(after['combatView'],'selection-only')

 def test_combat_idle_preserves_selection_and_replaces_only_shared_idle(self):
  module.import_sprite(self.args('--facing','-1'));path=self.root/'art/registry.json'
  before=json.loads(path.read_text())['assets']['a'];portrait=before['portrait'];pixels=(self.root/portrait['path']).read_bytes()
  im=Image.open(self.image);im.putpixel((130,100),(41,23,72,255));im.save(self.image)
  result=module.import_sprite(self.args('--combat-idle','--facing','1','--anchor-x','.4'))
  after=json.loads(path.read_text())['assets']['a']
  self.assertEqual(after['portrait'],portrait);self.assertEqual((self.root/portrait['path']).read_bytes(),pixels)
  self.assertNotEqual(after['frames'][0]['path'],portrait['path']);self.assertEqual(after['frames'][0]['path'],result['path'])
  self.assertEqual(after['combatView'],'side-view-candidate');self.assertEqual(after['frames'][0]['facing'],1)
  self.assertEqual(after['frames'][0]['anchor'],[.4,.9]);self.assertEqual(after['clips']['idle']['frames'],[0]);self.assertEqual(after['animatedClips'],0)

 def test_new_combat_requires_portrait_and_cannot_reuse_its_pixels(self):
  with self.assertRaisesRegex(ValueError,'selection portrait first'):module.import_sprite(self.args('--combat-idle'))
  module.import_sprite(self.args('--selection'))
  with self.assertRaisesRegex(ValueError,'Repeated'):module.import_sprite(self.args('--combat-idle'))
  im=Image.open(self.image);im.save(self.image,compress_level=0)
  with self.assertRaisesRegex(ValueError,'Repeated'):module.import_sprite(self.args('--combat-idle'))

 def test_selection_update_preserves_separate_combat_and_all_clips(self):
  module.import_sprite(self.args('--selection'));im=Image.open(self.image);im.putpixel((130,100),(41,23,72,255));im.save(self.image)
  module.import_sprite(self.args('--combat-idle'));im.putpixel((131,100),(51,33,82,255));im.save(self.image)
  module.import_sprite(self.args('--append','--pose','walk'))
  path=self.root/'art/registry.json';before=json.loads(path.read_text())['assets']['a']
  im.putpixel((132,100),(61,43,92,255));self.image=self.root/'updated-selection.png';im.save(self.image)
  module.import_sprite(self.args('--selection','--origin','artist-created'));after=json.loads(path.read_text())['assets']['a']
  self.assertEqual(after['frames'],before['frames']);self.assertEqual(after['clips'],before['clips'])
  self.assertEqual(after['combatView'],'side-view-candidate');self.assertNotEqual(after['portrait']['path'],before['portrait']['path'])
  self.assertEqual(after['selectionProvenance'],dict(origin='artist-created',sourceFile=self.image.name,
   sourceSHA256=after['portrait']['sha256'],sourceDimensions=[after['portrait']['width'],after['portrait']['height']]))
  self.assertNotEqual(after['selectionProvenance']['sourceSHA256'],before['selectionProvenance']['sourceSHA256'])

 def test_combat_provenance_uses_replaced_legacy_portrait_and_exact_historical_fallback(self):
  module.import_sprite(self.args('--origin','scan'));path=self.root/'art/registry.json'
  registry=json.loads(path.read_text());legacy=registry['assets']['a']
  for key in ('origin','sourceFile','sourceSHA256'):
   del legacy['portrait'][key];del legacy['frames'][0][key]
  self.assertEqual(module.selection_provenance(legacy),dict(origin='scan',sourceFile=self.image.name,
   sourceSHA256=legacy['portrait']['sha256'],sourceDimensions=[300,200]))
  path.write_text(json.dumps(registry))
  im=Image.open(self.image);im.putpixel((130,100),(41,23,72,255));self.image=self.root/'legacy-new-selection.png';im.save(self.image)
  module.import_sprite(self.args('--selection','--origin','artist-created'))
  selection=json.loads(path.read_text())['assets']['a']['portrait']
  im.putpixel((131,100),(51,33,82,255));self.image=self.root/'legacy-new-combat.png';im.save(self.image)
  module.import_sprite(self.args('--combat-idle','--origin','conversation-image-generation'))
  after=json.loads(path.read_text())['assets']['a']
  self.assertEqual(after['selectionProvenance'],dict(origin=selection['origin'],sourceFile=selection['sourceFile'],
   sourceSHA256=selection['sha256'],sourceDimensions=[selection['width'],selection['height']]))
  self.assertNotEqual(after['selectionProvenance']['sourceSHA256'],after['sourceSHA256'])

 def test_separate_actions_do_not_discard_existing_combat_poses(self):
  module.import_sprite(self.args());im=Image.open(self.image);im.putpixel((130,100),(41,23,72,255));im.save(self.image)
  module.import_sprite(self.args('--append','--pose','walk'))
  path=self.root/'art/registry.json';before=path.read_bytes()
  with self.assertRaisesRegex(ValueError,'Repeated'):module.import_sprite(self.args('--combat-idle'))
  with self.assertRaisesRegex(ValueError,'cannot discard'):module.import_sprite(self.args('--selection-only'))
  self.assertEqual(path.read_bytes(),before)

 def test_combat_idle_replaces_only_frame_zero_and_preserves_other_clips(self):
  module.import_sprite(self.args('--origin','scan'))
  path=self.root/'art/registry.json'
  with Image.open(self.image) as image:
   for index,pose in enumerate(('walk','hurt','ko'),start=1):
    image.putpixel((130,100),(index,23,72,255));image.save(self.image)
    module.import_sprite(self.args('--append','--pose',pose,'--origin','scan','--ticks',str(3+index)))
   before=json.loads(path.read_text())['assets']['a']
   markers=[{'index':i,'sha256':v['sha256']} for i,v in enumerate(before['frames']) if i]
   for color in (80,81):
    image.putpixel((131,100),(color,33,82,255));image.save(self.image)
    result=module.import_sprite(self.args('--combat-idle','--origin','artist-created'))
    after=json.loads(path.read_text())['assets']['a']
    self.assertEqual(after['portrait'],before['portrait'])
    self.assertEqual(after['selectionProvenance'],module.selection_provenance(before))
    self.assertEqual(after['frames'][1:],before['frames'][1:])
    self.assertEqual(after['clips'],before['clips'])
    self.assertEqual(after['retainedLegacyCombatFrames'],markers)
    self.assertEqual(after['origin'],'mixed')
    self.assertEqual(after['frames'][0]['path'],result['path'])
    self.assertNotEqual(after['frames'][0]['path'],before['frames'][0]['path'])
    self.assertEqual(result['animatedClips'],0)
    for frame in before['frames']:
     self.assertEqual(sha256((self.root/frame['path']).read_bytes()).hexdigest(),frame['sha256'])

 def test_combat_idle_rejects_animated_or_shared_frame_zero_without_writing(self):
  module.import_sprite(self.args())
  with Image.open(self.image) as image:
   image.putpixel((130,100),(41,23,72,255));image.save(self.image)
   module.import_sprite(self.args('--append','--pose','walk'))
   image.putpixel((131,100),(51,33,82,255));image.save(self.image)
  path=self.root/'art/registry.json';original=json.loads(path.read_text())
  for pose,indices,reason in [('idle',[0,1],'single static idle'),('walk',[0,1],'shared with another clip')]:
   with self.subTest(pose=pose):
    registry=json.loads(json.dumps(original));registry['assets']['a']['clips'][pose]['frames']=indices
    path.write_text(json.dumps(registry));before=path.read_bytes()
    with self.assertRaisesRegex(ValueError,reason):module.import_sprite(self.args('--combat-idle'))
    self.assertEqual(path.read_bytes(),before)

 def test_separate_combat_cannot_be_demoted_through_its_portrait(self):
  module.import_sprite(self.args('--selection'));im=Image.open(self.image);im.putpixel((130,100),(41,23,72,255));im.save(self.image)
  module.import_sprite(self.args('--combat-idle'))
  with self.assertRaisesRegex(ValueError,'reclassified'):module.import_sprite(self.args('--selection-only'))
  with self.assertRaisesRegex(ValueError,'cannot erase'):module.import_sprite(self.args('--replace'))

 def test_selection_only_pixels_cannot_be_cloned_to_another_profile(self):
  module.import_sprite(self.args('--selection'))
  with self.assertRaisesRegex(ValueError,'Repeated'):module.import_sprite(self.args('--selection','--fighter','b','--source','sh2'))

 def test_reclassify_requires_existing_exact_portrait(self):
  module.import_sprite(self.args());im=Image.open(self.image);im.putpixel((130,100),(41,23,72,255));im.save(self.image)
  with self.assertRaisesRegex(ValueError,'exact existing shared portrait'):module.import_sprite(self.args('--selection-only'))

if __name__=='__main__':unittest.main()
