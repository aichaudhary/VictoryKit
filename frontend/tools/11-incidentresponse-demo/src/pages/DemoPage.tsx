/**
 * Demo Page - Main landing page for Incident Response Demo
 * Showcases the platform capabilities with interactive demo data
 */

import { useState } from 'react';
import {
  AlertTriangle,
  Shield,
  Clock,
  Zap,
  Brain,
  TrendingUp,
  Users,
  PlayCircle,
  ArrowRight,
  Sparkles,
  ExternalLink,
  BarChart3,
  Target,
  BookOpen,
} from 'lucide-react';
import { DemoBanner } from '../components/DemoBanner';
import { RequestAccessModal } from '../components/RequestAccessModal';
import { FeatureTour } from '../components/FeatureTour';
import { StatsCard } from '../components/StatsCard';
import { IncidentCard } from '../components/IncidentCard';
import { IncidentDetailModal } from '../components/IncidentDetailModal';
import { PlaybookCard } from '../components/PlaybookCard';
import { ActivityFeed } from '../components/ActivityFeed';
import {
  demoIncidents,
  demoPlaybooks,
  dashboardStats,
  teamMembers,
  type Incident,
} from '../api/demoData';

export function DemoPage() {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showFeatureTour, setShowFeatureTour] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'incidents' | 'playbooks'>('dashboard');

  const handleIncidentClick = (incident: Incident) => {
    setSelectedIncident(incident);
  };

  const handlePlaybookExecute = (playbook: typeof demoPlaybooks[0]) => {
    console.log('Executing playbook:', playbook.name);
    // In production, this would trigger actual playbook execution
  };

  return (
    <div className="min-h-screen">
      {/* Demo Banner */}
      <DemoBanner onRequestAccess={() => setShowRequestModal(true)} />

      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">Incident Response</h1>
                <p className="text-gray-500 text-xs">AI-Powered Security Platform</p>
              </div>
            </div>

            {/* Nav Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              {(['dashboard', 'incidents', 'playbooks'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                    activeTab === tab
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFeatureTour(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">Tour</span>
              </button>
              <button
                onClick={() => setShowRequestModal(true)}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
              >
                Get Access
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <section className="text-center py-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 rounded-full text-primary-400 text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                AI-Powered Security Operations
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Respond to Incidents <span className="gradient-text">70% Faster</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
                Transform your security operations with AI-driven incident detection, automated response playbooks, and real-time threat intelligence.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => setActiveTab('incidents')}
                  className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium flex items-center gap-2 transition-all"
                >
                  <PlayCircle className="w-5 h-5" />
                  Explore Demo
                </button>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium flex items-center gap-2 transition-all"
                >
                  Request Full Access
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </section>

            {/* Stats Grid */}
            <section>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-400" />
                Security Operations Dashboard
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                  title="Active Incidents"
                  value={dashboardStats.openIncidents}
                  icon={<AlertTriangle className="w-5 h-5" />}
                  trend="up"
                  trendValue="+3"
                  color="rose"
                />
                <StatsCard
                  title="Critical Alerts"
                  value={dashboardStats.criticalIncidents}
                  icon={<Shield className="w-5 h-5" />}
                  trend="up"
                  trendValue="+1"
                  color="orange"
                />
                <StatsCard
                  title="Avg. Response Time"
                  value={dashboardStats.mttr}
                  icon={<Clock className="w-5 h-5" />}
                  trend="down"
                  trendValue="-15%"
                  color="green"
                />
                <StatsCard
                  title="AI Assisted"
                  value={`${dashboardStats.aiAssisted}%`}
                  icon={<Brain className="w-5 h-5" />}
                  trend="up"
                  trendValue="+5%"
                  color="purple"
                />
              </div>
            </section>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Recent Incidents */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary-400" />
                    Recent Incidents
                  </h3>
                  <button
                    onClick={() => setActiveTab('incidents')}
                    className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center gap-1"
                  >
                    View All <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid gap-4">
                  {demoIncidents.slice(0, 3).map(incident => (
                    <IncidentCard
                      key={incident.id}
                      incident={incident}
                      onClick={handleIncidentClick}
                    />
                  ))}
                </div>
              </div>

              {/* Activity Feed */}
              <div>
                <ActivityFeed />
              </div>
            </div>

            {/* Team Section */}
            <section>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-400" />
                Response Team
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {teamMembers.map((member, index) => (
                  <div key={index} className="glass-card rounded-xl p-4 text-center">
                    <span className="text-3xl mb-2 block">{member.avatar}</span>
                    <p className="text-white font-medium text-sm">{member.name}</p>
                    <p className="text-gray-500 text-xs">{member.role}</p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <span className={`w-2 h-2 rounded-full ${
                        member.status === 'online' ? 'bg-green-500' :
                        member.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                      <span className="text-xs text-gray-400">{member.activeIncidents} active</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Features Section */}
            <section className="py-8">
              <h3 className="text-white font-semibold mb-6 text-center text-2xl">
                Why Choose Our Platform?
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="glass-card rounded-xl p-6 text-center">
                  <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-7 h-7 text-purple-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">AI-Powered Detection</h4>
                  <p className="text-gray-400 text-sm">
                    Advanced ML models analyze threats and prioritize incidents automatically
                  </p>
                </div>
                <div className="glass-card rounded-xl p-6 text-center">
                  <div className="w-14 h-14 bg-yellow-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-7 h-7 text-yellow-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Automated Response</h4>
                  <p className="text-gray-400 text-sm">
                    One-click playbook execution for rapid containment and remediation
                  </p>
                </div>
                <div className="glass-card rounded-xl p-6 text-center">
                  <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-7 h-7 text-blue-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Actionable Insights</h4>
                  <p className="text-gray-400 text-sm">
                    Real-time dashboards and analytics for informed decision-making
                  </p>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="glass-card rounded-2xl p-8 text-center border-primary-500/30">
              <h3 className="text-2xl font-bold text-white mb-3">
                Ready to Transform Your Security Operations?
              </h3>
              <p className="text-gray-400 mb-6 max-w-xl mx-auto">
                Join leading organizations using our AI-powered incident response platform to reduce MTTR by 70% and improve threat detection accuracy.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium flex items-center gap-2 transition-all"
                >
                  Request Demo Access
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowFeatureTour(true)}
                  className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium flex items-center gap-2 transition-all"
                >
                  <BookOpen className="w-5 h-5" />
                  Learn More
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Incidents Tab */}
        {activeTab === 'incidents' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Security Incidents</h2>
                <p className="text-gray-400">Manage and respond to security events</p>
              </div>
              <div className="flex items-center gap-3">
                <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm">
                  <option>All Severities</option>
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
                <select className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm">
                  <option>All Statuses</option>
                  <option>Open</option>
                  <option>Investigating</option>
                  <option>Contained</option>
                  <option>Closed</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {demoIncidents.map(incident => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  onClick={handleIncidentClick}
                />
              ))}
            </div>

            {/* Create Incident CTA */}
            <div className="glass-card rounded-xl p-6 text-center border-dashed border-2 border-gray-700">
              <AlertTriangle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <h4 className="text-white font-medium mb-2">Create New Incident</h4>
              <p className="text-gray-500 text-sm mb-4">
                In the full version, you can create incidents manually or via API integrations
              </p>
              <button
                onClick={() => setShowRequestModal(true)}
                className="px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg font-medium text-sm hover:bg-primary-500/30 transition-all"
              >
                Request Full Access
              </button>
            </div>
          </div>
        )}

        {/* Playbooks Tab */}
        {activeTab === 'playbooks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Response Playbooks</h2>
                <p className="text-gray-400">Automated response workflows for common incidents</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {demoPlaybooks.map(playbook => (
                <PlaybookCard
                  key={playbook.id}
                  playbook={playbook}
                  onExecute={handlePlaybookExecute}
                />
              ))}
            </div>

            {/* Custom Playbook CTA */}
            <div className="glass-card rounded-xl p-6 text-center border-dashed border-2 border-gray-700">
              <BookOpen className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <h4 className="text-white font-medium mb-2">Create Custom Playbook</h4>
              <p className="text-gray-500 text-sm mb-4">
                Design custom response workflows tailored to your organization's needs
              </p>
              <button
                onClick={() => setShowRequestModal(true)}
                className="px-4 py-2 bg-primary-500/20 text-primary-400 rounded-lg font-medium text-sm hover:bg-primary-500/30 transition-all"
              >
                Request Full Access
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-400 text-sm">
                Incident Response by <span className="text-white font-medium">MAULA.AI</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="https://maula.ai" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Main Platform
              </a>
              <a href="https://maula.ai/docs" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Documentation
              </a>
              <a href="https://maula.ai/contact" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RequestAccessModal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} />
      <FeatureTour isOpen={showFeatureTour} onClose={() => setShowFeatureTour(false)} />
      <IncidentDetailModal
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onExecutePlaybook={() => {
          setSelectedIncident(null);
          setActiveTab('playbooks');
        }}
      />
    </div>
  );
}
