import { state } from '../utils/state.js';
import { formatRelative } from '../utils/helpers.js';

export function renderComments(taskId) {
  const notes = state.getTaskNotes(taskId);
  const currentUser = state.get('currentUser');

  return `
  <div class="flex flex-col h-full min-h-0">
    <h3 class="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
      Notes ${notes.length > 0 ? `<span class="text-zinc-400 font-normal">(${notes.length})</span>` : ''}
    </h3>

    <!-- Messages -->
    <div id="notes-list" class="flex-1 overflow-y-auto space-y-4 mb-4 pr-1" style="min-height:120px;max-height:320px">
      ${notes.length === 0 ? `
        <div class="flex flex-col items-center justify-center h-24 text-zinc-400">
          <svg class="w-8 h-8 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          <p class="text-xs">No notes yet</p>
        </div>
      ` : notes.map(note => {
        const user = state.getUser(note.userId);
        const isMe = note.userId === currentUser.id;
        return `
          <div class="flex gap-3 ${isMe ? 'flex-row-reverse' : ''}">
            <div class="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] font-semibold text-white" style="background:${user?.color || '#888'}">${user?.initials || '?'}</div>
            <div class="max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1">
              <div class="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-tr-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-sm'
              }">${note.message}</div>
              <span class="text-[11px] text-zinc-400 px-1">${formatRelative(note.ts)}</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- Input -->
    <div class="flex gap-2 items-end border-t border-zinc-100 dark:border-zinc-800 pt-4">
      <div class="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] font-semibold text-white mb-0.5" style="background:${currentUser.color}">${currentUser.initials}</div>
      <div class="flex-1 relative">
        <textarea id="note-input" placeholder="Write a note…" rows="1"
          class="w-full px-4 py-2.5 pr-12 text-sm bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/10 resize-none transition-all"
          style="min-height:40px;max-height:120px" data-task-id="${taskId}"></textarea>
        <button id="note-submit" data-task-id="${taskId}" class="absolute right-2 bottom-2 p-1.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-80 transition-all active:scale-90">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  </div>`;
}

export function initCommentsEvents(taskId, onUpdate) {
  const input = document.getElementById('note-input');
  const submit = document.getElementById('note-submit');

  function send() {
    const text = input?.value.trim();
    if (!text) return;
    state.addNote(taskId, text);
    input.value = '';
    onUpdate?.();
    // Scroll to bottom
    setTimeout(() => {
      const list = document.getElementById('notes-list');
      if (list) list.scrollTop = list.scrollHeight;
    }, 50);
  }

  submit?.addEventListener('click', send);
  input?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });

  // Auto-resize textarea
  input?.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });

  // Scroll to bottom on mount
  setTimeout(() => {
    const list = document.getElementById('notes-list');
    if (list) list.scrollTop = list.scrollHeight;
  }, 50);
}