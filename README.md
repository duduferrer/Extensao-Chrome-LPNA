# Instalação

Extensão para Google Chrome. A instalação é manual — leva menos de dois minutos.

> **Pré-requisito:** Google Chrome, Microsoft Edge, Brave ou qualquer navegador baseado em Chromium.

---

## 1. Baixar

Vá até a página de [**Releases**](../../releases) deste repositório e baixe o arquivo `.zip` da versão mais recente.

Alternativa: no topo desta página, clique em **Code → Download ZIP** para pegar a versão em desenvolvimento (pode estar instável).

## 2. Descompactar

Extraia o ZIP em uma pasta **permanente** — por exemplo `C:\Extensoes\minha-extensao` ou `~/Extensoes/minha-extensao`.

> ⚠️ **Não use a pasta Downloads nem uma pasta temporária.** O Chrome carrega a extensão a partir do caminho original, todas as vezes que abre. Se a pasta for movida, renomeada ou apagada, a extensão para de funcionar.

Ao final, a estrutura deve ser esta — com o `manifest.json` **na raiz**:

```
minha-extensao/
├── manifest.json      ← precisa estar aqui, no primeiro nível
├── background.js
├── content.js
├── popup.html
├── popup.js
├── popup.css
└── icons/
```

Se ao abrir a pasta você encontrar *outra* pasta dentro dela, entre nela — é o nível certo.

## 3. Abrir a página de extensões

Digite na barra de endereços:

```
chrome://extensions
```

Ou: menu **⋮** → **Extensões** → **Gerenciar extensões**.

## 4. Ativar o Modo de desenvolvedor

No canto **superior direito** da página, ligue a chave **Modo de desenvolvedor**.

Três botões novos aparecem logo abaixo — é o sinal de que deu certo.

## 5. Carregar a extensão

Clique em **Carregar sem compactação** e selecione a pasta do passo 2 — a que **contém** o `manifest.json`, não o arquivo em si.

O card da extensão aparece na lista. Instalação concluída.

## 6. Fixar na barra (opcional)

Clique no ícone de peça de quebra-cabeça 🧩 ao lado da barra de endereços e clique no alfinete 📌 ao lado da extensão. O ícone passa a ficar sempre visível.

---

## Atualizar

1. Baixe o novo ZIP.
2. Extraia **por cima** da pasta existente, substituindo os arquivos.
3. Em `chrome://extensions`, clique no ícone de reload (↻) no card da extensão.
4. **Recarregue as abas abertas** (F5) — sem isso a versão antiga continua rodando nas páginas já carregadas.

## Desinstalar

Em `chrome://extensions`, clique em **Remover** no card. Depois, apague a pasta se quiser.

---

## Problemas comuns

### "Não foi possível carregar o manifest"

Você selecionou a pasta errada. O `manifest.json` precisa estar no primeiro nível da pasta escolhida — provavelmente há uma subpasta a mais. Entre nela e tente de novo.

### O botão "Carregar sem compactação" não aparece

O Modo de desenvolvedor está desligado. Volte ao passo 4.

### A extensão some quando reinicio o Chrome

A pasta foi movida ou apagada. Extensões carregadas assim ficam apenas *referenciadas* pelo caminho — não são copiadas para dentro do navegador. Coloque em local definitivo e carregue novamente.

### Aviso "Desative as extensões em modo de desenvolvedor"

Normal para extensões instaladas fora da Chrome Web Store. Basta fechar o aviso — ele reaparece a cada inicialização, mas não afeta o funcionamento.

### O ícone está lá, mas nada acontece na página

O *content script* não foi injetado. Causas possíveis:

- A extensão foi recarregada mas a aba não — dê **F5** na página.
- Você está numa página onde nenhuma extensão funciona: `chrome://`, Chrome Web Store, ou PDFs. Não há solução, é restrição do navegador.
- A página não está entre os sites configurados no `manifest.json`.

Para investigar: **F12** na página → aba **Console** → procure mensagens com o prefixo `[ext]`.

### Erro no card da extensão

Clique em **Erros** no card para ver o detalhe. Erros do *service worker* aparecem clicando no link **service worker** do mesmo card.

---

## Empresa / rede corporativa

Em ambientes gerenciados, políticas de TI podem bloquear o Modo de desenvolvedor (`BlockExternalExtensions`, `ExtensionInstallBlocklist`). Se os passos acima falharem sem explicação, o caminho é a instalação via política — fale com o setor de TI.
