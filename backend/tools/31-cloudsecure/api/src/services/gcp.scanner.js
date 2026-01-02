/**
 * GCP Cloud Security Scanner Service
 * Scans Google Cloud resources for security misconfigurations
 */

const { v4: uuidv4 } = require('uuid');

class GCPScanner {
  constructor() {
    this.provider = 'gcp';
  }

  /**
   * Initialize GCP clients
   */
  async initialize() {
    // In production, initialize GCP SDK clients
    // const { Compute } = require('@google-cloud/compute');
    // const { Storage } = require('@google-cloud/storage');
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
      // Scan Compute instances
      const computeResults = await this.scanComputeInstances();
      resources.push(...computeResults.resources);
      findings.push(...computeResults.findings);

      // Scan Cloud Storage buckets
      const storageResults = await this.scanStorageBuckets();
      resources.push(...storageResults.resources);
      findings.push(...storageResults.findings);

      // Scan GKE clusters
      const gkeResults = await this.scanGKEClusters();
      resources.push(...gkeResults.resources);
      findings.push(...gkeResults.findings);

      // Scan Cloud SQL
      const sqlResults = await this.scanCloudSQL();
      resources.push(...sqlResults.resources);
      findings.push(...sqlResults.findings);

      // Scan IAM
      const iamResults = await this.scanIAM();
      resources.push(...iamResults.resources);
      findings.push(...iamResults.findings);

      // Scan Firewall Rules
      const firewallResults = await this.scanFirewallRules();
      resources.push(...firewallResults.resources);
      findings.push(...firewallResults.findings);

    } catch (error) {
      console.error('GCP scan error:', error);
    }

    return { resources, findings };
  }

  /**
   * Scan Compute Engine instances
   */
  async scanComputeInstances() {
    const resources = [];
    const findings = [];

    const mockInstances = [
      {
        instanceId: 'vm-prod-001',
        instanceName: 'prod-web-vm',
        zone: 'us-central1-a',
        publicIp: '35.192.45.67',
        shieldedVm: false,
        serviceAccount: 'default',
        osLogin: false
      },
      {
        instanceId: 'vm-prod-002',
        instanceName: 'prod-api-vm',
        zone: 'us-central1-a',
        publicIp: null,
        shieldedVm: true,
        serviceAccount: 'custom-sa@project.iam.gserviceaccount.com',
        osLogin: true
      }
    ];

    for (const instance of mockInstances) {
      resources.push({
        resourceId: instance.instanceId,
        resourceName: instance.instanceName,
        resourceType: 'gcp:compute:instance',
        provider: 'gcp',
        region: instance.zone,
        configuration: instance
      });

      if (instance.publicIp) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: instance.instanceId,
          resourceName: instance.instanceName,
          resourceType: 'gcp:compute:instance',
          provider: 'gcp',
          title: 'Compute instance has external IP',
          description: `Instance ${instance.instanceName} has external IP ${instance.publicIp}`,
          severity: 'medium',
          category: 'network-security',
          recommendation: 'Use Cloud NAT or IAP for external access',
          compliance: [
            { framework: 'CIS', control: '4.9', requirement: 'No public IPs' }
          ]
        });
      }

      if (!instance.shieldedVm) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: instance.instanceId,
          resourceName: instance.instanceName,
          resourceType: 'gcp:compute:instance',
          provider: 'gcp',
          title: 'Shielded VM not enabled',
          description: `Instance ${instance.instanceName} does not have Shielded VM features enabled`,
          severity: 'medium',
          category: 'compute-security',
          recommendation: 'Enable Shielded VM features for enhanced security'
        });
      }

      if (instance.serviceAccount === 'default') {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: instance.instanceId,
          resourceName: instance.instanceName,
          resourceType: 'gcp:compute:instance',
          provider: 'gcp',
          title: 'Instance using default service account',
          description: `Instance ${instance.instanceName} is using the default Compute Engine service account`,
          severity: 'high',
          category: 'identity-access',
          recommendation: 'Use a custom service account with minimal permissions'
        });
      }

      if (!instance.osLogin) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: instance.instanceId,
          resourceName: instance.instanceName,
          resourceType: 'gcp:compute:instance',
          provider: 'gcp',
          title: 'OS Login not enabled',
          description: `Instance ${instance.instanceName} does not have OS Login enabled`,
          severity: 'medium',
          category: 'identity-access',
          recommendation: 'Enable OS Login for centralized SSH access management'
        });
      }
    }

    return { resources, findings };
  }

  /**
   * Scan Cloud Storage buckets
   */
  async scanStorageBuckets() {
    const resources = [];
    const findings = [];

    const mockBuckets = [
      {
        bucketName: 'prod-data-bucket',
        location: 'US',
        uniformBucketAccess: false,
        publicAccess: true,
        versioning: false,
        logging: false
      },
      {
        bucketName: 'prod-logs-bucket',
        location: 'US',
        uniformBucketAccess: true,
        publicAccess: false,
        versioning: true,
        logging: true
      }
    ];

    for (const bucket of mockBuckets) {
      resources.push({
        resourceId: bucket.bucketName,
        resourceName: bucket.bucketName,
        resourceType: 'gcp:storage:bucket',
        provider: 'gcp',
        region: bucket.location,
        configuration: bucket
      });

      if (bucket.publicAccess) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: bucket.bucketName,
          resourceName: bucket.bucketName,
          resourceType: 'gcp:storage:bucket',
          provider: 'gcp',
          title: 'Cloud Storage bucket is public',
          description: `Bucket ${bucket.bucketName} is publicly accessible`,
          severity: 'critical',
          category: 'data-protection',
          recommendation: 'Remove allUsers and allAuthenticatedUsers from bucket IAM',
          compliance: [
            { framework: 'CIS', control: '5.1', requirement: 'No public buckets' }
          ],
          remediationCode: {
            cli: `gcloud storage buckets update gs://${bucket.bucketName} --no-public-access-prevention`
          }
        });
      }

      if (!bucket.uniformBucketAccess) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: bucket.bucketName,
          resourceName: bucket.bucketName,
          resourceType: 'gcp:storage:bucket',
          provider: 'gcp',
          title: 'Uniform bucket-level access not enabled',
          description: `Bucket ${bucket.bucketName} uses legacy ACLs instead of uniform access`,
          severity: 'medium',
          category: 'identity-access',
          recommendation: 'Enable uniform bucket-level access'
        });
      }

      if (!bucket.versioning) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: bucket.bucketName,
          resourceName: bucket.bucketName,
          resourceType: 'gcp:storage:bucket',
          provider: 'gcp',
          title: 'Bucket versioning not enabled',
          description: `Bucket ${bucket.bucketName} does not have object versioning enabled`,
          severity: 'low',
          category: 'data-protection',
          recommendation: 'Enable object versioning for data recovery'
        });
      }
    }

    return { resources, findings };
  }

  /**
   * Scan GKE clusters
   */
  async scanGKEClusters() {
    const resources = [];
    const findings = [];

    const mockClusters = [
      {
        clusterId: 'gke-prod-001',
        clusterName: 'prod-gke-cluster',
        location: 'us-central1',
        privateCluster: false,
        masterAuthorizedNetworks: false,
        legacyAbac: true,
        networkPolicy: false,
        podSecurityPolicy: false,
        workloadIdentity: false
      }
    ];

    for (const cluster of mockClusters) {
      resources.push({
        resourceId: cluster.clusterId,
        resourceName: cluster.clusterName,
        resourceType: 'gcp:gke:cluster',
        provider: 'gcp',
        region: cluster.location,
        configuration: cluster
      });

      if (!cluster.privateCluster) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: cluster.clusterId,
          resourceName: cluster.clusterName,
          resourceType: 'gcp:gke:cluster',
          provider: 'gcp',
          title: 'GKE cluster is not private',
          description: `Cluster ${cluster.clusterName} nodes have public IP addresses`,
          severity: 'high',
          category: 'network-security',
          recommendation: 'Enable private cluster mode'
        });
      }

      if (!cluster.masterAuthorizedNetworks) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: cluster.clusterId,
          resourceName: cluster.clusterName,
          resourceType: 'gcp:gke:cluster',
          provider: 'gcp',
          title: 'Master authorized networks not configured',
          description: `Cluster ${cluster.clusterName} API server is accessible from any IP`,
          severity: 'critical',
          category: 'network-security',
          recommendation: 'Configure master authorized networks'
        });
      }

      if (cluster.legacyAbac) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: cluster.clusterId,
          resourceName: cluster.clusterName,
          resourceType: 'gcp:gke:cluster',
          provider: 'gcp',
          title: 'Legacy ABAC enabled',
          description: `Cluster ${cluster.clusterName} uses legacy ABAC authorization`,
          severity: 'high',
          category: 'identity-access',
          recommendation: 'Disable legacy ABAC and use RBAC'
        });
      }

      if (!cluster.networkPolicy) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: cluster.clusterId,
          resourceName: cluster.clusterName,
          resourceType: 'gcp:gke:cluster',
          provider: 'gcp',
          title: 'Network policy not enabled',
          description: `Cluster ${cluster.clusterName} does not have network policy enabled`,
          severity: 'medium',
          category: 'container-security',
          recommendation: 'Enable network policy for pod-level network controls'
        });
      }

      if (!cluster.workloadIdentity) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: cluster.clusterId,
          resourceName: cluster.clusterName,
          resourceType: 'gcp:gke:cluster',
          provider: 'gcp',
          title: 'Workload Identity not enabled',
          description: `Cluster ${cluster.clusterName} does not use Workload Identity`,
          severity: 'high',
          category: 'identity-access',
          recommendation: 'Enable Workload Identity for pod-level IAM'
        });
      }
    }

    return { resources, findings };
  }

  /**
   * Scan Cloud SQL instances
   */
  async scanCloudSQL() {
    const resources = [];
    const findings = [];

    const mockSQL = [
      {
        instanceId: 'sql-prod-001',
        instanceName: 'prod-mysql',
        databaseVersion: 'MYSQL_5_7',
        publicIp: true,
        sslRequired: false,
        backupEnabled: false,
        binaryLogEnabled: false
      }
    ];

    for (const sql of mockSQL) {
      resources.push({
        resourceId: sql.instanceId,
        resourceName: sql.instanceName,
        resourceType: 'gcp:sql:instance',
        provider: 'gcp',
        configuration: sql
      });

      if (sql.publicIp) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: sql.instanceId,
          resourceName: sql.instanceName,
          resourceType: 'gcp:sql:instance',
          provider: 'gcp',
          title: 'Cloud SQL has public IP',
          description: `SQL instance ${sql.instanceName} has a public IP address`,
          severity: 'critical',
          category: 'database-security',
          recommendation: 'Use private IP with VPC peering'
        });
      }

      if (!sql.sslRequired) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: sql.instanceId,
          resourceName: sql.instanceName,
          resourceType: 'gcp:sql:instance',
          provider: 'gcp',
          title: 'Cloud SQL SSL not required',
          description: `SQL instance ${sql.instanceName} does not require SSL for connections`,
          severity: 'high',
          category: 'encryption',
          recommendation: 'Enable require_ssl flag'
        });
      }

      if (!sql.backupEnabled) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: sql.instanceId,
          resourceName: sql.instanceName,
          resourceType: 'gcp:sql:instance',
          provider: 'gcp',
          title: 'Cloud SQL backups disabled',
          description: `SQL instance ${sql.instanceName} does not have automated backups enabled`,
          severity: 'high',
          category: 'data-protection',
          recommendation: 'Enable automated backups'
        });
      }
    }

    return { resources, findings };
  }

  /**
   * Scan IAM
   */
  async scanIAM() {
    const resources = [];
    const findings = [];

    const mockServiceAccounts = [
      {
        email: 'default@project.iam.gserviceaccount.com',
        displayName: 'Default compute SA',
        hasKeys: true,
        keyAge: 120
      }
    ];

    for (const sa of mockServiceAccounts) {
      resources.push({
        resourceId: sa.email,
        resourceName: sa.displayName,
        resourceType: 'gcp:iam:serviceaccount',
        provider: 'gcp',
        configuration: sa
      });

      if (sa.hasKeys && sa.keyAge > 90) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: sa.email,
          resourceName: sa.displayName,
          resourceType: 'gcp:iam:serviceaccount',
          provider: 'gcp',
          title: 'Service account key older than 90 days',
          description: `Service account ${sa.email} has keys that are ${sa.keyAge} days old`,
          severity: 'medium',
          category: 'identity-access',
          recommendation: 'Rotate service account keys regularly'
        });
      }
    }

    return { resources, findings };
  }

  /**
   * Scan Firewall Rules
   */
  async scanFirewallRules() {
    const resources = [];
    const findings = [];

    const mockRules = [
      {
        ruleId: 'fw-allow-ssh-all',
        ruleName: 'allow-ssh-from-internet',
        direction: 'INGRESS',
        sourceRanges: ['0.0.0.0/0'],
        ports: ['22']
      },
      {
        ruleId: 'fw-allow-rdp-all',
        ruleName: 'allow-rdp-from-internet',
        direction: 'INGRESS',
        sourceRanges: ['0.0.0.0/0'],
        ports: ['3389']
      }
    ];

    for (const rule of mockRules) {
      resources.push({
        resourceId: rule.ruleId,
        resourceName: rule.ruleName,
        resourceType: 'gcp:network:firewall',
        provider: 'gcp',
        configuration: rule
      });

      if (rule.sourceRanges.includes('0.0.0.0/0') && rule.direction === 'INGRESS') {
        const severity = rule.ports.some(p => ['22', '3389', '3306', '5432'].includes(p)) ? 'critical' : 'high';
        
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: rule.ruleId,
          resourceName: rule.ruleName,
          resourceType: 'gcp:network:firewall',
          provider: 'gcp',
          title: `Firewall allows ${rule.ports.join(',')} from internet`,
          description: `Firewall rule ${rule.ruleName} allows ports ${rule.ports.join(',')} from 0.0.0.0/0`,
          severity,
          category: 'network-security',
          recommendation: 'Restrict source IP ranges or use IAP'
        });
      }
    }

    return { resources, findings };
  }
}

module.exports = new GCPScanner();
