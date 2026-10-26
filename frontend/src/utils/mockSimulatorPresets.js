// Simulator templates and generator helpers matching GenericEventDto.java

export function generateEventId() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `evt-sac-${rand}`;
}

export function getCurrentIsoTimestamp() {
  return new Date().toISOString();
}

export const simulatorTemplates = {
  USER_LOGIN: {
    name: 'USER_LOGIN (Valid)',
    eventType: 'USER_LOGIN',
    sourceId: 'sac-auth-gateway-01',
    schemaVersion: 1,
    payload: {
      userId: 'usr_8192',
      ipAddress: '192.168.1.105',
      status: 'SUCCESS',
      authMethod: 'PASSWORD',
      deviceType: 'CHROME_MAC'
    }
  },
  DOWNLOAD_COMPLETED: {
    name: 'DOWNLOAD_COMPLETED (Valid)',
    eventType: 'DOWNLOAD_COMPLETED',
    sourceId: 'sac-fileserver-node-01',
    schemaVersion: 1,
    payload: {
      userId: 'usr_9011',
      fileName: 'distributed-systems-lab.pdf',
      bytesTransferred: 14857600,
      downloadSpeedMbps: 84.2,
      completionStatus: 'SUCCESS'
    }
  },
  FILE_UPLOAD_START: {
    name: 'FILE_UPLOAD_START (Valid)',
    eventType: 'FILE_UPLOAD_START',
    sourceId: 'sac-storage-gateway-01',
    schemaVersion: 1,
    payload: {
      userId: 'usr_3112',
      fileSize: 48920000,
      mimeType: 'application/zip',
      uploadId: 'upl_zone_882'
    }
  },
  INVALID_PAYLOAD: {
    name: 'INVALID_PAYLOAD (Simulate 400 Bad Request)',
    eventType: 'DOWNLOAD_COMPLETED',
    sourceId: 'sac-fileserver-node-02',
    schemaVersion: 1,
    payload: {
      fileName: 'corrupted-transfer.iso',
      bytesTransferred: -5000, // Invalid: negative number
      // Missing required "userId"
      status: 'UNKNOWN'
    }
  }
};

// Validate simulated event against known schema rules
export function evaluateMockValidation(eventDto) {
  const { eventType, schemaVersion, payload } = eventDto;
  const errors = [];

  if (!eventType) errors.push('eventType is required');
  if (!eventDto.eventId) errors.push('eventId is required');
  if (!eventDto.sourceId) errors.push('sourceId is required');
  if (!eventDto.eventTimestamp) errors.push('eventTimestamp is required');
  if (!schemaVersion) errors.push('schemaVersion is required');

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      statusCode: 400,
      status: 'BAD_REQUEST',
      error: 'Payload validation failed',
      details: ['payload must be a valid JSON object']
    };
  }

  // Schema rule evaluation matching backend
  if (eventType === 'USER_LOGIN') {
    if (!payload.userId) errors.push('$.userId: required property missing');
    if (!payload.status) errors.push('$.status: required property missing');
    if (!payload.authMethod) errors.push('$.authMethod: required property missing');
  } else if (eventType === 'DOWNLOAD_COMPLETED') {
    if (!payload.userId) errors.push('$.userId: required property missing');
    if (payload.bytesTransferred === undefined || payload.bytesTransferred === null) {
      errors.push('$.bytesTransferred: required property missing');
    } else if (typeof payload.bytesTransferred !== 'number') {
      errors.push('$.bytesTransferred: must be of type number');
    } else if (payload.bytesTransferred < 0) {
      errors.push('$.bytesTransferred: must have a minimum value of 0');
    }
  } else if (eventType === 'FILE_UPLOAD_START') {
    if (!payload.userId) errors.push('$.userId: required property missing');
    if (!payload.fileSize) errors.push('$.fileSize: required property missing');
    if (!payload.uploadId) errors.push('$.uploadId: required property missing');
  }

  if (errors.length > 0) {
    return {
      statusCode: 400,
      status: 'BAD_REQUEST',
      error: 'Payload validation failed',
      details: errors
    };
  }

  return {
    statusCode: 202,
    status: 'ACCEPTED',
    message: 'Event accepted and stored successfully'
  };
}

// Generate a random valid event for continuous stream generation
export function createRandomStreamEvent() {
  const types = ['DOWNLOAD_COMPLETED', 'USER_LOGIN', 'DOWNLOAD_COMPLETED', 'FILE_UPLOAD_START'];
  const chosenType = types[Math.floor(Math.random() * types.length)];
  const userNum = Math.floor(1000 + Math.random() * 9000);
  const now = new Date();

  if (chosenType === 'USER_LOGIN') {
    const methods = ['PASSWORD', 'OAUTH2_SSO', 'MFA_TOKEN'];
    const devices = ['CHROME_MAC', 'FIREFOX_LINUX', 'SAFARI_IOS', 'EDGE_WINDOWS'];
    return {
      eventId: generateEventId(),
      sourceId: `sac-auth-gateway-0${Math.floor(1 + Math.random() * 3)}`,
      eventType: 'USER_LOGIN',
      eventTimestamp: now.toISOString(),
      schemaVersion: 1,
      payload: {
        userId: `usr_${userNum}`,
        ipAddress: `192.168.${Math.floor(1 + Math.random() * 20)}.${Math.floor(1 + Math.random() * 250)}`,
        status: Math.random() > 0.04 ? 'SUCCESS' : 'FAILED',
        authMethod: methods[Math.floor(Math.random() * methods.length)],
        deviceType: devices[Math.floor(Math.random() * devices.length)]
      }
    };
  }

  if (chosenType === 'DOWNLOAD_COMPLETED') {
    const files = [
      'lecture_notes_ch3.pdf',
      'compiler_lab_exercise.tar.gz',
      'dataset_sample_2026.csv',
      'research_paper_sac.pdf',
      'virtual_machine_image.iso'
    ];
    const bytes = Math.floor(500000 + Math.random() * 45000000);
    return {
      eventId: generateEventId(),
      sourceId: `sac-fileserver-node-0${Math.floor(1 + Math.random() * 4)}`,
      eventType: 'DOWNLOAD_COMPLETED',
      eventTimestamp: now.toISOString(),
      schemaVersion: 1,
      payload: {
        userId: `usr_${userNum}`,
        fileName: files[Math.floor(Math.random() * files.length)],
        bytesTransferred: bytes,
        downloadSpeedMbps: parseFloat((25 + Math.random() * 75).toFixed(1)),
        completionStatus: 'SUCCESS'
      }
    };
  }

  // FILE_UPLOAD_START
  return {
    eventId: generateEventId(),
    sourceId: 'sac-storage-gateway-01',
    eventType: 'FILE_UPLOAD_START',
    eventTimestamp: now.toISOString(),
    schemaVersion: 1,
    payload: {
      userId: `usr_${userNum}`,
      fileSize: Math.floor(1000000 + Math.random() * 80000000),
      mimeType: 'application/octet-stream',
      uploadId: `upl_gen_${Math.floor(100 + Math.random() * 900)}`
    }
  };
}
