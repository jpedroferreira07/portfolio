// Janela de detalhes de um pokémon: status, habilidades, linha de evolução, versão shiny e grito.
// A janela é um <dialog> nativo (foco preso dentro dela, Esc fecha), criado na primeira vez que é aberta.
import { carregarDetalhes, carregarPokemon, urlGrito, urlImagem } from "./api.js";
import { ESTATISTICAS, IMAGEM_PADRAO, totalEstatisticas } from "./dados.js";
import { criarSeloTipo } from "./cartas.js";
import { capitalizar, criarElemento as criar, formatarNumero } from "./util.js";

const GRITO_DISPONIVEL_ATE_ID = 1025; // depois disso (formas especiais) não há áudio
const STATUS_MAXIMO = 255;

let janela = null;
let abertoPor = null; // elemento que abriu a janela, para devolver o foco ao fechar
let pokemonAberto = null;
let aoMudarAberto = () => {};

/** Troca a imagem por uma de reserva se ela não existir (ex.: shiny de algumas formas). */
function imagemComReserva(url, alt) {
  const imagem = criar("img");
  imagem.src = url;
  imagem.alt = alt;
  imagem.width = 240;
  imagem.height = 240;
  imagem.decoding = "async";
  imagem.addEventListener("error", () => {
    if (!imagem.src.endsWith(IMAGEM_PADRAO)) imagem.src = IMAGEM_PADRAO;
  });
  return imagem;
}

function criarJanela() {
  const dialogo = criar("dialog", "janela");
  dialogo.setAttribute("aria-labelledby", "detalhes-titulo");

  const fechar = criar("button", "janela-fechar");
  fechar.type = "button";
  fechar.setAttribute("aria-label", "Fechar detalhes");
  fechar.innerHTML = '<svg class="icone" aria-hidden="true" focusable="false"><use href="#i-fechar"/></svg>';
  fechar.addEventListener("click", () => dialogo.close());

  dialogo.append(fechar, criar("div", "janela-conteudo"));
  dialogo.addEventListener("click", (evento) => {
    if (evento.target === dialogo) dialogo.close(); // clicar fora (no fundo escuro) fecha
  });
  dialogo.addEventListener("close", () => {
    pokemonAberto = null;
    aoMudarAberto(null);
    if (abertoPor?.isConnected) abertoPor.focus();
  });
  document.body.append(dialogo);
  return dialogo;
}

function criarBarraStatus(rotulo, valor) {
  const linha = criar("div", "status-linha-barra");
  const nome = criar("span", "status-nome", rotulo);
  const numero = criar("span", "status-valor", String(valor));
  const trilho = criar("span", "status-trilho");
  trilho.setAttribute("aria-hidden", "true");
  const preenchimento = criar("span", "status-preenchimento");
  preenchimento.style.width = Math.min(100, (valor / STATUS_MAXIMO) * 100) + "%";
  trilho.append(preenchimento);
  linha.append(nome, numero, trilho);
  return linha;
}

function criarEvolucao(evolucao, idAtual) {
  const secao = criar("section", "detalhes-secao");
  secao.append(criar("h3", "", "Linha de evolução"));
  if (evolucao.length <= 1) {
    secao.append(criar("p", "detalhes-nota", "Este pokémon não evolui."));
    return secao;
  }

  const lista = criar("ol", "evolucao");
  for (const etapa of evolucao) {
    const item = criar("li", "evolucao-etapa");
    for (const especie of etapa) {
      const ficha = criar("span", "evolucao-ficha" + (especie.id === idAtual ? " atual" : ""));
      ficha.append(imagemComReserva(urlImagem(especie.id), ""), criar("span", "", capitalizar(especie.nome)));
      item.append(ficha);
    }
    lista.append(item);
  }
  secao.append(lista);
  return secao;
}

function criarBotaoGrito(id) {
  const reprodutor = new Audio();
  const suporta = reprodutor.canPlayType('audio/ogg; codecs="vorbis"') !== "";
  if (!suporta || id > GRITO_DISPONIVEL_ATE_ID) return null;

  const botao = criar("button", "botao botao-secundario", "Ouvir o grito");
  botao.type = "button";
  botao.addEventListener("click", () => {
    reprodutor.src = urlGrito(id);
    reprodutor.volume = 0.6;
    reprodutor.play().catch(() => {});
  });
  return botao;
}

/** Monta o conteúdo da janela. `extras` (habilidades e evolução) chega depois, em outra requisição. */
function mostrarPokemon(pokemon, extras) {
  const conteudo = janela.querySelector(".janela-conteudo");
  conteudo.className = "janela-conteudo tipo-" + pokemon.tipos[0];

  const nome = capitalizar(pokemon.nome);
  const titulo = criar("h2", "", nome);
  titulo.id = "detalhes-titulo";
  const numero = criar("span", "numero", "#" + String(pokemon.id).padStart(3, "0"));

  const arte = criar("div", "detalhes-arte");
  let shiny = false;
  const mostrarArte = () => {
    arte.replaceChildren(imagemComReserva(urlImagem(pokemon.id, shiny), "Arte " + (shiny ? "shiny " : "") + "de " + nome));
  };
  mostrarArte();

  const acoes = criar("div", "detalhes-acoes");
  const botaoShiny = criar("button", "botao botao-secundario", "Ver versão shiny");
  botaoShiny.type = "button";
  botaoShiny.setAttribute("aria-pressed", "false");
  botaoShiny.addEventListener("click", () => {
    shiny = !shiny;
    botaoShiny.setAttribute("aria-pressed", String(shiny));
    botaoShiny.textContent = shiny ? "Ver versão normal" : "Ver versão shiny";
    mostrarArte();
  });
  acoes.append(botaoShiny);
  const botaoGrito = criarBotaoGrito(pokemon.id);
  if (botaoGrito) acoes.append(botaoGrito);

  const tipos = criar("ul", "tipos");
  for (const tipo of pokemon.tipos) {
    const item = criar("li");
    item.append(criarSeloTipo(tipo));
    tipos.append(item);
  }

  const lateral = criar("div", "detalhes-lateral");
  lateral.append(numero, titulo, tipos, arte, acoes);

  const status = criar("section", "detalhes-secao");
  status.append(criar("h3", "", "Status"));
  if (pokemon.estatisticas) {
    for (const [chave, rotulo] of Object.entries(ESTATISTICAS)) {
      status.append(criarBarraStatus(rotulo, pokemon.estatisticas[chave]));
    }
    status.append(criar("p", "detalhes-total", "Total: " + totalEstatisticas(pokemon)));
  } else {
    status.append(criarBarraStatus("HP", pokemon.hp));
  }

  const medidas = criar("section", "detalhes-secao");
  medidas.append(criar("h3", "", "Medidas"));
  const lista = criar("dl", "medidas");
  for (const [rotulo, valor] of [
    ["Peso", formatarNumero(pokemon.peso) + " kg"],
    ["Altura", formatarNumero(pokemon.altura, 2) + " m"],
  ]) {
    const bloco = criar("div");
    bloco.append(criar("dt", "", rotulo), criar("dd", "", valor));
    lista.append(bloco);
  }
  medidas.append(lista);

  const principal = criar("div", "detalhes-principal");
  principal.append(status, medidas);

  if (extras) {
    const habilidades = criar("section", "detalhes-secao");
    habilidades.append(criar("h3", "", "Habilidades"));
    const itens = criar("ul", "habilidades");
    for (const habilidade of extras.habilidades) {
      itens.append(criar("li", "", capitalizar(habilidade.replaceAll("-", " "))));
    }
    habilidades.append(itens);
    principal.append(habilidades, criarEvolucao(extras.evolucao, pokemon.id));
  } else {
    principal.append(criar("p", "detalhes-nota", "Carregando habilidades e evolução..."));
  }

  conteudo.replaceChildren(lateral, principal);
}

/**
 * Abre a janela de um pokémon.
 * @param {object} pokemon dados do pokémon (os antigos dos favoritos, sem status, também servem)
 * @param {HTMLElement|null} quemAbriu elemento que recebe o foco de volta ao fechar
 */
export async function abrirDetalhes(pokemon, quemAbriu = null) {
  janela ??= criarJanela();
  abertoPor = quemAbriu;
  pokemonAberto = pokemon.id;
  aoMudarAberto(pokemon.id);

  mostrarPokemon(pokemon, null);
  if (!janela.open) janela.showModal();

  try {
    const completo = pokemon.estatisticas ? pokemon : ((await carregarPokemon(pokemon.id)) ?? pokemon);
    const extras = await carregarDetalhes(pokemon.id);
    if (pokemonAberto === pokemon.id) mostrarPokemon(completo, extras);
  } catch (erro) {
    console.error("Não foi possível carregar os detalhes:", erro);
    if (pokemonAberto === pokemon.id) {
      janela.querySelector(".detalhes-nota")?.replaceChildren("Não foi possível carregar os detalhes agora.");
    }
  }
}

/** Avisa quando a janela abre (com o número) ou fecha (null); usado para guardar o ?pokemon= no endereço. */
export function aoMudarDetalhes(funcao) {
  aoMudarAberto = funcao;
}

/**
 * Liga o clique nos cards de uma lista: o nome (botão) e a imagem abrem a janela.
 * @param {HTMLElement} lista elemento que contém os cards
 * @param {(id: number) => object|undefined} buscarPokemon devolve os dados do pokémon pelo número
 */
export function ligarDetalhes(lista, buscarPokemon) {
  lista.addEventListener("click", (evento) => {
    const gatilho = evento.target.closest(".abrir-detalhes, .card-topo");
    if (!gatilho) return;
    const pokemon = buscarPokemon(Number(gatilho.closest(".card-pokemon").dataset.id));
    if (pokemon) abrirDetalhes(pokemon, gatilho.closest(".card-pokemon").querySelector(".abrir-detalhes"));
  });
}
