// Comparar dois pokémons lado a lado. A escolha fica no sessionStorage (vale só enquanto a aba está aberta).
import { ESTATISTICAS, IMAGEM_PADRAO, totalEstatisticas } from "./dados.js";
import { anunciar, capitalizar, criarElemento as criar } from "./util.js";

const CHAVE = "pokemonsParaComparar";
const MAXIMO = 2;
const STATUS_MAXIMO = 255;

let escolhidos = lerEscolhidos(); // números dos pokémons escolhidos, o mais antigo primeiro
let buscarPokemon = () => undefined;
let aoMudar = () => {};
let bandeja = null;
let janela = null;

function lerEscolhidos() {
  try {
    const lista = JSON.parse(sessionStorage.getItem(CHAVE));
    if (!Array.isArray(lista)) return [];
    return [...new Set(lista.filter((id) => Number.isInteger(id) && id > 0))].slice(-MAXIMO);
  } catch {
    return [];
  }
}

function salvarEscolhidos() {
  try {
    sessionStorage.setItem(CHAVE, JSON.stringify(escolhidos));
  } catch {
    // Sem permissão para guardar: a comparação funciona do mesmo jeito, só não sobrevive a recarregar.
  }
}

export const estaComparando = (id) => escolhidos.includes(id);

/** Escolhe ou tira um pokémon da comparação. Se já houver dois, o mais antigo sai. */
export function alternarComparacao(pokemon) {
  const nome = capitalizar(pokemon.nome);
  if (escolhidos.includes(pokemon.id)) {
    escolhidos = escolhidos.filter((id) => id !== pokemon.id);
    anunciar(nome + " saiu da comparação");
  } else {
    escolhidos = [...escolhidos, pokemon.id].slice(-MAXIMO);
    anunciar(nome + " entrou na comparação");
  }
  salvarEscolhidos();
  atualizarBandeja();
  aoMudar();
}

function criarBarra(valor) {
  const trilho = criar("span", "status-trilho");
  trilho.setAttribute("aria-hidden", "true");
  const preenchimento = criar("span", "status-preenchimento");
  preenchimento.style.width = Math.min(100, (valor / STATUS_MAXIMO) * 100) + "%";
  trilho.append(preenchimento);
  return trilho;
}

function celulaDeValor(valor, vence) {
  const celula = criar("td", vence ? "vence" : "");
  celula.append(criar("span", "status-valor", String(valor)), criarBarra(valor));
  if (vence) celula.append(criar("span", "so-leitor", " (maior)"));
  return celula;
}

function montarComparacao(a, b) {
  const nomeA = capitalizar(a.nome);
  const nomeB = capitalizar(b.nome);

  const cabecalho = criar("tr");
  cabecalho.append(criar("th", "", "Status"), criar("th", "", nomeA), criar("th", "", nomeB));

  const linhas = [];
  let vitoriasA = 0;
  let vitoriasB = 0;
  for (const [chave, rotulo] of Object.entries(ESTATISTICAS)) {
    const valorA = a.estatisticas[chave];
    const valorB = b.estatisticas[chave];
    if (valorA > valorB) vitoriasA++;
    if (valorB > valorA) vitoriasB++;
    const linha = criar("tr");
    linha.append(criar("th", "", rotulo), celulaDeValor(valorA, valorA > valorB), celulaDeValor(valorB, valorB > valorA));
    linhas.push(linha);
  }

  const totalA = totalEstatisticas(a);
  const totalB = totalEstatisticas(b);
  const linhaTotal = criar("tr", "total");
  linhaTotal.append(criar("th", "", "Total"), celulaDeValor(totalA, totalA > totalB), celulaDeValor(totalB, totalB > totalA));

  const tabela = criar("table", "tabela-comparacao");
  tabela.append(criar("caption", "so-leitor", "Status de " + nomeA + " e " + nomeB));
  tabela.append(criar("thead"), criar("tbody"));
  tabela.tHead.append(cabecalho);
  tabela.tBodies[0].append(...linhas, linhaTotal);

  const arte = criar("div", "comparacao-artes");
  for (const pokemon of [a, b]) {
    const imagem = criar("img");
    imagem.src = pokemon.imagem;
    imagem.alt = "";
    imagem.width = 160;
    imagem.height = 160;
    imagem.addEventListener("error", () => {
      if (!imagem.src.endsWith(IMAGEM_PADRAO)) imagem.src = IMAGEM_PADRAO;
    });
    arte.append(imagem);
  }

  const porStatus =
    vitoriasA === vitoriasB
      ? "Empate: cada um vence em " + vitoriasA + " status."
      : capitalizar((vitoriasA > vitoriasB ? a : b).nome) + " vence em " + Math.max(vitoriasA, vitoriasB) + " de 6 status.";
  const porTotal =
    totalA === totalB
      ? " Os dois têm o mesmo total (" + totalA + ")."
      : " " + (totalA > totalB ? nomeA : nomeB) + " tem o maior total (" + Math.max(totalA, totalB) + ").";
  const resumo = porStatus + porTotal;

  const titulo = criar("h2", "", nomeA + " x " + nomeB);
  titulo.id = "comparar-titulo";
  janela.querySelector(".janela-conteudo").replaceChildren(titulo, arte, tabela, criar("p", "detalhes-total", resumo));
}

function abrirComparacao() {
  const [a, b] = escolhidos.map((id) => buscarPokemon(id));
  if (!a?.estatisticas || !b?.estatisticas) return;

  if (!janela) {
    janela = criar("dialog", "janela janela-comparar");
    janela.setAttribute("aria-labelledby", "comparar-titulo");
    const fechar = criar("button", "janela-fechar");
    fechar.type = "button";
    fechar.setAttribute("aria-label", "Fechar comparação");
    fechar.innerHTML = '<svg class="icone" aria-hidden="true" focusable="false"><use href="#i-fechar"/></svg>';
    fechar.addEventListener("click", () => janela.close());
    janela.append(fechar, criar("div", "janela-conteudo comparacao"));
    janela.addEventListener("click", (evento) => {
      if (evento.target === janela) janela.close();
    });
    janela.addEventListener("close", () => bandeja.querySelector(".comparar-abrir").focus());
    document.body.append(janela);
  }
  montarComparacao(a, b);
  janela.showModal();
}

/** Atualiza a bandeja fixa no rodapé: quem foi escolhido e se já dá para comparar. */
function atualizarBandeja() {
  const prontos = escolhidos.map((id) => buscarPokemon(id)).filter(Boolean);
  bandeja.hidden = escolhidos.length === 0;

  const nomes = prontos.map((p) => capitalizar(p.nome));
  bandeja.querySelector(".comparar-texto").textContent =
    escolhidos.length === 1
      ? nomes[0] + " escolhido. Escolha mais um para comparar."
      : nomes.join(" x ");
  bandeja.querySelector(".comparar-abrir").disabled = escolhidos.length < MAXIMO;
}

function criarBandeja() {
  bandeja = criar("div", "bandeja-comparar");
  bandeja.setAttribute("role", "region");
  bandeja.setAttribute("aria-label", "Comparação de pokémons");

  const abrir = criar("button", "botao comparar-abrir", "Comparar");
  abrir.type = "button";
  abrir.addEventListener("click", abrirComparacao);

  const limpar = criar("button", "botao botao-secundario", "Limpar");
  limpar.type = "button";
  limpar.addEventListener("click", () => {
    escolhidos = [];
    salvarEscolhidos();
    atualizarBandeja();
    aoMudar();
    anunciar("Comparação limpa");
  });

  bandeja.append(criar("span", "comparar-texto"), abrir, limpar);
  document.body.append(bandeja);
}

/**
 * Liga a comparação à galeria.
 * @param {(id: number) => object|undefined} buscar devolve o pokémon (com status) pelo número
 * @param {() => void} aoMudarSelecao chamado quando a escolha muda (para atualizar os botões dos cards)
 */
export function iniciarComparacao(buscar, aoMudarSelecao) {
  buscarPokemon = buscar;
  aoMudar = aoMudarSelecao;
  criarBandeja();
  atualizarBandeja();
}

/** Chamar quando novos pokémons chegarem: a bandeja mostra os nomes assim que eles existem. */
export function atualizarComparacao() {
  if (bandeja) atualizarBandeja();
}
