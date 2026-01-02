/**
 * Azure Cloud Security Scanner Service
 * Scans Azure resources for security misconfigurations
 */

const { v4: uuidv4 } = require('uuid');

class AzureScanner {
  constructor() {
    this.provider = 'azure';
  }

  /**
   * Initialize Azure clients
   */
  async initialize() {
    // In production, initialize Azure SDK clients
    // const { DefaultAzureCredential } = require('@azure/identity');
    // const { ComputeManagementClient } = require('@azure/arm-compute');
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
      // Scan VMs
      const vmResults = await this.scanVirtualMachines();
      resources.push(...vmResults.resources);
      findings.push(...vmResults.findings);

      // Scan Storage Accounts
      const storageResults = await this.scanStorageAccounts();
      resources.push(...storageResults.resources);
      findings.push(...storageResults.findings);

      // Scan Network Security Groups
      const nsgResults = await this.scanNetworkSecurityGroups();
      resources.push(...nsgResults.resources);
      findings.push(...nsgResults.findings);

      // Scan SQL Databases
      const sqlResults = await this.scanSQLDatabases();
      resources.push(...sqlResults.resources);
      findings.push(...sqlResults.findings);

      // Scan Key Vaults
      const kvResults = await this.scanKeyVaults();
      resources.push(...kvResults.resources);
      findings.push(...kvResults.findings);

      // Scan AKS Clusters
      const aksResults = await this.scanAKSClusters();
      resources.push(...aksResults.resources);
      findings.push(...aksResults.findings);

    } catch (error) {
      console.error('Azure scan error:', error);
    }

    return { resources, findings };
  }

  /**
   * Scan Virtual Machines
   */
  async scanVirtualMachines() {
    const resources = [];
    const findings = [];

    const mockVMs = [
      {
        vmId: 'vm-prod-web-001',
        vmName: 'prod-web-server',
        resourceGroup: 'prod-rg',
        publicIp: '40.112.45.67',
        nsgAttached: false,
        diskEncryption: false,
        managedIdentity: false
      },
      {
        vmId: 'vm-prod-api-001',
        vmName: 'prod-api-server',
        resourceGroup: 'prod-rg',
        publicIp: null,
        nsgAttached: true,
        diskEncryption: true,
        managedIdentity: true
      }
    ];

    for (const vm of mockVMs) {
      resources.push({
        resourceId: vm.vmId,
        resourceName: vm.vmName,
        resourceType: 'azure:compute:vm',
        provider: 'azure',
        region: 'eastus',
        configuration: vm
      });

      if (vm.publicIp && !vm.nsgAttached) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: vm.vmId,
          resourceName: vm.vmName,
          resourceType: 'azure:compute:vm',
          provider: 'azure',
          title: 'VM has public IP without NSG',
          description: `Virtual machine ${vm.vmName} has a public IP but no Network Security Group attached`,
          severity: 'critical',
          category: 'network-security',
          recommendation: 'Attach a Network Security Group with restrictive rules',
          compliance: [
            { framework: 'CIS', control: '6.1', requirement: 'NSG on all subnets' }
          ],
          remediationCode: {
            cli: `az network nsg create --name ${vm.vmName}-nsg --resource-group ${vm.resourceGroup}\naz network nic update --name ${vm.vmName}-nic --resource-group ${vm.resourceGroup} --network-security-group ${vm.vmName}-nsg`
          }
        });
      }

      if (!vm.diskEncryption) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: vm.vmId,
          resourceName: vm.vmName,
          resourceType: 'azure:compute:vm',
          provider: 'azure',
          title: 'VM disk encryption not enabled',
          description: `Virtual machine ${vm.vmName} does not have Azure Disk Encryption enabled`,
          severity: 'high',
          category: 'encryption',
          recommendation: 'Enable Azure Disk Encryption using Azure Key Vault',
          compliance: [
            { framework: 'CIS', control: '7.2', requirement: 'Disk encryption' }
          ]
        });
      }

      if (!vm.managedIdentity) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: vm.vmId,
          resourceName: vm.vmName,
          resourceType: 'azure:compute:vm',
          provider: 'azure',
          title: 'VM without managed identity',
          description: `Virtual machine ${vm.vmName} does not use managed identity`,
          severity: 'medium',
          category: 'identity-access',
          recommendation: 'Enable system-assigned or user-assigned managed identity'
        });
      }
    }

    return { resources, findings };
  }

  /**
   * Scan Storage Accounts
   */
  async scanStorageAccounts() {
    const resources = [];
    const findings = [];

    const mockStorageAccounts = [
      {
        accountId: 'proddatastorage',
        accountName: 'proddatastorage',
        resourceGroup: 'prod-rg',
        publicAccess: 'Blob',
        httpsOnly: false,
        minimumTlsVersion: 'TLS1_0',
        softDeleteEnabled: false
      },
      {
        accountId: 'prodlogsstorage',
        accountName: 'prodlogsstorage',
        resourceGroup: 'prod-rg',
        publicAccess: 'None',
        httpsOnly: true,
        minimumTlsVersion: 'TLS1_2',
        softDeleteEnabled: true
      }
    ];

    for (const storage of mockStorageAccounts) {
      resources.push({
        resourceId: storage.accountId,
        resourceName: storage.accountName,
        resourceType: 'azure:storage:account',
        provider: 'azure',
        configuration: storage
      });

      if (storage.publicAccess !== 'None') {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: storage.accountId,
          resourceName: storage.accountName,
          resourceType: 'azure:storage:account',
          provider: 'azure',
          title: 'Storage account allows public access',
          description: `Storage account ${storage.accountName} allows ${storage.publicAccess} public access`,
          severity: 'critical',
          category: 'data-protection',
          recommendation: 'Disable public blob access',
          compliance: [
            { framework: 'CIS', control: '3.5', requirement: 'No public access' }
          ]
        });
      }

      if (!storage.httpsOnly) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: storage.accountId,
          resourceName: storage.accountName,
          resourceType: 'azure:storage:account',
          provider: 'azure',
          title: 'Storage account allows HTTP',
          description: `Storage account ${storage.accountName} allows insecure HTTP traffic`,
          severity: 'high',
          category: 'encryption',
          recommendation: 'Enable HTTPS-only traffic'
        });
      }

      if (storage.minimumTlsVersion !== 'TLS1_2') {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: storage.accountId,
          resourceName: storage.accountName,
          resourceType: 'azure:storage:account',
          provider: 'azure',
          title: 'Storage account using old TLS',
          description: `Storage account ${storage.accountName} allows TLS versions older than 1.2`,
          severity: 'medium',
          category: 'encryption',
          recommendation: 'Set minimum TLS version to 1.2'
        });
      }
    }

    return { resources, findings };
  }

  /**
   * Scan Network Security Groups
   */
  async scanNetworkSecurityGroups() {
    const resources = [];
    const findings = [];

    const mockNSGs = [
      {
        nsgId: 'nsg-web-001',
        nsgName: 'web-nsg',
        resourceGroup: 'prod-rg',
        rules: [
          { name: 'allow-ssh', port: 22, source: '*', access: 'Allow' },
          { name: 'allow-rdp', port: 3389, source: '*', access: 'Allow' }
        ]
      }
    ];

    for (const nsg of mockNSGs) {
      resources.push({
        resourceId: nsg.nsgId,
        resourceName: nsg.nsgName,
        resourceType: 'azure:network:nsg',
        provider: 'azure',
        configuration: nsg
      });

      for (const rule of nsg.rules) {
        if (rule.source === '*' && rule.access === 'Allow') {
          const severity = [22, 3389].includes(rule.port) ? 'critical' : 'high';
          
          findings.push({
            findingId: `finding_${uuidv4()}`,
            resourceId: nsg.nsgId,
            resourceName: nsg.nsgName,
            resourceType: 'azure:network:nsg',
            provider: 'azure',
            title: `NSG allows port ${rule.port} from any source`,
            description: `NSG ${nsg.nsgName} has rule "${rule.name}" allowing port ${rule.port} from any source`,
            severity,
            category: 'network-security',
            recommendation: 'Restrict source IP addresses'
          });
        }
      }
    }

    return { resources, findings };
  }

  /**
   * Scan SQL Databases
   */
  async scanSQLDatabases() {
    const resources = [];
    const findings = [];

    const mockSQL = [
      {
        serverId: 'sql-prod-001',
        serverName: 'prod-sql-server',
        resourceGroup: 'prod-rg',
        publicNetworkAccess: true,
        auditingEnabled: false,
        tdeEnabled: false,
        aadAuthOnly: false
      }
    ];

    for (const sql of mockSQL) {
      resources.push({
        resourceId: sql.serverId,
        resourceName: sql.serverName,
        resourceType: 'azure:sql:database',
        provider: 'azure',
        configuration: sql
      });

      if (sql.publicNetworkAccess) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: sql.serverId,
          resourceName: sql.serverName,
          resourceType: 'azure:sql:database',
          provider: 'azure',
          title: 'SQL Server allows public network access',
          description: `SQL Server ${sql.serverName} allows public network access`,
          severity: 'critical',
          category: 'database-security',
          recommendation: 'Disable public network access and use private endpoints'
        });
      }

      if (!sql.auditingEnabled) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: sql.serverId,
          resourceName: sql.serverName,
          resourceType: 'azure:sql:database',
          provider: 'azure',
          title: 'SQL Server auditing not enabled',
          description: `SQL Server ${sql.serverName} does not have auditing enabled`,
          severity: 'medium',
          category: 'logging-monitoring',
          recommendation: 'Enable auditing to Log Analytics or Storage'
        });
      }

      if (!sql.tdeEnabled) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: sql.serverId,
          resourceName: sql.serverName,
          resourceType: 'azure:sql:database',
          provider: 'azure',
          title: 'SQL TDE not enabled',
          description: `SQL Server ${sql.serverName} does not have Transparent Data Encryption enabled`,
          severity: 'high',
          category: 'encryption',
          recommendation: 'Enable TDE for encryption at rest'
        });
      }
    }

    return { resources, findings };
  }

  /**
   * Scan Key Vaults
   */
  async scanKeyVaults() {
    const resources = [];
    const findings = [];

    const mockKeyVaults = [
      {
        vaultId: 'kv-prod-001',
        vaultName: 'prod-keyvault',
        resourceGroup: 'prod-rg',
        softDeleteEnabled: false,
        purgeProtectionEnabled: false,
        rbacEnabled: false
      }
    ];

    for (const kv of mockKeyVaults) {
      resources.push({
        resourceId: kv.vaultId,
        resourceName: kv.vaultName,
        resourceType: 'azure:keyvault:vault',
        provider: 'azure',
        configuration: kv
      });

      if (!kv.softDeleteEnabled) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: kv.vaultId,
          resourceName: kv.vaultName,
          resourceType: 'azure:keyvault:vault',
          provider: 'azure',
          title: 'Key Vault soft delete disabled',
          description: `Key Vault ${kv.vaultName} does not have soft delete enabled`,
          severity: 'high',
          category: 'data-protection',
          recommendation: 'Enable soft delete for Key Vault'
        });
      }

      if (!kv.purgeProtectionEnabled) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: kv.vaultId,
          resourceName: kv.vaultName,
          resourceType: 'azure:keyvault:vault',
          provider: 'azure',
          title: 'Key Vault purge protection disabled',
          description: `Key Vault ${kv.vaultName} does not have purge protection enabled`,
          severity: 'medium',
          category: 'data-protection',
          recommendation: 'Enable purge protection'
        });
      }
    }

    return { resources, findings };
  }

  /**
   * Scan AKS Clusters
   */
  async scanAKSClusters() {
    const resources = [];
    const findings = [];

    const mockAKS = [
      {
        clusterId: 'aks-prod-001',
        clusterName: 'prod-aks-cluster',
        resourceGroup: 'prod-rg',
        rbacEnabled: false,
        networkPolicy: 'none',
        privateCluster: false
      }
    ];

    for (const aks of mockAKS) {
      resources.push({
        resourceId: aks.clusterId,
        resourceName: aks.clusterName,
        resourceType: 'azure:aks:cluster',
        provider: 'azure',
        configuration: aks
      });

      if (!aks.rbacEnabled) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: aks.clusterId,
          resourceName: aks.clusterName,
          resourceType: 'azure:aks:cluster',
          provider: 'azure',
          title: 'AKS RBAC not enabled',
          description: `AKS cluster ${aks.clusterName} does not have RBAC enabled`,
          severity: 'critical',
          category: 'identity-access',
          recommendation: 'Enable Azure RBAC for Kubernetes'
        });
      }

      if (aks.networkPolicy === 'none') {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: aks.clusterId,
          resourceName: aks.clusterName,
          resourceType: 'azure:aks:cluster',
          provider: 'azure',
          title: 'AKS network policy not configured',
          description: `AKS cluster ${aks.clusterName} has no network policy configured`,
          severity: 'high',
          category: 'container-security',
          recommendation: 'Enable Azure or Calico network policy'
        });
      }

      if (!aks.privateCluster) {
        findings.push({
          findingId: `finding_${uuidv4()}`,
          resourceId: aks.clusterId,
          resourceName: aks.clusterName,
          resourceType: 'azure:aks:cluster',
          provider: 'azure',
          title: 'AKS cluster is not private',
          description: `AKS cluster ${aks.clusterName} API server is publicly accessible`,
          severity: 'high',
          category: 'network-security',
          recommendation: 'Enable private cluster mode'
        });
      }
    }

    return { resources, findings };
  }
}

module.exports = new AzureScanner();
