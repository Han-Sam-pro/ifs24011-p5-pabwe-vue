const TOKEN_KEY = 'delcom_access_token';

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function putAccessToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

/**
 * Wrapper fetch ke REST API Delcom.
 * Mengembalikan body JSON apa adanya (berisi field `status` dan `message`).
 */
export async function apiRequest(path, { method = 'GET', query, body, isForm = false } = {}) {
  const headers = { Accept: 'application/json' };
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let payload;
  if (body !== undefined) {
    if (isForm) {
      payload = body;
    } else {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }
  }

  const response = await fetch(`${DELCOM_BASEURL}${path}${buildQuery(query)}`, {
    method,
    headers,
    body: payload,
  });

  const json = await response.json().catch(() => ({ status: 'error', message: response.statusText }));
  return json;
}
