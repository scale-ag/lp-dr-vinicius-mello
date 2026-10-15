/*
 * ============================================================
 *  CONFIGURAÇÃO DA LANDING PAGE — edite só este arquivo
 * ============================================================
 *  Depois de editar, faça commit/push: o GitHub Pages
 *  atualiza o site sozinho em ~1 minuto.
 */
window.LP_CONFIG = {
  /* ---------- VALORES (só aparecem a partir do formulário) ----------
   * Os sinais fazem parte do valor total e são abatidos dele;
   * o restante é pago no dia da consulta. */
  // Consulta particular
  VALOR_CONSULTA: 1000,     // valor total da consulta particular (R$)
  VALOR_SINAL: 500,         // sinal para reservar o horário (R$)
  // Consulta pela Unimed: a consulta é pelo plano, a paciente paga só o exame de bioimpedância
  VALOR_BIOIMPEDANCIA: 300, // valor total do exame (R$)
  SINAL_BIOIMPEDANCIA: 150, // sinal para reservar o horário (R$)
  // Exceção: consulta de face pela Unimed não cobra bioimpedância (nada a pagar)

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
  PLANILHA_URL: "https://script.google.com/macros/s/AKfycbze5ynuX-HcPyVyc4P1iqn0N-eekVOFWEATNnPeFnnHZIvyA0GC42X5ngIh5W-GU6O4/exec",

  /* ---------- RASTREAMENTO ----------
   * ID do Pixel da Meta. Dispara PageView e Lead (formulário enviado). */
  META_PIXEL_ID: "1601913367590883",

  /* ---------- REMARCAÇÃO (pergunta frequente) ----------
   * Escreva a regra do consultório. Deixe "" (vazio) para esconder a pergunta. */
  RESPOSTA_REMARCAR: ""
};
