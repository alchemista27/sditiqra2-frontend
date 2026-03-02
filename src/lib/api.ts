// src/lib/api.ts - API client helper
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function fetcher<T>(path: string, options?: RequestInit): Promise<T> {
  const { headers: optHeaders, ...restOptions } = options ?? {};
  const res = await fetch(`${API_URL}${path}`, {
    ...restOptions,
    headers: { 'Content-Type': 'application/json', ...(optHeaders as Record<string, string>) },
  });
  const data = await res.json();
  if (!res.ok) throw new ApiError(data.message || 'Terjadi kesalahan.', res.status);
  return data;
}

// ─── AUTH ─────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    fetcher<{ data: { token: string; user: any } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: (token: string) =>
    fetcher<{ data: any }>('/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
};

// ─── CMS Posts ────────────────────────────────────────────────
export const postsApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<{ data: any[]; pagination: any }>(`/cms/posts${query}`);
  },
  getBySlug: (slug: string) =>
    fetcher<{ data: any }>(`/cms/posts/${slug}`),
  create: (token: string, formData: FormData) =>
    fetch(`${API_URL}/cms/posts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then(r => r.json()),
  update: (token: string, id: string, formData: FormData) =>
    fetch(`${API_URL}/cms/posts/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then(r => r.json()),
  remove: (token: string, id: string) =>
    fetcher(`/cms/posts/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
};

// PPDB (Academic Years)
export const academicYearsApi = {
  getActive: () => fetcher<{ data: any }>('/ppdb/academic-years/active'),
  getAll: (token: string) => fetcher<{ data: any[] }>('/ppdb/academic-years', { headers: { Authorization: `Bearer ${token}` }}),
  create: (token: string, data: any) => fetcher('/ppdb/academic-years', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }),
  update: (token: string, id: string, data: any) => fetcher(`/ppdb/academic-years/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }),
  setActive: (token: string, id: string) => fetcher(`/ppdb/academic-years/${id}/active`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }),
  delete: (token: string, id: string) => fetcher(`/ppdb/academic-years/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
};

// PPDB (Registrations)
export const registrationsApi = {
  getAll: (token: string, params?: any) => {
    const query = new URLSearchParams(params).toString();
    return fetcher<{ data: any[] }>(`/ppdb/registrations${query ? `?${query}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  getOne: (token: string, id: string) => 
    fetcher<{ data: any }>(`/ppdb/registrations/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
  updateStatus: (token: string, id: string, data: any) => 
    fetcher(`/ppdb/registrations/${id}/status`, { 
      method: 'PUT', 
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data) 
    }),
  // Submit pendaftaran baru tipe form data (tambah header user yang login jika dibutuhkan)
  submitForm: async (token: string, formData: FormData) => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`; // Jika required nanti
    
    const res = await fetch(`${API_URL}/ppdb/register`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal mengirim pendaftaran');
    return data;
  }
};

// ─── CMS Pages ────────────────────────────────────────────────
export const pagesApi = {
  getAll: () => fetcher<{ data: any[] }>('/cms/pages'),
  getBySlug: (slug: string) => fetcher<{ data: any }>(`/cms/pages/${slug}`),
  create: (token: string, body: object) =>
    fetcher('/cms/pages', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }),
  update: (token: string, id: string, body: object) =>
    fetcher(`/cms/pages/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }),
  remove: (token: string, id: string) =>
    fetcher(`/cms/pages/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
};

// ─── CMS Categories ──────────────────────────────────────────
export const categoriesApi = {
  getAll: () => fetcher<{ data: any[] }>('/cms/categories'),
  create: (token: string, body: object) =>
    fetcher('/cms/categories', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }),
  remove: (token: string, id: string) =>
    fetcher(`/cms/categories/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
};

// ─── KEHADIRAN (Attendance) ──────────────────────────────────
export const attendanceApi = {
  // Pegawai / Guru
  clockIn: (token: string) => fetcher('/attendance/clock-in', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
  clockOut: (token: string) => fetcher('/attendance/clock-out', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
  getMyLogs: (token: string, month: number, year: number) => fetcher<{ data: unknown[] }>(`/attendance/my-logs?month=${month}&year=${year}`, { headers: { Authorization: `Bearer ${token}` } }),

  // Admin
  getTodayLogs: (token: string) => fetcher<{ data: unknown[] }>('/attendance/logs/today', { headers: { Authorization: `Bearer ${token}` } }),
  getAllEmployees: (token: string) => fetcher<{ data: unknown[] }>('/attendance/employees', { headers: { Authorization: `Bearer ${token}` } }),
};

// ─── SITE SETTINGS ───────────────────────────────────────────
export const settingsApi = {
  // Publik — frontend baca untuk render header/homepage
  getAll: () => fetcher<{ data: Record<string, string> }>('/cms/settings'),
  getOne: (key: string) => fetcher<{ data: { key: string; value: string } }>(`/cms/settings/${key}`),

  // Admin — batch update semua settings sekaligus
  updateMany: (token: string, body: Record<string, string>) =>
    fetcher('/cms/settings', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }),

  // Admin — upload logo / favicon (multipart)
  uploadLogo: (token: string, file: File) => {
    const fd = new FormData();
    fd.append('logo', file);
    return fetch(`${API_URL}/cms/settings/upload-logo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    }).then(r => r.json());
  },

  uploadFavicon: (token: string, file: File) => {
    const fd = new FormData();
    fd.append('favicon', file);
    return fetch(`${API_URL}/cms/settings/upload-favicon`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    }).then(r => r.json());
  },
};

// ─── MENU NAVIGASI ───────────────────────────────────────────
export interface MenuItem {
  id: string;
  label: string;
  url: string;
  order: number;
  isActive: boolean;
  openInNewTab: boolean;
}

export const menuApi = {
  // Publik — navbar baca menu aktif (digunakan di layout.tsx SSR)
  getAll: () => fetcher<{ data: MenuItem[] }>('/cms/menu'),

  // Admin CRUD + reorder
  create: (token: string, body: Partial<MenuItem>) =>
    fetcher<{ data: MenuItem }>('/cms/menu', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }),

  update: (token: string, id: string, body: Partial<MenuItem>) =>
    fetcher<{ data: MenuItem }>(`/cms/menu/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }),

  remove: (token: string, id: string) =>
    fetcher(`/cms/menu/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Simpan urutan baru setelah drag-and-drop
  reorder: (token: string, items: { id: string; order: number }[]) =>
    fetcher('/cms/menu/reorder', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items }),
    }),
};
