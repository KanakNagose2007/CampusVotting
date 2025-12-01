import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { 
  Calendar, 
  Users, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Square,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const ElectionManagementPage = () => {
  const { user } = useAuth();
  const [elections, setElections] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingElection, setEditingElection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingElections, setDeletingElections] = useState({});
  const [selectedElections, setSelectedElections] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      positions: [],
      eligibilityCriteria: {
        minYear: 1,
        maxYear: 4,
        branches: [],
        gpa: 0
      },
      settings: {
        allowMultipleVotes: false,
        requireIdVerification: true,
        showResults: false,
        allowAbstain: true
      }
    }
  });

  const positions = [
    'President',
    'Vice President', 
    'Secretary',
    'Treasurer',
    'General Secretary',
    'Cultural Secretary',
    'Sports Secretary'
  ];

  const branches = [
    'Computer Science',
    'Electrical',
    'Mechanical',
    'Civil',
    'Chemical',
    'Biotechnology',
    'Information Technology'
  ];

  const years = [1, 2, 3, 4];

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        headers['x-auth-token'] = token;
      }
      
      const response = await axios.get('/api/admin/elections', { headers });
      setElections(response.data);
    } catch (error) {
      console.error('Error fetching elections:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch elections';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Transform form data to match API expectations
      const electionData = {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        positions: data.positions,
        // Map eligibility criteria to API format - if empty, server will use defaults
        allowedBranches: data.eligibilityCriteria?.branches || [],
        allowedYears: [],
        isPublic: true // Always make elections public for candidate registration
      };
      
      // Add years from min to max, or leave empty for server defaults
      if (data.eligibilityCriteria?.minYear && data.eligibilityCriteria?.maxYear) {
        for (let year = data.eligibilityCriteria.minYear; year <= data.eligibilityCriteria.maxYear; year++) {
          electionData.allowedYears.push(year);
        }
      }
      // If no year criteria specified, leave empty array - server will use defaults
      
      if (editingElection) {
        // Update existing election
        await axios.put(`/api/admin/elections/${editingElection._id}`, electionData);
        toast.success('Election updated successfully');
      } else {
        // Create new election
        await axios.post('/api/admin/elections', electionData);
        toast.success('Election created successfully');
      }
      
      setShowCreateForm(false);
      setEditingElection(null);
      reset();
      fetchElections();
    } catch (error) {
      console.error('Error saving election:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to save election';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (election) => {
    setEditingElection(election);
    setShowCreateForm(true);
    reset({
      title: election.title,
      description: election.description,
      startDate: election.startDate.split('T')[0],
      endDate: election.endDate.split('T')[0],
      positions: election.positions
    });
  };

  const handleDelete = async (electionId, electionTitle = '') => {
    // Enhanced confirmation with more details
    const confirmMessage = `Are you sure you want to delete the election "${electionTitle}"?\n\nThis action will permanently delete:\n• All election data\n• All candidate registrations\n• All votes cast\n• All related analytics\n\nThis action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      // Set loading state for this specific election
      setDeletingElections(prev => ({ ...prev, [electionId]: true }));
      
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
          headers['x-auth-token'] = token;
        }
        
        console.log('Deleting election with ID:', electionId);
        
        const response = await axios.delete(`/api/admin/elections/${electionId}`, {
          headers,
          timeout: 15000 // 15 second timeout
        });
        
        console.log('Delete response:', response.data);
        toast.success(`Election "${electionTitle}" deleted successfully!`);
        fetchElections();
        
      } catch (error) {
        console.error('Error deleting election:', error);
        
        let errorMessage = 'Failed to delete election';
        
        if (error.response) {
          // Server responded with error status
          const status = error.response.status;
          const data = error.response.data;
          
          switch (status) {
            case 401:
              errorMessage = 'You are not authorized to delete this election. Please login again.';
              break;
            case 403:
              errorMessage = 'You do not have permission to delete elections.';
              break;
            case 404:
              errorMessage = 'Election not found. It may have already been deleted.';
              break;
            case 409:
              errorMessage = 'Cannot delete election. It may have active votes or candidates registered.';
              break;
            case 500:
              errorMessage = 'Server error occurred while deleting election. Please try again later.';
              break;
            default:
              errorMessage = data?.error || data?.message || `Server error (${status}): Failed to delete election`;
          }
        } else if (error.request) {
          // Network error
          errorMessage = 'Network error: Unable to connect to server. Please check your internet connection.';
        } else {
          // Other error
          errorMessage = error.message || 'An unexpected error occurred while deleting the election.';
        }
        
        toast.error(errorMessage);
        
      } finally {
        // Clear loading state
        setDeletingElections(prev => ({ ...prev, [electionId]: false }));
      }
    }
  };

  // Bulk delete function
  const handleBulkDelete = async () => {
    if (selectedElections.length === 0) {
      toast.error('Please select elections to delete');
      return;
    }

    const electionNames = selectedElections.map(id => {
      const election = elections.find(e => e._id === id);
      return election?.title || 'Unknown';
    }).join('\n• ');

    const confirmMessage = `⚠️ BULK DELETE WARNING\n\nYou are about to delete ${selectedElections.length} elections:\n\n• ${electionNames}\n\nThis will permanently delete:\n• All election data\n• All candidate registrations\n• All votes cast\n• All related analytics\n\nThis action CANNOT be undone!\n\nAre you absolutely sure?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setBulkDeleting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-auth-token': token
      };

      // Process deletions in parallel
      const deletePromises = selectedElections.map(async (electionId) => {
        try {
          await axios.delete(`/api/admin/elections/${electionId}`, {
            headers,
            timeout: 15000
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to delete election ${electionId}:`, error);
          errorCount++;
        }
      });

      await Promise.all(deletePromises);

      // Show results
      if (successCount > 0) {
        toast.success(`🎉 Successfully deleted ${successCount} election(s)!`, {
          duration: 5000
        });
      }

      if (errorCount > 0) {
        toast.error(`Failed to delete ${errorCount} election(s). Please try again.`);
      }

      // Clear selections and refresh
      setSelectedElections([]);
      fetchElections();

    } catch (error) {
      console.error('Bulk delete failed:', error);
      toast.error('Bulk delete operation failed. Please try again.');
    } finally {
      setBulkDeleting(false);
    }
  };

  // Toggle election selection
  const toggleElectionSelection = (electionId) => {
    setSelectedElections(prev => {
      if (prev.includes(electionId)) {
        return prev.filter(id => id !== electionId);
      } else {
        return [...prev, electionId];
      }
    });
  };

  // Select all elections
  const selectAllElections = () => {
    setSelectedElections(elections.map(e => e._id));
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedElections([]);
  };

  const handleStatusChange = async (electionId, newStatus) => {
    try {
      await axios.patch(`/api/admin/elections/${electionId}/status`, { status: newStatus });
      toast.success(`Election ${newStatus} successfully`);
      fetchElections();
    } catch (error) {
      console.error('Error changing status:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to change election status';
      toast.error(errorMessage);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4" />;
      case 'upcoming': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Election Management</h1>
          <p className="text-gray-600">Create, manage, and monitor campus elections</p>
          {selectedElections.length > 0 && (
            <p className="text-sm text-blue-600 font-medium mt-1">
              📎 {selectedElections.length} election(s) selected
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {/* Bulk Delete Controls */}
          {selectedElections.length > 0 && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <button
                onClick={clearAllSelections}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                Clear ({selectedElections.length})
              </button>
              <div className="w-px h-4 bg-gray-300"></div>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="flex items-center text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
              >
                {bulkDeleting ? (
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3 mr-1" />
                )}
                {bulkDeleting ? 'Deleting...' : `Delete ${selectedElections.length}`}
              </button>
            </div>
          )}
          
          {/* Selection Controls */}
          {elections.length > 0 && (
            <button
              onClick={selectedElections.length === elections.length ? clearAllSelections : selectAllElections}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {selectedElections.length === elections.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Election
          </button>
        </div>
      </div>

      {/* Elections List */}
      <div className="space-y-6">
        {elections.map((election) => (
          <div key={election._id} className={`card transition-all ${selectedElections.includes(election._id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start space-x-4 flex-1">
                {/* Selection Checkbox */}
                <div className="flex items-center pt-2">
                  <input
                    type="checkbox"
                    checked={selectedElections.includes(election._id)}
                    onChange={() => toggleElectionSelection(election._id)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </div>
                <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{election.title}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(election.status)}`}>
                    {getStatusIcon(election.status)}
                    <span className="ml-1 capitalize">{election.status}</span>
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{election.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">{election.candidates}</div>
                    <div className="text-sm text-gray-500">Candidates</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{election.votesCast}</div>
                    <div className="text-sm text-gray-500">Votes Cast</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{election.totalVoters}</div>
                    <div className="text-sm text-gray-500">Total Voters</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round((election.votesCast / election.totalVoters) * 100)}%
                    </div>
                    <div className="text-sm text-gray-500">Turnout</div>
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>Start: {new Date(election.startDate).toLocaleDateString()}</span>
                    <span>End: {new Date(election.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-1">
                    Positions: {election.positions.join(', ')}
                  </div>
                </div>
                </div>
              </div>

              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleEdit(election)}
                  className="btn btn-outline btn-sm flex items-center"
                  title="Edit Election"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(election._id, election.title)}
                  disabled={deletingElections[election._id]}
                  className="btn btn-outline btn-sm text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center border-red-300"
                  title={deletingElections[election._id] ? 'Deleting Election...' : 'Delete Election Permanently'}
                >
                  {deletingElections[election._id] ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-1" />
                      <span className="hidden sm:inline">Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline text-red-600 font-medium">Delete</span>
                    </>
                  )}
                </button>
                {election.status === 'upcoming' && (
                  <button
                    onClick={() => handleStatusChange(election._id, 'active')}
                    className="btn btn-primary btn-sm"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Start
                  </button>
                )}
                {election.status === 'active' && (
                  <button
                    onClick={() => handleStatusChange(election._id, 'paused')}
                    className="btn btn-warning btn-sm"
                  >
                    <Pause className="w-4 h-4 mr-1" />
                    Pause
                  </button>
                )}
                {election.status === 'paused' && (
                  <button
                    onClick={() => handleStatusChange(election._id, 'active')}
                    className="btn btn-primary btn-sm"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Resume
                  </button>
                )}
                {election.status === 'active' && (
                  <button
                    onClick={() => handleStatusChange(election._id, 'completed')}
                    className="btn btn-success btn-sm"
                  >
                    <Square className="w-4 h-4 mr-1" />
                    End
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Election Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingElection ? 'Edit Election' : 'Create New Election'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingElection(null);
                    reset();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Election Title *
                  </label>
                  <input
                    type="text"
                    {...register('title', { required: 'Title is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter election title"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    {...register('description', { required: 'Description is required' })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter election description"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="datetime-local"
                      {...register('startDate', { required: 'Start date is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    {errors.startDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="datetime-local"
                      {...register('endDate', { required: 'End date is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    {errors.endDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Positions *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {positions.map((position) => (
                      <label key={position} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value={position}
                          {...register('positions')}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{position}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allowed Branches (Leave empty for all branches)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {branches.map((branch) => (
                      <label key={branch} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          value={branch}
                          {...register('eligibilityCriteria.branches')}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{branch}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Year
                    </label>
                    <select
                      {...register('eligibilityCriteria.minYear')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Year
                    </label>
                    <select
                      {...register('eligibilityCriteria.maxYear')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingElection(null);
                      reset();
                    }}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editingElection ? 'Update Election' : 'Create Election'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectionManagementPage;
