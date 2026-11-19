// Fundo fluido do hero (WebGL puro, sem biblioteca): um degradê que ondula devagar, como seda,
// e um brilho que segue o mouse. Desenha em meia resolução, pausa fora da tela e com a aba escondida.
// Sem WebGL (ou se o shader falhar) o canvas é removido e fica o degradê normal do CSS.

const VERTICE = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";

const FRAGMENTO = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform vec3 uBg;
uniform vec3 uA;
uniform vec3 uB;
uniform float uMix;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++){ v += a * noise(p); p *= 2.02; a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 q = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime * 0.045;

  vec2 w = vec2(fbm(q * 1.6 + vec2(0.0, t)), fbm(q * 1.6 + vec2(5.2, -t)));
  float n = fbm(q * 1.4 + 2.2 * w + vec2(t, 0.0));

  float glow = smoothstep(0.9, 0.0, distance(uv, uMouse));

  vec3 col = uBg;
  col = mix(col, uA, smoothstep(0.25, 0.8, n) * uMix);
  col = mix(col, uB, smoothstep(0.55, 1.0, n + 0.25 * glow) * uMix * 0.9);
  col += uB * glow * 0.10 * uMix;

  col = mix(uBg, col, 1.0 - 0.7 * dot(uv - 0.5, uv - 0.5) * 2.0);
  col += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.025;

  gl_FragColor = vec4(col, 1.0);
}`;

// Paleta roxa do site: fundo, camada intermediária e luz
const COR_FUNDO = [0.18, 0.063, 0.396]; // #2e1065
const COR_A = [0.427, 0.157, 0.851]; // #6d28d9
const COR_B = [0.655, 0.545, 0.98]; // #a78bfa
const INTENSIDADE = 0.85;
const ESCALA = 0.4; // fração da resolução em que o canvas é desenhado
const INTERVALO_MINIMO_MS = 33; // no máximo ~30 quadros por segundo: o fundo é lento, não precisa de mais

function compilar(gl, tipo, fonte) {
  const sombreador = gl.createShader(tipo);
  gl.shaderSource(sombreador, fonte);
  gl.compileShader(sombreador);
  return gl.getShaderParameter(sombreador, gl.COMPILE_STATUS) ? sombreador : null;
}

/**
 * Cria o canvas do shader dentro do elemento e começa a desenhar.
 * @param {HTMLElement} elemento seção que recebe o fundo
 * @returns {() => void} função que desliga tudo e remove o canvas
 */
export function criarShader(elemento) {
  const canvas = document.createElement("canvas");
  canvas.className = "fundo-shader";
  canvas.setAttribute("aria-hidden", "true");
  elemento.prepend(canvas);
  const tirar = () => canvas.remove();

  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
  if (!gl) {
    tirar();
    return () => {};
  }

  const vertice = compilar(gl, gl.VERTEX_SHADER, VERTICE);
  const fragmento = compilar(gl, gl.FRAGMENT_SHADER, FRAGMENTO);
  const programa = gl.createProgram();
  if (!vertice || !fragmento || !programa) {
    tirar();
    return () => {};
  }
  gl.attachShader(programa, vertice);
  gl.attachShader(programa, fragmento);
  gl.linkProgram(programa);
  if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) {
    tirar();
    return () => {};
  }
  gl.useProgram(programa);

  // Um triângulo que cobre a tela inteira
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const posicao = gl.getAttribLocation(programa, "p");
  gl.enableVertexAttribArray(posicao);
  gl.vertexAttribPointer(posicao, 2, gl.FLOAT, false, 0, 0);

  const U = (nome) => gl.getUniformLocation(programa, nome);
  const uniformes = { res: U("uRes"), tempo: U("uTime"), mouse: U("uMouse") };
  gl.uniform3fv(U("uBg"), COR_FUNDO);
  gl.uniform3fv(U("uA"), COR_A);
  gl.uniform3fv(U("uB"), COR_B);
  gl.uniform1f(U("uMix"), INTENSIDADE);

  const mouse = { x: 0.7, y: 0.6, alvoX: 0.7, alvoY: 0.6 };
  const inicio = performance.now();
  let visivel = true;
  let quadro = 0;

  function medir() {
    const largura = Math.max(1, Math.round(canvas.clientWidth * ESCALA));
    const altura = Math.max(1, Math.round(canvas.clientHeight * ESCALA));
    if (canvas.width !== largura || canvas.height !== altura) {
      canvas.width = largura;
      canvas.height = altura;
      gl.viewport(0, 0, largura, altura);
      gl.uniform2f(uniformes.res, largura, altura);
    }
  }

  function desenhar(agora) {
    medir();
    mouse.x += (mouse.alvoX - mouse.x) * 0.05;
    mouse.y += (mouse.alvoY - mouse.y) * 0.05;
    gl.uniform1f(uniformes.tempo, (agora - inicio) / 1000);
    gl.uniform2f(uniformes.mouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  let ultimoDesenho = 0;
  function laco(agora) {
    if (agora - ultimoDesenho >= INTERVALO_MINIMO_MS) {
      ultimoDesenho = agora;
      desenhar(agora);
    }
    quadro = visivel && !document.hidden ? requestAnimationFrame(laco) : 0;
  }

  function iniciar() {
    if (!quadro) quadro = requestAnimationFrame(laco);
  }

  const observador = new IntersectionObserver(([entrada]) => {
    visivel = entrada.isIntersecting;
    if (visivel) iniciar();
  });
  observador.observe(canvas);

  const aoMover = (evento) => {
    const caixa = canvas.getBoundingClientRect();
    mouse.alvoX = (evento.clientX - caixa.left) / caixa.width;
    mouse.alvoY = 1 - (evento.clientY - caixa.top) / caixa.height;
  };
  const aoVoltar = () => document.hidden || iniciar();
  window.addEventListener("pointermove", aoMover, { passive: true });
  document.addEventListener("visibilitychange", aoVoltar);
  const medidor = new ResizeObserver(() => desenhar(performance.now()));
  medidor.observe(canvas);
  iniciar();

  return () => {
    cancelAnimationFrame(quadro);
    observador.disconnect();
    medidor.disconnect();
    window.removeEventListener("pointermove", aoMover);
    document.removeEventListener("visibilitychange", aoVoltar);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    tirar();
  };
}
