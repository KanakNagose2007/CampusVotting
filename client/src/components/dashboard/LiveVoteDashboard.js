import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import {
  Users,
  Vote,
  TrendingUp,
  Clock,
  Activity,
  BarChart3,
  Wifi,
  WifiOff,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  Eye,
  AlertCircle
} from 'lucide-react';

const LiveVoteDashboard = () => {
  const { user } = useAuth();
  const { connected, subscribeLiveResults, joinElection, on, off } = useSocket();
  const [liveElections, setLiveElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLiveElections();
  }, []);

  useEffect(() => {
    if (selectedElection && connected) {
      // Join the election room for general updates
      joinElection(selectedElection._id);
      
      // Subscribe to detailed live results if admin
      if (user?.role === 'admin') {
        subscribeLiveResults(selectedElection._id);
      }

      // Set up event listeners
      const handleVoteCast = (data) => {
        if (data.electionId === selectedElection._id) {
          setLiveData(prev => ({
            ...prev,
            totalVotes: data.totalVotes,
            turnoutPercentage: data.turnoutPercentage
          }));
          setLastUpdated(new Date());
        }
      };

      const handleLiveResultsUpdate = (data) => {
        if (data.electionId === selectedElection._id) {
          setLiveData(data);
          setLastUpdated(new Date(data.lastUpdated));
        }
      };

      on('vote_cast', handleVoteCast);
      on('live_results_update', handleLiveResultsUpdate);

      // Fetch initial live data
      fetchLiveData();

      return () => {
        off('vote_cast', handleVoteCast);
        off('live_results_update', handleLiveResultsUpdate);
      };
    }
  }, [selectedElection, connected, user?.role, joinElection, subscribeLiveResults, on, off]);

  const fetchLiveElections = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get('/api/voter/elections');

      if (response.status === 200) {
        const elections = response.data;
        setLiveElections(elections || []);
        
        // Auto-select first active election if none selected
        if (!selectedElection) {
          const activeElection = elections.find(e => e.status === 'active');
          if (activeElection) {
            setSelectedElection(activeElection);
          } else if (elections.length > 0) {
            setSelectedElection(elections[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching elections:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const fetchLiveData = async () => {
    if (!selectedElection) return;

    try {
      const response = await axios.get(`/api/analytics/live/${selectedElection._id}`);
      if (response.status === 200) {
        const data = response.data;
        setLiveData(data);
        setLastUpdated(new Date(data.lastUpdated));
      }
    } catch (error) {
      console.error('Error fetching live data:', error);
    }
  };

  // Filter elections based on search and status
  const getFilteredElections = () => {
    let filtered = liveElections;
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(election => election.status === statusFilter);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(election => 
        election.title.toLowerCase().includes(searchLower) ||
        election.description?.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  };

  const handleElectionSelect = (election) => {
    setSelectedElection(election);
    setLiveData(null); // Reset live data when switching elections
  };

  const handleRefresh = async () => {
    await fetchLiveElections();
    if (selectedElection) {
      await fetchLiveData();
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-${color}-500`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const CandidateCard = ({ position, candidates }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{position}</h3>
      <div className="space-y-3">
        {candidates.map((candidate, index) => {
          const totalVotesInPosition = candidates.reduce((sum, c) => sum + c.votes, 0);
          const percentage = totalVotesInPosition > 0 ? (candidate.votes / totalVotesInPosition) * 100 : 0;
          
          return (
            <div key={candidate.candidateId} className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-600">
                  {index + 1}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">{candidate.name}</p>
                  <p className="text-sm text-gray-500">{candidate.votes} votes</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{Math.round(percentage)}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredElections = getFilteredElections();

  if (!selectedElection && liveElections.length === 0 && !isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Vote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Elections Found</h3>
          <p className="text-gray-500">There are currently no elections to display results for.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Live Vote Dashboard</h1>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
              connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{connected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
          <p className="text-gray-600">
            Real-time voting results for {liveElections.length} election(s)
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-outline btn-sm flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-2" />
              Search Elections
            </label>
            <input
              type="text"
              placeholder="Search by election title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Elections</option>
              <option value="active">Active Only</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-600">
            Showing {filteredElections.length} of {liveElections.length} election(s)
          </p>
          {(searchTerm || statusFilter !== 'active') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('active');
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Election Selection Grid */}
      {filteredElections.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Elections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {filteredElections.map((election) => (
              <div
                key={election._id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedElection?._id === election._id
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
                onClick={() => handleElectionSelect(election)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900 truncate">{election.title}</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    election.status === 'active' ? 'bg-green-100 text-green-800' :
                    election.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {election.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {election.description || 'No description available'}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(election.startDate).toLocaleDateString()}
                  </div>
                  {selectedElection?._id === election._id && (
                    <div className="flex items-center text-blue-600">
                      <Eye className="w-3 h-3 mr-1" />
                      Viewing
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Elections Message */}
      {filteredElections.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No Matching Elections' : 'No Elections Available'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search criteria or filters.'
              : 'There are currently no elections to display results for.'
            }
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="btn btn-primary btn-sm"
            >
              Show All Elections
            </button>
          )}
        </div>
      )}

      {/* Selected Election Details */}
      {selectedElection && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{selectedElection.title}</h2>
              <p className="text-gray-600 mt-1">{selectedElection.description}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Election Period</p>
              <p className="text-lg font-medium text-gray-900">
                {new Date(selectedElection.startDate).toLocaleDateString()} - {new Date(selectedElection.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Votes"
              value={liveData?.totalVotes?.toLocaleString() || '0'}
              subtitle="Votes cast so far"
              icon={Vote}
              color="blue"
            />
            <StatCard
              title="Eligible Voters"
              value={liveData?.eligibleVoters?.toLocaleString() || '0'}
              subtitle="Total registered voters"
              icon={Users}
              color="green"
            />
            <StatCard
              title="Turnout Rate"
              value={`${Math.round(liveData?.turnoutPercentage || 0)}%`}
              subtitle="Of eligible voters"
              icon={TrendingUp}
              color="purple"
            />
            <StatCard
              title="Status"
              value={selectedElection?.status || 'Unknown'}
              subtitle="Election status"
              icon={Activity}
              color={selectedElection?.status === 'active' ? 'green' : 'orange'}
            />
          </div>

          {/* Turnout Progress */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Turnout Progress</h3>
              <span className="text-sm text-gray-500">
                {liveData?.totalVotes || 0} of {liveData?.eligibleVoters || 0} voters
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(liveData?.turnoutPercentage || 0, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Live Results by Position */}
          {liveData?.results && Object.keys(liveData.results).length > 0 ? (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Live Results by Position</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(liveData.results).map(([position, candidates]) => (
                  <CandidateCard
                    key={position}
                    position={position}
                    candidates={candidates}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedElection?.status === 'active' ? 'No Votes Yet' : 'Election Not Active'}
              </h3>
              <p className="text-gray-500">
                {selectedElection?.status === 'active'
                  ? 'Results will appear here as votes are cast.'
                  : 'Live results are only available for active elections.'
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveVoteDashboard;