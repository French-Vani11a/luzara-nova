(function () {
  document.getElementById('year').textContent = new Date().getFullYear();

  // Mobile menu
  var btn = document.getElementById('menu-btn');
  var menu = document.getElementById('menu');
  btn.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  // Scroll reveal: fade elements in as they enter the viewport
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.sec h2, .sec .lead, .card, .service, .steps li, .pull, .facts, #contact-form, .links').forEach(function (el, i) {
      el.classList.add('rv');
      el.style.setProperty('--d', (i % 4) * 0.07 + 's');
      io.observe(el);
    });
  }

  // Background art: scatter the LN mark across each section. Sizes, tilt and spots are
  // pseudo-random (fixed seed), and each shape picks the emptiest spot so it avoids text.
  (function () {
    var NS = 'http://www.w3.org/2000/svg';
    var OBSTACLES = 'h1,h2,h3,p,li,label,input,select,textarea,button,.btn,.tile,.vcard,.facts,.eyebrow,.pill';

    function rng(seed) {
      return function () {
        seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
        var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    function overlap(a, b) {
      var w = Math.min(a.r, b.r) - Math.max(a.l, b.l);
      var h = Math.min(a.b, b.b) - Math.max(a.t, b.t);
      return w > 0 && h > 0 ? w * h : 0;
    }

    var sections = [].slice.call(document.querySelectorAll('.hero, .sec'));
    var shapes = [];                       // { el, sec, seed, scale }

    function addShape(sec, i, k) {
      var r = rng(4000 + i * 131 + k * 17);
      var svg = document.createElementNS(NS, 'svg');
      var use = document.createElementNS(NS, 'use');
      use.setAttribute('href', '#ln-mark');
      svg.appendChild(use);
      svg.setAttribute('viewBox', '0 0 413 248');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      svg.setAttribute('class', 'deco fill');
      svg.style.setProperty('--rot', ((r() - 0.5) * 40).toFixed(1) + 'deg');
      sec.insertBefore(svg, sec.firstChild);
      shapes.push({ el: svg, sec: sec, seed: 9000 + i * 977 + k * 31, scale: 0.10 + r() * 0.08 });
    }
    sections.forEach(function (sec, i) { for (var k = 0; k < 3; k++) addShape(sec, i, k); });

    function layout() {
      var mobile = window.matchMedia('(max-width: 760px)').matches;
      sections.forEach(function (sec) {
        var box = sec.getBoundingClientRect();
        var W = box.width, H = box.height;
        if (!W || !H) return;

        // Text and UI the art must stay clear of (relative to the section)
        var blocks = [].slice.call(sec.querySelectorAll(OBSTACLES)).map(function (el) {
          var q = el.getBoundingClientRect();
          return { l: q.left - box.left - 10, t: q.top - box.top - 6, r: q.right - box.left + 10, b: q.bottom - box.top + 6 };
        }).filter(function (q) { return q.r - q.l > 4 && q.b - q.t > 4; });

        var placed = [];
        shapes.filter(function (s) { return s.sec === sec; }).forEach(function (s) {
          var w = Math.max(mobile ? 110 : 170, Math.min(340, W * s.scale * 1.15));
          var h = w * 248 / 413;
          var pad = 26;                               // keep clear of the section edges
          var r = rng(s.seed);
          var best = null;
          for (var n = 0; n < 160; n++) {
            var x = pad + r() * Math.max(1, W - w - pad * 2);
            var y = pad + r() * Math.max(1, H - h - pad * 2);
            var rect = { l: x - 10, t: y - 10, r: x + w + 10, b: y + h + 10 };
            var text = 0, near = 0;
            blocks.forEach(function (q) { text += overlap(rect, q); });
            var wide = { l: rect.l - 70, t: rect.t - 70, r: rect.r + 70, b: rect.b + 70 };
            placed.forEach(function (q) { near += overlap(wide, q); });
            var score = text * 4 + near * 10 + r() * 300;
            if (!best || score < best.score) best = { score: score, x: x, y: y, text: text };
          }
          // No genuinely empty spot in a crowded section: leave this shape out
          var tooBusy = best.text > w * h * 0.03;
          s.el.style.display = tooBusy ? 'none' : '';
          if (tooBusy) return;
          s.el.style.width = w.toFixed(0) + 'px';
          s.el.style.left = best.x.toFixed(0) + 'px';
          s.el.style.top = best.y.toFixed(0) + 'px';
          placed.push({ l: best.x, t: best.y, r: best.x + w, b: best.y + h });
        });
      });
    }

    var timer;
    function schedule() { clearTimeout(timer); timer = setTimeout(layout, 150); }
    window.addEventListener('resize', schedule);
    window.addEventListener('load', layout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    layout();
  })();

  // Hero dashboard: live bars, counting numbers, cycling cards, cursor tilt
  (function () {
    var dash = document.getElementById('dash');
    if (!dash) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // keep it static

    var chart = document.getElementById('chart');
    var bars = [].slice.call(chart.children);
    var counters = [].slice.call(dash.querySelectorAll('[data-count]'));
    var orders = document.getElementById('n-orders');
    var ordersValue = Number(orders.getAttribute('data-count'));

    function rand(min, max) { return min + Math.random() * (max - min); }

    // 1. Count numbers up from zero on load
    counters.forEach(function (el) {
      var target = Number(el.getAttribute('data-count'));
      var start = null;
      el.textContent = '0';
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / 1400, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });

    function bumpOrders() {
      ordersValue += 1;
      orders.textContent = ordersValue;
      orders.classList.remove('tick');
      void orders.offsetWidth;
      orders.classList.add('tick');
    }

    // 2. Bars grow from zero, then drift like a live feed
    chart.classList.add('init');
    void chart.offsetHeight;
    bars.forEach(function (b, i) { b.style.transitionDelay = (i * 90) + 'ms'; });
    chart.classList.remove('init');
    setTimeout(function () { bars.forEach(function (b) { b.style.transitionDelay = ''; }); }, 1800);

    setInterval(function () {
      if (document.hidden) return;
      bars.forEach(function (b, i) {
        b.style.transitionDelay = (i * 60) + 'ms';
        b.style.height = Math.round(rand(24, 94)) + '%';
      });
    }, 3200);

    // 3. Notification cards that swap messages
    function cycle(card, messages, firstDelay, every) {
      var msg = card.querySelector('.msg');
      var icon = msg.querySelector('.ok');
      var title = msg.querySelector('b');
      var sub = msg.querySelector('small');
      var i = 0;
      function next() {
        if (document.hidden) return;
        msg.classList.add('out');
        setTimeout(function () {
          i = (i + 1) % messages.length;
          var m = messages[i];
          title.textContent = m.t;
          sub.textContent = m.s;
          icon.className = 'ok' + (m.blue ? ' blue' : '');
          msg.classList.remove('out');
          msg.classList.add('pre');
          void msg.offsetWidth;
          msg.classList.remove('pre');
          if (m.order) bumpOrders();
        }, 480);
      }
      setTimeout(function () { next(); setInterval(next, every); }, firstDelay);
    }

    cycle(document.getElementById('card-a'), [
      { t: 'Role-based access', s: 'Branch manager \u00b7 granted' },
      { t: 'Stock alert resolved', s: 'Inventory \u00b7 Branch 2' },
      { t: 'Invoice paid', s: 'INV-2041 \u00b7 received', blue: true },
      { t: 'Report ready', s: 'Weekly sales \u00b7 exported' }
    ], 3800, 6400);

    cycle(document.getElementById('card-b'), [
      { t: 'New order confirmed', s: 'Table 7 \u00b7 just now', blue: true },
      { t: 'New order confirmed', s: 'Table 3 \u00b7 just now', blue: true, order: true },
      { t: 'Customer added', s: 'Loyalty list \u00b7 just now' },
      { t: 'New order confirmed', s: 'Takeaway \u00b7 just now', blue: true, order: true }
    ], 1200, 5200);

    // 4. Cursor tilt (desktop with a mouse only)
    var hero = document.getElementById('top');
    if (window.matchMedia('(hover: hover) and (min-width: 1001px)').matches) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        dash.style.setProperty('--ry', (x * 12).toFixed(2) + 'deg');
        dash.style.setProperty('--rx', (-y * 10).toFixed(2) + 'deg');
      });
      hero.addEventListener('pointerleave', function () {
        dash.style.setProperty('--ry', '0deg');
        dash.style.setProperty('--rx', '0deg');
      });
    }
  })();

  // Contact form
  var API = (window.LUZARA_API || '').replace(/\/$/, '');
  var form = document.getElementById('contact-form');
  var status = document.getElementById('c-status');
  var submit = document.getElementById('c-submit');

  function clearErrors() {
    form.querySelectorAll('.field').forEach(function (f) { f.classList.remove('invalid'); });
    form.querySelectorAll('.err').forEach(function (e) { e.textContent = ''; });
  }
  function showErrors(errors) {
    Object.keys(errors).forEach(function (k) {
      var span = form.querySelector('.err[data-for="' + k + '"]');
      if (span) {
        span.textContent = errors[k];
        span.closest('.field').classList.add('invalid');
      }
    });
  }
  function setStatus(msg, kind) {
    status.textContent = msg;
    status.className = 'status ' + (kind || '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors();
    setStatus('');
    submit.disabled = true;
    submit.textContent = 'Sending...';

    var body = {};
    new FormData(form).forEach(function (v, k) { body[k] = v; });

    fetch(API + '/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(function (res) { return res.json().then(function (data) { return { res: res, data: data }; }); })
      .then(function (r) {
        if (r.res.ok && r.data.ok) {
          form.reset();
          setStatus(r.data.message || 'Thank you. We will be in touch soon.', 'ok');
        } else if (r.data.errors) {
          showErrors(r.data.errors);
          setStatus('Please check the highlighted fields.', 'bad');
        } else {
          setStatus(r.data.message || 'Something went wrong. Please try again.', 'bad');
        }
      })
      .catch(function () {
        setStatus('Could not reach the server. Email us at luzaranova@gmail.com instead.', 'bad');
      })
      .then(function () {
        submit.disabled = false;
        submit.textContent = 'Send message';
      });
  });
})();
