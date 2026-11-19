// Botão do cabeçalho que pausa todas as animações do site (WCAG 2.2.2: movimento que a pessoa controla).
// A escolha fica salva no navegador e é aplicada por js/entrada.js antes da página aparecer.
import { anunciar } from "./util.js";

const botao = document.getElementById("botao-pausar");

function estaPausado() {
  return document.documentElement.dataset.animacoes === "pausadas";
}

/** Deixa o botão igual ao estado: pressionado e com o ícone de "tocar" quando está pausado. */
function mostrarEstado() {
  const pausado = estaPausado();
  botao.setAttribute("aria-pressed", String(pausado));
  botao.title = pausado ? "Animações pausadas (clique para ativar)" : "Pausar animações";
  botao.querySelector("use").setAttribute("href", pausado ? "#i-tocar" : "#i-pausar");
}

function alternar() {
  if (estaPausado()) {
    delete document.documentElement.dataset.animacoes;
    anunciar("Animações ativadas");
  } else {
    document.documentElement.dataset.animacoes = "pausadas";
    anunciar("Animações pausadas");
  }
  try {
    localStorage.setItem("animacoesPausadas", estaPausado() ? "1" : "0");
  } catch {
    // Sem permissão para guardar: vale só nesta página.
  }
  mostrarEstado();
  // Avisa js/movimento.js para ligar ou desligar o movimento na hora
  document.dispatchEvent(new CustomEvent("animacoes:alteradas"));
}

if (botao) {
  botao.addEventListener("click", alternar);
  mostrarEstado();
}
