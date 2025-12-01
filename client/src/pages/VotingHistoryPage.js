import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { 
  Vote, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Award,
  Filter,
  Download,
  Eye,
  BarChart3,
  TrendingUp,
  Target,
  Users,
  Activity,
  Zap,
  RefreshCw,
  Trophy,
  PieChart
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const VotingHistoryPage = () => {
  const { user } = useAuth();
  const { socket, connected: isConnected } = useSocket();
  const [votingHistory, setVotingHistory] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [liveStats, setLiveStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [selectedElection, setSelectedElection] = useState(null);
  const lastUpdateRef = useRef(new Date());

  // Fetch comprehensive voting history
  const fetchVotingHistory = async () => {
    try {
      setIsRefreshing(true);
      const response = await axios.get(`/api/voting/history`, {
        params: { filter, sortBy }
      });
      const data = response.data;
      setVotingHistory(data);
      lastUpdateRef.current = new Date();
    } catch (error) {
      console.error('Error fetching voting history:', error);
      toast.error('Failed to load voting history');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch comprehensive statistics
  const fetchStatistics = async () => {
    try {
      const response = await axios.get('/api/voting/statistics');
      const data = response.data;
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Manual refresh function
  const handleRefresh = async () => {
    await Promise.all([
      fetchVotingHistory(),
      fetchStatistics()
    ]);
    toast.success('Data refreshed successfully');
  };

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (socket && realTimeEnabled && user?.id) {
      // Listen for voting history updates
      socket.on('voting_history_updated', (data) => {
        if (data.userId === user.id) {
          console.log('Received voting history update:', data);
          fetchVotingHistory();
          toast.success('🗳️ Voting history updated!');
        }
      });

      // Listen for voting statistics updates
      socket.on('voting_stats_updated', (data) => {
        if (data.userId === user.id) {
          console.log('Received voting stats update:', data);
          fetchStatistics();
        }
      });

      // Listen for live election stats
      socket.on('live_election_stats', (data) => {
        setLiveStats(prev => ({
          ...prev,
          [data.electionId]: data.stats
        }));
      });

      return () => {
        socket.off('voting_history_updated');
        socket.off('voting_stats_updated');
        socket.off('live_election_stats');
      };
    }
  }, [socket, realTimeEnabled, user?.id]);

  // Initial data fetching
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchVotingHistory(),
        fetchStatistics()
      ]);
    };
    loadData();
  }, [filter, sortBy]);

  // Auto-refresh every 30 seconds when real-time is enabled
  useEffect(() => {
    if (realTimeEnabled) {
      const interval = setInterval(() => {
        fetchStatistics();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [realTimeEnabled]);

  // Enhanced helper functions
  const getVoteResult = (item) => {
    if (!item.results) return 'Unknown';
    if (item.results.isWinner) return 'Won';
    return 'Lost';
  };

  const getVoteResultColor = (item) => {
    if (!item.results) return 'text-gray-600';
    if (item.results.isWinner) return 'text-green-600';
    return 'text-red-600';
  };

  const getVoteResultIcon = (item) => {
    if (!item.results) return <Clock className="w-4 h-4" />;
    if (item.results.isWinner) return <Award className="w-4 h-4" />;
    return <Target className="w-4 h-4" />;
  };

  const handleExport = async () => {
    try {
      // Create CSV content
      const csvContent = [
        ['Election', 'Candidate', 'Position', 'Date', 'Result', 'Votes', 'Percentage', 'Rank'],
        ...votingHistory.map(item => [
          item.election?.title || 'Unknown Election',
          item.candidate?.name || 'Unknown Candidate',
          item.candidate?.position || 'N/A',
          item.castAt ? new Date(item.castAt).toLocaleDateString() : 'N/A',
          getVoteResult(item),
          item.results?.userCandidateVotes || 0,
          `${item.results?.userCandidatePercentage || 0}%`,
          item.results?.userCandidateRank || 'N/A'
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voting-history-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Voting history exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export voting history');
    }
  };

  // Calculate comprehensive statistics
  const getComprehensiveStats = () => {
    if (!Array.isArray(votingHistory)) {
      return {
        totalVotes: 0,
        completedVotes: 0,
        winningVotes: 0,
        recentVotes: 0,
        winRate: 0,
        participationRate: 0
      };
    }
    
    const totalVotes = votingHistory.length;
    const completedVotes = votingHistory.filter(v => v.election?.status === 'completed').length;
    const winningVotes = votingHistory.filter(v => v.results?.isWinner).length;
    const recentVotes = votingHistory.filter(v => {
      try {
        return v.castAt && new Date(v.castAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      } catch (error) {
        return false;
      }
    }).length;
    
    return {
      totalVotes,
      completedVotes,
      winningVotes,
      recentVotes,
      winRate: completedVotes > 0 ? Math.round((winningVotes / completedVotes) * 100) : 0,
      participationRate: statistics?.participationRate || 0
    };
  };

  const stats = getComprehensiveStats();

  if (isLoading && !statistics) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-28 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-40 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Real-time Indicator */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Voting History</h1>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                isConnected && realTimeEnabled ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
              }`}></div>
              <span className="text-sm text-gray-600">
                {isConnected && realTimeEnabled ? 'Live Updates' : 'Offline'}
              </span>
            </div>
          </div>
          <p className="text-gray-600">Comprehensive tracking of your voting participation with real-time statistics</p>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span>Last updated: {lastUpdateRef.current.toLocaleTimeString()}</span>
            {statistics && (
              <span>• {statistics.totalVotesCast} total votes cast</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setRealTimeEnabled(!realTimeEnabled)}
            className={`btn btn-sm ${
              realTimeEnabled ? 'btn-primary' : 'btn-outline'
            }`}
          >
            <Zap className="w-4 h-4 mr-2" />
            {realTimeEnabled ? 'Live Mode On' : 'Enable Live Mode'}
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn btn-outline btn-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${
              isRefreshing ? 'animate-spin' : ''
            }`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleExport}
            className="btn btn-outline btn-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Enhanced Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Votes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalVotes}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Vote className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Winning Votes</p>
              <p className="text-2xl font-bold text-green-600">{stats.winningVotes}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.winRate}% success rate</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Participation Rate</p>
              <p className="text-2xl font-bold text-purple-600">{stats.participationRate}%</p>
              <p className="text-xs text-gray-500 mt-1">vs eligible elections</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Activity</p>
              <p className="text-2xl font-bold text-orange-600">{stats.recentVotes}</p>
              <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Elections</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.completedVotes}</p>
              <p className="text-xs text-gray-500 mt-1">Finalized results</p>
            </div>
            <div className="p-3 rounded-full bg-indigo-100">
              <CheckCircle className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Win Rate Trend</p>
              <p className="text-2xl font-bold text-teal-600">{statistics?.winRate || 0}%</p>
              <p className="text-xs text-gray-500 mt-1">Overall performance</p>
            </div>
            <div className="p-3 rounded-full bg-teal-100">
              <TrendingUp className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Voting Trends Chart */}
      {statistics?.votingTrend && statistics.votingTrend.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Voting Activity Trend</h3>
              <p className="text-sm text-gray-600">Your voting participation over time</p>
            </div>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-end space-x-2 h-32">
            {statistics.votingTrend.map((point, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="bg-blue-500 rounded-t-sm w-full transition-all duration-300 hover:bg-blue-600"
                  style={{
                    height: `${(point.votes / Math.max(...statistics.votingTrend.map(p => p.votes))) * 100}%`,
                    minHeight: point.votes > 0 ? '4px' : '1px'
                  }}
                ></div>
                <span className="text-xs text-gray-500 mt-1">{point.period}</span>
                <span className="text-xs font-medium text-gray-700">{point.votes}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Sorting */}
      <div className="flex flex-col md:flex-row gap-4 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Filter className="w-4 h-4 inline mr-2" />
            Filter by Status
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Votes</option>
            <option value="completed">Completed Elections</option>
            <option value="won">Winning Votes</option>
            <option value="lost">Losing Votes</option>
          </select>
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Sort by
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="date">Date (Newest First)</option>
            <option value="election">Election Title</option>
            <option value="position">Position</option>
          </select>
        </div>
      </div>

      {/* Voting History List */}
      <div className="space-y-4">
        {votingHistory.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <Vote className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No voting history found</h3>
            <p className="text-gray-600">You haven't participated in any elections yet.</p>
          </div>
        ) : (
          votingHistory.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">{item.election?.title || 'Unknown Election'}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.election?.status === 'completed' ? 'bg-green-100 text-green-800' :
                        item.election?.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.election?.status || 'unknown'}
                      </span>
                      {liveStats[item.election?.id] && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1.5 animate-pulse"></div>
                          Live
                        </span>
                      )}
                    </div>
                    <div className={`flex items-center space-x-1 ${getVoteResultColor(item)}`}>
                      {getVoteResultIcon(item)}
                      <span className="font-medium">{getVoteResult(item)}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Position</p>
                      <p className="font-medium text-gray-900">{item.candidate?.position || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-600">Candidate Voted For</p>
                      <p className="font-medium text-gray-900">{item.candidate?.name || 'Unknown'}</p>
                      <p className="text-gray-500">{item.candidate?.branch || 'N/A'} - Year {item.candidate?.year || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-600">Vote Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(item.castAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {item.results && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Election Results
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Winner</p>
                          <p className="font-medium text-gray-900">{item.results.winner}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Your Candidate's Votes</p>
                          <p className="font-medium text-gray-900">{item.results.userCandidateVotes}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Vote Percentage</p>
                          <p className="font-medium text-gray-900">{item.results.userCandidatePercentage}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Rank</p>
                          <p className="font-medium text-gray-900">#{item.results.userCandidateRank}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-row lg:flex-col gap-2">
                  <button 
                    onClick={() => setSelectedElection(item)}
                    className="btn btn-outline btn-sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Statistics by Position */}
      {statistics?.votesByPosition && statistics.votesByPosition.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Votes by Position</h3>
              <p className="text-sm text-gray-600">Your voting activity across different positions</p>
            </div>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statistics.votesByPosition.map((pos, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{pos.position}</span>
                <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">{pos.count} votes</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingHistoryPage;
