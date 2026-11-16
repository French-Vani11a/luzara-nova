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
