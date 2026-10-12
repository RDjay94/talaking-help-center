(function () {
  "use strict";
  var C = window.TK_CONTENT;
  var app = document.getElementById("app");
  var lang = C.defaultLang;
  try { lang = localStorage.getItem("tk-lang") || lang; } catch (e) {}
  var filter = "all", query = "";

  function t(k) { return C.ui[lang][k]; }
  function L(o) { return o[lang] || o.en; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function byId(id) { return C.tutorials.filter(function (x) { return x.id === id; })[0]; }

  function applyUi() {
    document.documentElement.lang = lang === "fil" ? "fil" : "en";
    document.querySelectorAll("[data-ui]").forEach(function (el) { el.textContent = t(el.getAttribute("data-ui")); });
    document.getElementById("navPlay").href = C.links.site;
  }

  function card(tut, i) {
    return '<a class="card reveal" style="--accent:' + tut.accent + ';--d:' + (i * 70) + 'ms" href="#/g/' + tut.id + '">' +
      '<div class="card-thumb"><img src="assets/img/steps/' + tut.id + '/cover.jpg" alt="" loading="lazy">' +
      '<span class="play-dot">▶</span><span class="dur">' + tut.duration + '</span></div>' +
      '<div class="card-body"><span class="chip">' + tut.icon + " " + esc(t("cats")[tut.cat]) + '</span>' +
      '<h3>' + esc(L(tut.title)) + '</h3><p>' + esc(L(tut.summary)) + '</p>' +
      '<div class="card-foot"><span>' + tut.steps.length + " " + t("steps") + '</span><span class="go">' + t("watch") + ' →</span></div></div></a>';
  }

  function renderHome() {
    var cats = ["all"].concat(Object.keys(t("cats")));
    app.innerHTML =
      '<section class="hero"><div class="hero-copy reveal"><span class="eyebrow">' + t("heroEyebrow") + '</span>' +
      '<h1>' + t("heroTitle") + '</h1><p>' + esc(t("heroSub")) + '</p>' +
      '<div class="hero-cta"><a class="btn btn-pink" target="_blank" rel="noopener" href="' + C.links.register + '">' + t("ctaJoin") + '</a>' +
      '<a class="btn btn-ghost" href="#guides">▶ ' + t("videoTitle") + '</a></div></div>' +
      '<div class="hero-phones reveal" aria-hidden="true">' + C.tutorials.slice(0, 3).map(function (x, i) {
        return '<div class="phone p' + i + '"><img src="assets/img/steps/' + x.id + '/cover.jpg" alt=""></div>';
      }).join("") + '</div></section>' +
      '<section class="guides" id="guides"><div class="toolbar">' +
      '<div class="search"><span>🔍</span><input id="q" type="search" placeholder="' + esc(t("search")) + '" value="' + esc(query) + '"></div>' +
      '<div class="filters">' + cats.map(function (c) {
        return '<button type="button" class="filter' + (c === filter ? " on" : "") + '" data-f="' + c + '">' + esc(c === "all" ? t("all") : t("cats")[c]) + '</button>';
      }).join("") + '</div></div><div class="cards" id="cards"></div></section>';
    drawCards();
    document.getElementById("q").addEventListener("input", function (e) { query = e.target.value; drawCards(); });
    app.querySelectorAll(".filter").forEach(function (b) {
      b.addEventListener("click", function () {
        filter = b.getAttribute("data-f");
        app.querySelectorAll(".filter").forEach(function (x) { x.classList.toggle("on", x === b); });
        drawCards();
      });
    });
  }

  function drawCards() {
    var q = query.trim().toLowerCase();
    var list = C.tutorials.filter(function (x) {
      if (filter !== "all" && x.cat !== filter) return false;
      if (!q) return true;
      var hay = [x.title.en, x.title.fil, x.summary.en, x.summary.fil].concat(x.steps.map(function (s) { return s.en.join(" ") + " " + s.fil.join(" "); })).join(" ").toLowerCase();
      return hay.indexOf(q) > -1;
    });
    var el = document.getElementById("cards");
    el.innerHTML = list.length ? list.map(card).join("") : '<p class="empty">' + t("noResults") + "</p>";
    observe();
  }

  function renderGuide(id) {
    var tut = byId(id);
    if (!tut) { location.hash = "#/"; return; }
    var n = tut.notes || {};
    var note = function (kind) {
      return n[kind] ? '<div class="note note-' + kind + '"><b>' + (kind === "warn" ? "⚠️ " + t("warn") : "💡 " + t("tip")) + "</b> " + esc(L(n[kind])) + "</div>" : "";
    };
    app.innerHTML =
      '<article class="guide" style="--accent:' + tut.accent + '">' +
      '<a class="back" href="#/">← ' + t("back") + '</a>' +
      '<div class="guide-head reveal"><span class="chip">' + tut.icon + " " + esc(t("cats")[tut.cat]) + '</span>' +
      '<h1>' + esc(L(tut.title)) + '</h1><p>' + esc(L(tut.summary)) + '</p>' +
      '<div class="meta"><span>▶ ' + tut.duration + " " + t("minRead") + '</span><span>' + tut.steps.length + " " + t("steps") + '</span>' +
      '<button class="share" type="button" id="share">🔗 ' + t("share") + '</button></div></div>' +
      '<div class="guide-grid"><div class="video-col reveal"><div class="video-wrap">' +
      '<video id="vid" playsinline controls preload="metadata" poster="assets/img/steps/' + tut.id + '/cover.jpg" src="' + tut.video + '"></video>' +
      '<button class="cover" id="cover" type="button"><span class="big-play">▶</span><span class="cover-title">' + esc(L(tut.title)) + '</span><span class="cover-pill">' + tut.duration + " · " + t("videoTitle") + '</span></button>' +
      '</div>' + note("warn") + note("tip") + '</div>' +
      '<div class="steps-col"><h2>' + t("stepsTitle") + '</h2><ol class="steps">' + tut.steps.map(function (s, i) {
        var num = String(i + 1).padStart(2, "0");
        return '<li class="step reveal" style="--d:' + (i % 3) * 60 + 'ms"><div class="shot"><img loading="lazy" src="assets/img/steps/' + tut.id + "/step-" + num + '.jpg" alt="' + esc(L(s)[0]) + '"></div>' +
          '<div class="step-txt"><span class="badge">' + t("stepLabel") + " " + (i + 1) + '</span><h3>' + esc(L(s)[0]) + '</h3><p>' + esc(L(s)[1]) + "</p></div></li>";
      }).join("") + '</ol></div></div>' +
      '<section class="cta-band reveal"><div><h2>' + t("ctaTitle") + '</h2><p>' + t("ctaSub") + '</p></div>' +
      '<a class="btn btn-pink" target="_blank" rel="noopener" href="' + C.links.site + '">' + t("ctaPlay") + ' →</a></section>' +
      '<h2 class="rel-h">' + t("related") + '</h2><div class="cards cards-sm">' +
      C.tutorials.filter(function (x) { return x.id !== id; }).map(card).join("") + '</div></article>';

    var v = document.getElementById("vid"), cov = document.getElementById("cover");
    cov.addEventListener("click", function () { cov.classList.add("gone"); v.play(); });
    v.addEventListener("play", function () { cov.classList.add("gone"); });
    document.getElementById("share").addEventListener("click", function () {
      var url = location.href;
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () { toast(t("copied")); }, function () { prompt("", url); });
    });
    app.querySelectorAll(".shot img").forEach(function (img) {
      img.addEventListener("click", function () {
        var z = document.createElement("div");
        z.className = "zoom"; z.innerHTML = '<img src="' + img.src + '" alt="">';
        z.addEventListener("click", function () { z.remove(); });
        document.body.appendChild(z);
      });
    });
    observe();
  }

  function toast(msg) {
    var el = document.getElementById("toast");
    el.textContent = msg; el.classList.add("on");
    setTimeout(function () { el.classList.remove("on"); }, 1800);
  }

  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 }) : null;
  function observe() {
    var els = app.querySelectorAll(".reveal:not(.in)");
    els.forEach(function (el) { io ? io.observe(el) : el.classList.add("in"); });
    // safety net: never leave content hidden if the observer doesn't fire
    setTimeout(function () { els.forEach(function (el) { el.classList.add("in"); }); }, 1200);
  }

  function route() {
    applyUi();
    var m = location.hash.match(/^#\/g\/([\w-]+)/);
    if (m) renderGuide(m[1]); else renderHome();
    if (location.hash !== "#guides") window.scrollTo(0, 0);
  }

  document.getElementById("langBtn").addEventListener("click", function () {
    lang = lang === "fil" ? "en" : "fil";
    try { localStorage.setItem("tk-lang", lang); } catch (e) {}
    var y = window.scrollY; route(); window.scrollTo(0, y);
  });
  // ?lang=en / ?lang=fil deep links
  var qp = new URLSearchParams(location.search).get("lang");
  if (qp === "en" || qp === "fil") lang = qp;

  window.addEventListener("hashchange", function () { if (location.hash !== "#guides") route(); });
  window.addEventListener("scroll", function () {
    var h = document.documentElement, p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    document.getElementById("progress").style.transform = "scaleX(" + p + ")";
  }, { passive: true });
  route();
})();
