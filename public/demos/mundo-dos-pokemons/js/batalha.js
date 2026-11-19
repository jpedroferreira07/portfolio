// Regras da batalha (sem nada de tela, para poder testar): status no nível 50, tabela de tipos,
// precisão, dano e a escolha de golpes do adversário controlado pelo site.
// As fórmulas são uma versão simplificada das dos jogos oficiais.

export const NIVEL = 50;

/** Chance de acerto crítico (1 em 16, como nos jogos). */
const CHANCE_CRITICO = 1 / 16;

/** Dificuldades do adversário: com que frequência ele escolhe o melhor golpe. */
export const DIFICULDADES = {
  facil: { nome: "Fácil", chanceDoMelhor: 0 },
  normal: { nome: "Normal", chanceDoMelhor: 0.7 },
  dificil: { nome: "Difícil", chanceDoMelhor: 1 },
};

// Tabela de tipos: para cada tipo de golpe, quem leva o dobro, quem leva metade e quem não leva nada.
const TABELA = {
  normal: { dobro: [], metade: ["rock", "steel"], nada: ["ghost"] },
  fire: { dobro: ["grass", "ice", "bug", "steel"], metade: ["fire", "water", "rock", "dragon"], nada: [] },
  water: { dobro: ["fire", "ground", "rock"], metade: ["water", "grass", "dragon"], nada: [] },
  electric: { dobro: ["water", "flying"], metade: ["electric", "grass", "dragon"], nada: ["ground"] },
  grass: {
    dobro: ["water", "ground", "rock"],
    metade: ["fire", "grass", "poison", "flying", "bug", "dragon", "steel"],
    nada: [],
  },
  ice: { dobro: ["grass", "ground", "flying", "dragon"], metade: ["fire", "water", "ice", "steel"], nada: [] },
  fighting: {
    dobro: ["normal", "ice", "rock", "dark", "steel"],
    metade: ["poison", "flying", "psychic", "bug", "fairy"],
    nada: ["ghost"],
  },
  poison: { dobro: ["grass", "fairy"], metade: ["poison", "ground", "rock", "ghost"], nada: ["steel"] },
  ground: { dobro: ["fire", "electric", "poison", "rock", "steel"], metade: ["grass", "bug"], nada: ["flying"] },
  flying: { dobro: ["grass", "fighting", "bug"], metade: ["electric", "rock", "steel"], nada: [] },
  psychic: { dobro: ["fighting", "poison"], metade: ["psychic", "steel"], nada: ["dark"] },
  bug: {
    dobro: ["grass", "psychic", "dark"],
    metade: ["fire", "fighting", "poison", "flying", "ghost", "steel", "fairy"],
    nada: [],
  },
  rock: { dobro: ["fire", "ice", "flying", "bug"], metade: ["fighting", "ground", "steel"], nada: [] },
  ghost: { dobro: ["psychic", "ghost"], metade: ["dark"], nada: ["normal"] },
  dragon: { dobro: ["dragon"], metade: ["steel"], nada: ["fairy"] },
  dark: { dobro: ["psychic", "ghost"], metade: ["fighting", "dark", "fairy"], nada: [] },
  steel: { dobro: ["ice", "rock", "fairy"], metade: ["fire", "water", "electric", "steel"], nada: [] },
  fairy: { dobro: ["fighting", "dragon", "dark"], metade: ["fire", "poison", "steel"], nada: [] },
};

/** Gera um número de 0 a 1 (troque por um valor fixo nos testes). */
const sorteio = () => Math.random();

/** Status de batalha no nível 50 a partir dos status base (sem IVs extras nem esforço, tudo igual para os dois lados). */
export function calcularStatus(base) {
  const comum = (valor) => Math.floor(((2 * valor + 31 + 21) * NIVEL) / 100) + 5;
  return {
    hp: Math.floor(((2 * base.hp + 31 + 21) * NIVEL) / 100) + NIVEL + 10,
    ataque: comum(base.ataque),
    defesa: comum(base.defesa),
    ataqueEspecial: comum(base.ataqueEspecial),
    defesaEspecial: comum(base.defesaEspecial),
    velocidade: comum(base.velocidade),
  };
}

/** Multiplicador de um golpe contra um pokémon: 0 (sem efeito), 0,25, 0,5, 1, 2 ou 4. */
export function multiplicadorDeTipo(tipoDoGolpe, tiposDoAlvo) {
  const linha = TABELA[tipoDoGolpe];
  if (!linha) return 1;
  let total = 1;
  for (const tipo of tiposDoAlvo) {
    if (linha.nada.includes(tipo)) return 0;
    if (linha.dobro.includes(tipo)) total *= 2;
    if (linha.metade.includes(tipo)) total *= 0.5;
  }
  return total;
}

/** Texto e classe para avisar o quanto o golpe foi efetivo (ou null se foi normal). */
export function descreverEfetividade(multiplicador) {
  if (multiplicador === 0) return { texto: "Não teve efeito...", nivel: "nulo" };
  if (multiplicador >= 2) return { texto: "Super efetivo!", nivel: "super" };
  if (multiplicador < 1) return { texto: "Não foi muito efetivo...", nivel: "fraco" };
  return null;
}

/** Cria um lutador pronto para a batalha. */
export function criarLutador(pokemon, golpes) {
  const status = calcularStatus(pokemon.estatisticas);
  return {
    id: pokemon.id,
    nome: pokemon.nome,
    tipos: pokemon.tipos,
    imagem: pokemon.imagem,
    status,
    hp: status.hp,
    hpMaximo: status.hp,
    golpes,
  };
}

/** O golpe acertou? Golpes sem precisão (null) nunca erram. */
export function acertou(golpe, aleatorio = sorteio()) {
  return golpe.precisao === null || aleatorio * 100 < golpe.precisao;
}

/**
 * Dano de um golpe. Retorna também o multiplicador de tipo, se foi crítico e se teve bônus do mesmo tipo (STAB).
 * @param {{ atacante: object, defensor: object, golpe: object, aleatorio?: number, critico?: boolean }} dados
 *   aleatorio: de 0 a 1, define a variação do dano (de 85% a 100%)
 */
export function calcularDano({ atacante, defensor, golpe, aleatorio = sorteio(), critico = sorteio() < CHANCE_CRITICO }) {
  const multiplicador = multiplicadorDeTipo(golpe.tipo, defensor.tipos);
  if (multiplicador === 0) return { dano: 0, multiplicador, critico: false, stab: false };

  const fisico = golpe.classe === "physical";
  const ataque = fisico ? atacante.status.ataque : atacante.status.ataqueEspecial;
  const defesa = fisico ? defensor.status.defesa : defensor.status.defesaEspecial;
  const base = Math.floor(Math.floor(((2 * NIVEL) / 5 + 2) * golpe.poder * (ataque / defesa)) / 50) + 2;

  const stab = atacante.tipos.includes(golpe.tipo);
  const variacao = 0.85 + 0.15 * aleatorio;
  const total = base * (stab ? 1.5 : 1) * multiplicador * (critico ? 1.5 : 1) * variacao;
  return { dano: Math.max(1, Math.floor(total)), multiplicador, critico, stab };
}

/** Quem ataca primeiro: o mais rápido (empate é sorteado). Retorna "jogador" ou "rival". */
export function quemComeca(jogador, rival, aleatorio = sorteio()) {
  if (jogador.status.velocidade !== rival.status.velocidade) {
    return jogador.status.velocidade > rival.status.velocidade ? "jogador" : "rival";
  }
  return aleatorio < 0.5 ? "jogador" : "rival";
}

/** O quanto um golpe tira, em média, de um alvo (usado pelo adversário para escolher). */
export function danoEsperado(atacante, defensor, golpe) {
  const { dano } = calcularDano({ atacante, defensor, golpe, aleatorio: 0.5, critico: false });
  return dano * ((golpe.precisao ?? 100) / 100);
}

/** O adversário escolhe um golpe: o melhor, ou um qualquer, conforme a dificuldade. */
export function escolherGolpeDoRival(rival, jogador, dificuldade, aleatorio = sorteio) {
  const { chanceDoMelhor } = DIFICULDADES[dificuldade] ?? DIFICULDADES.normal;
  const golpes = rival.golpes;
  if (aleatorio() < chanceDoMelhor) {
    return golpes.reduce((melhor, golpe) =>
      danoEsperado(rival, jogador, golpe) > danoEsperado(rival, jogador, melhor) ? golpe : melhor,
    );
  }
  return golpes[Math.floor(aleatorio() * golpes.length)];
}

/**
 * Escolhe até 4 golpes entre os candidatos: o melhor do mesmo tipo do pokémon, depois os mais fortes
 * de tipos diferentes e, se faltar, os mais fortes que sobrarem.
 */
export function escolherGolpes(candidatos, tiposDoPokemon) {
  const valor = (golpe) =>
    golpe.poder * ((golpe.precisao ?? 100) / 100) * (tiposDoPokemon.includes(golpe.tipo) ? 1.5 : 1);
  const ordenados = [...candidatos].sort((a, b) => valor(b) - valor(a));
  const escolhidos = [];

  const doMesmoTipo = ordenados.find((golpe) => tiposDoPokemon.includes(golpe.tipo));
  if (doMesmoTipo) escolhidos.push(doMesmoTipo);
  for (const golpe of ordenados) {
    if (escolhidos.length >= 4) break;
    if (!escolhidos.includes(golpe) && !escolhidos.some((outro) => outro.tipo === golpe.tipo)) escolhidos.push(golpe);
  }
  for (const golpe of ordenados) {
    if (escolhidos.length >= 4) break;
    if (!escolhidos.includes(golpe)) escolhidos.push(golpe);
  }
  return escolhidos;
}

/** Golpe usado quando não há nenhum golpe de dano na lista do pokémon. */
export const GOLPE_PADRAO = { nome: "tackle", tipo: "normal", poder: 40, precisao: 100, classe: "physical" };

/** Cor do medidor de HP conforme a vida que sobra: "verde", "amarelo" ou "vermelho". */
export function corDoHp(hp, hpMaximo) {
  const parte = hp / hpMaximo;
  if (parte > 0.5) return "verde";
  if (parte > 0.2) return "amarelo";
  return "vermelho";
}
