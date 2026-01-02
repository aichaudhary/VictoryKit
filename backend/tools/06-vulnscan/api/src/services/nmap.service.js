const { spawn } = require('child_process');
const net = require('net');
const dns = require('dns').promises;
const logger = require('../../../../../shared/utils/logger');

class NmapService {
  constructor() {
    this.nmapPath = process.env.NMAP_PATH || 'nmap';
    this.defaultTimeout = 300000; // 5 minutes
    this.maxConcurrent = parseInt(process.env.VULNSCAN_MAX_CONCURRENT) || 10;
  }

  /**
   * Check if nmap is available
   */
  async isAvailable() {
    return new Promise((resolve) => {
      const child = spawn(this.nmapPath, ['--version']);
      child.on('error', () => resolve(false));
      child.on('close', (code) => resolve(code === 0));
    });
  }

  /**
   * Run a full nmap scan
   */
  async scan(target, options = {}) {
    const nmapAvailable = await this.isAvailable();
    
    if (nmapAvailable) {
      return this.nmapScan(target, options);
    } else {
      logger.info('Nmap not available, using native port scanner');
      return this.nativeScan(target, options);
    }
  }

  /**
   * Native JavaScript port scanner (fallback)
   */
  async nativeScan(target, options = {}) {
    const {
      ports = '1-1000',
      timeout = 2000,
      concurrent = this.maxConcurrent
    } = options;

    const result = {
      target,
      hostname: null,
      ip: null,
      openPorts: [],
      services: [],
      osDetection: null,
      scanTime: 0,
      method: 'native'
    };

    const startTime = Date.now();

    try {
      // Resolve hostname
      const targetInfo = await this.resolveTarget(target);
      result.hostname = targetInfo.hostname;
      result.ip = targetInfo.ip;

      // Parse port range
      const portList = this.parsePortRange(ports);
      
      // Scan ports in batches
      const openPorts = [];
      for (let i = 0; i < portList.length; i += concurrent) {
        const batch = portList.slice(i, i + concurrent);
        const results = await Promise.all(
          batch.map(port => this.checkPort(result.ip, port, timeout))
        );
        
        for (const portResult of results) {
          if (portResult.open) {
            openPorts.push(portResult);
          }
        }
      }

      // Identify services
      result.openPorts = openPorts.map(p => ({
        port: p.port,
        protocol: 'tcp',
        state: 'open',
        service: this.identifyService(p.port),
        version: null,
        banner: p.banner
      }));

      result.services = this.aggregateServices(result.openPorts);
      result.scanTime = Date.now() - startTime;

      return result;
    } catch (error) {
      logger.error('Native scan failed:', error);
      result.error = error.message;
      result.scanTime = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Full nmap scan
   */
  async nmapScan(target, options = {}) {
    const {
      ports = '1-1000',
      scanType = 'standard',
      osDetection = true,
      serviceDetection = true,
      scriptScan = false,
      timeout = this.defaultTimeout
    } = options;

    const args = [target, '-oX', '-']; // XML output to stdout

    // Port specification
    args.push('-p', ports);

    // Scan type
    switch (scanType) {
      case 'quick':
        args.push('-T4', '-F'); // Fast scan, top 100 ports
        break;
      case 'deep':
        args.push('-T3', '-A'); // Slower, aggressive scan
        break;
      case 'stealth':
        args.push('-sS', '-T2'); // SYN scan, slower
        break;
      default:
        args.push('-T4'); // Standard timing
    }

    // Service detection
    if (serviceDetection) {
      args.push('-sV');
    }

    // OS detection
    if (osDetection) {
      args.push('-O');
    }

    // Script scan
    if (scriptScan) {
      args.push('--script=default,vuln');
    }

    // Disable host discovery (assume host is up)
    args.push('-Pn');

    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';

      const child = spawn(this.nmapPath, args, { timeout });

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          try {
            const result = this.parseNmapOutput(output, target);
            result.method = 'nmap';
            resolve(result);
          } catch (parseError) {
            reject(new Error(`Failed to parse nmap output: ${parseError.message}`));
          }
        } else {
          reject(new Error(`Nmap exited with code ${code}: ${errorOutput}`));
        }
      });

      child.on('error', (err) => {
        reject(new Error(`Nmap execution failed: ${err.message}`));
      });
    });
  }

  /**
   * Parse nmap XML output
   */
  parseNmapOutput(xmlOutput, target) {
    const result = {
      target,
      hostname: null,
      ip: null,
      openPorts: [],
      services: [],
      osDetection: null,
      scanTime: 0
    };

    try {
      // Extract host info
      const hostMatch = xmlOutput.match(/<address addr="([^"]+)" addrtype="ipv4"/);
      if (hostMatch) result.ip = hostMatch[1];

      const hostnameMatch = xmlOutput.match(/<hostname name="([^"]+)"/);
      if (hostnameMatch) result.hostname = hostnameMatch[1];

      // Extract ports
      const portRegex = /<port protocol="([^"]+)" portid="(\d+)">.*?<state state="([^"]+)"[^>]*\/>.*?(?:<service name="([^"]*)"[^>]*version="([^"]*)")?/gs;
      let match;
      while ((match = portRegex.exec(xmlOutput)) !== null) {
        const [, protocol, portId, state, service, version] = match;
        if (state === 'open') {
          result.openPorts.push({
            port: parseInt(portId),
            protocol,
            state,
            service: service || this.identifyService(parseInt(portId)),
            version: version || null
          });
        }
      }

      // Simpler port extraction fallback
      if (result.openPorts.length === 0) {
        const simplePortRegex = /portid="(\d+)".*?state="open".*?name="([^"]*)"/g;
        while ((match = simplePortRegex.exec(xmlOutput)) !== null) {
          result.openPorts.push({
            port: parseInt(match[1]),
            protocol: 'tcp',
            state: 'open',
            service: match[2] || this.identifyService(parseInt(match[1])),
            version: null
          });
        }
      }

      // Extract OS
      const osMatch = xmlOutput.match(/<osmatch name="([^"]+)" accuracy="(\d+)"/);
      if (osMatch) {
        result.osDetection = {
          os: osMatch[1],
          confidence: parseInt(osMatch[2])
        };
      }

      // Extract scan time
      const timeMatch = xmlOutput.match(/elapsed="([\d.]+)"/);
      if (timeMatch) {
        result.scanTime = parseFloat(timeMatch[1]) * 1000;
      }

      result.services = this.aggregateServices(result.openPorts);

      return result;
    } catch (error) {
      logger.error('Error parsing nmap output:', error);
      return result;
    }
  }

  /**
   * Check single port (native)
   */
  checkPort(host, port, timeout = 2000) {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let banner = '';

      socket.setTimeout(timeout);

      socket.on('connect', () => {
        // Try to grab banner
        socket.write('\r\n');
      });

      socket.on('data', (data) => {
        banner = data.toString().trim().substring(0, 200);
        socket.destroy();
        resolve({ port, open: true, banner });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({ port, open: false });
      });

      socket.on('error', () => {
        socket.destroy();
        resolve({ port, open: false });
      });

      socket.on('close', () => {
        if (!banner) {
          // Connected but no banner
          resolve({ port, open: socket.connecting === false, banner: '' });
        }
      });

      socket.connect(port, host);
    });
  }

  /**
   * Resolve target to IP
   */
  async resolveTarget(target) {
    // Check if already IP
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(target)) {
      return { ip: target, hostname: null };
    }

    try {
      const addresses = await dns.resolve4(target);
      return { ip: addresses[0], hostname: target };
    } catch {
      throw new Error(`Could not resolve hostname: ${target}`);
    }
  }

  /**
   * Parse port range string
   */
  parsePortRange(range) {
    const ports = [];
    const parts = range.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(Number);
        for (let i = start; i <= Math.min(end, 65535); i++) {
          ports.push(i);
        }
      } else {
        const port = parseInt(trimmed);
        if (port > 0 && port <= 65535) {
          ports.push(port);
        }
      }
    }

    return [...new Set(ports)].sort((a, b) => a - b);
  }

  /**
   * Common port to service mapping
   */
  identifyService(port) {
    const services = {
      20: 'ftp-data', 21: 'ftp', 22: 'ssh', 23: 'telnet', 25: 'smtp',
      53: 'dns', 67: 'dhcp', 68: 'dhcp', 69: 'tftp', 80: 'http',
      110: 'pop3', 119: 'nntp', 123: 'ntp', 135: 'msrpc', 137: 'netbios-ns',
      138: 'netbios-dgm', 139: 'netbios-ssn', 143: 'imap', 161: 'snmp',
      162: 'snmptrap', 389: 'ldap', 443: 'https', 445: 'microsoft-ds',
      465: 'smtps', 514: 'syslog', 515: 'printer', 587: 'submission',
      636: 'ldaps', 993: 'imaps', 995: 'pop3s', 1080: 'socks',
      1433: 'mssql', 1434: 'mssql-m', 1521: 'oracle', 1723: 'pptp',
      2049: 'nfs', 2082: 'cpanel', 2083: 'cpanel-ssl', 2181: 'zookeeper',
      2222: 'ssh-alt', 3000: 'node', 3306: 'mysql', 3389: 'rdp',
      3690: 'svn', 4000: 'remoteanything', 5000: 'upnp', 5432: 'postgresql',
      5672: 'amqp', 5900: 'vnc', 5984: 'couchdb', 6379: 'redis',
      6443: 'kubernetes', 6666: 'irc', 6667: 'irc', 7001: 'weblogic',
      8000: 'http-alt', 8008: 'http-alt', 8080: 'http-proxy', 8081: 'http-alt',
      8443: 'https-alt', 8888: 'http-alt', 9000: 'php-fpm', 9090: 'prometheus',
      9200: 'elasticsearch', 9300: 'elasticsearch', 11211: 'memcached',
      27017: 'mongodb', 27018: 'mongodb', 28017: 'mongodb-web'
    };

    return services[port] || 'unknown';
  }

  /**
   * Aggregate services from ports
   */
  aggregateServices(openPorts) {
    const serviceMap = new Map();

    for (const port of openPorts) {
      const key = port.service;
      if (!serviceMap.has(key)) {
        serviceMap.set(key, {
          name: port.service,
          ports: [],
          version: port.version
        });
      }
      serviceMap.get(key).ports.push(port.port);
    }

    return Array.from(serviceMap.values());
  }

  /**
   * Quick scan (top ports only)
   */
  async quickScan(target) {
    return this.scan(target, {
      ports: '22,23,25,53,80,110,111,135,139,143,443,445,993,995,1723,3306,3389,5900,8080',
      scanType: 'quick',
      osDetection: false,
      serviceDetection: true
    });
  }

  /**
   * Web ports scan
   */
  async webScan(target) {
    return this.scan(target, {
      ports: '80,443,8000,8008,8080,8081,8443,8888,9000,9080,9090,9443',
      scanType: 'standard',
      serviceDetection: true
    });
  }

  /**
   * Database ports scan
   */
  async databaseScan(target) {
    return this.scan(target, {
      ports: '1433,1434,1521,3306,5432,5984,6379,9200,11211,27017,28017',
      scanType: 'standard',
      serviceDetection: true
    });
  }
}

module.exports = new NmapService();
