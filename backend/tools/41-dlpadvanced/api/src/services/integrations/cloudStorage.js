/**
 * Cloud Storage DLP Integration
 * Support for AWS S3, Azure Blob Storage, Dropbox, Box
 */

// AWS S3 Integration
const { S3Client, ListBucketsCommand, ListObjectsV2Command, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// Azure Blob Storage
const { BlobServiceClient } = require('@azure/storage-blob');

// Dropbox
const { Dropbox } = require('dropbox');

// Box
const BoxSDK = require('box-node-sdk');

class CloudStorageIntegration {
  constructor() {
    this.s3Client = null;
    this.azureClient = null;
    this.dropboxClient = null;
    this.boxClient = null;
  }
  
  // ==========================================
  // AWS S3 Integration
  // ==========================================
  
  initializeS3() {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.warn('AWS S3 not configured');
      return false;
    }
    
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    
    return true;
  }
  
  async listS3Buckets() {
    if (!this.s3Client) this.initializeS3();
    
    const command = new ListBucketsCommand({});
    const response = await this.s3Client.send(command);
    return response.Buckets;
  }
  
  async listS3Objects(bucket, prefix = '') {
    if (!this.s3Client) this.initializeS3();
    
    const objects = [];
    let continuationToken;
    
    do {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken
      });
      
      const response = await this.s3Client.send(command);
      objects.push(...(response.Contents || []));
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);
    
    return objects;
  }
  
  async scanS3Bucket(bucket, dlpService, options = {}) {
    if (!this.s3Client) this.initializeS3();
    
    const { prefix = '', maxFiles = 1000 } = options;
    
    const results = {
      bucket,
      filesScanned: 0,
      violations: [],
      scannedAt: new Date()
    };
    
    try {
      const objects = await this.listS3Objects(bucket, prefix);
      const scannableObjects = objects
        .filter(obj => this.isScannableFile(obj.Key))
        .slice(0, maxFiles);
      
      for (const obj of scannableObjects) {
        try {
          const command = new GetObjectCommand({
            Bucket: bucket,
            Key: obj.Key
          });
          
          const response = await this.s3Client.send(command);
          const content = await this.streamToBuffer(response.Body);
          
          results.filesScanned++;
          
          const scanResult = await dlpService.scanFile(
            content,
            obj.Key,
            this.getMimeType(obj.Key)
          );
          
          if (scanResult.totalFindings > 0) {
            results.violations.push({
              key: obj.Key,
              size: obj.Size,
              lastModified: obj.LastModified,
              ...scanResult
            });
          }
        } catch (objError) {
          console.error(`Error scanning S3 object ${obj.Key}:`, objError.message);
        }
      }
    } catch (error) {
      throw new Error(`S3 bucket scan failed: ${error.message}`);
    }
    
    return results;
  }
  
  async deleteS3Object(bucket, key) {
    if (!this.s3Client) this.initializeS3();
    
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key
    });
    
    await this.s3Client.send(command);
    return { success: true };
  }
  
  // ==========================================
  // Azure Blob Storage Integration
  // ==========================================
  
  initializeAzure() {
    if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
      console.warn('Azure Blob Storage not configured');
      return false;
    }
    
    this.azureClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING
    );
    
    return true;
  }
  
  async listAzureContainers() {
    if (!this.azureClient) this.initializeAzure();
    
    const containers = [];
    for await (const container of this.azureClient.listContainers()) {
      containers.push(container);
    }
    return containers;
  }
  
  async listAzureBlobs(containerName, prefix = '') {
    if (!this.azureClient) this.initializeAzure();
    
    const containerClient = this.azureClient.getContainerClient(containerName);
    const blobs = [];
    
    for await (const blob of containerClient.listBlobsFlat({ prefix })) {
      blobs.push(blob);
    }
    
    return blobs;
  }
  
  async scanAzureContainer(containerName, dlpService, options = {}) {
    if (!this.azureClient) this.initializeAzure();
    
    const { prefix = '', maxFiles = 1000 } = options;
    
    const results = {
      container: containerName,
      filesScanned: 0,
      violations: [],
      scannedAt: new Date()
    };
    
    try {
      const containerClient = this.azureClient.getContainerClient(containerName);
      const blobs = await this.listAzureBlobs(containerName, prefix);
      const scannableBlobs = blobs
        .filter(blob => this.isScannableFile(blob.name))
        .slice(0, maxFiles);
      
      for (const blob of scannableBlobs) {
        try {
          const blobClient = containerClient.getBlobClient(blob.name);
          const downloadResponse = await blobClient.download();
          const content = await this.streamToBuffer(downloadResponse.readableStreamBody);
          
          results.filesScanned++;
          
          const scanResult = await dlpService.scanFile(
            content,
            blob.name,
            blob.properties?.contentType
          );
          
          if (scanResult.totalFindings > 0) {
            results.violations.push({
              blobName: blob.name,
              size: blob.properties?.contentLength,
              lastModified: blob.properties?.lastModified,
              ...scanResult
            });
          }
        } catch (blobError) {
          console.error(`Error scanning Azure blob ${blob.name}:`, blobError.message);
        }
      }
    } catch (error) {
      throw new Error(`Azure container scan failed: ${error.message}`);
    }
    
    return results;
  }
  
  async deleteAzureBlob(containerName, blobName) {
    if (!this.azureClient) this.initializeAzure();
    
    const containerClient = this.azureClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);
    await blobClient.delete();
    
    return { success: true };
  }
  
  // ==========================================
  // Dropbox Integration
  // ==========================================
  
  initializeDropbox() {
    if (!process.env.DROPBOX_ACCESS_TOKEN) {
      console.warn('Dropbox not configured');
      return false;
    }
    
    this.dropboxClient = new Dropbox({
      accessToken: process.env.DROPBOX_ACCESS_TOKEN
    });
    
    return true;
  }
  
  async listDropboxFiles(path = '') {
    if (!this.dropboxClient) this.initializeDropbox();
    
    const files = [];
    let cursor;
    
    let response = await this.dropboxClient.filesListFolder({
      path: path || '',
      recursive: true,
      limit: 2000
    });
    
    files.push(...response.result.entries);
    
    while (response.result.has_more) {
      response = await this.dropboxClient.filesListFolderContinue({
        cursor: response.result.cursor
      });
      files.push(...response.result.entries);
    }
    
    return files.filter(f => f['.tag'] === 'file');
  }
  
  async scanDropbox(dlpService, options = {}) {
    if (!this.dropboxClient) this.initializeDropbox();
    
    const { path = '', maxFiles = 500 } = options;
    
    const results = {
      filesScanned: 0,
      violations: [],
      scannedAt: new Date()
    };
    
    try {
      const files = await this.listDropboxFiles(path);
      const scannableFiles = files
        .filter(file => this.isScannableFile(file.name))
        .slice(0, maxFiles);
      
      for (const file of scannableFiles) {
        try {
          const downloadResponse = await this.dropboxClient.filesDownload({
            path: file.path_lower
          });
          
          const content = downloadResponse.result.fileBinary;
          results.filesScanned++;
          
          const scanResult = await dlpService.scanFile(
            Buffer.from(content),
            file.name,
            this.getMimeType(file.name)
          );
          
          if (scanResult.totalFindings > 0) {
            results.violations.push({
              path: file.path_display,
              name: file.name,
              size: file.size,
              modified: file.server_modified,
              ...scanResult
            });
          }
        } catch (fileError) {
          console.error(`Error scanning Dropbox file ${file.name}:`, fileError.message);
        }
      }
    } catch (error) {
      throw new Error(`Dropbox scan failed: ${error.message}`);
    }
    
    return results;
  }
  
  async deleteDropboxFile(path) {
    if (!this.dropboxClient) this.initializeDropbox();
    
    await this.dropboxClient.filesDeleteV2({ path });
    return { success: true };
  }
  
  // ==========================================
  // Box Integration
  // ==========================================
  
  initializeBox() {
    if (!process.env.BOX_CLIENT_ID || !process.env.BOX_CLIENT_SECRET) {
      console.warn('Box not configured');
      return false;
    }
    
    const sdk = new BoxSDK({
      clientID: process.env.BOX_CLIENT_ID,
      clientSecret: process.env.BOX_CLIENT_SECRET
    });
    
    // Use developer token for testing, or JWT for production
    if (process.env.BOX_DEVELOPER_TOKEN) {
      this.boxClient = sdk.getBasicClient(process.env.BOX_DEVELOPER_TOKEN);
    } else if (process.env.BOX_JWT_CONFIG) {
      this.boxClient = sdk.getAppAuthClient('enterprise');
    }
    
    return true;
  }
  
  async listBoxFolderItems(folderId = '0') {
    if (!this.boxClient) this.initializeBox();
    
    const items = [];
    let marker;
    
    do {
      const response = await this.boxClient.folders.getItems(folderId, {
        fields: 'id,name,size,modified_at,type',
        usemarker: true,
        marker
      });
      
      items.push(...response.entries);
      marker = response.next_marker;
    } while (marker);
    
    return items;
  }
  
  async scanBoxFolder(folderId, dlpService, options = {}) {
    if (!this.boxClient) this.initializeBox();
    
    const { recursive = true, maxFiles = 500 } = options;
    
    const results = {
      folderId,
      filesScanned: 0,
      violations: [],
      scannedAt: new Date()
    };
    
    const scanFolder = async (id, path = '') => {
      const items = await this.listBoxFolderItems(id);
      
      for (const item of items) {
        if (results.filesScanned >= maxFiles) break;
        
        if (item.type === 'folder' && recursive) {
          await scanFolder(item.id, `${path}/${item.name}`);
        } else if (item.type === 'file' && this.isScannableFile(item.name)) {
          try {
            const stream = await this.boxClient.files.getReadStream(item.id);
            const content = await this.streamToBuffer(stream);
            
            results.filesScanned++;
            
            const scanResult = await dlpService.scanFile(
              content,
              item.name,
              this.getMimeType(item.name)
            );
            
            if (scanResult.totalFindings > 0) {
              results.violations.push({
                fileId: item.id,
                name: item.name,
                path: `${path}/${item.name}`,
                size: item.size,
                modified: item.modified_at,
                ...scanResult
              });
            }
          } catch (fileError) {
            console.error(`Error scanning Box file ${item.name}:`, fileError.message);
          }
        }
      }
    };
    
    try {
      await scanFolder(folderId);
    } catch (error) {
      throw new Error(`Box folder scan failed: ${error.message}`);
    }
    
    return results;
  }
  
  async deleteBoxFile(fileId) {
    if (!this.boxClient) this.initializeBox();
    
    await this.boxClient.files.delete(fileId);
    return { success: true };
  }
  
  // ==========================================
  // Utility Methods
  // ==========================================
  
  isScannableFile(filename) {
    const scannableExtensions = [
      '.txt', '.csv', '.json', '.xml', '.yml', '.yaml',
      '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
      '.pdf', '.md', '.log', '.html', '.htm',
      '.js', '.ts', '.py', '.java', '.cs', '.rb', '.go',
      '.sql', '.env', '.config', '.cfg', '.ini'
    ];
    
    const ext = '.' + filename.split('.').pop()?.toLowerCase();
    return scannableExtensions.includes(ext);
  }
  
  getMimeType(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes = {
      'txt': 'text/plain',
      'csv': 'text/csv',
      'json': 'application/json',
      'xml': 'application/xml',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
  
  async streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }
  
  // ==========================================
  // Unified Scan Interface
  // ==========================================
  
  /**
   * Scan multiple cloud storage providers
   */
  async scanAllCloudStorage(dlpService, options = {}) {
    const results = {
      aws: null,
      azure: null,
      dropbox: null,
      box: null,
      totalViolations: 0,
      scannedAt: new Date()
    };
    
    // Scan AWS S3
    if (process.env.AWS_ACCESS_KEY_ID) {
      try {
        const buckets = await this.listS3Buckets();
        results.aws = { buckets: [] };
        
        for (const bucket of buckets.slice(0, 5)) { // Limit to 5 buckets
          const bucketResult = await this.scanS3Bucket(bucket.Name, dlpService, options);
          results.aws.buckets.push(bucketResult);
          results.totalViolations += bucketResult.violations.length;
        }
      } catch (error) {
        results.aws = { error: error.message };
      }
    }
    
    // Scan Azure Blob Storage
    if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
      try {
        const containers = await this.listAzureContainers();
        results.azure = { containers: [] };
        
        for (const container of containers.slice(0, 5)) {
          const containerResult = await this.scanAzureContainer(container.name, dlpService, options);
          results.azure.containers.push(containerResult);
          results.totalViolations += containerResult.violations.length;
        }
      } catch (error) {
        results.azure = { error: error.message };
      }
    }
    
    // Scan Dropbox
    if (process.env.DROPBOX_ACCESS_TOKEN) {
      try {
        results.dropbox = await this.scanDropbox(dlpService, options);
        results.totalViolations += results.dropbox.violations.length;
      } catch (error) {
        results.dropbox = { error: error.message };
      }
    }
    
    // Scan Box
    if (process.env.BOX_CLIENT_ID) {
      try {
        results.box = await this.scanBoxFolder('0', dlpService, options);
        results.totalViolations += results.box.violations.length;
      } catch (error) {
        results.box = { error: error.message };
      }
    }
    
    return results;
  }
}

module.exports = new CloudStorageIntegration();
