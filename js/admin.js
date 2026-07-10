// Shared admin-panel helpers: auth guard + logout, used by every admin page
// except login.html itself.
(function () {
  async function requireAuth() {
    try {
      const r = await fetch('/api/admin/me');
      if (!r.ok) throw new Error('not authenticated');
      const data = await r.json();
      const el = document.querySelector('[data-admin-username]');
      if (el) el.textContent = data.username;
    } catch {
      window.location.href = 'login.html';
    }
  }

  function wireLogout() {
    document.querySelectorAll('[data-admin-logout]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        window.location.href = 'login.html';
      });
    });
  }

  function formatPkr(n) {
    return 'Rs ' + Number(n).toLocaleString('en-PK');
  }

  window.CTAdmin = { requireAuth, wireLogout, formatPkr };

  document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
    wireLogout();
  });
})();
