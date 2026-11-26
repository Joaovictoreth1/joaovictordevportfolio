# Portfólio de João Victor

Portfólio estático com projetos e contato, com efeitos GSAP e Three.js em navegadores compatíveis. Respeita a preferência por movimento reduzido; fontes, estilos e bibliotecas são carregados por CDN.

## Rodar localmente

Na raiz do repositório, execute:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Abra <http://localhost:8000/>.

## Estrutura

`index.html`: conteúdo, estilos e scripts.

A CI valida o HTML e verifica arquivos e âncoras locais. Links e serviços externos não são consultados pela CI.
