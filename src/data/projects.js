// Projetos do portfólio.
//
// Para adicionar um projeto: coloque a imagem em public/work/, copie um dos
// objetos abaixo e preencha os dois idiomas.
//
// status:
//   'demo' -> abre a cópia em public/demos/<slug>/ (campo demo)
//   'live' -> quando o projeto tiver GitHub Pages, preencha `live` com o link
// repo: link do repositório no GitHub. O botão "Código" só aparece se estiver preenchido.

export const projects = [
  {
    slug: 'mundo-dos-pokemons',
    status: 'demo',
    demo: 'demos/mundo-dos-pokemons/index.html',
    live: '',
    repo: '',
    image: 'work/mundo-dos-pokemons.jpg',
    tags: ['HTML5', 'CSS3', 'JavaScript', 'PokeAPI', 'GSAP', 'Web Audio'],
    pt: {
      title: 'Mundo dos Pokémons',
      area: 'Web · Faculdade',
      summary:
        'Site com todos os Pokémons, feito sobre a PokeAPI: galeria com busca e filtros, ficha de cada Pokémon, arena de batalha por turnos e favoritos.',
      context: 'Começou como trabalho da AP2 de Desenvolvimento Web no Ibmec e depois foi ampliado.',
      highlights: [
        'Galeria com todas as 1.025 espécies de Pokémon, busca, filtros por tipo e geração e 6 ordenações. Os filtros ficam salvos no endereço da página.',
        'Ficha de cada Pokémon com atributos, habilidades, cadeia de evolução, versão shiny e o grito original, além de um modo para comparar dois.',
        'Arena de batalha por turnos no nível 50, com 3 dificuldades, golpes reais da API, tabela de tipos, STAB e acertos críticos.',
        'Música e efeitos sonoros gerados no navegador com Web Audio, sem arquivos de áudio.',
        'Favoritos salvos no navegador e sincronizados entre abas.',
        'Animações com GSAP e Lenis, com opção de pausar e respeito à preferência de reduzir movimento.',
      ],
    },
    en: {
      title: 'Mundo dos Pokémons',
      area: 'Web · University',
      summary:
        'A site with every Pokémon, built on the PokeAPI: a gallery with search and filters, a profile for each Pokémon, a turn-based battle arena and favorites.',
      context: 'It started as the AP2 assignment for Web Development at Ibmec and was expanded afterwards.',
      highlights: [
        'Gallery with all 1,025 Pokémon species, search, filters by type and generation and 6 sort options. Filters are kept in the page URL.',
        'A profile for each Pokémon with stats, abilities, evolution chain, shiny version and its original cry, plus a mode to compare two.',
        'Turn-based battle arena at level 50, with 3 difficulties, real moves from the API, the type chart, STAB and critical hits.',
        'Music and sound effects generated in the browser with Web Audio, with no audio files.',
        'Favorites saved in the browser and synced across tabs.',
        'Animations with GSAP and Lenis, with a pause option and support for reduced motion.',
      ],
    },
  },
  {
    slug: 'pizzaria-dos-sete-mares',
    status: 'demo',
    demo: 'demos/pizzaria-dos-sete-mares/index.html',
    live: '',
    repo: '',
    image: 'work/pizzaria-dos-sete-mares.jpg',
    tags: ['HTML5', 'CSS3', 'JavaScript', 'SVG'],
    pt: {
      title: 'Pizzaria dos Sete Mares',
      area: 'Web · Faculdade',
      summary:
        'Site de uma pizzaria pirata fictícia, com cardápio interativo, pedido pelo WhatsApp e um galeão animado atravessando a tempestade.',
      context: 'Trabalho da AP1 de Desenvolvimento Web no Ibmec, depois redesenhado.',
      highlights: [
        'Hero animado com galeão, chuva e relâmpagos feitos só com SVG e CSS.',
        'Cardápio com 12 sabores, filtro por categoria e preços que mudam com o tamanho.',
        'O botão Pedir abre o WhatsApp com sabor e tamanho já preenchidos.',
        'Formulário com máscara de telefone e validação campo a campo.',
        'Selo Aberto agora / Fechado calculado pelo horário de funcionamento.',
      ],
    },
    en: {
      title: 'Pizzaria dos Sete Mares',
      area: 'Web · University',
      summary:
        'Website for a fictional pirate pizzeria, with an interactive menu, WhatsApp ordering and an animated galleon sailing through a storm.',
      context: 'AP1 assignment for Web Development at Ibmec, later redesigned.',
      highlights: [
        'Animated hero with a galleon, rain and lightning made with just SVG and CSS.',
        'Menu with 12 flavors, a category filter and prices that change with the size.',
        'The Order button opens WhatsApp with flavor and size already filled in.',
        'Form with phone mask and field-by-field validation.',
        'An Open now / Closed badge computed from the opening hours.',
      ],
    },
  },
]

// Caminho de arquivos em public/ respeitando o base do Vite
export const asset = (path) => (/^https?:\/\//.test(path) ? path : `${import.meta.env.BASE_URL}${path}`)

// Link principal do projeto: o GitHub Pages quando existir, senão a demo
export const projectUrl = (p) => (p.live ? p.live : asset(p.demo))
