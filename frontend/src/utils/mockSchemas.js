// Mock Schemas matching backend EventSchema.java & Draft-7 NetworkNT validator
export const DEFAULT_SCHEMA_TEMPLATE = JSON.stringify(
  {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "CustomEventPayload",
    "type": "object",
    "properties": {
      "metricId": {
        "type": "string"
      },
      "value": {
        "type": "number",
        "minimum": 0
      },
      "status": {
        "type": "string",
        "enum": ["SUCCESS", "FAILED"]
      }
    },
    "required": ["metricId", "value"],
    "additionalProperties": false
  },
  null,
  2
);

export const initialMockSchemas = [
  {
    id: 1,
    eventType: 'USER_LOGIN',
    schemaVersion: 1,
    status: 'Active',
    standard: 'Draft-7',
    updatedAt: '2026-10-22 18:30 UTC',
    description: 'User authentication & session token initialization event contract for SAC access gateway.',
    jsonSchemaDefinition: JSON.stringify(
      {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "UserLoginEventPayload",
        "type": "object",
        "properties": {
          "userId": {
            "type": "string",
            "minLength": 3
          },
          "ipAddress": {
            "type": "string"
          },
          "status": {
            "type": "string",
            "enum": ["SUCCESS", "FAILED", "BLOCKED"]
          },
          "authMethod": {
            "type": "string",
            "enum": ["PASSWORD", "OAUTH2_SSO", "MFA_TOKEN", "BIOMETRIC"]
          },
          "deviceType": {
            "type": "string"
          }
        },
        "required": ["userId", "status", "authMethod"],
        "additionalProperties": true
      },
      null,
      2
    ),
    samplePayload: JSON.stringify(
      {
        "userId": "usr_8192",
        "ipAddress": "192.168.1.105",
        "status": "SUCCESS",
        "authMethod": "PASSWORD",
        "deviceType": "CHROME_MAC"
      },
      null,
      2
    )
  },
  {
    id: 2,
    eventType: 'DOWNLOAD_COMPLETED',
    schemaVersion: 1,
    status: 'Active',
    standard: 'Draft-7',
    updatedAt: '2026-10-22 19:15 UTC',
    description: 'File transmission telemetry event contract requiring bytesTransferred for SQL aggregation.',
    jsonSchemaDefinition: JSON.stringify(
      {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "DownloadCompletedEventPayload",
        "type": "object",
        "properties": {
          "userId": {
            "type": "string"
          },
          "fileName": {
            "type": "string"
          },
          "bytesTransferred": {
            "type": "number",
            "minimum": 0
          },
          "downloadSpeedMbps": {
            "type": "number"
          },
          "completionStatus": {
            "type": "string",
            "enum": ["SUCCESS", "FAILED", "ABORTED"]
          }
        },
        "required": ["userId", "bytesTransferred"],
        "additionalProperties": true
      },
      null,
      2
    ),
    samplePayload: JSON.stringify(
      {
        "userId": "usr_9011",
        "fileName": "lecture-notes-db.pdf",
        "bytesTransferred": 4518290,
        "downloadSpeedMbps": 84.5,
        "completionStatus": "SUCCESS"
      },
      null,
      2
    )
  },
  {
    id: 3,
    eventType: 'FILE_UPLOAD_START',
    schemaVersion: 1,
    status: 'Active',
    standard: 'Draft-7',
    updatedAt: '2026-10-23 08:00 UTC',
    description: 'Inbound multi-part file upload stream allocation contract.',
    jsonSchemaDefinition: JSON.stringify(
      {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "FileUploadStartEventPayload",
        "type": "object",
        "properties": {
          "userId": {
            "type": "string"
          },
          "fileSize": {
            "type": "number",
            "minimum": 1
          },
          "mimeType": {
            "type": "string"
          },
          "uploadId": {
            "type": "string"
          }
        },
        "required": ["userId", "fileSize", "uploadId"],
        "additionalProperties": false
      },
      null,
      2
    ),
    samplePayload: JSON.stringify(
      {
        "userId": "usr_3112",
        "fileSize": 84900000,
        "mimeType": "application/octet-stream",
        "uploadId": "upl_zone_771"
      },
      null,
      2
    )
  }
];
