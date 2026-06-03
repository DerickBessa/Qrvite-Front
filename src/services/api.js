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
  // Parties
  getParties:    ()          => request('/api/parties'),
  getPartyById:  (id)        => request(`/api/parties/${id}`),
  createParty:   (body)      => request('/api/parties', { method: 'POST', body: JSON.stringify(body) }),
  updateParty:   (id, body)  => request(`/api/parties/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteParty:   (id)        => request(`/api/parties/${id}`, { method: 'DELETE' }),
  getCheckins:   (id)        => request(`/api/parties/${id}/checkins`),
  // Vincular / desvincular convidado de festa
  addPartyGuest:    (partyId, personId) => request(`/api/parties/${partyId}/guests`, { method: 'POST', body: JSON.stringify({ personId }) }),
  removePartyGuest: (partyId, personId) => request(`/api/parties/${partyId}/guests/${personId}`, { method: 'DELETE' }),

  // Persons
  getPersons:    ()      => request('/api/persons'),
  getPersonById: (id)    => request(`/api/persons/${id}`),
  createPerson:  (body)  => request('/api/persons', { method: 'POST', body: JSON.stringify(body) }),
  deletePerson:  (id)    => request(`/api/persons/${id}`, { method: 'DELETE' }),
  checkin:       (id)    => request(`/api/persons/${id}/checkin`, { method: 'POST' }),
  getPdfUrl:     (id)    => `${BASE_URL}/api/persons/${id}/pdf`,

  // Families
  getFamilies:       ()             => request('/api/families'),
  getFamilyById:     (id)           => request(`/api/families/${id}`),
  createFamily:      (body)         => request('/api/families', { method: 'POST', body: JSON.stringify(body) }),
  deleteFamily:      (id)           => request(`/api/families/${id}`, { method: 'DELETE' }),
  addFamilyMember:   (id, personId) => request(`/api/families/${id}/members`, { method: 'POST', body: JSON.stringify({ personId }) }),
  removeFamilyMember:(id, personId) => request(`/api/families/${id}/members/${personId}`, { method: 'DELETE' }),
};