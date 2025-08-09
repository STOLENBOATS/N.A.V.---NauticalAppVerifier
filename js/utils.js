function downloadCSV(filename, rows){
  const processRow = (row) => row.map(v => {
    if (v==null) return '';
    const s = String(v).replace(/"/g,'""');
    if (s.search(/[",\n]/g) >= 0) return \"\" + s + \"\";
    return s;
  }).join(',');

  const csvContent = rows.map(processRow).join('\n');
  const blob = new Blob([csvContent], {type:'text/csv;charset=utf-8;'});
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility='hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function readFileAsDataURL(file){
  return new Promise((resolve,reject)=>{
    if(!file) return resolve('');
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function nowStr(){
  const d = new Date();
  return d.toISOString().slice(0,19).replace('T',' ');
}

// Session guard
(function(){
  const onLoginPage = location.pathname.endsWith('login.html');
  if(!onLoginPage){
    const u = localStorage.getItem('sessionUser');
    if(!u){ location.href = 'login.html'; }
  }
  const logout = document.getElementById('logout');
  if(logout){
    logout.addEventListener('click', ()=>{
      localStorage.removeItem('sessionUser');
      location.href='login.html';
    });
  }
})();