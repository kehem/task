import { state } from '../utils/state.js';
import { generateId, formatDate, trapFocus } from '../utils/helpers.js';
import { PRIORITY, STATUS, PRIORITY_CONFIG } from '../utils/constants.js';
import { renderComments, initCommentsEvents } from './comments.js';
import { toast } from './toast.js';

function openModal(html) {
  closeModal();
  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 dark:bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-200';
  overlay.innerHTML = html;
  document.body.appendChild(overlay);

  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', escHandler);
  requestAnimationFrame(() => overlay.style.opacity = '1');
  trapFocus(overlay);
}

function escHandler(e) { if (e.key === 'Escape') closeModal(); }

export function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) return;
  overlay.style.opacity = '0';
  overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
  document.removeEventListener('keydown', escHandler);
}

// ---- Create / Edit Task Modal ----
export function openTaskModal(taskId = null, onSave) {
  const task = taskId ? state.getTask(taskId) : null;
  const users = state.get('users');
  const isEdit = !!task;

  const html = `
  <div class="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-xl mx-auto overflow-hidden scale-95 transition-transform duration-200 border border-zinc-100 dark:border-zinc-800" id="modal-card">
    <div class="flex items-center justify-between px-8 py-6 border-b border-zinc-100 dark:border-zinc-800">
      <h2 class="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">${isEdit ? 'Edit Task' : 'New Task'}</h2>
      <button onclick="document.getElementById('modal-overlay').click()" class="p-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-all active:scale-90">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <div class="px-8 py-7 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
      <!-- Title -->
      <div class="space-y-2">
        <label class="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest block">Title</label>
        <input id="task-title" type="text" value="${task?.title || ''}" placeholder="What needs to be done?"
          class="w-full px-5 py-3.5 text-base bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5 focus:border-zinc-300 dark:focus:border-zinc-600 transition-all">
      </div>

      <!-- Description -->
      <div class="space-y-2">
        <label class="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest block">Description</label>
        <textarea id="task-desc" rows="4" placeholder="Add more details about this task…"
          class="w-full px-5 py-3.5 text-base bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5 focus:border-zinc-300 dark:focus:border-zinc-600 transition-all resize-none">${task?.description || ''}</textarea>
      </div>

      <!-- Priority + Due Date -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest block">Priority</label>
          <div class="relative">
            <select id="task-priority" class="w-full px-5 py-3.5 text-base bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5 focus:border-zinc-300 dark:focus:border-zinc-600 transition-all appearance-none">
              ${Object.entries(PRIORITY_CONFIG).map(([k, v]) => `<option value="${k}" ${task?.priority === k ? 'selected' : ''}>${v.label}</option>`).join('')}
            </select>
            <div class="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M19 9l-7 7-7-7"/></svg>
            </div>
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest block">Due Date</label>
          <input id="task-due" type="date" value="${task?.dueDate || new Date().toISOString().split('T')[0]}"
            class="w-full px-5 py-3.5 text-base bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-white/5 focus:border-zinc-300 dark:focus:border-zinc-600 transition-all">
        </div>
      </div>

      <!-- Assignees -->
      <div class="space-y-3">
        <label class="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest block">Assign To</label>
        <div class="flex flex-wrap gap-3">
          ${users.map(u => `
            <label class="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl cursor-pointer border-2 transition-all group
              ${task?.assignees.includes(u.id) ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg shadow-zinc-900/10 dark:shadow-white/5' : 'border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-600'}">
              <input type="checkbox" class="assignee-check sr-only" value="${u.id}" ${task?.assignees.includes(u.id) ? 'checked' : ''}>
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-zinc-900" style="background:${u.color}">${u.initials}</div>
              <span class="text-sm font-bold tracking-tight">${u.name.split(' ')[0]}</span>
            </label>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="px-8 py-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-4 bg-zinc-50/50 dark:bg-zinc-800/20">
      <button onclick="document.getElementById('modal-overlay').click()" class="px-6 py-3 text-sm font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all uppercase tracking-widest">Cancel</button>
      <button id="save-task-btn" class="px-8 py-3 text-sm font-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-zinc-900/10 dark:shadow-white/5 uppercase tracking-widest">
        ${isEdit ? 'Save changes' : 'Create task'}
      </button>
    </div>
  </div>`;

  openModal(html);
  setTimeout(() => document.getElementById('modal-card')?.classList.remove('scale-95'), 10);

  // Checkbox style update
  document.querySelectorAll('.assignee-check').forEach(cb => {
    cb.addEventListener('change', () => {
      const label = cb.closest('label');
      const isChecked = cb.checked;

      label.className = `flex items-center gap-2.5 px-4 py-2.5 rounded-2xl cursor-pointer border-2 transition-all group ${isChecked
          ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg shadow-zinc-900/10 dark:shadow-white/5'
          : 'border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-600'
        }`;
    });
  });

  document.getElementById('save-task-btn')?.addEventListener('click', () => {
    const title = document.getElementById('task-title').value.trim();
    if (!title) { toast('Title is required', 'warning'); return; }
    const assignees = [...document.querySelectorAll('.assignee-check:checked')].map(c => +c.value);
    const patch = {
      title,
      description: document.getElementById('task-desc').value.trim(),
      priority: document.getElementById('task-priority').value,
      dueDate: document.getElementById('task-due').value || null,
      assignees,
    };
    if (isEdit) {
      state.updateTask(taskId, patch);
      toast('Task updated', 'success');
    } else {
      state.addTask({ ...patch, id: generateId('t'), status: STATUS.ACTIVE, notesCount: 0, createdAt: new Date().toISOString(), completedAt: null, verifiedAt: null });
      toast('Task created', 'success');
    }
    closeModal();
    onSave?.();
  });
}

// ---- Task Detail Modal ----
export function openTaskDetail(taskId, onUpdate) {
  function buildContent() {
    const task = state.getTask(taskId);
    if (!task) return '';
    const cfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.basic;
    const assignees = (task.assignees || []).map(id => state.getUser(id)).filter(Boolean);
    const desc = task.description || 'No description provided.';

    return `
    <div class="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-4xl mx-auto overflow-hidden scale-95 transition-transform duration-200 border border-zinc-100 dark:border-zinc-800" id="modal-card">
      <!-- Header -->
      <div class="flex items-center justify-between px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
        <div class="flex items-center gap-4 min-w-0">
          <button class="detail-complete-btn w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all
            ${task.status === STATUS.COMPLETED ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20' : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-500 dark:hover:border-zinc-400'}"
            data-task-id="${taskId}">
            ${task.status === STATUS.COMPLETED ? `<svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
          </button>
          <h2 class="text-xl font-bold text-zinc-900 dark:text-white tracking-tight ${task.status === STATUS.COMPLETED ? 'line-through opacity-50' : ''}">${task.title}</h2>
        </div>
        <button onclick="document.getElementById('modal-overlay').click()" class="p-2.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 shrink-0 transition-all active:scale-90">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-100 dark:divide-zinc-800">
        <!-- Left: details -->
        <div class="lg:col-span-7 px-8 py-7 space-y-8 overflow-y-auto custom-scrollbar" style="max-height: 70vh">
          <div class="space-y-3">
            <h3 class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Description</h3>
            <p class="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">${desc}</p>
          </div>

          <!-- Meta grid -->
          <div class="grid grid-cols-2 gap-8">
            <div class="space-y-2">
              <p class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Priority</p>
              <span class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${cfg.color} shadow-sm">
                <span class="w-2 h-2 rounded-full" style="background:${cfg.dot}"></span>${cfg.label}
              </span>
            </div>
            <div class="space-y-2">
              <p class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Due Date</p>
              <div class="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-bold">
                <svg class="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <span class="text-base">${formatDate(task.dueDate)}</span>
              </div>
            </div>
            <div class="space-y-2">
              <p class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Assignees</p>
              <div class="flex -space-x-2">
                ${assignees.map(u => `<div class="w-9 h-9 rounded-full border-4 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] font-bold text-white shadow-sm" style="background:${u.color}" title="${u.name}">${u.initials}</div>`).join('')}
              </div>
            </div>
            <div class="space-y-2">
              <p class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Status</p>
              <span class="inline-flex items-center px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm font-bold text-zinc-700 dark:text-zinc-300 capitalize">
                ${task.status}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <button class="detail-edit-btn px-6 py-2.5 text-xs font-bold rounded-xl border-2 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all uppercase tracking-widest" data-task-id="${taskId}">Edit Task</button>
            ${task.status === STATUS.ACTIVE ? `
              <button class="detail-complete-action px-6 py-2.5 text-xs font-bold rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-zinc-900/10 dark:shadow-white/5 uppercase tracking-widest" data-task-id="${taskId}">Complete Task</button>
            ` : ''}
            ${task.status === STATUS.COMPLETED && !task.verifiedAt ? `
              <button class="detail-verify-btn px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-500 text-white hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-emerald-500/20 uppercase tracking-widest" data-task-id="${taskId}">Verify Task</button>
            ` : ''}
            ${task.status !== STATUS.ARCHIVED ? `
              <button class="detail-archive-btn px-6 py-2.5 text-xs font-bold rounded-xl border-2 border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all uppercase tracking-widest" data-task-id="${taskId}">Archive</button>
            ` : ''}
            <button class="detail-delete-btn px-6 py-2.5 text-xs font-bold rounded-xl border-2 border-red-100 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all uppercase tracking-widest" data-task-id="${taskId}">Delete</button>
          </div>
        </div>

        <!-- Right: comments -->
        <div class="lg:col-span-5 px-8 py-7 flex flex-col bg-zinc-50/30 dark:bg-zinc-800/10" style="min-height:400px; max-height: 70vh">
          ${renderComments(taskId)}
        </div>
      </div>
    </div>`;
  }

  openModal(buildContent());

  const refreshComments = () => {
    const container = document.querySelector('.lg\\:col-span-5');
    if (container) {
      container.innerHTML = renderComments(taskId);
      initCommentsEvents(taskId, refreshComments);
    }
  };

  state.fetchTaskNotes(taskId).then(refreshComments);

  setTimeout(() => document.getElementById('modal-card')?.classList.remove('scale-95'), 10);
  attachDetailEvents(taskId, onUpdate);
  initCommentsEvents(taskId, refreshComments);
}

function attachDetailEvents(taskId, onUpdate) {
  // Complete toggle
  document.querySelector('.detail-complete-btn')?.addEventListener('click', () => {
    const task = state.getTask(taskId);
    if (!task) return;
    if (task.status === STATUS.ACTIVE) {
      state.updateTask(taskId, { status: STATUS.COMPLETED, completedAt: new Date().toISOString() });
      toast('Task marked complete', 'success');
    } else if (task.status === STATUS.COMPLETED) {
      state.updateTask(taskId, { status: STATUS.ACTIVE, completedAt: null, verifiedAt: null });
      toast('Task reopened', 'info');
    }
    closeModal();
    onUpdate?.();
  });

  document.querySelector('.detail-complete-action')?.addEventListener('click', () => {
    state.updateTask(taskId, { status: STATUS.COMPLETED, completedAt: new Date().toISOString() });
    toast('Task marked complete', 'success');
    closeModal();
    onUpdate?.();
  });

  document.querySelector('.detail-verify-btn')?.addEventListener('click', () => {
    state.updateTask(taskId, { verifiedAt: new Date().toISOString() });
    toast('Task verified ✓', 'success');
    closeModal();
    onUpdate?.();
  });

  document.querySelector('.detail-archive-btn')?.addEventListener('click', () => {
    state.updateTask(taskId, { status: STATUS.ARCHIVED });
    toast('Task archived', 'info');
    closeModal();
    onUpdate?.();
  });

  document.querySelector('.detail-delete-btn')?.addEventListener('click', () => {
    openDeleteConfirm(taskId, () => { closeModal(); onUpdate?.(); });
  });

  document.querySelector('.detail-edit-btn')?.addEventListener('click', () => {
    closeModal();
    openTaskModal(taskId, onUpdate);
  });
}

// ---- Delete Confirm Modal ----
export function openDeleteConfirm(taskId, onDelete) {
  const html = `
  <div class="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm mx-auto overflow-hidden scale-95 transition-transform duration-200" id="modal-card">
    <div class="px-6 pt-6 pb-4 text-center">
      <div class="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
      </div>
      <h2 class="text-base font-semibold text-zinc-900 dark:text-white mb-1">Delete task?</h2>
      <p class="text-sm text-zinc-500 dark:text-zinc-400">This action cannot be undone.</p>
    </div>
    <div class="px-6 pb-5 flex gap-3">
      <button onclick="document.getElementById('modal-overlay').click()" class="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">Cancel</button>
      <button id="confirm-delete-btn" class="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all active:scale-95">Delete</button>
    </div>
  </div>`;

  openModal(html);
  setTimeout(() => document.getElementById('modal-card')?.classList.remove('scale-95'), 10);
  document.getElementById('confirm-delete-btn')?.addEventListener('click', () => {
    state.deleteTask(taskId);
    toast('Task deleted', 'error');
    closeModal();
    onDelete?.();
  });
} 