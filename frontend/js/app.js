(() => {
  const API = (window.LUZARA_API || '').replace(/\/$/, '');
  const $ = (id) => document.getElementById(id);
  const pad = (n) => String(n).padStart(2, '0');

  // background watermark
  const wm = $('watermark');
  for (let i = 0; i < 14; i++) {
    const row = document.createElement('span');
    row.textContent = 'WHAT IS LUZARA NOVA? '.repeat(6);
    row.style.marginLeft = (i % 2 ? -140 : 0) + 'px';
    wm.appendChild(row);
  }
  $('year').textContent = new Date().getFullYear();

  // countdown
  let target = null;
  let offset = 0; // server time minus browser time
  let launched = false;
  let previewing = false;

  function setLaunched(on) {
    launched = on;
    $('tagline').innerHTML = on
      ? 'The wait is over.<br>Welcome to Luzara Nova.'
      : 'We’re building something.<br>We’re not saying what.';
    $('revealed').textContent = on ? 'Launched 21 November 2026' : 'Revealed 21 November 2026';
  }

  function tick() {
    if (!target) return;
    const diff = target - (Date.now() + offset);
    if (diff <= 0 || previewing) {
      ['days', 'hours', 'mins', 'secs'].forEach((k) => ($('cd-' + k).textContent = '00'));
      if (!launched) setLaunched(true);
      return;
    }
    if (launched) setLaunched(false);
    const s = Math.floor(diff / 1000);
    $('cd-days').textContent = pad(Math.floor(s / 86400));
    $('cd-hours').textContent = pad(Math.floor((s % 86400) / 3600));
    $('cd-mins').textContent = pad(Math.floor((s % 3600) / 60));
    $('cd-secs').textContent = pad(s % 60);
  }

  // clues
  function renderClues(clues) {
    const list = $('clue-list');
    list.innerHTML = '';
    clues.forEach((c) => {
      const li = document.createElement('li');
      li.className = 'clue' + (c.unlocked ? ' open' : '');
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = 'Clue ' + c.id;
      const txt = document.createElement('span');
      txt.className = 'txt';
      if (c.unlocked) {
        txt.textContent = c.text;
      } else {
        const d = new Date(c.unlocksAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        txt.textContent = 'Locked. Unlocks ' + d;
      }
      li.append(tag, txt);
      list.appendChild(li);
    });
  }

  async function init() {
    try {
      const res = await fetch(API + '/api/config');
      const cfg = await res.json();
      target = new Date(cfg.launchDate).getTime();
      offset = new Date(cfg.serverTime).getTime() - Date.now();
      renderClues(cfg.clues);
    } catch {
      target = new Date('2026-11-21T00:00:00+02:00').getTime();
    }
    tick();
    setInterval(tick, 1000);
  }

  $('preview-btn').addEventListener('click', () => {
    previewing = !previewing;
    $('preview-btn').textContent = previewing ? 'Back to countdown' : 'Preview launch day';
    tick();
  });

  // form
  const form = $('guess-form');
  const status = $('status');
  const btn = $('submit-btn');

  function showErrors(errors) {
    form.querySelectorAll('.field').forEach((f) => f.classList.remove('invalid'));
    form.querySelectorAll('.err').forEach((e) => (e.textContent = ''));
    Object.entries(errors || {}).forEach(([k, msg]) => {
      const slot = form.querySelector('.err[data-for="' + k + '"]');
      if (slot) {
        slot.textContent = msg;
        slot.closest('.field').classList.add('invalid');
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showErrors({});
    status.className = 'status';
    status.textContent = '';

    const data = Object.fromEntries(new FormData(form).entries());
    btn.disabled = true;
    btn.textContent = 'Sending…';

    try {
      const res = await fetch(API + '/api/guesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const out = await res.json().catch(() => ({}));
      if (res.ok && out.ok) {
        status.className = 'status ok';
        status.textContent = out.message;
        form.reset();
      } else if (res.status === 422) {
        showErrors(out.errors);
        status.className = 'status bad';
        status.textContent = 'Check the highlighted fields and try again.';
      } else {
        status.className = 'status bad';
        status.textContent = out.message || 'Could not send your guess. Please try again.';
      }
    } catch {
      status.className = 'status bad';
      status.textContent = 'No connection. Check your internet and try again.';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send my guess';
    }
  });

  init();
})();
