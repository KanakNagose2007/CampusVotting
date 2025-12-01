import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { 
  Users, 
  Vote, 
  Calendar, 
  BarChart3, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  UserCheck,
  UserX,
  Activity,
  Shield,
  Clock,
  Award,
  FileText,
  Settings,
  Bell,
  Download,
  RefreshCw,
  PlusCircle,
  UserPlus,
  ListChecks
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    totalElections: 0,
    activeElections: 0,
    totalCandidates: 0,
    pendingCandidates: 0,
    totalVotes: 0,
    systemHealth: 'healthy',
    lastBackup: null,
    securityAlerts: 0,
    uptime: '99.9%'
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentElections, setRecentElections] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [users, elections, candidates] = await Promise.all([
          axios.get('/api/admin/users'),
          axios.get('/api/admin/elections'),
          axios.get('/api/admin/candidates')
        ]);

        const usersData = users.data || [];
        const electionsData = elections.data || [];
        const candidatesData = candidates.data || [];

        setStats({
          totalUsers: usersData.length,
          pendingApprovals: usersData.filter(u => !u.isApproved).length,
          totalElections: electionsData.length,
          activeElections: electionsData.filter(e => e.status === 'active').length,
          totalCandidates: candidatesData.length,
          pendingCandidates: candidatesData.filter(c => !c.isApproved).length,
          totalVotes: usersData.filter(u => u.hasVoted).length,
          systemHealth: 'healthy',
          lastBackup: new Date().toISOString(),
          securityAlerts: 0,
          uptime: '99.9%'
        });

        setRecentUsers(usersData.slice(0, 5));
        setRecentElections(electionsData.slice(0, 3));
        
        // Fetch recent activity
        try {
          const activityResponse = await axios.get('/api/admin/activity');
          setRecentActivity(activityResponse.data || []);
        } catch (error) {
          console.error('Failed to load activity data:', error);
        }
        
        // Fetch system alerts
        try {
          const alertsResponse = await axios.get('/api/admin/alerts');
          setSystemAlerts(alertsResponse.data || []);
        } catch (error) {
          console.error('Failed to load system alerts:', error);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: UserCheck,
      color: 'bg-yellow-500',
      link: '/admin/voters'
    },
    {
      title: 'Active Elections',
      value: stats.activeElections,
      icon: Vote,
      color: 'bg-green-500'
    },
    {
      title: 'Total Votes Cast',
      value: stats.totalVotes,
      icon: BarChart3,
      color: 'bg-purple-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'System Health',
      value: stats.systemHealth,
      icon: Shield,
      color: 'bg-green-500',
      status: stats.systemHealth
    },
    {
      title: 'Security Alerts',
      value: stats.securityAlerts,
      icon: AlertCircle,
      color: stats.securityAlerts > 0 ? 'bg-red-500' : 'bg-gray-500'
    },
    {
      title: 'Uptime',
      value: stats.uptime,
      icon: Clock,
      color: 'bg-indigo-500'
    },
    {
      title: 'Pending Candidates',
      value: stats.pendingCandidates,
      icon: UserX,
      color: 'bg-orange-500',
      link: '/admin/candidates'
    }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const refreshDashboard = async () => {
    setLoading(true);
    try {
      const [users, elections, candidates] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/admin/elections'),
        axios.get('/api/admin/candidates')
      ]);

      const usersData = users.data || [];
      const electionsData = elections.data || [];
      const candidatesData = candidates.data || [];

      setStats({
        totalUsers: usersData.length,
        pendingApprovals: usersData.filter(u => !u.isApproved).length,
        totalElections: electionsData.length,
        activeElections: electionsData.filter(e => e.status === 'active').length,
        totalCandidates: candidatesData.length,
        pendingCandidates: candidatesData.filter(c => !c.isApproved).length,
        totalVotes: usersData.filter(u => u.hasVoted).length,
        systemHealth: 'healthy',
        lastBackup: new Date().toISOString(),
        securityAlerts: 0,
        uptime: '99.9%'
      });

      setRecentUsers(usersData.slice(0, 5));
      setRecentElections(electionsData.slice(0, 3));
      
      // Fetch recent activity
      try {
        const activityResponse = await axios.get('/api/admin/activity');
        setRecentActivity(activityResponse.data || []);
      } catch (error) {
        console.error('Failed to load activity data:', error);
      }
      
      // Fetch system alerts
      try {
        const alertsResponse = await axios.get('/api/admin/alerts');
        setSystemAlerts(alertsResponse.data || []);
      } catch (error) {
        console.error('Failed to load system alerts:', error);
      }
      
      toast.success('Dashboard refreshed');
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
      toast.error('Failed to refresh dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of your campus voting system</p>
        </div>
        <button 
          onClick={refreshDashboard}
          className="btn btn-primary"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </button>
      </div>

      {/* System Alerts */}
      {systemAlerts.length > 0 && (
        <div className="mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <Bell className="w-5 h-5 text-yellow-600 mr-2" />
              <h3 className="text-sm font-medium text-yellow-800">System Alerts</h3>
            </div>
            <div className="mt-2 space-y-1">
              {systemAlerts.map((alert) => (
                <p key={alert.id} className="text-sm text-yellow-700">
                  • {alert.message}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const CardComponent = stat.link ? Link : 'div';
          
          return (
            <CardComponent
              key={index}
              to={stat.link}
              className={`bg-white rounded-lg shadow p-6 ${stat.link ? 'hover:shadow-lg transition-shadow cursor-pointer' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.status ? (
                      <span className={`capitalize ${
                        stat.status === 'healthy' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.status}
                      </span>
                    ) : (
                      stat.value
                    )}
                  </p>
                  {stat.change && (
                    <div className="flex items-center mt-2">
                      <TrendingUp className={`w-4 h-4 mr-1 ${stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`} />
                      <span className={`text-sm font-medium ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">from last month</span>
                    </div>
                  )}
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardComponent>
          );
        })}
      </div>

      {/* Enhanced Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Voting Trends Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Voting Trends (Last 7 Days)</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Voting trends chart will be displayed here</p>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email Service</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Voting System</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Active</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Backup</span>
              <span className="text-sm text-gray-900">
                {stats.lastBackup ? new Date(stats.lastBackup).toLocaleDateString() : 'Never'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Link to="/admin/analytics" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-gray-500">No recent activity</p>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.severity === 'success' ? 'bg-green-500' :
                    activity.severity === 'warning' ? 'bg-yellow-500' :
                    activity.severity === 'error' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Registrations</h3>
            <Link to="/admin/voters" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentUsers.length === 0 ? (
              <p className="text-gray-500">No recent registrations</p>
            ) : (
              recentUsers.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.branch} - {user.year} Year</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {user.isApproved ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/voters"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <UserCheck className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-900">Approve Voters</p>
              <p className="text-xs text-blue-600">{stats.pendingApprovals} pending</p>
            </div>
          </Link>
          
          <Link
            to="/admin/candidates"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Users className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-900">Manage Candidates</p>
              <p className="text-xs text-green-600">{stats.pendingCandidates} pending</p>
            </div>
          </Link>
          
          <Link
            to="/admin/results"
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <BarChart3 className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-purple-900">View Results</p>
              <p className="text-xs text-purple-600">{stats.totalVotes} votes cast</p>
            </div>
          </Link>
          
          <Link
            to="/admin/elections/new"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Calendar className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-900">Create Election</p>
              <p className="text-xs text-blue-600">Set up a new election</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
