/**
 * Network Discovery Service
 * Discovers and scans network devices
 */

const ping = require("ping");
const { NetworkDevice } = require("../models");

class NetworkDiscoveryService {
  constructor() {
    this.scanQueue = [];
    this.isScanning = false;
  }

  // Ping a single IP
  async pingHost(ip) {
    try {
      const result = await ping.promise.probe(ip, {
        timeout: 5,
        extra: ["-c", "3"]
      });
      return {
        ip,
        alive: result.alive,
        latency: result.avg ? parseFloat(result.avg) : null,
        packetLoss: result.packetLoss ? parseFloat(result.packetLoss) : 0
      };
    } catch (error) {
      return { ip, alive: false, latency: null, packetLoss: 100 };
    }
  }

  // Scan a subnet
  async scanSubnet(subnet, mask = 24) {
    const results = [];
    const baseIp = subnet.split(".").slice(0, 3).join(".");
    const promises = [];

    const hostCount = Math.pow(2, 32 - mask) - 2;
    const maxHosts = Math.min(hostCount, 254);

    for (let i = 1; i <= maxHosts; i++) {
      const ip = `${baseIp}.${i}`;
      promises.push(this.pingHost(ip));
    }

    const pingResults = await Promise.allSettled(promises);
    
    for (const result of pingResults) {
      if (result.status === "fulfilled" && result.value.alive) {
        results.push(result.value);
      }
    }

    return results;
  }

  // Auto-discover devices on a network
  async autoDiscover(subnet) {
    const scanResults = await this.scanSubnet(subnet);
    const devices = [];

    for (const result of scanResults) {
      // Check if device already exists
      let device = await NetworkDevice.findOne({ ip: result.ip });
      
      if (!device) {
        device = new NetworkDevice({
          name: `Device-${result.ip.split(".").pop()}`,
          ip: result.ip,
          status: result.alive ? "online" : "offline",
          lastSeen: new Date(),
          metrics: {
            latency: result.latency,
            packetLoss: result.packetLoss
          },
          discovery: {
            method: "icmp",
            discoveredAt: new Date(),
            autoDiscovered: true
          },
          createdBy: "auto-discovery"
        });
        await device.save();
      } else {
        device.status = result.alive ? "online" : "offline";
        device.lastSeen = new Date();
        device.metrics.latency = result.latency;
        device.metrics.packetLoss = result.packetLoss;
        await device.save();
      }
      
      devices.push(device);
    }

    return devices;
  }

  // Update device status
  async checkDeviceStatus(deviceId) {
    const device = await NetworkDevice.findById(deviceId);
    if (!device) return null;

    const result = await this.pingHost(device.ip);
    
    const oldStatus = device.status;
    device.status = result.alive ? "online" : "offline";
    device.lastSeen = result.alive ? new Date() : device.lastSeen;
    device.metrics.latency = result.latency || device.metrics.latency;
    device.metrics.packetLoss = result.packetLoss;
    
    await device.save();

    return {
      device,
      statusChanged: oldStatus !== device.status,
      oldStatus,
      newStatus: device.status
    };
  }

  // Check all devices
  async checkAllDevices() {
    const devices = await NetworkDevice.find({ "monitoring.enabled": true });
    const results = [];

    for (const device of devices) {
      const result = await this.checkDeviceStatus(device._id);
      if (result) results.push(result);
    }

    return results;
  }

  // Determine vendor from MAC address (OUI lookup)
  getVendorFromMac(mac) {
    if (!mac) return "Unknown";
    
    const ouiPrefix = mac.replace(/[:-]/g, "").substring(0, 6).toUpperCase();
    
    const ouiDatabase = {
      "00005E": "IANA",
      "000C29": "VMware",
      "005056": "VMware",
      "001C14": "VMware",
      "0050C2": "Cisco",
      "000B46": "Cisco",
      "0003E3": "Cisco",
      "3CD92B": "Hewlett Packard",
      "94B866": "Hewlett Packard",
      "000422": "Dell",
      "001E4F": "Dell",
      "F4EE08": "Dell",
      "000A27": "Apple",
      "00034F": "Apple",
      "F8E079": "Motorola",
      "DC9FAB": "Huawei",
      "48DB50": "Huawei",
      "001E67": "Intel",
      "0024D7": "Intel",
      "001422": "Dell",
      "D4BE D9": "Dell",
      "000D3A": "Microsoft",
      "0050F2": "Microsoft"
    };

    return ouiDatabase[ouiPrefix] || "Unknown";
  }
}

module.exports = new NetworkDiscoveryService();
