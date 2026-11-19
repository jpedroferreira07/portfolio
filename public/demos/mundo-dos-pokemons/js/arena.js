// Página Arena: escolha dos lutadores, batalha por turnos contra o adversário do site e tela final.
import "./layout.js";
import { carregarMovimento } from "./carregar-movimento.js";
import { carregarGolpes, carregarPokemon, carregarPokemons } from "./api.js";
import { lerFavoritos } from "./armazenamento.js";
import {
  acertou,
  calcularDano,
  corDoHp,
  criarLutador,
  descreverEfetividade,
  escolherGolpeDoRival,
  multiplicadorDeTipo,
  quemComeca,
} from "./batalha.js";
import { criarEfeitos, pausa } from "./arena-efeitos.js";
import { definirVolume, desligarSom, efeito, iniciarMusica, ligarSom, pararMusica, volumeAtual } from "./musica.js";
import { ESTATISTICAS } from "./dados.js";
import { criarSeloTipo } from "./cartas.js";
import { COR_DOS_TIPOS, TIPOS } from "./tipos.js";
import { aposCortina } from "./transicao.js";
import { anunciar, capitalizar, criarElemento as criar, normalizar, semMovimento } from "./util.js";

carregarMovimento((movimento) => movimento.entradaDoTopo(".titulo-pagina, .vagas"));

const POR_PAGINA = 36;
const CHAVE_PLACAR = "arenaPlacar";

const $ = (seletor) => document.querySelector(seletor);
const preparo = $("#preparo");
const luta = $("#luta");
const cena = $("#cena");
const botaoComecar = $("#comecar");
const avisoPreparo = $("#aviso-preparo");
const listaLutadores = $("#lista-lutadores");
const statusLutadores = $("#status-lutadores");
const botaoMais = $("#mais-lutadores");
const campoBusca = $("#busca-lutador");
const soFavoritos = $("#so-favoritos");
const chipsTipos = $("#chips-tipos-arena");
const tiposFiltrados = new Set();
const tituloLista = $("#titulo-lista");
const registro = $("#registro");
const listaGolpes = $("#golpes");
const pergunta = $("#pergunta");
const botoesFim = $("#fim-botoes");
const botaoSom = $("#som");

const efeitos = criarEfeitos(cena);

const estado = {
  todos: [],
  filtrados: [],
  mostrados: 0,
  vaga: "jogador", // para qual vaga a lista está escolhendo
  escolhidos: { jogador: null, rival: null },
  batalha: null,
};

const nomeDe = (pokemon) => capitalizar(pokemon.nome);
const nomeDoGolpe = (golpe) => golpe.nome.split("-").map(capitalizar).join(" ");

/* ---------- Placar (guardado no navegador, sempre validado) ---------- */
function lerPlacar() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE_PLACAR));
    const valido = (n) => Number.isInteger(n) && n >= 0 && n < 1e6;
    return salvo && valido(salvo.vitorias) && valido(salvo.derrotas) ? salvo : { vitorias: 0, derrotas: 0 };
  } catch {
    return { vitorias: 0, derrotas: 0 };
  }
}

function mostrarPlacar() {
  const placar = lerPlacar();
  $("#placar").textContent = `Vitórias: ${placar.vitorias} · Derrotas: ${placar.derrotas}`;
}

function registrarResultado(venceu) {
  const placar = lerPlacar();
  if (venceu) placar.vitorias++;
  else placar.derrotas++;
  try {
    localStorage.setItem(CHAVE_PLACAR, JSON.stringify(placar));
  } catch {
    // Sem armazenamento: o placar só não fica guardado.
  }
  mostrarPlacar();
}

/* ---------- Música de batalha e efeitos sonoros (desligados por padrão) ---------- */
const campoVolume = $("#volume");
campoVolume.value = String(volumeAtual());

botaoSom.addEventListener("click", async () => {
  const ligar = botaoSom.getAttribute("aria-pressed") !== "true";
  if (ligar && !(await ligarSom())) {
    anunciar("Este navegador não tem suporte a áudio.");
    return;
  }
  if (!ligar) desligarSom();
  botaoSom.setAttribute("aria-pressed", String(ligar));
  botaoSom.textContent = "Música de batalha: " + (ligar ? "ligada" : "desligada");
  if (ligar && estado.batalha) iniciarMusica();
});

campoVolume.addEventListener("input", () => definirVolume(campoVolume.value));

/* ---------- Preparação: vagas e lista ---------- */
function mostrarVaga(lado, pokemon) {
  const vaga = $(`.vaga-${lado}`);
  const imagem = vaga.querySelector(".vaga-imagem");
  const tipos = vaga.querySelector(".vaga-tipos");
  const status = vaga.querySelector(".vaga-status");
  vaga.querySelector(".interrogacao").hidden = Boolean(pokemon);
  vaga.classList.toggle("vaga-cheia", Boolean(pokemon));
  tipos.replaceChildren();
  status.replaceChildren();
  if (!pokemon) {
    imagem.hidden = true;
    vaga.querySelector(".vaga-nome").textContent = "Nenhum pokémon escolhido";
    return;
  }
  imagem.src = pokemon.imagem;
  imagem.alt = "Arte oficial de " + nomeDe(pokemon);
  imagem.hidden = false;
  vaga.querySelector(".vaga-nome").textContent = `${nomeDe(pokemon)} (nº ${pokemon.id})`;
  for (const tipo of pokemon.tipos) {
    const item = criar("li");
    item.append(criarSeloTipo(tipo));
    tipos.append(item);
  }
  for (const [chave, rotulo] of Object.entries(ESTATISTICAS)) {
    const valor = pokemon.estatisticas?.[chave];
    if (valor === undefined) continue;
    const linha = criar("div", "vaga-status-linha");
    const trilho = criar("span", "vaga-status-trilho");
    const preenchimento = criar("span", "vaga-status-nivel");
    preenchimento.style.width = Math.min(100, (valor / 200) * 100) + "%";
    trilho.append(preenchimento);
    linha.append(criar("dt", "", rotulo), criar("dd", "", String(valor)), trilho);
    status.append(linha);
  }
}

function atualizarBotaoComecar() {
  const pronto = Boolean(estado.escolhidos.jogador && estado.escolhidos.rival);
  botaoComecar.disabled = !pronto;
  avisoPreparo.textContent = "";
}

function marcarVaga(lado) {
  estado.vaga = lado;
  for (const vaga of document.querySelectorAll(".vaga")) vaga.classList.toggle("vaga-ativa", vaga.dataset.vaga === lado);
  tituloLista.textContent = lado === "jogador" ? "Escolha o seu pokémon" : "Escolha o adversário";
}

function escolher(pokemon) {
  estado.escolhidos[estado.vaga] = pokemon;
  mostrarVaga(estado.vaga, pokemon);
  anunciar(`${nomeDe(pokemon)} escolhido como ${estado.vaga === "jogador" ? "o seu pokémon" : "adversário"}.`);
  // depois de escolher o seu, a lista passa a escolher o adversário
  if (estado.vaga === "jogador" && !estado.escolhidos.rival) marcarVaga("rival");
  atualizarBotaoComecar();
}

function sortear(lado) {
  if (estado.todos.length === 0) return;
  const pokemon = estado.todos[Math.floor(Math.random() * estado.todos.length)];
  estado.escolhidos[lado] = pokemon;
  mostrarVaga(lado, pokemon);
  anunciar(`${nomeDe(pokemon)} sorteado para ${lado === "jogador" ? "você" : "o adversário"}.`);
  atualizarBotaoComecar();
}

for (const vaga of document.querySelectorAll(".vaga")) {
  vaga.addEventListener("click", (evento) => {
    const botao = evento.target.closest("button[data-acao]");
    if (!botao) return;
    if (botao.dataset.acao === "sortear") sortear(vaga.dataset.vaga);
    else {
      marcarVaga(vaga.dataset.vaga);
      campoBusca.focus();
    }
  });
}

function criarOpcao(pokemon) {
  const item = criar("li");
  const botao = criar("button", "opcao-lutador");
  botao.type = "button";
  botao.dataset.id = String(pokemon.id);
  const imagem = document.createElement("img");
  imagem.src = pokemon.imagem;
  imagem.alt = "";
  imagem.width = 72;
  imagem.height = 72;
  imagem.loading = "lazy";
  imagem.decoding = "async";
  const textos = criar("span", "opcao-textos");
  textos.append(criar("span", "opcao-nome", nomeDe(pokemon)), criar("span", "opcao-numero", "nº " + pokemon.id));
  const tipos = criar("span", "opcao-tipos");
  for (const tipo of pokemon.tipos) tipos.append(criarSeloTipo(tipo));
  botao.append(imagem, textos, tipos);
  item.append(botao);
  return item;
}

function desenharLista(adicionar = false) {
  if (!adicionar) {
    listaLutadores.replaceChildren();
    estado.mostrados = 0;
  }
  const proximos = estado.filtrados.slice(estado.mostrados, estado.mostrados + POR_PAGINA);
  listaLutadores.append(...proximos.map(criarOpcao));
  estado.mostrados += proximos.length;
  botaoMais.hidden = estado.mostrados >= estado.filtrados.length;
  statusLutadores.textContent =
    estado.filtrados.length === 0
      ? "Nenhum pokémon encontrado."
      : `Mostrando ${estado.mostrados} de ${estado.filtrados.length} pokémons.`;
}

function filtrar() {
  const busca = normalizar(campoBusca.value);
  const favoritos = soFavoritos.checked ? new Set(lerFavoritos().map((p) => p.id)) : null;
  estado.filtrados = estado.todos.filter(
    (p) =>
      (!favoritos || favoritos.has(p.id)) &&
      (!busca || p.nome.includes(busca) || String(p.id) === busca) &&
      [...tiposFiltrados].every((tipo) => p.tipos.includes(tipo)),
  );
  desenharLista();
}

let temporizadorBusca = 0;
campoBusca.addEventListener("input", () => {
  clearTimeout(temporizadorBusca);
  temporizadorBusca = setTimeout(filtrar, 200);
});
soFavoritos.addEventListener("change", filtrar);

/** Botões de tipo: dá para escolher mais de um (o pokémon precisa ter todos os escolhidos). */
function montarChipsTipos() {
  const botoes = Object.entries(TIPOS).map(([tipo, nome]) => {
    const botao = criar("button", "selo-tipo selo-botao tipo-" + tipo, nome);
    botao.type = "button";
    botao.dataset.tipo = tipo;
    botao.setAttribute("aria-pressed", "false");
    return botao;
  });
  chipsTipos.replaceChildren(...botoes);
}

chipsTipos.addEventListener("click", (evento) => {
  const botao = evento.target.closest("button[data-tipo]");
  if (!botao) return;
  const tipo = botao.dataset.tipo;
  if (tiposFiltrados.has(tipo)) tiposFiltrados.delete(tipo);
  else tiposFiltrados.add(tipo);
  botao.setAttribute("aria-pressed", String(tiposFiltrados.has(tipo)));
  filtrar();
});
botaoMais.addEventListener("click", () => desenharLista(true));
listaLutadores.addEventListener("click", (evento) => {
  const botao = evento.target.closest(".opcao-lutador");
  const pokemon = botao && estado.todos.find((p) => p.id === Number(botao.dataset.id));
  if (pokemon) escolher(pokemon);
});

async function carregarLista() {
  try {
    await carregarPokemons({
      aoReceber: (novos) => {
        estado.todos.push(...novos);
        statusLutadores.textContent = `Carregando pokémons... ${estado.todos.length}`;
      },
    });
    statusLutadores.textContent = "";
    filtrar();
  } catch (erro) {
    console.error("Não foi possível carregar os pokémons:", erro);
    statusLutadores.textContent = "Não foi possível carregar os pokémons. Verifique a internet e recarregue a página.";
  }
}

/* ---------- Batalha ---------- */
function registrar(texto, classe = "") {
  const item = criar("li", classe, texto);
  registro.append(item);
  registro.scrollTop = registro.scrollHeight;
}

/** Atualiza o painel de HP de um lado: barra, cor, texto e o aviso de "HP crítico". */
function atualizarPainel(lado) {
  const lutador = estado.batalha[lado];
  const { raiz, painel } = efeitos.lados[lado];
  const medidor = painel.querySelector(".medidor");
  const nivel = medidor.querySelector(".medidor-nivel");
  let fantasma = medidor.querySelector(".medidor-fantasma");
  if (!fantasma) {
    // a barra branca que demora um pouco mais para descer mostra quanto de vida acabou de ser perdido
    fantasma = criar("div", "medidor-fantasma");
    medidor.prepend(fantasma);
  }
  const hp = Math.max(0, lutador.hp);
  const percentual = (hp / lutador.hpMaximo) * 100 + "%";
  nivel.style.width = percentual;
  fantasma.style.width = percentual;
  nivel.className = "medidor-nivel hp-" + corDoHp(lutador.hp, lutador.hpMaximo);
  medidor.setAttribute("aria-valuenow", String(hp));
  medidor.setAttribute("aria-valuemax", String(lutador.hpMaximo));
  medidor.setAttribute("aria-valuetext", `${hp} de ${lutador.hpMaximo} de HP`);
  painel.querySelector(".painel-hp-texto").textContent = `HP ${hp} / ${lutador.hpMaximo}`;
  raiz.classList.toggle("hp-critico", hp > 0 && hp / lutador.hpMaximo <= 0.2);
}

function prepararLado(lado) {
  const lutador = estado.batalha[lado];
  const { raiz, imagem, painel } = efeitos.lados[lado];
  imagem.src = lutador.imagem;
  imagem.alt = nomeDe(lutador);
  raiz.classList.remove("lado-derrotado", "lado-ativo", "hp-critico");
  painel.querySelector(".nome").textContent = nomeDe(lutador);
  painel.querySelector(".medidor").setAttribute("aria-label", "HP de " + nomeDe(lutador));
  painel.querySelector(".medidor-fantasma")?.remove();
  atualizarPainel(lado);
}

/** A dica de cada golpe contra o adversário: super efetivo, pouco efetivo, sem efeito e bônus do mesmo tipo. */
function dicaDoGolpe(golpe) {
  const { jogador, rival } = estado.batalha;
  const multiplicador = multiplicadorDeTipo(golpe.tipo, rival.tipos);
  const dicas = [];
  if (multiplicador === 0) dicas.push(["dica-nulo", "Sem efeito"]);
  else if (multiplicador >= 2) dicas.push(["dica-super", "Muito efetivo"]);
  else if (multiplicador < 1) dicas.push(["dica-fraco", "Pouco efetivo"]);
  if (jogador.tipos.includes(golpe.tipo)) dicas.push(["dica-stab", "Mesmo tipo (+50%)"]);
  return dicas;
}

function desenharGolpes() {
  const { jogador } = estado.batalha;
  listaGolpes.replaceChildren();
  jogador.golpes.forEach((golpe, indice) => {
    const item = criar("li");
    const botao = criar("button", "golpe");
    botao.type = "button";
    botao.dataset.indice = String(indice);
    botao.style.borderLeftColor = COR_DOS_TIPOS[golpe.tipo] ?? "#c4b5fd";
    botao.setAttribute("aria-keyshortcuts", String(indice + 1));
    const topo = criar("span", "golpe-topo");
    topo.append(criar("span", "golpe-nome", nomeDoGolpe(golpe)), criarSeloTipo(golpe.tipo));
    const detalhes = criar(
      "span",
      "golpe-detalhes",
      `Poder ${golpe.poder} · Precisão ${golpe.precisao ?? "—"} · ${golpe.classe === "physical" ? "Físico" : "Especial"}`,
    );
    const dicas = criar("span", "golpe-dicas");
    for (const [classe, texto] of dicaDoGolpe(golpe)) dicas.append(criar("span", "dica " + classe, texto));
    botao.append(criar("span", "golpe-tecla", String(indice + 1)), topo, detalhes, dicas);
    item.append(botao);
    listaGolpes.append(item);
  });
}

function bloquearComandos(bloqueado) {
  for (const botao of listaGolpes.querySelectorAll("button")) botao.disabled = bloqueado;
}

function novoTurno() {
  const batalha = estado.batalha;
  batalha.turno++;
  cena.querySelector(".turno").textContent = "Turno " + batalha.turno;
  pergunta.textContent = `O que ${nomeDe(batalha.jogador)} vai fazer?`;
  bloquearComandos(false);
  listaGolpes.querySelector("button")?.focus({ preventScroll: true });
  batalha.ocupado = false;
}

/** Um ataque completo: animação, acerto ou erro, dano, avisos e, se for o caso, desmaio. */
async function executarAtaque(lado, golpe) {
  const defensorLado = lado === "jogador" ? "rival" : "jogador";
  const batalha = estado.batalha;
  const atacante = batalha[lado];
  const defensor = batalha[defensorLado];

  efeitos.lados[lado].raiz.classList.add("lado-ativo");
  registrar(`${nomeDe(atacante)} usou ${nomeDoGolpe(golpe)}!`, "registro-" + lado);
  efeitos.rotuloDoGolpe(lado, nomeDoGolpe(golpe), golpe.tipo);
  await efeitos.atacar(lado, golpe.tipo, golpe.classe);
  efeitos.lados[lado].raiz.classList.remove("lado-ativo");

  if (!acertou(golpe)) {
    registrar(`${nomeDe(atacante)} errou o ataque!`);
    efeito("erro");
    efeitos.numero(defensorLado, "Errou!", "numero-errou");
    await efeitos.esquivar(defensorLado);
    await pausa(300);
    return;
  }

  const resultado = calcularDano({ atacante, defensor, golpe });
  if (resultado.multiplicador === 0) {
    registrar(`Não afeta ${nomeDe(defensor)}...`);
    efeito("erro");
    efeitos.aviso("Não teve efeito...", "nulo");
    await pausa(900);
    return;
  }

  defensor.hp = Math.max(0, defensor.hp - resultado.dano);
  const efetividade = descreverEfetividade(resultado.multiplicador);
  const forte = resultado.critico || resultado.multiplicador >= 2;
  const resumo = batalha.resumo;
  if (lado === "jogador") resumo.danoCausado += resultado.dano;
  else resumo.danoRecebido += resultado.dano;
  if (lado === "jogador" && resultado.critico) resumo.criticos++;
  if (lado === "jogador" && resultado.multiplicador >= 2) resumo.superEfetivos++;

  efeito(resultado.critico ? "critico" : resultado.multiplicador >= 2 ? "super" : "golpe");
  efeitos.numero(defensorLado, "-" + resultado.dano, forte ? "numero-forte" : "");
  const tremida = forte ? efeitos.tremerCena(resultado.critico ? 1.6 : 1) : Promise.resolve();
  atualizarPainel(defensorLado);
  await Promise.all([efeitos.impacto(defensorLado, golpe.tipo, forte, golpe.classe), tremida]);

  registrar(`${nomeDe(defensor)} perdeu ${resultado.dano} de HP.`);
  if (resultado.critico) {
    registrar("Acerto crítico!", "registro-destaque");
    efeitos.aviso("Acerto crítico!", "critico");
  }
  if (efetividade) {
    registrar(efetividade.texto, "registro-destaque");
    if (!resultado.critico) efeitos.aviso(efetividade.texto, efetividade.nivel);
  }
  await pausa(resultado.critico || efetividade ? 900 : 500);
}

async function jogarTurno(golpeDoJogador) {
  const batalha = estado.batalha;
  if (batalha.ocupado) return;
  batalha.ocupado = true;
  bloquearComandos(true);
  pergunta.textContent = "Batalhando...";

  const golpeDoRival = escolherGolpeDoRival(batalha.rival, batalha.jogador, batalha.dificuldade);
  const primeiro = quemComeca(batalha.jogador, batalha.rival);
  const ordem = primeiro === "jogador" ? ["jogador", "rival"] : ["rival", "jogador"];
  const golpes = { jogador: golpeDoJogador, rival: golpeDoRival };

  for (const lado of ordem) {
    if (batalha.jogador.hp <= 0 || batalha.rival.hp <= 0) break;
    await executarAtaque(lado, golpes[lado]);
  }

  const derrotado = batalha.jogador.hp <= 0 ? "jogador" : batalha.rival.hp <= 0 ? "rival" : null;
  if (derrotado) await terminar(derrotado);
  else novoTurno();
}

async function terminar(derrotado) {
  const venceu = derrotado === "rival";
  const vencedorLado = venceu ? "jogador" : "rival";
  const { jogador, rival, resumo, turno } = estado.batalha;
  const perdedor = venceu ? rival : jogador;
  const vencedor = venceu ? jogador : rival;

  pararMusica();
  registrar(`${nomeDe(perdedor)} desmaiou!`, "registro-destaque");
  efeito("desmaio");
  efeitos.lados[derrotado].raiz.classList.add("lado-derrotado");
  efeitos.lados[derrotado].raiz.classList.remove("hp-critico");
  await efeitos.desmaiar(derrotado);

  registrarResultado(venceu);
  const texto = venceu ? `Vitória! ${nomeDe(vencedor)} venceu a batalha.` : `Derrota... ${nomeDe(vencedor)} venceu a batalha.`;
  registrar(texto, "registro-fim");
  pergunta.textContent = texto;
  anunciar(texto);
  efeito(venceu ? "vitoria" : "derrota");
  if (venceu) efeitos.confete();
  const resumoTexto = `${turno} turnos · ${resumo.danoCausado} de dano causado · ${resumo.criticos} críticos · ${resumo.superEfetivos} super efetivos`;
  registrar("Resumo: " + resumoTexto + ".");
  await efeitos.banner(venceu ? "VITÓRIA!" : "DERROTA", venceu, resumoTexto);
  await efeitos.comemorar(vencedorLado);

  listaGolpes.replaceChildren();
  botoesFim.hidden = false;
  $("#revanche").focus({ preventScroll: true });
}

listaGolpes.addEventListener("click", (evento) => {
  const botao = evento.target.closest(".golpe");
  if (!botao || botao.disabled || !estado.batalha) return;
  jogarTurno(estado.batalha.jogador.golpes[Number(botao.dataset.indice)]);
});

// Teclas 1 a 4 escolhem o golpe (quando não se está digitando)
document.addEventListener("keydown", (evento) => {
  if (luta.hidden || !estado.batalha || estado.batalha.ocupado) return;
  if (evento.ctrlKey || evento.metaKey || evento.altKey || /^(INPUT|SELECT|TEXTAREA)$/.test(evento.target.tagName)) return;
  const botao = listaGolpes.querySelectorAll(".golpe")[Number(evento.key) - 1];
  if (botao) botao.click();
});

async function comecarBatalha(rever = false) {
  const { jogador: pokemonDoJogador, rival: pokemonDoRival } = estado.escolhidos;
  if (!pokemonDoJogador || !pokemonDoRival) return;

  botaoComecar.disabled = true;
  botaoComecar.textContent = "Preparando golpes...";
  try {
    // pokémons vindos de dados antigos podem não ter os status completos
    const completo = async (pokemon) => (pokemon.estatisticas ? pokemon : await carregarPokemon(pokemon.id));
    const [a, b] = await Promise.all([completo(pokemonDoJogador), completo(pokemonDoRival)]);
    const [golpesA, golpesB] = await Promise.all([carregarGolpes(a.id, a.tipos), carregarGolpes(b.id, b.tipos)]);
    estado.batalha = {
      jogador: criarLutador(a, golpesA),
      rival: criarLutador(b, golpesB),
      dificuldade: $("#dificuldade").value,
      ocupado: true,
      turno: 0,
      resumo: { danoCausado: 0, danoRecebido: 0, criticos: 0, superEfetivos: 0 },
    };
  } catch (erro) {
    console.error("Não foi possível preparar a batalha:", erro);
    avisoPreparo.textContent = "Não foi possível preparar a batalha. Verifique a internet e tente de novo.";
    botaoComecar.disabled = false;
    botaoComecar.textContent = "Começar a batalha";
    return;
  }
  botaoComecar.textContent = "Começar a batalha";
  botaoComecar.disabled = false;

  efeitos.limpar();
  preparo.hidden = true;
  luta.hidden = false;
  botoesFim.hidden = true;
  registro.replaceChildren();
  listaGolpes.replaceChildren();
  cena.querySelector(".turno").textContent = "";
  prepararLado("jogador");
  prepararLado("rival");
  efeitos.definirCenario(estado.batalha.jogador, estado.batalha.rival);
  efeitos.esconder("jogador");
  efeitos.esconder("rival");
  pergunta.textContent = "A batalha vai começar!";
  luta.scrollIntoView({ block: "start", behavior: semMovimento() ? "auto" : "smooth" });
  iniciarMusica();

  const { jogador, rival } = estado.batalha;
  await efeitos.abertura(jogador, rival, nomeDe);
  registrar(`${rever ? "Revanche! " : ""}${nomeDe(rival)} quer batalhar!`);
  efeito("entrada");
  await efeitos.entrar("rival");
  await pausa(300);
  registrar(`Vai, ${nomeDe(jogador)}!`);
  efeito("entrada");
  await efeitos.entrar("jogador");
  await pausa(300);

  desenharGolpes();
  novoTurno();
}

botaoComecar.addEventListener("click", () => comecarBatalha(false));

$("#revanche").addEventListener("click", () => {
  botoesFim.hidden = true;
  comecarBatalha(true);
});

function voltarAoPreparo() {
  estado.batalha = null;
  pararMusica();
  luta.hidden = true;
  preparo.hidden = false;
  efeitos.mostrar("jogador");
  efeitos.mostrar("rival");
  efeitos.limpar();
  preparo.scrollIntoView({ block: "start" });
  botaoComecar.focus({ preventScroll: true });
}

$("#outros").addEventListener("click", voltarAoPreparo);
$("#desistir").addEventListener("click", voltarAoPreparo);

/* ---------- Início ---------- */
mostrarPlacar();
marcarVaga("jogador");
atualizarBotaoComecar();
montarChipsTipos();
// o trabalho pesado só começa depois que a Master Ball termina de abrir
aposCortina().then(carregarLista);
