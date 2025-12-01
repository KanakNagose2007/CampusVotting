import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Award,
  BookOpen
} from 'lucide-react';

const CandidateRegistrationPage = () => {
  const { user, registerAsCandidate, getCandidateProfile, getElections } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState({
    manifesto: null,
    photo: null,
    idProof: null
  });
  const [availableElections, setAvailableElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  
  // Fetch available elections for candidate registration
  useEffect(() => {
    const fetchAvailableElections = async () => {
      const elections = await getElections();
      const candidateElections = elections.filter(e => e.status === 'active' || e.status === 'upcoming');
      setAvailableElections(candidateElections);
      
      if (candidateElections.length > 0) {
        setSelectedElectionId(candidateElections[0]._id);
      }
    };
    fetchAvailableElections();
  }, [getElections]);
  
  // Check if user is already a candidate
  useEffect(() => {
    const checkCandidateStatus = async () => {
      try {
        const candidateProfile = await getCandidateProfile();
        if (candidateProfile) {
          // User is already a candidate, redirect to dashboard
          toast.error('You are already registered as a candidate');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error checking candidate status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkCandidateStatus();
  }, [getCandidateProfile, navigate]);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      position: '',
      manifesto: '',
      experience: '',
      achievements: '',
      goals: '',
      contactPhone: '',
      socialMedia: {
        linkedin: '',
        twitter: '',
        instagram: ''
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

  const handleFileUpload = (file, type) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploadedFiles(prev => ({
      ...prev,
      [type]: file
    }));
    toast.success(`${type} uploaded successfully`);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Validate required files
      if (!uploadedFiles.photo || !uploadedFiles.idProof) {
        toast.error('Please upload required documents');
        setIsSubmitting(false);
        return;
      }

      if (!selectedElectionId) {
        toast.error('Please select an election. Cannot register as candidate.');
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('position', data.position);
      formData.append('manifesto', data.manifesto);
      formData.append('experience', data.experience);
      formData.append('achievements', data.achievements);
      formData.append('goals', data.goals);
      formData.append('contactPhone', data.contactPhone);
      formData.append('socialMedia', JSON.stringify(data.socialMedia));
      formData.append('photo', uploadedFiles.photo);
      formData.append('idProof', uploadedFiles.idProof);
      formData.append('electionId', selectedElectionId);
      if (uploadedFiles.manifesto) {
        formData.append('manifestoFile', uploadedFiles.manifesto);
      }

      // Call the API to register as a candidate
      const result = await registerAsCandidate(formData);

      if (result.success) {
        toast.success('Candidate registration submitted successfully!');
        toast.success('Your application is under review. You will be notified once approved.');
        // Redirect to dashboard or candidate profile page
        navigate('/dashboard');
      } else if (result.error === 'Validation error' && Array.isArray(result.details)) {
        result.details.forEach((msg) => toast.error(msg));
      } else {
        toast.error(result.error || 'Failed to submit registration');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to submit registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidate Registration</h1>
        <p className="text-gray-600">
          Register as a candidate for upcoming elections. Fill out the form below with your details and campaign information.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Personal Information */}
        {/* Election Selection */}
        <div className="card">
          <div className="flex items-center mb-6">
            <Calendar className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Election Selection</h2>
          </div>
          
          {availableElections.length > 0 ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Elections
              </label>
              <select
                value={selectedElectionId}
                onChange={(e) => setSelectedElectionId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {availableElections.map((election) => (
                  <option key={election._id} value={election._id}>
                    {election.title} ({election.status}) - {new Date(election.startDate).toLocaleDateString()}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Select the election you want to register as a candidate for.
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Elections Available</h3>
              <p className="text-gray-600 mb-4">
                There are currently no active or upcoming elections available for candidate registration.
              </p>
              <p className="text-sm text-gray-500">
                Please check back later or contact the admin if you believe this is an error.
              </p>
            </div>
          )}
        </div>

        {/* Personal Information */}
        <div className="card">
          <div className="flex items-center mb-6">
            <User className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={user?.name || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Roll Number
              </label>
              <input
                type="text"
                value={user?.rollNumber || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch
              </label>
              <input
                type="text"
                value={user?.branch || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <input
                type="text"
                value={user?.year || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Position Selection */}
        <div className="card">
          <div className="flex items-center mb-6">
            <Award className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Position & Campaign</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position Applied For *
              </label>
              <select
                {...register('position', { required: 'Please select a position' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a position</option>
                {positions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
              {errors.position && (
                <p className="text-red-500 text-sm mt-1">{errors.position.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Manifesto *
              </label>
              <textarea
                {...register('manifesto', { required: 'Please write your manifesto' })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe your vision, goals, and plans if elected..."
              />
              {errors.manifesto && (
                <p className="text-red-500 text-sm mt-1">{errors.manifesto.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Previous Experience
              </label>
              <textarea
                {...register('experience')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe your relevant experience in leadership, student activities, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Achievements
              </label>
              <textarea
                {...register('achievements')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="List your notable achievements and accomplishments"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goals & Objectives
              </label>
              <textarea
                {...register('goals')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="What do you hope to achieve if elected?"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card">
          <div className="flex items-center mb-6">
            <BookOpen className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                {...register('contactPhone', { 
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: 'Please enter a valid 10-digit phone number'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your phone number"
              />
              {errors.contactPhone && (
                <p className="text-red-500 text-sm mt-1">{errors.contactPhone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn
                </label>
                <input
                  type="url"
                  {...register('socialMedia.linkedin')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter
                </label>
                <input
                  type="url"
                  {...register('socialMedia.twitter')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram
                </label>
                <input
                  type="url"
                  {...register('socialMedia.instagram')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="https://instagram.com/yourhandle"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Document Upload */}
        <div className="card">
          <div className="flex items-center mb-6">
            <Upload className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Document Upload</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Photo *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files[0], 'photo')}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {uploadedFiles.photo ? uploadedFiles.photo.name : 'Click to upload profile photo'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Proof *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e.target.files[0], 'idProof')}
                  className="hidden"
                  id="id-proof-upload"
                />
                <label htmlFor="id-proof-upload" className="cursor-pointer">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {uploadedFiles.idProof ? uploadedFiles.idProof.name : 'Click to upload ID proof'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG up to 5MB</p>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manifesto Document (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e.target.files[0], 'manifesto')}
                  className="hidden"
                  id="manifesto-upload"
                />
                <label htmlFor="manifesto-upload" className="cursor-pointer">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {uploadedFiles.manifesto ? uploadedFiles.manifesto.name : 'Click to upload manifesto document'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX up to 5MB</p>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-2">Important Information</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your application will be reviewed by the election committee</li>
                <li>• You will be notified via email about the approval status</li>
                <li>• All information provided must be accurate and verifiable</li>
                <li>• Campaigning can only begin after approval</li>
                <li>• Violation of election rules may result in disqualification</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || availableElections.length === 0}
            className={`btn ${availableElections.length === 0 ? 'btn-disabled' : 'btn-primary'}`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : availableElections.length === 0 ? (
              <>
                <AlertCircle className="w-4 h-4 mr-2" />
                No Elections Available
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Submit Application
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CandidateRegistrationPage;
