import { state } from '../utils/state.js';
import { renderTaskCard } from '../components/task-card.js';
import { openTaskDetail } from '../components/modal.js';
import { STATUS, PRIORITY_CONFIG } from '../utils/constants.js';

function filterBar() {
  const users = state.get('users') || [];

  return `
  <div class="flex flex-wrap items-center gap-2">

    <!-- Search -->
    <div class="relative flex-1 min-w-[220px]">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>

      <input
        id="search-input"
        type="text"
        placeholder="Search tasks..."
        value="${state.get('searchQuery') || ''}"
        class="w-full h-11 pl-10 pr-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800
        bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white
        placeholder:text-zinc-400 outline-none transition-all
        focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5"
      >
    </div>

    <!-- Assignee -->
    <select
      id="filter-assignee"
      class="h-11 px-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800
      bg-white dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-300
      outline-none focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5"
    >
      <option value="">All Assignees</option>
      ${users.map(user => `
        <option
          value="${user.id}"
          ${state.get('filterAssignee') == user.id ? 'selected' : ''}
        >
          ${user.name}
        </option>
      `).join('')}
    </select>

    <!-- Priority -->
    <select
      id="filter-priority"
      class="h-11 px-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800
      bg-white dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-300
      outline-none focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5"
    >
      <option value="">All Priorities</option>

      ${Object.entries(PRIORITY_CONFIG).map(([key, value]) => `
        <option
          value="${key}"
          ${state.get('filterPriority') === key ? 'selected' : ''}
        >
          ${value.label}
        </option>
      `).join('')}
    </select>

    <!-- Status -->
    <select
      id="filter-status"
      class="h-11 px-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800
      bg-white dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-300
      outline-none focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5"
    >
      <option value="">All Status</option>

      ${Object.values(STATUS).map(status => `
        <option
          value="${status}"
          ${state.get('filterStatus') === status ? 'selected' : ''}
        >
          ${status.charAt(0).toUpperCase() + status.slice(1)}
        </option>
      `).join('')}
    </select>

    <!-- Date -->
    <input
      id="filter-date"
      type="date"
      value="${state.get('filterDate') || ''}"
      class="h-11 px-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800
      bg-white dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-300
      outline-none focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5"
    >

    <!-- Reset -->
    <button
      id="reset-filters"
      class="h-11 w-11 rounded-2xl border border-zinc-200/80 dark:border-zinc-800
      bg-white dark:bg-zinc-900 flex items-center justify-center
      text-zinc-500 hover:text-zinc-900 dark:hover:text-white
      transition-all hover:scale-[1.02]"
      title="Reset Filters"
    >
      <svg class="w-4 h-4"
        fill="none" viewBox="0 0 24 24"
        stroke="currentColor" stroke-width="2">
        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
      </svg>
    </button>
  </div>`;
}

function emptyState(page) {
  const content = {
    tasks: {
      title: 'No active tasks',
      sub: 'Create a task to start managing your workflow.',
      icon: '📋'
    },
    completed: {
      title: 'Nothing completed yet',
      sub: 'Completed tasks will appear here.',
      icon: '✅'
    },
    archive: {
      title: 'Archive is empty',
      sub: 'Archived tasks will appear here.',
      icon: '📦'
    }
  };

  const item = content[page] || content.tasks;

  return `
  <div class="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800
    rounded-3xl py-24 px-6 flex flex-col items-center justify-center text-center">

    <div class="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800
      flex items-center justify-center text-3xl mb-5">
      ${item.icon}
    </div>

    <h3 class="text-base font-semibold text-zinc-900 dark:text-white">
      ${item.title}
    </h3>

    <p class="text-sm text-zinc-400 mt-2 max-w-sm leading-relaxed">
      ${item.sub}
    </p>
  </div>`;
}

export function renderTasksPage(page, rerender) {
  const statusMap = {
    tasks: STATUS.ACTIVE,
    completed: STATUS.COMPLETED,
    archive: STATUS.ARCHIVED,
  };

  const status = page === 'reports'
    ? null
    : (statusMap[page] || STATUS.ACTIVE);

  const tasks = state.filteredTasks(status);

  const title =
    page === 'tasks'
      ? 'Active Tasks'
      : page === 'completed'
      ? 'Completed Tasks'
      : page === 'archive'
      ? 'Archived Tasks'
      : 'All Tasks';

  const html = `
  <div class="p-6 lg:p-8 space-y-6 animate-fadein">

    <!-- Header -->
    <div class="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

      <div>
        <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          ${title}
        </h1>

        <p class="text-sm text-zinc-400 mt-1">
          ${tasks.length} task${tasks.length !== 1 ? 's' : ''}
        </p>
      </div>

      ${filterBar()}
    </div>

    ${
      tasks.length === 0
        ? emptyState(page)
        : `
        <div
          id="tasks-grid"
          class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5"
        >
          ${tasks.map(task => renderTaskCard(task)).join('')}
        </div>
      `
    }

  </div>`;

  return {
    html,

    init() {
      // Open task detail
      document.querySelectorAll('.task-card').forEach(card => {
        card.addEventListener('click', e => {

          if (e.target.closest('.task-complete-btn')) return;

          if (e.target.closest('.assignee-avatar')) {
            e.stopPropagation();

            const assigneeId =
              e.target.closest('.assignee-avatar').dataset.assigneeId;

            state.set('filterAssignee', assigneeId);

            rerender(page);
            return;
          }

          openTaskDetail(
            card.dataset.taskId,
            () => rerender(page)
          );
        });
      });

      // Toggle complete
      document.querySelectorAll('.task-complete-btn').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();

          const id = btn.dataset.taskId;
          const task = state.getTask(id);

          if (!task) return;

          if (task.status === STATUS.ACTIVE) {
            state.updateTask(id, {
              status: STATUS.COMPLETED,
              completedAt: new Date().toISOString()
            });
          } else if (task.status === STATUS.COMPLETED) {
            state.updateTask(id, {
              status: STATUS.ACTIVE,
              completedAt: null,
              verifiedAt: null
            });
          }

          rerender(page);
        });
      });

      // Search
      document.getElementById('search-input')
        ?.addEventListener('input', e => {
          state.set('searchQuery', e.target.value);
          rerender(page);
        });

      // Filters
      document.getElementById('filter-priority')
        ?.addEventListener('change', e => {
          state.set('filterPriority', e.target.value);
          rerender(page);
        });

      document.getElementById('filter-assignee')
        ?.addEventListener('change', e => {
          state.set('filterAssignee', e.target.value);
          rerender(page);
        });

      document.getElementById('filter-status')
        ?.addEventListener('change', e => {
          state.set('filterStatus', e.target.value);
          rerender(page);
        });

      document.getElementById('filter-date')
        ?.addEventListener('input', e => {
          state.set('filterDate', e.target.value);
          rerender(page);
        });

      // Reset
      document.getElementById('reset-filters')
        ?.addEventListener('click', () => {
          state.resetFilters();
          rerender(page);
        });
    }
  };
}