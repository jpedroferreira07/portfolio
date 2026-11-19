// Partes comuns a todas as páginas: contador de favoritos e data do rodapé.
import { atualizarContador } from "./armazenamento.js";
import "./pausar.js";
import "./progresso.js";
import { carregarMovimento } from "./carregar-movimento.js";
import "./topo.js";
import "./transicao.js";
import { capitalizar } from "./util.js";

/** Escreve a data de hoje no rodapé, ex.: "Segunda-feira, 2 de novembro de 2026". */
function mostrarData() {
  const elemento = document.getElementById("data-atual");
  if (!elemento) return;
  const texto = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  elemento.textContent = capitalizar(texto);
  elemento.dateTime = new Date().toISOString().slice(0, 10);
}

/** Atualiza o ano do copyright, para não precisar mexer no HTML todo ano. */
function mostrarAno() {
  for (const elemento of document.querySelectorAll(".ano-atual")) {
    elemento.textContent = new Date().getFullYear();
  }
}

mostrarData();
mostrarAno();
atualizarContador();
carregarMovimento();
