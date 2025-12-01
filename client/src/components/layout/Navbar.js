import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Menu, 
  Bell, 
  User, 
  LogOut, 
  Vote,
  Settings,
  ChevronDown,
  Award,
  Calendar,
  MapPin,
  History
} from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  const { user, logout, getCandidateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCandidate, setIsCandidate] = useState(false);
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Check if user is a candidate
  useEffect(() => {
    if (user) {
      getCandidateProfile()
        .then(data => {
          if (data && data.candidate) {
            setIsCandidate(true);
          }
        })
        .catch(() => setIsCandidate(false));
    }
  }, [user, getCandidateProfile]);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      // For shadow effect when scrolled
      setIsScrolled(window.scrollY > 10);
      
      // For hiding navbar on scroll down and showing on scroll up
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setNavbarVisible(false);
      } else {
        setNavbarVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get current page for highlighting in quick nav
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.includes('candidates')) return 'candidates';
    if (path.includes('elections')) return 'elections';
    if (path.includes('voting-history')) return 'history';
    return '';
  };

  const currentPage = getCurrentPage();

  // Mock notifications for demo
  const notifications = [
    { id: 1, title: 'New Election', message: 'Student Council Election is now open for voting', time: '2 hours ago', read: false },
    { id: 2, title: 'Vote Cast', message: 'Your vote has been recorded successfully', time: '1 day ago', read: true },
    { id: 3, title: 'Candidate Approved', message: 'Your candidacy has been approved', time: '2 days ago', read: true }
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''} 
      ${navbarVisible ? 'translate-y-0' : '-translate-y-full'} 
      bg-white/95 backdrop-blur-sm border-b border-gray-200`}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Menu button and Logo */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors duration-200"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="ml-4 flex items-center">
              <Link to="/dashboard" className="flex items-center group">
                <Vote className="w-8 h-8 text-primary-600 mr-2 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-xl font-bold text-gradient">CampusVote</span>
              </Link>
            </div>
          </div>

          {/* Center - Quick Navigation (visible on medium screens and up) */}
          <div className="hidden md:flex items-center space-x-1 navbar-flowing">
            <Link 
              to="/candidates" 
              className={`px-3 py-2 rounded-md text-sm font-medium navbar-item ${currentPage === 'candidates' ? 'text-primary-700 navbar-item-active' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <div className="flex items-center">
                <Award className="w-4 h-4 mr-1" />
                <span>Candidates</span>
              </div>
            </Link>
            
            <Link 
              to="/elections" 
              className={`px-3 py-2 rounded-md text-sm font-medium navbar-item ${currentPage === 'elections' ? 'text-primary-700 navbar-item-active' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Elections</span>
              </div>
            </Link>
            
            <Link 
              to="/voting-history" 
              className={`px-3 py-2 rounded-md text-sm font-medium navbar-item ${currentPage === 'history' ? 'text-primary-700 navbar-item-active' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <div className="flex items-center">
                <History className="w-4 h-4 mr-1" />
                <span>History</span>
              </div>
            </Link>
          </div>

          {/* Right side - User menu and notifications */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Candidate Badge - Show if user is a candidate */}
            {isCandidate && (
              <div className="hidden sm:flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                <Award className="w-3 h-3 mr-1" />
                <span>Candidate</span>
              </div>
            )}
            
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors duration-200"
                aria-label="Notifications"
              >
                <Bell className="w-6 h-6" />
                {/* Notification badge */}
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              
              {/* Notifications dropdown */}
              <div className={`absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 max-h-96 overflow-y-auto transform transition-all duration-200 origin-top-right ${notificationsOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
                  <div className="px-4 py-2 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                      <span className="text-xs text-primary-600 cursor-pointer hover:text-primary-800">Mark all as read</span>
                    </div>
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">No new notifications</div>
                  ) : (
                    <>
                      <div>
                        {notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                          >
                            <div className="flex justify-between">
                              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                              <p className="text-xs text-gray-500">{notification.time}</p>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          </div>
                        ))}
                      </div>
                    
                      <div className="px-4 py-2 border-t border-gray-200">
                    <Link 
                      to="/notifications" 
                      className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                </>
                )}
              </div>
            </div>

            {/* User menu */}
            <div className="relative">
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors duration-200"
                    aria-label="User menu"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm transition-transform duration-200 hover:scale-105">
                      {user?.photoUrl ? (
                        <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-primary-600" />
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown menu with animation */}
                  <div className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 transform transition-all duration-200 origin-top-right ${dropdownOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </Link>
                      
                      {!isCandidate && (
                        <Link
                          to="/candidate-registration"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                        >
                          <Award className="w-4 h-4 mr-3" />
                          Register as Candidate
                        </Link>
                      )}
                      
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Admin Panel
                        </Link>
                      )}
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Logout
                      </button>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
