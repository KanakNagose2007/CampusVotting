import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ElectionResultsPage = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { connected, on, off, subscribeLiveResults, joinElection, leaveElection } = useSocket();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!electionId || !connected) return;

    // Join election room and subscribe for admins
    joinElection(electionId);
    if (isAdmin) {
      subscribeLiveResults(electionId);
    }

    const handleLiveResults = (data) => {
      if (data.electionId === electionId) {
        fetchResults();
      }
    };

    const handleVoteCast = (data) => {
      if (data.electionId === electionId) {
        fetchResults();
      }
    };

    on('live_results_update', handleLiveResults);
    on('vote_cast', handleVoteCast);

    return () => {
      off('live_results_update', handleLiveResults);
      off('vote_cast', handleVoteCast);
      leaveElection(electionId);
    };
  }, [connected, electionId, isAdmin]);


  useEffect(() => {
    const fetchElectionData = async () => {
      try {
        // Fetch all elections (admin) and find the one by ID to get positions and details
        const electionsRes = await axios.get(`/api/admin/elections`, {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        const found = Array.isArray(electionsRes.data)
          ? electionsRes.data.find(e => e._id === electionId)
          : null;

        if (!found) {
          throw new Error('Election not found');
        }

        setElection(found);

        // Fetch initial results
        fetchResults();
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load election data');
      } finally {
        setLoading(false);
      }
    };

    fetchElectionData();
  }, [electionId]);

  const fetchResults = async () => {
    try {
      // Use the voting results endpoint provided by the backend
      const resultsRes = await axios.get(`/api/voting/results/${electionId}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setResults(resultsRes.data?.results || {});
    } catch (err) {
      console.error('Error fetching results:', err);
    }
  };

  const getChartData = (position) => {
    if (!results[position]) return null;

    const candidates = results[position];
    return {
      labels: candidates.map(c => c.name),
      datasets: [
        {
          label: 'Votes',
          data: candidates.map(c => c.votes),
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(199, 199, 199, 0.6)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(199, 199, 199, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={() => navigate('/admin/elections')} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Elections
        </button>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Election not found.
        </div>
        <button 
          onClick={() => navigate('/admin/elections')} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Back to Elections
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{election.title} - Results</h1>
        <div>
          <button 
            onClick={() => navigate('/admin/elections')} 
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Back
          </button>
          <button 
            onClick={fetchResults} 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Refresh Results
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-600">Status: <span className="font-bold capitalize">{election.status}</span></p>
            <p className="text-gray-600">Start Date: <span className="font-bold">{new Date(election.startDate).toLocaleString()}</span></p>
            <p className="text-gray-600">End Date: <span className="font-bold">{new Date(election.endDate).toLocaleString()}</span></p>
          </div>
          <div>
            <p className="text-gray-600">Total Voters: <span className="font-bold">{election.totalVoters}</span></p>
            <p className="text-gray-600">Votes Cast: <span className="font-bold">{election.totalVotesCast}</span></p>
            <p className="text-gray-600">Turnout: <span className="font-bold">
              {election.totalVoters > 0 ? Math.round((election.totalVotesCast / election.totalVoters) * 100) : 0}%
            </span></p>
          </div>
        </div>
      </div>
      
      {election.positions.map(position => (
        <div key={position} className="bg-white shadow-md rounded p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">{position}</h2>
          
          {!results[position] ? (
            <p className="text-gray-500 italic">No results available for this position</p>
          ) : results[position].length === 0 ? (
            <p className="text-gray-500 italic">No candidates for this position</p>
          ) : (
            <div>
              <div className="h-64 mb-6">
                {getChartData(position) && (
                  <Bar data={getChartData(position)} options={chartOptions} />
                )}
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Candidate
                      </th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Votes
                      </th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {results[position]
                      .sort((a, b) => b.votes - a.votes)
                      .map((candidate, index) => {
                        const totalVotes = results[position].reduce((sum, c) => sum + c.votes, 0);
                        const percentage = totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0;
                        
                        return (
                          <tr key={candidate.candidateId || candidate.id || index} className={index === 0 ? "bg-green-50" : ""}>
                            <td className="py-2 px-4 border-b border-gray-200">
                              {index + 1}
                              {index === 0 && totalVotes > 0 && (
                                <span className="ml-2 text-green-600">🏆</span>
                              )}
                            </td>
                            <td className="py-2 px-4 border-b border-gray-200 font-medium">
                              {candidate.name}
                            </td>
                            <td className="py-2 px-4 border-b border-gray-200">
                              {candidate.votes}
                            </td>
                            <td className="py-2 px-4 border-b border-gray-200">
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[200px]">
                                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                                </div>
                                <span>{percentage}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ))}
      
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Results are updated in real-time as votes are cast.</p>
        <p>Last updated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default ElectionResultsPage;
