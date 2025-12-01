import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ElectionDetailModal from '../components/ElectionDetailModal';
import { 
  Calendar, 
  Clock, 
  Users, 
  Vote, 
  Award,
  Filter,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Search,
  Bell,
  Download,
  RefreshCw,
  Grid,
  List
} from 'lucide-react';

const ElectionCalendarPage = () => {
  const { user } = useAuth();
  const [elections, setElections] = useState([]);
  const [filteredElections, setFilteredElections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, list
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElection, setSelectedElection] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [electionType, setElectionType] = useState('all');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [error, setError] = useState(null);

  const fetchElections = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/elections/public', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const electionsData = Array.isArray(data) ? data : data.elections || [];
        setElections(electionsData);
        setError(null);
        console.log('Successfully fetched elections:', electionsData.length, 'elections');
      } else if (response.status === 401) {
        setError('Unauthorized access. Please login to view elections.');
        setElections([]);
      } else if (response.status === 404) {
        setError('Election service not available. Please try again later.');
        setElections([]);
      } else {
        setError(`Failed to fetch elections: ${response.statusText}`);
        setElections([]);
      }
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('An unexpected error occurred while fetching elections.');
      }
      console.error('Error fetching elections:', error);
      setElections([]);
    } finally {
      setIsLoading(false);
      setLastRefresh(new Date());
    }
  };

  const refreshElections = () => {
    fetchElections();
  };

  useEffect(() => {
    fetchElections();
  }, [filterStatus]);


  const statusColors = {
    active: 'bg-green-100 text-green-800 border-green-200',
    upcoming: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-gray-100 text-gray-800 border-gray-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200'
  };

  const statusIcons = {
    active: <Vote className="w-4 h-4" />,
    upcoming: <Clock className="w-4 h-4" />,
    completed: <CheckCircle className="w-4 h-4" />,
    cancelled: <XCircle className="w-4 h-4" />
  };

  // Filter and search elections
  useEffect(() => {
    let filtered = elections;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(election => 
        election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        election.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        election.organizer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(election => election.status === filterStatus);
    }
    
    // Filter by type
    if (electionType !== 'all') {
      filtered = filtered.filter(election => getElectionType(election) === electionType);
    }
    
    // Filter by date range
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      filtered = filtered.filter(election => {
        const electionStart = new Date(election.startDate);
        const electionEnd = new Date(election.endDate);
        return (electionStart >= startDate && electionStart <= endDate) ||
               (electionEnd >= startDate && electionEnd <= endDate);
      });
    }
    
    setFilteredElections(filtered);
  }, [elections, searchTerm, filterStatus, electionType, dateRange]);
  
  useEffect(() => {
    fetchElections();
  }, [filterStatus]);

  // Auto-refresh elections every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchElections();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Fetch elections on component mount
  useEffect(() => {
    fetchElections();
  }, []);

  // Modal handlers
  const openElectionModal = (election) => {
    setSelectedElection(election);
    setIsModalOpen(true);
  };
  
  const closeElectionModal = () => {
    setSelectedElection(null);
    setIsModalOpen(false);
  };
  
  const handleVoteClick = (election) => {
    // Navigate to voting page or handle voting logic
    console.log('Navigating to vote for:', election.title);
    closeElectionModal();
  };

  // Navigate to election date in calendar
  const navigateToElectionDate = (election) => {
    const electionDate = new Date(election.startDate);
    setCurrentDate(electionDate);
    setViewMode('month');
  };

  // Get unique election dates for current filtered elections
  const getElectionDatesInRange = () => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return filteredElections
      .filter(election => {
        const electionDate = new Date(election.startDate);
        return electionDate.getMonth() === currentMonth && electionDate.getFullYear() === currentYear;
      })
      .map(election => ({
        date: new Date(election.startDate).getDate(),
        election: election
      }))
      .sort((a, b) => a.date - b.date);
  };

  // Get months that contain filtered elections
  const getMonthsWithElections = () => {
    const months = new Map();
    
    filteredElections.forEach(election => {
      const electionDate = new Date(election.startDate);
      const monthKey = `${electionDate.getFullYear()}-${electionDate.getMonth()}`;
      const monthName = electionDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!months.has(monthKey)) {
        months.set(monthKey, {
          date: new Date(electionDate.getFullYear(), electionDate.getMonth(), 1),
          name: monthName,
          count: 0
        });
      }
      months.get(monthKey).count++;
    });
    
    return Array.from(months.values()).sort((a, b) => a.date - b.date);
  };

  // Navigate to month containing elections
  const navigateToMonth = (date) => {
    setCurrentDate(date);
    setViewMode('month');
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getElectionsForDate = (date) => {
    if (!date) return [];
    
    const dateStr = date.toISOString().split('T')[0];
    return filteredElections.filter(election => {
      const startDate = new Date(election.startDate).toISOString().split('T')[0];
      const endDate = new Date(election.endDate).toISOString().split('T')[0];
      return dateStr >= startDate && dateStr <= endDate;
    });
  };

  // Get all elections for the current month to show on calendar
  const getAllElectionsForDate = (date) => {
    if (!date) return [];
    
    const dateStr = date.toISOString().split('T')[0];
    return elections.filter(election => {
      const startDate = new Date(election.startDate).toISOString().split('T')[0];
      const endDate = new Date(election.endDate).toISOString().split('T')[0];
      return dateStr >= startDate && dateStr <= endDate;
    });
  };

  // Check if a date has any searched elections
  const hasSearchedElections = (date) => {
    if (!date) return false;
    const electionsOnDate = getElectionsForDate(date);
    return electionsOnDate.length > 0 && (searchTerm || filterStatus !== 'all' || electionType !== 'all');
  };

  // Get election type color based on positions
  const getElectionTypeColor = (election) => {
    const typeColors = {
      'President': 'bg-blue-100 text-blue-800 border-blue-200',
      'General Secretary': 'bg-green-100 text-green-800 border-green-200', 
      'Cultural Secretary': 'bg-purple-100 text-purple-800 border-purple-200',
      'Sports Secretary': 'bg-orange-100 text-orange-800 border-orange-200',
      'default': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    // Use the first position to determine color
    const firstPosition = election.positions && election.positions[0];
    return typeColors[firstPosition] || typeColors.default;
  };

  // Get election type display name
  const getElectionType = (election) => {
    if (!election.positions || election.positions.length === 0) return 'Election';
    
    if (election.positions.includes('President') || election.positions.includes('Vice President')) {
      return 'Student Council';
    }
    
    if (election.positions.some(pos => pos.includes('Secretary'))) {
      return 'Committee';
    }
    
    return election.positions[0] || 'Election';
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTurnoutPercentage = (election) => {
    if (!election.totalVoters || election.totalVoters === 0) return 0;
    return Math.round((election.totalVotesCast / election.totalVoters) * 100);
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const hasActiveFilters = searchTerm || filterStatus !== 'all' || electionType !== 'all';
    
    return (
      <div className="space-y-4">
        {/* Calendar Legend */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-50 border-2 border-blue-300 rounded"></div>
                <span className="text-sm text-gray-600">Today</span>
              </div>
              {hasActiveFilters && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-50 border-2 border-yellow-300 rounded"></div>
                  <span className="text-sm text-gray-600">Search Results</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
                <span className="text-sm text-gray-600">Has Elections</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 text-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
                  <span className="text-gray-600">Student Council</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
                  <span className="text-gray-600">General Secretary</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-purple-100 border border-purple-200 rounded"></div>
                  <span className="text-gray-600">Committee</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div>
                  <span className="text-gray-600">Sports Secretary</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Calendar */}
        <div className="bg-white rounded-lg shadow">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{monthName}</h2>
              {hasActiveFilters && (
                <p className="text-sm text-yellow-600 mt-1">
                  ✨ Highlighting search results on calendar
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
          
          {days.map((day, index) => {
            const allElectionsForDay = getAllElectionsForDate(day);
            const filteredElectionsForDay = getElectionsForDate(day);
            const isToday = day && day.toDateString() === new Date().toDateString();
            const hasSearchResults = hasSearchedElections(day);
            const hasAnyElections = allElectionsForDay.length > 0;
            
            return (
              <div
                key={index}
                className={`p-2 min-h-[120px] border-r border-b border-gray-200 ${
                  isToday 
                    ? 'bg-blue-50 border-2 border-blue-300' 
                    : hasSearchResults 
                    ? 'bg-yellow-50 border-2 border-yellow-300' 
                    : hasAnyElections 
                    ? 'bg-gray-50' 
                    : 'bg-white'
                }`}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-2 flex justify-between items-center ${
                      isToday 
                        ? 'text-blue-700' 
                        : hasSearchResults 
                        ? 'text-yellow-700'
                        : hasAnyElections 
                        ? 'text-gray-700' 
                        : 'text-gray-900'
                    }`}>
                      <span>{day.getDate()}</span>
                      {hasAnyElections && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-1 rounded">
                          {allElectionsForDay.length}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {/* Show filtered elections first if there's a search/filter active */}
                      {filteredElectionsForDay.length > 0 ? (
                        <>
                          {filteredElectionsForDay.slice(0, 3).map(election => (
                            <div
                              key={`filtered_${election.id}`}
                              onClick={() => openElectionModal(election)}
                              className={`text-xs p-1.5 rounded cursor-pointer hover:opacity-90 transition-all border ${
                                getElectionTypeColor(election)
                              } ${
                                hasSearchResults ? 'ring-1 ring-yellow-400 shadow-sm' : ''
                              }`}
                              title={`${election.title} - ${getElectionType(election)}`}
                            >
                              <div className="font-medium truncate">{election.title}</div>
                              <div className="text-xs opacity-75 truncate">
                                {getElectionType(election)} • {formatTime(new Date(election.startDate))}
                              </div>
                            </div>
                          ))}
                          {filteredElectionsForDay.length > 3 && (
                            <div className="text-xs text-center py-1 text-gray-500 bg-gray-100 rounded">
                              +{filteredElectionsForDay.length - 3} more elections
                            </div>
                          )}
                        </>
                      ) : (
                        /* Show all elections if no filters are active */
                        <>
                          {allElectionsForDay.slice(0, 3).map(election => (
                            <div
                              key={`all_${election.id}`}
                              onClick={() => openElectionModal(election)}
                              className={`text-xs p-1.5 rounded cursor-pointer hover:opacity-90 transition-all border ${
                                getElectionTypeColor(election)
                              }`}
                              title={`${election.title} - ${getElectionType(election)}`}
                            >
                              <div className="font-medium truncate">{election.title}</div>
                              <div className="text-xs opacity-75 truncate">
                                {getElectionType(election)} • {formatTime(new Date(election.startDate))}
                              </div>
                            </div>
                          ))}
                          {allElectionsForDay.length > 3 && (
                            <div className="text-xs text-center py-1 text-gray-500 bg-gray-100 rounded">
                              +{allElectionsForDay.length - 3} more elections
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
        </div>
      </div>
    );
  };

  const renderListView = () => (
    <div className="space-y-4">
      {filteredElections.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No elections found</p>
          <p className="text-gray-400">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        filteredElections.map(election => (
        <div key={election.id} className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{election.title}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[election.status]}`}>
                  {statusIcons[election.status]}
                  <span className="ml-1 capitalize">{election.status}</span>
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{election.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(new Date(election.startDate))}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatTime(new Date(election.startDate))}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">End Date</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(new Date(election.endDate))}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatTime(new Date(election.endDate))}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Positions</p>
                  <p className="font-medium text-gray-900">{election.positions ? election.positions.length : 0}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Turnout</p>
                  <p className="font-medium text-gray-900">
                    {election.totalVoters > 0 ? Math.round((election.totalVotesCast / election.totalVoters) * 100) : 0}%
                  </p>
                  <p className="text-sm text-gray-500">
                    {election.totalVotesCast || 0} / {election.totalVoters || 0}
                  </p>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p><strong>Positions:</strong> {election.positions ? election.positions.join(', ') : 'Not specified'}</p>
                <p><strong>Branches:</strong> {election.allowedBranches ? election.allowedBranches.join(', ') : 'All branches'}</p>
                <p><strong>Years:</strong> {election.allowedYears ? election.allowedYears.join(', ') : 'All years'}</p>
              </div>
            </div>
            
            <div className="flex space-x-2 ml-4">
              <button 
                onClick={() => openElectionModal(election)}
                className="btn btn-outline btn-sm"
              >
                <Eye className="w-4 h-4 mr-1" />
                View Details
              </button>
              {election.status === 'active' && (
                <button 
                  onClick={() => handleVoteClick(election)}
                  className="btn btn-primary btn-sm"
                >
                  <Vote className="w-4 h-4 mr-1" />
                  Vote Now
                </button>
              )}
            </div>
          </div>
        </div>
        ))
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (!isLoading && error) {
    return (
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Election Calendar</h1>
            <p className="text-gray-600">Stay updated with upcoming and ongoing elections</p>
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button 
              onClick={refreshElections}
              className="btn btn-outline flex items-center justify-center"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Retry
            </button>
          </div>
        </div>
        
        {/* Error State */}
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Unable to Load Elections</h3>
            <p className="text-gray-600 mb-2">{error}</p>
            <p className="text-sm text-gray-500 mb-6">
              We're having trouble connecting to the election service. Please try refreshing the page.
            </p>
            <div className="space-y-3">
              <button 
                onClick={refreshElections}
                className="btn btn-primary flex items-center justify-center mx-auto"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state when no elections are available
  if (!isLoading && !error && elections.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Election Calendar</h1>
            <p className="text-gray-600">Stay updated with upcoming and ongoing elections</p>
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-sm text-gray-500">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
              {!error && !isLoading && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600">Live</span>
                </div>
              )}
              {error && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-red-600">Offline</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button 
              onClick={refreshElections}
              className="btn btn-outline flex items-center justify-center"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
        
        {/* Empty State */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No Elections Available</h3>
            <p className="text-gray-600 mb-6">
              There are currently no elections scheduled. Elections will appear here once they are created by administrators.
            </p>
            <div className="space-y-3">
              <button 
                onClick={refreshElections}
                className="btn btn-primary flex items-center justify-center mx-auto"
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Check for Elections
              </button>
              {user?.role === 'admin' && (
                <p className="text-sm text-gray-500">
                  As an administrator, you can create elections from the admin dashboard.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Election Calendar</h1>
          <p className="text-gray-600">Stay updated with upcoming and ongoing elections</p>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button 
            onClick={refreshElections}
            className="btn btn-outline flex items-center justify-center"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="btn btn-outline flex items-center justify-center">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </button>
        </div>
      </div>

      {/* Search and Advanced Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search elections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          
          <select
            value={electionType}
            onChange={(e) => setElectionType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="Student Council">Student Council</option>
            <option value="Committee">Committee</option>
            <option value="General Secretary">General Secretary</option>
            <option value="Cultural Secretary">Cultural Secretary</option>
            <option value="Sports Secretary">Sports Secretary</option>
          </select>
          
          <div className="flex space-x-2">
            <input
              type="date"
              placeholder="Start Date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <input
              type="date"
              placeholder="End Date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Showing {filteredElections.length} of {elections.length} elections</span>
            {filteredElections.length > 0 && viewMode === 'month' && (
              <span className="text-yellow-600 font-medium">
                📅 Dates highlighted on calendar
              </span>
            )}
            {(searchTerm || filterStatus !== 'all' || electionType !== 'all' || dateRange.start || dateRange.end) && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setElectionType('all');
                  setDateRange({ start: '', end: '' });
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* View Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center ${
              viewMode === 'month'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Grid className="w-4 h-4 mr-2" />
            Month View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center ${
              viewMode === 'list'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <List className="w-4 h-4 mr-2" />
            List View
          </button>
        </div>
        
        <div className="text-sm text-gray-500">
          {viewMode === 'month' ? 'Click on election titles to view details' : 'Browse detailed election information'}
        </div>
      </div>

      {/* Month Navigation for Search Results */}
      {filteredElections.length > 0 && filteredElections.length < elections.length && viewMode === 'month' && getMonthsWithElections().length > 1 && (
        <div className="bg-blue-50 border border-blue-200 p-4 mb-4 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Jump to months with elections:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {getMonthsWithElections().map((month, index) => {
                const isCurrentMonth = 
                  month.date.getMonth() === currentDate.getMonth() && 
                  month.date.getFullYear() === currentDate.getFullYear();
                
                return (
                  <button
                    key={index}
                    onClick={() => navigateToMonth(month.date)}
                    className={`inline-flex items-center px-3 py-1 text-sm rounded-full transition-colors ${
                      isCurrentMonth
                        ? 'bg-blue-200 text-blue-800 font-medium'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {month.name} ({month.count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quick Election Dates - Show when there are filtered results and in month view */}
      {filteredElections.length > 0 && filteredElections.length < elections.length && viewMode === 'month' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-300 p-4 mb-6 rounded-r-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-sm font-medium text-yellow-800 mb-2">Elections found in {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}:</h3>
              <div className="flex flex-wrap gap-2">
                {getElectionDatesInRange().map((item, index) => (
                  <button
                    key={`${item.election.id}_${index}`}
                    onClick={() => openElectionModal(item.election)}
                    className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full hover:bg-yellow-200 transition-colors"
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    {item.date}th - {item.election.title}
                  </button>
                ))}
                {getElectionDatesInRange().length === 0 && (
                  <span className="text-yellow-700 text-sm">
                    No elections found in this month. Try navigating to other months above.
                  </span>
                )}
              </div>
            </div>
            {getElectionDatesInRange().length > 0 && (
              <div className="text-xs text-yellow-700">
                {getElectionDatesInRange().length} election{getElectionDatesInRange().length !== 1 ? 's' : ''} this month
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calendar Content */}
      {viewMode === 'month' ? renderMonthView() : renderListView()}

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Elections</p>
              <p className="text-2xl font-bold text-gray-900">{filteredElections.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <Vote className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Elections</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredElections.filter(e => e.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredElections.filter(e => e.status === 'upcoming').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredElections.filter(e => e.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Election Detail Modal */}
      <ElectionDetailModal
        election={selectedElection}
        isOpen={isModalOpen}
        onClose={closeElectionModal}
        onVoteClick={handleVoteClick}
      />
    </div>
  );
};

export default ElectionCalendarPage;
