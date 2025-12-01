import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import toast from 'react-hot-toast';
import { 
  User, 
  Award, 
  Target, 
  Star,
  ThumbsUp,
  Search,
  Mail,
  Phone,
  ExternalLink,
  Vote,
  CheckCircle,
  Clock
} from 'lucide-react';

const CandidateProfilesPage = () => {
  const { user, castVote, checkVotingStatus, getElections } = useAuth();
  const { connected, joinElection, leaveElection } = useSocket();
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPosition, setFilterPosition] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [activeElection, setActiveElection] = useState(null);
  const [votingStatus, setVotingStatus] = useState(null);
  const [voting, setVoting] = useState({});

  // Mock candidates for development
  const mockCandidates = [
    {
      id: 1,
      name: 'John Doe',
      position: 'Student Council President',
      department: 'Computer Science',
      year: '3rd Year',
      rollNumber: 'CS2021001',
      email: 'john.doe@university.edu',
      phone: '+1 (555) 123-4567',
      photo: null,
      manifesto: 'I believe in creating an inclusive campus environment where every student has access to resources they need to succeed. My focus will be on improving academic resources, mental health support, and campus facilities.',
      experience: [
        'Class Representative for 2 years',
        'Member of Student Council',
        'Organized 5 major campus events',
        'Led the Computer Science Club'
      ],
      achievements: [
        'Dean\'s List 2022-2023',
        'Outstanding Leadership Award 2023',
        'First Place in Hackathon 2022',
        'Published research paper in student journal'
      ],
      goals: [
        'Improve campus Wi-Fi infrastructure',
        'Establish 24/7 study spaces',
        'Create mental health support programs',
        'Enhance career counseling services',
        'Implement sustainable campus initiatives'
      ],
      socialMedia: {
        linkedin: 'https://linkedin.com/in/johndoe',
        twitter: 'https://twitter.com/johndoe',
        instagram: 'https://instagram.com/johndoe'
      },
      endorsements: 45,
      rating: 4.8,
      isVerified: true,
      campaignStartDate: '2024-12-01T00:00:00Z',
      manifestoFile: null
    },
    {
      id: 2,
      name: 'Jane Smith',
      position: 'Student Council President',
      department: 'Electronics',
      year: '4th Year',
      rollNumber: 'EC2020001',
      email: 'jane.smith@university.edu',
      phone: '+1 (555) 234-5678',
      photo: null,
      manifesto: 'As a fourth-year student, I have witnessed the challenges and opportunities our campus offers. I am committed to leveraging technology to improve student life, creating better communication channels, and ensuring transparency in all student government activities.',
      experience: [
        'Cultural Secretary for 1 year',
        'Founded the Tech Innovation Club',
        'Led 3 successful fundraising campaigns',
        'Mentored 20+ junior students'
      ],
      achievements: [
        'Innovation Excellence Award 2023',
        'Leadership in Technology Award 2022',
        'Outstanding Community Service 2023',
        'Dean\'s List for 4 consecutive semesters'
      ],
      goals: [
        'Implement digital voting for all student decisions',
        'Create a mobile app for campus services',
        'Establish tech mentorship programs',
        'Improve lab facilities and equipment',
        'Promote diversity and inclusion initiatives'
      ],
      socialMedia: {
        linkedin: 'https://linkedin.com/in/janesmith',
        twitter: 'https://twitter.com/janesmith',
        instagram: 'https://instagram.com/janesmith'
      },
      endorsements: 38,
      rating: 4.6,
      isVerified: true,
      campaignStartDate: '2024-12-01T00:00:00Z',
      manifestoFile: null
    },
    {
      id: 3,
      name: 'Mike Johnson',
      position: 'Student Council Vice President',
      department: 'Mechanical',
      year: '3rd Year',
      rollNumber: 'ME2021001',
      email: 'mike.johnson@university.edu',
      phone: '+1 (555) 345-6789',
      photo: null,
      manifesto: 'I am passionate about creating a more sustainable and environmentally conscious campus. My focus will be on implementing green initiatives, improving campus infrastructure, and ensuring that student voices are heard in all major decisions.',
      experience: [
        'Environmental Club President',
        'Organized 2 sustainability conferences',
        'Led campus clean-up initiatives',
        'Student representative in sustainability committee'
      ],
      achievements: [
        'Environmental Leadership Award 2023',
        'Sustainability Champion 2022',
        'Community Impact Award 2023',
        'Academic Merit Scholarship 2022'
      ],
      goals: [
        'Implement solar panel installations',
        'Create campus recycling programs',
        'Establish green transportation options',
        'Improve campus landscaping',
        'Promote sustainable living practices'
      ],
      socialMedia: {
        linkedin: 'https://linkedin.com/in/mikejohnson',
        twitter: 'https://twitter.com/mikejohnson',
        instagram: 'https://instagram.com/mikejohnson'
      },
      endorsements: 32,
      rating: 4.4,
      isVerified: true,
      campaignStartDate: '2024-12-01T00:00:00Z',
      manifestoFile: null
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      position: 'Cultural Secretary',
      department: 'Electronics',
      year: '4th Year',
      rollNumber: 'EC2020002',
      email: 'sarah.wilson@university.edu',
      phone: '+1 (555) 456-7890',
      photo: null,
      manifesto: 'Culture and arts are the soul of any educational institution. I aim to create a vibrant cultural environment that celebrates diversity, promotes creativity, and provides platforms for all students to showcase their talents.',
      experience: [
        'Cultural Committee Member for 2 years',
        'Organized 8 major cultural events',
        'Founded the Art Appreciation Society',
        'Led inter-college cultural competitions'
      ],
      achievements: [
        'Cultural Excellence Award 2023',
        'Event Management Excellence 2022',
        'Art and Culture Ambassador 2023',
        'Student Creativity Award 2022'
      ],
      goals: [
        'Establish cultural exchange programs',
        'Create dedicated art and music spaces',
        'Organize monthly cultural festivals',
        'Support student artist initiatives',
        'Promote cultural diversity awareness'
      ],
      socialMedia: {
        linkedin: 'https://linkedin.com/in/sarahwilson',
        twitter: 'https://twitter.com/sarahwilson',
        instagram: 'https://instagram.com/sarahwilson'
      },
      endorsements: 28,
      rating: 4.7,
      isVerified: true,
      campaignStartDate: '2024-12-01T00:00:00Z',
      manifestoFile: null
    }
  ];

  const positions = [
    'Student Council President',
    'Student Council Vice President',
    'Student Council Secretary',
    'Student Council Treasurer',
    'Class Representative',
    'Cultural Secretary',
    'Sports Secretary',
    'Technical Secretary'
  ];

  const departments = [
    'Computer Science',
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical',
    'Chemical',
    'Aerospace',
    'Biotechnology'
  ];

  useEffect(() => {
    fetchCandidates();
  }, [searchQuery, filterPosition, filterDepartment]);
  
  // Socket event listeners for real-time updates
  useEffect(() => {
    if (connected && activeElection) {
      // Listen for vote count updates
      const handleVoteUpdate = (data) => {
        console.log('Received vote update:', data);
        // Refresh voting status when someone votes
        checkVotingStatus().then(status => {
          setVotingStatus(status);
        });
      };
      
      const handleElectionUpdate = (data) => {
        console.log('Received election update:', data);
        // Refresh candidates data
        fetchCandidates();
      };
      
      // Attach event listeners (assuming socket is available through useSocket)
      // Note: This depends on your socket implementation
      // socket.on('voteUpdate', handleVoteUpdate);
      // socket.on('electionUpdate', handleElectionUpdate);
      
      return () => {
        // Cleanup listeners
        // socket.off('voteUpdate', handleVoteUpdate);
        // socket.off('electionUpdate', handleElectionUpdate);
      };
    }
  }, [connected, activeElection, checkVotingStatus]);

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      // Fetch candidates first to determine which election has candidates
      let data = [];
      try {
        // Use axios so base URL and x-auth-token defaults are applied.
        // Also guard against missing axios baseURL by constructing an absolute URL.
        const API_BASE = axios.defaults.baseURL || process.env.REACT_APP_API_URL || '';
        const url = API_BASE ? `${API_BASE.replace(/\/$/, '')}/api/candidate/all` : '/api/candidate/all';
        const candidatesResponse = await axios.get(url);
        data = Array.isArray(candidatesResponse.data) ? candidatesResponse.data : [];
        console.log('Raw candidates data:', data);
      } catch (candidateError) {
        console.error('Error fetching candidates:', candidateError);
      }
      
      // Find the election ID from the first available candidate
      let activeElectionFound = null;
      if (data.length > 0) {
        const firstCandidate = data[0];
        const electionId = (() => {
          if (typeof firstCandidate.electionId === 'string') {
            return firstCandidate.electionId;
          } else if (firstCandidate.electionId && firstCandidate.electionId._id) {
            return firstCandidate.electionId._id;
          } else if (firstCandidate.electionId && typeof firstCandidate.electionId === 'object') {
            return firstCandidate.electionId.toString();
          }
          return firstCandidate.electionId;
        })();
        
        activeElectionFound = {
          _id: electionId,
          title: 'Active Election (from candidates)',
          status: 'active'
        };
        console.log('Using election from candidates:', activeElectionFound);
      } else {
        // Fallback if no candidates found
        console.log('No candidates found, using fallback election');
        activeElectionFound = {
          _id: '68eb8eeeef13a7b7be3fad3d',
          title: 'Fallback Election',
          status: 'active'
        };
      }
      
      setActiveElection(activeElectionFound);
      console.log('Set active election:', activeElectionFound);
      
      // Join election room for real-time updates
      if (activeElectionFound && connected) {
        joinElection(activeElectionFound._id);
      }
      
      // Check voting status
      const status = await checkVotingStatus();
      setVotingStatus(status);
      
      // Debug: Log the raw candidate data to understand structure
      console.log('Raw candidate data sample:', data[0]);
      
      // Transform the data to match the expected format
      const transformedData = data.map(candidate => ({
        id: candidate._id,
        electionId: (() => {
          // Handle different ObjectId formats
          if (typeof candidate.electionId === 'string') {
            return candidate.electionId;
          } else if (candidate.electionId && candidate.electionId._id) {
            return candidate.electionId._id;
          } else if (candidate.electionId && typeof candidate.electionId === 'object') {
            return candidate.electionId.toString();
          }
          return candidate.electionId;
        })(),
        name: candidate.userId?.name || 'Unknown',
        position: candidate.position,
        department: candidate.userId?.branch || 'Unknown',
        year: candidate.userId?.year ? `${candidate.userId.year}${candidate.userId.year === 1 ? 'st' : candidate.userId.year === 2 ? 'nd' : candidate.userId.year === 3 ? 'rd' : 'th'} Year` : 'Unknown',
        rollNumber: candidate.userId?.rollNo || 'Unknown',
        email: candidate.userId?.email || '',
        phone: candidate.contactPhone || '',
        photo: candidate.photoUrl,
        manifesto: candidate.manifesto || 'No manifesto provided',
        experience: candidate.experience ? [candidate.experience] : [],
        achievements: candidate.achievements || [],
        goals: candidate.goals ? [candidate.goals] : [],
        socialMedia: candidate.socialMedia || {},
        endorsements: Math.floor(Math.random() * 50), // Placeholder
        rating: (Math.random() * 1.5 + 3.5).toFixed(1), // Placeholder
        isVerified: candidate.isApproved,
        campaignStartDate: candidate.createdAt,
        manifestoFile: candidate.manifestoFileUrl
      }));
      
      // Debug: Log the transformed election IDs
      console.log('Transformed election IDs:', transformedData.map(c => ({ name: c.name, electionId: c.electionId, type: typeof c.electionId })));
      
      // Apply client-side filtering
      let filtered = transformedData;
      
      if (searchQuery) {
        filtered = filtered.filter(candidate => 
          candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          candidate.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
          candidate.department.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      if (filterPosition !== 'all') {
        filtered = filtered.filter(candidate => candidate.position === filterPosition);
      }
      
      if (filterDepartment !== 'all') {
        filtered = filtered.filter(candidate => candidate.department === filterDepartment);
      }
      
      setCandidates(filtered);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      // Fallback to empty array instead of mock data
      setCandidates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (candidate) => {
    // Use the candidate's actual election ID instead of a global activeElection
    const candidateElectionId = candidate.electionId;
    
    if (!candidateElectionId) {
      toast.error('No election found for this candidate');
      return;
    }
    
    if (votingStatus?.hasVoted) {
      toast.error('You have already voted in this election');
      return;
    }
    
    setVoting(prev => ({ ...prev, [candidate.id]: true }));
    
    try {
      console.log('Attempting to vote for candidate:', {
        candidateId: candidate.id,
        candidateName: candidate.name,
        position: candidate.position,
        electionId: candidateElectionId
      });
      
      const result = await castVote({
        electionId: candidateElectionId,
        candidateId: candidate.id,
        position: candidate.position
      });
      
      console.log('Vote result:', result);
      
      if (result.success) {
        toast.success(`Vote cast successfully for ${candidate.name}!`);
        // Update voting status
        const status = await checkVotingStatus();
        setVotingStatus(status);
        // Refresh candidate data to get updated vote counts
        fetchCandidates();
      } else {
        console.error('Vote failed:', result.error);
        toast.error(result.error || 'Failed to cast vote');
      }
    } catch (error) {
      console.error('Voting error:', error);
      toast.error(`Server error: ${error.message || 'Failed to cast vote'}`);
    } finally {
      setVoting(prev => ({ ...prev, [candidate.id]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidate Profiles</h1>
        <p className="text-gray-600">Learn about the candidates running for various positions</p>
        {/* Debug info - remove in production */}
        {activeElection && (
          <div className="mt-2 p-3 bg-green-100 text-green-800 rounded-lg text-sm">
            ✅ Active Election: {activeElection.title} (ID: {activeElection._id})
          </div>
        )}
        {!activeElection && (
          <div className="mt-2 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
            ❌ No active election found
          </div>
        )}
        {votingStatus && (
          <div className="mt-2 p-3 bg-blue-100 text-blue-800 rounded-lg text-sm">
            Voting Status: {votingStatus.hasVoted ? '✅ Already voted' : '🗳️ Ready to vote'}
          </div>
        )}
        {user && (
          <div className="mt-2 p-3 bg-purple-100 text-purple-800 rounded-lg text-sm">
            👤 User: {user.name} ({user.branch}, Year {user.year}) - {user.role}
          </div>
        )}
        {candidates.length > 0 && (
          <div className="mt-2 p-3 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
            📄 Candidates loaded: {candidates.length} candidates ready for voting
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <select
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Positions</option>
            {positions.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
          
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Departments</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
            <p className="text-gray-600">Try adjusting your search criteria.</p>
          </div>
        ) : (
          candidates.map((candidate) => (
            <div key={candidate.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-primary-600">
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {candidate.name}
                    </h3>
                    {candidate.isVerified && (
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                        <Award className="w-3 h-3 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{candidate.position}</p>
                  <p className="text-sm text-gray-500">
                    {candidate.department} - {candidate.year}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-700 line-clamp-3">
                  {candidate.manifesto}
                </p>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{candidate.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="w-4 h-4 text-green-500" />
                    <span>{candidate.endorsements}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCandidate(candidate)}
                  className="w-full btn btn-outline btn-sm"
                >
                  <User className="w-4 h-4 mr-2" />
                  View Full Profile
                </button>
                
                <button
                  className={`w-full btn vote-btn ${
                    voting[candidate.id] ? 'voting' : ''
                  } ${
                    votingStatus?.hasVoted ? 'disabled' : ''
                  }`}
                  onClick={() => handleVote(candidate)}
                  disabled={voting[candidate.id] || votingStatus?.hasVoted}
                >
                  {voting[candidate.id] ? (
                    <>
                      <span className="loading-spinner mr-2"></span>
                      Voting...
                    </>
                  ) : votingStatus?.hasVoted ? (
                    'Already Voted'
                  ) : (
                    <>
                      <Star className="w-4 h-4 mr-2" />
                      Vote Now
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-600">
                      {selectedCandidate.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCandidate.name}</h2>
                    <p className="text-lg text-gray-600">{selectedCandidate.position}</p>
                    <p className="text-gray-500">
                      {selectedCandidate.department} - {selectedCandidate.year}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Manifesto</h3>
                    <p className="text-gray-700">{selectedCandidate.manifesto}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Experience</h3>
                    <ul className="space-y-2">
                      {selectedCandidate.experience.map((exp, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{exp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Achievements</h3>
                    <ul className="space-y-2">
                      {selectedCandidate.achievements.map((achievement, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Award className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Goals & Objectives</h3>
                    <ul className="space-y-2">
                      {selectedCandidate.goals.map((goal, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Target className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{goal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{selectedCandidate.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{selectedCandidate.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Social Media</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedCandidate.socialMedia).map(([platform, url]) => (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span className="text-sm capitalize">{platform}</span>
                        </a>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Campaign Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Endorsements</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedCandidate.endorsements}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Rating</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {selectedCandidate.rating}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Campaign Started</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(selectedCandidate.campaignStartDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      className={`w-full btn vote-btn ${
                        voting[selectedCandidate.id] ? 'voting' : ''
                      } ${
                        votingStatus?.hasVoted ? 'disabled' : ''
                      }`}
                      onClick={() => handleVote(selectedCandidate)}
                      disabled={voting[selectedCandidate.id] || votingStatus?.hasVoted}
                    >
                      {voting[selectedCandidate.id] ? (
                        <>
                          <span className="loading-spinner mr-2"></span>
                          Voting...
                        </>
                      ) : votingStatus?.hasVoted ? (
                        'Already Voted'
                      ) : (
                        <>
                          <Star className="w-4 h-4 mr-2" />
                          Vote Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateProfilesPage;
