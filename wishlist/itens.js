/* A lista de presentes. Este é o único arquivo que você edita pra adicionar
   ou tirar um presente.

   CUIDADO: depois que a página estiver no ar, NÃO mude o `id` de um item que
   já foi reservado — a reserva fica órfã no Firebase e o item volta a
   aparecer como livre. Mudar nome, desc, img e url é sempre seguro.

   img e url são opcionais. Sem img aparece um placeholder; sem url o botão
   "Ver na loja" não aparece.

   `desc` aceita HTML. Já tem estilo pronto pra:
     <strong> destaque   <i>/<em> itálico      <mark> marca-texto roxo
     <a href>  link (abre em aba nova sozinho) <code> monoespaçado
     <small> menorzinho  <p> parágrafo         <ul>/<ol>/<li> listas
     <br> quebra de linha
   Pra cor livre: <span style="color:#7ee787">verde</span>
   Pra peso: <span class="fina">fininho</span> · <span class="grande">GRANDÃO</span>

   Só o `desc` aceita HTML — `nome` é texto puro, tag ali aparece escrita.
   E não cole aqui HTML que veio de fora, só o que você mesmo escrever. */
window.ITENS = [
  {
    id: 'carteira-1',
    nome: 'Carteira Yuzu Bege',
    desc: 'Finalmente uma carteira nova! Uso a mesma desde os <strong>12 anos</strong>. A coitada já tá capenga. <span class="fina">Tô enrolando pra trocar há meses.</span>',
    img: 'assets/carteira-1.png',
    url: 'https://katsukazan.com.br/produtos/carteira-yuzu-bege'
  },
  {
    id: 'pochete',
    nome: 'Pochete Allcatrazes',
    desc: 'Cansei de carregar mochila em rolê.<br><strong>PFV</strong> nas cores "off white encontro" (<span style="color: #faf0e6 !important;">branco</span> e <span style="color: #29639e !important;">azul</span>) ou "<span style="color: #447959 !important;">verde cachoeira</span>"',
    img: 'assets/pochete.png',
    url: 'https://allcatrazes.com/products/pochete-allcatrazes-x-brasco'
  },
  {
    id: 'lata',
    nome: 'Latinha dos Nóia',
    desc: 'Pra guardar as tralhas soltas que hoje moram no fundo da mochila.<br><span class="grande">YEEESS!</span>',
    img: 'assets/lata.png',
    url: 'https://badvibes666.com.br/produtos/latinha-dos-noia-good-but-not-the-best'
  },
  {
    id: 'cartao-doido',
    nome: 'Tralha - Tashinami Card',
    desc: 'Um cartão do tamanho de um cartão, cheio de <strong>ferramentinha aleatória</strong>. Vou usar <i>de vez em nunca</i> — mas no dia que eu precisar, vou ser <span class="grande">insuportável</span> sobre isso.',
    img: 'assets/cartao.png',
    url: 'https://www.sousou.co.jp/en-us/products/8511006'
  },
  {
    id: 'carteira-cel',
    nome: '"Capinha" - Stack Phone Wallet',
    desc: 'Gruda na bundinha do celular e ainda vira apoio. O meu de courinho tá <i>capenga</i>.<br>Todas as cores menos a preta, preferência pra <strong><span style="color: #447959 !important;">verde</span></strong> <span class="fina">rs</span>',
    img: 'assets/capinha.png',
    url: 'https://www.dailyobjects.us/products/carbon-stack-phone-wallet-stand?variant=52094340071762'
  },
  {
    id: 'vela',
    nome: 'Vela - Kit Réchaud',
    desc: 'Kit aromático pra aposentar minhas velas. Meu quarto vai ficar <strong>cherozinho</strong> e <i>✨ chique ✨</i>.',
    img: 'assets/vela.png',
    url: 'https://afago.site/produtos/kit-rechaud-com-1-fragrancia'
  }
];
