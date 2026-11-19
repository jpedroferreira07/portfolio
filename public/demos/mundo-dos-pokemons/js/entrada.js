// Script clássico e bem pequeno que roda ANTES da página aparecer (fica no <head>, sem defer).
// Ele deixa o <html> pronto no primeiro desenho, para a página não "piscar":
//   .js                    -> existe JavaScript (os efeitos de aparecer ao rolar só escondem nesse caso)
//   data-animacoes         -> a pessoa pausou as animações pelo botão do cabeçalho
//   .chegando              -> cobre a tela até a cortina abrir (só na troca de página por um link do site)
(function () {
  const html = document.documentElement;
  html.classList.add("js");

  try {
    const pausadas = localStorage.getItem("animacoesPausadas") === "1";
    if (pausadas) html.dataset.animacoes = "pausadas";

    const menosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // A cortina só abre quando a pessoa troca de página por um link do site, nunca ao abrir o site.
    const veioDeUmLink = sessionStorage.getItem("cortinaTransicao") === "1";
    if (veioDeUmLink && !pausadas && !menosMovimento) html.classList.add("chegando");

    sessionStorage.removeItem("cortinaTransicao");
  } catch {
    // Sem acesso ao armazenamento (modo privado, por exemplo): o site funciona sem os efeitos de chegada.
  }
})();
