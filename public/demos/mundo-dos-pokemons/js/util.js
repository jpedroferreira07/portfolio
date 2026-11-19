// Funções pequenas usadas em várias partes do site.

/** Tira acentos, deixa em minúsculas e remove espaços nas pontas (usado na busca). */
export function normalizar(texto) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/** Primeira letra maiúscula: "bulbasaur" vira "Bulbasaur". */
export function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Número com vírgula decimal, como no Brasil (ex.: 6,9). */
export function formatarNumero(numero, casasMaximas = 1) {
  return numero.toLocaleString("pt-BR", { maximumFractionDigits: casasMaximas });
}

/** Fala uma mensagem para leitores de tela (a região #anuncios está em todas as páginas). */
export function anunciar(mensagem) {
  const regiao = document.getElementById("anuncios");
  if (!regiao) return;
  regiao.textContent = "";
  // Limpar e escrever em seguida faz o leitor repetir mesmo uma mensagem igual à anterior.
  setTimeout(() => {
    regiao.textContent = mensagem;
  }, 50);
}

/** Cria um elemento com classe e texto (o texto entra como texto, nunca como HTML). */
export function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

/**
 * Está sem permissão para animar? É verdade quando a pessoa pediu menos movimento no sistema
 * ou usou o botão de pausar animações do site.
 */
export function semMovimento() {
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.dataset.animacoes === "pausadas"
  );
}
