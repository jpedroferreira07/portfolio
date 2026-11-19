// Página inicial (e 404): partes comuns (contador e data do rodapé) e os efeitos de movimento da página.
import "./layout.js";
import { carregarMovimento } from "./carregar-movimento.js";

carregarMovimento(async (movimento) => {
  const { efeitosDoInicio } = await import("./efeitos-inicio.js");
  movimento.adicionarEfeitos(efeitosDoInicio);
});
