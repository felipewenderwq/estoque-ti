// sidebar.js — injeta sidebar e layout em todas as páginas

function buildSidebar(activePage) {
  const user = window.__USER__;
  const isAdmin = user && user.perfil === 'admin';

  return `
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="logo">🖥️ TI Estoque</div>
        <div class="subtitle">Controle de Equipamentos</div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-label">Menu</div>
        <a href="/dashboard" class="nav-item ${activePage === 'dashboard' ? 'active' : ''}">
          <span class="icon">📊</span> Dashboard
        </a>
        <a href="/equipamentos" class="nav-item ${activePage === 'equipamentos' ? 'active' : ''}">
          <span class="icon">🖱️</span> Equipamentos
        </a>
        <a href="/alocacoes" class="nav-item ${activePage === 'alocacoes' ? 'active' : ''}">
          <span class="icon">📋</span> Alocações
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="user-card">
          <div class="user-avatar">${user ? user.nome[0].toUpperCase() : '?'}</div>
          <div class="user-info">
            <div class="user-name">${user ? user.nome : ''}</div>
            <div class="user-role">${user && user.perfil === 'admin' ? '⚡ Admin' : '👁️ Visualizador'}</div>
          </div>
          <button class="logout-btn" onclick="location.href='/logout'" title="Sair">⏻</button>
        </div>
      </div>
    </aside>
    <div class="main-content" id="mainContent"></div>
  </div>
  `;
}
