import { state } from '../utils/state.js';
import { renderTaskCard, renderSkeletonCards } from '../components/task-card.js';
import { openTaskDetail, openTaskModal } from '../components/modal.js';
import { STATUS, PRIORITY_CONFIG } from '../utils/constants.js';

function statCard(icon, label, value, sub, accent = '') {
  return `
  <div class="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 rounded-2xl p-5 hover:shadow-md hover:shadow-zinc-900/5 dark:hover:shadow-black/20 transition-all">
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs font-medium uppercase tracking-wider text-zinc-400">${label}</span>
      <div class="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">${icon}</div>
    </div>
    <p class="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white ${accent}">${value}</p>
    ${sub ? `<p class="text-xs text-zinc-400 mt-1">${sub}</p>` : ''}
  </div>`;
}

function renderCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const tasks = state.get('tasks') || [];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  // Padding for first day
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const monthName = now.toLocaleString('default', { month: 'long' });

  return `
  <div class="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 rounded-2xl p-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-semibold text-zinc-900 dark:text-white">${monthName} ${year}</h3>
      <div class="flex gap-1">
        <div class="w-2 h-2 rounded-full bg-zinc-900 dark:bg-white"></div>
        <span class="text-[10px] text-zinc-400">Tasks</span>
      </div>
    </div>
    <div class="grid grid-cols-7 gap-1 text-center mb-2">
      ${['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => `<span class="text-[10px] font-bold text-zinc-400 uppercase">${d}</span>`).join('')}
    </div>
    <div class="grid grid-cols-7 gap-1">
      ${calendarDays.map(day => {
        if (day === null) return `<div class="aspect-square"></div>`;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayTasks = tasks.filter(t => t.dueDate === dateStr || t.createdAt?.startsWith(dateStr));
        const count = dayTasks.length;
        const isToday = day === now.getDate();
        
        return `
          <button data-calendar-date="${dateStr}" class="aspect-square flex flex-col items-center justify-center rounded-xl transition-all relative
            ${isToday ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}">
            <span class="text-[11px]">${day}</span>
            ${count > 0 ? `<span class="absolute bottom-1 w-1 h-1 rounded-full ${isToday ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-900 dark:bg-white'}"></span>` : ''}
          </button>`;
      }).join('')}
    </div>
  </div>`;
}

export function renderDashboard(rerender) {
  const stats = state.stats();
  const tasks = state.get('tasks');
  const recent = tasks.filter(t => t.status === STATUS.ACTIVE).slice(0, 5);
  const completed = tasks.filter(t => t.status === STATUS.COMPLETED).slice(0, 3);

  // Activity chart data
  const priorityData = Object.entries(PRIORITY_CONFIG).map(([k, v]) => ({
    key: k, label: v.label, count: tasks.filter(t => t.priority === k && t.status === STATUS.ACTIVE).length, dot: v.dot
  }));

  const html = `
  <div class="p-6 space-y-6 animate-fadein">

    <!-- Welcome -->
    <div>
      <h2 class="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Good morning, ${state.get('currentUser').name.split(' ')[0]} 👋</h2>
      <p class="text-sm text-zinc-400 mt-0.5">Here's what's happening with your projects today.</p>
    </div>

    <!-- Stats grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      ${statCard(
    `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    'Total Tasks', stats.total, `${stats.active} active`
  )}
      ${statCard(
    `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>`,
    'Completed', stats.completed, 'this sprint'
  )}
      ${statCard(
    `<svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    'Urgent', stats.urgent, 'need attention', stats.urgent > 0 ? 'text-red-500' : ''
  )}
      ${statCard(
    `<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5" rx="1"/></svg>`,
    'Archived', stats.archived, 'total archived'
  )}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Recent tasks -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 rounded-2xl overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <h3 class="text-sm font-semibold text-zinc-900 dark:text-white">Recent Tasks</h3>
            <button data-nav="tasks" class="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors font-medium">View all →</button>
          </div>
          <div class="divide-y divide-zinc-50 dark:divide-zinc-800/60">
            ${recent.length === 0
              ? `<div class="px-5 py-8 text-center text-zinc-400 text-sm">No active tasks</div>`
              : recent.map(task => {
                const cfg = PRIORITY_CONFIG[task.priority];
                return `
                        <div class="dash-task-row flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors" data-task-id="${task.id}">
                          <div class="w-2 h-2 rounded-full shrink-0" style="background:${cfg.dot}"></div>
                          <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-zinc-900 dark:text-white truncate">${task.title}</p>
                            <p class="text-xs text-zinc-400 truncate">${task.description.slice(0, 60)}…</p>
                          </div>
                          <span class="text-xs text-zinc-400 shrink-0">${task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</span>
                        </div>`;
              }).join('')
            }
          </div>
        </div>

        <div class="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 rounded-2xl p-5">
          <h3 class="text-sm font-semibold text-zinc-900 dark:text-white mb-4">By Priority</h3>
          <div class="space-y-3">
            ${priorityData.map(p => {
              const pct = stats.active > 0 ? Math.round((p.count / stats.active) * 100) : 0;
              return `
                <div>
                  <div class="flex items-center justify-between text-xs mb-1.5">
                    <span class="text-zinc-600 dark:text-zinc-400 font-medium">${p.label}</span>
                    <span class="text-zinc-400">${p.count}</span>
                  </div>
                  <div class="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-700" style="width:${pct}%;background:${p.dot}"></div>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Calendar & Priority -->
      <div class="space-y-6">
        ${renderCalendar()}

        

          <!-- Recently completed -->
          ${completed.length > 0 ? `
            <div class="mt-5 pt-5 border-t border-zinc-100 dark:border-zinc-800">
              <h4 class="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">Recently Done</h4>
              <div class="space-y-2">
                ${completed.map(t => `
                  <div class="flex items-center gap-2">
                    <svg class="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <p class="text-xs text-zinc-500 dark:text-zinc-400 truncate">${t.title}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  </div>`;

  return {
    html, init() {
      document.querySelectorAll('.dash-task-row').forEach(row => {
        row.addEventListener('click', () => openTaskDetail(row.dataset.taskId, rerender));
      });
      document.querySelectorAll('[data-nav]').forEach(btn => {
        btn.addEventListener('click', () => rerender(btn.dataset.nav));
      });
      document.querySelectorAll('[data-calendar-date]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.set('filterDate', btn.dataset.calendarDate);
          rerender('tasks');
        });
      });
    }
  };
}