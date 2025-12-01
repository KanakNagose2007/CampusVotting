import React from 'react';
import { 
  X, 
  User, 
  Mail, 
  GraduationCap, 
  Award, 
  Calendar,
  FileText,
  CheckCircle,
  UserCheck,
  UserX,
  RefreshCw,
  Clock
} from 'lucide-react';

const CandidateDetailModal = ({ 
  candidate, 
  onClose, 
  onApprove, 
  onReject, 
  approving = false, 
  rejecting = false 
}) => {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <User className="w-6 h-6 mr-2 text-blue-600" />
              Candidate Details
            </h2>
            <p className="text-gray-600 mt-1">Review candidate information</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Status Badge */}
          <div className="flex justify-center mb-6">
            {candidate.isApproved ? (
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-4 h-4 mr-2" />
                Approved Candidate
              </span>
            ) : (
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                <Clock className="w-4 h-4 mr-2" />
                Pending Approval
              </span>
            )}
          </div>

          {/* Candidate Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Personal Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium text-gray-900">{candidate.userId?.name || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{candidate.userId?.email || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <GraduationCap className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Academic Details</p>
                    <p className="font-medium text-gray-900">
                      {candidate.userId?.branch || 'N/A'} - Year {candidate.userId?.year || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Election Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Election Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Election</p>
                    <p className="font-medium text-gray-900">{candidate.electionId?.title || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Award className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Position</p>
                    <p className="font-medium text-gray-900">{candidate.position || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Election Date</p>
                    <p className="font-medium text-gray-900">
                      {candidate.electionId?.startDate ? 
                        new Date(candidate.electionId.startDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Not specified'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Manifesto */}
          {candidate.manifesto && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Candidate Manifesto
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {candidate.manifesto}
                </p>
              </div>
            </div>
          )}

          {/* Application Timeline */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
              Application Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Application Submitted</p>
                  <p className="text-xs text-gray-500">
                    {candidate.createdAt ? 
                      new Date(candidate.createdAt).toLocaleString() : 
                      'Not available'
                    }
                  </p>
                </div>
              </div>
              
              {candidate.isApproved && candidate.approvedAt && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Approved</p>
                    <p className="text-xs text-gray-500">
                      {new Date(candidate.approvedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              
              {!candidate.isApproved && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Awaiting Review</p>
                    <p className="text-xs text-gray-500">
                      Application is under review
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          
          {!candidate.isApproved && (
            <>
              <button
                onClick={() => onReject(candidate._id, candidate.userId?.name)}
                disabled={rejecting || approving}
                className="px-4 py-2 text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center"
              >
                {rejecting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <UserX className="w-4 h-4 mr-2" />
                )}
                {rejecting ? 'Rejecting...' : 'Reject'}
              </button>
              
              <button
                onClick={() => onApprove(candidate._id, candidate.userId?.name)}
                disabled={approving || rejecting}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {approving ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <UserCheck className="w-4 h-4 mr-2" />
                )}
                {approving ? 'Approving...' : 'Approve Candidate'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailModal;