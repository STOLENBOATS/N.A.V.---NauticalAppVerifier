document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('appVersion');
  if (!el || !window.APP_INFO) return;
  const { name, version, build } = window.APP_INFO;
  el.textContent = `${name} • ${version} • build ${build}`;
});