/**
 * configService.js
 * Manages backend connection settings stored in localStorage.
 * No secrets are hardcoded or defaulted here — the user configures them in Settings.
 */

const KEYS = {
  BASE_URL: 'sae_base_url',
  ADMIN_KEY: 'sae_admin_api_key',
  PUBLISHER_KEY: 'sae_publisher_api_key',
};

export function getBaseUrl() {
  return localStorage.getItem(KEYS.BASE_URL) || '/api';
}

export function setBaseUrl(url) {
  localStorage.setItem(KEYS.BASE_URL, url.trim());
}

export function getAdminApiKey() {
  return localStorage.getItem(KEYS.ADMIN_KEY) || '';
}

export function setAdminApiKey(key) {
  localStorage.setItem(KEYS.ADMIN_KEY, key);
}

export function getPublisherApiKey() {
  return localStorage.getItem(KEYS.PUBLISHER_KEY) || '';
}

export function setPublisherApiKey(key) {
  localStorage.setItem(KEYS.PUBLISHER_KEY, key);
}

export function clearAllSettings() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}
