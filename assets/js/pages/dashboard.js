import { state } from '../utils/state.js';
import { openTaskDetail } from '../components/modal.js';
import { STATUS, PRIORITY_CONFIG } from '../utils/constants.js';

function statCard(icon, label, value, sub, accent = '') {
  return `
  <div class="group relative overflow-hidden rounded-3xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-zinc-900/5 dark:hover:shadow-black/20">
    
    <div class="flex items-start justify-between">
      <div>
        <p class="text-[11px] uppercase tracking-[0.18em] text-zinc-400 font-semibold">${label}</p>
        <h3 class="mt-3 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white ${accent}">
          ${value}
        </h3>
        ${sub ? `<p class="mt-1 text-xs text-zinc-400">${sub}</p>` : ''}
      </div>

      <div class="w-11 h-11 rounded-2xl flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-300 shrink-0">
        ${icon}
      </div>
    </div>
  </div>
  `;
}

function renderCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const tasks = state.get('tasks') || [];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const monthName = now.toLocaleString('default', {
    month: 'long'
  });

  return `
  <div class="rounded-3xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl p-5">
    
    <div class="flex items-center justify-between mb-5">
      <div>
        <h3 class="text-sm font-semibold text-zinc-900 dark:text-white">
          ${monthName} ${year}
        </h3>
        <p class="text-xs text-zinc-400 mt-1">
          Task overview
        </p>
      </div>

      <div class="flex items-center gap-2 text-xs text-zinc-400">
        <div class="w-2 h-2 rounded-full bg-zinc-900 dark:bg-white"></div>
        Active
      </div>
    </div>

    <div class="grid grid-cols-7 gap-2 mb-2">
      ${['S', 'M', 'T', 'W', 'T', 'F', 'S']
        .map(
          d => `
          <div class="text-center text-[10px] font-bold uppercase tracking-wide text-zinc-400">
            ${d}
          </div>
        `
        )
        .join('')}
    </div>

    <div class="grid grid-cols-7 gap-2">
      ${calendarDays
        .map(day => {
          if (day === null) {
            return `<div class="aspect-square"></div>`;
          }

          const dateStr = `${year}-${String(month + 1).padStart(
            2,
            '0'
          )}-${String(day).padStart(2, '0')}`;

          const count = tasks.filter(
            t =>
              t.dueDate === dateStr ||
              t.createdAt?.startsWith(dateStr)
          ).length;

          const isToday = day === now.getDate();

          return `
          <button
            data-calendar-date="${dateStr}"
            class="
              relative aspect-square rounded-2xl
              flex flex-col items-center justify-center
              transition-all duration-200
              ${
                isToday
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold shadow-lg'
                  : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }
            "
          >
            <span class="text-xs">${day}</span>

            ${
              count > 0
                ? `
              <div class="absolute bottom-1.5 flex gap-0.5">
                ${Array.from({ length: Math.min(count, 3) })
                  .map(
                    () => `
                  <span class="w-1 h-1 rounded-full ${
                    isToday
                      ? 'bg-white dark:bg-zinc-900'
                      : 'bg-zinc-900 dark:bg-white'
                  }"></span>
                `
                  )
                  .join('')}
              </div>
            `
                : ''
            }
          </button>
        `;
        })
        .join('')}
    </div>
  </div>
  `;
}

function renderPriorityCard(tasks, stats) {
  const priorityData = Object.entries(PRIORITY_CONFIG).map(([k, v]) => ({
    key: k,
    label: v.label,
    count: tasks.filter(
      t => t.priority === k && t.status === STATUS.ACTIVE
    ).length,
    dot: v.dot
  }));

  return `
  <div class="rounded-3xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl p-5">
    
    <div class="flex items-center justify-between mb-5">
      <div>
        <h3 class="text-sm font-semibold text-zinc-900 dark:text-white">
          Task Priority
        </h3>
        <p class="text-xs text-zinc-400 mt-1">
          Active workload distribution
        </p>
      </div>
    </div>

    <div class="space-y-4">
      ${priorityData
        .map(p => {
          const pct =
            stats.active > 0
              ? Math.round((p.count / stats.active) * 100)
              : 0;

          return `
          <div>
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span
                  class="w-2 h-2 rounded-full"
                  style="background:${p.dot}"
                ></span>

                <span class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  ${p.label}
                </span>
              </div>

              <span class="text-xs text-zinc-400">
                ${p.count}
              </span>
            </div>

            <div class="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700"
                style="width:${pct}%;background:${p.dot}"
              ></div>
            </div>
          </div>
        `;
        })
        .join('')}
    </div>
  </div>
  `;
}

export function renderDashboard(rerender) {
  const stats = state.stats();
  const tasks = state.get('tasks') || [];

  const currentUser = state.get('currentUser');

  const recent = tasks
    .filter(t => t.status === STATUS.ACTIVE)
    .slice(0, 6);

  const completed = tasks
    .filter(t => t.status === STATUS.COMPLETED)
    .slice(0, 4);

  const html = `
  <div class="min-h-screen bg-[#f5f5f4] dark:bg-[#09090b]">
    
    <div class="max-w-7xl mx-auto px-5 lg:px-8 py-8 space-y-8 animate-fadein">

      <!-- Hero -->
      <div class="relative overflow-hidden rounded-[32px] border border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-900 p-8 lg:p-10">
        
        <div class="absolute inset-0 bg-gradient-to-br from-zinc-100/60 via-transparent to-zinc-200/40 dark:from-zinc-800/40 dark:to-zinc-900"></div>

        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-5">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              Productivity Dashboard
            </div>

            <h1 class="text-3xl lg:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight">
              Welcome back,
              <br>
              ${currentUser.name.split(' ')[0]} 👋
            </h1>

            <p class="mt-4 text-sm lg:text-base text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
              Track tasks, monitor priorities, and stay focused on what matters most today.
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4 shrink-0">
            <div class="rounded-2xl bg-zinc-100 dark:bg-zinc-800 px-5 py-4 min-w-[140px]">
              <p class="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                Completion
              </p>
              <h3 class="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
                ${
                  stats.total > 0
                    ? Math.round((stats.completed / stats.total) * 100)
                    : 0
                }%
              </h3>
            </div>

            <div class="rounded-2xl bg-zinc-100 dark:bg-zinc-800 px-5 py-4 min-w-[140px]">
              <p class="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                Active
              </p>
              <h3 class="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
                ${stats.active}
              </h3>
            </div>
          </div>

        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        ${statCard(
          `
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M12 7v5l3 2"></path>
          </svg>
          `,
          'Total Tasks',
          stats.total,
          `${stats.active} currently active`
        )}

        ${statCard(
          `
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path d="M20 6L9 17l-5-5"></path>
          </svg>
          `,
          'Completed',
          stats.completed,
          'Tasks finished'
        )}

        ${statCard(
          `
          <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path d="M12 9v4"></path>
            <path d="M12 17h.01"></path>
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
          </svg>
          `,
          'Urgent',
          stats.urgent,
          'Need immediate action',
          stats.urgent > 0 ? 'text-red-500' : ''
        )}

        ${statCard(
          `
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path d="M4 7h16"></path>
            <path d="M7 4h10"></path>
            <rect x="3" y="7" width="18" height="13" rx="2"></rect>
          </svg>
          `,
          'Archived',
          stats.archived,
          'Stored tasks'
        )}

      </div>

      <!-- Content -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">

        <!-- Tasks -->
        <div class="xl:col-span-2 space-y-6">

          <!-- Recent Tasks -->
          <div class="rounded-3xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/90 dark:bg-zinc-900/90 overflow-hidden backdrop-blur-xl">

            <div class="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800/60">
              <div>
                <h3 class="text-sm font-semibold text-zinc-900 dark:text-white">
                  Recent Tasks
                </h3>
                <p class="text-xs text-zinc-400 mt-1">
                  Your latest active work
                </p>
              </div>

              <button
                data-nav="tasks"
                class="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                View all →
              </button>
            </div>

            <div class="divide-y divide-zinc-100 dark:divide-zinc-800/60">

              ${
                recent.length === 0
                  ? `
                <div class="px-6 py-16 text-center">
                  <p class="text-sm text-zinc-400">
                    No active tasks available
                  </p>
                </div>
              `
                  : recent
                      .map(task => {
                        const cfg = PRIORITY_CONFIG[task.priority];

                        return `
                    <div
                      class="dash-task-row group px-6 py-4 flex items-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-all cursor-pointer"
                      data-task-id="${task.id}"
                    >
                      <div
                        class="w-2.5 h-2.5 rounded-full shrink-0"
                        style="background:${cfg.dot}"
                      ></div>

                      <div class="flex-1 min-w-0">
                        <h4 class="text-sm font-medium text-zinc-900 dark:text-white truncate">
                          ${task.title}
                        </h4>

                        <p class="text-xs text-zinc-400 truncate mt-1">
                          ${task.description || 'No description'}
                        </p>
                      </div>

                      <div class="text-right shrink-0">
                        <div class="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          ${
                            task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString(
                                  'en-US',
                                  {
                                    month: 'short',
                                    day: 'numeric'
                                  }
                                )
                              : 'No date'
                          }
                        </div>
                      </div>
                    </div>
                  `;
                      })
                      .join('')
              }

            </div>
          </div>

          ${renderPriorityCard(tasks, stats)}

        </div>

        <!-- Sidebar -->
        <div class="space-y-6">

          ${renderCalendar()}

          <!-- Completed -->
          ${
            completed.length > 0
              ? `
            <div class="rounded-3xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl p-5">

              <div class="mb-5">
                <h3 class="text-sm font-semibold text-zinc-900 dark:text-white">
                  Recently Completed
                </h3>

                <p class="text-xs text-zinc-400 mt-1">
                  Finished tasks
                </p>
              </div>

              <div class="space-y-3">

                ${completed
                  .map(
                    t => `
                  <div class="flex items-start gap-3">
                    <div class="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </div>

                    <div class="min-w-0">
                      <p class="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                        ${t.title}
                      </p>

                      <p class="text-xs text-zinc-400 mt-1">
                        Completed successfully
                      </p>
                    </div>
                  </div>
                `
                  )
                  .join('')}

              </div>
            </div>
          `
              : ''
          }

        </div>

      </div>

    </div>

  </div>
  `;

  return {
    html,

    init() {
      document.querySelectorAll('.dash-task-row').forEach(row => {
        row.addEventListener('click', () => {
          openTaskDetail(row.dataset.taskId, rerender);
        });
      });

      document.querySelectorAll('[data-nav]').forEach(btn => {
        btn.addEventListener('click', () => {
          rerender(btn.dataset.nav);
        });
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