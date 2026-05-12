import { state } from '../utils/state.js';
import { STATUS, PRIORITY_CONFIG } from '../utils/constants.js';

export function renderReportsPage(rerender) {
  const tasks = state.get('tasks');
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthTasks = tasks.filter(t => {
    const d = new Date(t.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const completedThisMonth = monthTasks.filter(t => t.status === STATUS.COMPLETED).length;
  const activeThisMonth = monthTasks.filter(t => t.status === STATUS.ACTIVE).length;
  const totalThisMonth = monthTasks.length;

  const priorityCounts = monthTasks.reduce((acc, t) => {
    acc[t.priority] = (acc[t.priority] || 0) + 1;
    return acc;
  }, {});

  const html = `
  <div class="p-6 space-y-6 animate-fadein">
    <div>
      <h2 class="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">Monthly Report</h2>
      <p class="text-sm text-zinc-400 mt-0.5">Performance metrics for ${now.toLocaleString('default', { month: 'long' })} ${currentYear}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
       <div class="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 rounded-2xl p-5">
         <p class="text-xs font-medium uppercase tracking-wider text-zinc-400 mb-1">Total Created</p>
         <p class="text-3xl font-bold text-zinc-900 dark:text-white">${totalThisMonth}</p>
       </div>
       <div class="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 rounded-2xl p-5">
         <p class="text-xs font-medium uppercase tracking-wider text-zinc-400 mb-1">Completed</p>
         <p class="text-3xl font-bold text-emerald-500">${completedThisMonth}</p>
       </div>
       <div class="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 rounded-2xl p-5">
         <p class="text-xs font-medium uppercase tracking-wider text-zinc-400 mb-1">Active</p>
         <p class="text-3xl font-bold text-blue-500">${activeThisMonth}</p>
       </div>
    </div>

    <div class="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 rounded-2xl p-6">
      <h3 class="text-sm font-semibold text-zinc-900 dark:text-white mb-6">Priority Distribution</h3>
      <div class="space-y-4">
        ${Object.entries(PRIORITY_CONFIG).map(([k, v]) => {
          const count = priorityCounts[k] || 0;
          const pct = totalThisMonth > 0 ? Math.round((count / totalThisMonth) * 100) : 0;
          return `
            <div>
              <div class="flex items-center justify-between text-xs mb-2">
                <span class="font-medium text-zinc-700 dark:text-zinc-300">${v.label}</span>
                <span class="text-zinc-400">${count} (${pct}%)</span>
              </div>
              <div class="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-700" style="width:${pct}%;background:${v.dot}"></div>
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>
  </div>`;

  return { html, init() {} };
}
