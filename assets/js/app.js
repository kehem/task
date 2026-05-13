import { state } from './utils/state.js';
import { renderSidebar, initSidebarEvents, updateSidebarVisibility } from './components/sidebar.js';
import { renderNavbar, initNavbarEvents } from './components/navbar.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderTasksPage } from './pages/tasks.js';
import { renderSettings } from './pages/settings.js';
import { openTaskModal } from './components/modal.js';
import { toast } from './components/toast.js';
import { debounce } from './utils/helpers.js';
import { api } from './api.js';
import { GOOGLE_CLIENT_ID } from './utils/constants.js';
import { orgStore } from './utils/orgStore.js';

// ---- Dark mode on load ----
document.documentElement.classList.toggle('dark', state.get('darkMode'));

// ---- Session ----
const SESSION_KEY = 'tf_session_v1';
function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function setSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

// ---- Login Screen ----
function renderLogin() {
  return `
  <div id="login-screen" style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem 1rem;font-family:var(--font-sans,system-ui,sans-serif);">
    <div style="width:100%;max-width:420px;background:var(--bg-primary,#fff);border:1px solid var(--border,#e5e7eb);border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

      <!-- Card top -->
      <div style="padding:2.5rem 2.5rem 2rem;text-align:center;border-bottom:1px solid var(--border,#f0f0f0);">
        <div style="width:68px;height:68px;border-radius:18px;background:#f4f4f5;border:1px solid #e5e7eb;margin:0 auto 1.25rem;display:flex;align-items:center;justify-content:center;overflow:hidden;">
          <img src="https://i.ibb.co.com/sJF5s7n2/Chat-GPT-Image-May-12-2026-07-23-11-PM.png"
               alt="TaskFlow"
               style="width:46px;height:46px;object-fit:contain;"
               onerror="this.style.display='none';this.parentElement.innerHTML='<svg width=28 height=28 viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'#18181b\' stroke-width=\'2\'><path d=\'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5\'/></svg>'">
        </div>

        <div style="display:inline-flex;align-items:center;gap:6px;background:#f4f4f5;border:1px solid #e5e7eb;border-radius:20px;padding:4px 12px 4px 8px;font-size:12px;color:#71717a;margin-bottom:1rem;">
          <span style="width:6px;height:6px;border-radius:50%;background:#22c55e;display:inline-block;"></span>
          All systems operational
        </div>

        <h1 style="font-size:22px;font-weight:600;color:#18181b;letter-spacing:-0.3px;margin-bottom:6px;">Welcome to TaskFlow</h1>
        <p style="font-size:14px;color:#71717a;line-height:1.5;">Sign in to manage your team's work,<br>all in one place.</p>
      </div>

      <!-- Card body -->
      <div style="padding:2rem 2.5rem;">
        <p style="font-size:11px;font-weight:500;color:#a1a1aa;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;">Continue with</p>

        <div id="google-signin" style="display:flex;justify-content:center;"></div>

        <!-- Fallback button shown if Google SDK doesn't load -->
        <div id="google-fallback" style="display:none;">
          <button style="width:100%;display:flex;align-items:center;justify-content:center;gap:12px;padding:13px 20px;background:#fff;border:1px solid #d4d4d8;border-radius:12px;font-size:14px;font-weight:500;color:#18181b;cursor:pointer;transition:background 0.15s,border-color 0.15s;" 
                  onmouseover="this.style.background='#f4f4f5'" 
                  onmouseout="this.style.background='#fff'">
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <!-- Trust badges -->
        <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:1.5rem;">
          <span style="display:flex;align-items:center;gap:4px;font-size:12px;color:#a1a1aa;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Secure
          </span>
          <span style="width:3px;height:3px;border-radius:50%;background:#d4d4d8;"></span>
          <span style="display:flex;align-items:center;gap:4px;font-size:12px;color:#a1a1aa;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Private
          </span>
          <span style="width:3px;height:3px;border-radius:50%;background:#d4d4d8;"></span>
          <span style="display:flex;align-items:center;gap:4px;font-size:12px;color:#a1a1aa;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            No password needed
          </span>
        </div>
      </div>

      <!-- Card footer -->
      <div style="padding:14px 2.5rem;border-top:1px solid #f0f0f0;text-align:center;">
        <p style="font-size:12px;color:#a1a1aa;line-height:1.6;">
          By continuing, you agree to our
          <a href="#" style="color:#71717a;text-decoration:underline;text-underline-offset:2px;">Terms</a>
          and
          <a href="#" style="color:#71717a;text-decoration:underline;text-underline-offset:2px;">Privacy Policy</a>.
        </p>
      </div>

    </div>
  </div>`;
}

function renderOnboarding({ profile }) {
  return `
  <div id="onboarding-screen" class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-sm">
    <div class="w-full max-w-lg mx-auto px-6">
      <div class="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 rounded-3xl overflow-hidden shadow-xl shadow-zinc-900/10">
        <div class="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800/60">
          <h2 class="text-base font-semibold text-zinc-900 dark:text-white tracking-tight">Welcome, ${profile?.name || 'there'}</h2>
          <p class="text-sm text-zinc-400 mt-0.5">Please set up your organization to continue.</p>
        </div>
        <div class="p-6 space-y-4">
          <div id="owner-form" class="space-y-3">
            <div>
              <label class="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Organization name</label>
              <input id="org-name" type="text" placeholder="Acme Inc."
                class="w-full px-4 py-3 text-sm bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/10 transition-all">
            </div>
            <div class="flex justify-end gap-2">
              <button id="owner-create" class="px-4 py-2 text-xs font-medium rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 active:scale-95 transition-all w-full sm:w-auto">Create Organization</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function initialsFromName(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] || 'U';
  const b = parts[1]?.[0] || '';
  return (a + b).toUpperCase();
}

function colorFromSub(sub = '') {
  let h = 0;
  for (let i = 0; i < sub.length; i++) h = (h * 31 + sub.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return `hsl(${hue} 70% 45%)`;
}

// ---- App shell ----
function renderApp() {
  return `
  <!-- Sidebar overlay (mobile) -->
  <div id="sidebar-overlay" class="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden"></div>

  ${renderSidebar()}

  <div id="main">
    <div id="navbar"></div>
    <main id="page-content"></main>
  </div>`;
}

// ---- Page router ----
function navigate(page) {
  state.set('currentPage', page);
  state.set('filterPriority', '');
  renderCurrentPage();
  rerenderShell();
}

function rerenderShell() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.outerHTML = renderSidebar();

  const navbar = document.getElementById('navbar');
  if (navbar) navbar.innerHTML = renderNavbar();

  initSidebarEvents(navigate, () => logout());
  initNavbarEvents({
    onSearch: () => renderCurrentPage(),
    onThemeChange: () => rerenderShell(),
    onMenuToggle: () => updateSidebarVisibility(),
    onCreateTask: () => openTaskModal(null, () => { renderCurrentPage(); rerenderShell(); }),
  });
  updateSidebarVisibility();
}

function logout() {
  localStorage.removeItem('tf_access_token');
  localStorage.removeItem('tf_refresh_token');
  localStorage.removeItem(SESSION_KEY);
  state.set('currentUser', null);
  state.set('onboarded', false);
  state.set('orgId', null);
  state.set('role', null);
  location.reload(); // Simplest way to reset everything and show login
}

function renderCurrentPage() {
  const page = state.get('currentPage');
  const container = document.getElementById('page-content');
  if (!container) return;

  let result;
  if (page === 'dashboard') {
    result = renderDashboard((p) => p ? navigate(p) : renderCurrentPage());
  } else if (['tasks', 'completed', 'archive'].includes(page)) {
    result = renderTasksPage(page, (p) => p ? navigate(p) : renderCurrentPage());
  } else if (page === 'settings') {
    result = renderSettings((p) => p ? navigate(p) : renderCurrentPage());
  } else if (page === 'reports') {
    import('./pages/reports.js').then(module => {
      result = module.renderReportsPage((p) => p ? navigate(p) : renderCurrentPage());
      if (result) {
        container.innerHTML = result.html;
        result.init?.();
      }
    });
  } else if ( page === 'employee') {
    import ('./pages/employee.js').them (module => {
      result = module.renderReportsPage((p) => p ? navigate(p) : renderCurrentPage());
      if (result) {
        container.innerHTML = result.html;
        result.init?.();
      }
    });
  }

  if (result) {
    container.innerHTML = result.html;
    result.init?.();
  }
}

// ---- Boot ----
function boot() {
  const app = document.getElementById('app');

  function mountAppShell() {
    app.innerHTML = renderApp();
    rerenderShell();
    renderCurrentPage();
    
    // Re-render the current page whenever tasks or users are fetched or updated
    state.subscribe((key) => {
      if (key === 'tasks' || key === 'users') renderCurrentPage();
    });

    state.init();

    document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
      state.set('sidebarOpen', false);
      updateSidebarVisibility();
    });

    document.addEventListener('keydown', e => {
      const tag = document.activeElement.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (e.key === 'n' || e.key === 'N') {
        openTaskModal(null, () => { renderCurrentPage(); rerenderShell(); });
      }
      if (e.key === '/') {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
    });
  }

  function applyProfileToState(profile) {
    if (!profile) return;
    state.set('currentUser', {
      id: `g_${profile.sub}`,
      name: profile.name || profile.email || 'User',
      initials: initialsFromName(profile.name || profile.email || 'U'),
      color: colorFromSub(profile.sub || ''),
      email: profile.email || '',
      picture: profile.picture || '',
      sub: profile.sub || '',
    });
  }

  function startOnboarding(profile) {
    document.body.insertAdjacentHTML('beforeend', renderOnboarding({ profile }));

    document.getElementById('owner-create')?.addEventListener('click', async () => {
      const name = document.getElementById('org-name')?.value?.trim();
      if (!name) return toast('Please enter an organization name', 'error');

      try {
        const data = await api.setupOrg({ name });

        state.set('onboarded', true);
        state.set('orgId', data.orgId);
        state.set('role', 'owner');

        setSession({ profile, orgId: data.orgId, role: 'owner', onboarded: true });
        document.getElementById('onboarding-screen')?.remove();
        toast(`Organization created: ${name}`, 'success');
        mountAppShell();
      } catch (e) {
        console.error('Setup org failed:', e);
        toast('Failed to create organization', 'error');
      }
    });
  }

  // FIX 2: Accept serverData directly instead of re-reading localStorage.
  // The old code called getSession() here, but at that point localStorage
  // had just been written with the new session — the issue was the old
  // finishLogin() also checked isSameUser using the *previous* session value
  // read before setSession() was called in the Google callback, causing a
  // race where returning users still saw the owner/employee picker.
  function finishLogin(profile, serverData) {
    applyProfileToState(profile);

    // Update state with server-verified details
    state.set('onboarded', !!serverData?.onboarded);
    state.set('orgId', serverData?.orgId || null);
    state.set('role', serverData?.role || null);

    // Trust the server response directly — if the backend says this user is
    // onboarded with an org and role, skip the picker entirely.
    if (serverData?.onboarded && serverData?.orgId && serverData?.role) {
      mountAppShell();
      return;
    }

    // Check pre-registered employees
    const preReg = orgStore.getPreRegEntry(profile.email);
    if (preReg) {
      state.set('onboarded', true);
      state.set('orgId', preReg.orgId);
      state.set('role', 'employee');
      setSession({ profile, orgId: preReg.orgId, role: 'employee', onboarded: true });
      toast('Welcome back! You have been automatically added to your organization.', 'success');
      mountAppShell();
      return;
    }

    // First-time user or incomplete onboarding.
    startOnboarding(profile);
  }

  function showLogin() {
    document.body.insertAdjacentHTML('beforeend', renderLogin());

    const tryInit = () => {
      if (!window.google?.accounts?.id) return false;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,

        callback: async (resp) => {
          try {
            // FIX 1: api.login() sends the Google credential to the backend.
            // This call was always present but its response (data) was never
            // passed into finishLogin, so the onboarding-skip logic there
            // couldn't see data.onboarded and always showed the picker.
            const data = await api.login({ credential: resp.credential });

            // FIX 3: Store tokens immediately after login so that every
            // subsequent api.js call gets Authorization: Bearer <token>.
            // api.js already reads tf_access_token from localStorage on every
            // request — we just need to make sure it's written here first.
            if (data.access) localStorage.setItem('tf_access_token', data.access);
            if (data.refresh) localStorage.setItem('tf_refresh_token', data.refresh);

            const profile = {
              sub: data.user.sub,
              email: data.user.email,
              name: data.user.name,
              picture: data.user.picture,
            };

            setSession({
              profile,
              onboarded: data.onboarded,
              orgId: data.orgId,
              role: data.role,
            });

            const loginEl = document.getElementById('login-screen');
            if (loginEl) {
              loginEl.style.opacity = '0';
              loginEl.style.transition = 'opacity 0.3s';
              setTimeout(() => loginEl.remove(), 300);
            }

            // Pass the live server response — finishLogin uses it directly
            // so returning users are never shown the owner/employee screen.
            finishLogin(profile, data);
          } catch (e) {
            console.error('Login error:', e);
            toast('Login failed. Please try again.', 'error');
          }
        },
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin'),
        { theme: 'outline', size: 'large', shape: 'pill', width: 320 }
      );
      return true;
    };

    let attempts = 0;
    const t = setInterval(() => {
      attempts++;
      if (tryInit() || attempts > 30) clearInterval(t);
    }, 150);
  }

  // On every page load, check if we have a token.
  // If not, we are definitely "new" or logged out — show login immediately.
  const hasToken = localStorage.getItem('tf_access_token');

  if (!hasToken) {
    console.log('No token found, showing login.');
    showLogin();
  } else {
    // We have a token, verify it with the server.
    api.me()
      .then(data => {
        // Refresh tokens if the server issued new ones.
        if (data.access) localStorage.setItem('tf_access_token', data.access);
        if (data.refresh) localStorage.setItem('tf_refresh_token', data.refresh);

        applyProfileToState(data.user);

        // Pass full server data so finishLogin skips onboarding for
        // returning users whose token is still valid.
        finishLogin(data.user, data);
      })
      .catch(err => {
        // Token missing or expired — wipe stale tokens and show the login screen.
        console.log('Session verification failed, showing login.', err);
        localStorage.removeItem('tf_access_token');
        localStorage.removeItem('tf_refresh_token');
        showLogin();
      });
  }

  // Responsive resize
  window.addEventListener('resize', debounce(() => {
    if (window.innerWidth >= 1024 && !state.get('sidebarOpen')) {
      state.set('sidebarOpen', true);
    }
    updateSidebarVisibility();
  }, 150));
}

boot();