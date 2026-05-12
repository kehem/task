import { state } from '../utils/state.js';
import { debounce } from '../utils/helpers.js';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  tasks: 'Active Tasks',
  completed: 'Completed',
  archive: 'Archive',
  settings: 'Settings',
};

export function renderNavbar() {
  const page = state.get('currentPage');
  const notifs = state.get('notifications');
  const unread = notifs.filter(n => !n.read).length;
  const user = state.get('currentUser');
  const dark = state.get('darkMode');

  if (!user) return '';

  return `
  <header class="sticky top-0 z-40 flex items-center gap-4 px-6 py-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-800/60">

    <!-- Hamburger -->
    <button id="menu-toggle" class="lg:hidden p-2 -ml-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 dark:text-zinc-400">
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
      </svg>
    </button>

    <!-- Page title -->
    <h1 class="text-[15px] font-semibold text-zinc-900 dark:text-white tracking-tight">${PAGE_TITLES[page] || page}</h1>

    <!-- Search -->
    <div class="flex-1 max-w-md mx-4 hidden sm:block">
      <div class="flex gap-2">
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input id="global-search" type="text" placeholder="Search tasks…" value="${state.get('searchQuery')}"
            class="w-full pl-9 pr-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800/60 border-0 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/10 transition-all">
        </div>
        <button id="search-trigger-btn" class="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">Search</button>
      </div>
    </div>

    <div class="ml-auto flex items-center gap-2">

      <!-- Dark mode toggle -->
      <button id="dark-toggle" title="Toggle dark mode" class="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
        ${dark
          ? `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
          : `<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`
        }
      </button>

      <!-- Notifications -->
      <div class="relative">
        <button id="notif-btn" class="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          ${unread > 0 ? `<span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>` : ''}
        </button>
        <div id="notif-dropdown" class="hidden absolute right-0 top-full mt-2 w-80 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden z-50">
          <div class="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <span class="text-sm font-semibold text-zinc-900 dark:text-white">Notifications</span>
            ${unread > 0 ? `<span class="text-xs font-medium text-zinc-400">${unread} unread</span>` : ''}
          </div>
          <div class="divide-y divide-zinc-50 dark:divide-zinc-800 max-h-80 overflow-y-auto">
            ${notifs.map(n => `
              <div class="flex gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors ${!n.read ? 'bg-zinc-50/80 dark:bg-zinc-800/30' : ''}">
                <div class="w-2 h-2 mt-1.5 rounded-full shrink-0 ${!n.read ? 'bg-zinc-900 dark:bg-white' : 'bg-transparent'}"></div>
                <div>
                  <p class="text-xs text-zinc-700 dark:text-zinc-300 leading-snug">${n.text}</p>
                  <p class="text-[11px] text-zinc-400 mt-1">${new Date(n.ts).toLocaleDateString()}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Create Task -->
      <button id="create-task-btn" class="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-medium hover:opacity-90 active:scale-95 transition-all shadow-sm">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span class="hidden sm:inline">New Task</span>
      </button>
    </div>
  </header>`;
}

export function initNavbarEvents(callbacks) {
  // Search
  const searchInput = document.getElementById('global-search');
  if (searchInput) {
    const handler = debounce(e => {
      state.set('searchQuery', e.target.value);
      callbacks.onSearch?.();
    }, 250);
    searchInput.addEventListener('input', handler);
  }

  // Search Button
  document.getElementById('search-trigger-btn')?.addEventListener('click', () => {
    callbacks.onSearch?.();
  });

  // Dark mode
  document.getElementById('dark-toggle')?.addEventListener('click', () => {
    const dark = !state.get('darkMode');
    state.set('darkMode', dark);
    document.documentElement.classList.toggle('dark', dark);
    callbacks.onThemeChange?.();
  });

  // Hamburger
  document.getElementById('menu-toggle')?.addEventListener('click', () => {
    const open = !state.get('sidebarOpen');
    state.set('sidebarOpen', open);
    callbacks.onMenuToggle?.();
  });

  // Notifications
  const notifBtn = document.getElementById('notif-btn');
  const notifDrop = document.getElementById('notif-dropdown');
  notifBtn?.addEventListener('click', e => {
    e.stopPropagation();
    notifDrop?.classList.toggle('hidden');
  });

  // Create task
  document.getElementById('create-task-btn')?.addEventListener('click', () => callbacks.onCreateTask?.());

  // Close dropdowns
  document.addEventListener('click', () => notifDrop?.classList.add('hidden'), { capture: false });
}