// Cartas dos pokémons: o mesmo card é usado na galeria e nos favoritos.
import { totalEstatisticas } from "./dados.js";
import { TIPOS } from "./tipos.js";
import { capitalizar, formatarNumero } from "./util.js";

const HP_MAXIMO = 255; // maior HP base existente, usado para calcular a barra
const CARDS_COM_PRIORIDADE = 4; // primeiros cards da lista: já aparecem na tela
const TOTAL_PARA_SER_RARO = 580; // soma dos status a partir da qual o card ganha o brilho dourado

/** Selo colorido com o nome do tipo. */
export function criarSeloTipo(tipo) {
  const selo = document.createElement("span");
  selo.className = "selo-tipo tipo-" + tipo;
  selo.textContent = TIPOS[tipo] || tipo;
  return selo;
}

/**
 * Monta o conteúdo do botão de favoritar. O texto visível é sempre "Favoritar" e o estado vem
 * de aria-pressed, então o nome acessível ("Favoritar Pikachu") sempre contém o texto visível.
 */
function preencherBotaoFavoritar(botao, nome, favoritado) {
  const estrela = document.createElement("span");
  estrela.setAttribute("aria-hidden", "true");
  estrela.textContent = favoritado ? "★ " : "☆ ";
  const complemento = document.createElement("span");
  complemento.className = "so-leitor";
  complemento.textContent = " " + nome;
  botao.replaceChildren(estrela, "Favoritar", complemento);
  botao.setAttribute("aria-pressed", String(favoritado));
}

/** Atualiza o botão de favoritar depois de favoritar ou desfavoritar. */
export function definirEstadoBotao(botao, favoritado, nome) {
  preencherBotaoFavoritar(botao, capitalizar(nome), favoritado);
}

/** Botão "Comparar": o estado (escolhido ou não) vem de aria-pressed. */
export function criarBotaoComparar(pokemon, comparando) {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "btn-comparar";
  botao.setAttribute("aria-pressed", String(comparando));
  const complemento = document.createElement("span");
  complemento.className = "so-leitor";
  complemento.textContent = " " + capitalizar(pokemon.nome);
  botao.append("Comparar", complemento);
  return botao;
}

function criarImagem(pokemon, posicao) {
  const imagem = document.createElement("img");
  imagem.className = "card-imagem";
  imagem.src = pokemon.imagem;
  imagem.alt = ""; // decorativa: o nome do pokémon aparece em texto logo abaixo
  imagem.width = 200;
  imagem.height = 200;
  imagem.decoding = "async";
  // Os primeiros cards carregam já; os demais só quando chegam perto da tela.
  imagem.loading = posicao < CARDS_COM_PRIORIDADE ? "eager" : "lazy";
  return imagem;
}

function criarBarraHp(hp) {
  const bloco = document.createElement("div");
  bloco.className = "hp";

  const texto = document.createElement("span");
  texto.className = "hp-texto";
  texto.textContent = "HP " + hp;

  const barra = document.createElement("span");
  barra.className = "hp-barra";
  barra.setAttribute("aria-hidden", "true");
  const preenchimento = document.createElement("span");
  preenchimento.style.width = Math.min(100, (hp / HP_MAXIMO) * 100) + "%";
  barra.append(preenchimento);

  bloco.append(texto, barra);
  return bloco;
}

function criarDados(pokemon) {
  const lista = document.createElement("ul");
  lista.className = "dados";
  const informacoes = [
    ["Peso", formatarNumero(pokemon.peso) + " kg"],
    ["Altura", formatarNumero(pokemon.altura, 2) + " m"],
  ];
  for (const [rotulo, valor] of informacoes) {
    const item = document.createElement("li");
    const forte = document.createElement("strong");
    forte.textContent = rotulo;
    item.append(forte, valor);
    lista.append(item);
  }
  return lista;
}

/**
 * Cria o card de um pokémon.
 * @param {object} pokemon dados do pokémon ({ id, nome, hp, tipos, peso, altura, imagem })
 * @param {object} opcoes
 * @param {"galeria"|"favoritos"} opcoes.modo galeria mostra "Favoritar"; favoritos mostra "Remover"
 * @param {number} [opcoes.posicao] posição do card na lista (define o carregamento da imagem)
 * @param {boolean} [opcoes.favorito] se o pokémon já está nos favoritos (só no modo galeria)
 * @param {boolean} [opcoes.comparando] se o pokémon está escolhido para comparar (só no modo galeria)
 */
export function criarCard(pokemon, { modo, posicao = 99, favorito = false, comparando = false }) {
  const card = document.createElement("article");
  card.className = "card-pokemon tipo-" + pokemon.tipos[0];
  card.dataset.id = pokemon.id;

  const numero = document.createElement("span");
  numero.className = "numero";
  numero.textContent = "#" + String(pokemon.id).padStart(3, "0");

  const topo = document.createElement("div");
  topo.className = "card-topo";
  topo.append(numero, criarImagem(pokemon, posicao));

  if (totalEstatisticas(pokemon) >= TOTAL_PARA_SER_RARO && pokemon.estatisticas) {
    card.classList.add("raro");
    const selo = document.createElement("span");
    selo.className = "selo-raro";
    selo.textContent = "★ Raro";
    topo.append(selo);
  }

  // O nome é um botão: abre a janela de detalhes (funciona com teclado e leitor de tela).
  const nome = document.createElement("h2");
  const abrir = document.createElement("button");
  abrir.type = "button";
  abrir.className = "abrir-detalhes";
  abrir.textContent = capitalizar(pokemon.nome);
  abrir.setAttribute("aria-haspopup", "dialog");
  nome.append(abrir);

  const tipos = document.createElement("ul");
  tipos.className = "tipos";
  for (const tipo of pokemon.tipos) {
    const item = document.createElement("li");
    item.append(criarSeloTipo(tipo));
    tipos.append(item);
  }

  const botao = document.createElement("button");
  botao.type = "button";
  if (modo === "favoritos") {
    botao.className = "btn-remover";
    const complemento = document.createElement("span");
    complemento.className = "so-leitor";
    complemento.textContent = " " + capitalizar(pokemon.nome) + " dos favoritos";
    botao.append("Remover", complemento);
  } else {
    botao.className = "btn-favoritar";
    definirEstadoBotao(botao, favorito, pokemon.nome);
  }

  const acoes = document.createElement("div");
  acoes.className = "card-acoes";
  acoes.append(botao);
  if (modo !== "favoritos") acoes.append(criarBotaoComparar(pokemon, comparando));

  card.append(topo, nome, tipos, criarBarraHp(pokemon.hp), criarDados(pokemon), acoes);
  return card;
}
