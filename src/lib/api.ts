export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = '/login';
    throw new Error('Missing token');
  }

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
    Authorization: `Bearer ${token}`,
  };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401 || res.status === 403) {
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  return res;
}
