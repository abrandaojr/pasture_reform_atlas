"""Regression checks for the published snapshot and daily refresh."""
import json
import unittest
from pathlib import Path

from sync_google_sheet import prepare_snapshot, DETAIL_FIELDS

ROOT = Path(__file__).parent


class SnapshotTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.payload = json.loads((ROOT / "atlas_data.json").read_text(encoding="utf-8"))
        cls.details = json.loads((ROOT / "atlas_indicator_details.json").read_text(encoding="utf-8"))

    def test_published_snapshot_matches_refresh(self):
        result = prepare_snapshot(self.payload["columns"], self.payload["rows"], self.details)
        self.assertEqual(result, self.payload)
        self.assertEqual(len(result["rows"]), 5571)
        self.assertTrue(DETAIL_FIELDS.issubset(result["columns"]))

    def test_missing_details_and_duplicate_keys_are_rejected(self):
        with self.assertRaises(ValueError):
            prepare_snapshot(self.payload["columns"], self.payload["rows"],
                             {**self.details, "rows": self.details["rows"][1:]})
        with self.assertRaises(ValueError):
            prepare_snapshot(self.payload["columns"], self.payload["rows"] + [self.payload["rows"][0]], self.details)
        with self.assertRaises(ValueError):
            prepare_snapshot(self.payload["columns"], self.payload["rows"],
                             {**self.details, "columns": self.details["columns"][:-1]})

    def test_zero_missing_and_nonapplicable_risk(self):
        columns = self.payload["columns"]
        for scores, forest, expected in [([""] * 5, "Dados insuficientes", "Dados insuficientes"),
                                         ([0] * 5, "Vermelho", "Vermelho"),
                                         ([100, 100, "", 100, 100], "Não aplicável", "Verde"),
                                         ([100, 50, "", 0, 0], "Não aplicável", "Amarelo")]:
            with self.subTest(scores=scores, forest=forest):
                rows = [list(row) for row in self.payload["rows"]]
                rows[0][columns.index("ind09_classe_floresta_publica")] = forest
                for i, score in zip(range(7, 12), scores):
                    rows[0][columns.index(f"ind{i:02d}_score")] = score
                result = prepare_snapshot(columns, rows, self.details)
                self.assertEqual(result["rows"][0][columns.index("classe_risco_doc")], expected)


if __name__ == "__main__":
    unittest.main()
