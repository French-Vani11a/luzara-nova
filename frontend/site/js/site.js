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
