"""Importer tests use simple synthetic fixtures for validation, never production artwork."""
import importlib.util
import json
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
if __name__=='__main__':unittest.main()
