const BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(path, opts = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Erro desconhecido');
  return data;
}

export const api = {
  // Persons
  getPersons:     ()     => request('/api/persons'),
  getPersonById:  (id)   => request(`/api/persons/${id}`),
  createPerson:   (body) => request('/api/persons', { method: 'POST', body: JSON.stringify(body) }),
  deletePerson:   (id)   => request(`/api/persons/${id}`, { method: 'DELETE' }),
  checkin:        (id)   => request(`/api/persons/${id}/checkin`, { method: 'POST' }),
  getPdfUrl:      (id)   => `${BASE_URL}/api/persons/${id}/pdf`,

  // Families
  getFamilies:   ()     => request('/api/families'),
  createFamily:  (body) => request('/api/families', { method: 'POST', body: JSON.stringify(body) }),
  deleteFamily:  (id)   => request(`/api/families/${id}`, { method: 'DELETE' }),
};