
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import { useScroll } from '../context/ScrollContext';
import {
  ArrowLeft,
  Zap,
  Shield,
  Lock,
  ShieldOff,
  Search,
  Skull,
  AlertTriangle,
  CheckCircle2,
  Binary,
  FileWarning,
  HardDrive,
  Database,
  Server,
  Cpu,
  Activity,
  Eye,
  Target,
  Crosshair,
  ClipboardList,
  FileText,
  Clock,
  Layers,
  BarChart3,
  CheckSquare,
  AlertCircle,
} from 'lucide-react';
import { RadarSweep, ParticleNetwork, DataStream, HexGrid, PulseRings, FloatingIcons } from '../components/AnimatedBackground';

// ============================================================================
// EPIC ANIMATED VISUAL COMPONENTS - AUDIT TRAIL & COMPLIANCE
// ============================================================================

// 1. AuditEventStream - Real-time audit event monitoring and streaming
const AuditEventStream: React.FC = () => {
  const [events, setEvents] = useState<
    { id: number; timestamp: string; user: string; action: string; resource: string; severity: string }[]
  >([]);

  useEffect(() => {
    const actions = ['Login', 'File Access', 'Data Export', 'Config Change', 'Privilege Escalation', 'Failed Login'];
    const users = ['admin@corp.com', 'user@corp.com', 'auditor@corp.com', 'manager@corp.com', 'developer@corp.com'];
    const resources = ['Database', 'File Server', 'API Gateway', 'Admin Panel', 'User Portal'];
    const severities = ['Low', 'Medium', 'High', 'Critical'];

    const generateEvents = () => {
      const newEvents = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        timestamp: new Date().toLocaleTimeString(),
        user: users[Math.floor(Math.random() * users.length)],
        action: actions[Math.floor(Math.random() * actions.length)],
        resource: resources[Math.floor(Math.random() * resources.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
      }));
      setEvents(newEvents);
    };

    generateEvents();
    const interval = setInterval(generateEvents, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-amber-900/20 to-orange-900/20 rounded-3xl border border-amber-500/20 overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ic3RyZWFtIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxyZWN0IHdpZHRoPSIyIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZjU5ZTAwIiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjc3RyZWFtKSIvPjwvc3ZnPg==')] opacity-30" />

      <div className="absolute top-4 left-4 right-4 text-xs font-mono text-amber-400">
        Audit Event Stream - Real-time Monitoring
      </div>

      <div className="absolute inset-0 p-4 overflow-hidden">
        <div className="space-y-2 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-amber-500/20">
          {events.map((event, index) => (
            <div key={event.id} className="bg-black/20 rounded-lg p-3 border border-amber-500/10 hover:border-amber-500/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-4 text-xs font-mono">
                  <span className="text-amber-300">{event.timestamp}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    event.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                    event.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                    event.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {event.severity}
                  </span>
                </div>
                <div className="text-xs font-mono text-amber-400">
                  {event.user}
                </div>
              </div>
              <div className="flex justify-between text-xs font-mono text-amber-200">
                <span>{event.action} → {event.resource}</span>
                <span className="text-amber-400">Logged</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-amber-300">
        <span>Event Stream Active</span>
        <span>{events.length} Events/sec</span>
      </div>
    </div>
  );
};

// 2. ComplianceMatrix - Regulatory compliance tracking and validation
const ComplianceMatrix: React.FC = () => {
  const [compliance, setCompliance] = useState<
    { id: number; standard: string; requirement: string; status: string; lastCheck: string; violations: number }[]
  >([]);

  useEffect(() => {
    const standards = ['SOX', 'SOC 2', 'GDPR', 'HIPAA', 'PCI DSS', 'ISO 27001'];
    const requirements = ['Access Control', 'Data Encryption', 'Audit Logging', 'Incident Response', 'Risk Assessment'];
    const statuses = ['Compliant', 'Non-Compliant', 'Under Review', 'Remediated'];

    const generateCompliance = () => {
      const newCompliance = Array.from({ length: 6 }, (_, i) => ({
        id: i,
        standard: standards[Math.floor(Math.random() * standards.length)],
        requirement: requirements[Math.floor(Math.random() * requirements.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        lastCheck: new Date(Date.now() - Math.random() * 86400000).toLocaleDateString(),
        violations: Math.floor(Math.random() * 5),
      }));
      setCompliance(newCompliance);
    };

    generateCompliance();
    const interval = setInterval(generateCompliance, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-3xl border border-orange-500/20 overflow-hidden">
      <div className="absolute inset-0">
        {/* Compliance Grid */}
        <svg className="w-full h-full" viewBox="0 0 400 300">
          <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
            <pattern id="matrix" width="25" height="25" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="none" stroke="#f59e0b" strokeWidth="0.5" opacity="0.1"/>
              <circle cx="12.5" cy="12.5" r="2" fill="#f59e0b" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#matrix)" />

          {/* Status Indicators */}
          {compliance.map((item, index) => (
            <g key={item.id}>
              <rect
                x={50 + (index % 3) * 100}
                y={50 + Math.floor(index / 3) * 80}
                width="60"
                height="30"
                fill={
                  item.status === 'Compliant' ? '#10b981' :
                  item.status === 'Non-Compliant' ? '#ef4444' :
                  item.status === 'Under Review' ? '#f59e0b' : '#6366f1'
                }
                opacity="0.6"
                rx="4"
                className="animate-pulse"
                style={{ animationDelay: `${index * 0.2}s` }}
              />
              <text
                x={80 + (index % 3) * 100}
                y={68 + Math.floor(index / 3) * 80}
                textAnchor="middle"
                fontSize="8"
                fill="#ffffff"
                fontFamily="monospace"
              >
                {item.standard}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="absolute top-4 left-4 right-4 text-xs font-mono text-orange-400">
        Compliance Matrix - Regulatory Tracking
      </div>

      <div className="absolute inset-0 p-4 pt-12 overflow-hidden">
        <div className="grid grid-cols-1 gap-2 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-orange-500/20">
          {compliance.map((item, index) => (
            <div key={item.id} className="bg-black/20 rounded-lg p-3 border border-orange-500/10 hover:border-orange-500/30 transition-all">
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-3 text-xs font-mono">
                  <span className="text-orange-300 font-bold">{item.standard}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    item.status === 'Compliant' ? 'bg-green-500/20 text-green-400' :
                    item.status === 'Non-Compliant' ? 'bg-red-500/20 text-red-400' :
                    item.status === 'Under Review' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="text-xs font-mono text-orange-400">
                  {item.violations} violations
                </div>
              </div>
              <div className="flex justify-between text-xs font-mono text-orange-200">
                <span>{item.requirement}</span>
                <span>Last check: {item.lastCheck}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-orange-300">
        <span>Compliance Monitoring</span>
        <span>{compliance.filter(c => c.status === 'Compliant').length}/{compliance.length} Compliant</span>
      </div>
    </div>
  );
};

// 3. ForensicTimeline - Timeline reconstruction of security events
const ForensicTimeline: React.FC = () => {
  const [timeline, setTimeline] = useState<
    { id: number; time: string; event: string; actor: string; impact: string; evidence: string }[]
  >([]);

  useEffect(() => {
    const events = ['User Login', 'File Access', 'Data Modification', 'Privilege Change', 'Security Alert'];
    const actors = ['System Admin', 'Regular User', 'Automated Process', 'External Service'];
    const impacts = ['Low', 'Medium', 'High', 'Critical'];
    const evidence = ['Log Entry', 'Network Packet', 'Database Record', 'System Event'];

    const generateTimeline = () => {
      const newTimeline = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        time: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString(),
        event: events[Math.floor(Math.random() * events.length)],
        actor: actors[Math.floor(Math.random() * actors.length)],
        impact: impacts[Math.floor(Math.random() * impacts.length)],
        evidence: evidence[Math.floor(Math.random() * evidence.length)],
      })).sort((a, b) => new Date('2024-01-01 ' + b.time).getTime() - new Date('2024-01-01 ' + a.time).getTime());
      setTimeline(newTimeline);
    };

    generateTimeline();
    const interval = setInterval(generateTimeline, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-red-900/20 to-pink-900/20 rounded-3xl border border-red-500/20 overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0idGltZWxpbmUiIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGxpbmUgeDE9IjE1IiB5MT0iMCIgeDI9IjE1IiB5Mj0iMzAiIHN0cm9rZT0iI2VmNDQ0NCIgc3Ryb2tlLXdpZHRoPSIxIiBvcGFjaXR5PSIwLjIiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjdGltZWxpbmUpIi8+PC9zdmc+')] opacity-20" />

      <div className="absolute top-4 left-4 right-4 text-xs font-mono text-red-400">
        Forensic Timeline - Event Reconstruction
      </div>

      <div className="absolute inset-0 p-4 pt-12 overflow-hidden">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-500/50 to-pink-500/50" />

          <div className="space-y-4 max-h-full overflow-y-auto scrollbar-thin scrollbar-thumb-red-500/20">
            {timeline.map((item, index) => (
              <div key={item.id} className="relative flex gap-4">
                {/* Timeline Dot */}
                <div className={`absolute left-6 w-4 h-4 rounded-full border-2 ${
                  item.impact === 'Critical' ? 'bg-red-500 border-red-400' :
                  item.impact === 'High' ? 'bg-orange-500 border-orange-400' :
                  item.impact === 'Medium' ? 'bg-yellow-500 border-yellow-400' :
                  'bg-green-500 border-green-400'
                } animate-pulse`} style={{ animationDelay: `${index * 0.1}s` }} />

                <div className="ml-16 bg-black/20 rounded-lg p-3 border border-red-500/10 hover:border-red-500/30 transition-all flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-3 text-xs font-mono">
                      <span className="text-red-300">{item.time}</span>
                      <span className="text-pink-400">{item.actor}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.impact === 'Critical' ? 'bg-red-500/20 text-red-400' :
                      item.impact === 'High' ? 'bg-orange-500/20 text-orange-400' :
                      item.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {item.impact}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-mono text-red-200">
                    <span>{item.event}</span>
                    <span className="text-pink-400">{item.evidence}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-red-300">
        <span>Timeline Analysis</span>
        <span>{timeline.length} Events Tracked</span>
      </div>
    </div>
  );
};

// 4. IntegrityVerification - Log integrity checking and tamper detection
const IntegrityVerification: React.FC = () => {
  const [verifications, setVerifications] = useState<
    { id: number; logFile: string; hash: string; status: string; lastVerified: string; integrity: number }[]
  >([]);

  useEffect(() => {
    const logFiles = ['auth.log', 'access.log', 'security.log', 'audit.log', 'system.log'];
    const statuses = ['Verified', 'Tampered', 'Pending', 'Failed'];

    const generateVerifications = () => {
      const newVerifications = Array.from({ length: 5 }, (_, i) => ({
        id: i,
        logFile: logFiles[Math.floor(Math.random() * logFiles.length)],
        hash: Math.random().toString(16).substr(2, 32).toUpperCase(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        lastVerified: new Date().toLocaleTimeString(),
        integrity: Math.floor(Math.random() * 20) + 80,
      }));
      setVerifications(newVerifications);
    };

    generateVerifications();
    const interval = setInterval(generateVerifications, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-pink-900/20 to-purple-900/20 rounded-3xl border border-pink-500/20 overflow-hidden">
      <div className="absolute inset-0">
        {/* Integrity Check Visualization */}
        <svg className="w-full h-full" viewBox="0 0 400 300">
          <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
            <radialGradient id="integrity" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
            </radialGradient>
          </defs>

          {/* Integrity Rings */}
          {verifications.map((ver, index) => (
            <circle
              key={ver.id}
              cx={100 + index * 60}
              cy={150}
              r="25"
              fill="none"
              stroke={
                ver.status === 'Verified' ? '#10b981' :
                ver.status === 'Tampered' ? '#ef4444' :
                ver.status === 'Pending' ? '#f59e0b' : '#6b7280'
              }
              strokeWidth="3"
              opacity="0.7"
              strokeDasharray={`${ver.integrity * 1.57} 157`}
              className="animate-pulse"
              style={{ animationDelay: `${index * 0.3}s` }}
            />
          ))}

          {/* Center Lock Icon */}
          <g transform="translate(180, 135)">
            <rect x="5" y="10" width="20" height="15" fill="none" stroke="#ec4899" strokeWidth="2" rx="2"/>
            <circle cx="15" cy="17.5" r="3" fill="#ec4899" opacity="0.8"/>
            <path d="M12 17.5 L15 20.5 L18 17.5" stroke="#ffffff" strokeWidth="1.5" fill="none"/>
          </g>
        </svg>
      </div>

      <div className="absolute top-4 left-4 right-4 text-xs font-mono text-pink-400">
        Integrity Verification - Tamper Detection
      </div>

      <div className="absolute inset-0 p-4 pt-12 overflow-hidden">
        <div className="space-y-2 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-pink-500/20">
          {verifications.map((ver, index) => (
            <div key={ver.id} className="bg-black/20 rounded-lg p-3 border border-pink-500/10 hover:border-pink-500/30 transition-all">
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-3 text-xs font-mono">
                  <span className="text-pink-300 font-bold">{ver.logFile}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    ver.status === 'Verified' ? 'bg-green-500/20 text-green-400' :
                    ver.status === 'Tampered' ? 'bg-red-500/20 text-red-400' :
                    ver.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {ver.status}
                  </span>
                </div>
                <div className="text-xs font-mono text-pink-400">
                  {ver.integrity}% integrity
                </div>
              </div>
              <div className="flex justify-between text-xs font-mono text-pink-200">
                <span>SHA256: {ver.hash.substring(0, 16)}...</span>
                <span>{ver.lastVerified}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-pink-300">
        <span>Log Integrity Check</span>
        <span>{verifications.filter(v => v.status === 'Verified').length}/{verifications.length} Verified</span>
      </div>
    </div>
  );
};

// 5. ReportGenerationEngine - Automated compliance reporting and analytics
const ReportGenerationEngine: React.FC = () => {
  const [reports, setReports] = useState<
    { id: number; type: string; period: string; status: string; generated: string; size: string }[]
  >([]);

  useEffect(() => {
    const types = ['Compliance Report', 'Audit Summary', 'Security Assessment', 'Risk Analysis', 'Executive Dashboard'];
    const periods = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual'];
    const statuses = ['Generated', 'Processing', 'Scheduled', 'Failed'];

    const generateReports = () => {
      const newReports = Array.from({ length: 4 }, (_, i) => ({
        id: i,
        type: types[Math.floor(Math.random() * types.length)],
        period: periods[Math.floor(Math.random() * periods.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        generated: new Date(Date.now() - Math.random() * 86400000).toLocaleString(),
        size: `${Math.floor(Math.random() * 50) + 10}MB`,
      }));
      setReports(newReports);
    };

    generateReports();
    const interval = setInterval(generateReports, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-3xl border border-purple-500/20 overflow-hidden">
      <div className="absolute inset-0">
        {/* Report Generation Flow */}
        <svg className="w-full h-full" viewBox="0 0 400 300">
          <defs>
<style>{`@keyframes spin-radar { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes transactionFlow { 0% { transform: translateY(-100%); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(100vh); opacity: 0; } }`}</style>
            <linearGradient id="flow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Flow Lines */}
          <path d="M50 100 L150 100 L150 200 L350 200" stroke="#8b5cf6" strokeWidth="3" fill="none" opacity="0.4" strokeDasharray="5,5" className="animate-pulse"/>
          <path d="M50 150 L250 150 L250 200" stroke="#6366f1" strokeWidth="3" fill="none" opacity="0.4" strokeDasharray="5,5" className="animate-pulse" style={{ animationDelay: '0.5s' }}/>

          {/* Processing Nodes */}
          <circle cx="50" cy="100" r="12" fill="#8b5cf6" opacity="0.8" className="animate-pulse"/>
          <circle cx="150" cy="100" r="12" fill="#6366f1" opacity="0.8" className="animate-pulse" style={{ animationDelay: '0.2s' }}/>
          <circle cx="250" cy="150" r="12" fill="#8b5cf6" opacity="0.8" className="animate-pulse" style={{ animationDelay: '0.4s' }}/>
          <circle cx="350" cy="200" r="12" fill="#6366f1" opacity="0.8" className="animate-pulse" style={{ animationDelay: '0.6s' }}/>

          {/* Document Icons */}
          <g transform="translate(330, 180)">
            <rect x="0" y="0" width="16" height="20" fill="#8b5cf6" opacity="0.6" rx="2"/>
            <rect x="3" y="5" width="10" height="2" fill="#ffffff" opacity="0.8"/>
            <rect x="3" y="9" width="8" height="2" fill="#ffffff" opacity="0.8"/>
            <rect x="3" y="13" width="6" height="2" fill="#ffffff" opacity="0.8"/>
          </g>
        </svg>
      </div>

      <div className="absolute top-4 left-4 right-4 text-xs font-mono text-purple-400">
        Report Generation Engine - Automated Compliance Reporting
      </div>

      <div className="absolute inset-0 p-4 pt-12 overflow-hidden">
        <div className="grid grid-cols-1 gap-2 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/20">
          {reports.map((report, index) => (
            <div key={report.id} className="bg-black/20 rounded-lg p-3 border border-purple-500/10 hover:border-purple-500/30 transition-all">
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-3 text-xs font-mono">
                  <span className="text-purple-300 font-bold">{report.type}</span>
                  <span className="text-indigo-400">{report.period}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    report.status === 'Generated' ? 'bg-green-500/20 text-green-400' :
                    report.status === 'Processing' ? 'bg-blue-500/20 text-blue-400' :
                    report.status === 'Scheduled' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {report.status}
                  </span>
                </div>
                <div className="text-xs font-mono text-purple-400">
                  {report.size}
                </div>
              </div>
              <div className="text-xs font-mono text-purple-200">
                Generated: {report.generated}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-purple-300">
        <span>Automated Reporting</span>
        <span>{reports.filter(r => r.status === 'Generated').length} Reports Ready</span>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AuditTrailProDetail: React.FC = () => {
  const { setView } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Live metrics state
  const [eventsLogged, setEventsLogged] = useState(1500000000);
  const [complianceViolations, setComplianceViolations] = useState(2500);
  const [integrityChecks, setIntegrityChecks] = useState(9800);
  const [auditAccuracy, setAuditAccuracy] = useState(99.7);

  useEffect(() => {
    // Live metrics simulation
    const eventsInterval = setInterval(() => {
      setEventsLogged(prev => prev + Math.floor(Math.random() * 500000) + 200000);
    }, 2000);

    const violationsInterval = setInterval(() => {
      setComplianceViolations(prev => prev + Math.floor(Math.random() * 20) + 5);
    }, 4000);

    const checksInterval = setInterval(() => {
      setIntegrityChecks(prev => prev + Math.floor(Math.random() * 50) + 20);
    }, 3000);

    const accuracyInterval = setInterval(() => {
      setAuditAccuracy(prev => Math.max(98, Math.min(99.9, prev + (Math.random() - 0.5) * 0.1)));
    }, 5000);

    return () => {
      clearInterval(eventsInterval);
      clearInterval(violationsInterval);
      clearInterval(checksInterval);
      clearInterval(accuracyInterval);
    };
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.from(heroTextRef.current?.children || [], {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power4.out',
      });

      // Content animations
      gsap.from(contentRef.current?.children || [], {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.3,
      });

      // Floating background elements
      gsap.to('.floating-bg-1', {
        y: '+=20',
        duration: 4,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1,
      });

      gsap.to('.floating-bg-2', {
        y: '+=30',
        duration: 6,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1,
        delay: 1,
      });

      gsap.to('.floating-bg-3', {
        x: '+=15',
        duration: 5,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1,
        delay: 2,
      });

    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#0d0a04] text-white selection:bg-amber-500/30 font-sans overflow-hidden"
    >
      {/* Epic Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Primary gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-orange-900/10 to-red-900/20" />

        {/* Animated floating elements */}
        <div className="floating-bg-1 absolute top-[10%] left-[5%] w-96 h-96 bg-amber-600/5 blur-[100px] rounded-full" />
        <div className="floating-bg-2 absolute top-[60%] right-[10%] w-[500px] h-[500px] bg-orange-600/5 blur-[120px] rounded-full" />
        <div className="floating-bg-3 absolute bottom-[20%] left-[50%] w-80 h-80 bg-red-600/5 blur-[80px] rounded-full" />

        {/* Data stream particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-amber-400/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZjU5ZTAwIiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIgb3BhY2l0eT0iMC4wMyIvPjwvc3ZnPg==')] opacity-30" />

        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-24">
          <button
            onClick={() => setView('home')}
            className="group flex items-center gap-3 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
            to Ecosystem
          </button>
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-white/40">
            AuditTrailPro v2.0
          </span>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 md:gap-24 items-center mb-40">
          <div ref={heroTextRef} className="space-y-10">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass border border-amber-500/20 backdrop-blur-3xl">
              <ClipboardList className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-amber-500">
                Comprehensive Audit Logging
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
              AUDIT <span className="text-amber-500">TRAIL PRO</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-xl">
              Advanced audit logging platform with tamper-proof logs, real-time monitoring,
              and automated compliance reporting for enterprise security and regulatory requirements.
            </p>
            <div className="flex gap-6 pt-4">
              <a
                href="https://audittrailpro.maula.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-amber-500 text-black rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:brightness-125 transition-all shadow-2xl shadow-amber-500/20"
              >
                Start Logging
              </a>
              <div className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-white/10 transition-all">
                Retention: 7 Years
              </div>
            </div>
          </div>

          {/* Hero Visualization */}
          <div className="relative group aspect-square rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl">
            <AuditEventStream />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
          </div>
        </div>

        {/* Live Stats Section */}
        <div ref={contentRef} className="space-y-40 mb-40">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-24 border-y border-white/10 text-center">
            <div>
              <div className="text-5xl font-black text-amber-500">
                {(eventsLogged / 1000000000).toFixed(1)}B+
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                Events Logged
              </div>
            </div>
            <div>
              <div className="text-5xl font-black text-white">
                {complianceViolations.toLocaleString()}+
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                Compliance Violations
              </div>
            </div>
            <div>
              <div className="text-5xl font-black text-white">
                {integrityChecks.toLocaleString()}+
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                Integrity Checks
              </div>
            </div>
            <div>
              <div className="text-5xl font-black text-white">
                {auditAccuracy.toFixed(1)}%
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">
                Audit Accuracy
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-amber-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Tamper-Proof Logs</h3>
              <p className="text-white/50 leading-relaxed">
                Cryptographically signed and immutable audit logs that meet the strictest
                regulatory requirements including SOX, SOC 2, and ISO 27001 compliance.
              </p>
            </div>
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-amber-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Forensic Search</h3>
              <p className="text-white/50 leading-relaxed">
                Lightning-fast search across billions of events with advanced filtering,
                timeline reconstruction, and correlation analysis for incident investigation.
              </p>
            </div>
            <div className="space-y-8 glass p-10 rounded-[3rem] border border-white/5 hover:border-amber-500/20 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <BarChart3 className="w-8 h-8" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Compliance Reporting</h3>
              <p className="text-white/50 leading-relaxed">
                Automated generation of compliance reports, audit summaries, and executive
                dashboards with real-time monitoring of regulatory requirements.
              </p>
            </div>
          </div>

          {/* Audit Trail Pro Engine Visualization */}
          <div className="space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-6xl md:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase">
                Audit Trail Pro <span className="text-amber-500">Engine</span>
              </h2>
              <p className="text-xl text-white/60 max-w-3xl mx-auto">
                Enterprise-grade audit logging platform with tamper-proof storage,
                real-time monitoring, and automated compliance reporting.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Engine Components */}
              <div className="space-y-8">
                <ComplianceMatrix />
                <ForensicTimeline />
              </div>
              <div className="space-y-8">
                <IntegrityVerification />
                <ReportGenerationEngine />
              </div>
            </div>

            {/* Capability Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-16 border-y border-amber-500/10">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <Database className="w-10 h-10 text-amber-500" />
                </div>
                <div className="text-3xl font-black text-amber-500">7 Years</div>
                <div className="text-sm font-medium text-white/60 uppercase tracking-wide">Retention</div>
                <div className="text-xs text-white/40">Regulatory compliant storage</div>
              </div>
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <Shield className="w-10 h-10 text-amber-500" />
                </div>
                <div className="text-3xl font-black text-amber-500">Cryptographic</div>
                <div className="text-sm font-medium text-white/60 uppercase tracking-wide">Integrity</div>
                <div className="text-xs text-white/40">SHA-256 signed logs</div>
              </div>
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <Activity className="w-10 h-10 text-amber-500" />
                </div>
                <div className="text-3xl font-black text-amber-500">Real-Time</div>
                <div className="text-sm font-medium text-white/60 uppercase tracking-wide">Monitoring</div>
                <div className="text-xs text-white/40">Live event streaming</div>
              </div>
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <CheckSquare className="w-10 h-10 text-amber-500" />
                </div>
                <div className="text-3xl font-black text-amber-500">SOX/SOC2</div>
                <div className="text-sm font-medium text-white/60 uppercase tracking-wide">Compliant</div>
                <div className="text-xs text-white/40">Regulatory certified</div>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="glass rounded-[3rem] border border-white/5 p-12">
              <div className="text-center mb-6 sm:mb-8 md:mb-12">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4">Audit Control Center</h3>
                <p className="text-white/60">Real-time audit monitoring and compliance management interface</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-black/20 rounded-2xl p-6 border border-amber-500/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-amber-500">1.2B</div>
                      <div className="text-xs font-medium text-white/60 uppercase tracking-wide">Events Today</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Normal</span>
                      <span className="text-amber-400">98.7%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: '98.7%' }} />
                    </div>
                  </div>
                </div>
                <div className="bg-black/20 rounded-2xl p-6 border border-amber-500/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-red-500">47</div>
                      <div className="text-xs font-medium text-white/60 uppercase tracking-wide">Critical Violations</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-white/60">Latest: Unauthorized access attempt</div>
                    <div className="text-xs text-red-400">Immediate investigation required</div>
                  </div>
                </div>
                <div className="bg-black/20 rounded-2xl p-6 border border-amber-500/10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-green-500">99.8%</div>
                      <div className="text-xs font-medium text-white/60 uppercase tracking-wide">Compliance Score</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-white/60">All SOX controls validated</div>
                    <div className="text-xs text-green-400">Audit ready</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center py-40 border-t border-white/10">
          <button onClick={() => setView('home')} className="px-16 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:bg-white/10 transition-all">
            Return Home
          </button>
          <a href="https://audittrailpro.maula.ai" target="_blank" rel="noopener noreferrer" className="px-16 py-8 bg-amber-500 text-black rounded-[2.5rem] font-black text-sm tracking-[0.4em] uppercase hover:brightness-110 shadow-2xl shadow-amber-500/20 flex items-center gap-4">
            View Audit Logs <ClipboardList className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default AuditTrailProDetail;
