/**
 * eventService.js
 * Live API call for the Event Simulator.
 * Route: POST /api/v1/events (publisher key)
 *
 * Body (GenericEventDto):
 *   eventId, sourceId, eventType, eventTimestamp, schemaVersion, payload
 */

import { apiFetch } from './apiClient.js';

/**
 * Dispatches a single event to the backend ingestion endpoint.
 * @param {{ eventId, sourceId, eventType, eventTimestamp, schemaVersion, payload }} eventDto
 * @returns {Promise<{ok, status, statusText, data, latencyMs}>}
 */
export async function dispatchLiveEvent(eventDto) {
  return apiFetch('publisher', '/v1/events', {
    method: 'POST',
    body: JSON.stringify(eventDto),
  });
}
