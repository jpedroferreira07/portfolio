// Animação de captura: ao favoritar, o pokémon é "sugado" por uma pokébola que voa até o contador
// do cabeçalho, balança três vezes e fecha com um estalo de estrelinhas.
// Usa a Web Animations API só com transform, opacity e filter (não mexe no layout da página).
import { criarElemento as criar, semMovimento } from "./util.js";

const TAMANHO_BOLA = 56;
const ESTRELAS = 7;

/** Centro de um elemento na tela. */
function centro(elemento) {
  const caixa = elemento.getBoundingClientRect();
  return { x: caixa.left + caixa.width / 2, y: caixa.top + caixa.height / 2, largura: caixa.width };
}

/** Posiciona um elemento fixo com o centro em (x, y). */
function colocar(elemento, x, y, tamanho) {
  elemento.style.left = x - tamanho / 2 + "px";
  elemento.style.top = y - tamanho / 2 + "px";
  elemento.style.width = tamanho + "px";
  elemento.style.height = tamanho + "px";
}

function criarPokebola() {
  const bola = criar("div", "pokebola-captura");
  bola.setAttribute("aria-hidden", "true");
  return bola;
}

/** Estrelinhas que saem do ponto (x, y) em todas as direções e somem. */
function estalo(x, y) {
  const animacoes = [];
  for (let i = 0; i < ESTRELAS; i++) {
    const estrela = criar("span", "estrela-captura", "✦");
    estrela.setAttribute("aria-hidden", "true");
    estrela.style.left = x - 8 + "px";
    estrela.style.top = y - 8 + "px";
    document.body.append(estrela);

    const angulo = (i / ESTRELAS) * Math.PI * 2;
    const distancia = 34 + (i % 3) * 10;
    const animacao = estrela.animate(
      [
        { transform: "translate(0, 0) scale(0.4)", opacity: 1 },
        { transform: `translate(${Math.cos(angulo) * distancia}px, ${Math.sin(angulo) * distancia}px) scale(1.2)`, opacity: 0 },
      ],
      { duration: 550, easing: "ease-out", fill: "forwards" },
    );
    animacao.finished.then(() => estrela.remove());
    animacoes.push(animacao.finished);
  }
  return Promise.all(animacoes);
}

/** O número do contador dá um pulinho. */
function pularContador() {
  const contador = document.querySelector(".contador-favoritos");
  contador?.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.6)" }, { transform: "scale(1)" }],
    { duration: 350, easing: "ease-out" },
  );
}

/**
 * Captura: a imagem do pokémon vira luz, entra na pokébola, que voa até o contador e balança.
 * @param {HTMLImageElement} imagem imagem do card (de onde o pokémon sai)
 */
export async function capturar(imagem) {
  const contador = document.querySelector(".contador-favoritos");
  if (semMovimento() || !contador || !imagem.isConnected) {
    pularContador();
    return;
  }

  const origem = centro(imagem);
  const destino = centro(contador);

  // 1. Pokébola aparece onde estava o pokémon e a imagem (um clone) vira luz e entra nela.
  const bola = criarPokebola();
  colocar(bola, origem.x, origem.y, TAMANHO_BOLA);
  const clone = imagem.cloneNode();
  clone.className = "clone-captura";
  colocar(clone, origem.x, origem.y, origem.largura);
  document.body.append(bola, clone);

  const entrada = bola.animate(
    [{ transform: "scale(0)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }],
    { duration: 220, easing: "ease-out", fill: "forwards" },
  );
  const sugado = clone.animate(
    [
      { transform: "scale(1)", filter: "brightness(1)", opacity: 1 },
      { transform: "scale(0.15)", filter: "brightness(4) sepia(1) hue-rotate(-30deg) saturate(6)", opacity: 0 },
    ],
    { duration: 450, easing: "ease-in", fill: "forwards" },
  );
  await Promise.all([entrada.finished, sugado.finished]);
  clone.remove();

  // 2. A pokébola voa em arco até o contador do cabeçalho.
  const dx = destino.x - origem.x;
  const dy = destino.y - origem.y;
  const voo = bola.animate(
    [
      { transform: "translate(0, 0) scale(1)" },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 90}px) scale(1.15)`, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.7)` },
    ],
    { duration: 600, easing: "ease-in-out", fill: "forwards" },
  );
  await voo.finished;

  // 3. Balança três vezes e fecha com um estalo.
  const balanco = bola.animate(
    [
      { transform: `translate(${dx}px, ${dy}px) scale(0.7) rotate(0deg)` },
      { transform: `translate(${dx}px, ${dy}px) scale(0.7) rotate(-22deg)` },
      { transform: `translate(${dx}px, ${dy}px) scale(0.7) rotate(22deg)` },
      { transform: `translate(${dx}px, ${dy}px) scale(0.7) rotate(0deg)` },
    ],
    { duration: 420, iterations: 3, easing: "ease-in-out", fill: "forwards" },
  );
  await balanco.finished;

  pularContador();
  const fim = estalo(destino.x, destino.y);
  await bola.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: "forwards" }).finished;
  bola.remove();
  await fim;
}

/** Soltar: um clarão rápido na imagem do card e estrelinhas, como quando a pokébola se abre. */
export async function soltar(imagem) {
  if (semMovimento() || !imagem.isConnected) return;
  const { x, y } = centro(imagem);
  imagem.animate(
    [
      { transform: "scale(0.85)", filter: "brightness(3)" },
      { transform: "scale(1.08)", filter: "brightness(1.4)" },
      { transform: "scale(1)", filter: "brightness(1)" },
    ],
    { duration: 450, easing: "ease-out" },
  );
  await estalo(x, y);
}
