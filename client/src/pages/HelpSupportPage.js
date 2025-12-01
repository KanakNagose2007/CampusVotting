import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Book,
  Video,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

const HelpSupportPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openFAQ, setOpenFAQ] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium'
  });

  const categories = [
    { id: 'all', name: 'All Topics', icon: Book },
    { id: 'voting', name: 'Voting', icon: MessageCircle },
    { id: 'registration', name: 'Registration', icon: FileText },
    { id: 'technical', name: 'Technical Issues', icon: AlertTriangle },
    { id: 'account', name: 'Account', icon: HelpCircle },
    { id: 'elections', name: 'Elections', icon: Clock }
  ];

  const faqs = [
    {
      id: 1,
      category: 'voting',
      question: 'How do I cast my vote?',
      answer: 'To cast your vote, log in to your account, navigate to the "Voting" section, select the election you want to participate in, review the candidates, and click "Vote" next to your preferred candidate. Make sure to confirm your choice before submitting.',
      tags: ['voting', 'how-to', 'elections']
    },
    {
      id: 2,
      category: 'registration',
      question: 'How do I register as a voter?',
      answer: 'To register as a voter, click on "Register" on the homepage, fill out the registration form with your personal details, upload a clear photo of your student ID, verify your email address, and wait for admin approval. You will receive an email notification once your registration is approved.',
      tags: ['registration', 'voter', 'student-id']
    },
    {
      id: 3,
      category: 'technical',
      question: 'What should I do if I cannot log in?',
      answer: 'If you cannot log in, first check that you are using the correct email and password. If you have forgotten your password, use the "Forgot Password" link on the login page. If the issue persists, try clearing your browser cache or using a different browser. Contact support if the problem continues.',
      tags: ['login', 'password', 'technical', 'troubleshooting']
    },
    {
      id: 4,
      category: 'account',
      question: 'How do I update my profile information?',
      answer: 'To update your profile, go to the "Profile" section after logging in, click "Edit Profile", make your changes, and save. Note that some information like roll number and branch may require admin approval for changes.',
      tags: ['profile', 'update', 'account']
    },
    {
      id: 5,
      category: 'elections',
      question: 'When will the election results be announced?',
      answer: 'Election results are typically announced within 24-48 hours after the voting period ends. You can check the "Results" section or your dashboard for updates. Official results will also be sent via email to all registered voters.',
      tags: ['results', 'elections', 'announcement']
    },
    {
      id: 6,
      category: 'voting',
      question: 'Can I change my vote after submitting?',
      answer: 'No, once you submit your vote, it cannot be changed. This is to ensure the integrity and security of the voting process. Please review your choice carefully before confirming your vote.',
      tags: ['voting', 'change', 'security']
    },
    {
      id: 7,
      category: 'technical',
      question: 'The website is loading slowly. What should I do?',
      answer: 'Slow loading can be due to high traffic during peak voting hours. Try refreshing the page, clearing your browser cache, or using a different internet connection. If the problem persists, contact our technical support team.',
      tags: ['slow', 'loading', 'performance', 'technical']
    },
    {
      id: 8,
      category: 'registration',
      question: 'What documents do I need for registration?',
      answer: 'You need a clear, readable photo of your valid student ID card. The ID should show your name, roll number, branch, and year clearly. Make sure the photo is well-lit and all text is legible.',
      tags: ['documents', 'student-id', 'registration']
    },
    {
      id: 9,
      category: 'account',
      question: 'How do I change my password?',
      answer: 'To change your password, go to your profile settings, click on "Security", then "Change Password". Enter your current password and your new password twice for confirmation. Make sure your new password is strong and unique.',
      tags: ['password', 'security', 'account']
    },
    {
      id: 10,
      category: 'elections',
      question: 'How do I know if I am eligible to vote?',
      answer: 'Your eligibility is determined by your year, branch, and academic standing. You can check your eligibility status in your dashboard. If you believe you should be eligible but are not, contact the election committee or support team.',
      tags: ['eligibility', 'voting', 'requirements']
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    console.log('Contact form submitted:', contactForm);
    // Handle form submission
    alert('Your message has been sent! We will get back to you within 24 hours.');
    setContactForm({
      name: '',
      email: '',
      subject: '',
      message: '',
      priority: 'medium'
    });
  };

  const handleInputChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Help & Support</h1>
        <p className="text-gray-600">
          Find answers to common questions, get help with technical issues, or contact our support team.
        </p>
      </div>

      {/* Search and Categories */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FAQ Section */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">Try adjusting your search terms or browse different categories.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <div key={faq.id} className="card">
                  <button
                    onClick={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
                    className="w-full text-left flex justify-between items-center"
                  >
                    <h3 className="text-lg font-medium text-gray-900 pr-4">{faq.question}</h3>
                    {openFAQ === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  
                  {openFAQ === faq.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-gray-700 mb-4">{faq.answer}</p>
                      <div className="flex flex-wrap gap-2">
                        {faq.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact & Resources */}
        <div className="space-y-6">
          {/* Contact Form */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Support</h3>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={contactForm.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={contactForm.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={contactForm.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={contactForm.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Describe your issue or question..."
                />
              </div>
              
              <button
                type="submit"
                className="w-full btn btn-primary"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Get in Touch</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email Support</p>
                  <p className="text-sm text-gray-600">support@campusvote.edu</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Phone Support</p>
                  <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Support Hours</p>
                  <p className="text-sm text-gray-600">Mon-Fri: 9AM-6PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-3">
              <a
                href="#"
                className="flex items-center space-x-3 text-primary-600 hover:text-primary-700"
              >
                <Book className="w-4 h-4" />
                <span className="text-sm">User Guide</span>
                <ExternalLink className="w-3 h-3 ml-auto" />
              </a>
              
              <a
                href="#"
                className="flex items-center space-x-3 text-primary-600 hover:text-primary-700"
              >
                <Video className="w-4 h-4" />
                <span className="text-sm">Video Tutorials</span>
                <ExternalLink className="w-3 h-3 ml-auto" />
              </a>
              
              <a
                href="#"
                className="flex items-center space-x-3 text-primary-600 hover:text-primary-700"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm">System Status</span>
                <ExternalLink className="w-3 h-3 ml-auto" />
              </a>
            </div>
          </div>

          {/* System Status */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Voting System</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Operational</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Registration</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Operational</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email Service</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Operational</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportPage;
