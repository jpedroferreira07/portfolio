// Projetos do portfólio.
//
// Para adicionar um projeto: coloque a imagem em public/work/, copie um dos
// objetos abaixo e preencha os dois idiomas.
//
// status:
//   'live' -> projeto publicado no GitHub Pages: preencha `live` (site) e `repo` (código)
//   'code' -> projeto sem site, só o repositório no GitHub: preencha `repo`
//   'demo' -> cópia hospedada no portfólio em public/demos/<slug>/ (campo `demo`)
// O botão principal abre `live`; se não houver, a `demo`; se também não houver, o `repo`.

export const projects = [
  {
    slug: 'intelligent-team',
    status: 'code',
    live: '',
    repo: 'https://github.com/jpedroferreira07/EmpresaB-Inovacoes-Produtos',
    image: 'work/intelligent-team.jpg',
    tags: ['React', 'Vite', 'React Router', 'Django', 'Django REST Framework', 'Git'],
    pt: {
      title: 'Intelligent Team',
      area: 'Front-end + API · Empresa júnior',
      summary:
        'Protótipo de um copiloto de operações de campo: recomenda equipes habilitadas para cada ordem de serviço e apoia o técnico durante o serviço, com três perfis (gestor, técnico e administrador).',
      context:
        'Projeto final do Processo Seletivo 26.2 da IbmecJr, em parceria com a Visagio, feito em grupo e apresentado em 29/10/2026. Fiquei com a conexão entre o front-end e a API, o painel administrativo e a integração das três partes do front-end.',
      highlights: [
        'Conexão do front-end em React com a API em Django e Django REST Framework: chamadas com token e volta automática ao login quando a sessão expira.',
        'Login com "Entrar como…" para gestor, técnico e administrador, com rotas protegidas por perfil usando React Router.',
        'Painel de operações com contadores, ordens de serviço, alertas e profissionais disponíveis, todos com dados da API.',
        'Painel administrativo com documentos, usuários, auditoria e envio de documento.',
        'Integração das três partes do front-end (gestor, técnico e administrador) em um só site, com o app do técnico funcionando também sem internet.',
        'Fluxo "a IA sugere, a pessoa decide": o gestor revisa a equipe recomendada e a aprovação chama a API. A leitura da ordem é simulada no protótipo.',
      ],
    },
    en: {
      title: 'Intelligent Team',
      area: 'Front-end + API · Junior company',
      summary:
        'A prototype of a field operations copilot: it recommends qualified teams for each service order and supports the technician during the job, with three profiles (manager, technician and administrator).',
      context:
        'Final project of the IbmecJr 26.2 selection process, in partnership with Visagio, built as a group and presented on Oct 29, 2026. I was in charge of connecting the front end to the API, the admin panel and integrating the three parts of the front end.',
      highlights: [
        'Connected the React front end to the Django and Django REST Framework API: token-based calls and an automatic return to login when the session expires.',
        'Login with "Sign in as…" for manager, technician and administrator, with routes protected by profile using React Router.',
        'Operations dashboard with counters, service orders, alerts and available professionals, all with data from the API.',
        'Admin panel with documents, users, audit log and document upload.',
        'Integration of the three parts of the front end (manager, technician and administrator) into one site, with the technician app also working offline.',
        'An "AI suggests, a person decides" flow: the manager reviews the recommended team and the approval calls the API. Reading the order is simulated in the prototype.',
      ],
    },
  },
  {
    slug: 'mundo-dos-pokemons',
    status: 'live',
    live: 'https://jpedroferreira07.github.io/mundo-dos-pokemons/',
    repo: 'https://github.com/jpedroferreira07/mundo-dos-pokemons',
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
    status: 'live',
    live: 'https://jpedroferreira07.github.io/pizzaria-dos-sete-mares/',
    repo: 'https://github.com/jpedroferreira07/pizzaria-dos-sete-mares',
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
  {
    slug: 'foi-isso-que-eu-pedi',
    status: 'live',
    live: 'https://jpedroferreira07.github.io/foi-isso-que-eu-pedi/',
    repo: 'https://github.com/jpedroferreira07/foi-isso-que-eu-pedi',
    image: 'work/foi-isso-que-eu-pedi.jpg',
    tags: ['HTML', 'JavaScript', 'ScrumBan'],
    pt: {
      title: 'Foi isso que eu pedi?',
      area: 'Jogo + Web · Faculdade',
      summary:
        'Jogo de tabuleiro analógico com um validador de prompts que funciona sem internet, para ensinar Engenharia de Prompt Ética em escolas com conexão ruim.',
      context:
        'Projeto em grupo de Métodos Ágeis de Desenvolvimento de Software no Ibmec, feito com ScrumBan entre 29/09 e 17/11/2026 e apresentado a uma banca.',
      highlights: [
        'Jogo físico Cidade-Prompt, ano 2050: tabuleiro, cartas de problema e de superpoder e 4 robôs para os jogadores atravessarem a cidade conversando com a IA.',
        'Manual do Professor com as regras e o passo a passo da aula, para conduzir o jogo sem treinamento prévio.',
        'Validador de prompts em um único arquivo HTML que roda no navegador sem chamadas à internet: compara o prompt com o gabarito do desafio, dá a nota e alerta sobre dados sensíveis, vieses e boas práticas de LGPD.',
        'Processo ágil com quadro Kanban, limite de trabalho em andamento, sprints com planejamento, revisão e retrospectiva.',
        'Site publicado no GitHub Pages com o validador, o vídeo de apresentação e as fotos do dia da banca.',
      ],
    },
    en: {
      title: 'Foi isso que eu pedi? (Is this what I asked for?)',
      area: 'Game + Web · University',
      summary:
        'An analog board game with a prompt validator that works offline, to teach ethical prompt engineering in schools with poor internet access.',
      context:
        'A group project for Agile Software Development Methods at Ibmec, built with ScrumBan between Sep 29 and Nov 17, 2026 and presented to a panel.',
      highlights: [
        'Physical game Prompt City, year 2050: a board, problem and superpower cards and 4 robots for players to cross the city while talking to the AI.',
        "A Teacher's Manual with the rules and the lesson step by step, so the game can be run without prior training.",
        'A prompt validator in a single HTML file that runs in the browser with no internet calls: it compares the prompt with the challenge answer key, gives a score and warns about sensitive data, bias and data protection (LGPD) good practices.',
        'Agile process with a Kanban board, work-in-progress limits and sprints with planning, review and retrospective.',
        'A site published on GitHub Pages with the validator, the presentation video and photos from the panel day.',
      ],
    },
  },
  {
    slug: 'zenkai-sushi',
    status: 'live',
    live: 'https://jpedroferreira07.github.io/design-grafico-ux/',
    repo: 'https://github.com/jpedroferreira07/design-grafico-ux',
    image: 'work/zenkai-sushi.jpg',
    tags: ['HTML', 'CSS', 'JavaScript', 'UX', 'SEO', 'Acessibilidade'],
    pt: {
      title: 'Zenkai Sushi',
      area: 'Web · Design · Faculdade',
      summary:
        'Site de um restaurante japonês temático de Dragon Ball em Shibuya, feito a partir da adaptação de um template de hotel para um novo segmento.',
      context: 'Trabalho em grupo (AP2) de Design Gráfico e User Experience no Ibmec, com quatro integrantes.',
      highlights: [
        'A estrutura de páginas do template foi mantida e todo o conteúdo, a identidade visual e as imagens foram refeitos para o restaurante.',
        'Abertura com contador de poder de luta e as 7 esferas do dragão e transição de página com o Shenlong se formando.',
        'Faixa na página inicial em que o Goku dispara um Kamehameha com o nome dos pratos.',
        'Reserva de mesa com calendário e horário em português, segundas fechadas e horário de funcionamento.',
        'Acessibilidade e SEO: rótulos em todos os campos, contraste revisado, navegação pelo teclado, metadados para compartilhamento, dados estruturados e imagens em WebP no tamanho exato de cada espaço.',
      ],
    },
    en: {
      title: 'Zenkai Sushi',
      area: 'Web · Design · University',
      summary:
        'Website for a Dragon Ball themed Japanese restaurant in Shibuya, built by adapting a hotel template to a new segment.',
      context: 'A group assignment (AP2) for Graphic Design and User Experience at Ibmec, with four members.',
      highlights: [
        "The template's page structure was kept and all the content, visual identity and images were redone for the restaurant.",
        'An opening with a power-level counter and the 7 dragon balls, and a page transition with Shenron forming.',
        'A banner on the home page where Goku fires a Kamehameha spelling out the dishes.',
        'Table booking with a calendar and time in Portuguese, closed on Mondays and opening hours.',
        'Accessibility and SEO: labels on every field, reviewed contrast, keyboard navigation, sharing metadata, structured data and WebP images at the exact size of each slot.',
      ],
    },
  },
  {
    slug: 'conversor-temperatura',
    status: 'code',
    live: '',
    repo: 'https://github.com/jpedroferreira07/conversor-temperatura',
    image: 'work/conversor-temperatura.jpg',
    tags: ['Python 3', 'Git', 'GitHub', 'VS Code'],
    pt: {
      title: 'Conversor de Temperatura',
      area: 'Python · Faculdade',
      summary:
        'Meu primeiro projeto pessoal na faculdade: um programa em Python que converte temperaturas entre Celsius, Fahrenheit e Kelvin.',
      context: 'Feito para aprender lógica de programação e Python. As duas versões ficaram no repositório para mostrar a evolução.',
      highlights: [
        'Converte nas seis direções entre Celsius, Fahrenheit e Kelvin.',
        'Versão 1 com um bloco if/elif para cada conversão, do jeito que fiz no começo.',
        'Versão 2 com uma função para cada conta, deixando o programa mais fácil de ler, reaproveitar e corrigir.',
        'README com passo a passo para rodar em Windows, Linux e macOS e prints de cada versão.',
      ],
    },
    en: {
      title: 'Temperature Converter',
      area: 'Python · University',
      summary:
        'My first personal project at university: a Python program that converts temperatures between Celsius, Fahrenheit and Kelvin.',
      context: 'Built to learn programming logic and Python. Both versions are kept in the repository to show the progress.',
      highlights: [
        'Converts in all six directions between Celsius, Fahrenheit and Kelvin.',
        'Version 1 uses an if/elif block for each conversion, the way I wrote it at the start.',
        'Version 2 uses a function for each formula, making the program easier to read, reuse and fix.',
        'A README with steps to run on Windows, Linux and macOS and screenshots of each version.',
      ],
    },
  },
]

// Caminho de arquivos em public/ respeitando o base do Vite
export const asset = (path) => (/^https?:\/\//.test(path) ? path : `${import.meta.env.BASE_URL}${path}`)

// Link principal do projeto: o site (GitHub Pages) quando existir, senão a demo, senão o repositório
export const projectUrl = (p) => p.live || (p.demo ? asset(p.demo) : p.repo)

// Texto do botão principal, de acordo com o tipo de link
export const projectLabel = (p, t) => (p.live ? t.projects.openLive : p.demo ? t.projects.open : t.projects.openRepo)
