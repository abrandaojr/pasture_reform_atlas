# Condições para produzir — edição de 11 de setembro de 2026

Esta versão completa os critérios de mercado e seca que estavam em aberto no Atlas. É uma metodologia de triagem relativa entre municípios. Não define viabilidade econômica, distância rodoviária aceitável, certificação de imóveis ou tolerância agronômica à seca.

## Componentes e referência

- **Mercado:** distância P80 da pastagem a qualquer frigorífico em 2025, em km. Mede distância espacial, não tempo de viagem. A referência nacional tem 5.461 valores: até **38,6 km**, 100 pontos; acima de 38,6 até **65,5 km**, 50; acima de 65,5 km, zero.
- **Seca:** frequência histórica municipal publicada, em % dos anos de 1984–2025. A base atual identifica 5.115 valores como FAO HDF direto, sem máscara MapBiomas, e 456 como imputação pela mediana do bioma. Somente registros diretamente observados, com bioma identificado e valor válido entre 0 e 100, entram na referência e recebem pontos. Não se interpreta essa série direta como frequência ponderada pela área de pastagem.
- **Assistência técnica e escolaridade:** mantêm as classificações e pontos 0/50/100 existentes, derivados do Censo Agropecuário de 2017 conforme as regras anteriores, inclusive seus filtros de denominador e disponibilidade.
- **Crédito:** permanece como variável consultável, fora da classe agregada de condições, conforme a versão anterior das regras.

Na seca, cada município é comparado a seu bioma: valor até P50 = 100 pontos; acima de P50 até P75 = 50; acima de P75 = zero. P50 e P75 usam interpolação linear na posição `(n−1) × p`, sem ponderação. Os limites são fixos nesta edição, não são recalibrados por filtros nem pelas sincronizações diárias.

| Bioma | P50 (% dos anos) | P75 (% dos anos) | Municípios na referência |
|---|---:|---:|---:|
| Amazônia | 6,6046325 | 11,84966425 | 482 |
| Caatinga | 11,878049 | 16,914773 | 1.101 |
| Cerrado | 5 | 10,017284 | 1.045 |
| Mata Atlântica | 1,877623 | 5 | 2.373 |
| Pantanal | 2,107782 | 7,66557 | 8 |

O Pampa não possui referência diretamente observada nesta base; não recebe limites emprestados de outro bioma. O Pantanal tem referência pequena (n=8), de menor estabilidade. Municípios sem bioma identificado não recebem classificação de seca.

## Agregação preservada

`Condições = (pontos de seca + assistência + escolaridade) × pontos de mercado / 100`

- **Adequadas:** resultado acima de 240.
- **Intermediárias:** resultado entre 150 e 240, inclusive.
- **Limitadas:** resultado abaixo de 150.

A distância funciona como fator de acesso: 100 mantém os pontos de suporte; 50 reduz pela metade; zero leva o resultado a zero. Assim, distância acima de 65,5 km sempre produz classe Limitada quando há algum suporte disponível. Essa é uma escolha de priorização herdada da fórmula do Atlas, não uma afirmação de inviabilidade produtiva.

## Ausência e cobertura

Um suporte ausente não soma pontos; esse tratamento conservador não é uma observação de desempenho zero. Se faltar mercado ou faltarem todos os suportes, a classe fica indisponível. Os quatro componentes disponíveis geram cobertura **Completa**; uma classificação calculável com suporte faltante recebe **Parcial**. As imputações de seca pela mediana do bioma são excluídas dos pontos, sem apagar seu registro de origem na base.

## Resultado e rastreabilidade

Na base de referência de 5.571 municípios exibidos: 613 Adequadas, 1.133 Intermediárias, 3.658 Limitadas e 167 sem classificação. Cobertura: 4.335 Completa, 1.069 Parcial e 167 Insuficiente. Contagens podem mudar com atualização dos valores; os limites permanecem fixos até uma nova edição explicitamente versionada.

Versão: `conditions_v2026_09_11`. Limites exatos, amostras e hash da base de referência: [conditions_methodology.json](conditions_methodology.json). Cálculo: [conditions_methodology.py](conditions_methodology.py). A definição foi solicitada pelo usuário nesta edição; ela substitui somente as lacunas e a consequente indicação de regra pendente, preservando os demais componentes e a fórmula.
