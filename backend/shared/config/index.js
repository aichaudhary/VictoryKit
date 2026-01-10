require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  
  // MongoDB
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    defaultDb: process.env.MONGODB_DB || 'victorykit',
    databases: {
      auth: 'victorykit_auth',
      fraudguard: 'victorykit_fraudguard',
      darkwebmonitor: 'victorykit_darkwebmonitor',
      zerodaydetect: 'victorykit_zerodaydetect',
      ransomshield: 'victorykit_ransomshield',
      phishnetai: 'victorykit_phishnetai',
      vulnscan: 'victorykit_vulnscan',
      pentestai: 'victorykit_pentestai',
      codesentinel: 'victorykit_codesentinel',
      runtimeguard: 'victorykit_runtimeguard',
      dataguardian: 'victorykit_dataguardian',
      incidentresponse: 'victorykit_incidentresponse',
      xdrplatform: 'victorykit_xdrplatform',
      identityforge: 'victorykit_identityforge',
      secretvault: 'victorykit_secretvault',
      backuprecovery: 'victorykit_backuprecovery',
      networkforensics: 'victorykit_networkforensics',
      endpointprotection: 'victorykit_endpointprotection',
      identitymanagement: 'victorykit_identitymanagement',
      auditcompliance: 'victorykit_auditcompliance',
      threatintelligence: 'victorykit_threatintelligence',
      wafmanager: 'victorykit_wafmanager',
      apishield: 'victorykit_apishield',
      botmitigation: 'victorykit_botmitigation',
      ddosdefender: 'victorykit_ddosdefender',
      sslmonitor: 'victorykit_sslmonitor',
      blueteamai: 'victorykit_blueteamai',
      siemcommander: 'victorykit_siemcommander',
      soarengine: 'victorykit_soarengine',
      behavioranalytics: 'victorykit_behavioranalytics',
      policyengine: 'victorykit_policyengine',
      cloudsecure: 'victorykit_cloudsecure',
      apishield: 'victorykit_apishield'
    }
  },
  
  // AWS
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'ap-southeast-1',
    s3Bucket: process.env.AWS_S3_BUCKET || 'victorykit'
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },
  
  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    toolPrice: parseInt(process.env.TOOL_PRICE_CENTS) || 100,
    accessHours: parseInt(process.env.TOOL_ACCESS_HOURS) || 24
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*'
  },
  
  // Ports
  ports: {
    auth: parseInt(process.env.PORT_AUTH) || 5000,
    gateway: parseInt(process.env.PORT_GATEWAY) || 4000,
    fraudguard: 4001,
    darkwebmonitor: 4002,
    zerodaydetect: 4003,
    ransomshield: parseInt(process.env.PORT_MALWAREHUNTER) || 4004,
    phishnetai: parseInt(process.env.PORT_PHISHGUARD) || 4005,
    vulnscan: parseInt(process.env.PORT_VULNSCAN) || 4006,
    pentestai: 4007,
    codesentinel: 4008,
    runtimeguard: 4009,
    dataguardian: 4010,
    incidentresponse: 4011,
    xdrplatform: 4012,
    identityforge: 4013,
    secretvault: 4014,
    backuprecovery: 4015,
    networkforensics: 4016,
    endpointprotection: 4017,
    identitymanagement: 4018,
    auditcompliance: 4019,
    threatintelligence: 4020,
    wafmanager: 4021,
    apishield: 4022,
    botmitigation: 4023,
    ddosdefender: 4024,
    sslmonitor: 4025,
    blueteamai: 4026,
    siemcommander: 4027,
    soarengine: 4028,
    behavioranalytics: 4029,
    policyengine: 4030,
    cloudsecure: parseInt(process.env.PORT_CLOUDSECURE) || 4031,
    apishield: 4032
  },
  
  // ML Engines (local for now)
  ml: {
    ransomshield: 'http://localhost:8004',
    phishnetai: 'http://localhost:8005',
    vulnscan: 'http://localhost:8006'
  }
};

module.exports = config;
