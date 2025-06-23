import type { Recuerdo } from './fileStorage';

const jsonHeaders = { 'Content-Type': 'application/json' };

const getCurrentUser = (): string => {
  if (typeof window !== 'undefined') return localStorage.getItem('sebyhun-current-user') || 'anonymous';
  return 'anonymous';
};

export const recuerdosApi = {
  async getAll(): Promise<Recuerdo[]> {
    const userId = getCurrentUser();
    const res = await fetch(`/api/recuerdos?userId=${userId}`);
    const data = await res.json();
    return data.recuerdos;
  },
  async create(rec: Omit<Recuerdo, 'id'|'fechaCreacion'|'fechaActualizacion'>): Promise<Recuerdo> {
    const userId = getCurrentUser();
    const res = await fetch('/api/recuerdos', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ ...rec, userId })
    });
    const data = await res.json();
    return data.recuerdo;
  },
  async update(id: number, rec: Partial<Recuerdo>): Promise<Recuerdo> {
    const userId = getCurrentUser();
    const res = await fetch(`/api/recuerdos/${id}`, {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify({ ...rec, userId })
    });
    const data = await res.json();
    return data.recuerdo;
  },
  async delete(id: number): Promise<void> {
    const userId = getCurrentUser();
    await fetch(`/api/recuerdos/${id}?userId=${userId}`, { method: 'DELETE' });
  }
};
