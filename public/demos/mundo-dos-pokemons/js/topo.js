// Botão "Voltar ao topo" do rodapé (uma Master Ball). A bola balança quando o mouse chega perto, e também
// uma vez quando o botão aparece na tela (para quem usa toque ou teclado), para a pessoa perceber que é um botão.
import { semMovimento } from "./util.js";

const botao = document.querySelector(".botao-topo");

if (botao) {
  const RAIO_PX = 140; // distância do mouse ao centro da bola que faz ela balançar
  let visivel = false;
  let perto = false;
  let temporizador = 0;

  /** Faz a bola balançar por um tempo (ou até chamar(false)). */
  function chamar(ligado) {
    if (ligado && semMovimento()) return;
    botao.classList.toggle("chamando", ligado);
  }

  // Mouse chegando perto: balança; saindo: para
  document.addEventListener(
    "pointermove",
    (evento) => {
      if (evento.pointerType !== "mouse" || !visivel) return;
      const caixa = botao.getBoundingClientRect();
      const distancia = Math.hypot(
        evento.clientX - (caixa.left + caixa.width / 2),
        evento.clientY - (caixa.top + caixa.height / 2),
      );
      const dentro = distancia < RAIO_PX;
      if (dentro !== perto) {
        perto = dentro;
        chamar(dentro);
      }
    },
    { passive: true },
  );

  // Quando o botão aparece na tela: duas balançadas, uma vez só
  const observador = new IntersectionObserver(
    ([entrada]) => {
      visivel = entrada.isIntersecting;
      if (!entrada.isIntersecting || temporizador) return;
      chamar(true);
      temporizador = setTimeout(() => {
        if (!perto) chamar(false);
      }, 2200);
    },
    { threshold: 0.9 },
  );
  observador.observe(botao);

  botao.addEventListener("click", () => {
    chamar(false);
    botao.classList.remove("lancada");
    void botao.offsetWidth; // reinicia a animação se clicar de novo
    if (!semMovimento()) botao.classList.add("lancada");
    window.scrollTo({ top: 0, behavior: semMovimento() ? "auto" : "smooth" });
  });
  botao.addEventListener("animationend", (evento) => {
    if (evento.animationName === "bola-lancar") botao.classList.remove("lancada");
  });
}
