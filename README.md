# Atlas da Pecuária

Edição local revisada de 9 de novembro de 2026, publicada no GitHub Pages.

Abra https://abrandaojr.github.io/pasture_reform_atlas/ para acessar o mapa. Resultados abre a ficha municipal; Ranking compara municípios; Cadeia produtiva mostra estabelecimentos e distâncias.

Os dados e cálculos desta edição são os do pacote Atlas_local_20261109. O detalhamento de concentração de pastagem cobre oito zonas auditadas. As linhas entre imóveis e frigoríficos são esquemáticas e não comprovam fornecimento.

Para abrir localmente, execute `python3 -m http.server 8895` nesta pasta e acesse http://localhost:8895/. Preserve as pastas assets, data e methods. O mapa-base OpenStreetMap requer conexão à internet.

A publicação usa arquivos estáticos na raiz da branch main e .nojekyll. index.html contém a mesma página de entrada de Atlas.html. Não execute o publicador histórico de setembro para atualizar esta edição.
