document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('motorForm');
  const marcaSel = document.getElementById('motorMarca');
  const snInput = document.getElementById('motorSn');
  const out = document.getElementById('motorResultado');
  const interp = document.getElementById('motorInterpretacao');
  const camposBox = document.getElementById('motorCampos');
  if(!form || !marcaSel || !snInput || !out || !interp) return;

  if(camposBox){ marcaSel.addEventListener('change', () => renderCampos(marcaSel.value)); renderCampos(marcaSel.value); }

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const marca = (marcaSel.value||'').toLowerCase();
    const sn = (snInput.value||'').toUpperCase().trim().replace(/\s+/g,' ');
    if(!marca || !sn){ out.textContent='Selecione marca e introduza S/N.'; return; }

    const extra = lerCampos(marca);
    const res = validarMotor(marca, sn, extra);
    render(res);
    guardarHistoricoMotor(res);
  });

  function renderCampos(marca){
    if(!camposBox) return;
    const m = (marca||'').toLowerCase();
    if(m==='yamaha'){
      camposBox.innerHTML = `
        <div class="form-inline" style="grid-template-columns:repeat(6,minmax(0,1fr));gap:8px">
          <label><strong>Modelo</strong></label>
          <input id="yam_modelo" placeholder="Ex.: F350NSA">
          <label><strong>Código</strong></label>
          <input id="yam_codigo" placeholder="Ex.: 6ML">
          <label><strong>Letra/Mês</strong></label>
          <input id="yam_letra" maxlength="1" placeholder="Ex.: N">
          <label><strong>Série</strong></label>
          <input id="yam_serie" placeholder="Ex.: 1005843">
        </div>`;
    } else if(m==='honda'){
      camposBox.innerHTML = `
        <div class="form-inline" style="grid-template-columns:repeat(6,minmax(0,1fr));gap:8px">
          <label><strong>Model Code</strong></label>
          <input id="hon_model" placeholder="Ex.: BF150A">
          <label><strong>Frame/Prefixo</strong></label>
          <input id="hon_prefix" placeholder="Ex.: BZB">
          <label><strong>Série</strong></label>
          <input id="hon_serial" placeholder="Ex.: 1234567">
        </div>`;
    } else {
      camposBox.innerHTML = '';
    }
  }

  function lerCampos(marca){
    const m = (marca||'').toLowerCase();
    if(m==='yamaha'){
      return {
        modelo: document.getElementById('yam_modelo')?.value?.trim().toUpperCase()||'',
        codigo: document.getElementById('yam_codigo')?.value?.trim().toUpperCase()||'',
        letra:  document.getElementById('yam_letra')?.value?.trim().toUpperCase()||'',
        serie:  document.getElementById('yam_serie')?.value?.trim().toUpperCase()||'',
      };
    }
    if(m==='honda'){
      return {
        model:  document.getElementById('hon_model')?.value?.trim().toUpperCase()||'',
        prefix: document.getElementById('hon_prefix')?.value?.trim().toUpperCase()||'',
        serial: document.getElementById('hon_serial')?.value?.trim().toUpperCase()||'',
      };
    }
    return {};
  }

  function validarMotor(marca, sn, extra){
    let valido=false, motivo='Estrutura básica não reconhecida.', interpret=[];
    if(marca==='yamaha'){
      const baseOk = /^[A-Z0-9\-\s]{6,24}$/.test(sn);
      const camposOk = (!extra.modelo || /^[A-Z0-9\-]{3,10}$/.test(extra.modelo))
                    && (!extra.codigo || /^[A-Z0-9]{2,6}$/.test(extra.codigo))
                    && (!extra.letra  || /^[A-HJ-NPR-Z]$/.test(extra.letra))
                    && (!extra.serie  || /^[0-9]{5,8}$/.test(extra.serie));
      valido = baseOk && camposOk;
      motivo = valido ? 'Formato Yamaha aceitável (base + campos).' : motivo;
      interpret = [
        ['Modelo', extra.modelo||'—', 'Ex.: F350NSA'],
        ['Código', extra.codigo||'—', 'Ex.: 6ML (core plug/chapa)'],
        ['Letra/Mês', extra.letra||'—', 'Sem I,O,Q (ex.: N)'],
        ['Série', extra.serie||'—', 'Numérica 5–8 dígitos'],
      ];
    } else if(marca==='honda'){
      const baseOk = /^[A-Z0-9\-]{7,20}$/.test(sn);
      const camposOk = (!extra.model  || /^[A-Z0-9\-]{3,10}$/.test(extra.model))
                    && (!extra.prefix || /^[A-Z0-9]{2,6}$/.test(extra.prefix))
                    && (!extra.serial || /^[0-9]{5,8}$/.test(extra.serial));
      valido = baseOk && camposOk;
      motivo = valido ? 'Formato Honda aceitável (base + campos).' : motivo;
      interpret = [
        ['Model Code', extra.model||'—', 'Ex.: BF150A'],
        ['Frame/Prefixo', extra.prefix||'—', 'Ex.: BZB'],
        ['Série', extra.serial||'—', 'Numérica 5–8 dígitos'],
      ];
    }
    return {marca, sn, valido, motivo, interpret, extra};
  }

  function render(res){
    out.innerHTML = `<strong>${res.valido?'S/N VÁLIDO':'S/N INVÁLIDO'}</strong> — ${res.motivo}`;
    const rows = (res.interpret||[]).map(([c,v,n])=>`<tr><td>${c}</td><td>${v}</td><td>${n}</td></tr>`).join('');
    interp.innerHTML = rows
      ? `<table class="interp"><thead><tr><th>Campo</th><th>Valor</th><th>Nota</th></tr></thead><tbody>${rows}</tbody></table>`
      : `<p>Sem campos adicionais.</p>`;
  }

  function getHist(key){ try{ return JSON.parse(localStorage.getItem(key)||'[]'); } catch{ return []; } }
  function setHist(key, arr){ localStorage.setItem(key, JSON.stringify(arr.slice(0,500))); }
  function guardarHistoricoMotor(res){
    const key='historico_motor'; const arr=getHist(key);
    arr.unshift({ ts:new Date().toISOString(), marca:res.marca, sn:res.sn, resultado:res.valido?'Válido':'Inválido', motivo:res.motivo, foto:null });
    setHist(key, arr);
  }
});