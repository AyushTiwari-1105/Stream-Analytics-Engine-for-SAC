/**
 * schemaService.js
 * Live API calls for the Schema Registry.
 * Routes: GET /api/v1/admin/schemas  (admin key)
 *         POST /api/v1/admin/schemas (admin key)
 */

import { apiFetch } from './apiClient.js';

/**
 * Fetches all registered schemas from the backend.
 * @returns {Promise<{ok, status, statusText, data, latencyMs}>}
 */
export async function fetchLiveSchemas() {
  return apiFetch('admin', '/v1/admin/schemas', { method: 'GET' });
}

/**
 * Registers a new schema in the backend.
 * @param {{ eventType: string, schemaVersion: number, jsonSchemaDefinition: string }} schema
 * @returns {Promise<{ok, status, statusText, data, latencyMs}>}
 */
export async function registerLiveSchema(schema) {
  return apiFetch('admin', '/v1/admin/schemas', {
    method: 'POST',
    body: JSON.stringify({
      eventType: schema.eventType,
      schemaVersion: schema.schemaVersion,
      jsonSchemaDefinition: schema.jsonSchemaDefinition,
    }),
  });
}
