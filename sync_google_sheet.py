#!/usr/bin/env python3
"""Build the compact web snapshot from the Atlas Google Sheet."""
import csv
import io
import json
import urllib.request
from pathlib import Path

SHEET_ID = "14Av0SULxF866ru53EWmAAhOZmk8PLWP21mcP4oPMm9Y"
GID = "1575944881"
URL = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={GID}"
OUT = Path(__file__).with_name("atlas_data.json")
EXCLUDED = {"4300001", "4300002"}  # IBGE operational water areas, not municipalities


def main():
    request = urllib.request.Request(URL, headers={"User-Agent": "Pasture-Reform-Atlas/1.0"})
    with urllib.request.urlopen(request, timeout=60) as response:
        text = response.read().decode("utf-8-sig")
    reader = csv.reader(io.StringIO(text))
    columns = next(reader)
    code_index = columns.index("codigo_ibge")
    rows = [row for row in reader if row and row[code_index] not in EXCLUDED]
    if len(rows) != 5571:
        raise RuntimeError(f"Expected 5,571 municipalities, received {len(rows):,}")
    content = json.dumps({"columns": columns, "rows": rows}, ensure_ascii=False,
                         separators=(",", ":"))
    if OUT.exists() and OUT.read_text(encoding="utf-8") == content:
        print(f"Unchanged: {OUT} already matches Google Sheets ({len(rows):,} municipalities)")
        return
    OUT.write_text(content, encoding="utf-8")
    print(f"Updated {OUT} from Google Sheets with {len(rows):,} municipalities")


if __name__ == "__main__":
    main()
