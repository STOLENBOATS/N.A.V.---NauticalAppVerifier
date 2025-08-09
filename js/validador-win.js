(function(){
  const input = document.getElementById('winInput');
  const btnValidate = document.getElementById('btnValidarWIN');
  const btnClear = document.getElementById('btnLimparWIN');
  const status = document.getElementById('winStatus');
  const interpret = document.getElementById('winInterpret');
  const file = document.getElementById('winPhoto');

  function show(el){ el.classList.remove('hidden'); }
  function hide(el){ el.classList.add('hidden'); }
  function setStatus(ok, text){
    status.textContent = text;
    status.className = 'notice ' + (ok ? 'success' : 'error');
    show(status);
  }

  function letterIsValidMonth(ch){
    const c = (ch||'').toUpperCase();
    if(!c) return false;
    if(['I','O','Q'].includes(c)) return false;
    return /[A-Z]/.test(c);
  }

  function parseWIN(raw){
    let win = (raw||'').toUpperCase().trim();
    win = win.replace(/\s+/g,'');
    // Accept optional hyphen between positions 2 and 3
    win = win.replace(/^([A-Z]{2})-?/, '$1'); // if hyphen after 2 letters, drop it for internal logic

    const len = win.length;
    if(len!==14 && len!==16){
      return {ok:false, reason:'Tamanho inválido (esperado 14 ou 16).', data:null};
    }

    // Common head
    const country = win.slice(0,2);
    const maker = win.slice(2,5);
    // Basic alpha checks
    if(!/^[A-Z]{2}$/.test(country)) return {ok:false, reason:'País inválido (devem ser 2 letras).', data:null};
    if(!/^[A-Z]{3}$/.test(maker)) return {ok:false, reason:'Fabricante inválido (devem ser 3 letras).', data:null};

    if(len===14){
      // EU or US-14 form
      const series = win.slice(5,10); // free
      const month = win.slice(10,11);
      const yearProd = win.slice(11,12);
      const modelYY = win.slice(12,14);
      if(!letterIsValidMonth(month)) return {ok:false, reason:'Mês inválido (letra, exceto I,O,Q).', data:null};
      if(!/^[0-9]$/.test(yearProd)) return {ok:false, reason:'Ano de produção inválido (1 dígito).', data:null};
      if(!/^[0-9]{2}$/.test(modelYY)) return {ok:false, reason:'Ano de modelo inválido (2 dígitos).', data:null};

      return {ok:true, type:'EU/US14', data:{country,maker,series,month,yearProd,modelYY,raw:win}};
    } else {
      // US-16
      const series = win.slice(5,12);
      const month = win.slice(12,13);
      const yearProd = win.slice(13,14);
      const modelYY = win.slice(14,16);
      if(!letterIsValidMonth(month)) return {ok:false, reason:'Mês inválido (letra, exceto I,O,Q).', data:null};
      if(!/^[0-9]$/.test(yearProd)) return {ok:false, reason:'Ano de produção inválido (1 dígito).', data:null};
      if(!/^[0-9]{2}$/.test(modelYY)) return {ok:false, reason:'Ano de modelo inválido (2 dígitos).', data:null};

      return {ok:true, type:'US16', data:{country,maker,series,month,yearProd,modelYY,raw:win}};
    }
  }

  function yearHint(digit){ // permit 1900s or 2000s
    const d = Number(digit);
    const y2000 = 2000 + d;
    const y1900 = 1900 + d;
    return `${y1900} ou ${y2000}`;
  }

  function modelYearHint(yy){
    const n = Number(yy);
    const y1900 = 1900 + n;
    const y2000 = 2000 + n;
    return `${y1900} ou ${y2000}`;
  }

  function renderInterpret(d){
    const countryMap = {
      'FR':'França','PT':'Portugal','ES':'Espanha','IT':'Itália','DE':'Alemanha','GB':'Reino Unido','NL':'Países Baixos','SE':'Suécia','FI':'Finlândia','NO':'Noruega','US':'Estados Unidos','CA':'Canadá'
    };
    const countryName = countryMap[d.country] || '—';

    const html = `
      <h3>Interpretação / <span class="lang">Interpretation</span></h3>
      <div class="kv">
        <div><strong>País</strong><div class="small">Country</div></div>
        <div>${d.country} — ${countryName}</div>

        <div><strong>Fabricante</strong><div class="small">Manufacturer</div></div>
        <div>${d.maker}</div>

        <div><strong>Série</strong><div class="small">Series</div></div>
        <div>${d.series}</div>

        <div><strong>Mês</strong><div class="small">Month</div></div>
        <div>${d.month}</div>

        <div><strong>Ano produção</strong><div class="small">Production year</div></div>
        <div>${d.yearProd} — ${yearHint(d.yearProd)}</div>

        <div><strong>Ano modelo</strong><div class="small">Model year</div></div>
        <div>${d.modelYY} — ${modelYearHint(d.modelYY)}</div>
      </div>
    `;
    interpret.innerHTML = html;
    show(interpret);
  }

  btnValidate.addEventListener('click', async ()=>{
    hide(interpret);
    const raw = input.value;
    const parsed = parseWIN(raw);
    const photo = await readFileAsDataURL(file.files[0]);

    if(!parsed.ok){
      setStatus(false, 'INVÁLIDO: ' + parsed.reason);
      // history
      const item = {
        date: nowStr(), win: raw, result: 'Inválido', reason: parsed.reason, photo
      };
      const hist = JSON.parse(localStorage.getItem('winHistory')||'[]');
      hist.unshift(item);
      localStorage.setItem('winHistory', JSON.stringify(hist));
      return;
    }

    setStatus(true, 'VÁLIDO ('+ parsed.type +')');
    renderInterpret(parsed.data);

    const reason = 'Estrutura conforme ('+parsed.type+')';
    const hist = JSON.parse(localStorage.getItem('winHistory')||'[]');
    hist.unshift({
      date: nowStr(),
      win: raw,
      result: 'Válido',
      reason,
      photo
    });
    localStorage.setItem('winHistory', JSON.stringify(hist));
  });

  btnClear.addEventListener('click', ()=>{
    input.value = '';
    file.value = '';
    hide(status); hide(interpret);
  });
})();