let csrf = null;
async function refreshCsrf() {
  const r = await fetch("/api/auth/csrf", { credentials: "include" });
  if (!r.ok)
    throw new Error(
      "Cannot connect to the server. Start the backend and try again."
    );
  csrf = await r.json();
}
async function api(path, options = {}) {
  const method = options.method || "GET";
  if (method !== "GET" && !csrf) await refreshCsrf();
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  if (method !== "GET" && csrf) headers.set(csrf.headerName, csrf.token);
  const r = await fetch("/api" + path, {
    ...options,
    headers,
    credentials: "include"
  });
  if (!r.ok) {
    let msg = "Request failed. Please try again.";
    try {
      msg = (await r.json()).message || msg;
    } catch {
    }
    throw new Error(msg);
  }
  if (r.status === 204 || r.headers.get("content-length") === "0")
    return void 0;
  const text = await r.text();
  return text ? JSON.parse(text) : void 0;
}
const post = (path, body) => api(path, { method: "POST", body: JSON.stringify(body) });
async function upload(file) {
  if (!["image/jpeg", "image/png"].includes(file.type) || file.size > 5 * 1024 * 1024)
    throw new Error("Choose a JPG or PNG smaller than 5 MB.");
  const body = new FormData();
  body.append("file", file);
  return (await api("/admin/uploads", { method: "POST", body })).url;
}
async function uploadVideo(file) {
  if (!["video/mp4", "video/webm"].includes(file.type) || file.size > 30 * 1024 * 1024)
    throw new Error("Choose an MP4 or WebM video smaller than 30 MB.");
  const body = new FormData();
  body.append("file", file);
  return (await api("/admin/uploads/video", { method: "POST", body })).url;
}
async function uploadMany(files) {
  const selected = files.slice(0, 8);
  if (!selected.length) return [];
  for (const file of selected) {
    if (!["image/jpeg", "image/png"].includes(file.type) || file.size > 5 * 1024 * 1024)
      throw new Error("Each image must be JPG or PNG and smaller than 5 MB.");
  }
  return Promise.all(selected.map(upload));
}
export {
  api,
  post,
  refreshCsrf,
  upload,
  uploadMany,
  uploadVideo
};
