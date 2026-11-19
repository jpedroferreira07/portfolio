// Movimento do site (GSAP + Lenis): rolagem suave, efeitos presos à rolagem e interações com o mouse.
// As bibliotecas ficam em js/vendor (copiadas do node_modules por "npm run vendor").
//
// Tudo isso é opcional: com "reduzir movimento" no sistema, ou depois de clicar em pausar, nada disso roda
// e o site funciona só com o CSS normal. As páginas registram os efeitos delas com adicionarEfeitos().
import { gsap } from "./vendor/gsap/index.js";
import { ScrollTrigger } from "./vendor/gsap/ScrollTrigger.js";
import Lenis from "./vendor/lenis/lenis.mjs";
import { criarElemento as criar, semMovimento } from "./util.js";

gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };

const COM_MOUSE = "(hover: hover) and (pointer: fine)";
// Cards que inclinam em 3D e ganham um brilho que segue o mouse
const CARTOES = ".numero-card, .passo";

const efeitosDasPaginas = [];
const limpezas = [];
let contexto = null;
let lenis = null;
let passoDoRelogio = null;

/** Registra algo para desfazer quando o movimento for desligado (pausar animações). */
export function aoDesligar(funcao) {
  limpezas.push(funcao);
}

/** Registra os efeitos de uma página. Roda já, se o movimento estiver ligado, e de novo ao religar. */
export function adicionarEfeitos(funcao) {
  efeitosDasPaginas.push(funcao);
  contexto?.add(funcao);
}

/** Entrada do topo das páginas internas: os blocos do começo sobem e aparecem, um depois do outro. */
export function entradaDoTopo(seletores) {
  adicionarEfeitos(() => {
    gsap.from(seletores, { y: 30, opacity: 0, duration: 0.9, stagger: 0.12, ease: "power3.out", delay: 0.1 });
  });
}

/* ---------- Brilho que segue o mouse, criado só quando precisa (sem variáveis CSS) ---------- */
function brilhoDo(card) {
  let brilho = card.querySelector(".brilho-suave");
  if (!brilho) {
    brilho = criar("span", "brilho-suave");
    brilho.setAttribute("aria-hidden", "true");
    card.append(brilho);
  }
  return brilho;
}

/* ---------- Botões "magnéticos": seguem o mouse de leve e voltam com um efeito de mola ---------- */
const posicaoDosBotoes = new WeakMap();

function moverBotao(botao, x, y, duracao, suavizacao) {
  let posicao = posicaoDosBotoes.get(botao);
  if (!posicao) {
    posicao = { x: 0, y: 0 };
    posicaoDosBotoes.set(botao, posicao);
  }
  // Usa a propriedade CSS "translate": o "transform" do hover do botão continua funcionando
  gsap.to(posicao, {
    x,
    y,
    duration: duracao,
    ease: suavizacao,
    overwrite: true,
    onUpdate: () => {
      botao.style.translate = `${posicao.x}px ${posicao.y}px`;
    },
  });
}

function ligarInteracoes() {
  if (!window.matchMedia(COM_MOUSE).matches) return () => {};

  const aoMover = (evento) => {
    const card = evento.target.closest?.(CARTOES);
    if (card) {
      const caixa = card.getBoundingClientRect();
      const x = (evento.clientX - caixa.left) / caixa.width;
      const y = (evento.clientY - caixa.top) / caixa.height;
      brilhoDo(card).style.background =
        `radial-gradient(280px circle at ${x * 100}% ${y * 100}%, rgb(167, 139, 250, 0.35), transparent 70%)`;
      gsap.to(card, {
        rotateY: (x - 0.5) * 8,
        rotateX: (0.5 - y) * 8,
        transformPerspective: 900,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
    const botao = evento.target.closest?.(".botao");
    if (botao) {
      const caixa = botao.getBoundingClientRect();
      moverBotao(
        botao,
        (evento.clientX - (caixa.left + caixa.width / 2)) * 0.25,
        (evento.clientY - (caixa.top + caixa.height / 2)) * 0.35,
        0.3,
        "power2.out",
      );
    }
  };

  const aoSair = (evento) => {
    const card = evento.target.closest?.(CARTOES);
    if (card && !card.contains(evento.relatedTarget)) {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "power3.out", overwrite: "auto" });
    }
    const botao = evento.target.closest?.(".botao");
    if (botao && !botao.contains(evento.relatedTarget)) {
      moverBotao(botao, 0, 0, 0.7, "elastic.out(1, 0.45)");
    }
  };

  document.addEventListener("pointermove", aoMover);
  document.addEventListener("pointerout", aoSair);
  return () => {
    document.removeEventListener("pointermove", aoMover);
    document.removeEventListener("pointerout", aoSair);
    gsap.killTweensOf(document.querySelectorAll(CARTOES));
    gsap.set(document.querySelectorAll(CARTOES), { clearProps: "rotateX,rotateY,transformPerspective" });
    for (const botao of document.querySelectorAll(".botao")) botao.style.translate = "";
  };
}

/* ---------- Brilho roxo que segue o mouse (só com mouse de verdade) ---------- */
function ligarBrilhoDoCursor() {
  if (!window.matchMedia(COM_MOUSE).matches) return () => {};
  const brilho = criar("div", "brilho-cursor");
  brilho.setAttribute("aria-hidden", "true");
  document.body.append(brilho);
  const irX = gsap.quickTo(brilho, "x", { duration: 0.6, ease: "power3" });
  const irY = gsap.quickTo(brilho, "y", { duration: 0.6, ease: "power3" });
  const mover = (evento) => {
    irX(evento.clientX);
    irY(evento.clientY);
    brilho.classList.add("ativo");
  };
  const sair = () => brilho.classList.remove("ativo");
  document.addEventListener("pointermove", mover, { passive: true });
  document.documentElement.addEventListener("pointerleave", sair);
  return () => {
    document.removeEventListener("pointermove", mover);
    document.documentElement.removeEventListener("pointerleave", sair);
    brilho.remove();
  };
}

/* ---------- Títulos que sobem palavra por palavra, de dentro de uma máscara, quando chegam na tela ---------- */
const TITULOS = ".secao-sobre h2, .arena-chamada h2, .chamada-final h2, .titulo-pagina h1";

function titulosPorPalavra() {
  for (const titulo of gsap.utils.toArray(TITULOS)) {
    const texto = titulo.textContent.trim();
    if (!texto || titulo.children.length > 0) continue;
    const palavras = [];
    titulo.replaceChildren();
    texto.split(/\s+/).forEach((palavra, indice, todas) => {
      const caixa = criar("span", "titulo-palavra");
      const interna = criar("span", "titulo-palavra-i", palavra);
      caixa.append(interna);
      titulo.append(caixa);
      palavras.push(interna);
      if (indice < todas.length - 1) titulo.append(" ");
    });
    limpezas.push(() => titulo.replaceChildren(texto)); // devolve o texto original ao pausar as animações
    gsap.from(palavras, {
      yPercent: 115,
      duration: 0.9,
      ease: "power4.out",
      stagger: 0.07,
      scrollTrigger: { trigger: titulo, start: "top 88%", once: true },
    });
  }
}

/* ---------- Liga e desliga tudo ---------- */
function iniciarRolagemSuave() {
  try {
    // Dentro de janelas (<dialog>) a rolagem é a normal do navegador
    lenis = new Lenis({ autoRaf: false, prevent: (no) => Boolean(no.closest?.("dialog")) });
    lenis.on("scroll", ScrollTrigger.update);
    passoDoRelogio = (tempo) => lenis.raf(tempo * 1000); // o relógio do GSAP é em segundos; o Lenis quer ms
    gsap.ticker.add(passoDoRelogio);
    gsap.ticker.lagSmoothing(0);
  } catch (erro) {
    console.error("A rolagem suave não iniciou; usando a rolagem normal.", erro);
    lenis = null;
  }
}

function ligar() {
  if (contexto || semMovimento()) return;
  // A Galeria tem mais de mil cards: nela a rolagem do próprio navegador é mais leve que a suavizada por JavaScript
  if (!document.getElementById("lista-pokemons")) iniciarRolagemSuave();
  contexto = gsap.context(() => {
    limpezas.push(ligarInteracoes(), ligarBrilhoDoCursor());
    titulosPorPalavra();
    for (const efeito of efeitosDasPaginas) efeito();
  });
}

function desligar() {
  if (!contexto) return;
  contexto.revert(); // primeiro desfaz as animações; só depois as limpezas devolvem textos e elementos
  contexto = null;
  for (const limpar of limpezas.splice(0)) limpar();
  if (passoDoRelogio) gsap.ticker.remove(passoDoRelogio);
  gsap.ticker.lagSmoothing(500, 33); // valores padrão do GSAP
  lenis?.destroy();
  lenis = null;
  passoDoRelogio = null;
}

/** Recalcula as posições (imagens e fontes que carregam depois mudam a altura da página). */
function recalcular() {
  if (contexto) ScrollTrigger.refresh();
}

window.addEventListener("load", recalcular);
document.fonts?.ready.then(recalcular).catch(() => {});

// O botão de pausar do cabeçalho avisa quando a escolha muda (js/pausar.js)
document.addEventListener("animacoes:alteradas", () => {
  if (semMovimento()) desligar();
  else ligar();
});

ligar();
