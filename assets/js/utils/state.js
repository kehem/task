// state js 
import { STATUS, PRIORITY } from './constants.js';
import { api } from '../api.js';

function getInitials(name = '') {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}


function stringToColor(str = '') {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const c = (hash & 0x00FFFFFF)
    .toString(16)
    .toUpperCase();

  return '#' + '00000'.substring(0, 6 - c.length) + c;
}

const TASKS_SEED = [
  {
    id: 't1',
    title: 'Redesign onboarding flow',
    description: 'Simplify the 7-step onboarding into a single progressive form with smart defaults and inline validation.',
    assignees: [1, 2],
    dueDate: '2026-05-18',
    priority: PRIORITY.URGENT,
    status: STATUS.ACTIVE,
    notesCount: 4,
    createdAt: '2026-05-01T09:00:00Z',
    completedAt: null,
    verifiedAt: null,
  },
  {
    id: 't2',
    title: 'API rate-limiting middleware',
    description: 'Implement sliding window rate-limit using Redis. Expose config per tenant via the admin panel.',
    assignees: [3],
    dueDate: '2026-05-14',
    priority: PRIORITY.HIGH,
    status: STATUS.ACTIVE,
    notesCount: 2,
    createdAt: '2026-05-03T11:30:00Z',
    completedAt: null,
    verifiedAt: null,
  },
  {
    id: 't3',
    title: 'Write Q2 performance report',
    description: 'Pull metrics from Mixpanel and Stripe; compile executive summary with charts.',
    assignees: [4, 5],
    dueDate: '2026-05-20',
    priority: PRIORITY.MEDIUM,
    status: STATUS.ACTIVE,
    notesCount: 1,
    createdAt: '2026-05-05T14:00:00Z',
    completedAt: null,
    verifiedAt: null,
  },
  {
    id: 't4',
    title: 'Audit accessibility (WCAG 2.2)',
    description: 'Run axe-core and manual keyboard nav audit across all public pages. File issues.',
    assignees: [2, 3],
    dueDate: '2026-05-25',
    priority: PRIORITY.MEDIUM,
    status: STATUS.ACTIVE,
    notesCount: 0,
    createdAt: '2026-05-06T08:15:00Z',
    completedAt: null,
    verifiedAt: null,
  },
  {
    id: 't5',
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions with Docker build, lint, test, and deploy stages.',
    assignees: [1],
    dueDate: '2026-05-12',
    priority: PRIORITY.LOW,
    status: STATUS.ACTIVE,
    notesCount: 3,
    createdAt: '2026-05-07T10:00:00Z',
    completedAt: null,
    verifiedAt: null,
  },
  {
    id: 't6',
    title: 'Update privacy policy',
    description: 'Legal review complete. Update copy in the app and send re-consent emails.',
    assignees: [5],
    dueDate: '2026-04-30',
    priority: PRIORITY.BASIC,
    status: STATUS.COMPLETED,
    notesCount: 1,
    createdAt: '2026-04-20T09:00:00Z',
    completedAt: '2026-04-29T17:00:00Z',
    verifiedAt: null,
  },
  {
    id: 't7',
    title: 'Migrate database to Postgres 16',
    description: 'Schema migration, test on staging, cut-over with zero-downtime rollout.',
    assignees: [3, 1],
    dueDate: '2026-04-25',
    priority: PRIORITY.HIGH,
    status: STATUS.COMPLETED,
    notesCount: 6,
    createdAt: '2026-04-10T09:00:00Z',
    completedAt: '2026-04-24T16:00:00Z',
    verifiedAt: '2026-04-24T18:00:00Z',
  },
  {
    id: 't8',
    title: 'Localize for Japanese market',
    description: 'i18n strings, date/currency formatting, RTL check, hire translator.',
    assignees: [4],
    dueDate: '2026-03-31',
    priority: PRIORITY.MEDIUM,
    status: STATUS.ARCHIVED,
    notesCount: 2,
    createdAt: '2026-03-01T09:00:00Z',
    completedAt: null,
    verifiedAt: null,
  },
];

const NOTES_SEED = {
  t1: [
    { id: 'n1', userId: 2, message: 'Figma prototype is ready for review. Linked in Notion.', ts: '2026-05-02T10:30:00Z' },
    { id: 'n2', userId: 1, message: 'Reviewed — looks great. One concern: the email verification step feels hidden.', ts: '2026-05-02T11:00:00Z' },
    { id: 'n3', userId: 3, message: 'I can move that step to the top of the flow next sprint.', ts: '2026-05-03T09:15:00Z' },
    { id: 'n4', userId: 1, message: 'Perfect. Let\'s get it shipped by EOW.', ts: '2026-05-03T09:45:00Z' },
  ],
  t7: [
    { id: 'n5', userId: 3, message: 'Staging migration complete. All tests passing.', ts: '2026-04-22T14:00:00Z' },
    { id: 'n6', userId: 1, message: 'QA sign-off done. Proceed to production cut-over.', ts: '2026-04-23T10:00:00Z' },
  ],
};


// ---------- Reactive State ----------
const listeners = [];

export const state = {

  _data: {
    tasks: [],
    notes: {},
    users: [],
    currentUser: null,

    onboarded: false,
    orgId: null,
    role: null,

    currentPage: 'dashboard',

    sidebarOpen: window.innerWidth >= 1024,

    darkMode:
      localStorage.getItem('tf_dark') === 'true',

    // filters
    searchQuery: '',
    filterPriority: '',
    filterStatus: '',
    filterAssignee: null,
    filterDate: null,

    activeTaskId: null,

    notifications: [],
  },

  // --------------------------------------------------
  // Core
  // --------------------------------------------------

  get(key) {
    return this._data[key];
  },

  set(key, value) {
    this._data[key] = value;

    this._persist(key);

    listeners.forEach(fn => fn(key, value));
  },

  subscribe(fn) {
    listeners.push(fn);
  },

  _persist(key) {

    if (key === 'tasks') {
      localStorage.setItem(
        'tf_tasks',
        JSON.stringify(this._data.tasks)
      );
    }

    if (key === 'notes') {
      localStorage.setItem(
        'tf_notes',
        JSON.stringify(this._data.notes)
      );
    }

    if (key === 'darkMode') {
      localStorage.setItem(
        'tf_dark',
        this._data.darkMode
      );
    }
  },

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  getUser(id) {
    return this._data.users.find(
      u => String(u.id) === String(id)
    );
  },

  getTask(id) {
    return this._data.tasks.find(
      t => String(t.id) === String(id)
    );
  },

  // --------------------------------------------------
  // Init
  // --------------------------------------------------

  async init() {

    // Tasks
    try {

      const taskData =
        await api.getTasks();

      const tasksRaw =
        Array.isArray(taskData)
          ? taskData
          : (
              taskData.tasks ||
              taskData.results ||
              []
            );

      const tasks = tasksRaw.map(task => ({

        ...task,

        notesCount:
          task.notesCount ??
          task.notes_count ??
          0,

        createdAt:
          task.createdAt ||
          task.created_at,

        completedAt:
          task.completedAt ||
          task.completed_at,

        verifiedAt:
          task.verifiedAt ||
          task.verified_at,
      }));

      this.set('tasks', tasks);

    } catch (e) {

      console.error(
        'API Error: getTasks failed',
        e
      );

      this.set('tasks', []);
    }

    // Users
    try {

      const userData =
        await api.getEmployees();

      const usersRaw =
        Array.isArray(userData)
          ? userData
          : (
              userData.users ||
              userData.employees ||
              userData.results ||
              []
            );

      const users = usersRaw.map(user => {

        const fullName =
          `${user.first_name || ''} ${user.last_name || ''}`
            .trim();

        return {

          ...user,

          name:
            user.name ||
            fullName ||
            user.email,

          initials:
            user.initials ||
            getInitials(
              fullName ||
              user.email ||
              'User'
            ),

          color:
            user.color ||
            stringToColor(
              fullName ||
              user.email ||
              'user'
            ),
        };
      });

      this.set('users', users);

    } catch (e) {

      console.error(
        'API Error: getEmployees failed',
        e
      );

      this.set('users', []);
    }
  },

  // --------------------------------------------------
  // Task CRUD
  // --------------------------------------------------

  addTask(task) {

    const tasks = [
      ...this._data.tasks,
      task
    ];

    this.set('tasks', tasks);

    api.createTask(task)
      .catch(e => {
        console.error(
          'API Error: createTask failed',
          e
        );
      });
  },

  updateTask(id, patch) {

    const tasks =
      this._data.tasks.map(task => {

        if (
          String(task.id) !== String(id)
        ) {
          return task;
        }

        return {
          ...task,
          ...patch
        };
      });

    this.set('tasks', tasks);

    let apiCall =
      api.updateTask(id, patch);

    if (
      patch.status === STATUS.COMPLETED
    ) {
      apiCall = api.completeTask(id);
    }

    else if (
      patch.status === STATUS.ARCHIVED
    ) {
      apiCall = api.archiveTask(id);
    }

    else if (patch.verifiedAt) {
      apiCall = api.verifyTask(id);
    }

    apiCall.catch(e => {

      console.error(
        'API Error: updateTask failed',
        e
      );
    });
  },

  deleteTask(id) {

    const tasks =
      this._data.tasks.filter(
        t => String(t.id) !== String(id)
      );

    this.set('tasks', tasks);

    api.deleteTask(id)
      .catch(e => {

        console.error(
          'API Error: deleteTask failed',
          e
        );
      });
  },

  // --------------------------------------------------
  // Notes
  // --------------------------------------------------

  async fetchTaskNotes(taskId) {

    try {

      const data =
        await api.getNotes(taskId);

      const notesRaw =
        Array.isArray(data)
          ? data
          : (
              data.notes ||
              data.results ||
              []
            );

      const normalized =
        notesRaw.map(note => ({
          ...note,
          message:
            note.message ||
            note.text ||
            ''
        }));

      const notes = {
        ...this._data.notes,
        [taskId]: normalized
      };

      this.set('notes', notes);

    } catch (e) {

      console.error(
        'API Error: getNotes failed',
        e
      );
    }
  },

  addNote(taskId, text) {

    const note = {

      id: 'n' + Date.now(),

      userId:
        this._data.currentUser?.id,

      message: text,

      ts: new Date().toISOString(),
    };

    const notes = {

      ...this._data.notes,

      [taskId]: [
        ...(this._data.notes[taskId] || []),
        note
      ]
    };

    this.set('notes', notes);

    this.updateTask(taskId, {
      notesCount:
        (notes[taskId] || []).length
    });

    api.addNote(taskId, {
      message: text,
      task: taskId
    }).catch(e => {

      console.error(
        'API Error: addNote failed',
        e
      );
    });
  },

  getTaskNotes(taskId) {
    return this._data.notes[taskId] || [];
  },

  // --------------------------------------------------
  // Smart Task Filtering + Sorting
  // --------------------------------------------------

  filteredTasks(statusFilter = null) {

    let tasks = [...this._data.tasks];

    // Page filter
    if (statusFilter) {

      tasks = tasks.filter(
        task =>
          task.status === statusFilter
      );
    }

    // Search
    const q =
      (
        this._data.searchQuery || ''
      )
      .toLowerCase()
      .trim();

    if (q) {

      tasks = tasks.filter(task =>

        task.title
          ?.toLowerCase()
          .includes(q)

        ||

        task.description
          ?.toLowerCase()
          .includes(q)
      );
    }

    // Priority
    if (
      this._data.filterPriority
    ) {

      tasks = tasks.filter(
        task =>
          task.priority ===
          this._data.filterPriority
      );
    }

    // Status
    if (
      this._data.filterStatus
    ) {

      tasks = tasks.filter(
        task =>
          task.status ===
          this._data.filterStatus
      );
    }

    // Assignee
    if (
      this._data.filterAssignee
    ) {

      tasks = tasks.filter(task =>

        task.assignees?.some(
          assignee =>

            String(
              assignee.id
            ) ===

            String(
              this._data.filterAssignee
            )
        )
      );
    }

    // Date
    if (
      this._data.filterDate
    ) {

      const d =
        this._data.filterDate;

      tasks = tasks.filter(task =>

        task.dueDate === d ||

        task.createdAt
          ?.startsWith(d)

        ||

        task.completedAt
          ?.startsWith(d)
      );
    }

    // -------------------------
    // Smart Date Sorting
    // -------------------------

    const today = new Date();

    today.setHours(
      0, 0, 0, 0
    );

    const tomorrow =
      new Date(today);

    tomorrow.setDate(
      today.getDate() + 1
    );

    // Auto mark overdue as urgent
    tasks = tasks.map(task => {

      if (!task.dueDate) {
        return task;
      }

      const due =
        new Date(task.dueDate);

      due.setHours(
        0, 0, 0, 0
      );

      const overdue =

        due < today &&

        task.status === STATUS.ACTIVE;

      return {

        ...task,

        priority:
          overdue
            ? PRIORITY.URGENT
            : task.priority,

        _overdue: overdue
      };
    });

    // Sorting
    tasks.sort((a, b) => {

      function getRank(task) {

        if (!task.dueDate) {
          return 999999;
        }

        const due =
          new Date(task.dueDate);

        due.setHours(
          0, 0, 0, 0
        );

        // overdue
        if (
          due < today &&
          task.status === STATUS.ACTIVE
        ) {
          return -1000;
        }

        // today
        if (
          due.getTime() ===
          today.getTime()
        ) {
          return 0;
        }

        // tomorrow
        if (
          due.getTime() ===
          tomorrow.getTime()
        ) {
          return 1;
        }

        // future
        return Math.floor(
          (
            due - today
          ) /
          (
            1000 *
            60 *
            60 *
            24
          )
        );
      }

      const rankA =
        getRank(a);

      const rankB =
        getRank(b);

      // Due order first
      if (rankA !== rankB) {
        return rankA - rankB;
      }

      // Priority order
      const weights = {

        urgent: 0,
        high: 1,
        medium: 2,
        basic: 3,
        low: 4,
      };

      const priorityA =
        weights[a.priority] ?? 999;

      const priorityB =
        weights[b.priority] ?? 999;

      if (
        priorityA !== priorityB
      ) {
        return (
          priorityA -
          priorityB
        );
      }

      // Latest created first
      return (

        new Date(
          b.createdAt ||
          b.created_at
        )

        -

        new Date(
          a.createdAt ||
          a.created_at
        )
      );
    });

    return tasks;
  },

  // --------------------------------------------------
  // Filters
  // --------------------------------------------------

  resetFilters() {

    this.set(
      'searchQuery',
      ''
    );

    this.set(
      'filterPriority',
      ''
    );

    this.set(
      'filterStatus',
      ''
    );

    this.set(
      'filterAssignee',
      null
    );

    this.set(
      'filterDate',
      null
    );
  },

  // --------------------------------------------------
  // Stats
  // --------------------------------------------------

  stats() {

    const all =
      this._data.tasks;

    return {

      total:
        all.length,

      active:
        all.filter(
          t =>
            t.status ===
            STATUS.ACTIVE
        ).length,

      completed:
        all.filter(
          t =>
            t.status ===
            STATUS.COMPLETED
        ).length,

      archived:
        all.filter(
          t =>
            t.status ===
            STATUS.ARCHIVED
        ).length,

      urgent:
        all.filter(
          t =>

            t.priority ===
            PRIORITY.URGENT

            &&

            t.status ===
            STATUS.ACTIVE
        ).length,
    };
  },
};