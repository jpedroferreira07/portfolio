// Troca de página com uma Master Ball: ao clicar em um link do site, as duas metades da bola (roxa em cima,
// branca embaixo) se fecham sobre a tela; na página nova, elas se abrem e mostram o conteúdo.
//
// As animações são só CSS (transform), então rodam fora da thread principal e continuam suaves mesmo com a
// página nova carregando por trás. Nenhuma biblioteca é necessária aqui.
//   - Fechar: este script cria .cortina e espera a animação terminar antes de trocar de página.
//   - Abrir: o js/entrada.js põe a classe "chegando" no <html> antes de a página aparecer; o CSS desenha a bola
//     fechada e a abre sozinho. Aqui só se limpa a classe no fim e se avisa as páginas (aposCortina).
import { criarElemento as criar, semMovimento } from "./util.js";

const TEMPO_PARA_FECHAR_MS = 460;
const TEMPO_PARA_ABRIR_MS = 950;
const raiz = document.documentElement;

/** Monta a cortina: a metade de cima e a de baixo da bola (o CSS faz elas descerem). */
function criarCortina() {
  const cortina = criar("div", "cortina");
  cortina.setAttribute("aria-hidden", "true");
  cortina.append(criar("div", "cortina-cima"), criar("div", "cortina-baixo"));
  document.body.append(cortina);
}

function terminarAbertura() {
  if (!raiz.classList.contains("chegando")) return;
  raiz.classList.remove("chegando");
  window.dispatchEvent(new Event("cortina:aberta"));
}

/**
 * Espera a Master Ball terminar de abrir (se a página chegou por ela). As páginas usam isso para só começar
 * o trabalho pesado (carregar listas, desenhar cards) depois da animação, que assim não engasga.
 */
export function aposCortina() {
  return new Promise((resolver) => {
    if (!raiz.classList.contains("chegando")) {
      resolver();
      return;
    }
    window.addEventListener("cortina:aberta", () => resolver(), { once: true });
    setTimeout(resolver, TEMPO_PARA_ABRIR_MS + 400); // garantia: nunca fica esperando para sempre
  });
}

/** É um clique simples em um link para outra página do próprio site? */
function ehNavegacaoInterna(evento, link) {
  if (evento.defaultPrevented || evento.button !== 0) return false;
  if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return false;
  if (link.target && link.target !== "_self") return false;
  if (link.hasAttribute("download")) return false;
  const destino = new URL(link.href, location.href);
  if (destino.origin !== location.origin) return false;
  return destino.pathname !== location.pathname || destino.search !== location.search;
}

document.addEventListener("click", (evento) => {
  const link = evento.target.closest("a[href]");
  if (!link || semMovimento() || !ehNavegacaoInterna(evento, link)) return;
  evento.preventDefault();
  criarCortina();
  try {
    sessionStorage.setItem("cortinaTransicao", "1");
  } catch {
    // Sem armazenamento: a página nova só não faz a abertura da cortina.
  }
  setTimeout(() => {
    location.href = link.href;
  }, TEMPO_PARA_FECHAR_MS);
});

// Voltar pelo botão do navegador pode trazer a página de um cache: tira a cortina que ficou na tela.
window.addEventListener("pageshow", (evento) => {
  if (!evento.persisted) return;
  document.querySelector(".cortina")?.remove();
  terminarAbertura();
});

if (raiz.classList.contains("chegando")) setTimeout(terminarAbertura, TEMPO_PARA_ABRIR_MS);
