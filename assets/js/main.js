(function () {
  "use strict";

  var C = window.LP_CONFIG || {};
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  function brl(v) {
    return "R$ " + Number(v).toLocaleString("pt-BR", {
      minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2
    });
  }
  function waLink(text) {
    return "https://wa.me/" + C.WHATSAPP + (text ? "?text=" + encodeURIComponent(text) : "");
  }
  function track(ev, params, opts) { if (window.fbq) window.fbq("track", ev, params || {}, opts || {}); }

  /* ---------- Valores e links fixos ---------- */
  var VALORES = {
    consulta: C.VALOR_CONSULTA,
    sinal: C.VALOR_SINAL,
    restante: C.VALOR_CONSULTA - C.VALOR_SINAL,
    bio: C.VALOR_BIOIMPEDANCIA,
    "bio-sinal": C.SINAL_BIOIMPEDANCIA,
    "bio-restante": C.VALOR_BIOIMPEDANCIA - C.SINAL_BIOIMPEDANCIA
  };
  $$("[data-valor]").forEach(function (el) { el.textContent = brl(VALORES[el.getAttribute("data-valor")]); });

  $$("[data-whats-link]").forEach(function (el) { el.href = waLink(); el.target = "_blank"; el.rel = "noopener"; });
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  $("#whats-duvida").href = waLink("Olá! Vim pela página de agendamento e tenho uma dúvida sobre a consulta.");
  $$("[data-faq]").forEach(function (el) {
    var txt = (C[el.getAttribute("data-faq")] || "").trim();
    if (txt) $("p", el).textContent = txt; else el.remove();
  });

  /* ---------- Meta Pixel ---------- */
  if (C.META_PIXEL_ID) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", C.META_PIXEL_ID);
    track("PageView");
  }

  /* ---------- UTMs ----------
   * Guarda os parâmetros do anúncio da última visita que veio com UTM,
   * para não perder a origem se a pessoa sair e voltar depois. */
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"];
  var UTM_STORE = "lp_utm";
  function readUtms() {
    var qs = new URLSearchParams(location.search), now = {}, has = false;
    UTM_KEYS.forEach(function (k) { var v = qs.get(k); if (v) { now[k] = v; has = true; } });
    try {
      if (has) { localStorage.setItem(UTM_STORE, JSON.stringify(now)); return now; }
      return JSON.parse(localStorage.getItem(UTM_STORE) || "{}");
    } catch (e) { return now; }
  }
  var utms = readUtms();

  /* ---------- Formulário ---------- */
  var form = $("#step-form"), done = $("#step-done"), err = $("#form-error");
  var whats = form.elements.whats;
  var sent = false;

  /* Particular, Unimed ou Unimed + face (sem bioimpedância): define o texto do "estou ciente" */
  var MODALIDADES = {
    particular: "Particular",
    unimed: "Unimed (bioimpedância)",
    "unimed-face": "Unimed – face (sem bioimpedância)"
  };
  function modalidade() {
    var m = form.elements.modalidade.value;
    if (m === "unimed" && /face/i.test(form.elements.procedimento.value)) return "unimed-face";
    return m;
  }
  function updateAware() {
    var m = modalidade(), aware = $(".aware", form);
    aware.hidden = !m;
    $$("[data-aware]", aware).forEach(function (el) { el.hidden = el.getAttribute("data-aware") !== m; });
    form.elements.ciente.checked = false;   // mudou a escolha: confirma de novo o texto novo
  }
  form.elements.modalidade.addEventListener("change", updateAware);
  form.elements.procedimento.addEventListener("change", updateAware);
  updateAware();

  whats.addEventListener("input", function () {
    var d = whats.value.replace(/\D/g, "").slice(0, 11);
    var out = d;
    if (d.length > 2) out = "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length > 7) out = "(" + d.slice(0, 2) + ") " + d.slice(2, d.length - 4) + "-" + d.slice(-4);
    whats.value = out;
  });

  function validate() {
    var msgs = [];
    $$("input, select", form).forEach(function (f) { f.removeAttribute("aria-invalid"); });
    function bad(f, m) { f.setAttribute("aria-invalid", "true"); msgs.push(m); }
    if (form.elements.nome.value.trim().length < 3) bad(form.elements.nome, "Informe seu nome.");
    if (whats.value.replace(/\D/g, "").length < 10) bad(whats, "Informe um WhatsApp válido com DDD.");
    if (!form.elements.procedimento.value) bad(form.elements.procedimento, "Selecione o que você deseja tratar.");
    if (!form.elements.modalidade.value) bad(form.elements.modalidade, "Selecione se a consulta é particular ou pela Unimed.");
    if (!form.elements.cidade.value) bad(form.elements.cidade, "Selecione onde você mora.");
    if (form.elements.modalidade.value && !form.elements.ciente.checked) bad(form.elements.ciente, "Confirme que está ciente dos valores.");
    return msgs;
  }

  /* Envia o lead para a planilha (Google Apps Script).
     text/plain + no-cors evita bloqueio de CORS; keepalive mantém o envio
     mesmo quando a página é trocada pelo WhatsApp. */
  function sendToSheet(lead) {
    if (!C.PLANILHA_URL) return;
    var body = JSON.stringify(lead);
    var beacon = function () { if (navigator.sendBeacon) navigator.sendBeacon(C.PLANILHA_URL, body); };
    try {
      fetch(C.PLANILHA_URL, {
        method: "POST", mode: "no-cors", keepalive: true,
        headers: { "Content-Type": "text/plain;charset=utf-8" }, body: body
      }).catch(beacon);
    } catch (e) { beacon(); }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (sent) return;
    var msgs = validate();
    if (msgs.length) {
      err.textContent = msgs.join(" ");
      err.hidden = false;
      var first = $("[aria-invalid=true]", form);
      if (first) first.focus();
      return;
    }
    err.hidden = true;
    sent = true;

    var leadId = "lead-" + Date.now();
    var lead = {
      id: leadId,
      nome: form.elements.nome.value.trim(),
      whatsapp: whats.value,
      procedimento: form.elements.procedimento.value,
      cidade: form.elements.cidade.value,
      modalidade: MODALIDADES[modalidade()],
      utm_source: utms.utm_source || "",
      utm_medium: utms.utm_medium || "",
      utm_campaign: utms.utm_campaign || "",
      utm_content: utms.utm_content || "",
      utm_term: utms.utm_term || "",
      fbclid: utms.fbclid || "",
      gclid: utms.gclid || "",
      pagina: location.href.split("#")[0],
      dispositivo: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? "Celular" : "Computador"
    };

    track("Lead", { content_name: "Agendamento consulta de avaliação" }, { eventID: leadId });
    sendToSheet(lead);
    showCountdown(lead.nome.split(" ")[0]);
  });

  /* ---------- Contagem e redirecionamento para o WhatsApp ----------
   * A espera dá tempo do evento Lead chegar na Meta e do lead cair na planilha. */
  function showCountdown(firstName) {
    var url = waLink(C.MENSAGEM_WHATSAPP);
    var left = Math.max(1, Number(C.SEGUNDOS_ATE_WHATSAPP) || 5);
    var countEl = $("#done-count"), btn = $("#done-whats");

    $("#done-title").textContent = "Pronto, " + firstName + "! Recebemos seus dados.";
    btn.href = url;
    countEl.textContent = left;
    form.hidden = true;
    done.hidden = false;
    $("#checkout").scrollIntoView({ behavior: "smooth", block: "center" });

    var timer = setInterval(function () {
      left -= 1;
      countEl.textContent = Math.max(left, 0);
      if (left <= 0) {
        clearInterval(timer);
        btn.hidden = false;          // caso o navegador não abra o WhatsApp sozinho
        window.location.href = url;
      }
    }, 1000);
  }

  /* ---------- CTA fixo some no topo (para não cobrir o texto) e no formulário ---------- */
  var sticky = $(".sticky-cta");
  if ("IntersectionObserver" in window && sticky) {
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.className] = en.isIntersecting; });
      sticky.classList.toggle("is-hidden", Object.keys(visible).some(function (k) { return visible[k]; }));
    }, { threshold: 0.05 });
    io.observe($(".hero"));
    io.observe($("#agendar"));
  }
})();
