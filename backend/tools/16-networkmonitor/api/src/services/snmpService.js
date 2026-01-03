/**
 * SNMP Service
 * Handles SNMP polling and device metrics collection
 */

const snmp = require("net-snmp");
const { NetworkDevice, NetworkAlert } = require("../models");

class SNMPService {
  constructor() {
    this.sessions = new Map();
    this.oids = {
      // System OIDs
      sysDescr: "1.3.6.1.2.1.1.1.0",
      sysUpTime: "1.3.6.1.2.1.1.3.0",
      sysName: "1.3.6.1.2.1.1.5.0",
      sysLocation: "1.3.6.1.2.1.1.6.0",

      // Interface OIDs
      ifNumber: "1.3.6.1.2.1.2.1.0",
      ifTable: "1.3.6.1.2.1.2.2",
      ifDescr: "1.3.6.1.2.1.2.2.1.2",
      ifType: "1.3.6.1.2.1.2.2.1.3",
      ifSpeed: "1.3.6.1.2.1.2.2.1.5",
      ifOperStatus: "1.3.6.1.2.1.2.2.1.8",
      ifInOctets: "1.3.6.1.2.1.2.2.1.10",
      ifOutOctets: "1.3.6.1.2.1.2.2.1.16",
      ifInErrors: "1.3.6.1.2.1.2.2.1.14",
      ifOutErrors: "1.3.6.1.2.1.2.2.1.20",

      // IP OIDs
      ipAddrTable: "1.3.6.1.2.1.4.20",

      // CPU/Memory (HOST-RESOURCES-MIB)
      hrProcessorLoad: "1.3.6.1.2.1.25.3.3.1.2",
      hrStorageDescr: "1.3.6.1.2.1.25.2.3.1.3",
      hrStorageSize: "1.3.6.1.2.1.25.2.3.1.5",
      hrStorageUsed: "1.3.6.1.2.1.25.2.3.1.6"
    };
  }

  // Create SNMP session
  createSession(host, options = {}) {
    const sessionKey = `${host}:${options.port || 161}`;
    
    if (this.sessions.has(sessionKey)) {
      return this.sessions.get(sessionKey);
    }

    const sessionOptions = {
      port: options.port || 161,
      version: this.getVersion(options.version || "v2c"),
      timeout: options.timeout || 5000,
      retries: options.retries || 1
    };

    const session = snmp.createSession(host, options.community || "public", sessionOptions);
    this.sessions.set(sessionKey, session);

    session.on("error", (error) => {
      console.error(`SNMP session error for ${host}:`, error.message);
    });

    return session;
  }

  // Get SNMP version constant
  getVersion(version) {
    switch (version) {
      case "v1": return snmp.Version1;
      case "v2c": return snmp.Version2c;
      case "v3": return snmp.Version3;
      default: return snmp.Version2c;
    }
  }

  // Close session
  closeSession(host, port = 161) {
    const sessionKey = `${host}:${port}`;
    const session = this.sessions.get(sessionKey);
    if (session) {
      session.close();
      this.sessions.delete(sessionKey);
    }
  }

  // Get single OID value
  async get(host, oid, options = {}) {
    return new Promise((resolve, reject) => {
      const session = this.createSession(host, options);
      
      session.get([oid], (error, varbinds) => {
        if (error) {
          reject(error);
          return;
        }

        if (varbinds[0].type === snmp.ObjectType.NoSuchObject ||
            varbinds[0].type === snmp.ObjectType.NoSuchInstance) {
          resolve(null);
          return;
        }

        resolve(varbinds[0].value);
      });
    });
  }

  // Get multiple OIDs
  async getMultiple(host, oids, options = {}) {
    return new Promise((resolve, reject) => {
      const session = this.createSession(host, options);
      
      session.get(oids, (error, varbinds) => {
        if (error) {
          reject(error);
          return;
        }

        const result = {};
        varbinds.forEach((vb, i) => {
          if (vb.type !== snmp.ObjectType.NoSuchObject &&
              vb.type !== snmp.ObjectType.NoSuchInstance) {
            result[oids[i]] = vb.value;
          }
        });

        resolve(result);
      });
    });
  }

  // Walk an OID subtree
  async walk(host, oid, options = {}) {
    return new Promise((resolve, reject) => {
      const session = this.createSession(host, options);
      const results = [];

      session.subtree(oid, 20, (varbinds) => {
        varbinds.forEach(vb => {
          results.push({
            oid: vb.oid,
            type: vb.type,
            value: vb.value
          });
        });
      }, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  // Get system info
  async getSystemInfo(host, options = {}) {
    try {
      const oids = [
        this.oids.sysDescr,
        this.oids.sysUpTime,
        this.oids.sysName,
        this.oids.sysLocation
      ];

      const values = await this.getMultiple(host, oids, options);

      return {
        description: values[this.oids.sysDescr]?.toString() || "Unknown",
        uptime: this.formatUptime(values[this.oids.sysUpTime]),
        uptimeRaw: values[this.oids.sysUpTime],
        name: values[this.oids.sysName]?.toString() || "Unknown",
        location: values[this.oids.sysLocation]?.toString() || "Unknown"
      };
    } catch (error) {
      console.error(`Failed to get system info for ${host}:`, error.message);
      return null;
    }
  }

  // Get interface statistics
  async getInterfaces(host, options = {}) {
    try {
      const interfaces = [];
      
      // Walk interface table
      const ifDescr = await this.walk(host, this.oids.ifDescr, options);
      const ifSpeed = await this.walk(host, this.oids.ifSpeed, options);
      const ifOperStatus = await this.walk(host, this.oids.ifOperStatus, options);
      const ifInOctets = await this.walk(host, this.oids.ifInOctets, options);
      const ifOutOctets = await this.walk(host, this.oids.ifOutOctets, options);

      for (let i = 0; i < ifDescr.length; i++) {
        interfaces.push({
          index: i + 1,
          name: ifDescr[i]?.value?.toString() || `Interface ${i + 1}`,
          speed: ifSpeed[i]?.value || 0,
          status: ifOperStatus[i]?.value === 1 ? "up" : "down",
          inOctets: ifInOctets[i]?.value || 0,
          outOctets: ifOutOctets[i]?.value || 0
        });
      }

      return interfaces;
    } catch (error) {
      console.error(`Failed to get interfaces for ${host}:`, error.message);
      return [];
    }
  }

  // Get CPU load
  async getCPULoad(host, options = {}) {
    try {
      const cpuWalk = await this.walk(host, this.oids.hrProcessorLoad, options);
      
      if (cpuWalk.length === 0) return null;

      const loads = cpuWalk.map(c => c.value);
      const average = loads.reduce((a, b) => a + b, 0) / loads.length;

      return {
        cores: loads.length,
        perCore: loads,
        average: Math.round(average)
      };
    } catch (error) {
      console.error(`Failed to get CPU load for ${host}:`, error.message);
      return null;
    }
  }

  // Poll device and update metrics
  async pollDevice(deviceId) {
    const device = await NetworkDevice.findById(deviceId);
    if (!device || !device.snmp?.enabled) {
      return null;
    }

    const options = {
      community: device.snmp.community,
      version: device.snmp.version,
      port: device.snmp.port
    };

    try {
      const [systemInfo, interfaces, cpuLoad] = await Promise.all([
        this.getSystemInfo(device.ip, options),
        this.getInterfaces(device.ip, options),
        this.getCPULoad(device.ip, options)
      ]);

      // Calculate bandwidth from interface deltas
      const bandwidth = { inbound: 0, outbound: 0 };
      interfaces.forEach(iface => {
        bandwidth.inbound += iface.inOctets || 0;
        bandwidth.outbound += iface.outOctets || 0;
      });

      // Update device with new metrics
      device.metrics = {
        ...device.metrics,
        cpu: cpuLoad?.average,
        uptime: systemInfo?.uptimeRaw,
        interfaces: interfaces.length
      };

      device.interfaces = interfaces.map(iface => ({
        name: iface.name,
        status: iface.status,
        speed: iface.speed,
        inBytes: iface.inOctets,
        outBytes: iface.outOctets
      }));

      device.bandwidth = bandwidth;
      device.lastPolled = new Date();

      await device.save();

      return {
        device: device.name,
        systemInfo,
        interfaces,
        cpuLoad,
        bandwidth
      };
    } catch (error) {
      console.error(`SNMP poll failed for ${device.name}:`, error.message);
      
      // Update device status
      device.status = "unreachable";
      device.statusMessage = `SNMP poll failed: ${error.message}`;
      await device.save();

      return null;
    }
  }

  // Poll all SNMP-enabled devices
  async pollAllDevices() {
    const devices = await NetworkDevice.find({
      "snmp.enabled": true,
      status: { $ne: "decommissioned" }
    });

    const results = [];
    for (const device of devices) {
      const result = await this.pollDevice(device._id);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  // Format uptime from ticks
  formatUptime(ticks) {
    if (!ticks) return "Unknown";

    const seconds = Math.floor(ticks / 100);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${days}d ${hours}h ${minutes}m`;
  }

  // Cleanup all sessions
  cleanup() {
    this.sessions.forEach((session, key) => {
      session.close();
    });
    this.sessions.clear();
  }
}

module.exports = new SNMPService();
