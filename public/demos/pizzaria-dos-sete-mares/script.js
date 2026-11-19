/**
 * =============================================================================
 * ARQUIVO   : script.js
 * PROJETO   : Pizzaria dos Sete Mares
 * DESCRIÇÃO : Todo o comportamento (JavaScript) do site. Este mesmo arquivo é
 *             carregado pelas três páginas (index.html, servicos.html e
 *             contato.html), por isso cada bloco abaixo SÓ executa se os
 *             elementos que ele usa existirem na página aberta.
 *
 * ÍNDICE
 *   1. Menu mobile (hambúrguer)
 *   2. Cabeçalho que muda ao rolar a página
 *   3. Revelar elementos ao rolar (animação de entrada)
 *   4. Cardápio: filtro por categoria e escolha de tamanho
 *   5. Formulário de contato: máscara, validação e envio simulado
 *      (5.4: a folha vira uma garrafa que mergulha no mar, ~5 segundos)
 *   6. Selo "Aberto agora / Fechado"
 *   7. Animações e interações
 *      7.1 Onda de água ao clicar
 *      7.2 Transição entre páginas (o navio segue a ordem do menu)
 *      7.3 Barra de progresso de rolagem
 *      7.4 Bússola: voltar ao topo (balança quando aparece na tela)
 *      7.5 Pausar animações (botão no rodapé)
 *   8. Ano atual no rodapé
 *
 * OBSERVAÇÕES PARA QUEM FOR DAR MANUTENÇÃO
 *   - O código inteiro fica dentro de uma IIFE (função que se executa sozinha),
 *     para que as variáveis NÃO virem variáveis globais da página.
 *   - Os nomes de classes CSS usados aqui (ex.: "visivel", "aberto", "erro")
 *     estão definidos no arquivo style.css.
 *   - Convenção de nomes: variáveis e funções em português, em camelCase.
 *   - Declarações: usamos const para valores que não são reatribuídos e let
 *     para os que mudam (tamanho, navegando, primeiroErro, visiveis, formatado
 *     e destino). O var, forma antiga do JavaScript, não é mais usado.
 * =============================================================================
 */
(function () {
  "use strict"; // modo estrito: o navegador avisa sobre erros comuns de código

  // Respeita quem pediu "reduzir movimento" nas configurações do sistema
  // (acessibilidade) e também quem pausou as animações pelo botão do site.
  const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /**
   * Informa se as animações decorativas devem ficar desligadas agora.
   * @returns {boolean} true se o sistema pediu menos movimento OU se a pessoa
   *                    pausou as animações no site (atributo data-animacoes).
   */
  const semMovimentoGeral = function () {
    return semMovimento || document.documentElement.dataset.animacoes === "pausadas";
  };

  /* ==========================================================================
     1. MENU MOBILE (HAMBÚRGUER)
     No celular a navegação fica escondida; o botão "hambúrguer" abre e fecha.
     ========================================================================== */
  const botaoMenu = document.querySelector(".btn-menu"); // botão com o ícone de 3 linhas
  const nav = document.getElementById("menu-principal"); // <nav> com os links

  // Só continua se a página realmente tiver o botão e o menu.
  if (botaoMenu && nav) {
    /**
     * Abre ou fecha o menu e mantém a acessibilidade (leitores de tela).
     * @param {boolean} abrir - true para abrir o menu, false para fechar.
     * @returns {void}
     */
    const alternar = function (abrir) {
      botaoMenu.setAttribute("aria-expanded", String(abrir)); // informa o estado ao leitor de tela
      botaoMenu.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
      nav.classList.toggle("aberto", abrir); // o CSS faz a animação de abrir/fechar
    };

    // Clique no botão: inverte o estado atual (aberto -> fechado e vice-versa).
    botaoMenu.addEventListener("click", function () {
      const estaAberto = botaoMenu.getAttribute("aria-expanded") === "true";
      alternar(!estaAberto);
    });

    // Clique em qualquer link do menu: fecha o menu (a página vai mudar).
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) alternar(false);
    });

    // Tecla ESC fecha o menu, como esperado em menus acessíveis.
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || botaoMenu.getAttribute("aria-expanded") !== "true") return;
      alternar(false);
      botaoMenu.focus(); // devolve o foco ao botão, para quem navega pelo teclado não "se perder"
    });
  }

  /* ==========================================================================
     2. CABEÇALHO QUE MUDA AO ROLAR A PÁGINA
     Depois de rolar 30px, o cabeçalho ganha a classe "rolou" (fundo desfocado
     e sombra, definidos no CSS).
     ========================================================================== */
  const cabecalho = document.querySelector(".cabecalho");

  if (cabecalho) {
    /**
     * Liga ou desliga a classe "rolou" conforme a posição da rolagem.
     * @returns {void}
     */
    const aoRolar = function () {
      cabecalho.classList.toggle("rolou", window.scrollY > 30);
    };

    // { passive: true } avisa ao navegador que não bloquearemos a rolagem,
    // o que deixa a página mais fluida.
    window.addEventListener("scroll", aoRolar, { passive: true });
    aoRolar(); // roda uma vez ao carregar (a página pode abrir já rolada)
  }

  /* ==========================================================================
     3. REVELAR ELEMENTOS AO ROLAR (ANIMAÇÃO DE ENTRADA)
     Elementos com a classe "revelar" começam invisíveis (CSS) e ganham a
     classe "visivel" quando entram na tela. Usamos o IntersectionObserver,
     que avisa quando um elemento aparece, sem precisar calcular posições
     a cada rolagem.
     ========================================================================== */
  const revelaveis = document.querySelectorAll(".revelar");

  if ("IntersectionObserver" in window) {
    const observador = new IntersectionObserver(
      /**
       * Chamada pelo navegador sempre que a visibilidade de algum
       * elemento observado muda.
       * @param {IntersectionObserverEntry[]} entradas - elementos que mudaram.
       * @returns {void}
       */
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("visivel");
            observador.unobserve(entrada.target); // anima só uma vez
          }
        });
      },
      // threshold 0: dispara assim que QUALQUER pedaço aparece. Antes usávamos
      // 0.12 (12%), mas elementos muito altos (como o cartão do formulário)
      // nunca atingiam 12% visíveis na tela e ficavam invisíveis.
      // rootMargin negativo embaixo: espera o elemento subir um pouco antes.
      { threshold: 0, rootMargin: "0px 0px -60px 0px" }
    );
    revelaveis.forEach(function (el) { observador.observe(el); });
  } else {
    // Navegador muito antigo, sem IntersectionObserver: mostra tudo de uma vez.
    revelaveis.forEach(function (el) { el.classList.add("visivel"); });
  }

  /**
   * Rede de segurança: revela, por cálculo de posição, todo elemento .revelar
   * que já esteja dentro da área visível da janela. Garante que o conteúdo
   * apareça ao carregar a página mesmo se o IntersectionObserver demorar ou
   * falhar (foi o que escondia o cartão do formulário na página de contato).
   * @returns {void}
   */
  const revelarOsQueJaEstaoNaTela = function () {
    revelaveis.forEach(function (el) {
      if (el.classList.contains("visivel")) return;
      const caixa = el.getBoundingClientRect(); // posição do elemento em relação à janela
      const estaNaTela = caixa.top < window.innerHeight - 40 && caixa.bottom > 0;
      if (estaNaTela) el.classList.add("visivel");
    });
  };

  revelarOsQueJaEstaoNaTela();                                  // ao executar o script
  window.addEventListener("load", revelarOsQueJaEstaoNaTela);   // quando imagens e fontes terminam de carregar
  window.addEventListener("scroll", revelarOsQueJaEstaoNaTela, { passive: true }); // e a cada rolagem

  /* ==========================================================================
     4. CARDÁPIO: FILTRO POR CATEGORIA E ESCOLHA DE TAMANHO
     (só roda em servicos.html)
     Cada card <article class="pizza"> tem no HTML:
       data-categoria="tradicionais|especiais|doces"
       data-precos="preçoP,preçoM,preçoG"   (ex.: "35.90,50.90,64.90")
     ========================================================================== */
  const grade = document.getElementById("cardapio-grade");

  if (grade) {
    // querySelectorAll devolve uma NodeList; convertemos para Array comum.
    const pizzas = Array.prototype.slice.call(grade.querySelectorAll(".pizza"));
    const chipsCategoria = document.querySelectorAll("[data-filtro]");  // botões de categoria
    const chipsTamanho = document.querySelectorAll("[data-tamanho]");   // botões P / M / G
    const aviso = document.getElementById("sem-resultado"); // mensagem "nenhum sabor"

    let tamanho = 1; // tamanho escolhido: índice 0 = Pequena, 1 = Média, 2 = Grande
    const nomesTamanho = ["Pequena", "Média", "Grande"];

    /**
     * Converte um número para o formato de moeda brasileiro.
     * @param {number} n - valor em reais (ex.: 50.9).
     * @returns {string} texto formatado (ex.: "R$ 50,90").
     */
    const formatar = function (n) {
      return "R$ " + n.toFixed(2).replace(".", ",");
    };

    /**
     * Atualiza, em todos os cards, o preço, o nome do tamanho e o link do
     * botão "Pedir" (que abre o WhatsApp já com a mensagem pronta).
     * Usa a variável "tamanho" para saber qual preço mostrar.
     * @returns {void}
     */
    const atualizarPrecos = function () {
      pizzas.forEach(function (p) {
        // "35.90,50.90,64.90" -> [35.9, 50.9, 64.9]
        const valores = p.dataset.precos.split(",").map(Number);
        p.querySelector(".valor").textContent = formatar(valores[tamanho]);
        p.querySelector(".nome-tamanho").textContent = nomesTamanho[tamanho];

        // Monta o texto do pedido e o codifica para poder ir dentro de uma URL.
        const link = p.querySelector(".pedir");
        const texto = "Olá, piratas! Quero uma pizza " + nomesTamanho[tamanho].toLowerCase() +
          " de " + p.querySelector("h3").textContent + ".";
        link.href = "https://wa.me/5500000000000?text=" + encodeURIComponent(texto);
        // Nome acessível único (há 12 botões "Pedir" na página).
        link.setAttribute("aria-label", "Pedir pizza " + nomesTamanho[tamanho].toLowerCase() + " de " +
          p.querySelector("h3").textContent + " pelo WhatsApp (abre em nova aba)");
      });
    };

    /**
     * Mostra só as pizzas da categoria escolhida.
     * @param {string} categoria - "todas", "tradicionais", "especiais" ou "doces".
     * @returns {void}
     */
    const filtrar = function (categoria) {
      let visiveis = 0; // conta quantos cards ficaram na tela

      pizzas.forEach(function (p) {
        const mostrar = categoria === "todas" || p.dataset.categoria === categoria;
        p.hidden = !mostrar; // atributo "hidden" esconde o card

        if (mostrar) {
          visiveis++;
          // Truque para reiniciar a animação CSS de entrada do card:
          // desliga, força o navegador a recalcular o layout (offsetWidth) e religa.
          p.style.animation = "none";
          void p.offsetWidth;
          p.style.animation = "";
        }
      });

      // Se nenhum card sobrou, mostra o aviso.
      if (aviso) aviso.hidden = visiveis > 0;
    };

    // Clique em um botão de categoria.
    chipsCategoria.forEach(function (chip) {
      chip.addEventListener("click", function () {
        // Desmarca todos e marca só o clicado (aria-pressed também pinta o botão no CSS).
        chipsCategoria.forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
        chip.setAttribute("aria-pressed", "true");
        filtrar(chip.dataset.filtro);
      });
    });

    // Clique em um botão de tamanho (P, M ou G).
    chipsTamanho.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chipsTamanho.forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
        chip.setAttribute("aria-pressed", "true");
        tamanho = Number(chip.dataset.tamanho); // "2" (texto) -> 2 (número)
        atualizarPrecos();
      });
    });

    atualizarPrecos(); // preenche os preços assim que a página abre
  }

  /* ==========================================================================
     5. FORMULÁRIO DE CONTATO: MÁSCARA, VALIDAÇÃO E ENVIO SIMULADO
     (só roda em contato.html)
     ========================================================================== */
  const form = document.getElementById("form-contato");

  if (form) {
    const telefone = document.getElementById("telefone");
    const mensagem = document.getElementById("mensagem");
    const contador = document.getElementById("contador"); // "0 / 500"

    // ---- 5.1 Máscara do telefone: (00) 00000-0000 -------------------------
    // A cada tecla, removemos tudo que não é número e reformatamos o texto.
    telefone.addEventListener("input", function () {
      const digitos = telefone.value.replace(/\D/g, "").slice(0, 11); // \D = "não é dígito"
      let formatado = digitos;

      if (digitos.length > 10) {
        // celular: (11) 98765-4321
        formatado = "(" + digitos.slice(0, 2) + ") " + digitos.slice(2, 7) + "-" + digitos.slice(7);
      } else if (digitos.length > 6) {
        // fixo: (11) 8765-4321
        formatado = "(" + digitos.slice(0, 2) + ") " + digitos.slice(2, 6) + "-" + digitos.slice(6);
      } else if (digitos.length > 2) {
        formatado = "(" + digitos.slice(0, 2) + ") " + digitos.slice(2);
      } else if (digitos.length > 0) {
        formatado = "(" + digitos;
      }
      telefone.value = formatado;
    });

    // ---- 5.2 Contador de caracteres da mensagem ---------------------------
    mensagem.addEventListener("input", function () {
      contador.textContent = mensagem.value.length + " / " + mensagem.maxLength;
    });

    // ---- 5.3 Regras de validação ------------------------------------------
    // Objeto em que a chave é o atributo "name" do campo e o valor é uma
    // função que recebe o texto digitado e devolve:
    //   "" (texto vazio)  -> campo válido
    //   "mensagem de erro" -> campo inválido
    const regras = {
      nome: function (valor) {
        return valor.trim().length < 3 ? "Diga seu nome completo, marujo!" : "";
      },
      email: function (valor) {
        // Expressão regular simples: algo@algo.dominio (sem espaços)
        const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        return formatoEmail.test(valor) ? "" : "Esse e-mail não parece um endereço válido.";
      },
      telefone: function (valor) {
        // O telefone é opcional: vazio é válido; se preencher, precisa de DDD + número.
        const digitos = valor.replace(/\D/g, "");
        return digitos.length === 0 || digitos.length >= 10 ? "" : "Telefone incompleto. Use DDD + número.";
      },
      assunto: function (valor) {
        return valor ? "" : "Escolha um assunto para a mensagem.";
      },
      mensagem: function (valor) {
        return valor.trim().length < 10 ? "Conte um pouco mais (mínimo de 10 caracteres)." : "";
      }
    };

    /**
     * Valida UM campo e mostra ou limpa a mensagem de erro dele.
     * @param {HTMLElement} campo - o <input>, <select> ou <textarea> a validar.
     * @returns {boolean} true se o campo está válido; false se tem erro.
     */
    const validarCampo = function (campo) {
      const regra = regras[campo.name];          // regra correspondente ao campo
      const caixa = campo.closest(".campo");     // <div> que envolve label + campo + erro
      const erro = regra ? regra(campo.value) : "";

      caixa.classList.toggle("erro", !!erro);  // !! converte texto em true/false
      caixa.querySelector(".msg-erro").textContent = erro;
      campo.setAttribute("aria-invalid", erro ? "true" : "false");
      return !erro;
    };

    // Valida cada campo ao sair dele (blur) e revalida enquanto digita, mas
    // só se ele já estiver com erro (para não "brigar" com quem está digitando).
    form.querySelectorAll("input, select, textarea").forEach(function (campo) {
      campo.addEventListener("blur", function () { validarCampo(campo); });
      campo.addEventListener("input", function () {
        if (campo.closest(".campo").classList.contains("erro")) validarCampo(campo);
      });
    });

    // ---- 5.4 Envio do formulário: a folha vira uma garrafa -----------------
    // Elementos que participam da animação (todos definidos em contato.html).
    const cartao = document.getElementById("cartao-form");     // o "palco"
    const folha = document.getElementById("folha");            // formulário que dobra
    const palco = document.getElementById("palco");            // camada com a garrafa
    const caixaGarrafa = document.getElementById("palco-caixa");
    const camadaFundo = palco.querySelector(".camada-fundo");
    const camadaPergaminho = palco.querySelector(".camada-pergaminho");
    const camadaFrente = palco.querySelector(".camada-frente");
    const camadaRolha = palco.querySelector(".camada-rolha");
    const mar = document.getElementById("mar");                // fundo do mar
    const marCorpo = document.getElementById("mar-corpo");     // a água, que sobe e desce
    const marRaios = mar.querySelector(".mar-raios");          // raios de luz
    const marBolhas = document.getElementById("mar-bolhas");   // onde nascem as bolhas
    const marAreia = document.getElementById("mar-areia");     // areia do fundo do mar
    const sucesso = document.getElementById("sucesso");
    const iconeSucesso = document.getElementById("garrafa-selo");
    const statusEnvio = document.getElementById("status-envio"); // aviso para leitores de tela
    const botaoEnviar = form.querySelector('button[type="submit"]');

    /**
     * Fator de velocidade: 1 = normal. Útil para ver a animação em câmera lenta
     * nos testes (document.documentElement.dataset.velocidade = "5"). É lido a
     * cada animação e fica limitado entre 0,25 e 20.
     * @returns {number} multiplicador aplicado às durações.
     */
    const fatorVelocidade = function () {
      return Math.min(20, Math.max(0.25, Number(document.documentElement.dataset.velocidade) || 1));
    };
    const suave = "cubic-bezier(0.65, 0, 0.35, 1)"; // começa e termina devagar
    let enviando = false; // evita enviar duas vezes enquanto a animação roda

    /**
     * Anima um elemento com a Web Animations API e avisa quando termina.
     * @param {HTMLElement|SVGElement} elemento - o que será animado.
     * @param {Keyframe[]} quadros - estados da animação (como em @keyframes).
     * @param {number} duracao - duração em milissegundos (já no ritmo normal).
     * @param {object} [extras] - opções extras (easing, delay...).
     * @returns {Promise<Animation>} resolve quando a animação termina.
     */
    const animar = function (elemento, quadros, duracao, extras) {
      const opcoes = Object.assign({ easing: suave, fill: "forwards" }, extras);
      opcoes.duration = duracao * fatorVelocidade();
      if (opcoes.delay) opcoes.delay *= fatorVelocidade();
      return elemento.animate(quadros, opcoes).finished;
    };

    /**
     * Cancela todas as animações da animação de envio, devolvendo cada peça
     * ao estado definido no CSS. Usado ao terminar e ao clicar em "Enviar outra".
     * @returns {void}
     */
    const limparAnimacoes = function () {
      [folha, ...folha.children, caixaGarrafa, camadaFundo, camadaPergaminho, camadaFrente, camadaRolha, marCorpo, marRaios, marAreia]
        .forEach(function (el) { el.getAnimations().forEach(function (a) { a.cancel(); }); });
      marBolhas.replaceChildren(); // remove as bolhas que ainda estiverem subindo
      palco.querySelectorAll(".anel").forEach(function (anel) { anel.remove(); });
    };

    /**
     * Mostra o resultado de sucesso e entrega o foco a ele.
     * @param {string} primeiroNome - nome digitado, usado na mensagem.
     * @returns {void}
     */
    const mostrarSucesso = function (primeiroNome) {
      document.getElementById("nome-sucesso").textContent = primeiroNome; // textContent: nunca interpreta HTML
      folha.hidden = true;
      cartao.classList.add("concluido", "mar-final"); // "mar-final": o cartão termina no fundo do mar
      sucesso.classList.remove("preparando");
      sucesso.classList.add("ativo");
      palco.classList.remove("ativo");
      limparAnimacoes();
      form.setAttribute("aria-busy", "false");
      statusEnvio.textContent = "Mensagem enviada com sucesso.";
      sucesso.focus(); // leva o foco ao resultado (ajuda quem usa teclado e leitor de tela)
    };

    /**
     * Número aleatório entre um mínimo e um máximo (usado nas bolhas, para cada
     * uma ser diferente).
     * @param {number} minimo - menor valor possível.
     * @param {number} maximo - maior valor possível.
     * @returns {number} valor sorteado.
     */
    const aleatorio = function (minimo, maximo) {
      return minimo + Math.random() * (maximo - minimo);
    };

    /**
     * Solta bolhas que sobem do fundo até a superfície, balançando de lado a lado.
     * Cada bolha tem tamanho, posição, atraso e duração sorteados e se remove sozinha.
     * @param {number} quantidade - quantas bolhas criar.
     * @returns {void}
     */
    const soltarBolhas = function (quantidade) {
      const altura = cartao.offsetHeight;
      for (let i = 0; i < quantidade; i++) {
        const bolha = document.createElement("span");
        const tamanho = aleatorio(5, 15);
        bolha.className = "bolha";
        bolha.style.width = tamanho + "px";
        bolha.style.height = tamanho + "px";
        bolha.style.left = aleatorio(8, 92) + "%";
        marBolhas.appendChild(bolha);

        const desvio = aleatorio(-16, 16); // quanto a bolha "balança" para o lado
        const remover = function () { bolha.remove(); };
        animar(bolha, [
          { transform: "translate(0, 0)", opacity: 0 },
          { transform: "translate(" + desvio + "px, " + (-altura * 0.35) + "px)", opacity: 0.9, offset: 0.2 },
          { transform: "translate(" + (-desvio) + "px, " + (-altura * 0.7) + "px)", opacity: 0.8, offset: 0.7 },
          { transform: "translate(0, " + (-altura - 30) + "px)", opacity: 0 },
        ], aleatorio(1500, 2600), { delay: aleatorio(0, 900), easing: "ease-in" }).then(remover, remover);
      }
    };

    /**
     * Dois anéis que se abrem na superfície da água, no ponto em que a garrafa a toca.
     * @returns {void}
     */
    const ondularSuperficie = function () {
      [0, 250].forEach(function (atraso) {
        const anel = document.createElement("span");
        anel.className = "anel";
        palco.appendChild(anel);
        const remover = function () { anel.remove(); };
        animar(anel, [
          { transform: "scale(0.3)", opacity: 0.9 },
          { transform: "scale(2.2)", opacity: 0 },
        ], 900, { delay: atraso, easing: "ease-out" }).then(remover, remover);
      });
    };

    /**
     * A coreografia (cerca de 5 segundos):
     *   1. Dobra     - os campos somem e a folha dobra como uma carta.
     *   2. Enrola    - a folha vira um pergaminho.
     *   3. Entra     - o pergaminho levanta e desliza para dentro da garrafa.
     *   4. Veda      - a rolha desce e fecha o gargalo.
     *   5. O mar     - a água sobe em volta da garrafa, que boia e balança.
     *   6. Mergulha  - a garrafa afunda entre bolhas e raios de luz até o fundo do mar.
     *   7. Ícone     - a garrafa diminui e se acomoda no ícone do resultado.
     * @param {string} primeiroNome - nome para a mensagem final.
     * @returns {Promise<void>} resolve quando o resultado já está na tela.
     */
    const animarGarrafa = async function (primeiroNome) {
      // Trava a altura do cartão: sem isso ele encolheria quando a folha sumisse.
      cartao.style.minHeight = cartao.offsetHeight + "px";
      folha.classList.add("dobrando");

      // 1. DOBRA (0,7 s): campos esmaecem e a folha achata como carta dobrada.
      Array.from(folha.children).forEach(function (filho) {
        animar(filho, [{ opacity: 1 }, { opacity: 0 }], 300);
      });
      await animar(folha, [
        { transform: "perspective(1000px) rotateX(0deg) scale(1, 1)" },
        { transform: "perspective(1000px) rotateX(22deg) scale(1, 0.4)" },
      ], 700);

      // 2. ENROLA (0,6 s): a folha afina até o tamanho do pergaminho, que surge no lugar dela.
      palco.classList.add("ativo");
      animar(camadaPergaminho, [{ opacity: 0 }, { opacity: 1 }], 150, { delay: 450 });
      animar(folha, [{ opacity: 1 }, { opacity: 0 }], 150, { delay: 450 });
      await animar(folha, [
        { transform: "perspective(1000px) rotateX(22deg) scale(1, 0.4)" },
        { transform: "perspective(1000px) rotateX(0deg) scale(0.45, 0.2)" },
      ], 600);

      // 3. ENTRA (0,6 s): a garrafa aparece e o pergaminho levanta e desliza para dentro.
      [camadaFundo, camadaFrente].forEach(function (camada) {
        animar(camada, [{ opacity: 0 }, { opacity: 1 }], 250);
      });
      await animar(camadaPergaminho, [
        { transform: "translate(0, -31px) rotate(90deg) scale(1.6)" },
        { transform: "translate(0, -170px) rotate(0deg) scale(1)", offset: 0.5 },
        { transform: "translate(0, 0) rotate(0deg) scale(1)" },
      ], 600);

      // 4. VEDA (0,3 s): a rolha cai no gargalo (o easing "passa do ponto" para dar um quique).
      await animar(camadaRolha, [
        { opacity: 0, transform: "translateY(-80px)" },
        { opacity: 1, transform: "translateY(0)" },
      ], 300, { easing: "cubic-bezier(0.3, 0.7, 0.4, 1.4)" });

      // Prepara o final: mede onde o ícone do resultado vai ficar (antes de a garrafa se mexer).
      folha.hidden = true;
      cartao.classList.add("concluido");
      sucesso.classList.add("preparando"); // ocupa espaço (invisível) só para medirmos a posição
      const alvo = iconeSucesso.getBoundingClientRect();
      const origem = caixaGarrafa.getBoundingClientRect();
      const dx = alvo.left + alvo.width / 2 - (origem.left + origem.width / 2);
      const dy = alvo.top + alvo.height / 2 - (origem.top + origem.height / 2);
      const escala = alvo.height / origem.height;
      const altura = cartao.offsetHeight;

      // 5. O MAR (1,6 s): a água sobe até o meio do cartão (a garrafa fica meio submersa) e ela boia.
      mar.classList.add("ativo");
      await animar(marCorpo, [
        { transform: "translateY(" + (altura + 60) + "px)" }, // +60: esconde as ondas da superfície no início
        { transform: "translateY(" + altura * 0.5 + "px)" },
      ], 900, { easing: "cubic-bezier(0.25, 0.6, 0.35, 1)" });
      ondularSuperficie();
      await animar(caixaGarrafa, [
        { transform: "translate(0, 0) rotate(0deg)" },
        { transform: "translate(0, 10px) rotate(-8deg)", offset: 0.35 },
        { transform: "translate(0, 4px) rotate(6deg)", offset: 0.7 },
        { transform: "translate(0, 8px) rotate(-3deg)" },
      ], 700, { easing: "ease-in-out" });

      // 6. MERGULHA (1,5 s): a água cobre tudo, surgem raios de luz e bolhas, e a garrafa afunda girando devagar.
      soltarBolhas(16);
      animar(marRaios, [{ opacity: 0 }, { opacity: 0.55 }], 1000, { delay: 300, easing: "ease-in" });
      animar(marAreia, [{ transform: "translateY(100%)" }, { transform: "translateY(0)" }], 1300, { delay: 200, easing: "ease-out" }); // o fundo de areia aparece
      animar(marCorpo, [
        { transform: "translateY(" + altura * 0.5 + "px)" },
        { transform: "translateY(" + -altura * 0.13 + "px)" }, // mesmo valor do estado final no CSS
      ], 1500);
      await animar(caixaGarrafa, [
        { transform: "translate(0, 8px) rotate(-3deg) scale(1)" },
        { transform: "translate(6px, " + altura * 0.12 + "px) rotate(-20deg) scale(0.9)", offset: 0.5 },
        { transform: "translate(-4px, " + altura * 0.24 + "px) rotate(-8deg) scale(0.82)" },
      ], 1500);

      // 7. ÍCONE (0,9 s): a garrafa se endireita, diminui e vai para o lugar do ícone do resultado.
      await animar(caixaGarrafa, [
        { transform: "translate(-4px, " + altura * 0.24 + "px) rotate(-8deg) scale(0.82)" },
        { transform: "translate(" + dx + "px, " + dy + "px) rotate(0deg) scale(" + escala + ")" },
      ], 900);

      mostrarSucesso(primeiroNome);
    };

    form.addEventListener("submit", async function (e) {
      e.preventDefault(); // impede o envio real e o recarregamento da página
      if (enviando) return;

      // Valida todos os campos e guarda o primeiro que estiver com erro.
      let primeiroErro = null;
      form.querySelectorAll("input, select, textarea").forEach(function (campo) {
        if (!validarCampo(campo) && !primeiroErro) primeiroErro = campo;
      });

      if (primeiroErro) {
        // Resumo para leitores de tela (região aria-live): quantos campos precisam de correção.
        const quantidade = form.querySelectorAll(".campo.erro").length;
        statusEnvio.textContent = "";
        setTimeout(function () {
          statusEnvio.textContent = "Não foi possível enviar: " + quantidade +
            (quantidade === 1 ? " campo precisa" : " campos precisam") + " de correção.";
        }, 50); // limpar e preencher de novo faz o leitor anunciar mesmo se o texto se repetir
        primeiroErro.focus(); // leva o cursor ao campo com problema (a mensagem dele é lida via aria-describedby)
        return;               // e interrompe: não "envia"
      }

      // ATENÇÃO: o envio é SIMULADO. Este site é estático (não tem servidor
      // para receber os dados) e NADA sai do navegador. Para receber mensagens
      // de verdade, é preciso ligar o formulário a um serviço como Formspree
      // ou Netlify Forms (e tratar a proteção contra spam).
      enviando = true;
      botaoEnviar.disabled = true;
      form.setAttribute("aria-busy", "true");
      statusEnvio.textContent = "Enviando sua mensagem…";
      const primeiroNome = form.nome.value.trim().split(" ")[0];

      // Sem movimento (preferência do sistema ou do site): pula direto para o resultado.
      if (semMovimentoGeral()) {
        mostrarSucesso(primeiroNome);
      } else {
        await animarGarrafa(primeiroNome);
      }
    });

    // ---- 5.5 Botão "Enviar outra" -----------------------------------------
    const botaoNova = document.getElementById("nova-mensagem");
    if (botaoNova) {
      botaoNova.addEventListener("click", async function () {
        sucesso.classList.remove("ativo", "preparando");
        cartao.classList.add("mar-saindo"); // o mar some com um fade curto (CSS)
        await new Promise(function (resolver) { setTimeout(resolver, 400); });

        limparAnimacoes();
        cartao.classList.remove("mar-final", "mar-saindo", "concluido");
        mar.classList.remove("ativo");
        form.reset(); // limpa todos os campos
        contador.textContent = "0 / " + mensagem.maxLength;
        cartao.style.minHeight = ""; // destrava a altura
        folha.classList.remove("dobrando");
        folha.hidden = false;
        folha.animate([{ opacity: 0 }, { opacity: 1 }], 300); // reaparece com um fade curto
        botaoEnviar.disabled = false;
        form.removeAttribute("aria-busy");
        statusEnvio.textContent = "";
        enviando = false;
        form.nome.focus();
      });
    }
  }

  /* ==========================================================================
     6. SELO "ABERTO AGORA / FECHADO"
     Compara o dia e a hora atuais do visitante com a tabela de horários.
     ========================================================================== */

  /**
   * Horário de funcionamento. Cada posição é um dia da semana, na ordem do
   * JavaScript: 0 = domingo, 1 = segunda ... 6 = sábado.
   * Cada valor é [abre, fecha] em MINUTOS desde 00:00 (ex.: 18h = 18 * 60).
   * null significa fechado o dia todo.
   * IMPORTANTE: se mudar aqui, mude também a tabela de horários no HTML.
   */
  const HORARIOS = [
    [17 * 60, 23 * 60],   // domingo : 17h às 23h
    null,                 // segunda : fechado
    [18 * 60, 23 * 60],   // terça   : 18h às 23h
    [18 * 60, 23 * 60],   // quarta  : 18h às 23h
    [18 * 60, 23 * 60],   // quinta  : 18h às 23h
    [18 * 60, 24 * 60],   // sexta   : 18h às 00h (24 * 60 = meia-noite)
    [18 * 60, 24 * 60]    // sábado  : 18h às 00h
  ];

  const selosStatus = document.querySelectorAll(".status-loja");

  if (selosStatus.length) {
    const agora = new Date();
    const diaHoje = agora.getDay(); // 0 a 6
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
    const turnoHoje = HORARIOS[diaHoje]; // [abre, fecha] ou null

    // Está aberto se existe turno hoje E o horário atual está dentro dele.
    const aberto = !!turnoHoje && minutosAgora >= turnoHoje[0] && minutosAgora < turnoHoje[1];

    selosStatus.forEach(function (selo) {
      selo.classList.add(aberto ? "aberto" : "fechado"); // cor do selo (CSS)
      selo.textContent = aberto ? "Aberto agora" : "Fechado agora";
    });

    // Destaca a linha do dia atual na tabela de horários (se existir na página).
    const linhaHoje = document.querySelector('.horarios li[data-dia="' + diaHoje + '"]');
    if (linhaHoje) linhaHoje.classList.add("hoje");
  }

  /* ==========================================================================
     7. ANIMAÇÕES E INTERAÇÕES
     ========================================================================== */

  // As preferências de movimento (semMovimento e semMovimentoGeral) são definidas no topo do arquivo.

  /* ---------- 7.1 Onda de água ao clicar em botões, menu e filtros ---------- */
  // "pointerdown" funciona para mouse, toque e caneta.
  document.addEventListener("pointerdown", function (e) {
    if (semMovimentoGeral()) return; // sem movimento: não cria a onda
    // closest() sobe na árvore do HTML até achar um destes elementos.
    const alvo = e.target.closest(".btn, .chip, .nav-principal a, .btn-menu");
    if (!alvo) return; // clicou em outra coisa: ignora

    const caixa = alvo.getBoundingClientRect(); // posição do botão na tela
    const onda = document.createElement("span");
    onda.className = "ondinha"; // o CSS anima o círculo crescendo e sumindo

    // Posição do clique RELATIVA ao botão (a onda nasce onde o dedo/mouse clicou).
    onda.style.left = e.clientX - caixa.left + "px";
    onda.style.top = e.clientY - caixa.top + "px";

    alvo.appendChild(onda);
    setTimeout(function () { onda.remove(); }, 800); // limpa o elemento depois
  });

  /* ---------- 7.2 Transição entre páginas: o navio segue a ordem do menu ---------- */

  /**
   * Ordem das páginas no menu, da esquerda para a direita. Indo para uma página
   * mais à DIREITA (ex.: Início -> Cardápio) o navio navega da esquerda para a
   * direita; voltando (ex.: Contato -> Início) ele navega da direita para a esquerda.
   */
  const ORDEM_PAGINAS = ["index.html", "servicos.html", "contato.html"];

  // Tempo (ms) até o navio chegar ao centro. A página só troca depois disso.
  const DURACAO_SAIDA = 1050;

  let navegando = false; // evita iniciar duas transições ao mesmo tempo

  /**
   * Descobre o nome do arquivo de um caminho. A raiz do site ("/" ou "/pasta/")
   * é a página inicial (index.html).
   * @param {string} caminho - pathname de uma URL (ex.: "/servicos.html").
   * @returns {string} nome do arquivo (ex.: "servicos.html").
   */
  const nomeDaPagina = function (caminho) {
    const ultimo = caminho.split("/").pop();
    return ultimo === "" ? "index.html" : ultimo;
  };

  document.addEventListener("click", function (e) {
    if (semMovimentoGeral() || navegando) return;

    // Descobre se o clique foi em (ou dentro de) um link.
    const link = e.target.closest("a[href]");
    if (!link || e.defaultPrevented || e.button !== 0) return;

    // Não interfere em Ctrl/Cmd+clique (abrir em nova aba), Shift, Alt...
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (link.target && link.target !== "_self") return; // links target="_blank"
    if (link.hasAttribute("download")) return;

    // Monta um objeto URL para analisar o destino do link.
    let destino;
    try { destino = new URL(link.href, location.href); } catch (erro) { return; }

    // Só faz a transição entre páginas .html DESTE site (outro domínio não).
    if (destino.protocol !== location.protocol || destino.host !== location.host) return;
    const atual = nomeDaPagina(location.pathname);
    const proxima = nomeDaPagina(destino.pathname);
    if (!/\.html?$/i.test(proxima) || proxima === atual) return;

    // Direção do navio: "ltr" (esquerda -> direita) ou "rtl" (direita -> esquerda).
    const direcao = ORDEM_PAGINAS.indexOf(proxima) >= ORDEM_PAGINAS.indexOf(atual) ? "ltr" : "rtl";

    e.preventDefault(); // segura a navegação normal para rodar a animação antes
    navegando = true;

    // Avisa a PRÓXIMA página que ela deve continuar a animação, e em qual direção
    // (lido pelo entrada.js, no <head> de cada HTML).
    try { sessionStorage.setItem("pp-trans", direcao); } catch (erro) { /* storage bloqueado: ignora */ }

    // Cria a "cobertura" (mar subindo + navio) e a coloca na tela.
    const cobertura = document.createElement("div");
    cobertura.className = "transicao " + direcao; // a classe escolhe de que lado o navio entra
    cobertura.setAttribute("aria-hidden", "true"); // decorativo: leitores de tela ignoram
    const desenho = direcao === "ltr" ? "navio-direita.svg" : "navio.svg"; // proa para o lado em que ele navega
    cobertura.innerHTML = '<img src="imagens/' + desenho + '" alt="">';
    document.body.appendChild(cobertura);
    void cobertura.offsetWidth; // força o navegador a registrar o estado inicial
    cobertura.classList.add("cobrindo"); // inicia a animação (CSS)

    // Quando o navio chega ao centro, vai para a outra página (que continua a viagem).
    setTimeout(function () { location.href = destino.href; }, DURACAO_SAIDA);
  });

  // Quando o usuário volta pelo botão "Voltar" do navegador, a página pode
  // vir do cache já com a cobertura na tela. Aqui limpamos isso.
  window.addEventListener("pageshow", function (e) {
    if (!e.persisted) return; // só nos interessa quando veio do cache
    navegando = false;
    document.querySelectorAll(".transicao").forEach(function (el) { el.remove(); });
    document.documentElement.classList.remove("chegando");
    delete document.documentElement.dataset.direcao;
  });

  // Segurança: se a animação de chegada travar por algum motivo, ela é removida.
  setTimeout(function () { document.documentElement.classList.remove("chegando"); }, 2000);
  /* ---------- 7.3 Barra de progresso de rolagem (barquinho) ---------- */
  if (cabecalho) {
    // Cria, por JavaScript, a barra e o barquinho dentro do cabeçalho.
    const progresso = document.createElement("div");
    progresso.className = "progresso";
    progresso.setAttribute("aria-hidden", "true"); // elemento decorativo
    progresso.innerHTML = '<span class="barra"></span><img src="imagens/navio-direita.svg" alt="">'; // navega para a direita
    cabecalho.appendChild(progresso);

    /**
     * Calcula quantos % da página já foram rolados e atualiza a barra.
     * O valor vai para a variável CSS "--p", que o style.css usa na largura
     * da barra e na posição do barquinho.
     * @returns {void}
     */
    const atualizarProgresso = function () {
      // Distância total que dá para rolar = altura da página - altura da janela.
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const porcentagem = total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0;
      progresso.style.setProperty("--p", porcentagem.toFixed(1) + "%");
    };

    window.addEventListener("scroll", atualizarProgresso, { passive: true });
    window.addEventListener("resize", atualizarProgresso); // a altura muda ao redimensionar
    atualizarProgresso();
  }

  /* ---------- 7.4 Bússola: voltar ao topo ---------- */
  document.querySelectorAll(".topo-bussola").forEach(function (botao) {
    // Clique: gira a agulha duas voltas enquanto a página sobe.
    botao.addEventListener("click", function () {
      botao.classList.add("girando"); // o CSS gira a agulha duas voltas
      window.scrollTo({ top: 0, behavior: semMovimentoGeral() ? "auto" : "smooth" });
      setTimeout(function () { botao.classList.remove("girando"); }, 950);
    });

    // Dica de que é clicável: toda vez que o botão APARECE na tela, ele dá uma
    // "mexidinha" (classe "chamar", animada no CSS). Se a pessoa subir e voltar
    // a descer, ele balança de novo.
    if ("IntersectionObserver" in window) {
      const vigia = new IntersectionObserver(
        function (entradas) {
          entradas.forEach(function (entrada) {
            if (!entrada.isIntersecting || semMovimentoGeral()) return;
            botao.classList.remove("chamar");
            void botao.offsetWidth; // reinicia a animação se ela ainda estava rodando
            botao.classList.add("chamar");
          });
        },
        { threshold: 0.6 } // considera "apareceu" quando 60% do botão está na tela
      );
      vigia.observe(botao);

      // Ao terminar a mexidinha, remove a classe para poder repetir na próxima vez.
      botao.addEventListener("animationend", function (e) {
        if (e.animationName === "chamar-botao") botao.classList.remove("chamar");
      });
    }
  });
  /* ---------- 7.5 Pausar animações (acessibilidade, WCAG 2.2.2) ---------- */
  // Os efeitos do site (chuva, navio, ondas) não param sozinhos. Este botão, no
  // rodapé, deixa a pessoa pausá-los. A escolha fica guardada no navegador
  // (localStorage) e é aplicada no <html> pelo entrada.js nas próximas visitas.
  const botaoPausar = document.getElementById("btn-pausar");

  if (botaoPausar) {
    const raiz = document.documentElement;

    /**
     * Ajusta o texto (para leitores de tela e balão) do botão conforme o estado atual.
     * @returns {void}
     */
    const atualizarBotaoPausar = function () {
      const pausadas = raiz.dataset.animacoes === "pausadas";
      const texto = pausadas ? "Retomar animações" : "Pausar animações";
      botaoPausar.querySelector(".sr-only").textContent = texto; // lido por leitores de tela
      botaoPausar.title = texto;                                 // balão ao passar o mouse
    };

    atualizarBotaoPausar();

    botaoPausar.addEventListener("click", function () {
      const vaiPausar = raiz.dataset.animacoes !== "pausadas";
      if (vaiPausar) {
        raiz.dataset.animacoes = "pausadas";
      } else {
        delete raiz.dataset.animacoes;
      }
      try {
        if (vaiPausar) localStorage.setItem("pp-animacoes", "pausadas");
        else localStorage.removeItem("pp-animacoes");
      } catch (erro) { /* storage bloqueado: vale só nesta visita */ }
      atualizarBotaoPausar();
    });
  }

  /* ==========================================================================
     8. ANO ATUAL NO RODAPÉ
     Troca o texto dos elementos com a classe "ano-atual" pelo ano de hoje,
     assim o copyright nunca fica desatualizado.
     ========================================================================== */
  document.querySelectorAll(".ano-atual").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
