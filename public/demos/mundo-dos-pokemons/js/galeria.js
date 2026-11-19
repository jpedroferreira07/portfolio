// Página Galeria: busca, filtros, ordenação, lista completa e botão de favoritar.
import "./layout.js";
import { carregarMovimento } from "./carregar-movimento.js";
import { aposCortina } from "./transicao.js";
import { revelarAoRolar } from "./animacoes.js";
import { capturar, soltar } from "./captura.js";
import { carregarPokemons } from "./api.js";
import { lerFavoritos, salvarFavoritos } from "./armazenamento.js";
import { criarCard, definirEstadoBotao } from "./cartas.js";
import { alternarComparacao, atualizarComparacao, estaComparando, iniciarComparacao } from "./comparar.js";
import { abrirDetalhes, aoMudarDetalhes, ligarDetalhes } from "./detalhes.js";
import {
  ESTADO_INICIAL,
  GERACOES,
  ORDENACOES,
  estadoParaUrl,
  filtrar,
  lerEstadoDaUrl,
  temFiltro,
} from "./filtros.js";
import { TIPOS } from "./tipos.js";
import { ativarHolografico } from "./holografico.js";
import { anunciar, capitalizar } from "./util.js";

carregarMovimento((movimento) => movimento.entradaDoTopo(".busca, .filtros"));

const CARDS_POR_PAGINA = 48; // o DOM recebe os cards aos poucos, para a página ficar leve
const ESPERA_DA_BUSCA_MS = 200; // só busca quando a pessoa para de digitar

const campoBusca = document.getElementById("busca");
const listaPokemons = document.getElementById("lista-pokemons");
const mensagemStatus = document.getElementById("status");
const textoProgresso = document.getElementById("progresso");
const spinner = document.getElementById("spinner");
const chipsTipos = document.getElementById("chips-tipos");
const seletorGeracao = document.getElementById("geracao");
const seletorOrdem = document.getElementById("ordem");
const botaoLimparBusca = document.getElementById("limpar-busca");
const botaoLimparTudo = document.getElementById("limpar-tudo");
const botaoCarregarMais = document.getElementById("carregar-mais");
const botaoTentarDeNovo = document.getElementById("tentar-de-novo");
const semResultados = document.getElementById("sem-resultados");

const todos = []; // todos os pokémons carregados, em ordem
let estado = { ...ESTADO_INICIAL, tipos: [] }; // filtros e ordem atuais
let filtrados = []; // os que passam pelo filtro atual, já na ordem escolhida
let mostrados = 0; // quantos dos filtrados já estão na tela
let ids = new Set(); // ids favoritados (lidos uma vez, em vez de uma vez por card)
let carregando = true;
let temporizador;
let pokemonNaUrl = null; // número do pokémon com a janela de detalhes aberta (vai para o endereço)
let abrirDaUrl = Number(new URLSearchParams(location.search).get("pokemon")) || null;

/** Um botão por tipo; quem escolhe um ou mais tipos vê só os pokémons que têm todos eles. */
function montarChipsTipos() {
  const botoes = Object.entries(TIPOS).map(([tipo, nome]) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "selo-tipo selo-botao tipo-" + tipo;
    botao.dataset.tipo = tipo;
    botao.textContent = nome;
    botao.setAttribute("aria-pressed", "false");
    return botao;
  });
  chipsTipos.replaceChildren(...botoes);
}

function montarSeletores() {
  for (const [chave, { nome }] of Object.entries(GERACOES)) {
    seletorGeracao.append(new Option(nome, chave));
  }
  for (const [chave, { nome }] of Object.entries(ORDENACOES)) {
    seletorOrdem.append(new Option(nome, chave));
  }
}

/** Deixa os campos da tela iguais ao estado (usado ao abrir a página com filtros no endereço). */
function sincronizarControles() {
  campoBusca.value = estado.busca;
  seletorGeracao.value = estado.geracao;
  seletorOrdem.value = estado.ordem;
  for (const botao of chipsTipos.children) {
    botao.setAttribute("aria-pressed", String(estado.tipos.includes(botao.dataset.tipo)));
  }
  botaoLimparBusca.hidden = estado.busca === "";
  botaoLimparTudo.hidden = !temFiltro(estado) && estado.ordem === "numero";
}

function atualizarEndereco() {
  const parametros = new URLSearchParams(estadoParaUrl(estado));
  if (pokemonNaUrl) parametros.set("pokemon", pokemonNaUrl);
  const texto = parametros.toString();
  history.replaceState(null, "", location.pathname + (texto ? "?" + texto : ""));
}

function atualizarStatus() {
  mensagemStatus.classList.remove("erro");
  if (carregando) return;

  if (filtrados.length === 0) mensagemStatus.textContent = "Nenhum pokémon encontrado.";
  else if (temFiltro(estado)) mensagemStatus.textContent = filtrados.length + " pokémon(s) encontrado(s).";
  else mensagemStatus.textContent = filtrados.length + " pokémons na galeria.";
}

/** Coloca na tela os próximos cards da lista filtrada. */
function mostrarMais() {
  const fim = Math.min(mostrados + CARDS_POR_PAGINA, filtrados.length);
  const cards = [];
  for (let i = mostrados; i < fim; i++) {
    cards.push(
      criarCard(filtrados[i], {
        modo: "galeria",
        posicao: i,
        favorito: ids.has(filtrados[i].id),
        comparando: estaComparando(filtrados[i].id),
      }),
    );
  }
  listaPokemons.append(...cards);
  revelarAoRolar(cards, { escalonar: true });
  mostrados = fim;
  botaoCarregarMais.hidden = mostrados >= filtrados.length;
}

/** Refiltra, reordena e recomeça a lista do início. */
function aplicarFiltro() {
  filtrados = filtrar(todos, estado);
  mostrados = 0;
  listaPokemons.replaceChildren();
  mostrarMais();
  semResultados.hidden = carregando || filtrados.length > 0;
  sincronizarControles();
  atualizarEndereco();
  atualizarStatus();
}

function mudarEstado(mudanca) {
  estado = { ...estado, ...mudanca };
  aplicarFiltro();
}

function limparTudo() {
  mudarEstado({ ...ESTADO_INICIAL, tipos: [] });
  campoBusca.focus();
}

/** Deixa os botões "Comparar" dos cards iguais à escolha atual. */
function atualizarBotoesComparar() {
  for (const botao of listaPokemons.querySelectorAll(".btn-comparar")) {
    const id = Number(botao.closest(".card-pokemon").dataset.id);
    botao.setAttribute("aria-pressed", String(estaComparando(id)));
  }
}

function receberPokemons(novos) {
  todos.push(...novos);
  atualizarComparacao();
  // Com a ordem padrão e sem filtro só acrescenta os novos; senão refaz a lista.
  if (!temFiltro(estado) && estado.ordem === "numero") {
    filtrados = todos.slice();
    if (mostrados < CARDS_POR_PAGINA) mostrarMais();
    else botaoCarregarMais.hidden = mostrados >= filtrados.length;
  } else {
    aplicarFiltro();
  }
}

/** Link direto: galeria.html?pokemon=25 abre os detalhes do Pikachu. */
function abrirPokemonDoEndereco() {
  if (!abrirDaUrl) return;
  const pokemon = todos.find((p) => p.id === abrirDaUrl);
  abrirDaUrl = null;
  if (pokemon) abrirDetalhes(pokemon, null);
}

async function iniciar() {
  carregando = true;
  botaoTentarDeNovo.hidden = true;
  spinner.hidden = false;
  listaPokemons.classList.add("carregando");
  mensagemStatus.textContent = "Carregando pokémons...";

  try {
    const { total, falhas } = await carregarPokemons({
      aoReceber: receberPokemons,
      aoProgredir: (feitos, tudo) => {
        textoProgresso.textContent = feitos + " de " + tudo;
      },
    });
    carregando = false;
    textoProgresso.textContent = "";
    aplicarFiltro();
    abrirPokemonDoEndereco();
    if (falhas > 0) {
      mensagemStatus.textContent = falhas + " de " + total + " pokémons não puderam ser carregados.";
      mensagemStatus.classList.add("erro");
      botaoTentarDeNovo.hidden = false;
    }
  } catch (erro) {
    console.error("Erro ao carregar pokémons:", erro);
    carregando = false;
    textoProgresso.textContent = "";
    mensagemStatus.textContent = "Não foi possível carregar os pokémons. Verifique a conexão.";
    mensagemStatus.classList.add("erro");
    botaoTentarDeNovo.hidden = false;
  } finally {
    spinner.hidden = true;
    listaPokemons.classList.remove("carregando");
  }
}

// Carrega mais cards sozinho quando o fim da lista se aproxima da tela.
new IntersectionObserver(
  (entradas) => {
    if (entradas[0].isIntersecting && mostrados < filtrados.length) mostrarMais();
  },
  { rootMargin: "600px" },
).observe(document.querySelector(".fim-da-lista"));

chipsTipos.addEventListener("click", (evento) => {
  const botao = evento.target.closest(".selo-botao");
  if (!botao) return;
  const tipo = botao.dataset.tipo;
  const tipos = estado.tipos.includes(tipo) ? estado.tipos.filter((t) => t !== tipo) : [...estado.tipos, tipo];
  mudarEstado({ tipos });
});

campoBusca.addEventListener("input", () => {
  botaoLimparBusca.hidden = campoBusca.value === "";
  clearTimeout(temporizador);
  temporizador = setTimeout(() => mudarEstado({ busca: campoBusca.value }), ESPERA_DA_BUSCA_MS);
});

botaoLimparBusca.addEventListener("click", () => {
  mudarEstado({ busca: "" });
  campoBusca.focus();
});
seletorGeracao.addEventListener("change", () => mudarEstado({ geracao: seletorGeracao.value }));
seletorOrdem.addEventListener("change", () => mudarEstado({ ordem: seletorOrdem.value }));
botaoLimparTudo.addEventListener("click", limparTudo);
document.getElementById("limpar-filtros").addEventListener("click", limparTudo);
botaoCarregarMais.addEventListener("click", mostrarMais);
ligarDetalhes(listaPokemons, (id) => todos.find((p) => p.id === id));
ativarHolografico(listaPokemons);
aoMudarDetalhes((id) => {
  pokemonNaUrl = id;
  atualizarEndereco();
});
botaoTentarDeNovo.addEventListener("click", iniciar);

listaPokemons.addEventListener("click", (evento) => {
  const botao = evento.target.closest(".btn-comparar");
  if (!botao) return;
  const pokemon = todos.find((p) => p.id === Number(botao.closest(".card-pokemon").dataset.id));
  if (pokemon) alternarComparacao(pokemon);
});

// Um único listener para todos os botões de favoritar.
listaPokemons.addEventListener("click", (evento) => {
  const botao = evento.target.closest(".btn-favoritar");
  if (!botao) return;

  const id = Number(botao.closest(".card-pokemon").dataset.id);
  const pokemon = todos.find((p) => p.id === id);
  let favoritos = lerFavoritos();
  const jaFavoritado = favoritos.some((f) => f.id === id);

  if (jaFavoritado) favoritos = favoritos.filter((f) => f.id !== id);
  else favoritos.push(pokemon);

  salvarFavoritos(favoritos);
  ids = new Set(favoritos.map((f) => f.id));
  definirEstadoBotao(botao, !jaFavoritado, pokemon.nome);
  anunciar(capitalizar(pokemon.nome) + (jaFavoritado ? " removido dos favoritos" : " capturado e adicionado aos favoritos"));

  const imagem = botao.closest(".card-pokemon").querySelector(".card-imagem");
  if (jaFavoritado) soltar(imagem);
  else capturar(imagem);
});

iniciarComparacao((id) => todos.find((p) => p.id === id), atualizarBotoesComparar);
estado = lerEstadoDaUrl(location.search);
ids = new Set(lerFavoritos().map((f) => f.id));
montarChipsTipos();
montarSeletores();
sincronizarControles();
// o trabalho pesado só começa depois que a Master Ball termina de abrir
aposCortina().then(iniciar);
