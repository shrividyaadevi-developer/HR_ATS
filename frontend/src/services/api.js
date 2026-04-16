// ─── Base config ────────────────────────────────────────────
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// ─── Token helpers ───────────────────────────────────────────
export const token = {
  get: () => localStorage.getItem("token"),
  set: (t) => localStorage.setItem("token", t),
  clear: () => localStorage.removeItem("token"),
};

// ─── Core fetch wrappers ──────────────────────────────────────
async function request(method, path, body = null, isFormData = false) {
  const headers = {};
  const tk = token.get();

  if (tk) headers["Authorization"] = `Bearer ${tk}`;
  if (!isFormData) headers["Content-Type"] = "application/json";

  const opts = { method, headers };
  if (body) {
    opts.body = isFormData ? body : JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, opts);
  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.detail || data?.message || `Request failed (${res.status})`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  return data;
}

// Improved Secure Download Helper
async function downloadFile(path, filename) {
  const tk = token.get();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: tk ? `Bearer ${tk}` : undefined,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Download failed (${res.status})`);
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  
  if (filename.toLowerCase().endsWith(".pdf")) {
    window.open(url, "_blank");
  } else {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename; 
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}

const get = (path) => request("GET", path);
const post = (path, body, form) => request("POST", path, body, form);
const put = (path, body) => request("PUT", path, body);
const patch = (path, body, form) => request("PATCH", path, body, form);
const del = (path) => request("DELETE", path);

// ─── API Modules ─────────────────────────────────────────────

export const auth = {
  // Candidate register (default user)
  registerCandidate: (data) =>
    post("/api/auth/register/candidate", data),

  // Admin register (one-time setup only)
  registerAdmin: (data) =>
    post("/api/auth/register/admin", data),

  // Optional fallback (so your previous code NEVER breaks)
  register: (data) =>
    post("/api/auth/register/candidate", data),

  login: (data) =>
    post("/api/auth/login", data),

  me: () =>
    get("/api/auth/me"),

  updateProfile: (data) =>
    patch("/api/auth/me/profile", data),

  changePassword: (data) =>
    patch("/api/auth/me/change-password", data),

  // Admin only
  createHR: (data) =>
    post("/api/auth/create-hr", data),

  listHR: () =>
    get("/api/auth/hr-users"),

  deactivate: (uuid) =>
    del(`/api/auth/deactivate/${uuid}`),

  deleteUser: (uuid) =>
    del(`/api/auth/delete/${uuid}`),
};

export const jobs = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/api/jobs/${q ? "?" + q : ""}`);
  },
  getOne: (id) => get(`/api/jobs/${id}`),
  search: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/api/jobs/search${q ? "?" + q : ""}`);
  },
  create: (data) => post("/api/jobs/", data),
  update: (id, data) => put(`/api/jobs/${id}`, data),
  remove: (id) => del(`/api/jobs/${id}`),
};

export const candidates = {
  apply: (formData) => post("/api/candidates/apply", formData, true),
  myApplications: () => get("/api/candidates/my-applications"),
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/api/candidates/${q ? "?" + q : ""}`);
  },
  getOne: (uuid) => get(`/api/candidates/${uuid}`),
  getResume: (uuid) => `${BASE_URL}/api/candidates/${uuid}/resume?token=${token.get()}`,
  analytics: () => get("/api/candidates/analytics/summary"),
  override: (uuid, data) => patch(`/api/candidates/${uuid}/override`, data),
  roundReject: (uuid, data) => patch(`/api/candidates/${uuid}/round-reject`, data),
  shortlist: (uuid) => patch(`/api/candidates/${uuid}/shortlist`),
  reject: (uuid) => patch(`/api/candidates/${uuid}/reject`),
};

export const interviews = {
  getAll: () => get("/api/interviews/"),
  create: (data) => post("/api/interviews/", data),
  reschedule: (id, data) => put(`/api/interviews/${id}`, data),
  remove: (id) => del(`/api/interviews/${id}`),
};

export const selected = {
  getAll: () => get("/api/selected/"),
  markAs: (candidateUuid, rounds_cleared = "1") =>
    post(`/api/selected/${candidateUuid}?rounds_cleared=${rounds_cleared}`),
  offerLetter: (selectedUuid, formData) => patch(`/api/selected/${selectedUuid}/offer-letter`, formData, true),
  remove: (selectedUuid) => del(`/api/selected/${selectedUuid}`),
};

export const reports = {
  getSummary: () => get("/api/candidates/analytics/summary"),
  // Strictly CSV export
  export: (type) => {
    const path = `/api/candidates/reports/export?report_type=${type}&format=csv`;
    return downloadFile(path, `report_${type}.csv`);
  },
};

export const downloadOfferLetter = (selectedId) => 
  downloadFile(`/api/selected/${selectedId}/offer-letter`, `OfferLetter_${selectedId}.pdf`);