import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Configure axios base URL and timeout
const API_BASE = process.env.REACT_APP_API_URL;
if (!API_BASE) {
  console.warn('REACT_APP_API_URL is not set. Using relative /api paths. In production, set REACT_APP_API_URL to your backend URL.');
}
axios.defaults.baseURL = API_BASE || '';
axios.defaults.timeout = 10000; // 10 seconds timeout
axios.defaults.withCredentials = true;

// Debug: log API base URL once on load
try {
  console.log('[AuthContext] API base URL:', axios.defaults.baseURL || '(relative)');
} catch (_) {}

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get('/api/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      console.error('Login error details:', error.response?.data);
      
      let message = 'Login failed';
      
      if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors.map(err => err.msg).join(', ');
        message = validationErrors;
      } else if (error.response?.data?.error) {
        message = error.response.data.error;
      } else if (error.message === 'Network Error') {
        message = 'Cannot connect to server. Please check if the server is running.';
      }
      
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Register function
  // Inside the register function
  const register = async (userData) => {
    try {
      console.log('Registration data:', userData);
      
      // Check if userData is FormData and log its contents
      if (userData instanceof FormData) {
        console.log('FormData contents:');
        for (let pair of userData.entries()) {
          console.log(pair[0] + ': ' + pair[1]);
        }
      }
      
      const response = await axios.post('/api/auth/register', userData, {
        headers: {
          'Content-Type': userData instanceof FormData ? 'multipart/form-data' : 'application/json'
        }
      });
      
      setToken(response.data.token);
      setUser(response.data.user);
      toast.success('Registration successful!');
      
      // Check if registering as a candidate
      if (userData.isCandidate) {
        // Return success with candidate flag for redirection
        return { success: true, isCandidate: true, data: response.data };
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration error:', error);
      
      // Network error handling
      if (error.message === 'Network Error') {
        const networkErrorMsg = 'Cannot connect to server. Please check if the server is running.';
        toast.error(networkErrorMsg);
        return { success: false, error: networkErrorMsg };
      }
      
      // Server error handling
      const message = error.response?.data?.error || 
                     error.response?.data?.errors?.[0]?.msg || 
                     error.message || 
                     'Registration failed';
      
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Verify OTP function
  const verifyOTP = async (otp) => {
    try {
      const response = await axios.post('/api/auth/verify-otp', { otp });
      setUser(response.data.user);
      
      toast.success('Email verified successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'OTP verification failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Resend OTP function
  const resendOTP = async () => {
    try {
      await axios.post('/api/auth/resend-otp');
      toast.success('New OTP sent to your email');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to resend OTP';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    toast.success('Logged out successfully');
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/api/voter/profile', profileData);
      setUser(response.data);
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Check if user has voted
  const checkVotingStatus = async () => {
    try {
      const response = await axios.get('/api/voter/voting-status');
      return response.data;
    } catch (error) {
      console.error('Failed to check voting status:', error);
      return null;
    }
  };

  // Get booth information
  const getBoothInfo = async () => {
    try {
      const response = await axios.get('/api/voter/booth');
      return response.data;
    } catch (error) {
      console.error('Failed to get booth info:', error);
      return null;
    }
  };
  
  // Register as a candidate
  const registerAsCandidate = async (formData) => {
    try {
      const response = await axios.post('/api/candidate/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Candidate registration successful!');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Candidate registration error:', error.response?.data || error.message);
      const message = error.response?.data?.error || 'Failed to register as candidate';
      toast.error(message);
      return { success: false, error: message };
    }
  };
  
  // Get candidate profile
  const getCandidateProfile = async () => {
    try {
      const response = await axios.get('/api/candidate/me');
      return response.data;
    } catch (error) {
      console.error('Failed to get candidate profile:', error);
      return null;
    }
  };

  // Get available elections
  const getElections = async () => {
    try {
      const response = await axios.get('/api/voter/elections');
      return response.data;
    } catch (error) {
      console.error('Failed to get elections:', error);
      return [];
    }
  };

  // Get candidates for an election
  const getCandidates = async (electionId) => {
    try {
      const response = await axios.get(`/api/voting/candidates/${electionId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get candidates:', error);
      return null;
    }
  };

  // Cast a vote
  const castVote = async ({ electionId, candidateId, position }) => {
    try {
      const response = await axios.post('/api/voting/cast-vote', { electionId, candidateId, position });
      toast.success('Vote cast successfully');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to cast vote';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Get results summary for an election
  const getResults = async (electionId) => {
    try {
      const response = await axios.get(`/api/voting/results/${electionId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get results:', error);
      return null;
    }
  };

  // Request booth assignment
  const requestBoothAssignment = async () => {
    try {
      const response = await axios.post('/api/voter/request-booth-assignment');
      toast.success('Booth assignment successful');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.error || 'Booth assignment failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Add this function to AuthContext
  const changePassword = async (passwordData) => {
    try {
      const response = await axios.post('/api/auth/change-password', passwordData);
      toast.success('Password changed successfully');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.error || 'Password change failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };
  
  // Add to the value object
  const value = {
    user,
    loading,
    token,
    login,
    register,
    verifyOTP,
    resendOTP,
    logout,
    updateProfile,
    checkVotingStatus,
    getBoothInfo,
    getElections,
    getCandidates,
    castVote,
    getResults,
    requestBoothAssignment,
    changePassword,
    registerAsCandidate,
    getCandidateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isVerified: user?.isVerified,
    hasVoted: user?.hasVoted
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
