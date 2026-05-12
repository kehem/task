let container;

function getContainer() {
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none';
    document.body.appendChild(container);
  }
  return container;
}

export function toast(message, type = 'info', duration = 3500) {
  const c = getContainer();
  const colors = {
    success: 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200',
    error:   'border-red-500/30 bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200',
    warning: 'border-amber-500/30 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200',
    info:    'border-zinc-300/50 dark:border-zinc-700/50 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200',
  };
  const icons = {
    success: `<svg class="w-4 h-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`,
    error:   `<svg class="w-4 h-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>`,
    warning: `<svg class="w-4 h-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>`,
    info:    `<svg class="w-4 h-4 shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01"/></svg>`,
  };

  const t = document.createElement('div');
  t.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg text-sm font-medium backdrop-blur-xl translate-x-16 opacity-0 transition-all duration-300 ${colors[type]}`;
  t.style.minWidth = '280px';
  t.innerHTML = `${icons[type]}<span class="flex-1">${message}</span>`;

  c.appendChild(t);
  requestAnimationFrame(() => {
    t.classList.remove('translate-x-16', 'opacity-0');
  });

  setTimeout(() => {
    t.classList.add('translate-x-16', 'opacity-0');
    t.addEventListener('transitionend', () => t.remove(), { once: true });
  }, duration);
}