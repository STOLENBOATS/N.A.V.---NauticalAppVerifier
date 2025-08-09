(function(){
  const btn = document.getElementById('loginBtn');
  const u = document.getElementById('username');
  const p = document.getElementById('password');
  const msg = document.getElementById('loginMsg');
  btn.addEventListener('click', () => {
    const U = (u.value||'').trim();
    const P = (p.value||'').trim();
    if(U==='admin' && P==='Admin2025'){
      localStorage.setItem('sessionUser','admin');
      window.location.href = 'validador.html';
    } else {
      msg.textContent = 'Credenciais inválidas / Invalid credentials';
      msg.className = 'caption error';
    }
  });
})();