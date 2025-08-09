(function(){
  if(!document.currentScript){ /* script running */ }

  const brandSel = document.getElementById('brand');
  const serial = document.getElementById('serial');
  const brandFields = document.getElementById('brandFields');
  const btnValidate = document.getElementById('btnValidarMotor');
  const btnClear = document.getElementById('btnLimparMotor');
  const status = document.getElementById('motorStatus');
  const interpret = document.getElementById('motorInterpret');
  const file = document.getElementById('motorPhoto');

  function show(el){ el.classList.remove('hidden'); }
  function hide(el){ el.classList.add('hidden'); }
  function setStatus(ok, text){
    status.textContent = text;
    status.className = 'notice ' + (ok ? 'success' : 'error');
    show(status);
  }

  function renderBrandFields(brand){
    brandFields.innerHTML='';
    if(brand==='Yamaha'){
      brandFields.innerHTML = `
        <div>
          <label>Código de Modelo <span class="lang">Model code</span></label>
          <input id="yamModel" placeholder="Ex.: F350NSA">
        </div>
        <div>
          <label>Código Interno <span class="lang">Internal code</span></label>
          <input id="yamCode" placeholder="Ex.: 6ML">
        </div>
      `;
    } else if(brand==='Honda'){
      brandFields.innerHTML = `
        <div>
          <label>Modelo <span class="lang">Model</span></label>
          <input id="honModel" placeholder="Ex.: BF150AK3">
        </div>
        <div>
          <label>Prefixo <span class="lang">Prefix</span></label>
          <input id="honPrefix" placeholder="Ex.: BAZS">
        </div>
      `;
    }
  }

  brandSel.addEventListener('change', e=>{
    renderBrandFields(brandSel.value);
  });

  function validateYamaha(sn, model, code){
    // Very light heuristics: known pattern like 6ML-XXXXXXX and model letters/digits
    const okSerial = /^[A-Z0-9]{2,4}-?\d{5,8}$/.test(sn.toUpperCase());
    const okModel = /^[A-Z0-9]{3,10}$/.test((model||'').toUpperCase());
    const okCode = /^[A-Z0-9]{2,4}$/.test((code||'').toUpperCase());
    let reason = [];
    if(!okSerial) reason.push('Número de série Yamaha fora do padrão expectável');
    if(!okModel) reason.push('Código de modelo Yamaha não reconhecido');
    if(!okCode) reason.push('Código interno Yamaha inválido');
    const ok = okSerial && okModel && okCode;
    return {ok, reason: reason.join('; ') || 'Estrutura coerente Yamaha'};
  }

  function validateHonda(sn, model, prefix){
    const okSerial = /^[A-Z0-9-]{6,14}$/.test(sn.toUpperCase());
    const okModel = /^[A-Z0-9]{3,12}$/.test((model||'').toUpperCase());
    const okPrefix = /^[A-Z0-9]{2,6}$/.test((prefix||'').toUpperCase());
    let reason = [];
    if(!okSerial) reason.push('Número de série Honda fora do padrão expectável');
    if(!okModel) reason.push('Modelo Honda inválido');
    if(!okPrefix) reason.push('Prefixo Honda inválido');
    const ok = okSerial && okModel && okPrefix;
    return {ok, reason: reason.join('; ') || 'Estrutura coerente Honda'};
  }

  function renderInterpret(obj){
    interpret.innerHTML = `
      <h3>Interpretação / <span class="lang">Interpretation</span></h3>
      <div class="kv">
        <div><strong>Marca</strong><div class="small">Brand</div></div>
        <div>${obj.brand}</div>

        <div><strong>Número</strong><div class="small">Serial</div></div>
        <div>${obj.serial}</div>

        ${obj.model?`<div><strong>Modelo</strong><div class="small">Model</div></div><div>${obj.model}</div>`:''}
        ${obj.extra?`<div><strong>Extra</strong><div class="small">Extra</div></div><div>${obj.extra}</div>`:''}
      </div>
    `;
    show(interpret);
  }

  btnValidate.addEventListener('click', async ()=>{
    hide(interpret);
    const brand = brandSel.value;
    const sn = (serial.value||'').trim();
    const photo = await readFileAsDataURL(file.files[0]);

    if(!brand){ setStatus(false,'Selecione a marca / Select brand'); return; }
    if(!sn){ setStatus(false,'Indique o número de série'); return; }

    let verdict = {ok:false, reason:'Em falta'};
    let model='', extra='';

    if(brand==='Yamaha'){
      model = (document.getElementById('yamModel')?.value||'').trim();
      extra = (document.getElementById('yamCode')?.value||'').trim();
      verdict = validateYamaha(sn, model, extra);
    } else if(brand==='Honda'){
      model = (document.getElementById('honModel')?.value||'').trim();
      extra = (document.getElementById('honPrefix')?.value||'').trim();
      verdict = validateHonda(sn, model, extra);
    }

    if(!verdict.ok){
      setStatus(false, 'INVÁLIDO: ' + verdict.reason);
    } else {
      setStatus(true, 'VÁLIDO');
      renderInterpret({brand, serial: sn, model, extra});
    }

    const hist = JSON.parse(localStorage.getItem('motorHistory')||'[]');
    hist.unshift({
      date: nowStr(),
      brand,
      serial: sn,
      result: verdict.ok ? 'Válido' : 'Inválido',
      reason: verdict.reason,
      photo
    });
    localStorage.setItem('motorHistory', JSON.stringify(hist));
  });

  btnClear.addEventListener('click', ()=>{
    brandSel.value=''; serial.value=''; brandFields.innerHTML=''; hide(status); hide(interpret); file.value='';
  });

})();