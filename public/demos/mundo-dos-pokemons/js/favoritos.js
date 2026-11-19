// Página Favoritos: lista salva, resumo estilo carrinho e botão de remover.
import "./layout.js";
import { carregarMovimento } from "./carregar-movimento.js";
import { revelarAoRolar } from "./animacoes.js";
import { lerFavoritos, salvarFavoritos } from "./armazenamento.js";
import { criarCard, criarSeloTipo } from "./cartas.js";
import { ligarDetalhes } from "./detalhes.js";
import { ativarHolografico } from "./holografico.js";
import { anunciar, capitalizar, formatarNumero } from "./util.js";

carregarMovimento((movimento) => movimento.entradaDoTopo(".titulo-pagina"));

const listaFavoritos = document.getElementById("lista-favoritos");
const resumo = document.querySelector(".resumo");
const mensagemVazia = document.getElementById("vazio");

/** Média de uma propriedade numérica dos favoritos. */
function media(lista, propriedade) {
  const soma = lista.reduce((total, p) => total + p[propriedade], 0);
  return soma / lista.length;
}

/** Médias de peso, altura e HP, mais a lista dos tipos dos escolhidos. */
function montarResumo(favoritos) {
  document.getElementById("resumo-total").textContent = favoritos.length;
  document.getElementById("media-peso").textContent = formatarNumero(media(favoritos, "peso")) + " kg";
  document.getElementById("media-altura").textContent = formatarNumero(media(favoritos, "altura"), 2) + " m";
  document.getElementById("media-hp").textContent = formatarNumero(media(favoritos, "hp"));

  const contagem = {};
  for (const pokemon of favoritos) {
    for (const tipo of pokemon.tipos) contagem[tipo] = (contagem[tipo] || 0) + 1;
  }

  const itens = Object.entries(contagem).map(([tipo, quantidade]) => {
    const item = document.createElement("li");
    const selo = criarSeloTipo(tipo);
    selo.textContent += " (" + quantidade + ")";
    item.append(selo);
    return item;
  });
  document.getElementById("lista-tipos-resumo").replaceChildren(...itens);
}

/** Desenha os cards e o resumo a partir do que está salvo no navegador. */
function mostrarFavoritos() {
  const favoritos = lerFavoritos();
  const cards = favoritos.map((p, i) => criarCard(p, { modo: "favoritos", posicao: i }));
  listaFavoritos.replaceChildren(...cards);
  revelarAoRolar(cards, { escalonar: true });

  const temFavoritos = favoritos.length > 0;
  resumo.hidden = !temFavoritos;
  mensagemVazia.hidden = temFavoritos;
  if (temFavoritos) montarResumo(favoritos);
}

listaFavoritos.addEventListener("click", (evento) => {
  const botao = evento.target.closest(".btn-remover");
  if (!botao) return;

  const card = botao.closest(".card-pokemon");
  const id = Number(card.dataset.id);
  const posicao = [...listaFavoritos.children].indexOf(card);
  const removido = lerFavoritos().find((f) => f.id === id);

  salvarFavoritos(lerFavoritos().filter((f) => f.id !== id));
  mostrarFavoritos();
  if (removido) anunciar(capitalizar(removido.nome) + " removido dos favoritos");

  // O card removido sumiu: o foco vai para o botão do próximo card (ou do anterior).
  const botoes = listaFavoritos.querySelectorAll(".btn-remover");
  const proximo = botoes[Math.min(posicao, botoes.length - 1)];
  if (proximo) proximo.focus();
  else document.querySelector("#vazio a").focus();
});

ligarDetalhes(listaFavoritos, (id) => lerFavoritos().find((p) => p.id === id));
ativarHolografico(listaFavoritos);
mostrarFavoritos();
