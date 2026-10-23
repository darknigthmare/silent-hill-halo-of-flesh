"""Synthetic images exercise exact weapon-context authoring, never production art."""
from copy import deepcopy
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('weapon_idle_clips', ROOT / 'scripts/apply-sprite-clip.py')
CLIPS = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(CLIPS)
IMPORTER = CLIPS.importer
FIGHTER = 'sh3_memory_of_alessa_049'
KEYS = tuple(f'idle@{FIGHTER}:weapon:{weapon}' for weapon in ('knife', 'handgun', 'pipe', 'smg'))


class WeaponIdleImportTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix='halo-weapon-idle-')
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        (self.root / 'art').mkdir()
        (self.root / 'data').mkdir()
        self.registry = self.root / 'art/registry.json'
        self.registry.write_text(json.dumps({'schema': 1, 'assets': {}}))
        (self.root / 'data/roster.json').write_text(json.dumps([
            {'id': FIGHTER, 'source': 'sh3'}, {'id': 'other_sh3_fighter', 'source': 'sh3'}]))
        (self.root / 'data/production-reference-index.json').write_text(json.dumps({
            'schema': 1, 'fighters': {FIGHTER: 'sh3', 'other_sh3_fighter': 'sh3'}, 'stages': {}}))
        self.image = self.root / 'source.png'
        self.make_image(0)

    def make_image(self, number):
        image = Image.new('RGBA', (300, 200))
        image.paste((120 + number * 17, 80 + number * 13, 90 + number * 11, 255), (30, 20, 270, 180))
        image.save(self.image)

    def args(self, *extra):
        return IMPORTER.parser().parse_args([
            str(self.image), '--root', str(self.root), '--fighter', FIGHTER, '--source', 'sh3',
            '--single-subject-reviewed', '--anchor-x', '.5', '--anchor-y', '.9', '--body-height', '.8',
            *extra])

    def asset(self):
        return json.loads(self.registry.read_text())['assets'][FIGHTER]

    def packet(self, pose, frames):
        asset = self.asset()
        return dict(schema=1, kind='halo-sprite-clip', fighterId=FIGHTER, source='sh3', pose=pose,
                    frameSet=[dict(path=frame['path'], sha256=frame['sha256']) for frame in asset['frames']],
                    previousClip=deepcopy(asset['clips'].get(pose)),
                    clip=dict(frames=frames, ticksPerFrame=7, loop=False))

    def initialize(self, *, all_weapons=False):
        IMPORTER.import_sprite(self.args())
        CLIPS.apply_packet(self.root, self.packet(KEYS[0], [0]), apply=True, pose_reviewed=True)
        if all_weapons:
            for number, key in enumerate(KEYS[1:], 1):
                self.make_image(number)
                IMPORTER.import_sprite(self.args('--append', '--pose', key))

    def test_exact_four_keys_keep_original_engine_key_contract_and_weapon_order(self):
        self.assertEqual(IMPORTER.WEAPON_IDLE_KEYS, KEYS)
        self.assertEqual(len(set(IMPORTER.POSE_KEYS)), 39)
        for key in KEYS:
            self.assertEqual(IMPORTER.validate_pose_key(key, FIGHTER, self.root, 'sh3'), 'idle')
            self.assertEqual(IMPORTER.validate_pose_key(key, FIGHTER, self.root), 'idle')

    def test_wrong_owner_source_weapon_or_pose_is_rejected_without_import(self):
        before = self.registry.read_bytes()
        invalid = [
            ('idle@other_sh3_fighter:weapon:knife', FIGHTER, 'sh3'),
            (KEYS[0], 'other_sh3_fighter', 'sh3'),
            (KEYS[0], FIGHTER, 'film'),
            (f'idle@{FIGHTER}:weapon:chainsaw', FIGHTER, 'sh3'),
            (f'walk@{FIGHTER}:weapon:knife', FIGHTER, 'sh3'),
            (f'intro@{FIGHTER}:weapon:knife', FIGHTER, 'sh3'),
            (f'idle@{FIGHTER}:weapon:Knife', FIGHTER, 'sh3'),
            (KEYS[0] + ':extra', FIGHTER, 'sh3')]
        for key, fighter, source in invalid:
            with self.subTest(key=key, fighter=fighter, source=source), self.assertRaises(ValueError):
                IMPORTER.validate_pose_key(key, fighter, self.root, source)
        self.assertEqual(self.registry.read_bytes(), before)

    def test_production_index_must_corroborate_exact_sh3_source(self):
        path = self.root / 'data/production-reference-index.json'
        path.write_text(json.dumps({'fighters': {FIGHTER: 'film'}, 'stages': {}}))
        with self.assertRaisesRegex(ValueError, 'exact SH3'):
            IMPORTER.validate_pose_key(KEYS[0], FIGHTER, self.root, 'sh3')

    def test_generic_idle_and_portrait_are_required_before_contextual_append(self):
        with self.assertRaisesRegex(ValueError, 'first frame'):
            IMPORTER.import_sprite(self.args('--pose', KEYS[0]))
        self.assertEqual(json.loads(self.registry.read_text())['assets'], {})
        IMPORTER.import_sprite(self.args())
        before = self.registry.read_bytes()
        with self.assertRaisesRegex(ValueError, 'first frame'):
            IMPORTER.import_sprite(self.args('--replace', '--pose', KEYS[0]))
        self.assertEqual(self.registry.read_bytes(), before)

    def test_four_real_images_create_generic_portrait_and_four_exact_weapon_idles(self):
        self.initialize(all_weapons=True)
        asset = self.asset()
        self.assertEqual(list(asset['clips']), ['idle', *KEYS])
        self.assertEqual(len(asset['frames']), 4, 'knife explicitly shares generic idle; no fifth duplicate image')
        self.assertEqual(asset['clips']['idle']['frames'], [0])
        self.assertEqual(asset['clips'][KEYS[0]]['frames'], [0])
        self.assertEqual(asset['portrait']['path'], asset['frames'][0]['path'])
        self.assertEqual([asset['clips'][key]['frames'] for key in KEYS], [[0], [1], [2], [3]])
        self.assertEqual(asset['animatedClips'], 0, 'four static weapon poses are not four animations')
        self.assertEqual(asset['fidelity'], 'unverified')
        self.assertEqual(len(list((self.root / 'assets/sprites').glob('*.png'))), 4)

    def test_knife_alias_keeps_frame_review_and_stale_export_guards(self):
        IMPORTER.import_sprite(self.args())
        packet = self.packet(KEYS[0], [0])
        before = self.registry.read_bytes()
        with self.assertRaisesRegex(ValueError, 'pose-reviewed'):
            CLIPS.apply_packet(self.root, packet, apply=True)
        self.assertEqual(self.registry.read_bytes(), before)
        result = CLIPS.apply_packet(self.root, packet, apply=True, pose_reviewed=True)
        self.assertFalse(result['artworkCertified'])
        self.assertEqual(len(self.asset()['frames']), 1)
        before = self.registry.read_bytes()
        with self.assertRaisesRegex(ValueError, 'Stale'):
            CLIPS.apply_packet(self.root, packet, apply=True, pose_reviewed=True)
        self.assertEqual(self.registry.read_bytes(), before)

    def test_other_weapons_cannot_borrow_generic_or_another_weapon_pixels(self):
        self.initialize(all_weapons=True)
        before = self.registry.read_bytes()
        for key, frames in [(KEYS[1], [0]), (KEYS[2], [1]), (KEYS[0], [3]), ('idle', [1])]:
            with self.subTest(key=key), self.assertRaisesRegex(ValueError, 'dedicated pixels|another weapon'):
                CLIPS.apply_packet(self.root, self.packet(key, frames), apply=True, pose_reviewed=True)
            self.assertEqual(self.registry.read_bytes(), before)

    def test_wrong_asset_source_is_refused_even_when_packet_matches_forged_registry(self):
        self.initialize()
        registry = json.loads(self.registry.read_text())
        registry['assets'][FIGHTER]['source'] = 'film'
        self.registry.write_text(json.dumps(registry))
        packet = self.packet(KEYS[0], [0])
        packet['source'] = 'film'
        before = self.registry.read_bytes()
        with self.assertRaisesRegex(ValueError, 'fighter/source'):
            CLIPS.apply_packet(self.root, packet, apply=True, pose_reviewed=True)
        self.assertEqual(self.registry.read_bytes(), before)

    def test_publication_rechecks_pixels_instead_of_trusting_reencoded_frame_metadata(self):
        self.initialize(all_weapons=True)
        registry = json.loads(self.registry.read_text())
        asset = registry['assets'][FIGHTER]
        with Image.open(self.root / asset['frames'][1]['path']) as image:
            image.save(self.image, compress_level=9)
        actual = IMPORTER.inspect_image(self.image)
        changed = asset['frames'][3]
        relative = f"assets/sprites/{FIGHTER}.{actual['sha256'][:12]}.png"
        (self.root / relative).write_bytes(self.image.read_bytes())
        changed.update(path=relative, sha256=actual['sha256'], bytes=actual['bytes'])
        # Keep the old cached pixel identity to imitate an untrusted hand edit.
        self.registry.write_text(json.dumps(registry))
        packet = self.packet('idle', [0])
        CLIPS.validate_clip(self.asset(), packet['pose'], packet['clip'], self.root)
        before = self.registry.read_bytes()
        with self.assertRaisesRegex(ValueError, 'another weapon'):
            CLIPS.apply_packet(self.root, packet, apply=True, pose_reviewed=True)
        self.assertEqual(self.registry.read_bytes(), before)

    def test_import_rechecks_old_weapon_pixels_before_publishing_an_append(self):
        self.initialize(all_weapons=True)
        registry = json.loads(self.registry.read_text())
        asset = registry['assets'][FIGHTER]
        with Image.open(self.root / asset['frames'][1]['path']) as image:
            image.save(self.image, compress_level=9)
        actual = IMPORTER.inspect_image(self.image)
        copied = asset['frames'][2]
        relative = f"assets/sprites/{FIGHTER}.{actual['sha256'][:12]}.png"
        (self.root / relative).write_bytes(self.image.read_bytes())
        copied.update(path=relative, sha256=actual['sha256'], bytes=actual['bytes'])
        self.registry.write_text(json.dumps(registry))
        self.make_image(4)
        appended = IMPORTER.inspect_image(self.image)
        target = self.root / f"assets/sprites/{FIGHTER}.{appended['sha256'][:12]}.png"
        before = self.registry.read_bytes()
        with self.assertRaisesRegex(ValueError, 'another weapon'):
            IMPORTER.import_sprite(self.args('--append', '--pose', KEYS[3]))
        self.assertEqual(self.registry.read_bytes(), before)
        self.assertFalse(target.exists(), 'failed validation publishes no additional file')

    def test_import_refuses_old_weapon_file_whose_registered_digest_changed(self):
        self.initialize(all_weapons=True)
        old = self.root / self.asset()['frames'][1]['path']
        self.make_image(5)
        old.write_bytes(self.image.read_bytes())
        self.make_image(4)
        before = self.registry.read_bytes()
        with self.assertRaisesRegex(ValueError, 'no longer matches its digest'):
            IMPORTER.import_sprite(self.args('--append', '--pose', KEYS[3]))
        self.assertEqual(self.registry.read_bytes(), before)


if __name__ == '__main__':
    unittest.main()
