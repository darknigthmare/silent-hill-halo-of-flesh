import importlib.util
from io import BytesIO
from pathlib import Path
import unittest
from PIL import Image, ImageDraw

spec=importlib.util.spec_from_file_location('webp_decoder',Path(__file__).resolve().parents[1]/'scripts/validate-webp.py')
webp=importlib.util.module_from_spec(spec);spec.loader.exec_module(webp)
class WebpValidationTests(unittest.TestCase):
    def make(self,opaque=False,edge=False):
        im=Image.new('RGBA',(256,128),(20,20,20,255) if opaque else (0,0,0,0));ImageDraw.Draw(im).rectangle((0 if edge else 40,20,200,110),fill=(170,100,50,255));out=BytesIO();im.save(out,'WEBP',lossless=True);return out.getvalue()
    def test_real_alpha_webp_fully_decodes(self):self.assertEqual(webp.inspect(self.make())['visibleBounds'],[40,20,201,111])
    def test_opaque_rejected(self):
        with self.assertRaises(ValueError):webp.inspect(self.make(opaque=True))
    def test_edge_rejected(self):
        with self.assertRaises(ValueError):webp.inspect(self.make(edge=True))
    def test_truncated_rejected(self):
        with self.assertRaises((ValueError,OSError)):webp.inspect(self.make()[:-8])
