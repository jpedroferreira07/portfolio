/**
 * =============================================================================
 * ARQUIVO   : entrada.js
 * PROJETO   : Pizzaria dos Sete Mares
 * DESCRIÇÃO : Script MINÚSCULO, carregado no <head> (de forma bloqueante, sem
 *             "defer") para rodar ANTES da página ser desenhada. Ele só
 *             coloca atributos no elemento <html>, assim o CSS já nasce no
 *             estado certo e a tela não "pisca".
 *
 * O QUE FAZ
 *   1. Preferência "Pausar animações": se a pessoa pausou as animações em uma
 *      visita anterior, aplica data-animacoes="pausadas" em <html>.
 *   2. Chegada da transição de página: se a página anterior marcou, no
 *      sessionStorage, que o navio estava navegando, adiciona a classe
 *      "chegando" e o atributo data-direcao ("ltr" ou "rtl") em <html>.
 *      O CSS usa isso para continuar a animação do navio (veja style.css,
 *      seção 9, e script.js, seção 7.2).
 *
 * POR QUE É UM ARQUIVO À PARTE (e não um <script> dentro do HTML)?
 *   A política de segurança de conteúdo (CSP) do site só permite scripts do
 *   próprio site ('self'). Script inline exigiria liberar 'unsafe-inline',
 *   o que enfraquece a proteção contra XSS.
 * =============================================================================
 */
(function () {
  "use strict";

  const raiz = document.documentElement;
  const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- 1. Preferência de pausar as animações ----------------------------
  try {
    if (localStorage.getItem("pp-animacoes") === "pausadas") {
      raiz.dataset.animacoes = "pausadas";
    }
  } catch (erro) {
    // localStorage bloqueado: as animações seguem ligadas.
  }

  // ---- 2. Chegada da transição de página ---------------------------------
  try {
    const direcao = sessionStorage.getItem("pp-trans"); // "ltr" (esq→dir) ou "rtl" (dir→esq)
    sessionStorage.removeItem("pp-trans");              // usa uma vez só

    // Só aceita valores conhecidos (nunca confie em texto vindo do storage) e
    // só anima se a pessoa não pediu menos movimento nem pausou as animações.
    const animacoesLigadas = !semMovimento && raiz.dataset.animacoes !== "pausadas";
    if ((direcao === "ltr" || direcao === "rtl") && animacoesLigadas) {
      raiz.classList.add("chegando");
      raiz.dataset.direcao = direcao;
    }
  } catch (erro) {
    // sessionStorage bloqueado (modo privado, política do navegador): sem transição.
  }
})();
