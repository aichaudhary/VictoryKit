/**
 * AWS Cloud Security Scanner Service
 * Scans AWS resources for security misconfigurations
 */

const { v4: uuidv4 } = require('uuid');

// AWS SDK clients would be imported here in production
// const { EC2Client, DescribeInstancesCommand } = require('@aws-sdk/client-ec2');
// const { S3Client, ListBucketsCommand, GetBucketAclCommand } = require('@aws-sdk/client-s3');
// etc.

class AWSScanner {
  constructor() {
    this.provider = 'aws';
  }

  /**
   * Initialize AWS clients with credentials
   */
  async initialize() {
    // In production, initialize AWS SDK clients here
    const config = {
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    };

    // this.ec2Client = new EC2Client(config);
    // this.s3Client = new S3Client(config);
    // etc.

    return this;
  }

  /**
   * Main scan function
   */
  async scan(scanConfig) {
    const resources = [];
    const findings = [];

    try {
      // Scan EC2 instances
      const ec2Results = await this.scanEC2();
      resources.push(...ec2Results.resources);
      findings.push(...ec2Results.findings);

      // Scan S3 buckets
      const s3Results = await this.scanS3();
      resources.push(...s3Results.resources);
      findings.push(...s3Results.findings);

      // Scan IAM
      const iamResults = await this.scanIAM();
      resources.push(...iamResults.resources);
      findings.push(...iamResults.findings);

      // Scan RDS
      const rdsResults = await this.scanRDS();
      resources.push(...rdsResults.resources);
      findings.push(...rdsResults.findings);

      // Scan VPC/Security Groups
      const vpcResults = await this.scanVPC();
      resources.push(...vpcResults.resources);
      findings.push(...vpcResults.findings);

      // Scan Lambda
      const lambdaResults = await this.scanLambda();
      resources.push(...lambdaResults.resources);
      findings.push(...lambdaResults.findings);

    } catch (error) {
      console.error('AWS scan error:', error);
    }

    return { resources, findings };
  }

  /**
   * Scan EC2 instances
   */
  async scanEC2() {
    const resources = [];
    const findings = [];

    // Mock data - in production, use AWS SDK
    const mockInstances = [
      {
        instanceId: 'i-0abc123def456',
        instanceName: 'prod-web-server-1',
        publicIp: '54.123.45.67',
        securityGroups: [{ groupId: 'sg-123', groupName: 'web-sg' }],
        iamProfile: null,
        encrypted: false
      },
      {
        instanceId: 'i-0def789ghi012',
        instanceName: 'prod-api-server-1',
        publicIp: null,
        securityGroups: [{ groupId: 'sg-456', groupName: 'api-sg' }],
        iamProfile: 'api-role',
        encrypted: true
      }
    ];

    for (const instance of mockInstances) {
      // Add resource
      resources.push({
        resourceId: instance.instanceId,
        resourceName: instance.instanceName,
        resourceType: 'aws:ec2:instance',
        provider: 'aws',
        region: process.env.AWS_REGION || 'us-east-1',
        configuration: instance,
        securityScore: 100,
        riskLevel: 'info'
      });

      // Check for public IP without security
      if (instance.publicIp) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: instance.instanceId,
          resourceName: instance.instanceName,
          resourceType: 'aws:ec2:instance',
          provider: 'aws',
          title: 'EC2 instance has public IP',
          description: `Instance ${instance.instanceName} has a public IP address (${instance.publicIp})`,
          severity: 'medium',
          category: 'network-security',
          recommendation: 'Use private subnets with NAT gateway or bastion host',
          compliance: [
            { framework: 'CIS', control: '2.1.1', requirement: 'Ensure no public IP on EC2' }
          ],
          remediationCode: {
            terraform: `resource "aws_instance" "${instance.instanceName}" {\n  associate_public_ip_address = false\n}`,
            cli: `aws ec2 modify-instance-attribute --instance-id ${instance.instanceId} --no-associate-public-ip-address`
          }
        });
      }

      // Check for unencrypted volumes
      if (!instance.encrypted) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: instance.instanceId,
          resourceName: instance.instanceName,
          resourceType: 'aws:ec2:instance',
          provider: 'aws',
          title: 'EC2 instance EBS not encrypted',
          description: `Instance ${instance.instanceName} has unencrypted EBS volumes`,
          severity: 'high',
          category: 'encryption',
          recommendation: 'Enable EBS encryption by default',
          compliance: [
            { framework: 'CIS', control: '2.2.1', requirement: 'EBS encryption at rest' },
            { framework: 'PCI-DSS', control: '3.4', requirement: 'Data encryption' }
          ],
          remediationCode: {
            terraform: `resource "aws_ebs_encryption_by_default" "enabled" {\n  enabled = true\n}`,
            cli: `aws ec2 enable-ebs-encryption-by-default`
          }
        });
      }

      // Check for missing IAM instance profile
      if (!instance.iamProfile) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: instance.instanceId,
          resourceName: instance.instanceName,
          resourceType: 'aws:ec2:instance',
          provider: 'aws',
          title: 'EC2 instance without IAM role',
          description: `Instance ${instance.instanceName} has no IAM instance profile attached`,
          severity: 'medium',
          category: 'identity-access',
          recommendation: 'Attach an IAM role with least privilege permissions'
        });
      }
    }

    return { resources, findings };
  }

  /**
   * Scan S3 buckets
   */
  async scanS3() {
    const resources = [];
    const findings = [];

    // Mock data
    const mockBuckets = [
      {
        name: 'prod-data-bucket',
        publicAccess: true,
        encryption: false,
        versioning: false,
        logging: false
      },
      {
        name: 'prod-logs-bucket',
        publicAccess: false,
        encryption: true,
        versioning: true,
        logging: true
      }
    ];

    for (const bucket of mockBuckets) {
      resources.push({
        resourceId: bucket.name,
        resourceName: bucket.name,
        resourceType: 'aws:s3:bucket',
        provider: 'aws',
        region: 'global',
        configuration: bucket,
        securityScore: bucket.publicAccess ? 20 : 100,
        riskLevel: bucket.publicAccess ? 'critical' : 'info'
      });

      if (bucket.publicAccess) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: bucket.name,
          resourceName: bucket.name,
          resourceType: 'aws:s3:bucket',
          provider: 'aws',
          title: 'S3 bucket is publicly accessible',
          description: `Bucket ${bucket.name} allows public access which could expose sensitive data`,
          severity: 'critical',
          category: 'data-protection',
          recommendation: 'Enable S3 Block Public Access',
          compliance: [
            { framework: 'CIS', control: '2.1.5', requirement: 'S3 public access blocked' },
            { framework: 'SOC2', control: 'CC6.1', requirement: 'Logical access' }
          ],
          remediationCode: {
            terraform: `resource "aws_s3_bucket_public_access_block" "${bucket.name}" {\n  bucket = "${bucket.name}"\n  block_public_acls = true\n  block_public_policy = true\n  ignore_public_acls = true\n  restrict_public_buckets = true\n}`,
            cli: `aws s3api put-public-access-block --bucket ${bucket.name} --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"`
          }
        });
      }

      if (!bucket.encryption) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: bucket.name,
          resourceName: bucket.name,
          resourceType: 'aws:s3:bucket',
          provider: 'aws',
          title: 'S3 bucket encryption not enabled',
          description: `Bucket ${bucket.name} does not have server-side encryption enabled`,
          severity: 'high',
          category: 'encryption',
          recommendation: 'Enable default encryption using SSE-S3 or SSE-KMS',
          compliance: [
            { framework: 'CIS', control: '2.1.1', requirement: 'S3 encryption at rest' }
          ]
        });
      }

      if (!bucket.versioning) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: bucket.name,
          resourceName: bucket.name,
          resourceType: 'aws:s3:bucket',
          provider: 'aws',
          title: 'S3 bucket versioning disabled',
          description: `Bucket ${bucket.name} does not have versioning enabled`,
          severity: 'medium',
          category: 'data-protection',
          recommendation: 'Enable versioning for data recovery and protection'
        });
      }
    }

    return { resources, findings };
  }

  /**
   * Scan IAM resources
   */
  async scanIAM() {
    const resources = [];
    const findings = [];

    // Mock IAM findings
    const mockUsers = [
      { userName: 'admin-user', mfaEnabled: false, accessKeyAge: 120, lastUsed: 90 },
      { userName: 'dev-user', mfaEnabled: true, accessKeyAge: 30, lastUsed: 1 }
    ];

    for (const user of mockUsers) {
      resources.push({
        resourceId: user.userName,
        resourceName: user.userName,
        resourceType: 'aws:iam:user',
        provider: 'aws',
        configuration: user
      });

      if (!user.mfaEnabled) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: user.userName,
          resourceName: user.userName,
          resourceType: 'aws:iam:user',
          provider: 'aws',
          title: 'IAM user without MFA',
          description: `User ${user.userName} does not have MFA enabled`,
          severity: 'critical',
          category: 'identity-access',
          recommendation: 'Enable MFA for all IAM users',
          compliance: [
            { framework: 'CIS', control: '1.2', requirement: 'MFA for all users' },
            { framework: 'SOC2', control: 'CC6.1', requirement: 'Authentication' }
          ]
        });
      }

      if (user.accessKeyAge > 90) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: user.userName,
          resourceName: user.userName,
          resourceType: 'aws:iam:user',
          provider: 'aws',
          title: 'IAM access key older than 90 days',
          description: `User ${user.userName} has access keys that are ${user.accessKeyAge} days old`,
          severity: 'medium',
          category: 'identity-access',
          recommendation: 'Rotate access keys every 90 days'
        });
      }
    }

    return { resources, findings };
  }

  /**
   * Scan RDS instances
   */
  async scanRDS() {
    const resources = [];
    const findings = [];

    const mockRDS = [
      {
        dbInstanceId: 'prod-mysql-db',
        engine: 'mysql',
        publiclyAccessible: true,
        encrypted: false,
        multiAZ: false,
        backupRetention: 0
      }
    ];

    for (const db of mockRDS) {
      resources.push({
        resourceId: db.dbInstanceId,
        resourceName: db.dbInstanceId,
        resourceType: 'aws:rds:instance',
        provider: 'aws',
        configuration: db
      });

      if (db.publiclyAccessible) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: db.dbInstanceId,
          resourceName: db.dbInstanceId,
          resourceType: 'aws:rds:instance',
          provider: 'aws',
          title: 'RDS instance publicly accessible',
          description: `Database ${db.dbInstanceId} is publicly accessible`,
          severity: 'critical',
          category: 'database-security',
          recommendation: 'Disable public accessibility and use VPC'
        });
      }

      if (!db.encrypted) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: db.dbInstanceId,
          resourceName: db.dbInstanceId,
          resourceType: 'aws:rds:instance',
          provider: 'aws',
          title: 'RDS instance not encrypted',
          description: `Database ${db.dbInstanceId} does not have encryption at rest enabled`,
          severity: 'high',
          category: 'encryption',
          recommendation: 'Enable encryption at rest for RDS'
        });
      }

      if (db.backupRetention === 0) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: db.dbInstanceId,
          resourceName: db.dbInstanceId,
          resourceType: 'aws:rds:instance',
          provider: 'aws',
          title: 'RDS automated backups disabled',
          description: `Database ${db.dbInstanceId} has automated backups disabled`,
          severity: 'high',
          category: 'data-protection',
          recommendation: 'Enable automated backups with appropriate retention'
        });
      }
    }

    return { resources, findings };
  }

  /**
   * Scan VPC and Security Groups
   */
  async scanVPC() {
    const resources = [];
    const findings = [];

    const mockSecurityGroups = [
      {
        groupId: 'sg-openssh',
        groupName: 'open-ssh-sg',
        inboundRules: [
          { port: 22, protocol: 'tcp', source: '0.0.0.0/0' }
        ]
      },
      {
        groupId: 'sg-opendb',
        groupName: 'open-db-sg',
        inboundRules: [
          { port: 3306, protocol: 'tcp', source: '0.0.0.0/0' }
        ]
      }
    ];

    for (const sg of mockSecurityGroups) {
      resources.push({
        resourceId: sg.groupId,
        resourceName: sg.groupName,
        resourceType: 'aws:vpc:security-group',
        provider: 'aws',
        configuration: sg
      });

      for (const rule of sg.inboundRules) {
        if (rule.source === '0.0.0.0/0') {
          const severity = [22, 3389].includes(rule.port) ? 'critical' : 
                          [3306, 5432, 27017].includes(rule.port) ? 'critical' : 'high';
          
          findings.push({
            findingId: `finding_${uuidv4()}`,
            resourceId: sg.groupId,
            resourceName: sg.groupName,
            resourceType: 'aws:vpc:security-group',
            provider: 'aws',
            title: `Security group allows ${rule.port} from internet`,
            description: `Security group ${sg.groupName} allows port ${rule.port} access from 0.0.0.0/0`,
            severity,
            category: 'network-security',
            recommendation: 'Restrict access to specific IP ranges or use VPN/bastion'
          });
        }
      }
    }

    return { resources, findings };
  }

  /**
   * Scan Lambda functions
   */
  async scanLambda() {
    const resources = [];
    const findings = [];

    const mockLambdas = [
      {
        functionName: 'prod-api-handler',
        runtime: 'nodejs14.x',
        timeout: 30,
        memorySize: 128,
        vpcConfig: null,
        envVarsWithSecrets: ['DB_PASSWORD', 'API_KEY']
      }
    ];

    for (const fn of mockLambdas) {
      resources.push({
        resourceId: fn.functionName,
        resourceName: fn.functionName,
        resourceType: 'aws:lambda:function',
        provider: 'aws',
        configuration: fn
      });

      if (fn.runtime.includes('14') || fn.runtime.includes('12')) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: fn.functionName,
          resourceName: fn.functionName,
          resourceType: 'aws:lambda:function',
          provider: 'aws',
          title: 'Lambda using deprecated runtime',
          description: `Function ${fn.functionName} uses runtime ${fn.runtime} which may be deprecated`,
          severity: 'medium',
          category: 'vulnerability',
          recommendation: 'Upgrade to a supported runtime version'
        });
      }

      if (fn.envVarsWithSecrets.length > 0) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: fn.functionName,
          resourceName: fn.functionName,
          resourceType: 'aws:lambda:function',
          provider: 'aws',
          title: 'Lambda has secrets in environment variables',
          description: `Function ${fn.functionName} has potential secrets in environment variables`,
          severity: 'high',
          category: 'secrets-management',
          recommendation: 'Use AWS Secrets Manager or Parameter Store for secrets'
        });
      }
    }

    return { resources, findings };
  }
}

module.exports = new AWSScanner();
