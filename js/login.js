document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  if(!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('user')?.value?.trim();
    const p = document.getElementById('pass')?.value?.trim();

    if(u === 'admin' && p === 'Admin2025'){
      sessionStorage.setItem('nav_session','ok');
      window.location.href = 'validador.html';
    } else {
      alert('Credenciais inválidas.');
    }
  });
});