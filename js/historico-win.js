document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.querySelector('#tabelaWin tbody');
  const btn = document.getElementById('exportWinCsv');
  let arr = [];
  try { arr = JSON.parse(localStorage.getItem('historico_win') || '[]'); } catch { arr = []; }
  arr.sort((a,b)=> (b.ts||'').localeCompare(a.ts||''));
  tbody.innerHTML = arr.length ? arr.map(r => `
    <tr>
      <td>${new Date(r.ts).toLocaleString()}</td>
      <td>${r.win||''}</td>
      <td>${r.resultado||''}</td>
      <td>${r.motivo||''}</td>
      <td>${r.foto?'<img src="'+r.foto+'" alt="foto" style="height:36px">':'—'}</td>
    </tr>`).join('') : `<tr><td colspan="5" style="text-align:center;color:#666">Sem registos ainda.</td></tr>`;
  if(btn && typeof downloadCSV==='function'){
    btn.addEventListener('click', ()=>{
      const rows = [['Data','WIN','Resultado','Justificação']].concat(arr.map(r=>[
        new Date(r.ts).toLocaleString(), r.win||'', r.resultado||'', r.motivo||''
      ]));
      downloadCSV('historico_win.csv', rows);
    });
  }
});