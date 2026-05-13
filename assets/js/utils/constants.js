// Constants.js
export const PRIORITY = {
  URGENT: 'urgent',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  BASIC: 'basic',
};

export const STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
};

export const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', color: 'priority-urgent', dot: '#ef4444' },
  high:   { label: 'High',   color: 'priority-high',   dot: '#f97316' },
  medium: { label: 'Medium', color: 'priority-medium',  dot: '#eab308' },
  low:    { label: 'Low',    color: 'priority-low',    dot: '#22c55e' },
  basic:  { label: 'Basic',  color: 'priority-basic',  dot: '#94a3b8' },
};

export const NAV_ITEMS = [
  { id: 'dashboard',  icon: 'grid',         label: 'Dashboard' },
  { id: 'tasks',      icon: 'check-square', label: 'Active Tasks' },
  { id: 'completed',  icon: 'check-circle', label: 'Completed' },
  { id: 'archive',    icon: 'archive',       label: 'Archive' },
  { id: 'employees',  icon: 'human-head',   label: 'Employees' },  // ← ADD THIS
  { id: 'reports',    icon: 'chart-bar',     label: 'Reports' },
  { id: 'settings',   icon: 'settings',      label: 'Settings' },
];

// Google Identity Services Client ID (replace with yours)
export const GOOGLE_CLIENT_ID = '693608416981-k6ghrq8av5t133c070tpuvp10tbf2eeu.apps.googleusercontent.com';