# Landing page – Dr. Vinícius Mello (agendamento pelo WhatsApp)

Página estática (HTML/CSS/JS puro) para gerar agendamentos da consulta de avaliação do
[Dr. Vinícius Mello](https://drviniciusmello.com/), cirurgião plástico (contorno corporal e pós-bariátrica)
em Goiânia – GO. Os valores só aparecem a partir do formulário, e a paciente precisa marcar que está
ciente antes de enviar (o texto muda conforme a escolha):

| Caso | Total | Sinal (abatido) | No dia |
|---|---|---|---|
| Consulta particular | R$ 1.000 | R$ 500 | R$ 500 |
| Unimed (paga só o exame de bioimpedância) | R$ 300 | R$ 150 | R$ 150 |
| Unimed + procedimento de face | sem cobrança de bioimpedância | – | – |

## Fluxo da paciente

1. Lê a página (dor → por que dieta/academia não resolveram → procedimentos → como trabalhamos →
   depoimentos → como é a consulta → quem é o médico) e preenche o formulário.
2. Ao enviar: dispara o evento **Lead** no Pixel da Meta e o lead é gravado na **planilha** com as UTMs.
3. Aparece uma contagem de **5 segundos** (tempo para o Lead chegar na Meta e o lead cair na planilha).
4. Redireciona sozinho para o WhatsApp **(62) 99990-1615** com a mensagem
   *"Olá, vim pelo site, preenchi o formulário e gostaria de agendar minha avaliação"*.
5. A equipe agenda o horário pelo WhatsApp e atualiza o **Status** do lead na planilha.

## Configuração (único arquivo a editar)

Edite `assets/js/config.js`:

| Campo | O que colocar |
|---|---|
| `VALOR_CONSULTA` / `VALOR_SINAL` | Consulta particular e sinal (1000 e 500) |
| `VALOR_BIOIMPEDANCIA` / `SINAL_BIOIMPEDANCIA` | Exame cobrado na consulta pela Unimed e sinal (300 e 150) |
| `WHATSAPP` | Número que recebe os leads (`55` + DDD + número) |
| `MENSAGEM_WHATSAPP` | Mensagem que já vem escrita no WhatsApp |
| `SEGUNDOS_ATE_WHATSAPP` | Espera antes de abrir o WhatsApp (padrão 5) |
| `PLANILHA_URL` | URL `/exec` do Apps Script (veja abaixo) |
| `META_PIXEL_ID` | ID do Pixel da Meta |
| `RESPOSTA_REMARCAR` | Texto da pergunta "Posso remarcar?" (vazio esconde a pergunta) |

## Formulário

Campos atuais: nome, WhatsApp, **o que deseja tratar**, **particular ou Unimed** e **onde mora**.
Se a paciente escolher Unimed + "Face ou pálpebras", a planilha registra "Unimed – face (sem bioimpedância)". Para trocar/incluir um campo, atualize as mesmas chaves em três lugares:
`index.html` (`name="chave"`), `assets/js/main.js` (`validate()` e objeto `lead`) e
`google-apps-script/Codigo.gs` (`COLUNAS`).

## Planilha de leads (Google Sheets)

O código fica em `google-apps-script/Codigo.gs`. Instalação (uma vez só, com a conta dona da planilha):

1. Abra a planilha → **Extensões → Apps Script**.
2. Apague o conteúdo do editor, cole o arquivo `Codigo.gs` inteiro e salve (Ctrl/Cmd + S).
3. No seletor de funções (topo), escolha **`configurarPlanilha`** → **Executar** → autorize
   (aviso "O Google não verificou este app" → Avançado → Acessar → Permitir).
   Isso cria a aba **Leads** com as colunas e a lista de status.
4. **Implantar → Nova implantação** → engrenagem → **App da Web**:
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
5. **Implantar**, copie a URL que termina em `/exec` e cole em `PLANILHA_URL`.

Colunas: Data/hora · Nome · WhatsApp · Procedimento · Onde mora · Consulta · **Status** (lista: Novo, Em conversa,
Agendado, Consulta paga, Compareceu, Fechou cirurgia, Não respondeu, Desistiu) · utm_source · utm_medium ·
utm_campaign · utm_content · utm_term · fbclid · gclid · Dispositivo · Página · ID do lead.

> Se alterar o código depois, use **Implantar → Gerenciar implantações → editar → Nova versão**
> para manter a mesma URL.

### UTMs nos anúncios da Meta

No anúncio, em **Rastreamento → Parâmetros de URL**, cole:

```
utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{adset.name}}
```

## Publicar no GitHub Pages

1. No GitHub, abra o repositório → **Settings** → **Pages**.
2. **Source: Deploy from a branch** → **Branch**: a branch com estes arquivos, pasta **`/ (root)`** → **Save**.
3. Aguarde 1–2 minutos. Endereço: `https://scale-ag.github.io/lp-dr-vinicius-mello/`

## Estrutura

```
index.html                     página
assets/css/style.css           estilos (grafite #313131 + dourado #907520, DM Serif Display + Poppins)
assets/js/config.js            configurações editáveis
assets/js/main.js              formulário, UTMs, Pixel, planilha e redirecionamento
assets/img/                    logo e fotos do site do Dr. Vinícius
google-apps-script/Codigo.gs   script que grava os leads na planilha
```
