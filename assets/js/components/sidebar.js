import { state } from '../utils/state.js';
import { NAV_ITEMS } from '../utils/constants.js';

const ICONS = {
  grid: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
  'check-square': `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.7"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>`,
  'check-circle': `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.7"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  archive: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.7"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5" rx="1"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`,
  'chart-bar': `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.7"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>`,
  'human-head': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 297 297" fill="grey" xml:space="preserve"><path d="M284.583 276.914h-30.892c-1.702-19.387-5.386-59.954-7.771-75.858-2.715-18.113-17.518-33.527-36.835-38.357l-20.107-5.027c-3.25 19.41-20.159 34.253-40.477 34.253s-37.227-14.843-40.477-34.253l-20.107 5.027c-19.317 4.829-34.121 20.244-36.835 38.357-2.385 15.904-6.069 56.471-7.771 75.858H12.417c-5.546 0-10.043 4.497-10.043 10.043S6.871 297 12.417 297h272.165c5.546 0 10.043-4.497 10.043-10.043s-4.495-10.043-10.042-10.043m-57.403 0h-14.06v-65.258H83.881v65.258h-14.06v-72.288a7.03 7.03 0 0 1 7.03-7.03h143.3a7.03 7.03 0 0 1 7.03 7.03v72.288zm-78.679-162.28c27.103 0 48.125-35.753 48.125-66.509C196.626 18.89 177.735 0 148.501 0s-48.125 18.89-48.125 48.125c0 30.757 21.022 66.509 48.125 66.509"/><path d="M129.774 124.617c-.053 7.43-1.516 17.95-8.265 25.567 0 14.883 12.107 27.681 26.991 27.681s26.991-12.798 26.991-27.681c-6.748-7.617-8.212-18.136-8.263-25.567-5.86 2.617-12.139 4.078-18.727 4.078-6.587 0-12.867-1.461-18.727-4.078"/></svg>`,
  settings: `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
};

export function renderSidebar() {
  const page = state.get('currentPage');
  const stats = state.stats();
  const user = state.get('currentUser');
  const role = state.get('role');

  if (!user) return '';

  const badges = { tasks: stats.active, completed: stats.completed, archive: stats.archived };

  return `
  <aside id="sidebar" class="sidebar flex flex-col h-full bg-white dark:bg-zinc-950 border-r border-zinc-100 dark:border-zinc-800/60 overflow-hidden transition-all duration-300">

    <!-- Logo -->
    <div class="flex items-center gap-3 px-6 py-5 border-b border-zinc-100 dark:border-zinc-800/60">
      <div class="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center shrink-0">
        <img src="https://i.ibb.co.com/sJF5s7n2/Chat-GPT-Image-May-12-2026-07-23-11-PM.png" alt= "Logo" class="w-100>
        // <svg class="w-4 h-4 text-white dark:text-zinc-900" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
      </div>
      <span class="text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-white sidebar-text">TaskFlow</span>
    </div>

    <!-- Nav -->
    <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
      ${NAV_ITEMS.map(item => `
        <button data-nav="${item.id}" class="nav-item group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
          ${page === item.id
            ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
            : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-white'
          }">
          <span class="shrink-0">${ICONS[item.icon]}</span>
          <span class="sidebar-text flex-1 text-left">${item.label}</span>
          ${badges[item.id] ? `<span class="sidebar-text text-xs px-2 py-0.5 rounded-full ${page === item.id ? 'bg-white/20 dark:bg-zinc-900/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}">${badges[item.id]}</span>` : ''}
        </button>
      `).join('')}
    </nav>

    <!-- User -->
    <div class="px-3 py-4 border-t border-zinc-100 dark:border-zinc-800/60">
      <button id="sidebar-user-btn" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-all group">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0" style="background:${user.color}">${user.initials}</div>
        <div class="sidebar-text text-left min-w-0">
          <p class="text-sm font-medium text-zinc-900 dark:text-white truncate">${user.name}</p>
          <p class="text-xs text-zinc-400 truncate capitalize">${role || 'User'}</p>
        </div>
         
      </button>
      <button id="logout-btn" class="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-zinc-800 transition">Logout</button>
    </div>
  </aside>`;
}

export function initSidebarEvents(navigate, onLogout) {
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      navigate(btn.dataset.nav);
      if (window.innerWidth < 1024) {
        state.set('sidebarOpen', false);
        updateSidebarVisibility();
      }
    });
  });

  document.getElementById('logout-btn')?.addEventListener('click', () => onLogout?.());
}

export function updateSidebarVisibility() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const open = state.get('sidebarOpen');
  if (!sidebar) return;

  if (window.innerWidth < 1024) {
    sidebar.style.transform = open ? 'translateX(0)' : 'translateX(-100%)';
    if (overlay) overlay.style.opacity = open ? '1' : '0', overlay.style.pointerEvents = open ? 'auto' : 'none';
  } else {
    sidebar.style.transform = 'translateX(0)';
  }
}