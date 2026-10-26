/**
 * apiClient.js
 * Thin HTTP fetch wrapper.
 * - Injects X-API-Key header from configService (never hardcoded).
 * - Parses JSON bodies and surfaces real HTTP status codes.
 * - Returns { ok, status, statusText, data, latencyMs } uniformly.
 */

import { getBaseUrl, getAdminApiKey, getPublisherApiKey } from './configService.js';

const TIMEOUT_MS = 10_000;

/**
 * @param {'admin'|'publisher'} role  Which API key to send.
 * @param {string} path              Path relative to baseUrl, e.g. '/v1/admin/schemas'.
 * @param {object} [options]         Fetch options (method, body, etc.).
 */
export async function apiFetch(role, path, options = {}) {
  const apiKey = role === 'admin' ? getAdminApiKey() : getPublisherApiKey();
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api${path.startsWith('/') ? path : `/${path}`}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(apiKey ? { 'X-API-Key': apiKey } : {}),
    ...(options.headers || {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const t0 = performance.now();
  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    const isTimeout = err.name === 'AbortError';
    return {
      ok: false,
      status: isTimeout ? 408 : 0,
      statusText: isTimeout ? 'Request Timeout' : 'Network Error',
      data: { error: isTimeout ? 'Request timed out' : err.message },
      latencyMs: Math.round(performance.now() - t0),
    };
  }
  clearTimeout(timeoutId);
  const latencyMs = Math.round(performance.now() - t0);

  // Attempt to parse JSON; fall back to plain text.
  let data;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = { error: 'Unexpected non-JSON response from server' };
    }
  } else {
    const text = await response.text();
    // If the backend returned a plain-text success string, wrap it.
    data = response.ok ? { message: text } : { error: text };
  }

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    data,
    latencyMs,
  };
}
