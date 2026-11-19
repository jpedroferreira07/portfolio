// Efeitos da página inicial (GSAP): hero que afunda ao rolar,
// seção "Como funciona" que entra em sequência, números que contam, faixa de tipos
// que acelera com a rolagem e blocos que sobem e aparecem conforme você desce.
// O estado inicial escondido só existe enquanto o GSAP roda: sem ele, tudo fica visível.
import { aoDesligar, gsap, ScrollTrigger } from "./movimento.js";
import { criarShader } from "./shader.js";

/** Fundo fluido do hero e a saída ao rolar (a entrada do título e da imagem é só CSS, para abrir rápido). */
function animarHero() {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  aoDesligar(criarShader(hero));

  // Ao rolar: o texto sobe e esmaece enquanto a imagem e o fundo afundam
  const saida = { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 };
  gsap.to(".hero-texto", { y: -50, opacity: 0.2, ease: "none", scrollTrigger: saida });
  gsap.to(".hero-imagem", { yPercent: 8, scale: 1.08, ease: "none", scrollTrigger: saida });
  gsap.to(".fundo-shader", { yPercent: 15, opacity: 0.4, ease: "none", scrollTrigger: saida });
}

/** "Como funciona": os cartões entram um a um e os ícones dão um pulinho, acompanhando a rolagem (a página nunca trava). */
function animarComoFunciona() {
  const secao = document.querySelector(".secao-sobre");
  if (!secao) return;

  const cartoes = gsap.utils.toArray(".passo", secao);
  const icones = gsap.utils.toArray(".passo-icone", secao);
  const linha = gsap.timeline({ defaults: { ease: "none" } });
  linha
    .fromTo(cartoes, { y: 70, opacity: 0, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.25 })
    .fromTo(icones, { scale: 0.5, rotate: -20 }, { scale: 1, rotate: 0, duration: 0.5, stagger: 0.25, ease: "back.out(2.5)" }, 0.25);

  ScrollTrigger.create({ animation: linha, trigger: secao, start: "top 80%", end: "center 50%", scrub: 0.6 });
}

/** Blocos que sobem e aparecem presos à rolagem (e se desfazem ao voltar). */
function revelarBlocos() {
  const blocos = gsap.utils.toArray(".numero-card, .arena-chamada, .tipos-faixa > *, .chamada-texto, .chamada-figuras");
  blocos.forEach((bloco, indice) => {
    // Já está na tela ao abrir: nasce visível, senão ficaria apagado até o primeiro movimento
    if (bloco.getBoundingClientRect().top < window.innerHeight * 0.98) return;
    gsap.fromTo(
      bloco,
      { y: 80, opacity: 0, scale: 0.97 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        ease: "none",
        scrollTrigger: { trigger: bloco, start: `top ${98 - (indice % 3) * 3}%`, end: "top 70%", scrub: 0.5 },
      },
    );
  });
}

/** Números que contam de 0 até o valor quando entram na tela. */
function contarNumeros() {
  for (const elemento of gsap.utils.toArray(".numero-contador")) {
    const alvo = Number(elemento.dataset.valor);
    if (!Number.isFinite(alvo)) continue;
    const conta = { n: 0 };
    elemento.textContent = "0";
    gsap.to(conta, {
      n: alvo,
      duration: 1.8,
      ease: "power2.out",
      onUpdate: () => (elemento.textContent = Math.round(conta.n).toLocaleString("pt-BR")),
      scrollTrigger: { trigger: elemento, start: "top 90%", once: true },
    });
  }
  aoDesligar(() => {
    for (const elemento of document.querySelectorAll(".numero-contador")) {
      elemento.textContent = Number(elemento.dataset.valor).toLocaleString("pt-BR");
    }
  });
}

/**
 * Faixa de tipos que anda sozinha e acelera com a velocidade da rolagem (rolar para cima inverte).
 * A lista é desenhada duas vezes: a volta termina onde a cópia começa, então não há emenda.
 */
function animarFaixaDeTipos(velocidadeBase = 50) {
  const faixa = document.querySelector(".faixa");
  const trilho = faixa?.querySelector(".faixa-trilho");
  const lista = trilho?.querySelector(".faixa-lista");
  if (!faixa || !trilho || !lista) return;

  const copia = lista.cloneNode(true);
  copia.setAttribute("aria-hidden", "true");
  copia.inert = true; // a cópia não recebe foco nem aparece para leitores de tela
  trilho.append(copia);
  faixa.classList.add("faixa-ativa");

  let visivel = false;
  let deslocamento = 0;
  let velocidade = velocidadeBase;
  let direcao = 1;
  const gatilho = ScrollTrigger.create({
    trigger: faixa,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => (visivel = self.isActive),
  });
  const passo = (_tempo, dt) => {
    if (!visivel) return;
    const rolagem = gatilho.getVelocity(); // px/s da rolagem da página
    if (Math.abs(rolagem) > 20) direcao = rolagem < 0 ? -1 : 1;
    const alvo = direcao * velocidadeBase * (1 + Math.min(Math.abs(rolagem) / 150, 8));
    velocidade += (alvo - velocidade) * Math.min(1, dt / 180); // aceleração suave
    const volta = trilho.scrollWidth / 2;
    if (!volta) return;
    deslocamento = (((deslocamento + (velocidade * dt) / 1000) % volta) + volta) % volta;
    trilho.style.transform = `translate3d(${-deslocamento}px, 0, 0)`;
  };
  gsap.ticker.add(passo);

  aoDesligar(() => {
    gsap.ticker.remove(passo);
    copia.remove();
    faixa.classList.remove("faixa-ativa");
    trilho.style.transform = "";
  });
}

/** Trio de pokémons da chamada final: cada um flutua em uma velocidade ao rolar (paralaxe). */
function flutuarFiguras() {
  const figuras = gsap.utils.toArray(".chamada-figuras img");
  const alcance = [14, 6, 14];
  figuras.forEach((figura, indice) => {
    gsap.fromTo(
      figura,
      { yPercent: alcance[indice] ?? 10 },
      {
        yPercent: -(alcance[indice] ?? 10),
        ease: "none",
        scrollTrigger: { trigger: ".chamada-final", start: "top bottom", end: "bottom top", scrub: 0.8 },
      },
    );
  });
}

export function efeitosDoInicio() {
  animarHero();
  animarComoFunciona();
  revelarBlocos();
  contarNumeros();
  animarFaixaDeTipos();
  flutuarFiguras();
}
