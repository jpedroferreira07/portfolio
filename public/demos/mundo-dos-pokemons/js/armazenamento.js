// Favoritos salvos no localStorage do navegador.
import { validarPokemon } from "./dados.js";

const CHAVE_FAVORITOS = "pokemonsFavoritos";

/**
 * Lê a lista de favoritos salva. Os dados são validados um a um: se o localStorage foi
 * alterado ou está corrompido, os itens inválidos são ignorados e o site continua funcionando.
 */
export function lerFavoritos() {
  try {
    const salvo = localStorage.getItem(CHAVE_FAVORITOS);
    if (!salvo) return [];
    const lista = JSON.parse(salvo);
    if (!Array.isArray(lista)) return [];

    const vistos = new Set();
    const validos = [];
    for (const item of lista) {
      const pokemon = validarPokemon(item);
      if (pokemon && !vistos.has(pokemon.id)) {
        vistos.add(pokemon.id);
        validos.push(pokemon);
      }
    }
    return validos;
  } catch (erro) {
    console.error("Não foi possível ler os favoritos:", erro);
    return [];
  }
}

/** Salva a lista de favoritos e atualiza o contador do cabeçalho. */
export function salvarFavoritos(lista) {
  try {
    localStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(lista));
  } catch (erro) {
    console.error("Não foi possível salvar os favoritos:", erro);
  }
  atualizarContador();
}

/** Mostra a quantidade de favoritos ao lado do link "Favoritos" do cabeçalho. */
export function atualizarContador() {
  const contador = document.querySelector(".contador-favoritos");
  if (contador) contador.textContent = lerFavoritos().length;
}
