#!/usr/bin/env python3
"""Bounded static stage PNG decode. Opaque backgrounds are valid candidates."""
from io import BytesIO
import hashlib
import json
import struct
import sys
import warnings
import zlib
from PIL import Image, ImageFile

MAX_BYTES = 24 * 1024 * 1024
MAX_SIDE = 4096
SIGNATURE = b'\x89PNG\r\n\x1a\n'


def audit_png(data):
    if not data or len(data) > MAX_BYTES or not data.startswith(SIGNATURE):
        raise ValueError('Expected a PNG of 1..24 MiB')
    position, header, data_seen, data_ended, ended = 8, None, False, False, False
    while position < len(data):
        if len(data) - position < 12:
            raise ValueError('Truncated PNG chunk')
        length = struct.unpack_from('>I', data, position)[0]
        kind = data[position + 4:position + 8]
        if length > len(data) - position - 12 or len(kind) != 4 or not all(65 <= char <= 90 or 97 <= char <= 122 for char in kind) or not 65 <= kind[2] <= 90:
            raise ValueError('Invalid PNG chunk')
        payload = data[position + 8:position + 8 + length]
        crc = struct.unpack_from('>I', data, position + 8 + length)[0]
        if zlib.crc32(kind + payload) & 0xffffffff != crc:
            raise ValueError('PNG CRC mismatch')
        position += length + 12
        if header is None and kind != b'IHDR':
            raise ValueError('PNG IHDR must be first')
        if kind in (b'acTL', b'fcTL', b'fdAT'):
            raise ValueError('Animated PNG is not an independent stage frame')
        if kind == b'IHDR':
            if header is not None or length != 13:
                raise ValueError('Invalid or repeated PNG IHDR')
            width, height = struct.unpack_from('>II', payload)
            if not 1 <= width <= MAX_SIDE or not 1 <= height <= MAX_SIDE:
                raise ValueError('PNG dimensions must be 1..4096')
            header = width, height
        elif kind == b'IDAT':
            if data_ended:
                raise ValueError('Nonconsecutive PNG image data')
            data_seen = True
        elif kind == b'IEND':
            if length or not data_seen or position != len(data):
                raise ValueError('Invalid PNG end or trailing file data')
            ended = True
            break
        else:
            if data_seen:
                data_ended = True
            if 65 <= kind[0] <= 90 and kind != b'PLTE':
                raise ValueError('Unknown critical PNG chunk')
    if not ended or header is None:
        raise ValueError('Missing PNG image data or end')
    Image.MAX_IMAGE_PIXELS = MAX_SIDE * MAX_SIDE
    ImageFile.LOAD_TRUNCATED_IMAGES = False
    with warnings.catch_warnings():
        warnings.simplefilter('error', Image.DecompressionBombWarning)
        with Image.open(BytesIO(data)) as image:
            if image.format != 'PNG' or image.size != header or getattr(image, 'n_frames', 1) != 1 or getattr(image, 'is_animated', False):
                raise ValueError('Expected one static PNG frame')
            image.verify()
        with Image.open(BytesIO(data)) as image:
            image.load()
            rgba = image.convert('RGBA')
            pixels = rgba.tobytes()
    return {'format': 'PNG', 'width': header[0], 'height': header[1], 'animated': False,
            'sha256': hashlib.sha256(data).hexdigest(),
            'pixelSHA256': hashlib.sha256(pixels).hexdigest()}


if __name__ == '__main__':
    try:
        result = audit_png(sys.stdin.buffer.read(MAX_BYTES + 1))
        print(json.dumps(result))
    except Exception as error:
        print('Stage PNG decode: ' + str(error), file=sys.stderr)
        sys.exit(1)
