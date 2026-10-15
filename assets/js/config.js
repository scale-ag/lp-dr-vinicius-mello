/*
 * ============================================================
 *  CONFIGURAÇÃO DA LANDING PAGE — edite só este arquivo
 * ============================================================
 *  Depois de editar, faça commit/push: o GitHub Pages
 *  atualiza o site sozinho em ~1 minuto.
 */
window.LP_CONFIG = {
  /* Valores exibidos na página (só a partir do formulário) */
  VALOR_CONSULTA: 1000,     // valor da consulta de avaliação (R$)
  VALOR_SINAL: 0,           // sinal para reservar o horário (R$); 0 = sem sinal (esconde as linhas de sinal)

  /* ---------- WHATSAPP ----------
   * Depois de preencher o formulário, a pessoa espera alguns segundos
   * (para o evento Lead chegar na Meta e o lead cair na planilha)
   * e é levada automaticamente para este WhatsApp. */
  WHATSAPP: "556299901615",
  MENSAGEM_WHATSAPP: "Olá, vim pelo site, preenchi o formulário e gostaria de agendar minha avaliação",
  SEGUNDOS_ATE_WHATSAPP: 5,

  /* ---------- PLANILHA (Google Sheets) ----------
   * URL do App da Web do Google Apps Script (termina em /exec).
   * Passo a passo no README, seção "Planilha de leads". */
  PLANILHA_URL: "",

  /* ---------- RASTREAMENTO ----------
   * ID do Pixel da Meta. Dispara PageView e Lead (formulário enviado). */
  META_PIXEL_ID: "1601913367590883",

  /* ---------- RESULTADOS (antes e depois) ----------
   * false esconde a seção de antes e depois (útil se a Meta reprovar
   * anúncios por causa das fotos da página de destino). */
  MOSTRAR_RESULTADOS: true,

  /* ---------- REMARCAÇÃO (pergunta frequente) ----------
   * Escreva a regra do consultório. Deixe "" (vazio) para esconder a pergunta. */
  RESPOSTA_REMARCAR: ""
};
