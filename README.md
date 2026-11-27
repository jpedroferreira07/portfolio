# Portfólio de João Pedro Ferreira

Site pessoal com meus projetos, stacks, experiência e contato.

Feito com React 19, Vite, CSS puro, react-router, GSAP (ScrollTrigger) e as fontes Geist.

## Publicação

- Link do site publicado: https://jpedroferreira07.github.io/portfolio/

## Animações

- Carrossel de projetos: no computador a seção fica presa na tela e os cards passam de lado em 3D (coverflow) enquanto você rola; no celular os cards ficam empilhados.
- Topo com uma pilha de telas dos projetos que se alterna sozinha e uma faixa infinita de tecnologias (as duas pausam quando saem da tela).
- Barra de progresso de leitura no topo e botão de voltar ao topo com anel de progresso.
- Fundo estático (gradientes e pontinhos) em uma única camada, sem custo ao rolar.
- Botão de pausar no menu: desliga as animações e a escolha fica salva. Quem usa "reduzir movimento" no sistema já vê o site sem animações.

## Rodar no computador

```bash
npm install
npm run dev
```

O site abre em http://localhost:5173.

Para testar a versão de produção:

```bash
npm run build
npm run preview
```

## Como fazer mudanças

| Para mudar | Arquivo |
| --- | --- |
| Projetos (textos, imagens, links, ordem) | `src/data/projects.js` |
| Contatos, experiência, formação e stacks | `src/data/profile.js` |
| Textos da interface em PT e EN | `src/i18n/strings.js` |
| Cores, fontes e animações | `src/index.css` |
| Imagens dos projetos | `public/work/` |
| Currículo em PDF (botões "CV" e "Baixar currículo") | `public/cv/curriculo-joao-pedro-ferreira.pdf` |

Todo texto existe em português e em inglês. Ao adicionar um projeto, preencha os dois idiomas.

## Adicionar um projeto

1. Coloque a imagem em `public/work/`.
2. Copie um dos objetos de `src/data/projects.js` e ajuste os campos.
3. Preencha `live` (link do GitHub Pages) e `repo` (link do repositório). Se o projeto não tiver site, deixe `live` vazio e use `status: 'code'`: o botão principal passa a abrir o repositório.

## Estrutura

```
src/
  main.jsx  App.jsx  index.css
  layout/     Layout, Nav, Footer
  pages/      Home, ProjectPage, NotFound
  sections/   Hero, Featured, Experience, Contact
  components/ ProjectCard, ProjectDeck, HoloFrame, SectionTitle, Marquee,
              ScrollProgress, BackToTop, StatusTag, Reveal
  hooks/      useMotion, useScrollProgress, useReducedMotion,
              usePageMeta, useScrollSpy, useSectionNav
  motion/     gsap.js (GSAP + ScrollTrigger), scroll.js (rolagem até as seções)
  data/       profile.js, projects.js
  i18n/       lang.js, strings.js
public/
  favicon.svg  work/  cv/   (cv/ guarda o currículo em PDF)
```

## Créditos

Desenvolvido por João Pedro Ferreira, com apoio do Claude no código e na revisão.
