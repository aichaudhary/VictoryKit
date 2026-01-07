import { useState } from 'react';
import {
  Building2,
  Search,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  Globe,
  Calendar,
  MoreVertical,
  Scan,
  Trash2,
  Edit,
  ArrowUpRight,
} from 'lucide-react';
import type { Organization, Industry } from '../types';
import { GRADE_COLORS, INDUSTRIES } from '../constants';

// Mock data
const mockOrganizations: Organization[] = [
  {
    id: 'org-1',
    name: 'Acme Corporation',
    domain: 'acme.com',
    industry: 'technology',
    size: 'enterprise',
    score: { overall: 78, grade: 'C', factors: [], calculated_at: '2024-03-15', trend: 'improving', change_30d: 3 },
    vendor_count: 47,
    created_at: '2023-01-15',
    updated_at: '2024-03-15',
    last_scanned: '2024-03-15T10:30:00Z',
    is_primary: true,
  },
  {
    id: 'org-2',
    name: 'TechStart Inc',
    domain: 'techstart.io',
    industry: 'technology',
    size: 'medium',
    score: { overall: 85, grade: 'B', factors: [], calculated_at: '2024-03-14', trend: 'stable', change_30d: 0 },
    vendor_count: 23,
    created_at: '2023-06-20',
    updated_at: '2024-03-14',
    last_scanned: '2024-03-14T15:45:00Z',
    is_primary: false,
  },
  {
    id: 'org-3',
    name: 'HealthFirst Medical',
    domain: 'healthfirst.med',
    industry: 'healthcare',
    size: 'large',
    score: { overall: 92, grade: 'A', factors: [], calculated_at: '2024-03-15', trend: 'improving', change_30d: 5 },
    vendor_count: 31,
    created_at: '2023-03-10',
    updated_at: '2024-03-15',
    last_scanned: '2024-03-15T08:00:00Z',
    is_primary: false,
  },
  {
    id: 'org-4',
    name: 'FinanceHub',
    domain: 'financehub.com',
    industry: 'finance',
    size: 'large',
    score: { overall: 68, grade: 'D', factors: [], calculated_at: '2024-03-13', trend: 'declining', change_30d: -4 },
    vendor_count: 56,
    created_at: '2022-11-05',
    updated_at: '2024-03-13',
    last_scanned: '2024-03-13T12:15:00Z',
    is_primary: false,
  },
];

export function OrganizationsPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState<Industry | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredOrgs = mockOrganizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.domain.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = industryFilter === 'all' || org.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Building2 className="w-7 h-7 text-amber-500" />
            Organizations
          </h1>
          <p className="text-gray-400 mt-1">Monitor security posture across your organizations</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Organization
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A1A1F] border border-[#2A2A2F] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>
        <select
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value as Industry | 'all')}
          className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
        >
          <option value="all">All Industries</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind.value} value={ind.value}>
              {ind.label}
            </option>
          ))}
        </select>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredOrgs.map((org) => (
          <OrganizationCard key={org.id} organization={org} />
        ))}
      </div>

      {/* Empty State */}
      {filteredOrgs.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No organizations found</p>
          <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Add Organization Modal */}
      {showAddModal && (
        <AddOrganizationModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}

function OrganizationCard({ organization }: { organization: Organization }) {
  const [showMenu, setShowMenu] = useState(false);
  const { score } = organization;

  const getIndustryLabel = (industry: Industry) => {
    return INDUSTRIES.find((i) => i.value === industry)?.label || industry;
  };

  return (
    <div className="bg-[#1A1A1F] rounded-xl border border-[#2A2A2F] p-5 hover:border-amber-500/30 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* Score Badge */}
          <div
            className="w-14 h-14 rounded-xl flex flex-col items-center justify-center"
            style={{ backgroundColor: GRADE_COLORS[score.grade] + '20' }}
          >
            <span className="text-2xl font-bold" style={{ color: GRADE_COLORS[score.grade] }}>
              {score.grade}
            </span>
            <span className="text-xs text-gray-400">{score.overall}</span>
          </div>

          {/* Org Info */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">{organization.name}</h3>
              {organization.is_primary && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-500 text-xs rounded-full">
                  Primary
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
              <Globe className="w-4 h-4" />
              {organization.domain}
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-[#252529] rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 bg-[#252529] border border-[#2A2A2F] rounded-lg py-1 w-40 z-10">
              <button className="w-full flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-[#2A2A2F]">
                <Scan className="w-4 h-4" />
                Rescan
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-[#2A2A2F]">
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-[#2A2A2F]">
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-gray-500 text-xs">Industry</p>
          <p className="text-white text-sm">{getIndustryLabel(organization.industry)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Vendors</p>
          <p className="text-white text-sm">{organization.vendor_count}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">30d Change</p>
          <div className="flex items-center gap-1">
            {score.change_30d > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : score.change_30d < 0 ? (
              <TrendingDown className="w-4 h-4 text-red-500" />
            ) : (
              <Minus className="w-4 h-4 text-gray-500" />
            )}
            <span
              className={`text-sm ${
                score.change_30d > 0
                  ? 'text-green-500'
                  : score.change_30d < 0
                  ? 'text-red-500'
                  : 'text-gray-500'
              }`}
            >
              {score.change_30d > 0 ? '+' : ''}
              {score.change_30d}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[#2A2A2F]">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Calendar className="w-4 h-4" />
          Last scanned: {new Date(organization.last_scanned).toLocaleDateString()}
        </div>
        <button className="flex items-center gap-1 text-amber-500 hover:text-amber-400 text-sm font-medium">
          View Details
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function AddOrganizationModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [industry, setIndustry] = useState<Industry>('technology');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // API call would go here
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#1A1A1F] border border-[#2A2A2F] rounded-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Add Organization</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Organization Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter organization name"
              className="w-full bg-[#252529] border border-[#2A2A2F] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Primary Domain</label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="w-full bg-[#252529] border border-[#2A2A2F] rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Industry</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value as Industry)}
              className="w-full bg-[#252529] border border-[#2A2A2F] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind.value} value={ind.value}>
                  {ind.label}
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
              Add Organization
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
