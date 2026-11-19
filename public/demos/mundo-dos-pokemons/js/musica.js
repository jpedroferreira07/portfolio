// Música e efeitos sonoros da arena, feitos na hora com a Web Audio API (sem arquivos de áudio, sem direitos
// autorais e sem baixar nada). A música é um tema de batalha em ritmo rápido e em loop.
// Para o som nunca "estourar": volume geral baixo, filtro nos instrumentos agudos e um compressor no fim.
const BPM = 152;
const SEGUNDOS_POR_PASSO = 60 / BPM / 4; // cada passo é uma semicolcheia
const ANTECEDENCIA_S = 0.15; // quanto do futuro o agendador já programa
const GANHO_MAXIMO = 0.22; // volume 100% do controle = este ganho (bem abaixo do máximo possível)
const CHAVE_VOLUME = "arenaVolume";

const nota = (midi) => 440 * 2 ** ((midi - 69) / 12);
const _ = null; // pausa

// Quatro compassos (16 passos cada): Lá menor, Fá, Sol e Mi. A segunda metade repete a base com a melodia mais aguda.
const MELODIA = [
  // Parte A
  69, _, 72, _, 76, _, 72, _, 69, _, 72, _, 76, 77, 76, 72,
  65, _, 69, _, 72, _, 69, _, 65, _, 69, _, 72, 74, 72, 69,
  67, _, 71, _, 74, _, 71, _, 67, _, 71, _, 74, 76, 74, 71,
  64, _, 68, _, 71, _, 68, _, 76, 75, 76, _, 71, _, 68, _,
  // Parte B (mais aguda e agitada)
  81, _, 76, _, 81, _, 84, _, 81, 76, 72, 76, 81, _, 79, 81,
  77, _, 72, _, 77, _, 81, _, 77, 72, 69, 72, 77, _, 76, 77,
  79, _, 74, _, 79, _, 83, _, 79, 74, 71, 74, 79, _, 77, 79,
  76, 75, 76, 80, 83, _, 80, _, 76, _, 80, _, 83, 84, 83, 80,
];
const RAIZES = [45, 41, 43, 40, 45, 41, 43, 40]; // uma raiz por compasso
const TOTAL_PASSOS = MELODIA.length;

let contexto = null;
let mestre = null;
let ruido = null;
let ligado = false;
let volume = lerVolume();
let temporizador = 0;
let proximoTempo = 0;
let passo = 0;

function lerVolume() {
  try {
    const salvo = Number(localStorage.getItem(CHAVE_VOLUME));
    return Number.isFinite(salvo) && salvo >= 0 && salvo <= 100 && localStorage.getItem(CHAVE_VOLUME) !== null ? salvo : 40;
  } catch {
    return 40;
  }
}

/** Cria o sistema de áudio (só depois de um clique, como os navegadores exigem). */
function preparar() {
  if (contexto) return;
  const Contexto = window.AudioContext || window.webkitAudioContext;
  if (!Contexto) return;
  contexto = new Contexto();
  const compressor = contexto.createDynamicsCompressor();
  mestre = contexto.createGain();
  mestre.gain.value = (volume / 100) * GANHO_MAXIMO;
  mestre.connect(compressor);
  compressor.connect(contexto.destination);

  // um segundo de ruído branco, reaproveitado por chimbal, caixa e efeitos
  ruido = contexto.createBuffer(1, contexto.sampleRate, contexto.sampleRate);
  const dados = ruido.getChannelData(0);
  for (let i = 0; i < dados.length; i++) dados[i] = Math.random() * 2 - 1;
}

/** Um som simples: oscilador com entrada e saída suaves (sem "cliques"). */
function tom({ tipo = "square", frequencia, inicio, duracao, ganho, filtro = 3200, ate = null }) {
  const osc = contexto.createOscillator();
  const volumeDoTom = contexto.createGain();
  const passaBaixa = contexto.createBiquadFilter();
  passaBaixa.type = "lowpass";
  passaBaixa.frequency.value = filtro;
  osc.type = tipo;
  osc.frequency.setValueAtTime(frequencia, inicio);
  if (ate) osc.frequency.exponentialRampToValueAtTime(ate, inicio + duracao);
  volumeDoTom.gain.setValueAtTime(0.0001, inicio);
  volumeDoTom.gain.exponentialRampToValueAtTime(ganho, inicio + 0.008);
  volumeDoTom.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);
  osc.connect(passaBaixa).connect(volumeDoTom).connect(mestre);
  osc.start(inicio);
  osc.stop(inicio + duracao + 0.02);
}

/** Ruído filtrado (chimbal, caixa, impactos). */
function sopro({ inicio, duracao, ganho, tipoFiltro = "highpass", frequencia = 6000 }) {
  const fonte = contexto.createBufferSource();
  fonte.buffer = ruido;
  const filtro = contexto.createBiquadFilter();
  filtro.type = tipoFiltro;
  filtro.frequency.value = frequencia;
  const volumeDoSopro = contexto.createGain();
  volumeDoSopro.gain.setValueAtTime(ganho, inicio);
  volumeDoSopro.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);
  fonte.connect(filtro).connect(volumeDoSopro).connect(mestre);
  fonte.start(inicio, Math.random() * 0.5);
  fonte.stop(inicio + duracao + 0.02);
}

function tocarPasso(numero, quando) {
  const naBarra = numero % 16;
  const compasso = Math.floor(numero / 16);
  const melodia = MELODIA[numero];
  if (melodia !== null) {
    tom({ frequencia: nota(melodia), inicio: quando, duracao: SEGUNDOS_POR_PASSO * 1.7, ganho: 0.16, filtro: 2600 });
  }
  // baixo em colcheias, alternando oitava
  if (naBarra % 2 === 0) {
    const raiz = RAIZES[compasso];
    const alta = naBarra % 8 === 4;
    tom({ tipo: "triangle", frequencia: nota(alta ? raiz + 12 : raiz), inicio: quando, duracao: SEGUNDOS_POR_PASSO * 1.8, ganho: 0.32, filtro: 900 });
  }
  // bumbo nos tempos 1 e 3, caixa nos tempos 2 e 4, chimbal em todas as colcheias
  if (naBarra === 0 || naBarra === 8 || naBarra === 6) {
    tom({ tipo: "sine", frequencia: 150, ate: 45, inicio: quando, duracao: 0.13, ganho: 0.55, filtro: 400 });
  }
  if (naBarra === 4 || naBarra === 12) {
    sopro({ inicio: quando, duracao: 0.12, ganho: 0.22, tipoFiltro: "bandpass", frequencia: 1800 });
    tom({ tipo: "triangle", frequencia: 200, ate: 120, inicio: quando, duracao: 0.08, ganho: 0.18, filtro: 1500 });
  }
  if (naBarra % 2 === 0) sopro({ inicio: quando, duracao: 0.035, ganho: 0.07 });
}

function agendar() {
  while (proximoTempo < contexto.currentTime + ANTECEDENCIA_S) {
    tocarPasso(passo, proximoTempo);
    proximoTempo += SEGUNDOS_POR_PASSO;
    passo = (passo + 1) % TOTAL_PASSOS;
  }
}

function aoMudarVisibilidade() {
  if (!contexto || !ligado) return;
  if (document.hidden) contexto.suspend();
  else contexto.resume();
}

/** Liga o som (música e efeitos). Chame a partir de um clique. */
export async function ligarSom() {
  preparar();
  if (!contexto) return false;
  await contexto.resume();
  ligado = true;
  return true;
}

export function desligarSom() {
  ligado = false;
  pararMusica();
}

export const somLigado = () => ligado;

/** Começa a música de batalha (se o som estiver ligado). */
export function iniciarMusica() {
  if (!ligado || temporizador) return;
  passo = 0;
  proximoTempo = contexto.currentTime + 0.1;
  temporizador = setInterval(agendar, 25);
  document.addEventListener("visibilitychange", aoMudarVisibilidade);
}

export function pararMusica() {
  clearInterval(temporizador);
  temporizador = 0;
  document.removeEventListener("visibilitychange", aoMudarVisibilidade);
}

/** Volume de 0 a 100 (fica guardado no navegador). */
export function definirVolume(valor) {
  volume = Math.min(100, Math.max(0, Number(valor) || 0));
  if (mestre) mestre.gain.setTargetAtTime((volume / 100) * GANHO_MAXIMO, contexto.currentTime, 0.02);
  try {
    localStorage.setItem(CHAVE_VOLUME, String(volume));
  } catch {
    // Sem armazenamento: o volume só não fica guardado.
  }
}

export const volumeAtual = () => volume;

/** Efeitos sonoros curtos: "golpe", "super", "critico", "erro", "entrada", "desmaio", "vitoria" e "derrota". */
export function efeito(nome) {
  if (!ligado || !contexto) return;
  const agora = contexto.currentTime + 0.01;
  switch (nome) {
    case "golpe":
      sopro({ inicio: agora, duracao: 0.16, ganho: 0.35, tipoFiltro: "bandpass", frequencia: 1100 });
      tom({ tipo: "sine", frequencia: 260, ate: 70, inicio: agora, duracao: 0.16, ganho: 0.5, filtro: 800 });
      break;
    case "super":
      efeito("golpe");
      [76, 83, 88].forEach((m, i) => tom({ frequencia: nota(m), inicio: agora + 0.05 + i * 0.06, duracao: 0.14, ganho: 0.1, filtro: 2400 }));
      break;
    case "critico":
      efeito("golpe");
      sopro({ inicio: agora, duracao: 0.3, ganho: 0.4, tipoFiltro: "lowpass", frequencia: 1500 });
      [64, 71, 76].forEach((m) => tom({ tipo: "sawtooth", frequencia: nota(m), inicio: agora + 0.04, duracao: 0.28, ganho: 0.07, filtro: 1800 }));
      break;
    case "erro":
      tom({ tipo: "sine", frequencia: 700, ate: 220, inicio: agora, duracao: 0.28, ganho: 0.18, filtro: 1800 });
      break;
    case "entrada":
      tom({ tipo: "triangle", frequencia: 220, ate: 1100, inicio: agora, duracao: 0.34, ganho: 0.2, filtro: 3000 });
      [84, 88, 91].forEach((m, i) => tom({ frequencia: nota(m), inicio: agora + 0.3 + i * 0.05, duracao: 0.12, ganho: 0.07, filtro: 3000 }));
      break;
    case "desmaio":
      tom({ tipo: "triangle", frequencia: 440, ate: 55, inicio: agora, duracao: 0.9, ganho: 0.3, filtro: 1400 });
      break;
    case "vitoria":
      [72, 76, 79, 84, 79, 84].forEach((m, i) =>
        tom({ frequencia: nota(m), inicio: agora + i * 0.13, duracao: i === 5 ? 0.6 : 0.16, ganho: 0.13, filtro: 2600 }),
      );
      tom({ tipo: "triangle", frequencia: nota(48), inicio: agora, duracao: 1.2, ganho: 0.3, filtro: 800 });
      break;
    case "derrota":
      [69, 66, 62, 57].forEach((m, i) =>
        tom({ tipo: "triangle", frequencia: nota(m), inicio: agora + i * 0.28, duracao: 0.4, ganho: 0.22, filtro: 1500 }),
      );
      break;
  }
}
