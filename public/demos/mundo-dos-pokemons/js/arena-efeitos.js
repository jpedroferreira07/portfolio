// Efeitos visuais da arena (Web Animations API): abertura "VS", pokébola de entrada, golpes com visual próprio
// para cada tipo, impacto com recuo, números de dano, avisos, flashes, tremida da tela, desmaio, banner final e confete.
// Tudo respeita "reduzir movimento" e o botão de pausar: sem movimento, os efeitos viram só uma pausa curta.
import { TIPOS, COR_DOS_TIPOS } from "./tipos.js";
import { criarElemento as criar, semMovimento } from "./util.js";

const SVG = "http://www.w3.org/2000/svg";
const PAUSA_SEM_MOVIMENTO_MS = 250;
const CORES_CONFETE = ["#8b5cf6", "#f472b6", "#fcd53f", "#c4b5fd", "#ffffff", "#6d28d9"];

export const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

/** Espera o tempo de um efeito; sem movimento, só uma pausa curta para dar tempo de ler. */
export const pausa = (ms) => esperar(semMovimento() ? Math.min(ms, PAUSA_SEM_MOVIMENTO_MS) : ms);

/** Roda uma animação e espera ela terminar (sem movimento, nem começa). */
function animar(elemento, quadros, opcoes) {
  if (semMovimento() || !elemento) return Promise.resolve();
  const animacao = elemento.animate(quadros, { fill: "both", ...opcoes });
  return animacao.finished.then(
    () => animacao.cancel(),
    () => {},
  );
}

/** Como cada tipo "aparece" no golpe: a forma das partículas e o jeito de se mover. */
const ESTILO_DO_TIPO = {
  normal: { forma: "estrela", modo: "explodir" },
  fire: { forma: "chama", modo: "subir" },
  water: { forma: "gota", modo: "cair" },
  electric: { forma: "faisca", modo: "raio" },
  grass: { forma: "folha", modo: "espiral" },
  ice: { forma: "cristal", modo: "cair" },
  fighting: { forma: "estrela", modo: "explodir" },
  poison: { forma: "bolha", modo: "subir" },
  ground: { forma: "pedra", modo: "subir" },
  flying: { forma: "risco", modo: "espiral" },
  psychic: { forma: "anel", modo: "ondas" },
  bug: { forma: "gota", modo: "espiral" },
  rock: { forma: "pedra", modo: "cair" },
  ghost: { forma: "bolha", modo: "subir" },
  dragon: { forma: "chama", modo: "espiral" },
  dark: { forma: "risco", modo: "explodir" },
  steel: { forma: "risco", modo: "explodir" },
  fairy: { forma: "estrela", modo: "espiral" },
};

function partesDoLado(cena, lado) {
  const raiz = cena.querySelector(`.lado-${lado}`);
  return {
    raiz,
    caixa: raiz.querySelector(".lutador-caixa"),
    imagem: raiz.querySelector(".lutador-imagem"),
    painel: raiz.querySelector(".painel-hp"),
    anel: raiz.querySelector(".plataforma-anel"),
  };
}

/** Centro de um elemento, em pixels, dentro da camada de efeitos. */
function centroEm(camada, elemento) {
  const base = camada.getBoundingClientRect();
  const caixa = elemento.getBoundingClientRect();
  return { x: caixa.left - base.left + caixa.width / 2, y: caixa.top - base.top + caixa.height / 2 };
}

const aleatorio = (minimo, maximo) => minimo + Math.random() * (maximo - minimo);

/**
 * Liga os efeitos a uma cena de batalha.
 * @param {HTMLElement} cena elemento .cena (tem os dois lados e a camada .efeitos)
 */
export function criarEfeitos(cena) {
  const camada = cena.querySelector(".efeitos");
  const lados = { jogador: partesDoLado(cena, "jogador"), rival: partesDoLado(cena, "rival") };
  const outro = (lado) => (lado === "jogador" ? "rival" : "jogador");

  /** Cria um elemento solto na camada de efeitos, posicionado em um ponto. */
  function solto(classe, ponto, texto) {
    const elemento = criar("span", classe, texto);
    elemento.style.left = ponto.x + "px";
    elemento.style.top = ponto.y + "px";
    camada.append(elemento);
    return elemento;
  }

  /** Uma partícula da forma e da cor de um tipo, que vive um tempo e some. */
  function particula(tipo, ponto, quadros, opcoes, tamanho = 1) {
    const { forma } = ESTILO_DO_TIPO[tipo] ?? ESTILO_DO_TIPO.normal;
    const elemento = solto("particula forma-" + forma, ponto);
    elemento.style.background = COR_DOS_TIPOS[tipo] ?? "#fff";
    elemento.style.setProperty("width", 14 * tamanho + "px");
    elemento.style.setProperty("height", 14 * tamanho + "px");
    animar(elemento, quadros, opcoes).then(() => elemento.remove());
  }

  /** Um raio em zigue-zague caindo do alto até o alvo. */
  async function raio(alvo) {
    const ponto = centroEm(camada, alvo.caixa);
    const svg = document.createElementNS(SVG, "svg");
    svg.setAttribute("class", "raio");
    svg.setAttribute("viewBox", `0 0 ${camada.clientWidth} ${camada.clientHeight}`);
    const linha = document.createElementNS(SVG, "polyline");
    const pontos = [];
    const passos = 7;
    for (let i = 0; i <= passos; i++) {
      const y = (ponto.y * i) / passos;
      const x = ponto.x + (i === 0 || i === passos ? 0 : aleatorio(-34, 34)) + (passos - i) * aleatorio(-6, 6);
      pontos.push(`${Math.round(x)},${Math.round(y)}`);
    }
    linha.setAttribute("points", pontos.join(" "));
    svg.append(linha);
    camada.append(svg);
    await animar(
      svg,
      [{ opacity: 0 }, { opacity: 1, offset: 0.1 }, { opacity: 0.3, offset: 0.3 }, { opacity: 1, offset: 0.45 }, { opacity: 0 }],
      { duration: 520 },
    );
    svg.remove();
  }

  /** Corte branco cruzando o alvo (golpes físicos). */
  function corte(ponto, cor) {
    const elemento = solto("corte", ponto);
    elemento.style.background = `linear-gradient(90deg, transparent, #fff 35%, ${cor} 70%, transparent)`;
    const angulo = aleatorio(-35, 35);
    animar(
      elemento,
      [
        { transform: `translate(-50%, -50%) rotate(${angulo}deg) scaleX(0.1)`, opacity: 1 },
        { transform: `translate(-50%, -50%) rotate(${angulo}deg) scaleX(1.2)`, opacity: 1, offset: 0.4 },
        { transform: `translate(-50%, -50%) rotate(${angulo}deg) scaleX(1.3)`, opacity: 0 },
      ],
      { duration: 340, easing: "ease-out" },
    ).then(() => elemento.remove());
  }

  return {
    lados,

    /** Pinta os anéis das plataformas e o brilho do piso com as cores dos tipos dos dois lutadores. */
    definirCenario(jogador, rival) {
      for (const [lado, lutador] of [["jogador", jogador], ["rival", rival]]) {
        const cor = COR_DOS_TIPOS[lutador.tipos[0]] ?? "#c4b5fd";
        const { anel } = lados[lado];
        anel.style.borderColor = cor;
        anel.style.boxShadow = `0 0 26px 4px ${cor}, inset 0 0 22px ${cor}`;
      }
      const corRival = COR_DOS_TIPOS[rival.tipos[0]] ?? "#c4b5fd";
      const corJogador = COR_DOS_TIPOS[jogador.tipos[0]] ?? "#c4b5fd";
      const brilho = cena.querySelector(".piso-brilho");
      if (brilho) {
        brilho.style.background = `radial-gradient(ellipse at 72% 38%, ${corRival}88 0%, transparent 42%), radial-gradient(ellipse at 28% 78%, ${corJogador}88 0%, transparent 45%)`;
      }
    },

    /** Tela de abertura: os dois lutadores entram cortando a tela na diagonal, com um "VS" no meio. */
    async abertura(jogador, rival, nomeDe) {
      if (semMovimento()) return;
      const fundo = criar("div", "abertura");
      const lado = (lutador, classe) => {
        const bloco = criar("div", "abertura-lado " + classe);
        const imagem = document.createElement("img");
        imagem.src = lutador.imagem;
        imagem.alt = "";
        const nome = criar("span", "abertura-nome", nomeDe(lutador));
        const tipos = criar("span", "abertura-tipos", lutador.tipos.map((t) => TIPOS[t]).join(" · "));
        bloco.append(imagem, nome, tipos);
        return bloco;
      };
      const eu = lado(jogador, "abertura-jogador");
      const eles = lado(rival, "abertura-rival");
      const vs = criar("span", "abertura-vs", "VS");
      fundo.append(eu, eles, vs);
      camada.append(fundo);

      await Promise.all([
        animar(fundo, [{ opacity: 0 }, { opacity: 1 }], { duration: 200 }),
        animar(eu, [{ transform: "translateX(-110%)" }, { transform: "translateX(0)" }], { duration: 520, easing: "cubic-bezier(0.2, 0.9, 0.2, 1)" }),
        animar(eles, [{ transform: "translateX(110%)" }, { transform: "translateX(0)" }], { duration: 520, easing: "cubic-bezier(0.2, 0.9, 0.2, 1)" }),
      ]);
      await animar(
        vs,
        [
          { transform: "translate(-50%, -50%) scale(4) rotate(-12deg)", opacity: 0 },
          { transform: "translate(-50%, -50%) scale(0.9) rotate(3deg)", opacity: 1, offset: 0.55 },
          { transform: "translate(-50%, -50%) scale(1) rotate(0deg)", opacity: 1 },
        ],
        { duration: 380, easing: "ease-out" },
      );
      this.tremerCena(1.4);
      await esperar(900);
      await Promise.all([
        animar(eu, [{ transform: "translateX(0)" }, { transform: "translateX(-110%)" }], { duration: 380, easing: "ease-in" }),
        animar(eles, [{ transform: "translateX(0)" }, { transform: "translateX(110%)" }], { duration: 380, easing: "ease-in" }),
        animar(vs, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 }),
      ]);
      await animar(fundo, [{ opacity: 1 }, { opacity: 0 }], { duration: 200 });
      fundo.remove();
    },

    /** O pokémon fica escondido até a pokébola abrir. */
    esconder(lado) {
      lados[lado].caixa.style.opacity = "0";
    },

    /** Mostra o pokémon sem animação. */
    mostrar(lado) {
      const { caixa } = lados[lado];
      caixa.getAnimations().forEach((a) => a.cancel());
      caixa.style.opacity = "1";
      caixa.style.transform = "";
      caixa.style.filter = "";
    },

    /** A Master Ball voa até o lugar do pokémon, abre com um clarão e o pokémon cresce. */
    async entrar(lado) {
      const { caixa } = lados[lado];
      if (semMovimento()) {
        this.mostrar(lado);
        return;
      }
      const destino = centroEm(camada, caixa);
      const largura = camada.clientWidth;
      const origem = lado === "jogador" ? { x: -40, y: camada.clientHeight * 0.9 } : { x: largura + 40, y: -40 };

      const bola = criar("span", "bola-lancada");
      bola.style.left = origem.x + "px";
      bola.style.top = origem.y + "px";
      camada.append(bola);
      const meioX = (origem.x + destino.x) / 2;
      const topo = Math.min(origem.y, destino.y) - camada.clientHeight * 0.25;
      await animar(
        bola,
        [
          { transform: "translate(0, 0) rotate(0deg)" },
          { transform: `translate(${meioX - origem.x}px, ${topo - origem.y}px) rotate(360deg)` },
          { transform: `translate(${destino.x - origem.x}px, ${destino.y - origem.y}px) rotate(720deg)` },
        ],
        { duration: 650, easing: "ease-in-out" },
      );

      const clarao = solto("clarao", destino);
      bola.remove();
      caixa.style.opacity = "1";
      // anéis de energia saindo do ponto onde o pokémon aparece
      for (let i = 0; i < 3; i++) {
        const onda = solto("onda", destino);
        animar(
          onda,
          [{ transform: "translate(-50%, -50%) scale(0.2)", opacity: 0.9 }, { transform: "translate(-50%, -50%) scale(2.6)", opacity: 0 }],
          { duration: 700, delay: i * 140, easing: "ease-out" },
        ).then(() => onda.remove());
      }
      await Promise.all([
        animar(clarao, [{ transform: "translate(-50%, -50%) scale(0.2)", opacity: 0.95 }, { transform: "translate(-50%, -50%) scale(3)", opacity: 0 }], {
          duration: 520,
          easing: "ease-out",
        }).then(() => clarao.remove()),
        animar(
          caixa,
          [
            { transform: "scale(0.1)", filter: "brightness(5)" },
            { transform: "scale(1.15)", filter: "brightness(1.6)", offset: 0.6 },
            { transform: "scale(1)", filter: "brightness(1)" },
          ],
          { duration: 600, easing: "ease-out" },
        ),
      ]);
    },

    /** Etiqueta com o nome do golpe, na cor do tipo, que sobe sobre o atacante. */
    rotuloDoGolpe(lado, texto, tipo) {
      if (semMovimento()) return;
      const ponto = centroEm(camada, lados[lado].caixa);
      const rotulo = solto("rotulo-golpe", { x: ponto.x, y: ponto.y - lados[lado].caixa.clientHeight * 0.62 }, texto);
      rotulo.style.background = COR_DOS_TIPOS[tipo] ?? "#fff";
      animar(
        rotulo,
        [
          { transform: "translate(-50%, 10px) scale(0.6)", opacity: 0 },
          { transform: "translate(-50%, -6px) scale(1.05)", opacity: 1, offset: 0.25 },
          { transform: "translate(-50%, -14px) scale(1)", opacity: 1, offset: 0.8 },
          { transform: "translate(-50%, -22px) scale(1)", opacity: 0 },
        ],
        { duration: 1100, easing: "ease-out" },
      ).then(() => rotulo.remove());
    },

    /** Brilho da cor do tipo em volta do atacante, como se ele juntasse energia. */
    aura(lado, tipo) {
      if (semMovimento()) return Promise.resolve();
      const cor = COR_DOS_TIPOS[tipo] ?? "#fff";
      return animar(
        lados[lado].imagem,
        [
          { filter: "drop-shadow(0 10px 8px rgb(0 0 0 / 0.35)) brightness(1)" },
          { filter: `drop-shadow(0 0 22px ${cor}) drop-shadow(0 0 40px ${cor}) brightness(1.35)`, offset: 0.55 },
          { filter: "drop-shadow(0 10px 8px rgb(0 0 0 / 0.35)) brightness(1)" },
        ],
        { duration: 520 },
      );
    },

    /** O atacante avança contra o alvo (físico) ou lança energia do tipo (especial). */
    async atacar(lado, tipo, classe) {
      if (semMovimento()) return;
      const atacante = lados[lado];
      const alvo = lados[outro(lado)];
      const de = centroEm(camada, atacante.caixa);
      const para = centroEm(camada, alvo.caixa);
      const dx = para.x - de.x;
      const dy = para.y - de.y;
      const cor = COR_DOS_TIPOS[tipo] ?? "#ffffff";
      const { modo } = ESTILO_DO_TIPO[tipo] ?? ESTILO_DO_TIPO.normal;

      await this.aura(lado, tipo);

      if (classe === "special") {
        if (modo === "raio") {
          await Promise.all([
            raio(alvo),
            this.flashTela("#fde047", 0.45),
            animar(atacante.caixa, [{ transform: "scale(1)" }, { transform: "scale(1.1)" }, { transform: "scale(1)" }], { duration: 300 }),
          ]);
          return;
        }
        // esfera com rastro, voando até o alvo
        const esfera = solto("esfera", de);
        esfera.style.background = `radial-gradient(circle, #fff 0%, ${cor} 45%, transparent 72%)`;
        esfera.style.boxShadow = `0 0 24px 8px ${cor}`;
        const rastro = setInterval(() => {
          const marca = esfera.getBoundingClientRect();
          const base = camada.getBoundingClientRect();
          particula(tipo, { x: marca.left - base.left + marca.width / 2, y: marca.top - base.top + marca.height / 2 }, [
            { transform: "translate(-50%, -50%) scale(1)", opacity: 0.9 },
            { transform: "translate(-50%, -50%) scale(0.1)", opacity: 0 },
          ], { duration: 360 }, aleatorio(0.5, 0.9));
        }, 45);
        await animar(
          esfera,
          [
            { transform: "translate(-50%, -50%) scale(0.5)", opacity: 0.8 },
            { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1.3)`, opacity: 1 },
          ],
          { duration: 420, easing: "ease-in" },
        );
        clearInterval(rastro);
        esfera.remove();
      } else {
        // golpe físico: recua um pouco, avança com tudo e volta
        const recuo = Math.sign(dx) * -16;
        await animar(
          atacante.caixa,
          [
            { transform: "translate(0, 0)" },
            { transform: `translate(${recuo}px, 8px) scale(0.94)`, offset: 0.28 },
            { transform: `translate(${dx * 0.72}px, ${dy * 0.72}px) scale(1.12)`, offset: 0.55 },
            { transform: `translate(${dx * 0.6}px, ${dy * 0.6}px) scale(1.08)`, offset: 0.62 },
            { transform: "translate(0, 0)" },
          ],
          { duration: 600, easing: "ease-in-out" },
        );
      }
    },

    /** Impacto: efeito do tipo, recuo do alvo, clarão e partículas. */
    async impacto(lado, tipo, forte, classe = "physical") {
      if (semMovimento()) return;
      const alvo = lados[lado];
      const ponto = centroEm(camada, alvo.caixa);
      const cor = COR_DOS_TIPOS[tipo] ?? "#ffffff";
      const { modo } = ESTILO_DO_TIPO[tipo] ?? ESTILO_DO_TIPO.normal;
      const quantidade = forte ? 20 : 12;

      for (let i = 0; i < quantidade; i++) {
        const t = aleatorio(560, 920);
        if (modo === "subir") {
          const x = ponto.x + aleatorio(-50, 50);
          particula(tipo, { x, y: ponto.y + 50 }, [
            { transform: "translate(-50%, -50%) scale(0.6)", opacity: 1 },
            { transform: `translate(calc(-50% + ${aleatorio(-24, 24)}px), calc(-50% - ${aleatorio(80, 150)}px)) scale(1.3)`, opacity: 0 },
          ], { duration: t, delay: i * 18, easing: "ease-out" }, aleatorio(0.8, 1.6));
        } else if (modo === "cair") {
          const x = ponto.x + aleatorio(-60, 60);
          particula(tipo, { x, y: ponto.y - 130 }, [
            { transform: "translate(-50%, -50%) rotate(0deg)", opacity: 1 },
            { transform: `translate(-50%, ${150 + aleatorio(0, 40)}px) rotate(${aleatorio(-90, 90)}deg)`, opacity: 0.2 },
          ], { duration: t * 0.7, delay: i * 25, easing: "ease-in" }, aleatorio(0.8, 1.5));
        } else if (modo === "espiral") {
          const giro = aleatorio(0, 360);
          particula(tipo, ponto, [
            { transform: `translate(-50%, -50%) rotate(${giro}deg) translateX(100px) scale(1)`, opacity: 0 },
            { transform: `translate(-50%, -50%) rotate(${giro + 90}deg) translateX(70px) scale(1.1)`, opacity: 1, offset: 0.3 },
            { transform: `translate(-50%, -50%) rotate(${giro + 520}deg) translateX(6px) scale(0.3)`, opacity: 0 },
          ], { duration: t + 200, delay: i * 25, easing: "ease-in-out" }, aleatorio(0.8, 1.4));
        } else if (modo === "ondas") {
          if (i < 3) {
            const onda = solto("onda onda-psiquica", ponto);
            onda.style.borderColor = cor;
            animar(
              onda,
              [{ transform: "translate(-50%, -50%) scale(0.2)", opacity: 0.95 }, { transform: "translate(-50%, -50%) scale(2.4)", opacity: 0 }],
              { duration: 760, delay: i * 140, easing: "ease-out" },
            ).then(() => onda.remove());
          }
        } else {
          const angulo = (Math.PI * 2 * i) / quantidade + Math.random() * 0.4;
          const distancia = (forte ? 100 : 66) + Math.random() * 56;
          particula(tipo, ponto, [
            { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
            {
              transform: `translate(calc(-50% + ${Math.cos(angulo) * distancia}px), calc(-50% + ${Math.sin(angulo) * distancia}px)) rotate(${aleatorio(-180, 180)}deg) scale(0.2)`,
              opacity: 0,
            },
          ], { duration: t * 0.8, easing: "ease-out" }, aleatorio(0.8, 1.4));
        }
      }

      const marca = solto("estrela-impacto", ponto);
      marca.style.background = `radial-gradient(circle, #fff 0%, ${cor} 40%, transparent 70%)`;
      animar(
        marca,
        [
          { transform: "translate(-50%, -50%) scale(0.3) rotate(0deg)", opacity: 1 },
          { transform: "translate(-50%, -50%) scale(1.7) rotate(45deg)", opacity: 0 },
        ],
        { duration: 420, easing: "ease-out" },
      ).then(() => marca.remove());
      if (classe === "physical") corte(ponto, cor);
      this.flashTela(cor, forte ? 0.5 : 0.25);

      // recuo: o alvo é empurrado para longe de quem atacou e volta
      const sentido = lado === "rival" ? 1 : -1;
      const empurrao = forte ? 34 : 20;
      await animar(
        alvo.caixa,
        [
          { transform: "translate(0, 0) rotate(0deg)", filter: "brightness(1)" },
          { transform: `translate(${sentido * empurrao}px, ${-sentido * empurrao * 0.5}px) rotate(${sentido * 6}deg)`, filter: "brightness(2.4) saturate(0.4)", offset: 0.14 },
          { transform: `translate(${sentido * empurrao * 0.6}px, ${-sentido * empurrao * 0.3}px) rotate(${sentido * 3}deg)`, filter: "brightness(1.4) sepia(1) hue-rotate(-40deg) saturate(4)", offset: 0.3 },
          { transform: "translate(-6px, 2px)", filter: "brightness(1)", offset: 0.55 },
          { transform: "translate(4px, 0)", offset: 0.75 },
          { transform: "translate(0, 0) rotate(0deg)", filter: "brightness(1)" },
        ],
        { duration: 620 },
      );
    },

    /** Clarão colorido sobre a cena inteira, muito rápido. */
    flashTela(cor, forca = 0.4) {
      if (semMovimento()) return Promise.resolve();
      const flash = criar("span", "flash-tela");
      flash.style.background = cor;
      camada.append(flash);
      return animar(flash, [{ opacity: 0 }, { opacity: forca, offset: 0.25 }, { opacity: 0 }], { duration: 260 }).then(() => flash.remove());
    },

    /** O golpe errou: o alvo dá um passo para o lado. */
    async esquivar(lado) {
      if (semMovimento()) return;
      const direcao = lado === "jogador" ? -1 : 1;
      await animar(
        lados[lado].caixa,
        [
          { transform: "translateX(0) rotate(0deg)" },
          { transform: `translateX(${direcao * 40}px) rotate(${direcao * 8}deg)`, offset: 0.4 },
          { transform: "translateX(0) rotate(0deg)" },
        ],
        { duration: 480, easing: "ease-in-out" },
      );
    },

    /** Número de dano que sobe e some sobre o pokémon. */
    numero(lado, texto, classe = "") {
      if (semMovimento()) return;
      const ponto = centroEm(camada, lados[lado].caixa);
      const numero = solto("numero-dano" + (classe ? " " + classe : ""), { x: ponto.x, y: ponto.y - 40 }, texto);
      animar(
        numero,
        [
          { transform: "translate(-50%, 0) scale(0.6)", opacity: 0 },
          { transform: "translate(-50%, -22px) scale(1.3)", opacity: 1, offset: 0.25 },
          { transform: "translate(-50%, -76px) scale(1)", opacity: 0 },
        ],
        { duration: 1150, easing: "ease-out" },
      ).then(() => numero.remove());
    },

    /** Aviso grande no meio da cena ("Super efetivo!", "Acerto crítico!"). */
    async aviso(texto, nivel) {
      if (semMovimento()) return;
      const elemento = solto("aviso-grande aviso-" + nivel, { x: camada.clientWidth / 2, y: camada.clientHeight * 0.42 }, texto);
      await animar(
        elemento,
        [
          { transform: "translate(-50%, -50%) scale(0.4) rotate(-6deg)", opacity: 0 },
          { transform: "translate(-50%, -50%) scale(1.15) rotate(2deg)", opacity: 1, offset: 0.3 },
          { transform: "translate(-50%, -50%) scale(1) rotate(0deg)", opacity: 1, offset: 0.75 },
          { transform: "translate(-50%, -64%) scale(1)", opacity: 0 },
        ],
        { duration: 1000, easing: "ease-out" },
      );
      elemento.remove();
    },

    /** A cena inteira treme (golpes críticos ou super efetivos). */
    async tremerCena(forca = 1) {
      if (semMovimento()) return;
      const f = 6 * forca;
      await animar(
        cena,
        [
          { transform: "translate(0, 0)" },
          { transform: `translate(${-f}px, ${f / 2}px)` },
          { transform: `translate(${f}px, ${-f / 2}px)` },
          { transform: `translate(${-f / 2}px, ${f / 2}px)` },
          { transform: "translate(0, 0)" },
        ],
        { duration: 360 },
      );
    },

    /** O pokémon derrotado gira, afunda e some. */
    async desmaiar(lado) {
      if (semMovimento()) {
        lados[lado].caixa.style.opacity = "0";
        return;
      }
      const giro = lado === "jogador" ? -25 : 25;
      await animar(
        lados[lado].caixa,
        [
          { transform: "translateY(0) rotate(0deg)", opacity: 1, filter: "grayscale(0)" },
          { transform: `translateY(-16px) rotate(${giro / 2}deg)`, opacity: 1, offset: 0.25 },
          { transform: `translateY(70px) rotate(${giro}deg)`, opacity: 0, filter: "grayscale(1) brightness(0.6)" },
        ],
        { duration: 1000, easing: "ease-in" },
      );
      lados[lado].caixa.style.opacity = "0";
    },

    /** Pulinhos de comemoração do vencedor. */
    async comemorar(lado) {
      if (semMovimento()) return;
      await animar(
        lados[lado].caixa,
        [
          { transform: "translateY(0)" },
          { transform: "translateY(-34px) scale(1.08) rotate(-4deg)", offset: 0.3 },
          { transform: "translateY(0)", offset: 0.55 },
          { transform: "translateY(-20px) rotate(4deg)", offset: 0.75 },
          { transform: "translateY(0)" },
        ],
        { duration: 1000, iterations: 2 },
      );
    },

    /** Faixa do resultado ("VITÓRIA!" ou "DERROTA") com um resumo da batalha. Fica até limpar(). */
    async banner(titulo, venceu, resumo) {
      const faixa = criar("div", "banner-fim " + (venceu ? "banner-vitoria" : "banner-derrota"));
      faixa.append(criar("span", "banner-titulo", titulo), criar("span", "banner-resumo", resumo));
      camada.append(faixa);
      await animar(
        faixa,
        [
          { transform: "translate(-50%, -50%) scaleY(0.1) scaleX(1.4)", opacity: 0 },
          { transform: "translate(-50%, -50%) scaleY(1.1) scaleX(1)", opacity: 1, offset: 0.6 },
          { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
        ],
        { duration: 600, easing: "cubic-bezier(0.2, 1.3, 0.4, 1)" },
      );
    },

    /** Remove banner, confete e efeitos que tenham sobrado. */
    limpar() {
      for (const resto of camada.querySelectorAll(".banner-fim, .confete, .abertura, .rotulo-golpe, .raio")) resto.remove();
    },

    /** Chuva de confete (vitória). */
    confete() {
      if (semMovimento()) return;
      const largura = camada.clientWidth;
      for (let i = 0; i < 60; i++) {
        const pedaco = solto("confete", { x: Math.random() * largura, y: -10 });
        pedaco.style.background = CORES_CONFETE[i % CORES_CONFETE.length];
        const queda = camada.clientHeight + 40;
        animar(
          pedaco,
          [
            { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
            { transform: `translate(${(Math.random() - 0.5) * 140}px, ${queda}px) rotate(${Math.random() * 720}deg)`, opacity: 0.9 },
          ],
          { duration: 2200 + Math.random() * 1600, delay: Math.random() * 600, easing: "ease-in" },
        ).then(() => pedaco.remove());
      }
    },
  };
}
