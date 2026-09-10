import json
import unittest
from pathlib import Path
from conditions_methodology import lower_is_better, apply_conditions

ROOT=Path(__file__).parent


class ConditionsTests(unittest.TestCase):
    def test_market_boundaries_and_missing(self):
        t={"p50":38.6,"p75":65.5}
        for value,expected in [(0,100),(38.6,100),(38.60001,50),(65.5,50),(65.50001,0),(None,None),(-1,None)]:
            self.assertEqual(lower_is_better(value,t),expected)

    def test_observations_partial_coverage_and_aggregation(self):
        row={"distancia_p80_qualquer_km":20,"seca_freq_pct":1,"seca_status_qualidade":"FAO HDF direto — sem máscara MapBiomas","bioma":"Cerrado","ind05_score":100,"ind06_score":100,
             "ind03_score":"","ind03_classe_mercado":"","ind04_score":"","ind04_classe_seca":"","condicoes_suporte_score_bruto":"","condicoes_score_apos_mercado":"","classe_condicoes_doc":"","classe_condicoes":""}
        def calculate(**changes):
            current={**row,**changes};out=apply_conditions({"columns":list(current),"rows":[list(current.values())]});return dict(zip(out['columns'],out['rows'][0]))
        self.assertEqual(calculate()['classe_condicoes_doc'],'Adequadas')
        self.assertEqual(calculate(distancia_p80_qualquer_km=50)['classe_condicoes_doc'],'Intermediárias')
        self.assertEqual(calculate(distancia_p80_qualquer_km=80)['classe_condicoes_doc'],'Limitadas')
        self.assertEqual(calculate(distancia_p80_qualquer_km=None)['classe_condicoes_doc'],'Dados insuficientes')
        imputed=calculate(seca_status_qualidade='Referência mediana do bioma')
        self.assertIsNone(imputed['ind04_score'])
        self.assertEqual(imputed['condicoes_cobertura'],'Parcial')
        self.assertEqual(imputed['classe_condicoes_doc'],'Intermediárias')
        self.assertEqual(calculate(seca_status_qualidade='Referência mediana do bioma',ind05_score='',ind06_score='')['classe_condicoes_doc'],'Dados insuficientes')
        self.assertEqual(calculate(ind05_score=0,ind06_score=0)['condicoes_cobertura'],'Completa')
        self.assertIsNone(calculate(bioma='Pampa')['ind04_score'])

    def test_published_values_follow_frozen_method(self):
        p=json.loads((ROOT/'atlas_data.json').read_text(encoding='utf-8'))
        self.assertEqual(apply_conditions(p),p)
        rows=[dict(zip(p['columns'],v)) for v in p['rows']]
        self.assertTrue(all(r['classe_condicoes_doc'] in ('Adequadas','Intermediárias','Limitadas','Dados insuficientes') for r in rows))
        self.assertTrue(all(r['ind04_score'] is None for r in rows if 'mediana' in r['seca_status_qualidade'].lower()))


if __name__=='__main__':unittest.main()
