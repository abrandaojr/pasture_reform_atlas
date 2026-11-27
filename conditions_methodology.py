"""Versioned completion of the Atlas market/drought classification rules."""
import json
import math
from pathlib import Path

CONFIG = Path(__file__).with_name("conditions_methodology.json")


def number(value):
    try:
        result = float(value)
        return result if math.isfinite(result) else None
    except (TypeError, ValueError):
        return None


def lower_is_better(value, thresholds):
    if value is None or value < 0 or not thresholds:
        return None
    return 100 if value <= thresholds["p50"] else 50 if value <= thresholds["p75"] else 0


def observed_drought(row):
    status = str(row.get("seca_status_qualidade", "")).casefold()
    return "direto" in status and "mediana" not in status


def apply_conditions(payload):
    config = json.loads(CONFIG.read_text(encoding="utf-8"))
    columns = list(payload["columns"])
    extra = ["condicoes_cobertura", "condicoes_indicadores_disponiveis", "condicoes_metodo_versao", "condicoes_observacao"]
    for key in extra:
        if key not in columns:
            columns.append(key)
    result = []
    labels = {100: "Adequada", 50: "Intermediária", 0: "Limitada", None: "Dados insuficientes"}
    for values in payload["rows"]:
        row = dict(zip(payload["columns"], values))
        distance = number(row.get("distancia_p80_qualquer_km"))
        drought = number(row.get("seca_freq_pct"))
        market_score = lower_is_better(distance, config["market_km"])
        drought_score = lower_is_better(drought, config["drought_percent_years_by_biome"].get(row.get("bioma"))) if observed_drought(row) and drought is not None and drought <= 100 else None
        support = [drought_score, number(row.get("ind05_score")), number(row.get("ind06_score"))]
        if any(v not in (None, 0, 50, 100) for v in support):
            raise ValueError("Unexpected support indicator score")
        valid = [v for v in support if v is not None]
        raw = sum(valid) if valid else None
        final = raw * market_score / 100 if raw is not None and market_score is not None else None
        cls = "Dados insuficientes" if final is None else "Adequadas" if final > 240 else "Intermediárias" if final >= 150 else "Limitadas"
        available = len(valid) + (market_score is not None)
        row.update({"ind03_score": market_score, "ind03_classe_mercado": labels[market_score],
                    "ind04_score": drought_score, "ind04_classe_seca": labels[drought_score],
                    "condicoes_suporte_score_bruto": raw, "condicoes_score_apos_mercado": final,
                    "classe_condicoes_doc": cls, "classe_condicoes": cls,
                    "condicoes_cobertura": "Insuficiente" if final is None else "Completa" if available == 4 else "Parcial",
                    "condicoes_indicadores_disponiveis": available,
                    "condicoes_metodo_versao": config["version"],
                    "condicoes_observacao": "Seca imputada excluída" if not observed_drought(row) else ""})
        result.append([row.get(key, "") for key in columns])
    return {"columns": columns, "rows": result, "conditions_methodology": config}
