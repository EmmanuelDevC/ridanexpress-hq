import React, { useState } from 'react';
import { FaCrown, FaCheck, FaRocket, FaChartLine, FaHeadset, FaLock, FaTags, FaGlobe, FaShieldAlt, FaStore, FaTruck, FaGift, FaFileContract, FaUserTie } from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';

const Premium = () => {
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [activeTab, setActiveTab] = useState('features');
  const [isAnnual, setIsAnnual] = useState(true);

  // Jumia-style privileges for sellers
  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 0,
      period: 'Free Forever',
      description: 'For new sellers getting started',
      features: [
        'Basic product listings',
        'Standard customer support',
        'Basic analytics dashboard',
        '1% transaction fee',
        'Up to 50 products',
        'Email support (48h response)'
      ],
      cta: 'Current Plan',
      disabled: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: isAnnual ? 299 : 34.99,
      period: isAnnual ? 'per year' : 'per month',
      description: 'For growing businesses',
      popular: true,
      features: [
        'Enhanced search visibility',
        'Priority customer support',
        'Advanced analytics dashboard',
        '0.5% transaction fee',
        'Unlimited products',
        'Marketing tools access',
        '24/7 chat support',
        'Discounted shipping rates',
        'Featured in promotions'
      ],
      cta: 'Upgrade to Premium'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: isAnnual ? 899 : 99.99,
      period: isAnnual ? 'per year' : 'per month',
      description: 'For high-volume sellers',
      features: [
        'All Premium features',
        'Dedicated account manager',
        '0.25% transaction fee',
        'API access',
        'Custom store design',
        'Premium logistics support',
        'Exclusive promotions',
        'Multi-user access',
        'Advanced security features',
        'Training sessions'
      ],
      cta: 'Contact Sales'
    }
  ];

  const features = [
    {
      icon: <FaRocket className="text-xl text-indigo-400" />,
      title: 'Boosted Visibility',
      description: 'Get featured in premium seller listings and search results'
    },
    {
      icon: <FaChartLine className="text-xl text-green-400" />,
      title: 'Advanced Analytics',
      description: 'Track sales performance with detailed reports and insights'
    },
    {
      icon: <FaHeadset className="text-xl text-blue-400" />,
      title: 'Priority Support',
      description: '24/7 dedicated support with faster response times'
    },
    {
      icon: <FaLock className="text-xl text-purple-400" />,
      title: 'Enhanced Security',
      description: 'Advanced fraud protection and secure payment processing'
    },
    {
      icon: <FaTags className="text-xl text-orange-400" />,
      title: 'Marketing Tools',
      description: 'Access to promotional tools and sponsored product placements'
    },
    {
      icon: <FaTruck className="text-xl text-amber-400" />,
      title: 'Logistics Benefits',
      description: 'Discounted shipping rates and priority handling'
    }
  ];

  const testimonials = [
    {
      quote: "After upgrading to Premium, my sales increased by 65% in just two months. The premium features are worth every penny!",
      author: "Sarah Johnson",
      business: "Handmade Crafts Co.",
      plan: "Premium"
    },
    {
      quote: "The Enterprise plan gave us the tools we needed to scale our business. The dedicated account manager is invaluable.",
      author: "Michael Rodriguez",
      business: "Tech Gadgets Inc.",
      plan: "Enterprise"
    },
    {
      quote: "The analytics dashboard alone justified the upgrade. I can now make data-driven decisions to grow my business.",
      author: "Emma Thompson",
      business: "Fashion Boutique",
      plan: "Premium"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-gray-900 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium mb-4">
            <FaCrown className="mr-2" />
            Premium Seller Program
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Grow Your Business with Premium Features
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Unlock powerful tools and insights to increase your sales, optimize operations, and stand out from competitors.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="bg-gray-800 rounded-full p-1 inline-flex">
            <button 
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'features' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('features')}
            >
              Features
            </button>
            <button 
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'pricing' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('pricing')}
            >
              Pricing
            </button>
            <button 
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'testimonials' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('testimonials')}
            >
              Success Stories
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'features' && (
          <div className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700 transition-all duration-300 hover:border-indigo-500 hover:shadow-lg"
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-gray-700 p-3 rounded-lg mr-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                  </div>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="mb-16">
            <div className="flex justify-center mb-10">
              <div className="bg-gray-800 rounded-full p-1 inline-flex">
                <button 
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    !isAnnual ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setIsAnnual(false)}
                >
                  Monthly Billing
                </button>
                <button 
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    isAnnual ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setIsAnnual(true)}
                >
                  Annual Billing (Save 20%)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <div 
                  key={plan.id} 
                  className={`bg-gray-800 rounded-xl border-2 overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    plan.popular ? 'border-indigo-500' : 'border-gray-700'
                  }`}
                >
                  {plan.popular && (
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold py-2 px-4 text-center">
                      MOST POPULAR
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="flex items-end mb-4">
                      <span className="text-4xl font-extrabold text-white">${plan.price}</span>
                      <span className="text-gray-400 ml-2 text-sm">{plan.period}</span>
                    </div>
                    <p className="text-gray-400 mb-6">{plan.description}</p>
                    
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button 
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        plan.disabled 
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                          : plan.popular 
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                            : 'bg-gray-700 text-white hover:bg-gray-600'
                      }`}
                      disabled={plan.disabled}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'testimonials' && (
          <div className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-white">{testimonial.author}</h4>
                      <p className="text-sm text-gray-400">{testimonial.business}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 italic mb-4">"{testimonial.quote}"</p>
                  <div className="inline-flex items-center bg-indigo-900 text-indigo-200 px-3 py-1 rounded-full text-xs font-medium">
                    {testimonial.plan} Plan
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comparison Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Plan Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-3 px-4 text-left text-gray-400 font-medium">Features</th>
                  {plans.map(plan => (
                    <th key={plan.id} className="py-3 px-4 text-center font-bold text-white">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Product Listings', starter: '✓', premium: '✓', enterprise: '✓' },
                  { feature: 'Enhanced Visibility', starter: '✕', premium: '✓', enterprise: '✓' },
                  { feature: 'Priority Support', starter: '✕', premium: '✓', enterprise: '✓' },
                  { feature: 'Advanced Analytics', starter: 'Basic', premium: 'Advanced', enterprise: 'Premium' },
                  { feature: 'Marketing Tools', starter: 'Limited', premium: 'Full Access', enterprise: 'Full Access' },
                  { feature: 'Transaction Fee', starter: '1.0%', premium: '0.5%', enterprise: '0.25%' },
                  { feature: 'Dedicated Account Manager', starter: '✕', premium: '✕', enterprise: '✓' },
                  { feature: 'API Access', starter: '✕', premium: '✕', enterprise: '✓' },
                  { feature: 'Custom Store Design', starter: '✕', premium: 'Basic', enterprise: 'Advanced' },
                  { feature: 'Logistics Discounts', starter: '✕', premium: 'Up to 15%', enterprise: 'Up to 30%' },
                ].map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}>
                    <td className="py-3 px-4 text-gray-300">{row.feature}</td>
                    <td className="py-3 px-4 text-center text-gray-300">{row.starter}</td>
                    <td className="py-3 px-4 text-center text-indigo-300">{row.premium}</td>
                    <td className="py-3 px-4 text-center text-green-300">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6 max-w-4xl mx-auto">
            {[
              {
                question: "Can I switch plans later?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. Your billing will be prorated based on the changes."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for annual plans."
              },
              {
                question: "Is there a contract or long-term commitment?",
                answer: "No, all plans are month-to-month or annual with no long-term contracts. You can cancel anytime."
              },
              {
                question: "How does the free trial work?",
                answer: "The Premium plan comes with a 14-day free trial. You can explore all premium features without any charges. No credit card required to start the trial."
              },
              {
                question: "Can I get a discount for annual billing?",
                answer: "Yes! Annual billing comes with a 20% discount compared to monthly billing. This discount is applied automatically when you choose annual billing."
              }
            ].map((faq, index) => (
              <div key={index} className="border-b border-gray-700 pb-6">
                <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                <p className="text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-700 to-purple-800 rounded-2xl p-10 text-center mb-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Grow Your Business?</h2>
            <p className="text-xl text-indigo-200 mb-8">Join thousands of successful sellers using our premium features to boost sales and streamline operations.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-white text-indigo-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg transition-colors flex items-center justify-center">
                Start Free 14-Day Trial <FiArrowRight className="ml-2" />
              </button>
              <button className="bg-transparent border-2 border-white text-white hover:bg-indigo-800 font-bold py-3 px-8 rounded-lg transition-colors">
                Schedule a Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Premium;