// Filtros e ordenação da galeria (funções puras, sem acesso à página, por isso são fáceis de testar).
import { totalEstatisticas } from "./dados.js";
import { TIPOS } from "./tipos.js";
import { normalizar } from "./util.js";

/** Gerações pelo número do pokémon. "especiais" são formas alternativas (ids acima de 10000). */
export const GERACOES = {
  1: { nome: "Geração 1 (Kanto)", de: 1, ate: 151 },
  2: { nome: "Geração 2 (Johto)", de: 152, ate: 251 },
  3: { nome: "Geração 3 (Hoenn)", de: 252, ate: 386 },
  4: { nome: "Geração 4 (Sinnoh)", de: 387, ate: 493 },
  5: { nome: "Geração 5 (Unova)", de: 494, ate: 649 },
  6: { nome: "Geração 6 (Kalos)", de: 650, ate: 721 },
  7: { nome: "Geração 7 (Alola)", de: 722, ate: 809 },
  8: { nome: "Geração 8 (Galar)", de: 810, ate: 905 },
  9: { nome: "Geração 9 (Paldea)", de: 906, ate: 1025 },
  especiais: { nome: "Formas especiais", de: 10001, ate: Infinity },
};

/** Formas de ordenar. "direcao" 1 = do menor para o maior; -1 = do maior para o menor. */
export const ORDENACOES = {
  numero: { nome: "Número (menor primeiro)", valor: (p) => p.id, direcao: 1 },
  nome: { nome: "Nome (A a Z)", valor: (p) => p.nome, direcao: 1 },
  hp: { nome: "HP (maior primeiro)", valor: (p) => p.hp, direcao: -1 },
  peso: { nome: "Peso (maior primeiro)", valor: (p) => p.peso, direcao: -1 },
  altura: { nome: "Altura (maior primeiro)", valor: (p) => p.altura, direcao: -1 },
  total: { nome: "Total de status (maior primeiro)", valor: (p) => totalEstatisticas(p), direcao: -1 },
};

export const ESTADO_INICIAL = Object.freeze({ busca: "", tipos: [], geracao: "", ordem: "numero" });

export function geracaoDo(pokemon) {
  for (const [chave, { de, ate }] of Object.entries(GERACOES)) {
    if (pokemon.id >= de && pokemon.id <= ate) return chave;
  }
  return "";
}

/** Há algum filtro ligado? (ordenar não conta como filtro) */
export function temFiltro(estado) {
  return estado.busca.trim() !== "" || estado.tipos.length > 0 || estado.geracao !== "";
}

/**
 * Aplica busca, tipos (o pokémon precisa ter TODOS os tipos escolhidos), geração e ordenação.
 * A busca compara o nome e o nome do tipo, sem acentos e sem diferença de maiúsculas.
 */
export function filtrar(lista, estado) {
  const termo = normalizar(estado.busca);
  const resultado = lista.filter((pokemon) => {
    if (estado.tipos.length > 0 && !estado.tipos.every((tipo) => pokemon.tipos.includes(tipo))) return false;
    if (estado.geracao !== "" && geracaoDo(pokemon) !== estado.geracao) return false;
    if (termo === "") return true;
    return (
      normalizar(pokemon.nome).includes(termo) ||
      pokemon.tipos.some((tipo) => tipo.includes(termo) || normalizar(TIPOS[tipo]).includes(termo))
    );
  });

  const { valor, direcao } = ORDENACOES[estado.ordem] ?? ORDENACOES.numero;
  return resultado.sort((a, b) => {
    const va = valor(a);
    const vb = valor(b);
    const comparacao = typeof va === "string" ? va.localeCompare(vb, "pt-BR") : va - vb;
    return comparacao * direcao || a.id - b.id; // empate: pelo número
  });
}

/** Lê o estado dos filtros do endereço (?q=&tipos=&geracao=&ordem=), aceitando só valores conhecidos. */
export function lerEstadoDaUrl(textoDaUrl) {
  const parametros = new URLSearchParams(textoDaUrl);
  const tipos = (parametros.get("tipos") ?? "")
    .split(",")
    .filter((tipo) => Object.hasOwn(TIPOS, tipo));
  const geracao = parametros.get("geracao") ?? "";
  const ordem = parametros.get("ordem") ?? "";
  return {
    busca: (parametros.get("q") ?? "").slice(0, 60),
    tipos: [...new Set(tipos)],
    geracao: Object.hasOwn(GERACOES, geracao) ? geracao : "",
    ordem: Object.hasOwn(ORDENACOES, ordem) ? ordem : "numero",
  };
}

/** Texto do endereço (sem o "?") para um estado; só inclui o que foge do padrão. */
export function estadoParaUrl(estado) {
  const parametros = new URLSearchParams();
  if (estado.busca.trim() !== "") parametros.set("q", estado.busca.trim());
  if (estado.tipos.length > 0) parametros.set("tipos", estado.tipos.join(","));
  if (estado.geracao !== "") parametros.set("geracao", estado.geracao);
  if (estado.ordem !== "numero") parametros.set("ordem", estado.ordem);
  return parametros.toString();
}
