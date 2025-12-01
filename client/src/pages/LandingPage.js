import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Vote, 
  MapPin, 
  Users, 
  BarChart3, 
  Lock,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-primary-600" />,
      title: 'Secure Voting',
      description: 'End-to-end encryption and blockchain-like security ensures your vote remains confidential and tamper-proof.'
    },
    {
      icon: <Vote className="w-8 h-8 text-primary-600" />,
      title: 'Easy Voting Process',
      description: 'Simple, intuitive interface makes voting quick and accessible for all students.'
    },
    {
      icon: <MapPin className="w-8 h-8 text-primary-600" />,
      title: 'Booth Locator',
      description: 'Find your assigned voting booth quickly with our smart location system.'
    },
    {
      icon: <Users className="w-8 h-8 text-primary-600" />,
      title: 'Real-time Results',
      description: 'Live vote counting and transparent results display for complete election transparency.'
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-primary-600" />,
      title: 'Analytics Dashboard',
      description: 'Comprehensive insights and statistics for administrators and voters alike.'
    },
    {
      icon: <Lock className="w-8 h-8 text-primary-600" />,
      title: 'ID Verification',
      description: 'Multi-factor authentication and ID verification ensures only eligible voters can participate.'
    }
  ];

  const benefits = [
    'Eliminate voter fraud and booth confusion',
    'Increase student participation and engagement',
    'Provide real-time election transparency',
    'Reduce administrative overhead and costs',
    'Ensure accessibility for off-campus students',
    'Maintain complete audit trails and security'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gradient">CampusVote</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="btn btn-ghost"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Revolutionize Campus
              <span className="text-gradient block">Voting</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your college elections with our secure, transparent, and user-friendly 
              online voting platform. Say goodbye to long queues and hello to digital democracy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn btn-primary btn-lg group"
              >
                Start Voting Today
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="btn btn-outline btn-lg"
              >
                Access Your Account
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full opacity-20 blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose CampusVote?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform combines cutting-edge technology with user experience to deliver 
              the most reliable campus voting solution available.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card group hover:shadow-medium transition-all duration-300">
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Benefits for Your Institution
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                CampusVote isn't just a voting platform—it's a comprehensive solution that 
                addresses the real challenges faced by educational institutions during elections.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-success-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="card bg-gradient-primary text-white p-8">
                <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                <p className="text-primary-100 mb-6">
                  Join hundreds of institutions already using CampusVote to modernize 
                  their electoral processes.
                </p>
                <Link
                  to="/register"
                  className="btn bg-white text-primary-600 hover:bg-gray-100"
                >
                  Create Your Account
                </Link>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-success-200 rounded-full opacity-60 animate-bounce-gentle"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-warning-200 rounded-full opacity-60 animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Transform Your Campus Elections Today
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Experience the future of democratic voting with CampusVote. 
            Secure, transparent, and accessible for everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg"
            >
              Start Free Trial
            </Link>
            <Link
              to="/login"
              className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 btn-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gradient mb-4">CampusVote</h3>
            <p className="text-gray-400 mb-6">
              Empowering democratic participation through secure digital voting
            </p>
            <div className="border-t border-gray-800 pt-6">
              <p className="text-gray-500 text-sm">
                © 2025 CampusVote. All rights reserved. Built By Team TechHexa for better democracy.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
