const getToken = () => localStorage.getItem('token');

async function request(url, { method = 'GET', body, headers = {}, isFormData = false } = {}) {
  const token = getToken();
  const reqHeaders = { ...headers };

  if (token) reqHeaders['Authorization'] = `Bearer ${token}`;
  if (!isFormData) reqHeaders['Content-Type'] = 'application/json';

  const config = { method, headers: reqHeaders };
  if (body) config.body = isFormData ? body : JSON.stringify(body);

  const res = await fetch(url, config);
  const data = await res.json().catch(() => ({}));

  return { data, status: res.status, ok: res.ok, headers: res.headers };
}

export const http = {
  get:    (url, opts)  => request(url, { ...opts, method: 'GET' }),
  post:   (url, body, opts) => request(url, { ...opts, method: 'POST', body }),
  put:    (url, body, opts) => request(url, { ...opts, method: 'PUT', body }),
  patch:  (url, body, opts) => request(url, { ...opts, method: 'PATCH', body }),
  delete: (url, opts)  => request(url, { ...opts, method: 'DELETE' }),
  upload: (url, formData) => request(url, { method: 'POST', body: formData, isFormData: true }),
};
