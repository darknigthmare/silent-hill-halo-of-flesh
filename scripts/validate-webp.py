#!/usr/bin/env python3
"""Decode exactly the bounded WebP bytes supplied by the Node build validator."""
import hashlib
import json
from io import BytesIO
import sys
from PIL import Image, ImageFile

Image.MAX_IMAGE_PIXELS = 4096 * 4096
ImageFile.LOAD_TRUNCATED_IMAGES = False

def inspect(raw):
    if not raw or len(raw) > 24 * 1024 * 1024:
        raise ValueError('WebP input size limit')
    with Image.open(BytesIO(raw)) as im:
        if im.format != 'WEBP' or getattr(im, 'n_frames', 1) != 1 or im.mode not in ('RGBA', 'LA'):
            raise ValueError('One static image with native alpha required')
        if not 256 <= im.width <= 4096 or not 128 <= im.height <= 4096:
            raise ValueError('Dimensions outside sprite policy')
        im.load()
        alpha = im.getchannel('A')
        fraction = sum(alpha.histogram()[:16]) / (im.width * im.height)
        bounds = alpha.point(lambda a: 255 if a >= 32 else 0).getbbox()
        if not .08 <= fraction <= .98 or alpha.getextrema()[1] < 96 or not bounds:
            raise ValueError('Opaque or empty image')
        if bounds[0] < 1 or bounds[1] < 1 or bounds[2] >= im.width or bounds[3] >= im.height:
            raise ValueError('Visible subject touches edge')
        rgba = im.convert('RGBA')
        rgba.paste((0, 0, 0, 0), mask=alpha.point(lambda a: 255 if a == 0 else 0))
        return dict(width=im.width, height=im.height, format='WEBP', alpha=True, animated=False,
                    visibleBounds=list(bounds), transparentFraction=round(fraction, 5),
                    sha256=hashlib.sha256(raw).hexdigest(), pixelSHA256=hashlib.sha256(rgba.tobytes()).hexdigest())

if __name__ == '__main__':
    try:
        print(json.dumps(inspect(sys.stdin.buffer.read(24 * 1024 * 1024 + 1))))
    except Exception as error:
        print(str(error), file=sys.stderr)
        sys.exit(2)
