
(function(){
  const COUNTRY = {PT:'Portugal',FR:'França',ES:'Espanha',IT:'Itália',DE:'Alemanha',GB:'Reino Unido',IE:'Irlanda',US:'Estados Unidos',CA:'Canadá',NL:'Países Baixos',BE:'Bélgica'};
  const MONTHS = {A:'Janeiro',B:'Fevereiro',C:'Março',D:'Abril',E:'Maio',F:'Junho',G:'Julho',H:'Agosto',J:'Setembro',K:'Outubro',L:'Novembro',M:'Dezembro'};
  const norm = s=> (s||'').toUpperCase().replace(/\s+/g,'').replace(/-/g,'');
  function hasDigitIn1to5(win){ return /[0-9]/.test(win.slice(0,5)); }
  const INVALID_MONTH = new Set(['I','O','Q']);
  function fullYear1(d){ const n=parseInt(d,10); return {y1900:1900+n,y2000:2000+n}; }
  function fullYear2(dd){ const n=parseInt(dd,10); return (n<=49)?2000+n:1900+n; }

  function validateAndInterpret(input){
    const raw = norm(input);
    if (!/^[A-Z0-9]{14,16}$/.test(raw) || raw.length===15) return {ok:false, motivo:'Comprimento inválido (14 ou 16). 15 é inválido.'};
    if (hasDigitIn1to5(raw)) return {ok:false, motivo:'Posições 1–5 devem ser letras (sem dígitos).'};

    if (raw.length===14){
      const pais=raw.slice(0,2), fab=raw.slice(2,5), serie=raw.slice(5,10), mes=raw[10], prod=raw[11], model=raw.slice(12,14);
      if (!/^[A-Z]{2}$/.test(pais) || !/^[A-Z]{3}$/.test(fab)) return {ok:false, motivo:'País/Fabricante inválidos (devem ser letras).'};
      if (!/^[A-Z0-9]{5}$/.test(serie)) return {ok:false, motivo:'Série inválida (6–10).'};
      if (!/^[A-Z]$/.test(mes) || INVALID_MONTH.has(mes) || !(mes in MONTHS)) return {ok:false, motivo:'Mês inválido (A–M sem I,O,Q).'};
      if (!/^\d$/.test(prod)) return {ok:false, motivo:'Ano de produção inválido (1 dígito).'};
      if (!/^\d{2}$/.test(model)) return {ok:false, motivo:'Ano de modelo inválido (2 dígitos).'};
      const prodOpts=fullYear1(prod); const modelYear=fullYear2(model); const prodYear=(prodOpts.y2000<=modelYear)?prodOpts.y2000:prodOpts.y1900;
      if (modelYear<prodYear) return {ok:false, motivo:'Ano do modelo não pode ser anterior ao ano de fabrico.'};
      return {ok:true, formato:'UE-14', partes:{pais,fab,serie,mes,anoProd:prodYear,modelo:modelYear}};
    } else {
      const pais=raw.slice(0,2), fab=raw.slice(2,5), serie=raw.slice(5,12), mes=raw[12], prod=raw[13];
      const model = raw.length===16? raw.slice(14,16) : null;
      if (!/^[A-Z]{2}$/.test(pais) || !/^[A-Z]{3}$/.test(fab)) return {ok:false, motivo:'País/Fabricante inválidos (devem ser letras).'};
      if (!/^[A-Z0-9]{7}$/.test(serie)) return {ok:false, motivo:'Série inválida (6–12).'};
      if (!/^[A-Z]$/.test(mes) || INVALID_MONTH.has(mes) || !(mes in MONTHS)) return {ok:false, motivo:'Mês inválido (A–M sem I,O,Q).'};
      if (!/^\d$/.test(prod)) return {ok:false, motivo:'Ano de produção inválido (1 dígito).'};
      if (raw.length===16 && !/^\d{2}$/.test(model)) return {ok:false, motivo:'Ano de modelo inválido (2 dígitos).'};
      const prodOpts=fullYear1(prod); const modelYear=raw.length===16? fullYear2(model) : (prodOpts.y2000);
      const prodYear=(prodOpts.y2000<=modelYear)?prodOpts.y2000:prodOpts.y1900;
      if (raw.length===16 && modelYear<prodYear) return {ok:false, motivo:'Ano do modelo não pode ser anterior ao ano de fabrico.'};
      return {ok:true, formato:(raw.length===16?'US-16':'US-14'), partes:{pais,fab,serie,mes,anoProd:prodYear,modelo:modelYear}};
    }
  }
  function renderInterpretacao(tbl, p){
    const linhas=[]; const add=(c,v,i)=>linhas.push(`<tr><th style="text-align:left">${c}</th><td>${v}</td><td>${i}</td></tr>`);
    add('País / Country', p.pais, ({PT:'Portugal',FR:'França',ES:'Espanha',IT:'Itália',DE:'Alemanha',GB:'Reino Unido',IE:'Irlanda',US:'Estados Unidos',CA:'Canadá',NL:'Países Baixos',BE:'Bélgica'}[p.pais]||'—'));
    add('Fabricante / Manufacturer', p.fab, 'Código de fabricante (letras).');
    add('Série / Serial', p.serie, 'Sequência interna / Internal series.');
    add('Mês produção / Production month', p.mes, ({A:'Janeiro',B:'Fevereiro',C:'Março',D:'Abril',E:'Maio',F:'Junho',G:'Julho',H:'Agosto',J:'Setembro',K:'Outubro',L:'Novembro',M:'Dezembro'}[p.mes]||'—'));
    add('Ano fabrico / Production year', p.anoProd, `${p.anoProd}`);
    add('Ano modelo / Model year', p.modelo||'—', p.modelo? `${p.modelo}`:'—');
    tbl.innerHTML=`<thead><tr><th>Campo</th><th>Valor</th><th>Interpretação</th></tr></thead><tbody>${linhas.join('')}</tbody>`;
  }
  function setStatus(el, ok, msg){ el.className='helper status '+(ok?'ok':'bad'); el.textContent=msg; }
  document.getElementById('btnValidarWIN').addEventListener('click', ()=>{
    const input=document.getElementById('winInput').value||''; const res=validateAndInterpret(input);
    const st=document.getElementById('winStatus'), panel=document.getElementById('winInterpretacao'), table=document.getElementById('winTable');
    if(!res.ok){ setStatus(st,false,'Inválido: '+res.motivo+' EN: Invalid.'); panel.classList.add('hidden'); table.innerHTML=''; }
    else{ setStatus(st,true,`Válido (${res.formato}). EN: Valid.`); renderInterpretacao(table,res.partes); panel.classList.remove('hidden'); }
    setTimeout(()=>{
      const ok=st.classList.contains('ok'); const d=new Date(); const ts=`${d.getFullYear()}-${('0'+(d.getMonth()+1)).slice(-2)}-${('0'+d.getDate()).slice(-2)} ${('0'+d.getHours()).slice(-2)}:${('0'+d.getMinutes()).slice(-2)}`;
      const arr=JSON.parse(localStorage.getItem('hist_win')||'[]'); arr.unshift({dt:ts, win:input, result: ok?'Válido':'Inválido', just: st.textContent||''}); localStorage.setItem('hist_win', JSON.stringify(arr.slice(0,200)));
    },10);
  });
})();