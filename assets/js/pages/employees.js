// employees.js

import { toast } from '../components/toast.js';

export function renderEmployees() {

  const html = `
  <style>

    .employees-page *{
      box-sizing:border-box;
    }

    .employees-page{
      max-width:1100px;
      margin:0 auto;
      padding:24px 18px 80px;
      animation:fadeIn .2s ease;
    }

    .employees-top{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:16px;
      margin-bottom:22px;
      flex-wrap:wrap;
    }

    .employees-title h1{
      margin:0;
      font-size:26px;
      font-weight:700;
      letter-spacing:-0.03em;
      color:#111827;
    }

    .dark .employees-title h1{
      color:white;
    }

    .employees-title p{
      margin-top:4px;
      font-size:13px;
      color:#71717a;
    }

    .employees-search{
      position:relative;
      width:280px;
      max-width:100%;
    }

    .employees-search i{
      position:absolute;
      left:14px;
      top:50%;
      transform:translateY(-50%);
      font-size:14px;
      color:#a1a1aa;
    }

    .employees-search input{
      width:100%;
      height:42px;
      border-radius:14px;
      border:1px solid #e4e4e7;
      background:white;
      padding:0 14px 0 40px;
      outline:none;
      font-size:14px;
      transition:.15s ease;
    }

    .employees-search input:focus{
      border-color:#111827;
    }

    .dark .employees-search input{
      background:#18181b;
      border-color:#27272a;
      color:white;
    }

    .employees-card{
      border:1px solid #e4e4e7;
      background:white;
      border-radius:22px;
      overflow:hidden;
    }

    .dark .employees-card{
      background:#18181b;
      border-color:#27272a;
    }

    .employees-table{
      width:100%;
      border-collapse:collapse;
    }

    .employees-table thead{
      background:#fafafa;
    }

    .dark .employees-table thead{
      background:#111827;
    }

    .employees-table th{
      text-align:left;
      padding:16px 20px;
      font-size:11px;
      font-weight:700;
      text-transform:uppercase;
      letter-spacing:.08em;
      color:#71717a;
      border-bottom:1px solid #e4e4e7;
    }

    .dark .employees-table th{
      border-color:#27272a;
    }

    .employees-table td{
      padding:18px 20px;
      border-bottom:1px solid #f4f4f5;
      vertical-align:middle;
    }

    .dark .employees-table td{
      border-color:#27272a;
    }

    .employees-table tr:last-child td{
      border-bottom:none;
    }

    .employee-user{
      display:flex;
      align-items:center;
      gap:14px;
    }

    .employee-avatar{
      width:42px;
      height:42px;
      border-radius:14px;
      background:#111827;
      color:white;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:13px;
      font-weight:700;
      flex-shrink:0;
    }

    .dark .employee-avatar{
      background:white;
      color:black;
    }

    .employee-name{
      font-size:14px;
      font-weight:600;
      color:#111827;
    }

    .dark .employee-name{
      color:white;
    }

    .employee-email{
      margin-top:2px;
      font-size:12px;
      color:#71717a;
    }

    .employee-role{
      display:inline-flex;
      align-items:center;
      gap:6px;
      padding:6px 10px;
      border-radius:999px;
      font-size:12px;
      font-weight:600;
      background:#f4f4f5;
      color:#52525b;
    }

    .dark .employee-role{
      background:#27272a;
      color:#d4d4d8;
    }

    .employee-role.owner{
      background:#ecfccb;
      color:#3f6212;
    }

    .employee-status{
      display:flex;
      align-items:center;
      gap:8px;
      font-size:13px;
      color:#52525b;
    }

    .dark .employee-status{
      color:#d4d4d8;
    }

    .status-dot{
      width:8px;
      height:8px;
      border-radius:999px;
      background:#22c55e;
    }

    .employee-actions{
      display:flex;
      justify-content:flex-end;
      gap:8px;
    }

    .action-btn{
      width:36px;
      height:36px;
      border:none;
      border-radius:12px;
      background:#f4f4f5;
      cursor:pointer;
      display:flex;
      align-items:center;
      justify-content:center;
      transition:.15s ease;
      color:#52525b;
    }

    .action-btn:hover{
      transform:translateY(-1px);
    }

    .dark .action-btn{
      background:#27272a;
      color:#d4d4d8;
    }

    .empty-state{
      padding:80px 20px;
      text-align:center;
    }

    .empty-state i{
      font-size:42px;
      color:#a1a1aa;
    }

    .empty-state h3{
      margin-top:14px;
      margin-bottom:6px;
      font-size:18px;
      color:#111827;
    }

    .dark .empty-state h3{
      color:white;
    }

    .empty-state p{
      color:#71717a;
      font-size:13px;
    }

    @media(max-width:840px){

      .employees-table thead{
        display:none;
      }

      .employees-table,
      .employees-table tbody,
      .employees-table tr,
      .employees-table td{
        display:block;
        width:100%;
      }

      .employees-table tr{
        border-bottom:1px solid #e4e4e7;
        padding:12px 0;
      }

      .dark .employees-table tr{
        border-color:#27272a;
      }

      .employees-table td{
        border:none;
        padding:10px 18px;
      }

      .employee-actions{
        justify-content:flex-start;
      }
    }

    @keyframes fadeIn{
      from{
        opacity:0;
        transform:translateY(4px);
      }
      to{
        opacity:1;
        transform:translateY(0);
      }
    }

  </style>

  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
  >

  <div class="employees-page">

    <div class="employees-top">

      <div class="employees-title">
        <h1>Employees</h1>
        <p>Manage your workspace members and permissions.</p>
      </div>

      <div class="employees-search">
        <i class="ti ti-search"></i>

        <input
          type="text"
          id="employee-search"
          placeholder="Search employee..."
        >
      </div>

    </div>

    <div class="employees-card">

      <table class="employees-table">

        <thead>
          <tr>
            <th>Employee</th>
            <th>Role</th>
            <th>Status</th>
            <th style="text-align:right">Actions</th>
          </tr>
        </thead>

        <tbody id="employees-body">

          <tr>
            <td colspan="4">

              <div class="empty-state">
                <i class="ti ti-users"></i>

                <h3>No employees found</h3>

                <p>
                  Invite employees to start collaborating.
                </p>
              </div>

            </td>
          </tr>

        </tbody>

      </table>

    </div>

  </div>
  `;

  return {

    html,

    async init() {

      const tbody =
        document.getElementById(
          'employees-body'
        );

      const searchInput =
        document.getElementById(
          'employee-search'
        );

      let employees = [];

      async function loadEmployees() {

        try {

          const response =
            await fetch(
              'https://task.kehem.com/api/v1/auth/employees/',
              {
                headers: {
                  Authorization:
                    `Bearer ${
                      localStorage.getItem('tf_access_token')
                    }`
                }
              }
            );

          if (!response.ok) {
            throw new Error(
              'Failed to load employees'
            );
          }

          employees =
            await response.json();

          renderEmployees(
            employees
          );

        } catch (err) {

          console.error(err);

          toast(
            'Failed to load employees',
            'error'
          );
        }
      }

      function renderEmployees(data) {

        if (!data.length) {

          tbody.innerHTML = `
            <tr>
              <td colspan="4">

                <div class="empty-state">
                  <i class="ti ti-users"></i>

                  <h3>No employees found</h3>

                  <p>
                    Invite employees to start collaborating.
                  </p>
                </div>

              </td>
            </tr>
          `;

          return;
        }

        tbody.innerHTML =
          data.map(user => {

            const initials =
              (
                (user.name?.split(' ')[0]?.[0] || '') +
                (user.name?.split(' ')[1]?.[0] || '')
              ).toUpperCase();

            return `
              <tr>

                <td>

                  <div class="employee-user">

                    <div class="employee-avatar">
                      ${initials || 'U'}
                    </div>

                    <div>
                      <div class="employee-name">
                        ${user.name || 'Unknown'}
                      </div>

                      <div class="employee-email">
                        ${user.email}
                      </div>
                    </div>

                  </div>

                </td>

                <td>

                  <span class="
                    employee-role
                    ${user.role === 'owner'
                      ? 'owner'
                      : ''}
                  ">

                    ${
                      user.role === 'owner'
                        ? 'Owner'
                        : 'Employee'
                    }

                  </span>

                </td>

                <td>

                  <div class="employee-status">
                    <span class="status-dot"></span>
                    Active
                  </div>

                </td>

                <td>

                  <div class="employee-actions">

                    <button
                      class="action-btn"
                      onclick="editEmployee('${user.id}')"
                    >
                      <i class="ti ti-edit"></i>
                    </button>

                    ${
                      user.role !== 'owner'
                        ? `
                          <button
                            class="action-btn"
                            onclick="removeEmployee('${user.id}')"
                          >
                            <i class="ti ti-trash"></i>
                          </button>
                        `
                        : ''
                    }

                  </div>

                </td>

              </tr>
            `;
          }).join('');
      }

      searchInput?.addEventListener(
        'input',
        e => {

          const query =
            e.target.value
              .trim()
              .toLowerCase();

          const filtered =
            employees.filter(user =>
              (
                user.name ||
                ''
              ).toLowerCase().includes(query)
              ||
              (
                user.email ||
                ''
              ).toLowerCase().includes(query)
            );

          renderEmployees(filtered);
        }
      );

      window.editEmployee =
        function(id) {

          toast(
            'Edit employee coming soon',
            'warning'
          );
        };

      window.removeEmployee =
        async function(id) {

          const ok = confirm(
            'Remove this employee?'
          );

          if (!ok) return;

          try {

            const response =
              await fetch(
                `/api/v1/employees/${id}/`,
                {
                  method:'DELETE',

                  headers:{
                    Authorization:
                      `Bearer ${
                        localStorage.getItem(
                          'access_token'
                        )
                      }`
                  }
                }
              );

            if (!response.ok) {
              throw new Error(
                'Failed to remove employee'
              );
            }

            employees =
              employees.filter(
                u => String(u.id) !== String(id)
              );

            renderEmployees(
              employees
            );

            toast(
              'Employee removed',
              'success'
            );

          } catch (err) {

            console.error(err);

            toast(
              err.message,
              'error'
            );
          }
        };

      loadEmployees();
    }
  };
}