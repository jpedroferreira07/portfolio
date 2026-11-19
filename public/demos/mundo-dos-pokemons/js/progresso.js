// Barra de progresso de leitura no topo da tela e cabeçalho que ganha sombra mais forte ao rolar.
// Não depende de biblioteca e lê a posição a cada rolagem, então continua certa mesmo quando a
// galeria acrescenta mais cards no fim da página.
import { criarElemento as criar } from "./util.js";

const barra = criar("div", "progresso-leitura");
barra.setAttribute("aria-hidden", "true");
document.body.prepend(barra);

const cabecalho = document.querySelector(".header-site");
let quadro = 0;

function atualizar() {
  quadro = 0;
  const rolado = window.scrollY;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  barra.style.transform = `scaleX(${total > 0 ? Math.min(1, Math.max(0, rolado / total)) : 0})`;
  cabecalho?.classList.toggle("rolou", rolado > 12);
}

function aoRolar() {
  if (!quadro) quadro = requestAnimationFrame(atualizar);
}

window.addEventListener("scroll", aoRolar, { passive: true });
window.addEventListener("resize", aoRolar);
aoRolar();
