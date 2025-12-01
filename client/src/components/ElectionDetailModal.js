import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  User, 
  Award, 
  CheckCircle, 
  AlertCircle,
  Download,
  Bell,
  Vote,
  ExternalLink
} from 'lucide-react';
import { notificationService, calendarExportService } from '../utils/notificationService';

const ElectionDetailModal = ({ election, isOpen, onClose, onVoteClick }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isNotificationSet, setIsNotificationSet] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !election) return null;

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getTurnoutPercentage = () => {
    return Math.round((election.votesCast / election.totalVoters) * 100);
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      upcoming: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || colors.upcoming;
  };

  const handleNotificationToggle = async () => {
    if (!isNotificationSet) {
      try {
        const hasPermission = await notificationService.requestPermission();
        if (hasPermission) {
          const reminderId = notificationService.scheduleElectionReminder(election, 60); // 1 hour before
          if (reminderId) {
            setIsNotificationSet(true);
            console.log(`Notification set for election: ${election.title}`);
          }
        } else {
          alert('Please enable notifications in your browser settings to receive election reminders.');
        }
      } catch (error) {
        console.error('Error setting notification:', error);
        alert('Unable to set notification. Please check your browser settings.');
      }
    } else {
      // Cancel existing notification
      const reminderId = `election_${election.id}_60`;
      const cancelled = notificationService.cancelReminder(reminderId);
      if (cancelled) {
        setIsNotificationSet(false);
        console.log(`Notification removed for election: ${election.title}`);
      }
    }
  };

  const handleCalendarExport = () => {
    try {
      calendarExportService.exportToCalendar(election, 'google');
    } catch (error) {
      console.error('Error exporting to calendar:', error);
      alert('Unable to export to calendar. Please try again.');
    }
  };

  const startDateTime = formatDateTime(election.startDate);
  const endDateTime = formatDateTime(election.endDate);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{election.title}</h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(election.status)}`}>
                {election.status === 'active' && <Vote className="w-4 h-4 mr-1" />}
                {election.status === 'upcoming' && <Clock className="w-4 h-4 mr-1" />}
                {election.status === 'completed' && <CheckCircle className="w-4 h-4 mr-1" />}
                <span className="capitalize">{election.status}</span>
              </span>
            </div>
            <p className="text-gray-600">{election.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar */}
          <div className="lg:w-1/3 border-r border-gray-200">
            {/* Quick Actions */}
            <div className="p-6 border-b border-gray-200">
              <div className="space-y-3">
                {election.status === 'active' && (
                  <button
                    onClick={() => onVoteClick && onVoteClick(election)}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <Vote className="w-5 h-5 mr-2" />
                    Vote Now
                  </button>
                )}
                
                <button
                  onClick={handleCalendarExport}
                  className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Add to Calendar
                </button>
                
                <button
                  onClick={handleNotificationToggle}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center ${
                    isNotificationSet 
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  {isNotificationSet ? 'Notification Set' : 'Set Reminder'}
                </button>
              </div>
            </div>

            {/* Key Information */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Information</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Start Date</p>
                    <p className="text-sm text-gray-600">{startDateTime.date}</p>
                    <p className="text-sm text-gray-500">{startDateTime.time}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">End Date</p>
                    <p className="text-sm text-gray-600">{endDateTime.date}</p>
                    <p className="text-sm text-gray-500">{endDateTime.time}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-600">{election.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Organizer</p>
                    <p className="text-sm text-gray-600">{election.organizer}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Participants</p>
                    <p className="text-sm text-gray-600">{election.candidates} candidates</p>
                    <p className="text-sm text-gray-600">{election.totalVoters} eligible voters</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'positions', label: 'Positions' },
                  { id: 'rules', label: 'Rules & Eligibility' },
                  { id: 'progress', label: 'Progress' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">About This Election</h4>
                    <p className="text-gray-600 leading-relaxed">{election.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-gray-900 mb-2">Voting Statistics</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Votes Cast:</span>
                          <span className="font-medium">{election.votesCast}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Voters:</span>
                          <span className="font-medium">{election.totalVoters}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Turnout:</span>
                          <span className="font-medium">{getTurnoutPercentage()}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-gray-900 mb-2">Election Details</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Candidates:</span>
                          <span className="font-medium">{election.candidates}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Positions:</span>
                          <span className="font-medium">{election.positions?.length || 1}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="font-medium capitalize">{election.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'positions' && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Available Positions</h4>
                  <div className="space-y-3">
                    {election.positions?.map((position, index) => (
                      <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg">
                        <Award className="w-5 h-5 text-blue-500 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">{position}</p>
                          <p className="text-sm text-gray-600">Open for candidates</p>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8">
                        <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Position details not available</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'rules' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Eligibility Criteria</h4>
                    <p className="text-gray-600 bg-blue-50 p-4 rounded-lg">{election.eligibility}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Voting Rules</h4>
                    <ul className="space-y-2">
                      {election.rules?.map((rule, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{rule}</span>
                        </li>
                      )) || (
                        <li className="text-gray-500">No specific rules listed</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'progress' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">Voting Progress</h4>
                      <span className="text-2xl font-bold text-blue-600">{getTurnoutPercentage()}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${getTurnoutPercentage()}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>{election.votesCast} votes cast</span>
                      <span>{election.totalVoters} total eligible</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                        <div>
                          <p className="font-semibold text-green-900">Votes Cast</p>
                          <p className="text-2xl font-bold text-green-600">{election.votesCast}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Users className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                          <p className="font-semibold text-blue-900">Remaining Voters</p>
                          <p className="text-2xl font-bold text-blue-600">{election.totalVoters - election.votesCast}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectionDetailModal;