(() => {
  const API_BASE = window.AUTH_API_BASE || '/api/auth';

  function showError(form, message) {
    let el = form.querySelector('.auth-error');
    if (!el) {
      el = document.createElement('p');
      el.className = 'auth-error';
      el.style.cssText = 'color:#e0575a;font-size:13px;font-weight:700;text-align:center;margin-top:10px;';
      form.appendChild(el);
    }
    el.textContent = message;
  }
  function clearError(form) { form.querySelector('.auth-error')?.remove(); }

  async function postJson(path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan.');
    return data;
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearError(loginForm);
      const email = loginForm.querySelector('input[type="email"]').value.trim();
      const password = loginForm.querySelector('.pw-input').value;
      const remember = loginForm.querySelector('input[type="checkbox"]')?.checked ?? false;
      const btn = loginForm.querySelector('.primary-btn');
      btn.disabled = true;
      try {
        const { user } = await postJson('/login', { email, password, remember });
        window.dispatchEvent(new CustomEvent('auth:login', { detail: user }));
      } catch (err) {
        showError(loginForm, err.message);
      } finally {
        btn.disabled = false;
      }
    });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearError(registerForm);
      const name = registerForm.querySelector('input[type="text"]')?.value.trim();
      const email = registerForm.querySelector('input[type="email"]').value.trim();
      const password = registerForm.querySelector('input[type="password"]').value;
      try {
        const { user } = await postJson('/register', { name, email, password });
        window.dispatchEvent(new CustomEvent('auth:register', { detail: user }));
      } catch (err) {
        showError(registerForm, err.message);
      }
    });
  }
})();
