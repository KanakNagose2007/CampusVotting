import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Shield, 
  Bell, 
  Eye, 
  EyeOff, 
  Smartphone,
  Mail,
  Globe,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const SettingsPage = () => {
  const { user, updateUser, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      notifications: {
        email: user?.notifications?.email ?? true,
        sms: user?.notifications?.sms ?? false,
        push: user?.notifications?.push ?? true,
        electionUpdates: user?.notifications?.electionUpdates ?? true,
        candidateUpdates: user?.notifications?.candidateUpdates ?? false,
        systemUpdates: user?.notifications?.systemUpdates ?? true
      },
      privacy: {
        showProfile: user?.privacy?.showProfile ?? true,
        showVotingHistory: user?.privacy?.showVotingHistory ?? false,
        allowContact: user?.privacy?.allowContact ?? true
      },
      preferences: {
        theme: user?.preferences?.theme || 'system',
        language: user?.preferences?.language || 'en',
        timezone: user?.preferences?.timezone || 'UTC'
      },
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Eye },
    { id: 'preferences', name: 'Preferences', icon: Globe }
  ];

  const themes = [
    { id: 'light', name: 'Light', icon: Sun },
    { id: 'dark', name: 'Dark', icon: Moon },
    { id: 'system', name: 'System', icon: Monitor }
  ];

  const languages = [
    { id: 'en', name: 'English' },
    { id: 'es', name: 'Spanish' },
    { id: 'fr', name: 'French' },
    { id: 'de', name: 'German' },
    { id: 'hi', name: 'Hindi' }
  ];

  const timezones = [
    { id: 'UTC', name: 'UTC' },
    { id: 'America/New_York', name: 'Eastern Time (ET)' },
    { id: 'America/Chicago', name: 'Central Time (CT)' },
    { id: 'America/Denver', name: 'Mountain Time (MT)' },
    { id: 'America/Los_Angeles', name: 'Pacific Time (PT)' },
    { id: 'Europe/London', name: 'London (GMT)' },
    { id: 'Europe/Paris', name: 'Paris (CET)' },
    { id: 'Asia/Tokyo', name: 'Tokyo (JST)' },
    { id: 'Asia/Kolkata', name: 'Mumbai (IST)' }
  ];

  const onSubmit = async (data) => {
    setIsUpdating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update user context
      updateUser({
        ...user,
        ...data
      });

      toast.success('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsUpdating(true);
    try {
      const result = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });

      if (result.success) {
        toast.success('Password updated successfully!');
        reset({
          ...watch(),
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(result.message || 'Failed to update password.');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const renderProfileTab = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
        <input
          type="text"
          {...register('name', { required: 'Name is required' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
        <input
          type="email"
          value={user?.email || ''}
          disabled
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
        />
        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
        <input
          type="tel"
          {...register('phone')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      <button type="submit" disabled={isUpdating} className="btn btn-primary">
        {isUpdating ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  );

  const renderSecurityTab = () => (
    <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password *</label>
        <div className="relative">
          <input
            type={showCurrentPassword ? 'text' : 'password'}
            {...register('currentPassword', { required: 'Current password is required' })}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showCurrentPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
        {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">New Password *</label>
        <div className="relative">
          <input
            type={showNewPassword ? 'text' : 'password'}
            {...register('newPassword', {
              required: 'New password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' }
            })}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showNewPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
        {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password *</label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            {...register('confirmPassword', { required: 'Please confirm your password' })}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
      </div>

      <button type="submit" disabled={isUpdating} className="btn btn-primary">
        {isUpdating ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab();
      case 'security': return renderSecurityTab();
      default: return <div>Coming Soon</div>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex space-x-4 border-b pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-3 py-2 border-b-2 ${
              activeTab === tab.id ? 'border-primary-500 font-semibold' : 'border-transparent'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      <div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default SettingsPage;
