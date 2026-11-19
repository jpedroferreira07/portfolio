// Carrega o movimento (GSAP, Lenis e os efeitos das páginas) só DEPOIS de a página aparecer e ficar ociosa,
// para as bibliotecas não atrasarem a primeira tela nem travarem a página enquanto ela abre.
// Quem pediu menos movimento no sistema (ou pausou as animações) nem baixa essas bibliotecas.
import { semMovimento } from "./util.js";

let modulo = null;

function quandoOciosa(funcao) {
  const iniciar = () => {
    if ("requestIdleCallback" in window) requestIdleCallback(funcao, { timeout: 2000 });
    else setTimeout(funcao, 300);
  };
  if (document.readyState === "complete") iniciar();
  else window.addEventListener("load", iniciar, { once: true });
}

/**
 * Carrega o movimento quando a página estiver pronta e então chama `registrar` com o módulo,
 * para a página adicionar os efeitos dela.
 * @param {(movimento: typeof import("./movimento.js")) => unknown} [registrar]
 */
export function carregarMovimento(registrar) {
  if (semMovimento()) {
    // Se a pessoa reativar as animações depois, aí sim carrega
    document.addEventListener("animacoes:alteradas", () => carregarMovimento(registrar), { once: true });
    return;
  }
  quandoOciosa(async () => {
    modulo ??= import("./movimento.js");
    const movimento = await modulo;
    await registrar?.(movimento);
  });
}
