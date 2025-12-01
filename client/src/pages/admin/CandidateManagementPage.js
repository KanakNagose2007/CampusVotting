import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../../contexts/SocketContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import CandidateDetailModal from '../../components/CandidateDetailModal';
import { 
  Users, 
  Award, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Filter, 
  Search, 
  User, 
  Mail, 
  GraduationCap,
  AlertTriangle,
  RefreshCw,
  FileText,
  Calendar,
  UserCheck,
  UserX
} from 'lucide-react';

const CandidateManagementPage = () => {
  const { connected } = useSocket();
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [approving, setApproving] = useState({});
  const [rejecting, setRejecting] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [bulkApproving, setBulkApproving] = useState(false);

  const loadData = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const [els, cands] = await Promise.all([
        axios.get('/api/admin/elections', { headers }),
        axios.get('/api/admin/candidates', { headers })
      ]);
      
      setElections(els.data || []);
      setCandidates(cands.data || []);
      setLastRefresh(new Date());
      
      if (!selectedElection && els.data?.length) {
        setSelectedElection(els.data[0]._id);
      }
    } catch (e) {
      console.error('Failed to load admin data', e);
      setError(e.response?.data?.error || 'Failed to load candidates. Please try again.');
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const approve = async (candidateId, candidateName = '', skipConfirmation = false) => {
    // Add confirmation dialog
    if (!skipConfirmation && !window.confirm(`Are you sure you want to approve ${candidateName || 'this candidate'}? This action will allow them to participate in the election.`)) {
      return;
    }

    setApproving((prev) => ({ ...prev, [candidateId]: true }));
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.post(`/api/admin/candidates/${candidateId}/approve`, {}, { headers });
      
      // Show success toast
      toast.success(`✅ Successfully approved ${candidateName || 'candidate'}!`, {
        duration: 4000,
        icon: '🎉'
      });
      
      // Refresh data without loading spinner
      await loadData(false);
      
    } catch (e) {
      console.error('Approve candidate failed:', e);
      const errorMessage = e.response?.data?.error || 'Failed to approve candidate. Please try again.';
      setError(errorMessage);
      toast.error(`Failed to approve ${candidateName || 'candidate'}: ${errorMessage}`);
    } finally {
      setApproving((prev) => ({ ...prev, [candidateId]: false }));
    }
  };

  const reject = async (candidateId, candidateName = '') => {
    if (!window.confirm(`Are you sure you want to reject ${candidateName || 'this candidate'}? This action cannot be undone and will remove their application.`)) {
      return;
    }
    
    setRejecting((prev) => ({ ...prev, [candidateId]: true }));
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // For now, we'll delete the candidate as there's no reject endpoint
      // You might want to add a proper reject endpoint later
      await axios.delete(`/api/admin/candidates/${candidateId}`, { headers });
      
      // Show success toast
      toast.success(`❌ Successfully rejected ${candidateName || 'candidate'}`, {
        duration: 4000,
        icon: '🚫'
      });
      
      // Refresh data without loading spinner
      await loadData(false);
      
    } catch (e) {
      console.error('Reject candidate failed:', e);
      const errorMessage = e.response?.data?.error || 'Failed to reject candidate. Please try again.';
      setError(errorMessage);
      toast.error(`Failed to reject ${candidateName || 'candidate'}: ${errorMessage}`);
    } finally {
      setRejecting((prev) => ({ ...prev, [candidateId]: false }));
    }
  };

  const openCandidateDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setShowDetailModal(true);
  };

  const closeCandidateDetails = () => {
    setSelectedCandidate(null);
    setShowDetailModal(false);
  };

  // Bulk approval functions
  const toggleCandidateSelection = (candidateId) => {
    setSelectedCandidates(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId);
      } else {
        return [...prev, candidateId];
      }
    });
  };

  const selectAllCandidates = () => {
    const pendingCandidates = getFilteredCandidates().filter(c => !c.isApproved);
    setSelectedCandidates(pendingCandidates.map(c => c._id));
  };

  const clearSelection = () => {
    setSelectedCandidates([]);
  };

  const bulkApprove = async () => {
    if (selectedCandidates.length === 0) {
      toast.error('Please select candidates to approve');
      return;
    }

    if (!window.confirm(`Are you sure you want to approve ${selectedCandidates.length} candidate(s)? This action will allow them to participate in the election.`)) {
      return;
    }

    setBulkApproving(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Process approvals in parallel for better performance
      const approvalPromises = selectedCandidates.map(async (candidateId) => {
        try {
          await axios.post(`/api/admin/candidates/${candidateId}/approve`, {}, { headers });
          successCount++;
        } catch (error) {
          console.error(`Failed to approve candidate ${candidateId}:`, error);
          errorCount++;
        }
      });

      await Promise.all(approvalPromises);

      // Show results
      if (successCount > 0) {
        toast.success(`🎉 Successfully approved ${successCount} candidate(s)!`, {
          duration: 5000
        });
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to approve ${errorCount} candidate(s). Please try again.`);
      }

      // Clear selections and refresh data
      setSelectedCandidates([]);
      await loadData(false);

    } catch (error) {
      console.error('Bulk approval failed:', error);
      toast.error('Bulk approval failed. Please try again.');
    } finally {
      setBulkApproving(false);
    }
  };

  // Filter candidates based on search and filters
  const getFilteredCandidates = () => {
    let filtered = candidates;
    
    // Filter by selected election
    if (selectedElection) {
      filtered = filtered.filter((c) => c.electionId?._id === selectedElection);
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((c) => 
        c.userId?.name?.toLowerCase().includes(searchLower) ||
        c.userId?.email?.toLowerCase().includes(searchLower) ||
        c.position?.toLowerCase().includes(searchLower) ||
        c.manifesto?.toLowerCase().includes(searchLower) ||
        c.electionId?.title?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by approval status
    if (statusFilter === 'pending') {
      filtered = filtered.filter((c) => !c.isApproved);
    } else if (statusFilter === 'approved') {
      filtered = filtered.filter((c) => c.isApproved);
    }
    
    return filtered;
  };
  
  const filteredCandidates = getFilteredCandidates();
  const pending = filteredCandidates.filter((c) => !c.isApproved);
  const approved = filteredCandidates.filter((c) => c.isApproved);
  
  // Statistics
  const totalCandidates = candidates.length;
  const totalPending = candidates.filter(c => !c.isApproved).length;
  const totalApproved = candidates.filter(c => c.isApproved).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="w-8 h-8 mr-3 text-blue-600" />
            Candidate Management
          </h1>
          <p className="text-gray-600 mt-1">
            Review and approve candidates for elections
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => loadData(false)}
            className="btn btn-outline flex items-center"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {connected && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Real-time Updates</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg shadow p-12">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Candidates</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCandidates}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                  <p className="text-2xl font-bold text-gray-900">{totalPending}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{totalApproved}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Filter className="w-4 h-4 inline mr-1" />
                  Filter by Election
                </label>
                <select
                  value={selectedElection}
                  onChange={(e) => setSelectedElection(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Elections</option>
                  {elections.map((el) => (
                    <option key={el._id} value={el._id}>
                      {el.title} ({el.status})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Filter
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending Only</option>
                  <option value="approved">Approved Only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Search className="w-4 h-4 inline mr-1" />
                  Search Candidates
                </label>
                <input
                  type="text"
                  placeholder="Search by name, email, position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Showing {filteredCandidates.length} of {totalCandidates} candidates
                {selectedCandidates.length > 0 && (
                  <span className="ml-2 text-blue-600 font-medium">
                    • {selectedCandidates.length} selected
                  </span>
                )}
              </p>
              <div className="flex items-center space-x-3">
                {/* Bulk Actions */}
                {selectedCandidates.length > 0 && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-lg border border-blue-200">
                    <button
                      onClick={clearSelection}
                      className="text-gray-600 hover:text-gray-800 text-sm"
                    >
                      Clear ({selectedCandidates.length})
                    </button>
                    <div className="w-px h-4 bg-gray-300"></div>
                    <button
                      onClick={bulkApprove}
                      disabled={bulkApproving}
                      className="flex items-center text-green-600 hover:text-green-700 text-sm font-medium disabled:opacity-50"
                    >
                      {bulkApproving ? (
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <UserCheck className="w-3 h-3 mr-1" />
                      )}
                      {bulkApproving ? 'Approving...' : `Approve ${selectedCandidates.length}`}
                    </button>
                  </div>
                )}
                
                {/* Select All Button */}
                {getFilteredCandidates().filter(c => !c.isApproved).length > 0 && (
                  <button
                    onClick={selectAllCandidates}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Select All Pending
                  </button>
                )}
                
                {(searchTerm || selectedElection || statusFilter !== 'all') && (
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedElection('');
                      setStatusFilter('all');
                      setSelectedCandidates([]);
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Candidates List */}
          {filteredCandidates.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Candidates Found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedElection || statusFilter !== 'all' 
                  ? 'No candidates match your current filters.'
                  : 'No candidates have been submitted yet.'
                }
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                        <input
                          type="checkbox"
                          checked={selectedCandidates.length > 0 && selectedCandidates.length === getFilteredCandidates().filter(c => !c.isApproved).length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              selectAllCandidates();
                            } else {
                              clearSelection();
                            }
                          }}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Election</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCandidates.map((candidate) => (
                      <tr key={candidate._id} className={`hover:bg-gray-50 ${selectedCandidates.includes(candidate._id) ? 'bg-blue-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {!candidate.isApproved && (
                            <input
                              type="checkbox"
                              checked={selectedCandidates.includes(candidate._id)}
                              onChange={() => toggleCandidateSelection(candidate._id)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {candidate.userId?.name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {candidate.userId?.email || 'No email'}
                              </div>
                              <div className="text-xs text-gray-400">
                                <GraduationCap className="w-3 h-3 inline mr-1" />
                                {candidate.userId?.branch} - Year {candidate.userId?.year}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Award className="w-4 h-4 text-blue-500 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{candidate.position}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{candidate.electionId?.title || 'N/A'}</div>
                          <div className="text-xs text-gray-500">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {candidate.electionId?.startDate ? 
                              new Date(candidate.electionId.startDate).toLocaleDateString() : 'No date'
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {candidate.isApproved ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => openCandidateDetails(candidate)}
                            className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button>
                          
                          {!candidate.isApproved && (
                            <>
                              <button
                                onClick={() => approve(candidate._id, candidate.userId?.name)}
                                disabled={approving[candidate._id]}
                                className="text-green-600 hover:text-green-900 inline-flex items-center disabled:opacity-50"
                              >
                                {approving[candidate._id] ? (
                                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                  <UserCheck className="w-4 h-4 mr-1" />
                                )}
                                {approving[candidate._id] ? 'Approving...' : 'Approve'}
                              </button>
                              
                              <button
                                onClick={() => reject(candidate._id, candidate.userId?.name)}
                                disabled={rejecting[candidate._id]}
                                className="text-red-600 hover:text-red-900 inline-flex items-center disabled:opacity-50"
                              >
                                {rejecting[candidate._id] ? (
                                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                  <UserX className="w-4 h-4 mr-1" />
                                )}
                                {rejecting[candidate._id] ? 'Rejecting...' : 'Reject'}
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Candidate Detail Modal */}
      {showDetailModal && selectedCandidate && (
        <CandidateDetailModal 
          candidate={selectedCandidate} 
          onClose={closeCandidateDetails}
          onApprove={(id, name) => {
            approve(id, name);
            closeCandidateDetails();
          }}
          onReject={(id, name) => {
            reject(id, name);
            closeCandidateDetails();
          }}
          approving={approving[selectedCandidate._id]}
          rejecting={rejecting[selectedCandidate._id]}
        />
      )}
    </div>
  );
};

export default CandidateManagementPage;
