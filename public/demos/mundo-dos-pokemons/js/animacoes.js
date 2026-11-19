// Animações de entrada: elementos aparecem quando chegam na tela e as barras de status enchem.
// Os efeitos são só CSS (transform e opacity, sem mexer no layout); aqui só marcamos quando começar.

const ATRASO_ENTRE_CARDS_S = 0.08;
const CARDS_POR_LINHA_PARA_ATRASO = 4;

const observador = new IntersectionObserver(
  (entradas) => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;
      entrada.target.classList.add("visivel");
      observador.unobserve(entrada.target); // anima uma vez só
    }
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
);

/**
 * Faz os elementos aparecerem (e as barras de status encherem) quando entrarem na tela.
 * @param {Iterable<HTMLElement>} elementos
 * @param {{ escalonar?: boolean }} [opcoes] escalonar: cards da mesma "linha" entram um depois do outro
 */
export function revelarAoRolar(elementos, { escalonar = false } = {}) {
  let posicao = 0;
  for (const elemento of elementos) {
    elemento.classList.add("revelar");
    if (escalonar) {
      const atraso = (posicao % CARDS_POR_LINHA_PARA_ATRASO) * ATRASO_ENTRE_CARDS_S;
      // Ordem das transições do .revelar: opacity, translate, transform, box-shadow (hover do card não atrasa)
      elemento.style.transitionDelay = `${atraso}s, ${atraso}s, 0s, 0s`;
      const barraHp = elemento.querySelector(".hp-barra span");
      if (barraHp) barraHp.style.transitionDelay = atraso + 0.25 + "s";
      posicao++;
    }
    observador.observe(elemento);
  }
}
