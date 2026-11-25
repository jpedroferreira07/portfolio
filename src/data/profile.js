// Seus dados: contatos, experiência, formação, idiomas, competências e stacks.
// Todo texto com { pt, en } aparece no idioma escolhido.

export const profile = {
  name: 'João Pedro Ferreira',
  city: 'Rio de Janeiro, RJ',
  email: 'jpedroferreira0701@gmail.com',
  github: 'https://github.com/jpedroferreira07',
  linkedin: 'https://www.linkedin.com/in/joaopedroferreira-/',
  // Currículo em PDF: coloque o arquivo em public/cv/ com este nome
  cv: 'cv/curriculo-joao-pedro-ferreira.pdf',
}

// Tudo na seção Experiência usa o mesmo formato de linha:
//   title (destaque) + sub (apoio) | text (descrição) | meta (período ou nível)

export const experience = [
  {
    title: { pt: 'Desenvolvedor de Inovações', en: 'Innovation Developer' },
    sub: 'Ibmec Jr Soluções',
    text: {
      pt: 'Faço parte do time de Inovações da Ibmec Jr, onde crio soluções digitais e entrego funcionalidades para os projetos da empresa, trabalhando em equipe.',
      en: 'I am on the Innovation team at Ibmec Jr, where I create digital solutions and deliver features for the company projects, working as a team.',
    },
    meta: { pt: 'nov/2026 – atual', en: 'Nov 2026 – present' },
    // Ordem: primeiro o técnico, depois as soft skills (a mesma ordem nos dois idiomas)
    learnings: {
      pt: [
        'Desenvolvimento Front‑end e Back‑end',
        'Versionamento com Git e GitHub',
        'Aplicação de Scrum',
        'Trabalho em equipe',
        'Contato com clientes',
        'Comunicação e fala em público',
        'Aprendizagem contínua',
      ],
      en: [
        'Front‑end and Back‑end development',
        'Version control with Git and GitHub',
        'Applying Scrum',
        'Teamwork',
        'Client contact',
        'Communication and public speaking',
        'Continuous learning',
      ],
    },
  },
]

export const education = [
  {
    title: { pt: 'Engenharia de Computação', en: 'Computer Engineering' },
    sub: 'Ibmec Barra da Tijuca',
    text: {
      pt: 'Cursando o terceiro período, com disciplinas voltadas à construção de sistemas completos, desde programação orientada a objetos e estruturas de dados até arquitetura de software, análise quantitativa e desenvolvimento back-end.',
      en: 'Studying the third semester, with courses focused on building complete systems, from object-oriented programming and data structures to software architecture, quantitative analysis and back-end development.',
    },
    meta: { pt: 'fev/2026 – dez/2029', en: 'Feb 2026 – Dec 2029' },
  },
]

export const languages = [
  { title: { pt: 'Português', en: 'Portuguese' }, text: { pt: 'Nativo', en: 'Native' } },
  { title: { pt: 'Inglês', en: 'English' }, text: { pt: 'Avançado', en: 'Advanced' } },
  { title: { pt: 'Espanhol', en: 'Spanish' }, text: { pt: 'Básico', en: 'Basic' } },
  { title: { pt: 'Chinês', en: 'Chinese' }, text: { pt: 'Básico', en: 'Basic' } },
]

// Competências agrupadas por área
export const skills = [
  {
    title: { pt: 'Front-end', en: 'Front-end' },
    text: { pt: 'HTML, CSS, JavaScript, React', en: 'HTML, CSS, JavaScript, React' },
  },
  {
    title: { pt: 'Back-end e dados', en: 'Back-end and data' },
    wide: true, // card mais largo: a lista ocupa menos linhas
    text: {
      pt: 'Python, Node.js, Pandas, APIs REST, Django, Django REST Framework (DRF)',
      en: 'Python, Node.js, Pandas, REST APIs, Django, Django REST Framework (DRF)',
    },
  },
  {
    title: { pt: 'IA e automação', en: 'AI and automation' },
    nowrap: true, // o título fica em uma linha só
    text: { pt: 'Agentes de IA, n8n', en: 'AI Agents, n8n' },
  },
  {
    title: { pt: 'Metodologias Ágeis', en: 'Agile Methodologies' },
    text: { pt: 'Scrum, Kanban', en: 'Scrum, Kanban' },
  },
  {
    title: { pt: 'Design', en: 'Design' },
    medium: true, // card mais largo: Figma, Illustrator e Photoshop ficam lado a lado
    text: { pt: 'Figma, Adobe Illustrator, Adobe Photoshop', en: 'Figma, Adobe Illustrator, Adobe Photoshop' },
  },
  { title: { pt: 'Outros', en: 'Others' }, text: { pt: 'Excel, Git, GitHub, Vercel', en: 'Excel, Git, GitHub, Vercel' } },
]

// Carrossel de stacks logo abaixo do topo (todas as competências)
export const stacks = [
  'React',
  { pt: 'Agentes de IA', en: 'AI Agents' },
  'Python',
  'CSS',
  'Django',
  'n8n',
  'JavaScript',
  { pt: 'APIs REST', en: 'REST APIs' },
  'Pandas',
  'HTML',
  'IA',
  'Node.js',
  'Django REST Framework',
]
