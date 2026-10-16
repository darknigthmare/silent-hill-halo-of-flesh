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

if __name__=='__main__':unittest.main()
