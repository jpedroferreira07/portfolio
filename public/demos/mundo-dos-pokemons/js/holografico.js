// Efeito de carta holográfica: o card inclina em 3D e um brilho segue o mouse.
// Só liga em telas com mouse (hover real) e para quem não pediu menos movimento nem pausou as animações;
// no toque e no teclado o card fica parado.

import { semMovimento } from "./util.js";

const MAX_INCLINACAO_GRAUS = 10;

const comMouse = window.matchMedia("(hover: hover) and (pointer: fine)");

/** Posição do mouse dentro do card, de 0 a 1 em cada direção. */
function posicaoNoCard(card, evento) {
  const caixa = card.getBoundingClientRect();
  return {
    x: Math.min(1, Math.max(0, (evento.clientX - caixa.left) / caixa.width)),
    y: Math.min(1, Math.max(0, (evento.clientY - caixa.top) / caixa.height)),
  };
}

function zerar(card) {
  card.style.removeProperty("transform");
  card.classList.remove("holografico");
}

/** Camada do ponto de luz: criada na primeira vez que o mouse passa pelo card. */
function brilhoDo(card) {
  let brilho = card.querySelector(".brilho-holografico");
  if (!brilho) {
    brilho = document.createElement("span");
    brilho.className = "brilho-holografico";
    brilho.setAttribute("aria-hidden", "true");
    card.append(brilho);
  }
  return brilho;
}

/**
 * Liga o efeito aos cards de uma lista (também aos que forem adicionados depois).
 * @param {HTMLElement} lista elemento que contém os cards
 */
export function ativarHolografico(lista) {
  let quadro = 0;
  let ultimoCard = null;

  lista.addEventListener("pointermove", (evento) => {
    if (!comMouse.matches || semMovimento() || evento.pointerType !== "mouse") return;
    const card = evento.target.closest(".card-pokemon");
    if (!card) return;

    cancelAnimationFrame(quadro); // uma atualização por quadro de tela, não uma por movimento
    quadro = requestAnimationFrame(() => {
      if (ultimoCard && ultimoCard !== card) zerar(ultimoCard);
      ultimoCard = card;
      const { x, y } = posicaoNoCard(card, evento);
      card.classList.add("holografico");
      const giroY = (x - 0.5) * 2 * MAX_INCLINACAO_GRAUS;
      const giroX = (0.5 - y) * 2 * MAX_INCLINACAO_GRAUS;
      card.style.transform = `perspective(900px) translateY(-6px) rotateX(${giroX}deg) rotateY(${giroY}deg)`;
      brilhoDo(card).style.background =
        `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgb(255, 255, 255, 0.75), transparent 45%)`;
    });
  });

  lista.addEventListener("pointerout", (evento) => {
    const card = evento.target.closest(".card-pokemon");
    if (!card || card.contains(evento.relatedTarget)) return;
    cancelAnimationFrame(quadro);
    zerar(card);
  });
}
