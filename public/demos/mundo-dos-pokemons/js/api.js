// Acesso à PokeAPI: fila de requisições com tentativas, tempo limite e cache no navegador.
import { GOLPE_PADRAO, escolherGolpes } from "./batalha.js";
import { validarPokemon } from "./dados.js";
import { TIPOS } from "./tipos.js";

const API = "https://pokeapi.co/api/v2/";
const BASE = API + "pokemon";
const IMAGENS = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/";
const GRITOS = "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/";
const CHAVE_CACHE = "pokemonsCache";
const VERSAO_CACHE = 2; // muda quando o formato dos dados muda
const VALIDADE_CACHE_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias
const REQUISICOES_AO_MESMO_TEMPO = 8;
const TENTATIVAS = 3;
const TEMPO_LIMITE_MS = 12000;
const LOTE_MINIMO_PARA_MOSTRAR = 24;

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

/** GET em JSON com tempo limite e novas tentativas (espera um pouco mais a cada erro). */
async function buscarJson(url) {
  for (let tentativa = 1; ; tentativa++) {
    const controle = new AbortController();
    const relogio = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);
    try {
      const resposta = await fetch(url, { signal: controle.signal });
      if (!resposta.ok) throw new Error("HTTP " + resposta.status + " em " + url);
      return await resposta.json();
    } catch (erro) {
      if (tentativa >= TENTATIVAS) throw erro;
      await esperar(400 * tentativa);
    } finally {
      clearTimeout(relogio);
    }
  }
}

/** Arte oficial (normal ou shiny) e grito de um pokémon, pelo número. */
export const urlImagem = (id, shiny = false) => IMAGENS + (shiny ? "shiny/" : "") + id + ".png";
export const urlGrito = (id) => GRITOS + id + ".ogg";

const detalhesEmMemoria = new Map(); // id -> detalhes já buscados nesta visita

/** O número do pokémon que está no fim de um endereço da API (".../pokemon-species/25/"). */
function idDaUrl(url) {
  const id = Number(/\/(\d+)\/?$/.exec(url)?.[1]);
  return Number.isInteger(id) ? id : null;
}

/** Transforma a árvore da cadeia de evolução em uma lista de etapas: [[pichu], [pikachu], [raichu]]. */
function etapasDaEvolucao(cadeia) {
  const etapas = [];
  let nivel = [cadeia];
  while (nivel.length > 0) {
    const etapa = nivel
      .map((no) => ({ nome: no.species.name, id: idDaUrl(no.species.url) }))
      .filter((especie) => especie.id !== null && /^[a-z0-9-]{1,40}$/.test(especie.nome));
    if (etapa.length > 0) etapas.push(etapa);
    nivel = nivel.flatMap((no) => no.evolves_to);
  }
  return etapas;
}

/**
 * Detalhes de um pokémon que não ficam na lista da galeria: habilidades e linha de evolução.
 * São buscados só quando alguém abre a janela de detalhes e guardados em memória.
 * @returns {Promise<{ habilidades: string[], evolucao: {nome: string, id: number}[][] }>}
 */
export async function carregarDetalhes(id) {
  if (detalhesEmMemoria.has(id)) return detalhesEmMemoria.get(id);

  const pokemon = await buscarJson(BASE + "/" + id);
  const habilidades = pokemon.abilities
    .map((a) => a.ability.name)
    .filter((nome) => /^[a-z0-9-]{1,40}$/.test(nome));

  let evolucao = [];
  try {
    const especie = await buscarJson(API + "pokemon-species/" + idDaUrl(pokemon.species.url));
    const enderecoDaCadeia = especie.evolution_chain.url;
    if (!enderecoDaCadeia.startsWith(API)) throw new Error("Endereço inesperado: " + enderecoDaCadeia);
    const cadeia = await buscarJson(enderecoDaCadeia);
    evolucao = etapasDaEvolucao(cadeia.chain);
  } catch (erro) {
    console.error("Sem linha de evolução para o pokémon " + id + ":", erro);
  }

  const detalhes = { habilidades, evolucao };
  detalhesEmMemoria.set(id, detalhes);
  return detalhes;
}

/** Valor do status com o nome usado pela API (hp, attack, ...). */
function status(json, nome) {
  const item = json.stats.find((s) => s.stat.name === nome);
  return item ? item.base_stat : 0;
}

/** Converte o JSON da API nos dados do site (só o que a galeria usa). */
function converter(json) {
  return validarPokemon({
    id: json.id,
    nome: json.name,
    hp: status(json, "hp"),
    peso: json.weight / 10, // hectogramas -> kg
    altura: json.height / 10, // decímetros -> m
    tipos: json.types.map((t) => t.type.name),
    imagem: json.sprites.other["official-artwork"].front_default || json.sprites.front_default,
    estatisticas: {
      hp: status(json, "hp"),
      ataque: status(json, "attack"),
      defesa: status(json, "defense"),
      ataqueEspecial: status(json, "special-attack"),
      defesaEspecial: status(json, "special-defense"),
      velocidade: status(json, "speed"),
    },
  });
}

/** Um pokémon completo (com status), pelo número. Usado quando só se tem os dados antigos dos favoritos. */
export async function carregarPokemon(id) {
  return converter(await buscarJson(BASE + "/" + id));
}

function lerCache() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE_CACHE));
    if (!salvo || salvo.versao !== VERSAO_CACHE || Date.now() - salvo.em > VALIDADE_CACHE_MS) return null;
    if (!Array.isArray(salvo.dados)) return null;
    const lista = salvo.dados.map(validarPokemon).filter(Boolean);
    return lista.length === salvo.dados.length ? lista : null;
  } catch {
    return null;
  }
}

function salvarCache(lista) {
  try {
    localStorage.setItem(CHAVE_CACHE, JSON.stringify({ versao: VERSAO_CACHE, em: Date.now(), dados: lista }));
  } catch {
    // Sem espaço ou sem permissão: o site funciona do mesmo jeito, só não guarda o cache.
  }
}

/**
 * Carrega todos os pokémons.
 *
 * A API devolve só 20 itens por padrão: pedimos primeiro o total (count) e depois a lista inteira
 * (limit=count). Cada pokémon é buscado por uma fila de até 8 requisições ao mesmo tempo.
 * A lista pronta fica guardada por 7 dias, então a segunda visita é instantânea e a PokeAPI
 * recebe bem menos pedidos.
 *
 * @param {object} callbacks
 * @param {(novos: object[]) => void} callbacks.aoReceber chamado com os próximos pokémons, sempre em ordem
 * @param {(feitos: number, total: number) => void} [callbacks.aoProgredir]
 * @returns {Promise<{ total: number, falhas: number }>}
 */
export async function carregarPokemons({ aoReceber, aoProgredir = () => {} }) {
  const guardados = lerCache();
  if (guardados) {
    aoReceber(guardados);
    return { total: guardados.length, falhas: 0 };
  }

  const { count } = await buscarJson(BASE + "?limit=1");
  const { results } = await buscarJson(BASE + "?limit=" + count);

  const total = results.length;
  const resultados = new Array(total); // undefined = ainda não chegou, null = falhou
  const todos = [];
  let proximo = 0;
  let feitos = 0;
  let falhas = 0;
  let mostrados = 0; // quantos já foram entregues para a tela, em ordem

  function entregar(forcar) {
    const novos = [];
    let posicao = mostrados;
    while (posicao < total && resultados[posicao] !== undefined) {
      if (resultados[posicao]) novos.push(resultados[posicao]);
      posicao++;
    }
    if (novos.length >= LOTE_MINIMO_PARA_MOSTRAR || (forcar && posicao > mostrados)) {
      mostrados = posicao;
      todos.push(...novos);
      if (novos.length > 0) aoReceber(novos);
    }
  }

  async function trabalhador() {
    while (proximo < total) {
      const indice = proximo++;
      try {
        resultados[indice] = converter(await buscarJson(results[indice].url));
        if (!resultados[indice]) falhas++;
      } catch (erro) {
        console.error("Falha ao buscar " + results[indice].name + ":", erro);
        resultados[indice] = null;
        falhas++;
      }
      feitos++;
      aoProgredir(feitos, total);
      entregar(false);
    }
  }

  await Promise.all(Array.from({ length: REQUISICOES_AO_MESMO_TEMPO }, trabalhador));
  entregar(true);

  if (falhas === 0) salvarCache(todos);
  return { total, falhas };
}

// ---------- Golpes para a arena de batalha ----------
const GOLPES_SORTEADOS = 22; // quantos golpes da lista do pokémon são consultados
/** Golpes que fazem o próprio pokémon desmaiar ou dependem de regras que a arena não tem: ficam de fora. */
const GOLPES_EXCLUIDOS = new Set([
  "explosion", "self-destruct", "misty-explosion", "final-gambit", "memento", "mind-blown", "steel-beam",
  "belly-drum", "counter", "mirror-coat", "metal-burst", "bide", "focus-punch", "last-resort", "dream-eater",
]);

const golpesEmMemoria = new Map(); // endereço do golpe -> golpe já validado (ou null se não serve)
const listasDeGolpes = new Map(); // id do pokémon -> golpes já escolhidos nesta visita

/** Confere os dados de um golpe da API; só entram golpes de dano, físicos ou especiais. */
function validarGolpe(bruto) {
  const nome = bruto?.name;
  const poder = bruto?.power;
  const precisao = bruto?.accuracy;
  const tipo = bruto?.type?.name;
  const classe = bruto?.damage_class?.name;
  if (typeof nome !== "string" || !/^[a-z0-9-]{1,40}$/.test(nome) || GOLPES_EXCLUIDOS.has(nome)) return null;
  if (!Number.isInteger(poder) || poder < 1 || poder > 250) return null;
  if (precisao !== null && !(Number.isInteger(precisao) && precisao >= 1 && precisao <= 100)) return null;
  if (!Object.hasOwn(TIPOS, tipo) || (classe !== "physical" && classe !== "special")) return null;
  return { nome, tipo, poder, precisao, classe };
}

async function carregarGolpe(url) {
  if (golpesEmMemoria.has(url)) return golpesEmMemoria.get(url);
  let golpe = null;
  try {
    golpe = validarGolpe(await buscarJson(url));
  } catch (erro) {
    console.error("Falha ao buscar o golpe " + url + ":", erro);
  }
  golpesEmMemoria.set(url, golpe);
  return golpe;
}

/** Embaralha uma cópia da lista (Fisher-Yates). */
function embaralhar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Até 4 golpes de dano de um pokémon, para a batalha. Consulta alguns golpes da lista dele (sorteados, então
 * cada batalha pode ter golpes diferentes) e fica com os melhores. Se nenhum servir, usa uma investida.
 * @returns {Promise<{nome: string, tipo: string, poder: number, precisao: number|null, classe: string}[]>}
 */
export async function carregarGolpes(id, tipos) {
  if (listasDeGolpes.has(id)) return listasDeGolpes.get(id);

  const pokemon = await buscarJson(BASE + "/" + id);
  const enderecos = pokemon.moves.map((m) => m.move.url).filter((url) => url.startsWith(API + "move/"));

  const consultados = [];
  const fila = embaralhar(enderecos).slice(0, GOLPES_SORTEADOS);
  async function trabalhador() {
    while (fila.length > 0) {
      const golpe = await carregarGolpe(fila.pop());
      if (golpe) consultados.push(golpe);
    }
  }
  await Promise.all(Array.from({ length: REQUISICOES_AO_MESMO_TEMPO }, trabalhador));

  const unicos = [...new Map(consultados.map((g) => [g.nome, g])).values()];
  const escolhidos = escolherGolpes(unicos, tipos);
  const golpes = escolhidos.length > 0 ? escolhidos : [GOLPE_PADRAO];
  listasDeGolpes.set(id, golpes);
  return golpes;
}
