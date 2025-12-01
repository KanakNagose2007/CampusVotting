import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Vote, MapPin, User, Calendar, Award, History, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();

  const quickActions = [
    {
      title: 'Cast Your Vote',
      description: 'Participate in active elections',
      icon: Vote,
      href: '/voting',
      color: 'bg-blue-500'
    },
    {
      title: 'View Candidates',
      description: 'Learn about candidates and their platforms',
      icon: Award,
      href: '/candidates',
      color: 'bg-green-500'
    },
    {
      title: 'Election Calendar',
      description: 'Check upcoming and ongoing elections',
      icon: Calendar,
      href: '/elections',
      color: 'bg-orange-500'
    },
    {
      title: 'Voting History',
      description: 'Track your voting participation',
      icon: History,
      href: '/voting-history',
      color: 'bg-purple-500'
    },
    {
      title: 'Register as Candidate',
      description: 'Apply to run for student positions',
      icon: UserPlus,
      href: '/candidate-registration',
      color: 'bg-pink-500'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your elections today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              to={action.href}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer block"
            >
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-gray-600 text-sm">{action.description}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Account verified successfully</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Profile updated</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Ready to vote</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Election Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Current Election</span>
              <span className="text-sm font-medium text-gray-900">Student Council 2024</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Status</span>
              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                Upcoming
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Voting Period</span>
              <span className="text-sm font-medium text-gray-900">Dec 15 - Dec 20</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
