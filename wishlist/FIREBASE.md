# Ligando as reservas (Firebase)

Sem isso a página funciona normal, só sem reservar nada — aparece
"reservas indisponíveis" no topo.

Custo: zero. O plano Spark não tem cartão cadastrado, então ele **não
consegue** cobrar — se passar da cota ele só para de responder. A cota é
1 GB guardado e 10 GB/mês de tráfego; esta página usa alguns kilobytes.

## 1. Criar o projeto

1. Acesse https://console.firebase.google.com e clique **Adicionar projeto**.
2. Nome: `wishlist-vitu`. Pode desativar o Google Analytics.
3. Espere criar e clique **Continuar**.

## 2. Criar o banco

1. No menu esquerdo: **Criar** → **Realtime Database** → **Criar banco de dados**.
2. Escolha a região (`us-central1` serve).
3. Escolha **Iniciar no modo bloqueado**. As regras vêm no passo 4.

> Atenção: tem que ser **Realtime Database**, não Firestore. São produtos
> diferentes e a página usa o Realtime.

## 3. Pegar a config

1. Ícone de engrenagem → **Configurações do projeto**.
2. Role até **Seus aplicativos** e clique no ícone `</>` (Web).
3. Apelido: `wishlist`. **Não** marque Firebase Hosting. Clique registrar.
4. Copie o objeto `firebaseConfig` que aparece. Vai ser tipo assim:

```js
window.FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "wishlist-vitu.firebaseapp.com",
  databaseURL: "https://wishlist-vitu-default-rtdb.firebaseio.com",
  projectId: "wishlist-vitu",
  appId: "..."
};
```

**`databaseURL` é obrigatório.** Se não vier no objeto copiado, pegue na
página do Realtime Database (é a URL que aparece em cima da aba Dados).

Essas chaves são públicas de propósito — o Firebase trata elas como
identificador, não como senha. Quem protege o banco são as regras abaixo.

## 4. Aplicar as regras (não pule)

Em **Realtime Database** → aba **Regras**, cole exatamente isto e publique:

```json
{
  "rules": {
    "claims": {
      ".read": true,
      "$item": {
        ".write": "!data.exists() || !newData.exists()",
        ".validate": "newData.isString() && newData.val().length <= 40"
      }
    }
  }
}
```

Leitura liberada; escrita só pode **criar** uma reserva num item livre ou
**apagar** uma existente. Ninguém sobrescreve a reserva de outro.

Se você deixar no "modo bloqueado" do passo 2 e esquecer disto, ninguém
consegue reservar nada. Se você usar o "modo de teste" em vez destas
regras, qualquer um pode escrever qualquer coisa no banco — e o modo de
teste expira sozinho depois de 30 dias.

## 5. Colar a config na página

Em `wishlist/index.html`, troque a linha:

```js
window.FIREBASE_CONFIG = null;
```

pelo objeto do passo 3.

## Como apagar uma reserva na mão

Se alguém perder o acesso, vá em **Realtime Database** → aba **Dados** →
abra `claims` → passe o mouse no item → **X** → confirmar. A página de todo
mundo atualiza na hora.

Os valores em `claims` são hashes, não nomes — você não vai conseguir ver
quem reservou o quê, e isso é de propósito.
