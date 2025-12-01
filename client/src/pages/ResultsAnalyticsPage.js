import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Vote, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Award,
  PieChart,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react';

const ResultsAnalyticsPage = () => {
  const { user } = useAuth();
  const { connected, subscribeLiveResults, on, off } = useSocket();
  const [selectedElection, setSelectedElection] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [liveData, setLiveData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');

  const [elections, setElections] = useState([]);
  
  // Fetch elections
  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await axios.get('/api/analytics/elections');
        const data = response.data;
        setElections(data);
        if (data.length > 0 && !selectedElection) {
          setSelectedElection(data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching elections:', error);
        // Use sample data when API fails
        if (sampleElections.length > 0 && !selectedElection) {
          setSelectedElection(sampleElections[0].id);
        }
      }
    };
    
    fetchElections();
  }, []);

  // Sample election data for development
  const sampleElections = [
    {
      id: 1,
      title: 'Student Council Elections',
      status: 'completed',
      startDate: '2023-10-15T09:00:00Z',
      endDate: '2023-10-15T17:00:00Z',
      totalVoters: 1250,
      votesCast: 850,
      candidates: 5
    }
  ];

  const mockAnalytics = {
    overview: {
      totalElections: 3,
      totalVoters: 1250,
      totalVotesCast: 2930,
      averageTurnout: 78.2,
      activeElections: 0,
      completedElections: 3
    },
    turnoutByDepartment: [
      { department: 'Computer Science', turnout: 85.2, votes: 425 },
      { department: 'Electronics', turnout: 82.1, votes: 328 },
      { department: 'Mechanical', turnout: 76.8, votes: 384 },
      { department: 'Civil', turnout: 74.5, votes: 298 },
      { department: 'Electrical', turnout: 71.3, votes: 285 },
      { department: 'Chemical', turnout: 68.9, votes: 207 },
      { department: 'Aerospace', turnout: 75.2, votes: 188 },
      { department: 'Biotechnology', turnout: 72.6, votes: 145 }
    ],
    turnoutByYear: [
      { year: '1st Year', turnout: 65.2, votes: 325 },
      { year: '2nd Year', turnout: 78.5, votes: 392 },
      { year: '3rd Year', turnout: 82.1, votes: 410 },
      { year: '4th Year', turnout: 85.7, votes: 428 }
    ],
    votingPatterns: {
      peakHours: [
        { hour: '9:00 AM', votes: 45 },
        { hour: '10:00 AM', votes: 78 },
        { hour: '11:00 AM', votes: 92 },
        { hour: '12:00 PM', votes: 65 },
        { hour: '1:00 PM', votes: 38 },
        { hour: '2:00 PM', votes: 85 },
        { hour: '3:00 PM', votes: 95 },
        { hour: '4:00 PM', votes: 88 },
        { hour: '5:00 PM', votes: 72 },
        { hour: '6:00 PM', votes: 45 }
      ],
      dailyBreakdown: [
        { day: 'Day 1', votes: 180, percentage: 16.4 },
        { day: 'Day 2', votes: 220, percentage: 20.0 },
        { day: 'Day 3', votes: 250, percentage: 22.7 },
        { day: 'Day 4', votes: 280, percentage: 25.5 },
        { day: 'Day 5', votes: 170, percentage: 15.5 }
      ]
    },
    candidatePerformance: [
      {
        name: 'John Doe',
        position: 'Student Council President',
        votes: 425,
        percentage: 38.6,
        department: 'Computer Science',
        year: '3rd Year'
      },
      {
        name: 'Jane Smith',
        position: 'Student Council President',
        votes: 380,
        percentage: 34.5,
        department: 'Electronics',
        year: '4th Year'
      },
      {
        name: 'Mike Johnson',
        position: 'Student Council President',
        votes: 295,
        percentage: 26.8,
        department: 'Mechanical',
        year: '3rd Year'
      }
    ],
    demographics: {
      gender: [
        { label: 'Male', count: 650, percentage: 59.1 },
        { label: 'Female', count: 450, percentage: 40.9 }
      ],
      age: [
        { range: '18-19', count: 320, percentage: 29.1 },
        { range: '20-21', count: 450, percentage: 40.9 },
        { range: '22-23', count: 280, percentage: 25.5 },
        { range: '24+', count: 50, percentage: 4.5 }
      ]
    }
  };

  // Set up WebSocket listeners and fetch analytics
  useEffect(() => {
    if (selectedElection) {
      fetchAnalytics();
      
      // Subscribe to live results if admin
      if (user?.role === 'admin' && connected) {
        subscribeLiveResults(selectedElection);
      }
      
      // Listen for live results updates
      const handleLiveUpdate = (data) => {
        if (data.electionId === selectedElection) {
          setLiveData(data);
          setLastUpdated(new Date(data.lastUpdated));
        }
      };
      
      on('live_results_update', handleLiveUpdate);
      
      return () => {
        off('live_results_update', handleLiveUpdate);
      };
    }
  }, [selectedElection, user?.role, connected, subscribeLiveResults, on, off]);

  const fetchAnalytics = async () => {
    if (!selectedElection) return;
    
    setIsLoading(true);
    try {
      let endpoint = '/api/analytics/overview';
      
      if (selectedElection !== 'all') {
        endpoint = `/api/analytics/election/${selectedElection}`;
      }
      
      const response = await axios.get(endpoint);
      const data = response.data;
      setAnalytics(data);
      
      // Also fetch live data if election is active
      if (selectedElection !== 'all' && data.election?.status === 'active') {
        fetchLiveData();
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Use mock data when API fails for development
      setAnalytics(mockAnalytics);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchLiveData = async () => {
    if (!selectedElection || selectedElection === 'all') return;
    
    try {
      const response = await axios.get(`/api/analytics/live/${selectedElection}`);
      const data = response.data;
      setLiveData(data);
      setLastUpdated(new Date(data.lastUpdated));
    } catch (error) {
      console.error('Error fetching live data:', error);
    }
  };

  const handleExport = (format) => {
    console.log(`Exporting analytics as ${format}`);
    // Implement export functionality
  };

  const StatCard = ({ title, value, change, icon: Icon, color = 'blue' }) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}% from last period
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const BarChart = ({ data, title, xKey, yKey, color = 'blue' }) => (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-24 text-sm text-gray-600 truncate">{item[xKey]}</div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`bg-${color}-500 h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${(item[yKey] / Math.max(...data.map(d => d[yKey]))) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="w-16 text-sm font-medium text-gray-900 text-right">
              {item[yKey]}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Results & Analytics</h1>
            {user?.role === 'admin' && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                <span>{connected ? 'Live' : 'Offline'}</span>
              </div>
            )}
            {lastUpdated && (
              <span className="text-xs text-gray-500">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
          <p className="text-gray-600">Comprehensive insights into election performance and voter behavior</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={() => handleExport('pdf')}
            className="btn btn-outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </button>
          <button
            onClick={fetchAnalytics}
            className="btn btn-primary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Election Selector */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Election
        </label>
        <select
          value={selectedElection || 'all'}
          onChange={(e) => setSelectedElection(e.target.value === 'all' ? 'all' : e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">All Elections</option>
          {elections.map((election) => (
            <option key={election._id} value={election._id}>
              {election.title} ({election.status}) - {Math.round(election.turnout || 0)}% turnout
            </option>
          ))}
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {selectedElection === 'all' ? (
          // Overview for all elections
          <>
            <StatCard
              title="Total Elections"
              value={analytics?.totalElections}
              icon={Calendar}
              color="blue"
            />
            <StatCard
              title="Total Voters"
              value={analytics?.totalVoters?.toLocaleString()}
              icon={Users}
              color="green"
            />
            <StatCard
              title="Total Votes Cast"
              value={analytics?.totalVotesCast?.toLocaleString()}
              icon={Vote}
              color="purple"
            />
            <StatCard
              title="Average Turnout"
              value={`${analytics?.averageTurnout}%`}
              icon={TrendingUp}
              color="orange"
            />
          </>
        ) : (
          // Stats for specific election with live updates
          <>
            <StatCard
              title="Total Votes"
              value={(liveData?.totalVotes || analytics?.overview?.totalVotes || 0).toLocaleString()}
              icon={Vote}
              color="blue"
            />
            <StatCard
              title="Eligible Voters"
              value={(liveData?.eligibleVoters || analytics?.overview?.eligibleVoters || 0).toLocaleString()}
              icon={Users}
              color="green"
            />
            <StatCard
              title="Turnout Rate"
              value={`${Math.round(liveData?.turnoutPercentage || 0)}%`}
              icon={TrendingUp}
              color="purple"
            />
            <StatCard
              title="Total Candidates"
              value={analytics?.overview?.totalCandidates || 0}
              icon={Award}
              color="orange"
            />
          </>
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BarChart
          data={analytics?.turnoutByDepartment}
          title="Turnout by Department"
          xKey="department"
          yKey="turnout"
          color="blue"
        />
        <BarChart
          data={analytics?.turnoutByYear}
          title="Turnout by Year"
          xKey="year"
          yKey="turnout"
          color="green"
        />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Voting Patterns by Hour</h3>
          <div className="space-y-2">
            {analytics?.votingPatterns.peakHours.map((hour, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-16 text-sm text-gray-600">{hour.hour}</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(hour.votes / Math.max(...analytics.votingPatterns.peakHours.map(h => h.votes))) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-12 text-sm font-medium text-gray-900 text-right">
                  {hour.votes}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Voting Breakdown</h3>
          <div className="space-y-3">
            {analytics?.votingPatterns.dailyBreakdown.map((day, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-16 text-sm text-gray-600">{day.day}</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${day.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-20 text-sm font-medium text-gray-900 text-right">
                  {day.votes} ({day.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Candidate Performance */}
      <div className="card mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidate Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Votes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics?.candidatePerformance.map((candidate, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600">
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {candidate.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {candidate.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {candidate.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {candidate.votes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${candidate.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {candidate.percentage}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gender Distribution</h3>
          <div className="space-y-3">
            {analytics?.demographics.gender.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-16 text-sm text-gray-600">{item.label}</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-20 text-sm font-medium text-gray-900 text-right">
                  {item.count} ({item.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Distribution</h3>
          <div className="space-y-3">
            {analytics?.demographics.age.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-16 text-sm text-gray-600">{item.range}</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-20 text-sm font-medium text-gray-900 text-right">
                  {item.count} ({item.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsAnalyticsPage;
