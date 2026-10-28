const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api").replace(/\/$/, "");

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { Accept: "application/json", ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers },
    });
  } catch {
    throw new Error("Can't reach the ScamShield backend. Check that the API is running and try again.");
  }

  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try {
      const body = await response.json();
      message = body.message || body.detail || message;
    } catch {
      // Keep the HTTP status message when the server did not return JSON.
    }
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  health: () => request("/health"),
  analyze: (text) => request("/scans/analyze", { method: "POST", body: JSON.stringify({ text }) }),
  saveScan: (text) => request("/scans", { method: "POST", body: JSON.stringify({ text }) }),
  scans: ({ page = 0, size = 10, riskLevel, search } = {}) => {
    const params = new URLSearchParams({ page: String(page), size: String(size), sort: "createdAt,desc" });
    if (riskLevel) params.set("riskLevel", riskLevel);
    if (search) params.set("search", search);
    return request(`/scans?${params}`);
  },
  scan: (id) => request(`/scans/${id}`),
  deleteScan: (id) => request(`/scans/${id}`, { method: "DELETE" }),
  stats: () => request("/dashboard/stats"),
  trends: () => request("/dashboard/trends"),
};

export { API_BASE_URL };
