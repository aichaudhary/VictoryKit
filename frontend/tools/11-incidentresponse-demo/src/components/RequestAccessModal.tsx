/**
 * Request Access Modal
 * Lead capture form for interested users
 */

import { useState } from 'react';
import { X, Send, Building2, User, Mail, MessageSquare, CheckCircle, Loader2 } from 'lucide-react';

interface RequestAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RequestAccessModal({ isOpen, onClose }: RequestAccessModalProps) {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    company: '',
    useCase: '',
    teamSize: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // In production, you would send this to your backend/CRM
    console.log('Lead captured:', formState);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900 rounded-2xl w-full max-w-lg border border-primary-500/30 shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">Request Full Access</h2>
            <p className="text-gray-400 text-sm mt-1">Get started with Incident Response</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Thank You!</h3>
              <p className="text-gray-400 mb-6">
                We've received your request. Our team will contact you within 24 hours to set up your account.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
              >
                Continue Exploring Demo
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    required
                    placeholder="John Smith"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Work Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    required
                    placeholder="john@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Company Name *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    name="company"
                    value={formState.company}
                    onChange={handleChange}
                    required
                    placeholder="Acme Corporation"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Team Size */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Security Team Size
                </label>
                <select
                  name="teamSize"
                  value={formState.teamSize}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                >
                  <option value="">Select team size</option>
                  <option value="1-5">1-5 analysts</option>
                  <option value="6-15">6-15 analysts</option>
                  <option value="16-50">16-50 analysts</option>
                  <option value="50+">50+ analysts</option>
                </select>
              </div>

              {/* Use Case */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tell us about your use case
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <textarea
                    name="useCase"
                    value={formState.useCase}
                    onChange={handleChange}
                    rows={3}
                    placeholder="What challenges are you looking to solve?"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Request Access
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                By submitting, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
