// settings.js

import { state } from '../utils/state.js';
import { toast } from '../components/toast.js';
import { orgStore } from '../utils/orgStore.js';
import { api } from '../api.js';

export function renderSettings(rerender) {
  const user = state.get('currentUser') || {};
  const dark = state.get('darkMode');

  let session = null;

  try {
    session = JSON.parse(localStorage.getItem('tf_session_v1') || 'null');
  } catch {
    session = null;
  }

  const role = session?.role || 'employee';
  const org = session?.orgId
    ? orgStore.getOrg(session.orgId)
    : null;

  const initials = (() => {
    const name = user?.name || 'User';

    const parts = name.trim().split(' ');

    return (
      (parts[0]?.[0] || '') +
      (parts[1]?.[0] || '')
    ).toUpperCase();
  })();

  const html = `
  <style>
    .settings-page *{
      box-sizing:border-box;
    }

    .settings-page{
      max-width:680px;
      margin:0 auto;
      padding:2rem 1.25rem 4rem;
      animation:fadeIn .25s ease;
    }

    .settings-header{
      margin-bottom:2rem;
    }

    .settings-header h1{
      font-size:22px;
      font-weight:600;
      letter-spacing:-0.3px;
      color:rgb(24 24 27);
    }

    .dark .settings-header h1{
      color:white;
    }

    .settings-header p{
      font-size:13px;
      color:rgb(161 161 170);
      margin-top:4px;
    }

    .settings-section{
      background:white;
      border:1px solid rgb(228 228 231);
      border-radius:16px;
      overflow:hidden;
      margin-bottom:1rem;
    }

    .dark .settings-section{
      background:rgb(24 24 27);
      border-color:rgb(39 39 42);
    }

    .settings-section-header{
      padding:14px 20px;
      border-bottom:1px solid rgb(228 228 231);
      display:flex;
      align-items:center;
      gap:10px;
    }

    .dark .settings-section-header{
      border-color:rgb(39 39 42);
    }

    .settings-section-header i{
      font-size:15px;
      color:rgb(161 161 170);
    }

    .settings-section-header span{
      font-size:12px;
      font-weight:600;
      text-transform:uppercase;
      letter-spacing:.06em;
      color:rgb(113 113 122);
    }

    .settings-section-body{
      padding:20px;
    }

    .profile-row{
      display:flex;
      align-items:center;
      gap:16px;
      margin-bottom:20px;
    }

    .avatar{
      width:52px;
      height:52px;
      border-radius:14px;
      display:flex;
      align-items:center;
      justify-content:center;
      color:white;
      font-size:16px;
      font-weight:700;
      flex-shrink:0;
    }

    .profile-name{
      font-size:15px;
      font-weight:600;
      color:rgb(24 24 27);
    }

    .dark .profile-name{
      color:white;
    }

    .profile-role{
      font-size:12px;
      color:rgb(161 161 170);
      margin-top:2px;
    }

    .status-dot{
      width:7px;
      height:7px;
      border-radius:999px;
      background:#84cc16;
      display:inline-block;
      margin-right:5px;
    }

    .field-grid{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:12px;
    }

    .add-user-grid{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:12px;
      margin-bottom:14px;
    }

    @media(max-width:640px){
      .field-grid,
      .add-user-grid{
        grid-template-columns:1fr;
      }
    }

    .field label{
      display:block;
      font-size:11px;
      font-weight:600;
      margin-bottom:6px;
      text-transform:uppercase;
      letter-spacing:.06em;
      color:rgb(113 113 122);
    }

    .field input{
      width:100%;
      height:40px;
      padding:0 12px;
      border-radius:10px;
      border:1px solid rgb(228 228 231);
      background:rgb(244 244 245);
      font-size:13px;
      color:rgb(24 24 27);
      outline:none;
      transition:.15s ease;
    }

    .dark .field input{
      background:rgb(39 39 42);
      border-color:rgb(63 63 70);
      color:white;
    }

    .field input:focus{
      border-color:rgb(113 113 122);
      box-shadow:0 0 0 3px rgba(0,0,0,.05);
    }

    .org-row{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
    }

    .org-name{
      font-size:14px;
      font-weight:600;
      color:rgb(24 24 27);
    }

    .dark .org-name{
      color:white;
    }

    .org-role{
      font-size:12px;
      color:rgb(161 161 170);
      margin-top:2px;
    }

    .badge{
      padding:3px 9px;
      border-radius:999px;
      font-size:11px;
      font-weight:600;
    }

    .badge-owner{
      background:#ecfccb;
      color:#3f6212;
    }

    .badge-employee{
      background:rgb(244 244 245);
      color:rgb(82 82 91);
    }

    .toggle-row{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:16px;
      padding:15px 20px;
      border-bottom:1px solid rgb(228 228 231);
    }

    .dark .toggle-row{
      border-color:rgb(39 39 42);
    }

    .toggle-row:last-child{
      border-bottom:none;
    }

    .toggle-label{
      font-size:14px;
      font-weight:500;
      color:rgb(24 24 27);
    }

    .dark .toggle-label{
      color:white;
    }

    .toggle-sub{
      font-size:12px;
      color:rgb(161 161 170);
      margin-top:2px;
    }

    .toggle{
      position:relative;
      width:42px;
      height:24px;
      cursor:pointer;
      flex-shrink:0;
    }

    .toggle input{
      opacity:0;
      width:0;
      height:0;
      position:absolute;
    }

    .toggle-track{
      position:absolute;
      inset:0;
      border-radius:999px;
      background:rgb(212 212 216);
      transition:.2s ease;
    }

    .dark .toggle-track{
      background:rgb(63 63 70);
    }

    .toggle input:checked ~ .toggle-track{
      background:rgb(24 24 27);
    }

    .dark .toggle input:checked ~ .toggle-track{
      background:white;
    }

    .toggle-thumb{
      position:absolute;
      width:18px;
      height:18px;
      top:3px;
      left:3px;
      border-radius:999px;
      background:white;
      transition:.2s ease;
    }

    .dark .toggle-thumb{
      background:rgb(24 24 27);
    }

    .toggle input:checked ~ .toggle-thumb{
      transform:translateX(18px);
    }

    .btn{
      height:36px;
      padding:0 14px;
      border:none;
      border-radius:10px;
      font-size:13px;
      font-weight:500;
      cursor:pointer;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      gap:6px;
      transition:.15s ease;
    }

    .btn:active{
      transform:scale(.97);
    }

    .btn-primary{
      background:rgb(24 24 27);
      color:white;
    }

    .dark .btn-primary{
      background:white;
      color:black;
    }

    .btn-primary:hover{
      opacity:.9;
    }

    .btn-ghost{
      background:transparent;
      border:1px solid rgb(212 212 216);
      color:rgb(82 82 91);
    }

    .dark .btn-ghost{
      border-color:rgb(63 63 70);
      color:rgb(212 212 216);
    }

    .btn-danger{
      background:transparent;
      border:1px solid rgba(239,68,68,.25);
      color:#ef4444;
    }

    .btn-danger:hover{
      background:rgba(239,68,68,.08);
    }

    .danger-section{
      border-color:rgba(239,68,68,.2);
    }

    .danger-header{
      border-color:rgba(239,68,68,.15);
    }

    .danger-row{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:14px;
      padding:18px 20px;
    }

    .danger-title{
      font-size:14px;
      font-weight:600;
      color:rgb(24 24 27);
    }

    .dark .danger-title{
      color:white;
    }

    .danger-sub{
      font-size:12px;
      color:rgb(161 161 170);
      margin-top:2px;
    }

    .save-row{
      display:flex;
      justify-content:flex-end;
      gap:10px;
      margin-top:1.5rem;
    }

    @keyframes fadeIn{
      from{
        opacity:0;
        transform:translateY(6px);
      }
      to{
        opacity:1;
        transform:translateY(0);
      }
    }
  </style>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css">

  <div class="settings-page">

    <div class="settings-header">
      <h1>Settings</h1>
      <p>Manage your account, preferences and organization.</p>
    </div>

    <!-- PROFILE -->
    <div class="settings-section">
      <div class="settings-section-header">
        <i class="ti ti-user"></i>
        <span>Profile</span>
      </div>

      <div class="settings-section-body">

        <div class="profile-row">
          <div 
            class="avatar"
            id="avatar-preview"
            style="background:${user?.color || '#534AB7'}"
          >
            ${initials}
          </div>

          <div>
            <div class="profile-name" id="profile-name-display">
              ${user?.name || 'User'}
            </div>

            <div class="profile-role">
              <span class="status-dot"></span>
              ${role === 'owner' ? 'Administrator' : 'Employee'}
            </div>
          </div>
        </div>

        <div class="field-grid">

          <div class="field">
            <label>Display name</label>

            <input
              type="text"
              id="profile-name"
              value="${user?.name || ''}"
              placeholder="Your name"
            >
          </div>

          <div class="field">
            <label>Email address</label>

            <input
              type="email"
              id="profile-email"
              value="${user?.email || ''}"
              placeholder="you@company.com"
            >
          </div>

        </div>

      </div>
    </div>

    <!-- ORGANIZATION -->
    <div class="settings-section">
      <div class="settings-section-header">
        <i class="ti ti-building"></i>
        <span>Organization</span>
      </div>

      <div class="settings-section-body">

        <div class="org-row">

          <div>
            <div class="org-name">
              ${org?.name || 'No organization'}
            </div>

            <div class="org-role">
              Workspace member
            </div>
          </div>

          <span class="badge ${role === 'owner'
      ? 'badge-owner'
      : 'badge-employee'}">

            ${role === 'owner'
      ? 'Owner'
      : 'Employee'}

          </span>

        </div>

      </div>
    </div>

    <!-- ADD EMPLOYEE -->
    ${role === 'owner' ? `
      <div class="settings-section">

        <div class="settings-section-header">
          <i class="ti ti-user-plus"></i>
          <span>Invite employee</span>
        </div>

        <div class="settings-section-body">

          <div class="add-user-grid">

            <div class="field">
              <label>Full name</label>

              <input
                type="text"
                id="add-user-name"
                placeholder="Jordan Lee"
              >
            </div>

            <div class="field">
              <label>Work email</label>

              <input
                type="email"
                id="add-user-email"
                placeholder="jordan@company.io"
              >
            </div>

          </div>

          <div style="display:flex;justify-content:flex-end">
            <button class="btn btn-primary" id="add-user-btn">
              <i class="ti ti-send"></i>
              Send invite
            </button>
          </div>

        </div>

      </div>
    ` : ''}

    <!-- PREFERENCES -->
    <div class="settings-section">

      <div class="settings-section-header">
        <i class="ti ti-adjustments-horizontal"></i>
        <span>Preferences</span>
      </div>

      <div>

        <div class="toggle-row">

          <div>
            <div class="toggle-label">Dark mode</div>
            <div class="toggle-sub">
              Switch between light and dark themes
            </div>
          </div>

          <label class="toggle">
            <input
              type="checkbox"
              id="dark-toggle"
              ${dark ? 'checked' : ''}
            >

            <div class="toggle-track"></div>
            <div class="toggle-thumb"></div>
          </label>

        </div>

        <div class="toggle-row">

          <div>
            <div class="toggle-label">Email notifications</div>
            <div class="toggle-sub">
              Receive task updates via email
            </div>
          </div>

          <label class="toggle">
            <input type="checkbox" checked>
            <div class="toggle-track"></div>
            <div class="toggle-thumb"></div>
          </label>

        </div>

        <div class="toggle-row">

          <div>
            <div class="toggle-label">Desktop notifications</div>
            <div class="toggle-sub">
              Push notifications in browser
            </div>
          </div>

          <label class="toggle">
            <input type="checkbox">
            <div class="toggle-track"></div>
            <div class="toggle-thumb"></div>
          </label>

        </div>

      </div>

    </div>

    <!-- DANGER -->
    <div class="settings-section danger-section">

      <div class="settings-section-header danger-header">
        <i class="ti ti-alert-triangle"></i>
        <span>Danger zone</span>
      </div>

      <div class="danger-row">

        <div>
          <div class="danger-title">
            Clear all data
          </div>

          <div class="danger-sub">
            Permanently delete all tasks and notes.
          </div>
        </div>

        <button
          class="btn btn-danger"
          id="clear-data-btn"
        >
          <i class="ti ti-trash"></i>
          Clear data
        </button>

      </div>

    </div>

    <!-- SAVE -->
    <div class="save-row">

      <button
        class="btn btn-ghost"
        id="discard-btn"
      >
        Discard
      </button>

      <button
        class="btn btn-primary"
        id="save-btn"
      >
        <i class="ti ti-check"></i>
        Save changes
      </button>

    </div>

  </div>
  `;

  return {
    html,

    init() {

      // DARK MODE

      const darkToggle = document.getElementById('dark-toggle');

      darkToggle?.addEventListener('change', () => {
        const enabled = darkToggle.checked;

        state.set('darkMode', enabled);

        document.documentElement.classList.toggle(
          'dark',
          enabled
        );

        localStorage.setItem(
          'tf_dark',
          enabled
        );

        toast(
          enabled
            ? 'Dark mode enabled'
            : 'Light mode enabled',
          'success'
        );
      });

      // PROFILE PREVIEW

      const profileInput =
        document.getElementById('profile-name');

      profileInput?.addEventListener('input', (e) => {

        const value = e.target.value.trim();

        document.getElementById(
          'profile-name-display'
        ).textContent = value || 'User';

        const parts = value.split(' ');

        const initials =
          (
            (parts[0]?.[0] || '') +
            (parts[1]?.[0] || '')
          ).toUpperCase();

        document.getElementById(
          'avatar-preview'
        ).textContent = initials || 'U';
      });

      // SAVE

      document
        .getElementById('save-btn')
        ?.addEventListener('click', () => {

          const btn =
            document.getElementById('save-btn');

          btn.disabled = true;

          btn.innerHTML =
            '<i class="ti ti-loader-2"></i> Saving...';

          setTimeout(() => {

            btn.disabled = false;

            btn.innerHTML =
              '<i class="ti ti-check"></i> Save changes';

            toast(
              'Settings saved',
              'success'
            );

          }, 700);
        });

      // DISCARD

      document
        .getElementById('discard-btn')
        ?.addEventListener('click', () => {

          rerender('settings');

          toast(
            'Changes discarded',
            'warning'
          );
        });

      // ADD USER

      document
        .getElementById('add-user-btn')
        ?.addEventListener('click', async () => {

          const nameInput =
            document.getElementById('add-user-name');

          const emailInput =
            document.getElementById('add-user-email');

          const name =
            nameInput?.value?.trim();

          const email =
            emailInput?.value
              ?.trim()
              ?.toLowerCase();

          if (!name || !email) {
            return toast(
              'Please enter name and email',
              'error'
            );
          }

          const btn =
            document.getElementById('add-user-btn');

          btn.disabled = true;

          btn.innerHTML =
            '<i class="ti ti-loader-2"></i> Sending...';

          try {

            // CREATE INVITE
            const response = await fetch(
              'https://task.kehem.com/api/v1/invites/',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${localStorage.getItem('tf_access_token')
                    }`
                },
                body: JSON.stringify({
                  email,name
                })
              }
            );

            const data = await response.json();

            if (!response.ok) {
              throw new Error(
                data.detail || 'Failed to send invite'
              );
            }

            toast(
              `${email} invited successfully`,
              'success'
            );

            nameInput.value = '';
            emailInput.value = '';

            console.log('Invite created:', data);

          } catch (err) {

            console.error(err);

            toast(
              err.message || 'Server error',
              'error'
            );

          } finally {

            btn.disabled = false;

            btn.innerHTML =
              '<i class="ti ti-send"></i> Send invite';
          }
        });

      // CLEAR DATA

      document
        .getElementById('clear-data-btn')
        ?.addEventListener('click', () => {

          const ok = confirm(
            'Delete all tasks and notes?'
          );

          if (!ok) return;

          localStorage.removeItem('tf_tasks');
          localStorage.removeItem('tf_notes');

          toast(
            'All data cleared',
            'warning'
          );
        });
    }
  };
}