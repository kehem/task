import { state } from '../utils/state.js';
import { renderTaskCard, renderSkeletonCards } from '../components/task-card.js';
import { openTaskDetail, openTaskModal } from '../components/modal.js';
import { STATUS, PRIORITY, PRIORITY_CONFIG } from '../utils/constants.js';

function filterBar(showStatus = false) {
  const users = state.get('users') || [];
  return `
  <div class="flex flex-wrap items-center gap-3">
    <div class="relative flex-1 min-w-[180px] max-w-xs sm:hidden">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input id="mobile-search" type="text" placeholder="Search…" value="${state.get('searchQuery')}"
        class="w-full pl-9 pr-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 border-0 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/10">
    </div>
    
    <select id="filter-assignee" class="px-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/10 border-0 appearance-none pr-8">
      <option value="">All Assignees</option>
      ${users.map(u => `<option value="${u.id}" ${state.get('filterAssignee') == u.id ? 'selected' : ''}>${u.name}</option>`).join('')}
    </select>

    <select id="filter-priority" class="px-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/10 border-0 appearance-none pr-8">
      <option value="">All Priorities</option>
      ${Object.entries(PRIORITY_CONFIG).map(([k, v]) => `<option value="${k}" ${state.get('filterPriority') === k ? 'selected' : ''}>${v.label}</option>`).join('')}
    </select>

    <select id="filter-status" class="px-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/10 border-0 appearance-none pr-8">
      <option value="">All Statuses</option>
      ${Object.entries(STATUS).map(([k, v]) => `<option value="${v}" ${state.get('filterStatus') === v ? 'selected' : ''}>${v.charAt(0).toUpperCase() + v.slice(1)}</option>`).join('')}
    </select>

    <input id="filter-date" type="date" value="${state.get('filterDate') || ''}" class="px-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/10 border-0">
    
    <button id="reset-filters" class="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors" title="Reset Filters">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
    </button>
  </div>`;
}

function emptyState(page) {
  const msgs = {
    tasks: { icon: '📋', title: 'No active tasks', sub: 'Create a new task to get started.' },
    completed: { icon: '✅', title: 'Nothing completed yet', sub: 'Finish a task and it will show here.' },
    archive: { icon: '📦', title: 'Archive is empty', sub: 'Archived tasks will appear here.' },
  };
  const m = msgs[page] || msgs.tasks;
  return `
  <div class="flex flex-col items-center justify-center py-20 text-center">
    <div class="text-4xl mb-3">${m.icon}</div>
    <h3 class="text-sm font-semibold text-zinc-700 dark:text-zinc-300">${m.title}</h3>
    <p class="text-xs text-zinc-400 mt-1">${m.sub}</p>
  </div>`;
}

export function renderTasksPage(page, rerender) {
  const statusMap = { tasks: STATUS.ACTIVE, completed: STATUS.COMPLETED, archive: STATUS.ARCHIVED };
  const status = page === 'reports' ? null : (statusMap[page] || STATUS.ACTIVE);
  const tasks = state.filteredTasks(status);

  const html = `
  <div class="p-6 space-y-5 animate-fadein">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h2 class="text-lg font-bold text-zinc-900 dark:text-white tracking-tight capitalize">
          ${page === 'tasks' ? 'Active Tasks' : page === 'completed' ? 'Completed Tasks' : page === 'archive' ? 'Archive' : 'All Tasks'}
        </h2>
        <p class="text-xs text-zinc-400 mt-0.5">${tasks.length} task${tasks.length !== 1 ? 's' : ''}</p>
      </div>
      ${filterBar()}
    </div>

    ${tasks.length === 0
      ? emptyState(page)
      : `<div id="tasks-grid" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          ${tasks.map(t => renderTaskCard(t)).join('')}
        </div>`
    }
  </div>`;

  return {
    html, init() {
      // Task card click → detail
      document.querySelectorAll('.task-card').forEach(card => {
        card.addEventListener('click', e => {
          if (e.target.closest('.task-complete-btn')) return;
          if (e.target.closest('.assignee-avatar')) {
             e.stopPropagation();
             const assigneeId = e.target.closest('.assignee-avatar').dataset.assigneeId;
             state.set('filterAssignee', assigneeId);
             rerender(page);
             return;
          }
          openTaskDetail(card.dataset.taskId, () => rerender(page));
        });
      });

      // Complete toggle
      document.querySelectorAll('.task-complete-btn').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          const id = btn.dataset.taskId;
          const task = state.getTask(id);
          if (!task) return;
          if (task.status === STATUS.ACTIVE) {
            state.updateTask(id, { status: STATUS.COMPLETED, completedAt: new Date().toISOString() });
          } else if (task.status === STATUS.COMPLETED) {
            state.updateTask(id, { status: STATUS.ACTIVE, completedAt: null, verifiedAt: null });
          }
          rerender(page);
        });
      });

      // Filters
      document.getElementById('filter-priority')?.addEventListener('change', e => {
        state.set('filterPriority', e.target.value);
        rerender(page);
      });
      document.getElementById('filter-assignee')?.addEventListener('change', e => {
        state.set('filterAssignee', e.target.value);
        rerender(page);
      });
      document.getElementById('filter-status')?.addEventListener('change', e => {
        state.set('filterStatus', e.target.value);
        rerender(page);
      });
      document.getElementById('filter-date')?.addEventListener('input', e => {
        state.set('filterDate', e.target.value);
        rerender(page);
      });
      document.getElementById('reset-filters')?.addEventListener('click', () => {
        state.resetFilters();
        rerender(page);
      });

      // Mobile search
      document.getElementById('mobile-search')?.addEventListener('input', e => {
        state.set('searchQuery', e.target.value);
        rerender(page);
      });
    }
  };
}