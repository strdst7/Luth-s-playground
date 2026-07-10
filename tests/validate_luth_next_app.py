#!/usr/bin/env python3
"""Focused validation for the merged Luth's Playground Next.js app."""
from pathlib import Path
import json
import unittest

ROOT = Path(__file__).resolve().parents[1]


def read(relative: str) -> str:
    return (ROOT / relative).read_text(encoding="utf-8")


class LuthNextAppValidation(unittest.TestCase):
    def test_package_and_metadata_are_rebranded(self):
        package = json.loads(read("package.json"))
        self.assertEqual(package["name"], "luths-playground")
        layout = read("src/app/layout.tsx")
        self.assertIn("Luth's Playground", layout)
        self.assertIn("pasarapi.xyz", layout.lower())
        self.assertIn("#080b1f", layout)

    def test_learning_app_contains_luth_brand_footer_parent_controls_and_audio(self):
        app = read("src/app/learning-app.tsx")
        for term in ["Luth&apos;s Playground", "pasarapi.xyz", "Parent Dashboard", "AudioContext", "speechSynthesis"]:
            self.assertIn(term, app)
        for term in ["soundEnabled", "playTone", "speak(", "dailyLimit", "enabledSubjects"]:
            self.assertIn(term, app)
        self.assertNotIn("ROBLOX LEARNING WORLD", app)

    def test_dark_blocky_3d_theme_tokens_and_interactions_exist(self):
        css = read("src/app/globals.css")
        for term in ["--void", "--neon", "--neon-pink", "sky-grid", "portal-ring", "blocky", "isometric", "perspective", "transform-style", "portalPulse"]:
            self.assertIn(term, css)
        for old_light in ["var(--paper);", "background: white; border-top"]:
            self.assertNotIn(old_light, css)

    def test_pasarapi_arcade_and_education_curriculum_remain(self):
        data = read("src/app/learning-data.ts")
        for domain in ["mandarin", "math", "english", "science", "coding"]:
            self.assertIn(f'id: "{domain}"', data)
        for mandarin in ["你好", "谢谢", "再见", "红色", "蓝色"]:
            self.assertIn(mandarin, data)
        app = read("src/app/learning-app.tsx")
        for api in ["dog.ceo", "uselessfacts", "datamuse", "PasarAPI"]:
            self.assertIn(api, app)

    def test_sync_api_and_health_api_exist(self):
        self.assertIn("Luth", read("src/app/api/health/route.ts"))
        sync = read("src/app/api/sync/route.ts")
        self.assertIn("deviceId", sync)
        self.assertIn("snapshot", sync)


if __name__ == "__main__":
    unittest.main(verbosity=2)
