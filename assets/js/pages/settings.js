import { state } from '../utils/state.js';
import { toast } from '../components/toast.js';
import { orgStore } from '../utils/orgStore.js';

export function renderSettings(rerender) {
  const user = state.get('currentUser');
  const dark = state.get('darkMode');
  let session = null;
  try { session = JSON.parse(localStorage.getItem('tf_session_v1') || 'null'); } catch { }
  const role = session?.role || 'unknown';
  const org = session?.orgId ? orgStore.getOrg(session.orgId) : null;

  const html = `
  <div class="p-6 max-w-2xl space-y-6 animate-fadein">
    <div>
      <h2 class="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">Settings</h2>
      <p class="text-sm text-zinc-400 mt-0.5">Manage your preferences and account.</p>
    </div>

    <!-- Organization -->
    <div class="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 rounded-2xl overflow-hidden">
      <div class="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <h3 class="text-sm font-semibold text-zinc-900 dark:text-white">Organization</h3>
      </div>
      <div class="px-5 py-5 space-y-3">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-sm font-medium text-zinc-900 dark:text-white">${org?.name || 'Not set'}</p>
            <p class="text-xs text-zinc-400">Role: <span class="font-medium text-zinc-500 dark:text-zinc-300">${role}</span></p>
          </div>
        </div>
        ${role === 'owner' ? `
          <div class="pt-2 border-t border-zinc-100 dark:border-zinc-800/60">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-sm font-medium text-zinc-900 dark:text-white">Invite employees</p>
                <p class="text-xs text-zinc-400">Generate a unique lowercase key for an employee to join.</p>
              </div>
              <button id="gen-invite-btn" class="px-4 py-2 text-xs font-medium rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 active:scale-95 transition-all">Generate key</button>
            </div>
            <div class="mt-4">
              <p class="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2 block">Recent keys</p>
              <div id="invite-list" class="space-y-2">
                ${(org?.id ? orgStore.listOrgInvites(org.id).slice(0, 5) : []).map(inv => `
                  <div class="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/60">
                    <div class="min-w-0">
                      <p class="text-sm font-mono text-zinc-900 dark:text-white truncate">${inv.key}</p>
                      <p class="text-[11px] text-zinc-400">${inv.usedBySub ? 'Used' : 'Unused'} • ${new Date(inv.createdAt).toLocaleString()}</p>
                    </div>
                    <button data-copy-key="${inv.key}" class="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-all">Copy</button>
                  </div>
                `).join('') || `<p class="text-xs text-zinc-400">No keys generated yet.</p>`}
              </div>
            </div>
          </div>
        ` : `
          <p class="text-xs text-zinc-400">Ask your owner/admin if you need a new employee key.</p>
        `}
      </div>
    </div>

    <!-- Profile -->
    <div class="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 rounded-2xl overflow-hidden">
      <div class="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <h3 class="text-sm font-semibold text-zinc-900 dark:text-white">Profile</h3>
      </div>
      <div class="px-5 py-5 space-y-4">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white" style="background:${user.color}">${user.initials}</div>
          <div>
            <p class="text-sm font-semibold text-zinc-900 dark:text-white">${user.name}</p>
            <p class="text-xs text-zinc-400">Administrator</p>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Display Name</label>
            <input type="text" value="${user.name}" class="w-full px-4 py-2.5 text-sm bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/10 transition-all">
          </div>
          <div>
            <label class="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Email</label>
            <input type="email" value="${user.email || ''}" class="w-full px-4 py-2.5 text-sm bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/10 transition-all">
          </div>
        </div>
      </div>
    </div>

    <!-- Preferences -->
    <div class="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 rounded-2xl overflow-hidden">
      <div class="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <h3 class="text-sm font-semibold text-zinc-900 dark:text-white">Preferences</h3>
      </div>
      <div class="divide-y divide-zinc-50 dark:divide-zinc-800">
        <div class="flex items-center justify-between px-5 py-4">
          <div>
            <p class="text-sm font-medium text-zinc-900 dark:text-white">Dark mode</p>
            <p class="text-xs text-zinc-400">Switch between light and dark themes</p>
          </div>
          <button id="settings-dark-toggle" class="relative w-11 h-6 rounded-full transition-colors duration-200 ${dark ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-700'}">
            <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white dark:bg-zinc-900 rounded-full shadow transition-transform duration-200 ${dark ? 'translate-x-5' : ''}"></span>
          </button>
        </div>
        <div class="flex items-center justify-between px-5 py-4">
          <div>
            <p class="text-sm font-medium text-zinc-900 dark:text-white">Email notifications</p>
            <p class="text-xs text-zinc-400">Receive task updates via email</p>
          </div>
          <button class="relative w-11 h-6 rounded-full bg-zinc-900 dark:bg-white transition-colors">
            <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white dark:bg-zinc-900 rounded-full shadow translate-x-5 transition-transform duration-200"></span>
          </button>
        </div>
        <div class="flex items-center justify-between px-5 py-4">
          <div>
            <p class="text-sm font-medium text-zinc-900 dark:text-white">Desktop notifications</p>
            <p class="text-xs text-zinc-400">Push notifications in your browser</p>
          </div>
          <button class="relative w-11 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 transition-colors">
            <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white dark:bg-zinc-900 rounded-full shadow transition-transform duration-200"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- Add User -->
    <div class="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 rounded-2xl overflow-hidden">
      <div class="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <h3 class="text-sm font-semibold text-zinc-900 dark:text-white">Add User</h3>
      </div>
      <div class="px-5 py-5 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Name</label>
            <input type="text" id="add-user-name" placeholder="Full Name" class="w-full px-4 py-2.5 text-sm bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/10 transition-all">
          </div>
          <div>
            <label class="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5 block">Email</label>
            <input type="email" id="add-user-email" placeholder="email@company.io" class="w-full px-4 py-2.5 text-sm bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/10 transition-all">
          </div>
        </div>
        <div class="flex justify-end">
          <button id="add-user-btn" class="px-4 py-2 text-xs font-medium rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 active:scale-95 transition-all">Add User</button>
        </div>
      </div>
    </div>

    <!-- Danger zone -->
    <div class="bg-white dark:bg-zinc-900 border border-red-100 dark:border-red-900/30 rounded-2xl overflow-hidden">
      <div class="px-5 py-4 border-b border-red-100 dark:border-red-900/30">
        <h3 class="text-sm font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
      </div>
      <div class="px-5 py-4 flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-zinc-900 dark:text-white">Clear all data</p>
          <p class="text-xs text-zinc-400">Permanently delete all tasks and reset the app</p>
        </div>
        <button id="clear-data-btn" class="px-4 py-2 text-xs font-medium rounded-xl border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all">Clear data</button>
      </div>
    </div>

    <!-- Save -->
    <div class="flex justify-end">
      <button id="save-settings-btn" class="px-5 py-2.5 text-sm font-medium bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl hover:opacity-90 active:scale-95 transition-all">Save changes</button>
    </div>
  </div>`;

  return {
    html, init() {
      document.getElementById('settings-dark-toggle')?.addEventListener('click', () => {
        const dark = !state.get('darkMode');
        state.set('darkMode', dark);
        document.documentElement.classList.toggle('dark', dark);
        rerender('settings');
      });

      document.getElementById('save-settings-btn')?.addEventListener('click', () => {
        toast('Settings saved', 'success');
      });

      document.getElementById('add-user-btn')?.addEventListener('click', () => {
        const name = document.getElementById('add-user-name')?.value;
        const email = document.getElementById('add-user-email')?.value?.trim()?.toLowerCase();
        
        let session = null;
        try { session = JSON.parse(localStorage.getItem('tf_session_v1') || 'null'); } catch { }
        const orgId = session?.orgId;

        if (name && email && orgId) {
          // Check if already an employee
          const users = state.get('users') || [];
          if (users.some(u => u.email?.toLowerCase() === email)) {
            return toast('User is already a member of this organization', 'error');
          }

          const res = orgStore.preRegisterEmployee({ email, orgId });
          if (res.ok) {
            toast(`User ${name} pre-registered. They will be added to the org on their next login.`, 'success');
            document.getElementById('add-user-name').value = '';
            document.getElementById('add-user-email').value = '';
          } else {
            toast(res.error, 'error');
          }
        } else {
          toast('Please enter both name and email', 'error');
        }
      });

      document.getElementById('gen-invite-btn')?.addEventListener('click', () => {
        let session = null;
        try { session = JSON.parse(localStorage.getItem('tf_session_v1') || 'null'); } catch { }
        if (!session?.orgId || session?.role !== 'owner' || !session?.profile?.sub) {
          return toast('Only owners can generate keys', 'error');
        }
        const inv = orgStore.createInvite({ orgId: session.orgId, createdBySub: session.profile.sub });
        navigator.clipboard?.writeText(inv.key).catch(() => { });
        toast(`Employee key generated (copied): ${inv.key}`, 'success', 5000);
        rerender('settings');
      });

      document.querySelectorAll('[data-copy-key]')?.forEach(btn => {
        btn.addEventListener('click', () => {
          const k = btn.dataset.copyKey;
          navigator.clipboard?.writeText(k).catch(() => { });
          toast('Copied', 'success');
        });
      });

      document.getElementById('clear-data-btn')?.addEventListener('click', () => {
        if (confirm('This will reset all tasks to the demo data. Continue?')) {
          localStorage.removeItem('tf_tasks');
          localStorage.removeItem('tf_notes');
          toast('Data cleared — refresh the page to reset', 'warning', 5000);
        }
      });
    }
  };
}