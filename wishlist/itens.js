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

   Só o `desc` aceita HTML — `nome` é texto puro, tag ali aparece escrita.
   E não cole aqui HTML que veio de fora, só o que você mesmo escrever. */
window.ITENS = [
  {
    id: 'carteira-1',
    nome: 'Carteira Yuzu Bege',
    desc: 'Finalmente uma carteira nova! Tenho a minha desde os 12 anos e já tá toda podi. Estou enrolando pra comprar há meses..',
    img: 'assets/carteira-1.png',
    url: 'https://katsukazan.com.br/produtos/carteira-yuzu-bege'
  },
  {
    id: 'pochete',
    nome: 'Pochete Allcatrazes',
    desc: 'Cansei de usar mochila pra ir nos rolês ! <strong>PFV</strong> cores "off white encontro" (branco e azul) ou "verde cachoeira"',
    img: 'assets/pochete.png',
    url: 'https://allcatrazes.com/products/pochete-allcatrazes-x-brasco'
  },
  {
    id: 'lata',
    nome: 'Latinha dos Nóia',
    desc: 'Guarda tralha pra deixar na mochila <i>YEEESS!</i>',
    img: 'assets/lata.png',
    url: ''
  },
  {
    id: 'cartao-doido',
    nome: 'Tralha - Tashinami Card',
    desc: 'Cartão com ferramentas aleatórias (provavelmente vou usar de vez em nunca mas ainda sim é bem legal)',
    img: 'assets/cartao.png',
    url: ''
  },
  {
    id: 'carteira-cel',
    nome: '"Capinha" - Stack Phone Wallet',
    desc: 'Cartão pra deixar na bundinha do celular que também serve como apoio (eu já tenho aquele de courinho mas ele tá ficando capenga). Amei todas as cores menos a preta (preferência pra verde rs)',
    img: 'assets/capinha.png',
    url: ''
  },
  {
    id: 'vela',
    nome: 'Vela - Kit Réchaud',
    desc: 'Kit aromático para substituir as velas. Vai deixar meu quarto cherozinho e <i>chique</i>',
    img: 'assets/vela.png',
    url: ''
  }
];
