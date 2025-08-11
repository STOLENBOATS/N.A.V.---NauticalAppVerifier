document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.querySelector('#tabelaMotor tbody');
  const btn = document.getElementById('exportMotorCsv');
  let arr = [];
  try { arr = JSON.parse(localStorage.getItem('historico_motor') || '[]'); } catch { arr = []; }
  arr.sort((a,b)=> (b.ts||'').localeCompare(a.ts||''));
  tbody.innerHTML = arr.length ? arr.map(r => `
    <tr>
      <td>${new Date(r.ts).toLocaleString()}</td>
      <td>${(r.marca||'').toUpperCase()}</td>
      <td>${r.sn||''}</td>
      <td>${r.resultado||''}</td>
      <td>${r.motivo||''}</td>
      <td>${r.foto?'<img src="'+r.foto+'" alt="foto" style="height:36px">':'—'}</td>
    </tr>`).join('') : `<tr><td colspan="6" style="text-align:center;color:#666">Sem registos ainda.</td></tr>`;
  if(btn && typeof downloadCSV==='function'){
    btn.addEventListener('click', ()=>{
      const rows = [['Data','Marca','S/N','Resultado','Justificação']].concat(arr.map(r=>[
        new Date(r.ts).toLocaleString(), (r.marca||'').toUpperCase(), r.sn||'', r.resultado||'', r.motivo||''
      ]));
      downloadCSV('historico_motor.csv', rows);
    });
  }
});