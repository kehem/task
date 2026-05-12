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
  <div id="login-screen">
    <div class="w-full max-w-sm mx-auto px-6">
      <!-- Logo -->
      <div class="flex flex-col items-center mb-10">
        <div class="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-white flex items-center justify-center mb-4">
          <svg class="w-6 h-6 text-white dark:text-zinc-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <h1 class="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">TaskFlow</h1>
        <p class="text-sm text-zinc-400 mt-1">Sign in to your workspace</p>
      </div>

      <div class="space-y-3">
        <div class="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 rounded-2xl p-4">
          <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-3">Continue with Google</p>
          <div id="google-signin" class="flex justify-center"></div>
          <p class="text-[11px] text-zinc-400 mt-3 text-center leading-snug">
            If you don't see the button, set <code class="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">GOOGLE_CLIENT_ID</code>.
          </p>
        </div>
      </div>

      <p class="text-xs text-zinc-400 text-center mt-6">You'll choose Owner or Employee after login.</p>
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