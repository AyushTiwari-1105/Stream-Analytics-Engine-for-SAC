// Clearly identified realistic mock data for Stream Analytics Engine for SAC
export const IS_MOCK_DATA = true;

export const mockKpiData = {
  eventsProcessed: {
    value: '1,482,900',
    numeric: 1482900,
    delta: '+14.2%',
    isPositive: true,
    comparison: 'vs previous window',
    sparkline: [35, 42, 40, 58, 62, 55, 78, 85, 92, 88, 95]
  },
  eventsPerSecond: {
    value: '48.6 /s',
    numeric: 48.6,
    delta: '+6.8%',
    isPositive: true,
    comparison: 'peak 92.4 /s',
    sparkline: [22, 28, 35, 42, 38, 55, 49, 62, 58, 51, 48.6]
  },
  totalLogins: {
    value: '19,420',
    numeric: 19420,
    delta: '+2.4%',
    isPositive: true,
    comparison: '99.4% success rate',
    sparkline: [12, 14, 18, 16, 22, 20, 25, 28, 26, 30, 32]
  },
  bytesTransferred: {
    value: '1.84 GB',
    rawBytes: 1975684915,
    delta: '+21.5%',
    isPositive: true,
    comparison: 'avg 45.2 KB/event',
    sparkline: [10, 18, 25, 22, 45, 60, 55, 70, 65, 82, 90]
  }
};

export const mockTimeSeriesData = {
  '15m': [
    { time: '10:45', throughput: 32, bytesMb: 45, logins: 120 },
    { time: '10:46', throughput: 38, bytesMb: 52, logins: 135 },
    { time: '10:47', throughput: 42, bytesMb: 60, logins: 140 },
    { time: '10:48', throughput: 39, bytesMb: 55, logins: 130 },
    { time: '10:49', throughput: 46, bytesMb: 68, logins: 155 },
    { time: '10:50', throughput: 55, bytesMb: 82, logins: 190 },
    { time: '10:51', throughput: 62, bytesMb: 95, logins: 210 },
    { time: '10:52', throughput: 58, bytesMb: 88, logins: 195 },
    { time: '10:53', throughput: 64, bytesMb: 102, logins: 225 },
    { time: '10:54', throughput: 72, bytesMb: 118, logins: 260 },
    { time: '10:55', throughput: 68, bytesMb: 110, logins: 240 },
    { time: '10:56', throughput: 65, bytesMb: 104, logins: 230 },
    { time: '10:57', throughput: 78, bytesMb: 130, logins: 280 },
    { time: '10:58', throughput: 82, bytesMb: 142, logins: 295 },
    { time: '10:59', throughput: 88, bytesMb: 155, logins: 310 },
    { time: '11:00', throughput: 48.6, bytesMb: 92, logins: 180 }
  ],
  '1h': [
    { time: '10:00', throughput: 28, bytesMb: 35, logins: 95 },
    { time: '10:10', throughput: 36, bytesMb: 48, logins: 125 },
    { time: '10:20', throughput: 45, bytesMb: 62, logins: 160 },
    { time: '10:30', throughput: 52, bytesMb: 76, logins: 185 },
    { time: '10:40', throughput: 68, bytesMb: 105, logins: 240 },
    { time: '10:50', throughput: 82, bytesMb: 135, logins: 290 },
    { time: '11:00', throughput: 48.6, bytesMb: 92, logins: 180 }
  ],
  '24h': [
    { time: '12:00', throughput: 22, bytesMb: 28, logins: 75 },
    { time: '15:00', throughput: 45, bytesMb: 64, logins: 160 },
    { time: '18:00', throughput: 75, bytesMb: 120, logins: 270 },
    { time: '21:00', throughput: 60, bytesMb: 95, logins: 215 },
    { time: '00:00', throughput: 18, bytesMb: 24, logins: 55 },
    { time: '03:00', throughput: 12, bytesMb: 16, logins: 35 },
    { time: '06:00', throughput: 25, bytesMb: 38, logins: 90 },
    { time: '09:00', throughput: 65, bytesMb: 110, logins: 245 },
    { time: '11:00', throughput: 48.6, bytesMb: 92, logins: 180 }
  ]
};

export const mockEventTypeDistribution = [
  { type: 'USER_LOGIN', count: 622818, percentage: 42, color: '#38bdf8' },
  { type: 'DOWNLOAD_COMPLETED', count: 519015, percentage: 35, color: '#818cf8' },
  { type: 'FILE_UPLOAD_START', count: 222435, percentage: 15, color: '#34d399' },
  { type: 'SESSION_TERMINATED', count: 118632, percentage: 8, color: '#fbbf24' }
];

export const mockRecentEvents = [
  {
    eventId: 'evt-sac-98214',
    sourceId: 'sac-fileserver-node-01',
    eventType: 'DOWNLOAD_COMPLETED',
    eventTimestamp: '2026-10-23T11:09:42Z',
    relativeTime: '12s ago',
    status: 'ACCEPTED',
    statusCode: 202,
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
    eventId: 'evt-sac-98213',
    sourceId: 'sac-auth-gateway-02',
    eventType: 'USER_LOGIN',
    eventTimestamp: '2026-10-23T11:09:35Z',
    relativeTime: '19s ago',
    status: 'ACCEPTED',
    statusCode: 202,
    payload: {
      userId: 'usr_4401',
      authMethod: 'OAUTH2_SSO',
      ipAddress: '192.168.10.42',
      deviceType: 'CHROME_MAC',
      status: 'SUCCESS'
    }
  },
  {
    eventId: 'evt-sac-98212',
    sourceId: 'sac-fileserver-node-03',
    eventType: 'DOWNLOAD_COMPLETED',
    eventTimestamp: '2026-10-23T11:09:21Z',
    relativeTime: '33s ago',
    status: 'ACCEPTED',
    statusCode: 202,
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
    eventId: 'evt-sac-98211',
    sourceId: 'sac-storage-gateway-01',
    eventType: 'FILE_UPLOAD_START',
    eventTimestamp: '2026-10-23T11:08:58Z',
    relativeTime: '56s ago',
    status: 'ACCEPTED',
    statusCode: 202,
    payload: {
      userId: 'usr_3112',
      fileSize: 84900000,
      mimeType: 'application/octet-stream',
      uploadId: 'upl_zone_771'
    }
  },
  {
    eventId: 'evt-sac-98210',
    sourceId: 'sac-auth-gateway-01',
    eventType: 'USER_LOGIN',
    eventTimestamp: '2026-10-23T11:08:40Z',
    relativeTime: '1m 14s ago',
    status: 'ACCEPTED',
    statusCode: 202,
    payload: {
      userId: 'usr_1092',
      authMethod: 'PASSWORD',
      ipAddress: '192.168.10.15',
      deviceType: 'FIREFOX_LINUX',
      status: 'SUCCESS'
    }
  },
  {
    eventId: 'evt-sac-98209',
    sourceId: 'sac-session-manager',
    eventType: 'SESSION_TERMINATED',
    eventTimestamp: '2026-10-23T11:08:15Z',
    relativeTime: '1m 39s ago',
    status: 'ACCEPTED',
    statusCode: 202,
    payload: {
      userId: 'usr_2084',
      sessionDurationSeconds: 3840,
      terminationReason: 'USER_LOGOUT'
    }
  },
  {
    eventId: 'evt-sac-98208',
    sourceId: 'sac-fileserver-node-02',
    eventType: 'DOWNLOAD_COMPLETED',
    eventTimestamp: '2026-10-23T11:07:50Z',
    relativeTime: '2m 04s ago',
    status: 'ACCEPTED',
    statusCode: 202,
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
    eventId: 'evt-sac-98207',
    sourceId: 'sac-auth-gateway-02',
    eventType: 'USER_LOGIN',
    eventTimestamp: '2026-10-23T11:07:22Z',
    relativeTime: '2m 32s ago',
    status: 'ACCEPTED',
    statusCode: 202,
    payload: {
      userId: 'usr_8820',
      authMethod: 'PASSWORD',
      ipAddress: '192.168.12.9',
      deviceType: 'SAFARI_IOS',
      status: 'SUCCESS'
    }
  }
];
