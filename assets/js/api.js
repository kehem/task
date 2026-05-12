const BASE_URL = 'https://task.kehem.com/api/v1'; // Replace with actual backend URL

async function request(method, path, body = null) {
  const token = localStorage.getItem('tf_access_token');
  const opts = {
    method,
    headers: { 
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const api = {
  // Tasks
  getTasks: ()            => request('GET',    '/tasks/'),
  getTask:  (id)          => request('GET',    `/tasks/${id}/`),
  createTask: (data)      => request('POST',   '/tasks/', data),
  updateTask: (id, data)  => request('PATCH',  `/tasks/${id}/`, data),
  deleteTask: (id)        => request('DELETE', `/tasks/${id}/`),
  completeTask: (id)      => request('POST',   `/tasks/${id}/complete/`),
  verifyTask:   (id)      => request('POST',   `/tasks/${id}/verify/`),
  archiveTask:  (id)      => request('POST',   `/tasks/${id}/archive/`),

  // Notes
  getNotes:   (taskId)       => request('GET',  `/tasks/${taskId}/notes/`),
  addNote:    (taskId, data) => request('POST', `/tasks/${taskId}/notes/`, data),

  // Auth
  login:  (creds) => request('POST', '/auth/login/', creds),
  logout: ()      => request('POST', '/auth/logout/'),
  me:     ()      => request('GET',  '/auth/me/'),

  // Onboarding
  setupOrg: (data) => request('POST', '/auth/onboarding/owner/', data),
  joinOrg:  (data) => request('POST', '/auth/onboarding/employee/', data),

  // Users/Employees
  getEmployees: () => request('GET', '/auth/employees/'),
};