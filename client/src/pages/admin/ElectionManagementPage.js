import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Plus, Edit, Trash2, Check, X, AlertCircle, Play, Pause, Square, Clock } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

const ElectionManagementPage = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    positions: ['President', 'Vice President', 'Secretary'],
    status: 'upcoming'
  });
  const [editingId, setEditingId] = useState(null);
  const [deleting, setDeleting] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, election: null });
  const [statusUpdating, setStatusUpdating] = useState({});

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/elections');
      const data = response.data;
      setElections(data);
    } catch (error) {
      console.error('Failed to fetch elections:', error);
      toast.error(error.message || 'Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePositionChange = (e, index) => {
    const newPositions = [...formData.positions];
    newPositions[index] = e.target.value;
    setFormData({ ...formData, positions: newPositions });
  };

  const addPosition = () => {
    setFormData({ ...formData, positions: [...formData.positions, ''] });
  };

  const removePosition = (index) => {
    const newPositions = formData.positions.filter((_, i) => i !== index);
    setFormData({ ...formData, positions: newPositions });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      positions: ['President', 'Vice President', 'Secretary'],
      status: 'upcoming'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.startDate || !formData.endDate) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const url = editingId 
        ? `/api/admin/elections/${editingId}`
        : '/api/admin/elections';
      
      if (editingId) {
        await axios.put(url, formData);
      } else {
        await axios.post(url, formData);
      }
      
      toast.success(editingId ? 'Election updated successfully' : 'Election created successfully');
      resetForm();
      fetchElections();
    } catch (error) {
      console.error('Error saving election:', error);
      toast.error(error.message || 'Failed to save election');
    }
  };

  const handleEdit = (election) => {
    setFormData({
      title: election.title,
      description: election.description,
      startDate: new Date(election.startDate).toISOString().split('T')[0],
      endDate: new Date(election.endDate).toISOString().split('T')[0],
      positions: election.positions || ['President', 'Vice President', 'Secretary'],
      status: election.status
    });
    setEditingId(election._id);
    setShowForm(true);
  };

  const handleDeleteClick = (election) => {
    setDeleteConfirm({ show: true, election });
  };

  const handleDelete = async (election) => {
    setDeleteConfirm({ show: false, election: null });
    setDeleting({ ...deleting, [election._id]: true });
    
    try {
      await axios.delete(`/api/admin/elections/${election._id}`);
      toast.success('Election deleted successfully');
      fetchElections();
    } catch (error) {
      console.error('Failed to delete election:', error);
      toast.error(error.message || 'Failed to delete election');
    } finally {
      setDeleting({ ...deleting, [election._id]: false });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, election: null });
  };

  const handleStatusChange = async (id, newStatus) => {
    console.log('Status change triggered:', { id, newStatus, type: typeof id });
    
    // Validate inputs
    if (!id || id === 'undefined') {
      console.error('Invalid election ID provided:', id);
      toast.error('Invalid election ID');
      return;
    }
    
    if (!newStatus) {
      console.error('Invalid status provided:', newStatus);
      toast.error('Invalid status');
      return;
    }
    
    // Set loading state
    setStatusUpdating({ ...statusUpdating, [id]: newStatus });
    
    try {
      console.log('Making request to:', `/api/admin/elections/${id}/status`);
      const response = await axios.patch(`/api/admin/elections/${id}/status`, { status: newStatus });
      const updatedElection = response.data;
      console.log('Election status updated successfully:', updatedElection);
      
      // Update the election in the local state immediately for better UX
      setElections(prev => prev.map(election => 
        election._id === id 
          ? { ...election, status: newStatus }
          : election
      ));
      
      toast.success(`Election ${getStatusActionText(newStatus)} successfully`);
    } catch (error) {
      console.error('Failed to update election status:', error);
      toast.error(error.message || 'Failed to update election status');
    } finally {
      // Clear loading state
      setStatusUpdating({ ...statusUpdating, [id]: false });
    }
  };

  const getStatusActionText = (status) => {
    switch (status) {
      case 'active': return 'started';
      case 'completed': return 'ended';
      case 'cancelled': return 'cancelled';
      case 'upcoming': return 'scheduled';
      default: return `marked as ${status}`;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>;
      case 'upcoming':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Upcoming</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Completed</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Cancelled</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (loading && elections.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Election Management</h1>
          <p className="text-gray-600">Create and manage campus elections</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              New Election
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Election' : 'Create New Election'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Positions
                </label>
                <div className="space-y-2">
                  {formData.positions.map((position, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={position}
                        onChange={(e) => handlePositionChange(e, index)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Position title"
                      />
                      <button
                        type="button"
                        onClick={() => removePosition(index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPosition}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Position
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingId ? 'Update Election' : 'Create Election'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">All Elections</h2>
            <div className="hidden sm:flex space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Play className="w-3 h-3 text-green-600" />
                <span>Start</span>
              </div>
              <div className="flex items-center space-x-1">
                <Pause className="w-3 h-3 text-yellow-600" />
                <span>Pause</span>
              </div>
              <div className="flex items-center space-x-1">
                <Square className="w-3 h-3 text-purple-600" />
                <span>End</span>
              </div>
              <div className="flex items-center space-x-1">
                <X className="w-3 h-3 text-red-600" />
                <span>Cancel</span>
              </div>
            </div>
          </div>
        </div>
        
        {elections.length === 0 ? (
          <div className="p-6 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No elections found</p>
            <button 
              onClick={() => setShowForm(true)} 
              className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Create your first election
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Start Date</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">End Date</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Positions</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {elections.map((election) => (
                  <tr key={election._id}>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{election.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{election.description}</div>
                      <div className="sm:hidden mt-1">
                        {getStatusBadge(election.status)}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      {getStatusBadge(election.status)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      {new Date(election.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      {new Date(election.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                      {election.positions?.length || 0} positions
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-1 sm:space-x-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEdit(election)}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit Election"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        {/* Start Election Button */}
                        {election.status === 'upcoming' && (
                          <button
                            onClick={() => handleStatusChange(election._id, 'active')}
                            disabled={statusUpdating[election._id]}
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Start Election"
                          >
                            {statusUpdating[election._id] === 'active' ? (
                              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        
                        {/* Pause Election Button */}
                        {election.status === 'active' && (
                          <button
                            onClick={() => handleStatusChange(election._id, 'upcoming')}
                            disabled={statusUpdating[election._id]}
                            className="p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Pause Election"
                          >
                            {statusUpdating[election._id] === 'upcoming' ? (
                              <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Pause className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        
                        {/* End Election Button */}
                        {(election.status === 'active' || election.status === 'upcoming') && (
                          <button
                            onClick={() => handleStatusChange(election._id, 'completed')}
                            disabled={statusUpdating[election._id]}
                            className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="End Election"
                          >
                            {statusUpdating[election._id] === 'completed' ? (
                              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        
                        {/* Cancel Election Button */}
                        {election.status !== 'cancelled' && election.status !== 'completed' && (
                          <button
                            onClick={() => handleStatusChange(election._id, 'cancelled')}
                            disabled={statusUpdating[election._id]}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Cancel Election"
                          >
                            {statusUpdating[election._id] === 'cancelled' ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteClick(election)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={deleting[election._id]}
                          title="Delete Election"
                        >
                          {deleting[election._id] ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Delete Election</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete the election 
                <span className="font-semibold text-gray-900">"{deleteConfirm.election?.title}"</span>?
              </p>
              <div className="mt-3 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">
                  ⚠️ This will permanently delete:
                </p>
                <ul className="text-sm text-red-700 mt-1 ml-4 list-disc">
                  <li>All election data</li>
                  <li>All candidate registrations</li>
                  <li>All votes cast (if any)</li>
                  <li>All related analytics</li>
                </ul>
              </div>
            </div>
            
            <div className="flex space-x-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.election)}
                disabled={deleting[deleteConfirm.election?._id]}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting[deleteConfirm.election?._id] ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Deleting...
                  </>
                ) : (
                  'Delete Election'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectionManagementPage;
