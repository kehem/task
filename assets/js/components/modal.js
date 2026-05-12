import { state } from '../utils/state.js';
import { generateId, formatDate, trapFocus } from '../utils/helpers.js';
import { STATUS, PRIORITY_CONFIG } from '../utils/constants.js';
import { renderComments, initCommentsEvents } from './comments.js';
import { toast } from './toast.js';

function openModal(html) {
  closeModal();

  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.className =
    'fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xl p-4 opacity-0 transition duration-200';

  overlay.innerHTML = html;

  document.body.appendChild(overlay);

  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', escHandler);

  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
  });

  trapFocus(overlay);
}

function escHandler(e) {
  if (e.key === 'Escape') closeModal();
}

export function closeModal() {
  const overlay = document.getElementById('modal-overlay');

  if (!overlay) return;

  overlay.style.opacity = '0';

  overlay.addEventListener(
    'transitionend',
    () => overlay.remove(),
    { once: true }
  );

  document.removeEventListener('keydown', escHandler);
}

/* -------------------------------------------------------------------------- */
/*                                  TASK FORM                                 */
/* -------------------------------------------------------------------------- */

export function openTaskModal(taskId = null, onSave) {
  const task = taskId ? state.getTask(taskId) : null;
  const users = state.get('users') || [];
  const isEdit = Boolean(task);

  const html = `
  <div
    id="modal-card"
    class="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800 rounded-[28px] shadow-2xl overflow-hidden scale-[0.98] opacity-0 transition-all duration-200"
  >

    <!-- Header -->
    <div class="flex items-center justify-between px-7 py-5 border-b border-zinc-100 dark:border-zinc-900">
      <div>
        <h2 class="text-[20px] font-semibold tracking-tight text-zinc-900 dark:text-white">
          ${isEdit ? 'Edit task' : 'Create task'}
        </h2>
        <p class="text-sm text-zinc-500 mt-0.5">
          ${isEdit ? 'Update your task details' : 'Add a new task to your workspace'}
        </p>
      </div>

      <button
        id="close-modal-btn"
        class="w-10 h-10 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
      >
        <svg class="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- Content -->
    <div class="p-7 space-y-6 max-h-[75vh] overflow-y-auto">

      <!-- Title -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Title
        </label>

        <input
          id="task-title"
          type="text"
          value="${task?.title || ''}"
          placeholder="Task title"
          class="w-full h-12 px-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 focus:outline-none text-[15px] text-zinc-900 dark:text-white placeholder-zinc-400 transition"
        />
      </div>

      <!-- Description -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Description
        </label>

        <textarea
          id="task-desc"
          rows="4"
          placeholder="Write task details..."
          class="w-full px-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 focus:outline-none text-[15px] text-zinc-900 dark:text-white placeholder-zinc-400 resize-none transition"
        >${task?.description || ''}</textarea>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">

        <div class="space-y-2">
          <label class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Priority
          </label>

          <select
            id="task-priority"
            class="w-full h-12 px-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 focus:outline-none text-[15px] text-zinc-900 dark:text-white transition"
          >
            ${Object.entries(PRIORITY_CONFIG)
              .map(
                ([key, value]) => `
                <option
                  value="${key}"
                  ${task?.priority === key ? 'selected' : ''}
                >
                  ${value.label}
                </option>
              `
              )
              .join('')}
          </select>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Due date
          </label>

          <input
            id="task-due"
            type="date"
            value="${task?.dueDate || ''}"
            class="w-full h-12 px-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 focus:outline-none text-[15px] text-zinc-900 dark:text-white transition"
          />
        </div>
      </div>

      <!-- Assignees -->
      <div class="space-y-3">
        <label class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Assignees
        </label>

        <div class="flex flex-wrap gap-2">
          ${users
            .map(
              user => `
            <label
              class="assignee-pill flex items-center gap-2 px-3 py-2 rounded-2xl cursor-pointer border transition
              ${
                task?.assignees?.includes(user.id)
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white'
                  : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
              }"
            >
              <input
                type="checkbox"
                class="assignee-check hidden"
                value="${user.id}"
                ${task?.assignees?.includes(user.id) ? 'checked' : ''}
              />

              <div
                class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white"
                style="background:${user.color}"
              >
                ${user.initials}
              </div>

              <span class="text-sm font-medium">
                ${user.name}
              </span>
            </label>
          `
            )
            .join('')}
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="px-7 py-5 border-t border-zinc-100 dark:border-zinc-900 flex justify-end gap-3">
      <button
        id="cancel-task-btn"
        class="h-11 px-5 rounded-2xl text-sm font-medium bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:opacity-80 transition"
      >
        Cancel
      </button>

      <button
        id="save-task-btn"
        class="h-11 px-5 rounded-2xl text-sm font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 transition"
      >
        ${isEdit ? 'Save changes' : 'Create task'}
      </button>
    </div>
  </div>
  `;

  openModal(html);

  requestAnimationFrame(() => {
    const card = document.getElementById('modal-card');

    card?.classList.remove('scale-[0.98]', 'opacity-0');
  });

  document.getElementById('close-modal-btn')?.addEventListener('click', closeModal);

  document.getElementById('cancel-task-btn')?.addEventListener('click', closeModal);

  document.querySelectorAll('.assignee-check').forEach(check => {
    check.addEventListener('change', () => {
      const label = check.closest('.assignee-pill');

      if (check.checked) {
        label.className =
          'assignee-pill flex items-center gap-2 px-3 py-2 rounded-2xl cursor-pointer border transition bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white';
      } else {
        label.className =
          'assignee-pill flex items-center gap-2 px-3 py-2 rounded-2xl cursor-pointer border transition bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300';
      }
    });
  });

  document.getElementById('save-task-btn')?.addEventListener('click', () => {
    const title = document.getElementById('task-title').value.trim();

    if (!title) {
      toast('Task title is required', 'warning');
      return;
    }

    const assignees = [
      ...document.querySelectorAll('.assignee-check:checked')
    ].map(c => Number(c.value));

    const payload = {
      title,
      description: document.getElementById('task-desc').value.trim(),
      priority: document.getElementById('task-priority').value,
      dueDate: document.getElementById('task-due').value || null,
      assignees
    };

    if (isEdit) {
      state.updateTask(taskId, payload);
      toast('Task updated', 'success');
    } else {
      state.addTask({
        ...payload,
        id: generateId('t'),
        status: STATUS.ACTIVE,
        createdAt: new Date().toISOString(),
        completedAt: null,
        verifiedAt: null,
        notesCount: 0
      });

      toast('Task created', 'success');
    }

    closeModal();

    onSave?.();
  });
}

/* -------------------------------------------------------------------------- */
/*                              TASK DETAIL MODAL                             */
/* -------------------------------------------------------------------------- */

export function openTaskDetail(taskId, onUpdate) {
  function buildContent() {
    const task = state.getTask(taskId);

    if (!task) return '';

    const cfg =
      PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

    const assignees = (task.assignees || [])
      .map(id => state.getUser(id))
      .filter(Boolean);

    return `
    <div
      id="modal-card"
      class="w-full max-w-5xl bg-white dark:bg-zinc-950 border border-zinc-200/70 dark:border-zinc-800 rounded-[30px] shadow-2xl overflow-hidden scale-[0.98] opacity-0 transition-all duration-200"
    >

      <!-- Header -->
      <div class="px-8 py-6 border-b border-zinc-100 dark:border-zinc-900">
        <div class="flex items-start justify-between gap-6">

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-3 flex-wrap">

              <span
                class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${cfg.color}"
              >
                <span
                  class="w-2 h-2 rounded-full"
                  style="background:${cfg.dot}"
                ></span>
                ${cfg.label}
              </span>

              ${
                task.dueDate
                  ? `
                <span class="text-sm text-zinc-500">
                  Due ${formatDate(task.dueDate)}
                </span>
              `
                  : ''
              }
            </div>

            <h1 class="mt-4 text-[30px] leading-tight font-semibold tracking-tight text-zinc-900 dark:text-white">
              ${task.title}
            </h1>
          </div>

          <button
            id="close-detail-btn"
            class="w-10 h-10 rounded-full flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-900 transition shrink-0"
          >
            <svg class="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_360px]">

        <!-- Left -->
        <div class="px-8 py-7">

          <div class="space-y-8">

            <!-- Description -->
            <div>
              <h3 class="text-sm font-medium text-zinc-500 mb-3">
                Description
              </h3>

              <p class="text-[15px] leading-7 text-zinc-700 dark:text-zinc-300">
                ${task.description || 'No description provided.'}
              </p>
            </div>

            <!-- Assignees -->
            ${
              assignees.length
                ? `
              <div>
                <h3 class="text-sm font-medium text-zinc-500 mb-3">
                  Assignees
                </h3>

                <div class="flex flex-wrap gap-3">
                  ${assignees
                    .map(
                      user => `
                    <div class="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 rounded-2xl px-3 py-2">
                      <div
                        class="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-white"
                        style="background:${user.color}"
                      >
                        ${user.initials}
                      </div>

                      <span class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        ${user.name}
                      </span>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </div>
            `
                : ''
            }

            <!-- Actions -->
            <div class="flex flex-wrap gap-3 pt-2">

              <button
                class="detail-edit-btn h-11 px-5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:opacity-80 transition"
              >
                Edit
              </button>

              ${
                task.status === STATUS.ACTIVE
                  ? `
                <button
                  class="detail-complete-btn h-11 px-5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:opacity-90 transition"
                >
                  Complete
                </button>
              `
                  : `
                <button
                  class="detail-reopen-btn h-11 px-5 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:opacity-90 transition"
                >
                  Reopen
                </button>
              `
              }

              ${
                task.status !== STATUS.ARCHIVED
                  ? `
                <button
                  class="detail-archive-btn h-11 px-5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:opacity-80 transition"
                >
                  Archive
                </button>
              `
                  : ''
              }

              <button
                class="detail-delete-btn h-11 px-5 rounded-2xl bg-red-500 text-white text-sm font-medium hover:opacity-90 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="border-t lg:border-t-0 lg:border-l border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/40 px-6 py-6 overflow-hidden">
          ${renderComments(taskId)}
        </div>
      </div>
    </div>
    `;
  }

  openModal(buildContent());

  requestAnimationFrame(() => {
    const card = document.getElementById('modal-card');

    card?.classList.remove('scale-[0.98]', 'opacity-0');
  });

  document.getElementById('close-detail-btn')?.addEventListener('click', closeModal);

  const refreshComments = () => {
    const container = document.querySelector(
      '.lg\\:grid-cols-\\[1fr_360px\\] > div:last-child'
    );

    if (!container) return;

    container.innerHTML = renderComments(taskId);

    initCommentsEvents(taskId, refreshComments);
  };

  state.fetchTaskNotes(taskId).then(refreshComments);

  attachDetailEvents(taskId, onUpdate);

  initCommentsEvents(taskId, refreshComments);
}

/* -------------------------------------------------------------------------- */
/*                                 DETAIL EVENTS                              */
/* -------------------------------------------------------------------------- */

function attachDetailEvents(taskId, onUpdate) {
  document.querySelector('.detail-edit-btn')?.addEventListener('click', () => {
    closeModal();
    openTaskModal(taskId, onUpdate);
  });

  document.querySelector('.detail-complete-btn')?.addEventListener('click', () => {
    state.updateTask(taskId, {
      status: STATUS.COMPLETED,
      completedAt: new Date().toISOString()
    });

    toast('Task completed', 'success');

    closeModal();

    onUpdate?.();
  });

  document.querySelector('.detail-reopen-btn')?.addEventListener('click', () => {
    state.updateTask(taskId, {
      status: STATUS.ACTIVE,
      completedAt: null,
      verifiedAt: null
    });

    toast('Task reopened', 'info');

    closeModal();

    onUpdate?.();
  });

  document.querySelector('.detail-archive-btn')?.addEventListener('click', () => {
    state.updateTask(taskId, {
      status: STATUS.ARCHIVED
    });

    toast('Task archived', 'info');

    closeModal();

    onUpdate?.();
  });

  document.querySelector('.detail-delete-btn')?.addEventListener('click', () => {
    openDeleteConfirm(taskId, () => {
      closeModal();
      onUpdate?.();
    });
  });
}

/* -------------------------------------------------------------------------- */
/*                              DELETE CONFIRM                                */
/* -------------------------------------------------------------------------- */

export function openDeleteConfirm(taskId, onDelete) {
  const html = `
  <div
    id="modal-card"
    class="w-full max-w-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[28px] shadow-2xl p-7 scale-[0.98] opacity-0 transition-all duration-200"
  >

    <div class="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center mb-5">
      <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
      </svg>
    </div>

    <h2 class="text-xl font-semibold text-zinc-900 dark:text-white">
      Delete task?
    </h2>

    <p class="text-sm text-zinc-500 mt-2 leading-6">
      This action cannot be undone.
    </p>

    <div class="flex gap-3 mt-7">
      <button
        id="cancel-delete-btn"
        class="flex-1 h-11 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        Cancel
      </button>

      <button
        id="confirm-delete-btn"
        class="flex-1 h-11 rounded-2xl bg-red-500 text-white text-sm font-medium"
      >
        Delete
      </button>
    </div>
  </div>
  `;

  openModal(html);

  requestAnimationFrame(() => {
    const card = document.getElementById('modal-card');

    card?.classList.remove('scale-[0.98]', 'opacity-0');
  });

  document.getElementById('cancel-delete-btn')?.addEventListener('click', closeModal);

  document.getElementById('confirm-delete-btn')?.addEventListener('click', () => {
    state.deleteTask(taskId);

    toast('Task deleted', 'error');

    closeModal();

    onDelete?.();
  });
}