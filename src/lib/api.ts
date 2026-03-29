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
    fetcher<{ data: { token: string; user: Record<string, unknown> } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: (token: string) =>
    fetcher<{ data: any }>('/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
  changePassword: (token: string, oldPassword: string, newPassword: string) =>
    fetcher<{ message: string; data?: { requireRelogin?: boolean } }>('/auth/change-password', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ oldPassword, newPassword }),
    }),
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

// ─── PPDB TAHUN AJARAN ────────────────────────────────────────
export const academicYearsApi = {
  getActive: () => fetcher<{ data: any }>('/ppdb/academic-years/active'),
  getAll: (token: string) => fetcher<{ data: any[] }>('/ppdb/academic-years', { headers: { Authorization: `Bearer ${token}` } }),
  create: (token: string, data: any) => fetcher('/ppdb/academic-years', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }),
  update: (token: string, id: string, data: any) => fetcher(`/ppdb/academic-years/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }),
  setActive: (token: string, id: string) => fetcher(`/ppdb/academic-years/${id}/active`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }),
  delete: (token: string, id: string) => fetcher(`/ppdb/academic-years/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
  purge: (token: string, id: string) => fetcher(`/ppdb/academic-years/${id}/purge`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
};

// ─── PPDB PORTAL ORANG TUA ────────────────────────────────────
export const ppdbParentApi = {
  register: (data: { name: string; email: string; phone: string; password: string }) =>
    fetcher<{ data: { token: string; user: any } }>('/auth/register-parent', {
      method: 'POST', body: JSON.stringify(data),
    }),
  login: (email: string, password: string) =>
    fetcher<{ data: { token: string; user: any } }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    }),
  me: (token: string) =>
    fetcher<{ data: any }>('/auth/me', { headers: { Authorization: `Bearer ${token}` } }),

  start: (token: string) =>
    fetcher<{ data: any }>('/ppdb/start', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
  getMyRegistration: (token: string) =>
    fetcher<{ data: any }>('/ppdb/my-registration', { headers: { Authorization: `Bearer ${token}` } }),
  getMyResult: (token: string) =>
    fetcher<{ data: any }>('/ppdb/my-result', { headers: { Authorization: `Bearer ${token}` } }),

  uploadPayment: (token: string, file: File, note?: string) => {
    const fd = new FormData();
    fd.append('file', file);
    if (note) fd.append('note', note);
    return fetch(`${API_URL}/ppdb/payment/upload`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
    }).then(r => r.json());
  },

  saveStudentForm: (token: string, data: any) =>
    fetcher('/ppdb/form/student', { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }),
  saveParentForm: (token: string, data: any) =>
    fetcher('/ppdb/form/parent-info', { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }),
  uploadDocuments: (token: string, files: Record<string, File>) => {
    const fd = new FormData();
    Object.entries(files).forEach(([key, file]) => fd.append(key, file));
    return fetch(`${API_URL}/ppdb/form/documents`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
    }).then(r => r.json());
  },
  submitForm: (token: string) =>
    fetcher('/ppdb/form/submit', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),

  downloadReferralLetter: (token: string) =>
    fetch(`${API_URL}/ppdb/referral-letter`, { headers: { Authorization: `Bearer ${token}` } }),
  uploadClinicCert: (token: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return fetch(`${API_URL}/ppdb/clinic-cert/upload`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
    }).then(r => r.json());
  },

  getAvailableSlots: (token: string) =>
    fetcher<{ data: any[] }>('/ppdb/observation-slots', { headers: { Authorization: `Bearer ${token}` } }),
  bookSlot: (token: string, slotId: string) =>
    fetcher('/ppdb/observation-slots/book', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ slotId }) }),
};

// ─── PPDB ADMIN ───────────────────────────────────────────────
export const ppdbAdminApi = {
  getStats: (token: string) =>
    fetcher<{ data: any }>('/ppdb/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),

  getAll: (token: string, params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<{ data: { data: any[]; pagination: any } }>(`/ppdb/admin/registrations${q}`, { headers: { Authorization: `Bearer ${token}` } });
  },
  getDetail: (token: string, id: string) =>
    fetcher<{ data: any }>(`/ppdb/admin/registrations/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
  reviewRegistration: (token: string, id: string, data: { result: string; note?: string }) =>
    fetcher(`/ppdb/admin/registrations/${id}/review`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }),
  recordObservationResult: (token: string, id: string, data: { result: string; note?: string }) =>
    fetcher(`/ppdb/admin/registrations/${id}/observation`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }),
  assignClassroom: (token: string, id: string, classroomId: string) =>
    fetcher(`/ppdb/admin/registrations/${id}/assign-class`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ classroomId }) }),

  getPendingPayments: (token: string) =>
    fetcher<{ data: any[] }>('/ppdb/admin/payments', { headers: { Authorization: `Bearer ${token}` } }),
  verifyPayment: (token: string, id: string, opts: { approved: boolean; note?: string }) =>
    opts.approved
      ? fetcher(`/ppdb/admin/payments/${id}/verify`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } })
      : fetcher(`/ppdb/admin/payments/${id}/reject`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ reason: opts.note }) }),
  rejectPayment: (token: string, id: string, reason: string) =>
    fetcher(`/ppdb/admin/payments/${id}/reject`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ reason }) }),

  getObservationSlots: (token: string) =>
    fetcher<{ data: any[] }>('/ppdb/admin/observation-slots', { headers: { Authorization: `Bearer ${token}` } }),
  createObservationSlot: (token: string, data: any) =>
    fetcher('/ppdb/admin/observation-slots', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }),
  updateObservationSlot: (token: string, id: string, data: any) =>
    fetcher(`/ppdb/admin/observation-slots/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }),
  deleteObservationSlot: (token: string, id: string) =>
    fetcher(`/ppdb/admin/observation-slots/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),

  getClassrooms: (token: string) =>
    fetcher<{ data: any[] }>('/ppdb/admin/classrooms', { headers: { Authorization: `Bearer ${token}` } }),
  createClassroom: (token: string, data: any) =>
    fetcher('/ppdb/admin/classrooms', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }),
  updateClassroom: (token: string, id: string, data: any) =>
    fetcher(`/ppdb/admin/classrooms/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }),
  deleteClassroom: (token: string, id: string) =>
    fetcher(`/ppdb/admin/classrooms/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
  downloadClassRosterPdf: (token: string, id: string) =>
    fetch(`${API_URL}/ppdb/admin/classrooms/${id}/pdf`, { headers: { Authorization: `Bearer ${token}` } }),

  // Pengaturan PPDB (rekening bank)
  getPpdbSettings: () =>
    fetcher<{ data: Record<string, string> }>('/ppdb/settings'),
  updatePpdbSettings: (token: string, data: Record<string, string>) =>
    fetcher<{ data: Record<string, string> }>('/ppdb/admin/settings', { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }),
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

// ─── KEHADIRAN (Attendance) — Enhanced GPS ───────────────────
export const attendanceApi = {
  // Config
  getConfig: (token: string) => fetcher<{ data: any }>('/attendance/config', { headers: { Authorization: `Bearer ${token}` } }),
  updateConfig: (token: string, data: any) => fetcher('/attendance/config', { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }),

  // Clock In/Out (GPS-based)
  uploadSelfie: (token: string, file: File) => {
    const fd = new FormData();
    fd.append('selfie', file);
    return fetch(`${API_URL}/attendance/upload-selfie`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    }).then(r => r.json());
  },
  clockIn: (token: string, gpsData?: { latitude: number; longitude: number; isMockGps?: boolean; faceConfidence?: number; selfieUrl?: string }) =>
    fetcher('/attendance/clock-in', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(gpsData || {}) }),
  clockOut: (token: string, gpsData?: { latitude: number; longitude: number; isMockGps?: boolean; selfieUrl?: string }) =>
    fetcher('/attendance/clock-out', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(gpsData || {}) }),

  // Logs
  getMyLogs: (token: string, month: number, year: number) => fetcher<{ data: unknown[] }>(`/attendance/my-logs?month=${month}&year=${year}`, { headers: { Authorization: `Bearer ${token}` } }),
  getMyStatus: (token: string) => fetcher<{ data: any }>('/attendance/my-status', { headers: { Authorization: `Bearer ${token}` } }),
  getTodayLogs: (token: string) => fetcher<{ data: { logs: any[]; stats: any } }>('/attendance/logs/today', { headers: { Authorization: `Bearer ${token}` } }),
  getAllLogs: (token: string, params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<{ data: { logs: any[]; pagination: any } }>(`/attendance/logs${q}`, { headers: { Authorization: `Bearer ${token}` } });
  },
  getAnomalyLogs: (token: string, params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<{ data: { logs: any[]; pagination: any } }>(`/attendance/logs/anomalies${q}`, { headers: { Authorization: `Bearer ${token}` } });
  },
  getAllEmployees: (token: string) => fetcher<{ data: unknown[] }>('/attendance/employees', { headers: { Authorization: `Bearer ${token}` } }),
};

// ─── HARI LIBUR ──────────────────────────────────────────────
export const holidayApi = {
  getAll: (token: string, params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<{ data: any[] }>(`/holidays${q}`, { headers: { Authorization: `Bearer ${token}` } });
  },
  create: (token: string, data: any) => fetcher('/holidays', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }),
  update: (token: string, id: string, data: any) => fetcher(`/holidays/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }),
  remove: (token: string, id: string) => fetcher(`/holidays/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
  checkDate: (token: string, date: string) => fetcher<{ data: any }>(`/holidays/check/${date}`, { headers: { Authorization: `Bearer ${token}` } }),
  seedNational: (token: string, year: string) => fetcher(`/holidays/seed-national/${year}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
};

// ─── PENGAJUAN IZIN ──────────────────────────────────────────
export const leaveApi = {
  create: (token: string, data: any) => fetcher('/leaves', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }),
  getMyRequests: (token: string, params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<{ data: { requests: any[]; pagination: any } }>(`/leaves/my-requests${q}`, { headers: { Authorization: `Bearer ${token}` } });
  },
  getAll: (token: string, params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<{ data: { requests: any[]; pagination: any } }>(`/leaves${q}`, { headers: { Authorization: `Bearer ${token}` } });
  },
  getById: (token: string, id: string) => fetcher<{ data: any }>(`/leaves/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
  approve: (token: string, id: string, note?: string) => fetcher(`/leaves/${id}/approve`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ approverNote: note }) }),
  reject: (token: string, id: string, note?: string) => fetcher(`/leaves/${id}/reject`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ approverNote: note }) }),
};

// ─── LAPORAN ─────────────────────────────────────────────────
const API_URL_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export const reportApi = {
  getSummary: (token: string, month: number, year: number) =>
    fetcher<{ data: any }>(`/reports/attendance/summary?month=${month}&year=${year}`, { headers: { Authorization: `Bearer ${token}` } }),
  downloadExcelUrl: (month: number, year: number) =>
    `${API_URL_BASE}/reports/attendance/excel?month=${month}&year=${year}`,
};

// ─── SITE SETTINGS ───────────────────────────────────────────
export const settingsApi = {
  getAll: () => fetcher<{ data: Record<string, string> }>('/cms/settings'),
  getOne: (key: string) => fetcher<{ data: { key: string; value: string } }>(`/cms/settings/${key}`),
  updateMany: (token: string, body: Record<string, string>) =>
    fetcher('/cms/settings', { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }),
  uploadLogo: (token: string, file: File) => {
    const fd = new FormData();
    fd.append('logo', file);
    return fetch(`${API_URL}/cms/settings/upload-logo`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd }).then(r => r.json());
  },
  uploadFavicon: (token: string, file: File) => {
    const fd = new FormData();
    fd.append('favicon', file);
    return fetch(`${API_URL}/cms/settings/upload-favicon`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd }).then(r => r.json());
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
  parentId: string | null;
  children?: MenuItem[];
}

export const menuApi = {
  getAll: () => fetcher<{ data: MenuItem[] }>('/cms/menu'),
  create: (token: string, body: Partial<MenuItem>) =>
    fetcher<{ data: MenuItem }>('/cms/menu', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }),
  update: (token: string, id: string, body: Partial<MenuItem>) =>
    fetcher<{ data: MenuItem }>(`/cms/menu/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }),
  remove: (token: string, id: string) =>
    fetcher(`/cms/menu/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
  reorder: (token: string, items: { id: string; order: number }[]) =>
    fetcher('/cms/menu/reorder', { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ items }) }),
};

// ─── GALLERY ─────────────────────────────────────────────────
export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  cloudinaryId?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export const galleryApi = {
  getAll: () => fetcher<{ data: GalleryItem[] }>('/cms/gallery'),
  create: (token: string, formData: FormData) =>
    fetch(`${API_URL}/cms/gallery`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then(r => r.json()),
  update: (token: string, id: string, formData: FormData) =>
    fetch(`${API_URL}/cms/gallery/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then(r => r.json()),
  reorder: (token: string, items: { id: string; order: number }[]) =>
    fetcher('/cms/gallery/reorder', { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ items }) }),
  remove: (token: string, id: string) =>
    fetcher(`/cms/gallery/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
};

// ─── MEDIA LIBRARY (Cloudinary) ──────────────────────────────
export interface CloudinaryMedia {
  publicId: string;
  url: string;
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  createdAt: string;
  folder?: string;
  displayName?: string;
}

export const mediaApi = {
  getAll: (token: string, params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetcher<{ data: CloudinaryMedia[]; nextCursor?: string; totalCount?: number }>(`/cms/media${q}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  getFolders: (token: string) =>
    fetcher<{ data: Array<{ name: string; path: string }> }>('/cms/media/folders', {
      headers: { Authorization: `Bearer ${token}` },
    }),
  upload: (token: string, file: File, folder?: string) => {
    const fd = new FormData();
    fd.append('file', file);
    if (folder) fd.append('folder', folder);
    return fetch(`${API_URL}/cms/media`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    }).then(r => r.json());
  },
  remove: (token: string, publicId: string) =>
    fetcher(`/cms/media?id=${encodeURIComponent(publicId)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),
};

// ─── INSTAGRAM AUTO-POST (Make.com) ────────────────────────────
export const instagramApi = {
  testConnection: (token: string) =>
    fetcher<{ data: { connected: boolean } }>('/cms/settings/instagram/test', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }),
};

