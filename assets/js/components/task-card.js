import { state } from '../utils/state.js';
import { formatDate, isOverdue } from '../utils/helpers.js';
import { PRIORITY_CONFIG, STATUS } from '../utils/constants.js';

export function renderTaskCard(task) {
  const cfg = PRIORITY_CONFIG[task.priority];
  const overdue = isOverdue(task.dueDate) && task.status === STATUS.ACTIVE;
  const assignees = task.assignees.map(id => state.getUser(id)).filter(Boolean);

  return `
  <div data-task-id="${task.id}" class="task-card group relative bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 rounded-2xl p-5 cursor-pointer
    hover:shadow-lg hover:shadow-zinc-900/5 dark:hover:shadow-black/30 hover:-translate-y-0.5 transition-all duration-200">

    <div class="flex items-start justify-between gap-3 mb-3">
      <div class="flex items-center gap-2 min-w-0">
        <button class="task-complete-btn shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
          ${task.status === STATUS.COMPLETED ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white' : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-500 dark:hover:border-zinc-400'}"
          data-task-id="${task.id}">
          ${task.status === STATUS.COMPLETED ? `<svg class="w-2.5 h-2.5 text-white dark:text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
        </button>
        <h3 class="text-sm font-semibold text-zinc-900 dark:text-white truncate ${task.status === STATUS.COMPLETED ? 'line-through opacity-50' : ''}">${task.title}</h3>
      </div>
      <span class="priority-badge shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${cfg.color}">
        <span class="w-1.5 h-1.5 rounded-full" style="background:${cfg.dot}"></span>
        ${cfg.label}
      </span>
    </div>

    <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4 line-clamp-2">${task.description}</p>

    <div class="flex items-center justify-between">
      <!-- Assignees -->
      <div class="flex -space-x-1.5">
        ${assignees.slice(0, 3).map(u => `
          <div data-assignee-id="${u.id}" class="assignee-avatar w-6 h-6 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] font-semibold text-white ring-0 cursor-pointer hover:scale-110 hover:z-10 transition-all"
               style="background:${u.color}" title="${u.name}">${u.initials}</div>
        `).join('')}
        ${assignees.length > 3 ? `<div class="w-6 h-6 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">+${assignees.length - 3}</div>` : ''}
      </div>

      <!-- Meta -->
      <div class="flex items-center gap-3 text-xs text-zinc-400">
        ${task.notesCount > 0 ? `
          <span class="flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            ${task.notesCount}
          </span>
        ` : ''}
        ${task.dueDate ? `
          <span class="flex items-center gap-1 ${overdue ? 'text-red-500 font-medium' : ''}">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${overdue ? 'Overdue · ' : ''}${formatDate(task.dueDate)}
          </span>
        ` : ''}
      </div>
    </div>

    <!-- Archived badge -->
    ${task.status === STATUS.ARCHIVED ? `<div class="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800"><span class="text-[11px] text-zinc-400 font-medium">Archived</span></div>` : ''}

    <!-- Verified badge -->
    ${task.verifiedAt ? `
      <div class="absolute top-3 right-14 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        Verified
      </div>
    ` : ''}
  </div>`;
}

export function renderSkeletonCards(n = 4) {
  return Array.from({ length: n }, () => `
    <div class="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 rounded-2xl p-5 space-y-3">
      <div class="flex justify-between">
        <div class="h-4 w-3/5 rounded-full bg-zinc-100 dark:bg-zinc-800 skeleton"></div>
        <div class="h-5 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 skeleton"></div>
      </div>
      <div class="h-3 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 skeleton"></div>
      <div class="h-3 w-4/5 rounded-full bg-zinc-100 dark:bg-zinc-800 skeleton"></div>
      <div class="flex justify-between items-center mt-2">
        <div class="flex gap-1">
          <div class="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 skeleton"></div>
          <div class="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 skeleton"></div>
        </div>
        <div class="h-3 w-20 rounded-full bg-zinc-100 dark:bg-zinc-800 skeleton"></div>
      </div>
    </div>
  `).join('');
}