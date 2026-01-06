
import React, { useState } from 'react';
import { Shield, ChevronRight, Check, Zap, Building2, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small teams getting started with security.',
    monthlyPrice: 99,
    yearlyPrice: 79,
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
    features: [
      '5 security tools',
      'Up to 10 users',
      '1,000 scans/month',
      'Email support',
      'Basic dashboards',
      'Weekly reports',
      '7-day data retention',
    ],
    cta: 'Start Free Trial'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing companies with advanced security needs.',
    monthlyPrice: 299,
    yearlyPrice: 249,
    icon: Building2,
    color: 'from-purple-500 to-pink-500',
    popular: true,
    features: [
      '25 security tools',
      'Up to 50 users',
      '10,000 scans/month',
      'Priority support',
      'Advanced dashboards',
      'Real-time alerts',
      '30-day data retention',
      'API access',
      'SSO integration',
    ],
    cta: 'Start Free Trial'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Full security suite for large organizations.',
    monthlyPrice: null,
    yearlyPrice: null,
    icon: Crown,
    color: 'from-amber-500 to-orange-500',
    features: [
      'All 50+ security tools',
      'Unlimited users',
      'Unlimited scans',
      'Dedicated support',
      'Custom dashboards',
      'AI threat hunting',
      '1-year data retention',
      'Full API access',
      'Custom integrations',
      'On-premise option',
      'SLA guarantee',
    ],
    cta: 'Contact Sales'
  },
];

const faqs = [
  { q: 'Can I switch plans later?', a: 'Yes, you can upgrade or downgrade at any time. Changes take effect immediately.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, wire transfers, and purchase orders for Enterprise.' },
  { q: 'Is there a free trial?', a: 'Yes! All plans include a 14-day free trial with full access to all features.' },
  { q: 'Do you offer discounts for non-profits?', a: 'Yes, we offer 50% off for verified non-profit organizations.' },
];

const Pricing: React.FC = () => {
  const { setView } = useAuth();
  const [isYearly, setIsYearly] = useState(true);

  return (
    <div className="min-h-screen bg-[#02000a] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-[100] bg-[#02000a]/80 backdrop-blur-xl border-b border-white/5 px-6 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('landing')}>
          <div className="bg-purple-600 p-2 rounded-lg">
            <Shield className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white uppercase">Maula<span className="text-purple-500">.ai</span></span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <span onClick={() => setView('products')} className="hover:text-white cursor-pointer transition-colors">Products</span>
          <span onClick={() => setView('solutions')} className="hover:text-white cursor-pointer transition-colors">Solutions</span>
          <span onClick={() => setView('docs')} className="hover:text-white cursor-pointer transition-colors">Docs</span>
          <span className="text-white border-b-2 border-purple-500 pb-1">Pricing</span>
        </nav>

        <div className="flex items-center gap-4">
          <button onClick={() => setView('login')} className="text-sm font-medium text-white hover:text-purple-400 transition-colors">Log in</button>
          <button onClick={() => setView('signup')} className="bg-white text-black text-sm font-bold px-5 py-2 rounded-full flex items-center gap-2 hover:bg-purple-50 transition-all">
            Get Started <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-12 px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Simple, Transparent<br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Pricing</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            No hidden fees. No surprises. Choose the plan that fits your security needs.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-4 bg-white/5 rounded-full p-2">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${!isYearly ? 'bg-purple-600 text-white' : 'text-gray-400'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${isYearly ? 'bg-purple-600 text-white' : 'text-gray-400'}`}
            >
              Yearly <span className="text-green-400 ml-1">-20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 md:px-12 pb-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative bg-white/5 border rounded-2xl p-8 ${
                plan.popular 
                  ? 'border-purple-500 ring-2 ring-purple-500/20' 
                  : 'border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}

              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6`}>
                <plan.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

              <div className="mb-8">
                {plan.monthlyPrice ? (
                  <>
                    <span className="text-5xl font-bold">${isYearly ? plan.yearlyPrice : plan.monthlyPrice}</span>
                    <span className="text-gray-400">/month</span>
                    {isYearly && <div className="text-green-400 text-sm mt-1">Billed annually</div>}
                  </>
                ) : (
                  <span className="text-3xl font-bold">Custom</span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => setView('signup')}
                className={`w-full py-4 rounded-xl font-bold transition-all ${
                  plan.popular 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 md:px-12 pb-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h4 className="font-bold mb-2">{faq.q}</h4>
                <p className="text-gray-400 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 pb-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-3xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Still have questions?</h2>
          <p className="text-gray-400 mb-8">Talk to our security experts and find the perfect plan for your organization.</p>
          <button 
            onClick={() => setView('signup')}
            className="bg-white text-black font-bold px-8 py-4 rounded-full hover:bg-purple-100 transition-colors"
          >
            Contact Sales
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
          <span>© 2026 MAULA.AI. All rights reserved.</span>
          <div className="flex gap-6">
            <span onClick={() => setView('landing')} className="hover:text-white cursor-pointer">Home</span>
            <span onClick={() => setView('products')} className="hover:text-white cursor-pointer">Products</span>
            <span onClick={() => setView('docs')} className="hover:text-white cursor-pointer">Docs</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
