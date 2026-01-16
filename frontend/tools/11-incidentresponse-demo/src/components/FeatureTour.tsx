/**
 * Feature Tour Component
 * Highlights key features for demo visitors
 */

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Sparkles, Brain, Zap, Shield, BarChart3, Users } from 'lucide-react';

interface FeatureTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Our advanced AI automatically analyzes incidents, identifies threat patterns, and provides intelligent recommendations for faster response.',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  {
    icon: Zap,
    title: 'Automated Playbooks',
    description: 'Execute pre-configured response playbooks with one click. Automate containment, investigation, and remediation tasks.',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
  },
  {
    icon: Shield,
    title: 'Real-Time Threat Intelligence',
    description: 'Integrated threat intelligence correlates indicators across multiple sources for comprehensive threat understanding.',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Track MTTR, incident trends, and team performance with detailed dashboards and customizable reports.',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Assign incidents, coordinate response teams, and communicate in real-time with built-in collaboration tools.',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
  },
];

export function FeatureTour({ isOpen, onClose }: FeatureTourProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) return null;

  const currentFeature = features[currentIndex];
  const Icon = currentFeature.icon;

  const goNext = () => setCurrentIndex(i => (i + 1) % features.length);
  const goPrev = () => setCurrentIndex(i => (i - 1 + features.length) % features.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-gray-900 rounded-2xl w-full max-w-md border border-primary-500/30 shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-400" />
            <span className="text-white font-medium">Feature Tour</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <div className={`w-20 h-20 ${currentFeature.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
            <Icon className={`w-10 h-10 ${currentFeature.color}`} />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">{currentFeature.title}</h3>
          <p className="text-gray-400 leading-relaxed">{currentFeature.description}</p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 pb-4">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-primary-500 w-6' : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-4 border-t border-gray-800">
          <button
            onClick={goPrev}
            className="flex items-center gap-1 px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="text-gray-500 text-sm">
            {currentIndex + 1} / {features.length}
          </span>
          <button
            onClick={goNext}
            className="flex items-center gap-1 px-4 py-2 text-primary-400 hover:text-primary-300 transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
