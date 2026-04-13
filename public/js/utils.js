// ===== UTILS GLOBAIS =====

const CATEGORIAS = [
  { id: 'Mouse com Fio', icon: '🖱️' },
  { id: 'Mouse sem Fio', icon: '📡' },
  { id: 'Teclado', icon: '⌨️' },
  { id: 'No-break', icon: '🔋' },
  { id: 'Cabo HDMI/VGA', icon: '🔌' },
  { id: 'Monitor', icon: '🖥️' },
];

const STATUS_MAP = {
  disponivel: { label: 'Disponível', cls: 'badge-green', icon: '●' },
  em_uso: { label: 'Em Uso', cls: 'badge-blue', icon: '●' },
  defeituoso: { label: 'Defeituoso', cls: 'badge-red', icon: '●' },
  descartado: { label: 'Descartado', cls: 'badge-gray', icon: '●' },
};

function badge(status) {
  const s = STATUS_MAP[status] || { label: status, cls: 'badge-gray', icon: '●' };
  return `<span class="badge ${s.cls}">${s.icon} ${s.label}</span>`;
}

function catIcon(cat) {
  const c = CATEGORIAS.find(x => x.id === cat);
  return c ? c.icon : '📦';
}

function fmtDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fmtDateShort(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('pt-BR');
}

// Toast
const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container';
document.body.appendChild(toastContainer);

function toast(msg, type = 'success') {
  const icons = { success: '✅', error: '❌', warn: '⚠️' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type] || '💬'}</span><span>${msg}</span>`;
  toastContainer.appendChild(el);
  setTimeout(() => {
    el.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => el.remove(), 300);
  }, 3500);
}

// API helper
async function api(method, url, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro || 'Erro desconhecido');
  return data;
}

// Sidebar ativo
function setActiveNav(path) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('href') === path) item.classList.add('active');
  });
}

// Modal helpers
function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  const form = document.querySelector(`#${id} form`);
  if (form) form.reset();
}

// Confirmar ação
function confirmar(msg) {
  return confirm(msg);
}
