import { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Globe,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreVertical,
  ArrowUpRight,
  Mail,
  User,
  Tag,
} from 'lucide-react';
import type { Vendor, VendorTier, Criticality, VendorStatus } from '../types';
import { GRADE_COLORS, INDUSTRIES, VENDOR_TIERS } from '../constants';

// Mock data
const mockVendors: Vendor[] = [
  {
    id: 'v1',
    name: 'CloudCore Services',
    domain: 'cloudcore.io',
    industry: 'technology',
    relationship: 'service_provider',
    criticality: 'critical',
    tier: 1,
    status: 'active',
    score: { overall: 62, grade: 'D', factors: [], calculated_at: '2024-03-15', trend: 'declining', change_30d: -5 },
    last_assessed: '2024-03-10',
    next_review: '2024-04-10',
    contacts: [{ name: 'John Doe', email: 'john@cloudcore.io', role: 'Security Lead', is_primary: true }],
    tags: ['cloud', 'infrastructure', 'critical'],
    notes: 'Primary cloud infrastructure provider',
  },
  {
    id: 'v2',
    name: 'PaySecure Inc',
    domain: 'paysecure.com',
    industry: 'finance',
    relationship: 'partner',
    criticality: 'critical',
    tier: 1,
    status: 'under_review',
    score: { overall: 58, grade: 'F', factors: [], calculated_at: '2024-03-12', trend: 'stable', change_30d: 0 },
    last_assessed: '2024-03-12',
    next_review: '2024-04-12',
    contacts: [{ name: 'Jane Smith', email: 'jane@paysecure.com', role: 'CISO', is_primary: true }],
    tags: ['payment', 'pci', 'finance'],
    notes: 'Payment processing partner - PCI compliance required',
  },
  {
    id: 'v3',
    name: 'DataVault Storage',
    domain: 'datavault.net',
    industry: 'technology',
    relationship: 'supplier',
    criticality: 'high',
    tier: 2,
    status: 'active',
    score: { overall: 85, grade: 'B', factors: [], calculated_at: '2024-03-14', trend: 'improving', change_30d: 4 },
    last_assessed: '2024-03-14',
    next_review: '2024-06-14',
    contacts: [{ name: 'Mike Wilson', email: 'mike@datavault.net', role: 'Account Manager', is_primary: true }],
    tags: ['storage', 'backup', 'data'],
    notes: 'Backup storage provider',
  },
  {
    id: 'v4',
    name: 'SecureAuth Pro',
    domain: 'secureauth.io',
    industry: 'technology',
    relationship: 'service_provider',
    criticality: 'high',
    tier: 2,
    status: 'active',
    score: { overall: 91, grade: 'A', factors: [], calculated_at: '2024-03-15', trend: 'stable', change_30d: 1 },
    last_assessed: '2024-03-15',
    next_review: '2024-09-15',
    contacts: [{ name: 'Sarah Lee', email: 'sarah@secureauth.io', role: 'Support Lead', is_primary: true }],
    tags: ['authentication', 'sso', 'mfa'],
    notes: 'SSO and MFA provider',
  },
  {
    id: 'v5',
    name: 'LogStream Analytics',
    domain: 'logstream.dev',
    industry: 'technology',
    relationship: 'service_provider',
    criticality: 'medium',
    tier: 3,
    status: 'active',
    score: { overall: 76, grade: 'C', factors: [], calculated_at: '2024-03-13', trend: 'improving', change_30d: 2 },
    last_assessed: '2024-03-13',
    next_review: '2024-09-13',
    contacts: [],
    tags: ['logging', 'analytics', 'monitoring'],
    notes: 'Log aggregation and analytics platform',
  },
  {
    id: 'v6',
    name: 'OfficeSupply Co',
    domain: 'officesupply.com',
    industry: 'retail',
    relationship: 'supplier',
    criticality: 'low',
    tier: 4,
    status: 'active',
    score: { overall: 71, grade: 'C', factors: [], calculated_at: '2024-03-01', trend: 'stable', change_30d: 0 },
    last_assessed: '2024-03-01',
    next_review: '2025-03-01',
    contacts: [],
    tags: ['office', 'supplies'],
    notes: 'Office supplies vendor - no system access',
  },
];

export function VendorRiskPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<VendorTier | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<VendorStatus | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const filteredVendors = mockVendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.domain.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === 'all' || vendor.tier === tierFilter;
    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;
    return matchesSearch && matchesTier && matchesStatus;
  });

  // Stats
  const totalVendors = mockVendors.length;
  const criticalRisk = mockVendors.filter((v) => v.score.grade === 'F' || v.score.grade === 'D').length;
  const underReview = mockVendors.filter((v) => v.status === 'under_review').length;
  const avgScore = Math.round(mockVendors.reduce((sum, v) => sum + v.score.overall, 0) / totalVendors);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-amber-500" />
            Vendor Risk Management
          </h1>
          <p className="text-gray-400 mt-1">Monitor and manage third-party vendor security</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Vendor
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#1A1A1F] rounded-xl border border-[#2A2A2F] p-4">
          <p className="text-gray-400 text-sm mb-1">Total Vendors</p>
          <p className="text-2xl font-bold text-white">{totalVendors}</p>
        </div>
        <div className="bg-[#1A1A1F] rounded-xl border border-[#2A2A2F] p-4">
          <p className="text-gray-400 text-sm mb-1">High Risk</p>
          <p className="text-2xl font-bold text-red-500">{criticalRisk}</p>
        </div>
        <div className="bg-[#1A1A1F] rounded-xl border border-[#2A2A2F] p-4">
          <p className="text-gray-400 text-sm mb-1">Under Review</p>
          <p className="text-2xl font-bold text-amber-500">{underReview}</p>
        </div>
        <div className="bg-[#1A1A1F] rounded-xl border border-[#2A2A2F] p-4">
          <p className="text-gray-400 text-sm mb-1">Avg. Score</p>
          <p className="text-2xl font-bold text-white">{avgScore}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A1A1F] border border-[#2A2A2F] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <select
          value={tierFilter === 'all' ? 'all' : tierFilter.toString()}
          onChange={(e) => setTierFilter(e.target.value === 'all' ? 'all' : (Number(e.target.value) as VendorTier))}
          className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
        >
          <option value="all">All Tiers</option>
          {VENDOR_TIERS.map((t) => (
            <option key={t.tier} value={t.tier}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as VendorStatus | 'all')}
          className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="under_review">Under Review</option>
          <option value="probation">Probation</option>
          <option value="offboarded">Offboarded</option>
        </select>
      </div>

      {/* Vendors Table */}
      <div className="bg-[#1A1A1F] rounded-xl border border-[#2A2A2F] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2A2A2F]">
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Vendor</th>
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-4">Score</th>
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-4">Tier</th>
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-4">Status</th>
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-4">Trend</th>
              <th className="text-left text-gray-400 text-sm font-medium px-4 py-4">Last Assessed</th>
              <th className="text-right text-gray-400 text-sm font-medium px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map((vendor) => (
              <tr
                key={vendor.id}
                className="border-b border-[#2A2A2F] hover:bg-[#252529] cursor-pointer transition-colors"
                onClick={() => setSelectedVendor(vendor)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: GRADE_COLORS[vendor.score.grade] + '20' }}
                    >
                      <span
                        className="text-lg font-bold"
                        style={{ color: GRADE_COLORS[vendor.score.grade] }}
                      >
                        {vendor.score.grade}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{vendor.name}</p>
                      <p className="text-gray-500 text-sm flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {vendor.domain}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-white font-medium">{vendor.score.overall}</span>
                </td>
                <td className="px-4 py-4">
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: VENDOR_TIERS[vendor.tier - 1]?.color + '20',
                      color: VENDOR_TIERS[vendor.tier - 1]?.color,
                    }}
                  >
                    Tier {vendor.tier}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={vendor.status} />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    {vendor.score.trend === 'improving' ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : vendor.score.trend === 'declining' ? (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    ) : (
                      <Minus className="w-4 h-4 text-gray-500" />
                    )}
                    <span
                      className={`text-sm ${
                        vendor.score.change_30d > 0
                          ? 'text-green-500'
                          : vendor.score.change_30d < 0
                          ? 'text-red-500'
                          : 'text-gray-500'
                      }`}
                    >
                      {vendor.score.change_30d > 0 ? '+' : ''}
                      {vendor.score.change_30d}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-gray-400 text-sm">
                  {new Date(vendor.last_assessed).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 hover:bg-[#2A2A2F] rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vendor Detail Drawer */}
      {selectedVendor && (
        <VendorDetailDrawer
          vendor={selectedVendor}
          onClose={() => setSelectedVendor(null)}
        />
      )}

      {/* Add Vendor Modal */}
      {showAddModal && (
        <AddVendorModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: VendorStatus }) {
  const statusConfig = {
    active: { color: '#10B981', icon: CheckCircle, label: 'Active' },
    under_review: { color: '#F59E0B', icon: Clock, label: 'Under Review' },
    probation: { color: '#EF4444', icon: AlertTriangle, label: 'Probation' },
    offboarded: { color: '#6B7280', icon: User, label: 'Offboarded' },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
      style={{
        backgroundColor: config.color + '20',
        color: config.color,
      }}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

function VendorDetailDrawer({ vendor, onClose }: { vendor: Vendor; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex justify-end z-50">
      <div className="bg-[#1A1A1F] border-l border-[#2A2A2F] w-full max-w-lg overflow-y-auto">
        <div className="p-6 border-b border-[#2A2A2F] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex flex-col items-center justify-center"
              style={{ backgroundColor: GRADE_COLORS[vendor.score.grade] + '20' }}
            >
              <span
                className="text-2xl font-bold"
                style={{ color: GRADE_COLORS[vendor.score.grade] }}
              >
                {vendor.score.grade}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{vendor.name}</h2>
              <p className="text-gray-400 flex items-center gap-1">
                <Globe className="w-4 h-4" />
                {vendor.domain}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Score Section */}
          <div>
            <h3 className="text-white font-medium mb-3">Security Score</h3>
            <div className="bg-[#252529] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Current Score</span>
                <span className="text-2xl font-bold text-white">{vendor.score.overall}</span>
              </div>
              <div className="w-full bg-[#2A2A2F] rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${vendor.score.overall}%`,
                    backgroundColor: GRADE_COLORS[vendor.score.grade],
                  }}
                />
              </div>
            </div>
          </div>

          {/* Details */}
          <div>
            <h3 className="text-white font-medium mb-3">Details</h3>
            <div className="bg-[#252529] rounded-lg divide-y divide-[#2A2A2F]">
              <div className="p-3 flex justify-between">
                <span className="text-gray-400">Tier</span>
                <span className="text-white">{VENDOR_TIERS[vendor.tier - 1]?.label}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-gray-400">Criticality</span>
                <span className="text-white capitalize">{vendor.criticality}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-gray-400">Relationship</span>
                <span className="text-white capitalize">{vendor.relationship.replace('_', ' ')}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span className="text-gray-400">Next Review</span>
                <span className="text-white">{new Date(vendor.next_review).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Contacts */}
          {vendor.contacts.length > 0 && (
            <div>
              <h3 className="text-white font-medium mb-3">Contacts</h3>
              <div className="space-y-2">
                {vendor.contacts.map((contact, index) => (
                  <div key={index} className="bg-[#252529] rounded-lg p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{contact.name}</p>
                      <p className="text-gray-400 text-sm">{contact.role}</p>
                    </div>
                    <a
                      href={`mailto:${contact.email}`}
                      className="p-2 hover:bg-[#2A2A2F] rounded-lg transition-colors"
                    >
                      <Mail className="w-5 h-5 text-gray-400" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {vendor.tags.length > 0 && (
            <div>
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {vendor.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[#252529] text-gray-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {vendor.notes && (
            <div>
              <h3 className="text-white font-medium mb-3">Notes</h3>
              <p className="text-gray-400 bg-[#252529] rounded-lg p-4">{vendor.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-black font-medium transition-colors">
              Request Assessment
            </button>
            <button className="flex-1 px-4 py-2 border border-[#2A2A2F] rounded-lg text-white hover:bg-[#252529] transition-colors">
              View Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddVendorModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Add New Vendor</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Vendor Name</label>
            <input
              type="text"
              placeholder="Enter vendor name"
              className="w-full bg-[#252529] border border-[#2A2A2F] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Domain</label>
            <input
              type="text"
              placeholder="vendor.com"
              className="w-full bg-[#252529] border border-[#2A2A2F] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Tier</label>
            <select className="w-full bg-[#252529] border border-[#2A2A2F] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500">
              {VENDOR_TIERS.map((t) => (
                <option key={t.tier} value={t.tier}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#2A2A2F] rounded-lg text-gray-300 hover:bg-[#252529] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-lg text-black font-medium transition-colors"
            >
              Add Vendor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
