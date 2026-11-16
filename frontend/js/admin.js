(() => {
  const API = (window.LUZARA_API || '').replace(/\/$/, '');
  const $ = (id) => document.getElementById(id);

  async function call(path) {
    const res = await fetch(API + path, { headers: { 'x-admin-key': $('key').value } });
    if (!res.ok) throw new Error(res.status === 401 ? 'Wrong admin key.' : 'Request failed.');
    return res;
  }

  $('load').addEventListener('click', async () => {
    $('msg').textContent = 'Loading…';
    try {
      const { guesses } = await (await call('/api/admin/guesses')).json();
      const body = $('tbl').querySelector('tbody');
      body.innerHTML = '';
      guesses.forEach((g) => {
        const tr = document.createElement('tr');
        [g.id, g.name, g.phone, g.email, g.guess, g.emailed ? 'Yes' : 'No', g.created_at].forEach((v, i) => {
          const td = document.createElement('td');
          if (i === 4) td.className = 'guess';
          td.textContent = v;
          tr.appendChild(td);
        });
        body.appendChild(tr);
      });
      $('tbl').hidden = false;
      $('msg').textContent = guesses.length + ' guess' + (guesses.length === 1 ? '' : 'es');
    } catch (e) {
      $('msg').textContent = e.message;
    }
  });

  $('csv').addEventListener('click', async () => {
    try {
      const blob = await (await call('/api/admin/guesses.csv')).blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'luzara-nova-guesses.csv';
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      $('msg').textContent = e.message;
    }
  });
})();
