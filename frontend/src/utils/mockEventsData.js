// Extended mock raw events dataset matching backend RawEvent.java and PostgreSQL JSONB structure
export const mockRawEvents = [
  {
    eventId: 'evt-sac-99101',
    sourceId: 'sac-fileserver-node-01',
    eventType: 'DOWNLOAD_COMPLETED',
    eventTimestamp: '2026-10-23T11:42:15Z',
    status: 'ACCEPTED',
    statusCode: 202,
    schemaVersion: 1,
    payload: {
      userId: 'usr_8192',
      fileName: 'operating-systems-unit4.pdf',
      bytesTransferred: 14857600,
      downloadSpeedMbps: 84.2,
      clientIp: '172.16.4.88',
      completionStatus: 'SUCCESS'
    }
  },
  {
    eventId: 'evt-sac-99102',
    sourceId: 'sac-auth-gateway-02',
    eventType: 'USER_LOGIN',
    eventTimestamp: '2026-10-23T11:41:50Z',
    status: 'ACCEPTED',
    statusCode: 202,
    schemaVersion: 1,
    payload: {
      userId: 'usr_4401',
      authMethod: 'OAUTH2_SSO',
      ipAddress: '192.168.10.42',
      deviceType: 'CHROME_MAC',
      status: 'SUCCESS'
    }
  },
  {
    eventId: 'evt-sac-99103',
    sourceId: 'sac-fileserver-node-03',
    eventType: 'DOWNLOAD_COMPLETED',
    eventTimestamp: '2026-10-23T11:40:12Z',
    status: 'ACCEPTED',
    statusCode: 202,
    schemaVersion: 1,
    payload: {
      userId: 'usr_9011',
      fileName: 'distributed-systems-lab-data.zip',
      bytesTransferred: 48924000,
      downloadSpeedMbps: 96.5,
      clientIp: '172.16.4.102',
      completionStatus: 'SUCCESS'
    }
  },
  {
    eventId: 'evt-sac-99104',
    sourceId: 'sac-storage-gateway-01',
    eventType: 'FILE_UPLOAD_START',
    eventTimestamp: '2026-10-23T11:39:44Z',
    status: 'ACCEPTED',
    statusCode: 202,
    schemaVersion: 1,
    payload: {
      userId: 'usr_3112',
      fileSize: 84900000,
      mimeType: 'application/octet-stream',
      uploadId: 'upl_zone_771'
    }
  },
  {
    eventId: 'evt-sac-99105',
    sourceId: 'sac-auth-gateway-01',
    eventType: 'USER_LOGIN',
    eventTimestamp: '2026-10-23T11:38:20Z',
    status: 'ACCEPTED',
    statusCode: 202,
    schemaVersion: 1,
    payload: {
      userId: 'usr_1092',
      authMethod: 'PASSWORD',
      ipAddress: '192.168.10.15',
      deviceType: 'FIREFOX_LINUX',
      status: 'SUCCESS'
    }
  },
  {
    eventId: 'evt-sac-99106',
    sourceId: 'sac-session-manager',
    eventType: 'SESSION_TERMINATED',
    eventTimestamp: '2026-10-23T11:37:05Z',
    status: 'ACCEPTED',
    statusCode: 202,
    schemaVersion: 1,
    payload: {
      userId: 'usr_2084',
      sessionDurationSeconds: 3840,
      terminationReason: 'USER_LOGOUT'
    }
  },
  {
    eventId: 'evt-sac-99107',
    sourceId: 'sac-fileserver-node-02',
    eventType: 'DOWNLOAD_COMPLETED',
    eventTimestamp: '2026-10-23T11:36:12Z',
    status: 'ACCEPTED',
    statusCode: 202,
    schemaVersion: 1,
    payload: {
      userId: 'usr_7491',
      fileName: 'compiler-design-slides.pdf',
      bytesTransferred: 9812400,
      downloadSpeedMbps: 62.1,
      clientIp: '172.16.5.12',
      completionStatus: 'SUCCESS'
    }
  },
  {
    eventId: 'evt-sac-99108',
    sourceId: 'sac-auth-gateway-02',
    eventType: 'USER_LOGIN',
    eventTimestamp: '2026-10-23T11:35:45Z',
    status: 'ACCEPTED',
    statusCode: 202,
    schemaVersion: 1,
    payload: {
      userId: 'usr_8820',
      authMethod: 'PASSWORD',
      ipAddress: '192.168.12.9',
      deviceType: 'SAFARI_IOS',
      status: 'SUCCESS'
    }
  },
  {
    eventId: 'evt-sac-99109',
    sourceId: 'sac-fileserver-node-02',
    eventType: 'DOWNLOAD_COMPLETED',
    eventTimestamp: '2026-10-23T11:34:10Z',
    status: 'REJECTED',
    statusCode: 400,
    schemaVersion: 1,
    payload: {
      fileName: 'corrupted-chunk-09.bin',
      bytesTransferred: -1024,
      errorDetails: '$.bytesTransferred: must have a minimum value of 0'
    }
  },
  {
    eventId: 'evt-sac-99110',
    sourceId: 'sac-storage-gateway-01',
    eventType: 'FILE_UPLOAD_START',
    eventTimestamp: '2026-10-23T11:33:00Z',
    status: 'ACCEPTED',
    statusCode: 202,
    schemaVersion: 1,
    payload: {
      userId: 'usr_5502',
      fileSize: 124500000,
      mimeType: 'video/mp4',
      uploadId: 'upl_zone_772'
    }
  },
  {
    eventId: 'evt-sac-99111',
    sourceId: 'sac-fileserver-node-01',
    eventType: 'DOWNLOAD_COMPLETED',
    eventTimestamp: '2026-10-23T11:31:55Z',
    status: 'ACCEPTED',
    statusCode: 202,
    schemaVersion: 1,
    payload: {
      userId: 'usr_3321',
      fileName: 'quantum-computing-lecture1.mkv',
      bytesTransferred: 312000000,
      downloadSpeedMbps: 112.4,
      clientIp: '172.16.8.44',
      completionStatus: 'SUCCESS'
    }
  },
  {
    eventId: 'evt-sac-99112',
    sourceId: 'sac-auth-gateway-01',
    eventType: 'USER_LOGIN',
    eventTimestamp: '2026-10-23T11:30:18Z',
    status: 'REJECTED',
    statusCode: 400,
    schemaVersion: 1,
    payload: {
      userId: 'usr_9921',
      authMethod: 'BIOMETRIC',
      status: 'FAILED',
      failureReason: 'UNREGISTERED_HARDWARE_KEY'
    }
  },
  {
    eventId: 'evt-sac-99113',
    sourceId: 'sac-fileserver-node-03',
    eventType: 'DOWNLOAD_COMPLETED',
    eventTimestamp: '2026-10-23T11:29:40Z',
    status: 'ACCEPTED',
    statusCode: 202,
    schemaVersion: 1,
    payload: {
      userId: 'usr_1029',
      fileName: 'cloud-infrastructure-lab.pdf',
      bytesTransferred: 6420000,
      downloadSpeedMbps: 75.8,
      clientIp: '172.16.2.19',
      completionStatus: 'SUCCESS'
    }
  },
  {
    eventId: 'evt-sac-99114',
    sourceId: 'sac-session-manager',
    eventType: 'SESSION_TERMINATED',
    eventTimestamp: '2026-10-23T11:28:15Z',
    status: 'ACCEPTED',
    statusCode: 202,
    schemaVersion: 1,
    payload: {
      userId: 'usr_7710',
      sessionDurationSeconds: 1200,
      terminationReason: 'IDLE_TIMEOUT'
    }
  },
  {
    eventId: 'evt-sac-99115',
    sourceId: 'sac-fileserver-node-02',
    eventType: 'DOWNLOAD_COMPLETED',
    eventTimestamp: '2026-10-23T11:27:02Z',
    status: 'ACCEPTED',
    statusCode: 202,
    schemaVersion: 1,
    payload: {
      userId: 'usr_6619',
      fileName: 'deep-learning-dataset-part1.tar',
      bytesTransferred: 890000000,
      downloadSpeedMbps: 125.0,
      clientIp: '172.16.4.77',
      completionStatus: 'SUCCESS'
    }
  },
  {
    eventId: 'evt-sac-99116',
    sourceId: 'sac-storage-gateway-01',
    eventType: 'FILE_UPLOAD_START',
    eventTimestamp: '2026-10-23T11:25:30Z',
    status: 'ACCEPTED',
    statusCode: 202,
    schemaVersion: 1,
    payload: {
      userId: 'usr_4401',
      fileSize: 18400000,
      mimeType: 'application/pdf',
      uploadId: 'upl_zone_773'
    }
  },
  {
    eventId: 'evt-sac-99117',
    sourceId: 'sac-auth-gateway-02',
    eventType: 'USER_LOGIN',
    eventTimestamp: '2026-10-23T11:24:12Z',
    status: 'ACCEPTED',
    statusCode: 202,
    schemaVersion: 1,
    payload: {
      userId: 'usr_1994',
      authMethod: 'PASSWORD',
      ipAddress: '192.168.14.88',
      deviceType: 'EDGE_WINDOWS',
      status: 'SUCCESS'
    }
  },
  {
    eventId: 'evt-sac-99118',
    sourceId: 'sac-fileserver-node-01',
    eventType: 'DOWNLOAD_COMPLETED',
    eventTimestamp: '2026-10-23T11:22:50Z',
    status: 'ACCEPTED',
    statusCode: 202,
    schemaVersion: 1,
    payload: {
      userId: 'usr_2301',
      fileName: 'algorithms-cheat-sheet.pdf',
      bytesTransferred: 3420000,
      downloadSpeedMbps: 54.1,
      clientIp: '172.16.9.12',
      completionStatus: 'SUCCESS'
    }
  },
  {
    eventId: 'evt-sac-99119',
    sourceId: 'sac-session-manager',
    eventType: 'SESSION_TERMINATED',
    eventTimestamp: '2026-10-23T11:21:05Z',
    status: 'ACCEPTED',
    statusCode: 202,
    schemaVersion: 1,
    payload: {
      userId: 'usr_8820',
      sessionDurationSeconds: 4200,
      terminationReason: 'USER_LOGOUT'
    }
  },
  {
    eventId: 'evt-sac-99120',
    sourceId: 'sac-fileserver-node-03',
    eventType: 'DOWNLOAD_COMPLETED',
    eventTimestamp: '2026-10-23T11:19:40Z',
    status: 'ACCEPTED',
    statusCode: 202,
    schemaVersion: 1,
    payload: {
      userId: 'usr_9102',
      fileName: 'database-internals-ch7.pdf',
      bytesTransferred: 12400000,
      downloadSpeedMbps: 88.0,
      clientIp: '172.16.4.55',
      completionStatus: 'SUCCESS'
    }
  },
  {
    eventId: 'evt-sac-99121',
    sourceId: 'sac-auth-gateway-01',
    eventType: 'USER_LOGIN',
    eventTimestamp: '2026-10-23T11:18:22Z',
    status: 'ACCEPTED',
    statusCode: 202,
    schemaVersion: 1,
    payload: {
      userId: 'usr_5120',
      authMethod: 'MFA_TOKEN',
      ipAddress: '192.168.10.99',
      deviceType: 'CHROME_LINUX',
      status: 'SUCCESS'
    }
  },
  {
    eventId: 'evt-sac-99122',
    sourceId: 'sac-storage-gateway-01',
    eventType: 'FILE_UPLOAD_START',
    eventTimestamp: '2026-10-23T11:16:15Z',
    status: 'ACCEPTED',
    statusCode: 202,
    schemaVersion: 1,
    payload: {
      userId: 'usr_8192',
      fileSize: 45000000,
      mimeType: 'application/zip',
      uploadId: 'upl_zone_774'
    }
  },
  {
    eventId: 'evt-sac-99123',
    sourceId: 'sac-fileserver-node-02',
    eventType: 'DOWNLOAD_COMPLETED',
    eventTimestamp: '2026-10-23T11:15:02Z',
    status: 'REJECTED',
    statusCode: 400,
    schemaVersion: 1,
    payload: {
      userId: 'usr_0000',
      fileName: 'restricted-admin-archive.zip',
      errorDetails: '$.authorization: user does not have file read scope'
    }
  },
  {
    eventId: 'evt-sac-99124',
    sourceId: 'sac-auth-gateway-02',
    eventType: 'USER_LOGIN',
    eventTimestamp: '2026-10-23T11:13:40Z',
    status: 'ACCEPTED',
    statusCode: 202,
    schemaVersion: 1,
    payload: {
      userId: 'usr_3345',
      authMethod: 'PASSWORD',
      ipAddress: '192.168.11.101',
      deviceType: 'CHROME_WINDOWS',
      status: 'SUCCESS'
    }
  },
  {
    eventId: 'evt-sac-99125',
    sourceId: 'sac-fileserver-node-01',
    eventType: 'DOWNLOAD_COMPLETED',
    eventTimestamp: '2026-10-23T11:11:58Z',
    status: 'ACCEPTED',
    statusCode: 202,
    schemaVersion: 1,
    payload: {
      userId: 'usr_7712',
      fileName: 'computer-networks-lab3.pcap',
      bytesTransferred: 52400000,
      downloadSpeedMbps: 92.4,
      clientIp: '172.16.3.88',
      completionStatus: 'SUCCESS'
    }
  }
];

export const allEventTypes = [
  'ALL',
  'USER_LOGIN',
  'DOWNLOAD_COMPLETED',
  'FILE_UPLOAD_START',
  'SESSION_TERMINATED'
];

export const allSourceIds = [
  'ALL',
  'sac-fileserver-node-01',
  'sac-fileserver-node-02',
  'sac-fileserver-node-03',
  'sac-auth-gateway-01',
  'sac-auth-gateway-02',
  'sac-storage-gateway-01',
  'sac-session-manager'
];

export const allStatuses = [
  'ALL',
  'ACCEPTED',
  'REJECTED'
];
