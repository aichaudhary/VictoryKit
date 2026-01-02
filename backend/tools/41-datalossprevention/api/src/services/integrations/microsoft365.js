/**
 * Microsoft 365 Cloud DLP Integration
 * Scans SharePoint, OneDrive, Teams, and Outlook for sensitive data
 */

const axios = require('axios');
const { ConfidentialClientApplication } = require('@azure/msal-node');

class Microsoft365Integration {
  constructor() {
    this.tokenCache = null;
    this.accessToken = null;
    this.tokenExpiry = null;
    
    // MSAL Configuration
    this.msalConfig = {
      auth: {
        clientId: process.env.MICROSOFT_365_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_365_CLIENT_SECRET,
        authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_365_TENANT_ID}`
      }
    };
    
    this.scopes = ['https://graph.microsoft.com/.default'];
    this.graphBaseUrl = 'https://graph.microsoft.com/v1.0';
  }
  
  /**
   * Get access token using client credentials flow
   */
  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }
    
    const cca = new ConfidentialClientApplication(this.msalConfig);
    
    try {
      const result = await cca.acquireTokenByClientCredential({
        scopes: this.scopes
      });
      
      this.accessToken = result.accessToken;
      this.tokenExpiry = Date.now() + (result.expiresOn - Date.now() - 60000); // 1 min buffer
      
      return this.accessToken;
    } catch (error) {
      throw new Error(`Microsoft 365 authentication failed: ${error.message}`);
    }
  }
  
  /**
   * Make authenticated Graph API request
   */
  async graphRequest(endpoint, method = 'GET', data = null) {
    const token = await this.getAccessToken();
    
    const config = {
      method,
      url: `${this.graphBaseUrl}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      throw new Error(`Graph API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
  
  // ==========================================
  // OneDrive DLP Scanning
  // ==========================================
  
  /**
   * List all files in a user's OneDrive
   */
  async listOneDriveFiles(userId, path = '/') {
    const endpoint = `/users/${userId}/drive/root:${path}:/children`;
    return this.graphRequest(endpoint);
  }
  
  /**
   * Get file content from OneDrive
   */
  async getFileContent(userId, fileId) {
    const endpoint = `/users/${userId}/drive/items/${fileId}/content`;
    const token = await this.getAccessToken();
    
    const response = await axios.get(`${this.graphBaseUrl}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      responseType: 'arraybuffer'
    });
    
    return response.data;
  }
  
  /**
   * Scan all OneDrive files for a user
   */
  async scanUserOneDrive(userId, dlpService) {
    const results = {
      userId,
      filesScanned: 0,
      violations: [],
      scannedAt: new Date()
    };
    
    try {
      // Get all files recursively
      const files = await this.getAllOneDriveFiles(userId);
      
      for (const file of files) {
        if (this.isScannable(file)) {
          results.filesScanned++;
          
          try {
            const content = await this.getFileContent(userId, file.id);
            const scanResult = await dlpService.scanFile(
              Buffer.from(content),
              file.name,
              file.file?.mimeType || 'application/octet-stream'
            );
            
            if (scanResult.totalFindings > 0) {
              results.violations.push({
                fileId: file.id,
                fileName: file.name,
                path: file.parentReference?.path,
                webUrl: file.webUrl,
                ...scanResult
              });
            }
          } catch (scanError) {
            console.error(`Error scanning file ${file.name}:`, scanError.message);
          }
        }
      }
    } catch (error) {
      throw new Error(`OneDrive scan failed: ${error.message}`);
    }
    
    return results;
  }
  
  async getAllOneDriveFiles(userId, path = 'root', files = []) {
    const endpoint = `/users/${userId}/drive/items/${path}/children`;
    const response = await this.graphRequest(endpoint);
    
    for (const item of response.value || []) {
      if (item.folder) {
        await this.getAllOneDriveFiles(userId, item.id, files);
      } else {
        files.push(item);
      }
    }
    
    return files;
  }
  
  // ==========================================
  // SharePoint DLP Scanning
  // ==========================================
  
  /**
   * List all SharePoint sites
   */
  async listSharePointSites() {
    const endpoint = '/sites?search=*';
    return this.graphRequest(endpoint);
  }
  
  /**
   * Get documents from a SharePoint site
   */
  async getSharePointDocuments(siteId, listId) {
    const endpoint = `/sites/${siteId}/lists/${listId}/items?expand=driveItem`;
    return this.graphRequest(endpoint);
  }
  
  /**
   * Scan SharePoint site for sensitive data
   */
  async scanSharePointSite(siteId, dlpService) {
    const results = {
      siteId,
      filesScanned: 0,
      violations: [],
      scannedAt: new Date()
    };
    
    try {
      // Get all document libraries
      const libraries = await this.graphRequest(`/sites/${siteId}/drives`);
      
      for (const library of libraries.value || []) {
        const files = await this.getAllDriveFiles(siteId, library.id);
        
        for (const file of files) {
          if (this.isScannable(file)) {
            results.filesScanned++;
            
            try {
              const content = await this.getDriveItemContent(siteId, library.id, file.id);
              const scanResult = await dlpService.scanFile(
                Buffer.from(content),
                file.name,
                file.file?.mimeType || 'application/octet-stream'
              );
              
              if (scanResult.totalFindings > 0) {
                results.violations.push({
                  fileId: file.id,
                  fileName: file.name,
                  library: library.name,
                  webUrl: file.webUrl,
                  ...scanResult
                });
              }
            } catch (scanError) {
              console.error(`Error scanning SharePoint file ${file.name}:`, scanError.message);
            }
          }
        }
      }
    } catch (error) {
      throw new Error(`SharePoint scan failed: ${error.message}`);
    }
    
    return results;
  }
  
  async getAllDriveFiles(siteId, driveId, folderId = 'root', files = []) {
    const endpoint = `/sites/${siteId}/drives/${driveId}/items/${folderId}/children`;
    const response = await this.graphRequest(endpoint);
    
    for (const item of response.value || []) {
      if (item.folder) {
        await this.getAllDriveFiles(siteId, driveId, item.id, files);
      } else {
        files.push(item);
      }
    }
    
    return files;
  }
  
  async getDriveItemContent(siteId, driveId, itemId) {
    const endpoint = `/sites/${siteId}/drives/${driveId}/items/${itemId}/content`;
    const token = await this.getAccessToken();
    
    const response = await axios.get(`${this.graphBaseUrl}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      responseType: 'arraybuffer'
    });
    
    return response.data;
  }
  
  // ==========================================
  // Teams DLP Scanning
  // ==========================================
  
  /**
   * List all Teams
   */
  async listTeams() {
    const endpoint = '/groups?$filter=resourceProvisioningOptions/Any(x:x eq \'Team\')';
    return this.graphRequest(endpoint);
  }
  
  /**
   * Get Teams messages (requires appropriate permissions)
   */
  async getTeamsMessages(teamId, channelId, top = 50) {
    const endpoint = `/teams/${teamId}/channels/${channelId}/messages?$top=${top}`;
    return this.graphRequest(endpoint);
  }
  
  /**
   * Scan Teams messages for sensitive data
   */
  async scanTeamsChannel(teamId, channelId, dlpService) {
    const results = {
      teamId,
      channelId,
      messagesScanned: 0,
      violations: [],
      scannedAt: new Date()
    };
    
    try {
      const messages = await this.getTeamsMessages(teamId, channelId);
      
      for (const message of messages.value || []) {
        results.messagesScanned++;
        
        if (message.body?.content) {
          const scanResult = await dlpService.scanContent(message.body.content);
          
          if (scanResult.totalFindings > 0) {
            results.violations.push({
              messageId: message.id,
              from: message.from?.user?.displayName,
              createdAt: message.createdDateTime,
              ...scanResult
            });
          }
        }
        
        // Scan attachments
        if (message.attachments?.length > 0) {
          for (const attachment of message.attachments) {
            if (attachment.contentUrl) {
              // Download and scan attachment
              // Implementation depends on attachment type
            }
          }
        }
      }
    } catch (error) {
      throw new Error(`Teams scan failed: ${error.message}`);
    }
    
    return results;
  }
  
  // ==========================================
  // Outlook/Email DLP Scanning
  // ==========================================
  
  /**
   * Get user's emails
   */
  async getUserEmails(userId, top = 50, filter = '') {
    let endpoint = `/users/${userId}/messages?$top=${top}`;
    if (filter) endpoint += `&$filter=${filter}`;
    return this.graphRequest(endpoint);
  }
  
  /**
   * Get email attachments
   */
  async getEmailAttachments(userId, messageId) {
    const endpoint = `/users/${userId}/messages/${messageId}/attachments`;
    return this.graphRequest(endpoint);
  }
  
  /**
   * Scan user's emails for sensitive data
   */
  async scanUserEmails(userId, dlpService, options = {}) {
    const { top = 100, daysBack = 7 } = options;
    
    const results = {
      userId,
      emailsScanned: 0,
      violations: [],
      scannedAt: new Date()
    };
    
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);
      const filter = `receivedDateTime ge ${startDate.toISOString()}`;
      
      const emails = await this.getUserEmails(userId, top, filter);
      
      for (const email of emails.value || []) {
        results.emailsScanned++;
        
        // Scan subject and body
        const content = `${email.subject}\n${email.body?.content || ''}`;
        const scanResult = await dlpService.scanContent(content);
        
        const emailViolation = {
          messageId: email.id,
          subject: email.subject,
          from: email.from?.emailAddress?.address,
          to: email.toRecipients?.map(r => r.emailAddress?.address),
          receivedAt: email.receivedDateTime,
          hasExternalRecipients: false,
          findings: scanResult.findings,
          attachmentFindings: []
        };
        
        // Check for external recipients
        const internalDomains = (process.env.INTERNAL_DOMAINS || '').split(',');
        const allRecipients = [
          ...(email.toRecipients || []),
          ...(email.ccRecipients || []),
          ...(email.bccRecipients || [])
        ];
        
        emailViolation.hasExternalRecipients = allRecipients.some(r => {
          const domain = r.emailAddress?.address?.split('@')[1];
          return !internalDomains.some(d => domain?.includes(d));
        });
        
        // Scan attachments
        if (email.hasAttachments) {
          const attachments = await this.getEmailAttachments(userId, email.id);
          
          for (const attachment of attachments.value || []) {
            if (attachment.contentBytes) {
              const attachmentContent = Buffer.from(attachment.contentBytes, 'base64');
              const attachmentScan = await dlpService.scanFile(
                attachmentContent,
                attachment.name,
                attachment.contentType
              );
              
              if (attachmentScan.totalFindings > 0) {
                emailViolation.attachmentFindings.push({
                  name: attachment.name,
                  size: attachment.size,
                  ...attachmentScan
                });
              }
            }
          }
        }
        
        // Only add if there are violations or external recipients with findings
        if (scanResult.totalFindings > 0 || 
            emailViolation.attachmentFindings.length > 0 ||
            (emailViolation.hasExternalRecipients && scanResult.riskScore > 30)) {
          results.violations.push(emailViolation);
        }
      }
    } catch (error) {
      throw new Error(`Email scan failed: ${error.message}`);
    }
    
    return results;
  }
  
  // ==========================================
  // Real-time Monitoring (Webhooks)
  // ==========================================
  
  /**
   * Create subscription for change notifications
   */
  async createSubscription(resource, notificationUrl, expirationMinutes = 4230) {
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + expirationMinutes);
    
    const subscription = {
      changeType: 'created,updated',
      notificationUrl,
      resource,
      expirationDateTime: expiration.toISOString(),
      clientState: process.env.ENDPOINT_AGENT_SECRET
    };
    
    return this.graphRequest('/subscriptions', 'POST', subscription);
  }
  
  /**
   * Renew subscription
   */
  async renewSubscription(subscriptionId, expirationMinutes = 4230) {
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + expirationMinutes);
    
    return this.graphRequest(`/subscriptions/${subscriptionId}`, 'PATCH', {
      expirationDateTime: expiration.toISOString()
    });
  }
  
  // ==========================================
  // Remediation Actions
  // ==========================================
  
  /**
   * Apply sensitivity label to file
   */
  async applySensitivityLabel(driveId, itemId, labelId) {
    const endpoint = `/drives/${driveId}/items/${itemId}/assignSensitivityLabel`;
    return this.graphRequest(endpoint, 'POST', {
      sensitivityLabelId: labelId,
      assignmentMethod: 'auto'
    });
  }
  
  /**
   * Revoke sharing permissions
   */
  async revokeSharing(driveId, itemId, permissionId) {
    const endpoint = `/drives/${driveId}/items/${itemId}/permissions/${permissionId}`;
    return this.graphRequest(endpoint, 'DELETE');
  }
  
  /**
   * Move file to quarantine folder
   */
  async quarantineFile(userId, fileId, quarantineFolderId) {
    const endpoint = `/users/${userId}/drive/items/${fileId}`;
    return this.graphRequest(endpoint, 'PATCH', {
      parentReference: { id: quarantineFolderId }
    });
  }
  
  // ==========================================
  // Utility Methods
  // ==========================================
  
  isScannable(file) {
    const scannableTypes = (process.env.SCAN_FILE_TYPES || 
      'pdf,doc,docx,xls,xlsx,ppt,pptx,txt,csv,json,xml,html').split(',');
    
    const extension = file.name?.split('.').pop()?.toLowerCase();
    const maxSize = (process.env.MAX_FILE_SIZE_MB || 100) * 1024 * 1024;
    
    return scannableTypes.includes(extension) && (file.size || 0) <= maxSize;
  }
}

module.exports = new Microsoft365Integration();
