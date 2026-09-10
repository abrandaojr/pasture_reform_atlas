#!/usr/bin/env python3
"""Build the compact web snapshot from the Atlas Google Sheet."""
import csv
import io
import json
import urllib.request
import argparse
import math
import importlib.util
from pathlib import Path

SHEET_ID = "14Av0SULxF866ru53EWmAAhOZmk8PLWP21mcP4oPMm9Y"
GID = "1575944881"
URL = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={GID}"
OUT = Path(__file__).with_name("atlas_data.json")
EXCLUDED = {"4300001", "4300002"}  # IBGE operational water areas, not municipalities
SUPPLEMENT = OUT.with_name("atlas_indicator_details.json")
_conditions_spec = importlib.util.spec_from_file_location("atlas_conditions_methodology", OUT.with_name("conditions_methodology.py"))
_conditions = importlib.util.module_from_spec(_conditions_spec)
_conditions_spec.loader.exec_module(_conditions)
DETAIL_FIELDS = {"codigo_ibge", "pasture_area_2025_ha"}
DETAIL_FIELDS.update(f"distancia_p80_{k}_km" for k in ("qualquer", "sif", "sie", "sim", "consorcio", "china", "eu"))
DETAIL_FIELDS.update(f"persistent_{kind}_{suffix}" for kind in ("low_high", "medium_high")
                     for suffix in ("area_ha", "p80_any_km", "p80_sif_km", "p80_sie_km", "p80_sim_km", "p80_consorcio_km"))
DETAIL_FIELDS.update(f"fao_hdf_{k}" for k in ("zero_area_ha", "gt0_le20_area_ha", "gt20_le40_area_ha", "gt40_le60_area_ha", "gt60_le80_area_ha", "gt80_le100_area_ha"))


def number(value):
    try:
        result = float(value)
        return result if math.isfinite(result) else None
    except (ValueError, TypeError):
        return None


def prepare_snapshot(columns, rows, supplement):
    """Join detailed measurements and apply the existing documented risk rule.

    A missing score contributes no points; all missing remains undefined.
    Non-applicable public forest receives 100, as in the canonical CSV.
    Market/drought scores follow the versioned conditions methodology.
    """
    if len(columns) != len(set(columns)):
        raise ValueError("Duplicate source columns")
    required = {"codigo_ibge", "ind09_classe_floresta_publica", "ind01_classe_rebanho",
                "ind02_classe_oportunidade", "classe_condicoes_doc", "classe_risco_doc",
                "ind03_classe_mercado", "ind04_classe_seca", "risco_score_bruto", "cor_risco"}
    required.update(f"ind{i:02d}_score" for i in range(7, 12))
    if required - set(columns):
        raise ValueError(f"Missing source columns: {sorted(required - set(columns))}")
    if set(supplement["columns"]) != DETAIL_FIELDS or len(supplement["columns"]) != len(DETAIL_FIELDS):
        raise ValueError("Indicator detail schema is incomplete or unexpected")
    if supplement["columns"][0] != "codigo_ibge" or any(len(row) != len(DETAIL_FIELDS) for row in supplement["rows"]):
        raise ValueError("Invalid indicator detail row shape")
    details = {str(row[0]): dict(zip(supplement["columns"], row)) for row in supplement["rows"]}
    if len(details) != len(supplement["rows"]):
        raise ValueError("Duplicate supplement municipality")
    output_columns = list(dict.fromkeys(columns + supplement["columns"]))
    result, seen = [], set()
    for values in rows:
        if len(values) != len(columns):
            raise ValueError("Source row width differs from header")
        row = dict(zip(columns, values))
        code = str(row["codigo_ibge"]).strip()
        if code in EXCLUDED:
            continue
        if code in seen or not code.isdigit() or len(code) != 7:
            raise ValueError(f"Duplicate or invalid municipal code: {code}")
        if code not in details:
            raise ValueError(f"Missing indicator details for {code}")
        seen.add(code)
        row.update(details[code])
        if row["ind09_classe_floresta_publica"] == "Não aplicável":
            row["ind09_score"] = 100
        scores = [number(row[f"ind{i:02d}_score"]) for i in range(7, 12)]
        valid = [score for score in scores if score is not None]
        if any(score not in (0, 50, 100) for score in valid):
            raise ValueError(f"Unexpected risk score for {code}")
        score = sum(valid) if valid else None
        row["risco_score_bruto"] = score
        row["classe_risco_doc"] = ("Dados insuficientes" if score is None else
                                  "Verde" if score > 400 else "Amarelo" if score >= 250 else "Vermelho")
        row["cor_risco"] = row["classe_risco_doc"]
        result.append([row.get(name, "") for name in output_columns])
    if len(result) != 5571:
        raise ValueError(f"Expected 5,571 municipalities, received {len(result):,}")
    return _conditions.apply_conditions({"columns": output_columns, "rows": result})


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-json", type=Path, help="Use a saved Sheets snapshot without network access")
    args = parser.parse_args()
    if args.input_json:
        saved = json.loads(args.input_json.read_text(encoding="utf-8"))
        columns, rows = saved["columns"], saved["rows"]
    else:
        request = urllib.request.Request(URL, headers={"User-Agent": "Pasture-Reform-Atlas/1.0"})
        with urllib.request.urlopen(request, timeout=30) as response:
            text = response.read().decode("utf-8-sig")
        reader = csv.reader(io.StringIO(text))
        columns = next(reader)
        rows = [row for row in reader if row]
    payload = prepare_snapshot(columns, rows, json.loads(SUPPLEMENT.read_text(encoding="utf-8")))
    content = json.dumps(payload, ensure_ascii=False, separators=(",", ":"), allow_nan=False)
    if OUT.exists() and OUT.read_text(encoding="utf-8") == content:
        print(f"Unchanged: {OUT} already matches Google Sheets ({len(payload['rows']):,} municipalities)")
        return
    temporary = OUT.with_suffix(".tmp")
    temporary.write_text(content, encoding="utf-8")
    temporary.replace(OUT)
    print(f"Updated {OUT} from Google Sheets with {len(payload['rows']):,} municipalities")


if __name__ == "__main__":
    main()
