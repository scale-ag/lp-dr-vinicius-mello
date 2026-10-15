/**
 * Recebe os leads da landing page do Dr. Vinícius Mello e grava na planilha.
 *
 * Como instalar (uma vez só):
 *  1. Na planilha: Extensões → Apps Script. Apague o que estiver lá e cole este arquivo inteiro.
 *  2. Salve (ícone de disquete). No menu de funções, escolha "configurarPlanilha" e clique em Executar.
 *     Autorize o acesso com a conta dona da planilha.
 *  3. Implantar → Nova implantação → tipo "App da Web".
 *       Executar como: Eu
 *       Quem pode acessar: Qualquer pessoa
 *     Clique em Implantar e copie a URL (termina em /exec).
 *  4. Cole a URL em PLANILHA_URL, no arquivo assets/js/config.js do site.
 */

var ABA = 'Leads';

var COLUNAS = [
  ['Data/hora',       'recebido_em'],
  ['Nome',            'nome'],
  ['WhatsApp',        'whatsapp'],
  ['Procedimento',    'procedimento'],
  ['Onde mora',       'cidade'],
  ['Status',          'status'],
  ['utm_source',      'utm_source'],
  ['utm_medium',      'utm_medium'],
  ['utm_campaign',    'utm_campaign'],
  ['utm_content',     'utm_content'],
  ['utm_term',        'utm_term'],
  ['fbclid',          'fbclid'],
  ['gclid',           'gclid'],
  ['Dispositivo',     'dispositivo'],
  ['Página',          'pagina'],
  ['ID do lead',      'id']
];

var STATUS = ['Novo', 'Em conversa', 'Agendado', 'Consulta paga', 'Compareceu', 'Fechou cirurgia', 'Não respondeu', 'Desistiu'];

/** Cria/arruma a aba de leads: cabeçalho, formatação e lista de status. */
function configurarPlanilha() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(ABA);
  if (!sh) {
    // Reaproveita a primeira aba se estiver vazia (ex.: "Página1"); senão cria uma nova.
    var primeira = ss.getSheets()[0];
    if (primeira.getLastRow() === 0) { primeira.setName(ABA); sh = primeira; }
    else { sh = ss.insertSheet(ABA, 0); }
  }

  var titulos = COLUNAS.map(function (c) { return c[0]; });
  sh.getRange(1, 1, 1, titulos.length).setValues([titulos])
    .setFontWeight('bold').setBackground('#313131').setFontColor('#FFFFFF');
  sh.setFrozenRows(1);

  var linhas = sh.getMaxRows() - 1;
  sh.getRange(2, 1, linhas, 1).setNumberFormat('dd/MM/yyyy HH:mm');
  sh.getRange(2, 3, linhas, 1).setNumberFormat('@');

  var colStatus = titulos.indexOf('Status') + 1;
  var regra = SpreadsheetApp.newDataValidation().requireValueInList(STATUS, true).setAllowInvalid(true).build();
  sh.getRange(2, colStatus, linhas, 1).setDataValidation(regra);

  sh.setColumnWidth(1, 130);
  sh.setColumnWidth(2, 200);
  sh.setColumnWidth(3, 140);
  sh.setColumnWidths(4, 3, 160);
  sh.setColumnWidths(7, 5, 170);
  return sh;
}

/** Recebe o POST da landing page. */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var dados = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ABA) || configurarPlanilha();

    dados.recebido_em = new Date();
    dados.status = 'Novo';

    var linha = COLUNAS.map(function (c) {
      var v = dados[c[1]];
      if (v === undefined || v === null) return '';
      if (v instanceof Date) return v;
      v = String(v).slice(0, 500);
      // Evita que um texto seja interpretado como fórmula
      return /^[=+\-@]/.test(v) ? "'" + v : v;
    });
    sh.appendRow(linha);

    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('erro: ' + err);
  } finally {
    lock.releaseLock();
  }
}

/** Abrir a URL /exec no navegador mostra "ok" se a implantação estiver ativa. */
function doGet() {
  return ContentService.createTextOutput('ok');
}
