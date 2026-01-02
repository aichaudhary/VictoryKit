/**
 * Google Workspace Cloud DLP Integration
 * Scans Google Drive, Gmail, and Google Chat for sensitive data
 */

const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

class GoogleWorkspaceIntegration {
  constructor() {
    this.auth = null;
    this.drive = null;
    this.gmail = null;
    this.admin = null;
  }
  
  /**
   * Initialize Google API client with service account
   */
  async initialize() {
    if (this.auth) return;
    
    try {
      const credentials = JSON.parse(
        process.env.GOOGLE_SERVICE_ACCOUNT_KEY || 
        require('fs').readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_PATH, 'utf8')
      );
      
      this.auth = new JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: [
          'https://www.googleapis.com/auth/drive.readonly',
          'https://www.googleapis.com/auth/gmail.readonly',
          'https://www.googleapis.com/auth/admin.directory.user.readonly',
          'https://www.googleapis.com/auth/chat.messages.readonly'
        ],
        subject: process.env.GOOGLE_DELEGATED_USER // Domain admin for delegation
      });
      
      await this.auth.authorize();
      
      this.drive = google.drive({ version: 'v3', auth: this.auth });
      this.gmail = google.gmail({ version: 'v1', auth: this.auth });
      this.admin = google.admin({ version: 'directory_v1', auth: this.auth });
      
    } catch (error) {
      throw new Error(`Google Workspace initialization failed: ${error.message}`);
    }
  }
  
  /**
   * Impersonate a user for domain-wide delegation
   */
  async impersonateUser(userEmail) {
    const credentials = JSON.parse(
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
      require('fs').readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_PATH, 'utf8')
    );
    
    const userAuth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/gmail.readonly'
      ],
      subject: userEmail
    });
    
    await userAuth.authorize();
    return userAuth;
  }
  
  // ==========================================
  // Google Drive DLP Scanning
  // ==========================================
  
  /**
   * List all files in a user's Drive
   */
  async listDriveFiles(userEmail, pageToken = null, query = '') {
    await this.initialize();
    const userAuth = await this.impersonateUser(userEmail);
    const userDrive = google.drive({ version: 'v3', auth: userAuth });
    
    const params = {
      pageSize: 100,
      fields: 'nextPageToken, files(id, name, mimeType, size, webViewLink, parents, createdTime, modifiedTime, owners)',
      q: query || "trashed = false"
    };
    
    if (pageToken) params.pageToken = pageToken;
    
    const response = await userDrive.files.list(params);
    return response.data;
  }
  
  /**
   * Get file content from Drive
   */
  async getFileContent(userEmail, fileId, mimeType) {
    const userAuth = await this.impersonateUser(userEmail);
    const userDrive = google.drive({ version: 'v3', auth: userAuth });
    
    try {
      // For Google Docs, Sheets, Slides - export as text/plain or PDF
      if (mimeType.includes('google-apps')) {
        let exportMimeType = 'text/plain';
        if (mimeType.includes('spreadsheet')) exportMimeType = 'text/csv';
        if (mimeType.includes('presentation')) exportMimeType = 'text/plain';
        
        const response = await userDrive.files.export({
          fileId,
          mimeType: exportMimeType
        }, { responseType: 'arraybuffer' });
        
        return Buffer.from(response.data);
      }
      
      // For regular files - download directly
      const response = await userDrive.files.get({
        fileId,
        alt: 'media'
      }, { responseType: 'arraybuffer' });
      
      return Buffer.from(response.data);
      
    } catch (error) {
      throw new Error(`Failed to get file content: ${error.message}`);
    }
  }
  
  /**
   * Scan all Drive files for a user
   */
  async scanUserDrive(userEmail, dlpService) {
    const results = {
      userEmail,
      filesScanned: 0,
      violations: [],
      scannedAt: new Date()
    };
    
    let pageToken = null;
    
    do {
      try {
        const filesResponse = await this.listDriveFiles(userEmail, pageToken);
        
        for (const file of filesResponse.files || []) {
          if (this.isScannable(file)) {
            results.filesScanned++;
            
            try {
              const content = await this.getFileContent(userEmail, file.id, file.mimeType);
              const scanResult = await dlpService.scanFile(
                content,
                file.name,
                file.mimeType
              );
              
              if (scanResult.totalFindings > 0) {
                results.violations.push({
                  fileId: file.id,
                  fileName: file.name,
                  mimeType: file.mimeType,
                  webViewLink: file.webViewLink,
                  owner: file.owners?.[0]?.emailAddress,
                  ...scanResult
                });
              }
            } catch (scanError) {
              console.error(`Error scanning Drive file ${file.name}:`, scanError.message);
            }
          }
        }
        
        pageToken = filesResponse.nextPageToken;
      } catch (error) {
        throw new Error(`Drive scan failed: ${error.message}`);
      }
    } while (pageToken);
    
    return results;
  }
  
  /**
   * Get sharing permissions for a file
   */
  async getFilePermissions(userEmail, fileId) {
    const userAuth = await this.impersonateUser(userEmail);
    const userDrive = google.drive({ version: 'v3', auth: userAuth });
    
    const response = await userDrive.permissions.list({
      fileId,
      fields: 'permissions(id, type, role, emailAddress, domain)'
    });
    
    return response.data.permissions;
  }
  
  /**
   * Check for external sharing
   */
  async checkExternalSharing(userEmail, fileId) {
    const permissions = await this.getFilePermissions(userEmail, fileId);
    const internalDomains = (process.env.INTERNAL_DOMAINS || '').split(',');
    
    const externalShares = permissions.filter(p => {
      if (p.type === 'anyone' || p.type === 'domain') return true;
      if (p.emailAddress) {
        const domain = p.emailAddress.split('@')[1];
        return !internalDomains.some(d => domain?.includes(d));
      }
      return false;
    });
    
    return {
      hasExternalSharing: externalShares.length > 0,
      externalPermissions: externalShares
    };
  }
  
  // ==========================================
  // Gmail DLP Scanning
  // ==========================================
  
  /**
   * List user's emails
   */
  async listEmails(userEmail, query = '', maxResults = 100) {
    const userAuth = await this.impersonateUser(userEmail);
    const userGmail = google.gmail({ version: 'v1', auth: userAuth });
    
    const response = await userGmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults
    });
    
    return response.data;
  }
  
  /**
   * Get full email message
   */
  async getEmail(userEmail, messageId) {
    const userAuth = await this.impersonateUser(userEmail);
    const userGmail = google.gmail({ version: 'v1', auth: userAuth });
    
    const response = await userGmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full'
    });
    
    return response.data;
  }
  
  /**
   * Get email attachment
   */
  async getAttachment(userEmail, messageId, attachmentId) {
    const userAuth = await this.impersonateUser(userEmail);
    const userGmail = google.gmail({ version: 'v1', auth: userAuth });
    
    const response = await userGmail.users.messages.attachments.get({
      userId: 'me',
      messageId,
      id: attachmentId
    });
    
    return Buffer.from(response.data.data, 'base64url');
  }
  
  /**
   * Scan user's emails
   */
  async scanUserEmails(userEmail, dlpService, options = {}) {
    const { daysBack = 7, maxResults = 100 } = options;
    
    const results = {
      userEmail,
      emailsScanned: 0,
      violations: [],
      scannedAt: new Date()
    };
    
    try {
      const afterDate = new Date();
      afterDate.setDate(afterDate.getDate() - daysBack);
      const query = `after:${afterDate.toISOString().split('T')[0]}`;
      
      const messageList = await this.listEmails(userEmail, query, maxResults);
      
      for (const msg of messageList.messages || []) {
        results.emailsScanned++;
        
        try {
          const email = await this.getEmail(userEmail, msg.id);
          const emailContent = this.extractEmailContent(email);
          
          const scanResult = await dlpService.scanContent(
            `${emailContent.subject}\n${emailContent.body}`
          );
          
          const emailViolation = {
            messageId: email.id,
            threadId: email.threadId,
            subject: emailContent.subject,
            from: emailContent.from,
            to: emailContent.to,
            date: emailContent.date,
            findings: scanResult.findings,
            attachmentFindings: []
          };
          
          // Scan attachments
          for (const part of email.payload?.parts || []) {
            if (part.body?.attachmentId) {
              try {
                const attachment = await this.getAttachment(userEmail, email.id, part.body.attachmentId);
                const attachmentScan = await dlpService.scanFile(
                  attachment,
                  part.filename,
                  part.mimeType
                );
                
                if (attachmentScan.totalFindings > 0) {
                  emailViolation.attachmentFindings.push({
                    name: part.filename,
                    mimeType: part.mimeType,
                    ...attachmentScan
                  });
                }
              } catch (attachError) {
                console.error(`Error scanning attachment: ${attachError.message}`);
              }
            }
          }
          
          if (scanResult.totalFindings > 0 || emailViolation.attachmentFindings.length > 0) {
            results.violations.push(emailViolation);
          }
        } catch (emailError) {
          console.error(`Error processing email ${msg.id}:`, emailError.message);
        }
      }
    } catch (error) {
      throw new Error(`Gmail scan failed: ${error.message}`);
    }
    
    return results;
  }
  
  /**
   * Extract email content from Gmail message
   */
  extractEmailContent(email) {
    const headers = email.payload?.headers || [];
    const getHeader = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value;
    
    let body = '';
    
    // Get body from parts
    const extractBody = (parts) => {
      for (const part of parts || []) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          body += Buffer.from(part.body.data, 'base64url').toString('utf8');
        } else if (part.parts) {
          extractBody(part.parts);
        }
      }
    };
    
    if (email.payload?.body?.data) {
      body = Buffer.from(email.payload.body.data, 'base64url').toString('utf8');
    } else {
      extractBody(email.payload?.parts);
    }
    
    return {
      subject: getHeader('Subject') || '',
      from: getHeader('From') || '',
      to: getHeader('To')?.split(',') || [],
      date: getHeader('Date'),
      body
    };
  }
  
  // ==========================================
  // Admin Operations
  // ==========================================
  
  /**
   * List all users in domain
   */
  async listDomainUsers(domain) {
    await this.initialize();
    
    const users = [];
    let pageToken = null;
    
    do {
      const params = {
        customer: 'my_customer',
        maxResults: 500
      };
      if (pageToken) params.pageToken = pageToken;
      
      const response = await this.admin.users.list(params);
      users.push(...(response.data.users || []));
      pageToken = response.data.nextPageToken;
    } while (pageToken);
    
    return users;
  }
  
  /**
   * Scan entire organization
   */
  async scanOrganization(dlpService, options = {}) {
    const { scanDrive = true, scanEmail = true, maxUsersPerBatch = 10 } = options;
    
    const results = {
      totalUsers: 0,
      usersScanned: 0,
      driveViolations: [],
      emailViolations: [],
      scannedAt: new Date(),
      duration: 0
    };
    
    const startTime = Date.now();
    
    try {
      const users = await this.listDomainUsers();
      results.totalUsers = users.length;
      
      // Process users in batches
      for (let i = 0; i < users.length; i += maxUsersPerBatch) {
        const batch = users.slice(i, i + maxUsersPerBatch);
        
        await Promise.all(batch.map(async (user) => {
          results.usersScanned++;
          
          if (scanDrive) {
            try {
              const driveResults = await this.scanUserDrive(user.primaryEmail, dlpService);
              results.driveViolations.push(...driveResults.violations);
            } catch (driveError) {
              console.error(`Drive scan failed for ${user.primaryEmail}:`, driveError.message);
            }
          }
          
          if (scanEmail) {
            try {
              const emailResults = await this.scanUserEmails(user.primaryEmail, dlpService);
              results.emailViolations.push(...emailResults.violations);
            } catch (emailError) {
              console.error(`Email scan failed for ${user.primaryEmail}:`, emailError.message);
            }
          }
        }));
      }
    } catch (error) {
      throw new Error(`Organization scan failed: ${error.message}`);
    }
    
    results.duration = Date.now() - startTime;
    return results;
  }
  
  // ==========================================
  // Remediation Actions
  // ==========================================
  
  /**
   * Remove file sharing permission
   */
  async removePermission(userEmail, fileId, permissionId) {
    const userAuth = await this.impersonateUser(userEmail);
    const userDrive = google.drive({ version: 'v3', auth: userAuth });
    
    await userDrive.permissions.delete({
      fileId,
      permissionId
    });
    
    return { success: true, message: 'Permission removed' };
  }
  
  /**
   * Move file to quarantine folder
   */
  async moveToQuarantine(userEmail, fileId, quarantineFolderId) {
    const userAuth = await this.impersonateUser(userEmail);
    const userDrive = google.drive({ version: 'v3', auth: userAuth });
    
    // Get current parents
    const file = await userDrive.files.get({
      fileId,
      fields: 'parents'
    });
    
    // Move to quarantine
    await userDrive.files.update({
      fileId,
      addParents: quarantineFolderId,
      removeParents: file.data.parents?.join(','),
      fields: 'id, parents'
    });
    
    return { success: true, message: 'File moved to quarantine' };
  }
  
  // ==========================================
  // Utility Methods
  // ==========================================
  
  isScannable(file) {
    const scannableTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'application/json',
      'text/html',
      'application/vnd.google-apps.document',
      'application/vnd.google-apps.spreadsheet',
      'application/vnd.google-apps.presentation'
    ];
    
    const maxSize = (process.env.MAX_FILE_SIZE_MB || 100) * 1024 * 1024;
    
    return scannableTypes.includes(file.mimeType) && (!file.size || file.size <= maxSize);
  }
}

module.exports = new GoogleWorkspaceIntegration();
