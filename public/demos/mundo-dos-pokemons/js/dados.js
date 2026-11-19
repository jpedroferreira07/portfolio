// Validação dos dados de pokémons. Tudo que vem de fora (API ou localStorage) passa por aqui
// antes de ir para a tela, porque o localStorage pode ser editado por qualquer pessoa.
import { TIPOS } from "./tipos.js";

export const IMAGEM_PADRAO = "imagens/logo.svg";

/** Os seis status de batalha, na ordem em que aparecem na tela. */
export const ESTATISTICAS = {
  hp: "HP",
  ataque: "Ataque",
  defesa: "Defesa",
  ataqueEspecial: "Ataque esp.",
  defesaEspecial: "Defesa esp.",
  velocidade: "Velocidade",
};

const ORIGENS_DE_IMAGEM = ["https://raw.githubusercontent.com/PokeAPI/", "imagens/"];

function ehNumero(valor, minimo, maximo) {
  return typeof valor === "number" && Number.isFinite(valor) && valor >= minimo && valor <= maximo;
}

/** Só aceita imagens da PokeAPI ou da pasta imagens/ do próprio site. */
export function imagemSegura(url) {
  const permitida =
    typeof url === "string" && url.length < 300 && ORIGENS_DE_IMAGEM.some((origem) => url.startsWith(origem));
  return permitida && !url.includes("..") ? url : IMAGEM_PADRAO;
}

/** Os seis status, se todos forem válidos; senão null (os dados antigos dos favoritos não têm). */
function validarEstatisticas(bruto) {
  if (!bruto || typeof bruto !== "object") return null;
  const limpo = {};
  for (const chave of Object.keys(ESTATISTICAS)) {
    if (!ehNumero(bruto[chave], 0, 300)) return null;
    limpo[chave] = bruto[chave];
  }
  return limpo;
}

/** Soma dos seis status (usada para ordenar e para destacar os mais fortes). */
export function totalEstatisticas(pokemon) {
  return pokemon.estatisticas ? Object.values(pokemon.estatisticas).reduce((a, b) => a + b, 0) : pokemon.hp;
}

/**
 * Confere e limpa um pokémon.
 * @returns {object|null} o pokémon com os campos certos, ou null se os dados forem inválidos
 */
export function validarPokemon(bruto) {
  if (!bruto || typeof bruto !== "object") return null;

  const { id, nome, hp, peso, altura, tipos, imagem } = bruto;
  if (!Number.isInteger(id) || id < 1 || id > 100000) return null;
  if (typeof nome !== "string" || !/^[a-z0-9-]{1,40}$/.test(nome)) return null;
  if (!ehNumero(hp, 0, 1000) || !ehNumero(peso, 0, 100000) || !ehNumero(altura, 0, 1000)) return null;

  const tiposValidos = Array.isArray(tipos) ? tipos.filter((tipo) => Object.hasOwn(TIPOS, tipo)) : [];
  if (tiposValidos.length === 0) return null;

  const pokemon = { id, nome, hp, peso, altura, tipos: tiposValidos, imagem: imagemSegura(imagem) };
  const estatisticas = validarEstatisticas(bruto.estatisticas);
  if (estatisticas) pokemon.estatisticas = estatisticas;
  return pokemon;
}
