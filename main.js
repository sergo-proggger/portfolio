/* cherncode v10 · «Сайт начинается с разговора».
   Focus Cards и Expandable Card по мотивам Aceternity UI, переписаны на чистый JS. */
(function () {
  'use strict';

  var NICHES = window.NICHES || [];
  var WORKS = window.WORKS || [];
  var STUDY = window.STUDY || [];
  var REVIEWS = window.REVIEWS || [];
  var TG = 'https://t.me/serega_chErno';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var find = function (list, key, val) { for (var i = 0; i < list.length; i++) if (list[i][key] === val) return list[i]; return null; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var AVA = 'sergey-desk.jpg';

  /* ================= ДИАЛОГ ================= */
  var log = $('[data-log]');
  var repliesBox = $('[data-replies]');
  var typingTimer = null;

  var repliesLabel = document.createElement('p');
  repliesLabel.className = 'mono replies-label';
  repliesLabel.textContent = 'Выберите, что ближе:';
  repliesBox.appendChild(repliesLabel);

  NICHES.forEach(function (n) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'reply';
    b.dataset.niche = n.id;
    b.setAttribute('aria-pressed', 'false');
    b.textContent = n.ask;
    b.addEventListener('click', function () { choose(n.id, false); });
    repliesBox.appendChild(b);
  });

  function attachHTML(w) {
    return '<button type="button" class="attach" data-open="' + esc(w.id) + '">' +
      '<div class="attach-media"><img src="' + esc(w.img) + '" alt="' + esc(w.title) + ', первый экран" width="1440" height="900">' +
      (w.phone ? '<div class="attach-phone" aria-hidden="true"><img src="' + esc(w.phone) + '" alt="" width="390" height="844"></div>' : '') +
      '</div><div class="attach-cap"><b>' + esc(w.title) + '</b><span>' + esc(w.host) + '</span></div></button>';
  }

  function answerHTML(n) {
    var w = n.feature ? find(WORKS, 'id', n.feature) : null;
    var r = n.review ? find(REVIEWS, 'name', n.review) : null;
    var count = WORKS.filter(function (x) { return x.niches.indexOf(n.id) > -1; }).length;
    return '<p class="mono meta">Сергей</p>' +
      '<p class="answer-text">' + esc(n.reply) + '</p>' +
      (w ? attachHTML(w) : '') +
      (r ? '<div class="fwd-mini"><span class="mono">Переслано от ' + esc(r.name) + ' · ' + esc(r.what) + '</span>«' + esc(r.text) + '»</div>' : '') +
      '<div class="quote-card"><div><span class="mono">Цена</span><b>' + esc(n.price) + '</b></div><div><span class="mono">Срок</span><b>' + esc(n.term) + '</b></div></div>' +
      '<div class="answer-actions">' +
        (count ? '<a class="btn btn-line" href="#works" data-to-works="' + esc(n.id) + '">Все работы (' + count + ') ↓</a>' : '') +
        '<a class="btn" href="' + TG + '" target="_blank" rel="noopener">Написать в Telegram</a>' +
      '</div>';
  }

  function msgMe(inner, extraClass) {
    var d = document.createElement('div');
    d.className = 'msg msg-me cont' + (extraClass ? ' ' + extraClass : '');
    d.innerHTML = '<img class="ava" src="' + AVA + '" alt="" width="48" height="48"><div class="bubble">' + inner + '</div>';
    return d;
  }

  function choose(id, instant) {
    var n = find(NICHES, 'id', id);
    if (!n) return;
    clearTimeout(typingTimer);
    $$('.reply', repliesBox).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.niche === id)); });
    repliesLabel.textContent = 'Или выберите другое:';
    history.replaceState(null, '', '#' + id);
    setFilter(id);

    log.innerHTML = '';
    var client = document.createElement('div');
    client.className = 'msg-client' + (instant || reduced ? '' : ' enter');
    client.innerHTML = '<div class="bubble">' + esc(n.ask) + '</div>';
    log.appendChild(client);

    var show = function () {
      var ans = msgMe(answerHTML(n), instant || reduced ? '' : 'enter');
      if (typing && typing.parentNode) typing.replaceWith(ans); else log.appendChild(ans);
    };
    var typing = null;
    if (instant || reduced) { show(); return; }
    typing = msgMe('<span class="typing" aria-label="Сергей печатает"><i></i><i></i><i></i></span>', 'enter');
    log.appendChild(typing);
    typingTimer = setTimeout(show, 900);
    // держим ответ в поле зрения на телефоне
    setTimeout(function () { client.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 50);
  }

  log.addEventListener('click', function (e) {
    var open = e.target.closest('[data-open]');
    if (open) { openCase(find(WORKS, 'id', open.dataset.open), open); return; }
    var to = e.target.closest('[data-to-works]');
    if (to) { e.preventDefault(); setFilter(to.dataset.toWorks); $('#works').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); }
  });

  /* ================= РАБОТЫ ================= */
  var filtersBox = $('[data-filters]');
  var list = $('[data-works]');
  var tildaNote = $('[data-tilda-note]');

  [{ id: 'all', label: 'Все работы' }].concat(NICHES).forEach(function (n) {
    var c = n.id === 'all' ? WORKS.length : WORKS.filter(function (w) { return w.niches.indexOf(n.id) > -1; }).length;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'filter';
    b.dataset.filter = n.id;
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = esc(n.label) + '<sup>' + c + '</sup>';
    b.addEventListener('click', function () { setFilter(n.id); });
    filtersBox.appendChild(b);
  });

  WORKS.forEach(function (w) {
    var el = document.createElement('button');
    el.type = 'button';
    el.className = 'work';
    el.dataset.id = w.id;
    el.setAttribute('aria-haspopup', 'dialog');
    el.innerHTML =
      '<div class="work-media"><img src="' + esc(w.img) + '" alt="' + esc(w.title) + ', первый экран" loading="lazy" width="1440" height="900">' +
        (w.phone ? '<div class="work-phone" aria-hidden="true"><img src="' + esc(w.phone) + '" alt="" loading="lazy" width="390" height="844"></div>' : '') +
      '</div>' +
      '<div class="work-text">' +
        '<p class="mono work-file"><span class="' + (w.commercial ? 'tag-real' : '') + '">' + (w.commercial ? 'заказ клиента' : 'демо / шаблон') + '</span><span>' + esc(w.host) + '</span><span>' + esc(w.tags.join(' · ')) + '</span></p>' +
        '<h3>' + esc(w.title) + '</h3>' +
        '<p>' + esc(w.type) + '. ' + esc(w.task) + '</p>' +
        '<span class="work-open">Что сделал →</span>' +
      '</div>';
    el.addEventListener('click', function () { openCase(w, el); });
    list.appendChild(el);
  });

  // Focus Cards
  list.addEventListener('pointerover', function (e) { if (e.target.closest('.work')) list.classList.add('has-hover'); });
  list.addEventListener('pointerleave', function () { list.classList.remove('has-hover'); });

  function setFilter(id) {
    $$('.filter', filtersBox).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.filter === id)); });
    var n = find(NICHES, 'id', id);
    var featured = n ? n.feature : 'languagevoyage';
    var visible = [];
    $$('.work', list).forEach(function (el) {
      var w = find(WORKS, 'id', el.dataset.id);
      var on = id === 'all' || w.niches.indexOf(id) > -1;
      el.hidden = !on;
      el.classList.remove('is-featured', 'is-offset', 'enter');
      if (on) visible.push(el);
    });
    var f = featured && list.querySelector('[data-id="' + featured + '"]:not([hidden])');
    if (!f && visible.length === 1) f = visible[0];
    if (f) { f.classList.add('is-featured'); list.insertBefore(f, list.firstChild); }
    // асимметрия: каждая вторая карточка в паре опущена
    var k = 0;
    $$('.work:not([hidden])', list).forEach(function (el) {
      if (el.classList.contains('is-featured')) return;
      if (k % 2 === 1) el.classList.add('is-offset');
      k++;
      if (!reduced) { void el.offsetWidth; el.classList.add('enter'); }
    });
    tildaNote.hidden = visible.length > 0;
  }

  /* ================= КЕЙС ================= */
  var dlg = $('[data-case]');
  var lastTrigger = null;
  function openCase(w, trigger) {
    if (!w) return;
    lastTrigger = trigger;
    var img = $('[data-case-img]', dlg);
    img.src = w.img; img.alt = w.title + ', скриншот';
    $('[data-case-type]', dlg).textContent = w.type;
    $('[data-case-title]', dlg).textContent = w.title;
    $('[data-case-facts]', dlg).innerHTML =
      '<dt>Задача</dt><dd>' + esc(w.task) + '</dd>' +
      '<dt>Что сделал</dt><dd>' + esc(w.done) + '</dd>' +
      '<dt>Итог</dt><dd>' + esc(w.result) + '</dd>' +
      '<dt>Технологии</dt><dd>' + esc(w.tags.join(', ')) + '</dd>';
    var q = $('[data-case-quote]', dlg);
    if (w.quote) { q.hidden = false; q.innerHTML = '«' + esc(w.quote.text) + '»<cite>' + esc(w.quote.who) + '</cite>'; } else q.hidden = true;
    var link = $('[data-case-link]', dlg);
    link.href = w.url;
    link.textContent = w.commercial ? 'Открыть сайт ↗' : 'Открыть демо ↗';
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    $('[data-case-close]', dlg).focus();
  }
  function closeCase() { if (dlg.open) dlg.close(); }
  $('[data-case-close]', dlg).addEventListener('click', closeCase);
  $('[data-case-write]', dlg).addEventListener('click', closeCase);
  dlg.addEventListener('click', function (e) { if (e.target === dlg) closeCase(); });
  dlg.addEventListener('close', function () { if (lastTrigger && document.body.contains(lastTrigger)) lastTrigger.focus(); });

  /* ================= УЧЕБНЫЕ ================= */
  var study = $('[data-study]');
  var prev = $('[data-study-preview]');
  STUDY.forEach(function (s) {
    var li = document.createElement('li');
    li.innerHTML = '<a href="' + esc(s.url) + '" target="_blank" rel="noopener"><b>' + esc(s.title) + '</b><span>' + esc(s.note) + ' ↗</span></a>';
    if (s.img) {
      li.firstChild.addEventListener('pointerenter', function () { prev.src = s.img; prev.classList.add('is-on'); });
      li.firstChild.addEventListener('pointerleave', function () { prev.classList.remove('is-on'); });
    }
    study.appendChild(li);
  });
  study.addEventListener('pointermove', function (e) {
    prev.style.left = (e.clientX + 180) + 'px';
    prev.style.top = e.clientY + 'px';
  });

  /* ================= ОТЗЫВЫ ================= */
  var wall = $('[data-reviews]');
  REVIEWS.forEach(function (r) {
    var f = document.createElement('figure');
    f.className = 'fwd';
    f.innerHTML = '<span class="mono">Переслано от <b>' + esc(r.name) + '</b> · ★★★★★</span>' +
      '<q>' + esc(r.text) + '</q><footer>' + esc(r.what) + ', ' + esc(r.date) + '</footer>';
    wall.appendChild(f);
  });

  /* ================= ЛЕНТА ДНЕЙ ================= */
  var days = $$('.day');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -15% 0px' });
    days.forEach(function (d) { io.observe(d); });
  } else days.forEach(function (d) { d.classList.add('is-in'); });

  /* ================= ШАПКА И КНОПКА ВНИЗУ ================= */
  var top = $('.top'), dock = $('[data-dock]'), talk = $('.talk'), write = $('#write');
  function onScroll() {
    top.classList.toggle('is-scrolled', window.scrollY > 8);
    var past = talk.getBoundingClientRect().bottom < 0;
    var atWrite = write.getBoundingClientRect().top < window.innerHeight;
    dock.classList.toggle('is-on', past && !atWrite);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ================= НАПИСАТЬ ================= */
  var composer = $('[data-composer]');
  var text = $('[data-composer-text]');
  var status = $('[data-composer-status]');
  composer.addEventListener('submit', function (e) {
    e.preventDefault();
    var t = text.value.trim();
    var msg = 'Здравствуйте, Сергей! ' + (t || 'Нужен сайт, хочу обсудить.') + '\n(пишу с cherncode.ru)';
    var go = function (ok) {
      status.textContent = ok ? 'Скопировано. Вставьте в чат, который открылся.' : 'Скопируйте текст и отправьте мне в Telegram.';
      status.classList.toggle('is-ok', ok);
      window.open(TG, '_blank', 'noopener');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(msg).then(function () { go(true); }, function () { go(false); });
    else go(false);
  });
  text.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) composer.requestSubmit();
  });

  /* ================= СТАРТ ================= */
  var h = location.hash.replace('#', '');
  if (find(NICHES, 'id', h)) choose(h, true); else setFilter('all');
  window.addEventListener('hashchange', function () {
    var x = location.hash.replace('#', '');
    if (find(NICHES, 'id', x)) { choose(x, true); window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); }
  });
})();
