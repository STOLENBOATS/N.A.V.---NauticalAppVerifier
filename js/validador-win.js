document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('winForm');
  const input = document.getElementById('winInput');
  const out = document.getElementById('winResultado');
  const interp = document.getElementById('winInterpretacao');

  if(!form || !input || !out || !interp) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const rawOriginal = (input.value || '').toUpperCase().trim();
    const raw = rawOriginal
      .toUpperCase()
      .replace(/\s+/g,'')
      .replace(/-/g,'')
      .trim();

    if(!raw){ out.textContent = 'Introduza um WIN.'; return; }

    const res = validarWINBase(raw);
    res.win = rawOriginal;
    renderResultado(res);
    guardarHistoricoWIN(res);
  });

  function validarWINBase(win){
    const EU14 = /^[A-Z]{2}[A-Z]{3}[A-Z0-9]{5}[A-HJ-NPR-TWXYZ][0-9][0-9]{2}$/;
    const US14_16 = /^[A-Z]{2}[A-Z]{3}[A-Z0-9]{7}[A-HJ-NPR-TWXYZ][0-9][0-9]{2}([0-9]{2})?$/;
    const isEU = EU14.test(win);
    const isUS = US14_16.test(win);
    const valido = isEU || isUS;

    const pais = win.slice(0,2);
    const fab  = win.slice(2,5);
    const serie = isEU ? win.slice(5,10) : win.slice(5,12);
    const mes = isEU ? win[10] : win[12];
    const anoProd = isEU ? win[11] : win[13];
    const anoMod  = isEU ? win.slice(12,14) : (win.length>=16 ? win.slice(14,16) : '');

    return {
      win, valido,
      partes:{ pais, fab, serie, mes, anoProd, anoMod },
      motivo: valido ? 'Estrutura válida (verificação base).' : 'Falha no padrão estrutural.'
    };
  }

  function renderResultado(res){
    const {valido, motivo, partes} = res;
    out.innerHTML = `<strong>${valido ? 'WIN VÁLIDO' : 'WIN INVÁLIDO'}</strong> — ${motivo}`;
    interp.innerHTML = `
      <table class="interp">
        <thead><tr><th>Campo</th><th>Valor</th><th>Interpretação</th></tr></thead>
        <tbody>
          <tr><td>País</td><td>${partes.pais}</td><td>País de fabrico (ex.: FR = França)</td></tr>
          <tr><td>Fabricante</td><td>${partes.fab}</td><td>Construtor (ex.: CNB)</td></tr>
          <tr><td>Série</td><td>${partes.serie}</td><td>Número de série/registo</td></tr>
          <tr><td>Mês produção</td><td>${partes.mes}</td><td>Letra mês (A=Jan; B=Fev; …; sem I,O,Q)</td></tr>
          <tr><td>Ano produção</td><td>${partes.anoProd}</td><td>Último dígito do ano</td></tr>
          <tr><td>Ano modelo</td><td>${partes.anoMod}</td><td>Dois dígitos (19xx/20xx)</td></tr>
        </tbody>
      </table>
    `;
  }

  function guardarHistoricoWIN(res){
    try{
      const key = 'historico_win';
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      arr.unshift({
        ts: new Date().toISOString(),
        win: res.win,
        resultado: res.valido ? 'Válido' : 'Inválido',
        motivo: res.motivo,
        foto: null
      });
      localStorage.setItem(key, JSON.stringify(arr.slice(0,500)));
    }catch(e){ console.warn('Histórico WIN falhou:', e); }
  }
});