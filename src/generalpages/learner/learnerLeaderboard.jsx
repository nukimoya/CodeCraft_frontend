import React, { useState, useEffect, useRef, useCallback, useContext, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Download, Trophy, Medal, Users, Flame, AlertTriangle } from 'lucide-react';
import LearnerSidebar from '../../components/learnerSidebar';
import html2canvas from 'html2canvas';
import { AuthContext } from '../../context/authContext';

const LearnerLeaderboard = () => {
  // State management
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState('');
  //eslint-disable-next-line
  const [debugInfo, setDebugInfo] = useState({});
  const { user } = useContext(AuthContext);
  //   const navigate = useNavigate();
  
  // Refs
  const leaderboardRef = useRef(null);

  // Debug logging function
  const logDebug = useCallback((section, data) => {
    // console.log(`[DEBUG:${section}]`, data);
    setDebugInfo(prev => ({
      ...prev,
      [section]: data
    }));
  }, []);

  // Fetch classrooms
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        logDebug('Auth', { 
          userExists: !!user, 
          userData: user?.data ? 'exists' : 'missing',
          token: user?.data?.token ? 'exists' : 'missing'
        });
        
        const token = user?.data?.token;
        
        if (!token) {
          setError('Authentication token not found. Please log in again.');
          setLoading(false);
          logDebug('TokenCheck', { error: 'No token found' });
          return;
        }
        
        const url = `http://localhost:5005/learner/classrooms/available`;
        logDebug('FetchClassrooms', { url, method: 'GET' });
        
        const response = await fetch(url, { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          } 
        });
        
        logDebug('ClassroomsResponse', { 
          status: response.status, 
          ok: response.ok,
          statusText: response.statusText
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        logDebug('ClassroomsData', { 
          received: !!data,
          classroomsArray: data.classrooms ? 'exists' : 'missing',
          count: data.classrooms?.length || 0
        });
        
        setClassrooms(data.classrooms || []);
      } catch (error) {
        setError('Failed to load classrooms. Please try again.');
        logDebug('ClassroomsError', { 
          message: error.message,
          stack: error.stack
        });
      }
    };

    fetchClassrooms();
  }, [user, logDebug]);

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async () => {
    if (!selectedClassroom) {
      logDebug('LeaderboardFetch', { error: 'No classroom selected' });
      setError('Please select a classroom to view the leaderboard.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const token = user?.data?.token;
      if (!token) {
        logDebug('LeaderboardToken', { error: 'No token available' });
        throw new Error('Authentication token not found');
      }
      
      const url = `http://localhost:5005/learner/classrooms/${selectedClassroom}/leaderboard`;
      logDebug('LeaderboardFetch', { url, method: 'GET', classroomId: selectedClassroom });
      
      const response = await fetch(
        url,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          } 
        }
      );
      
      logDebug('LeaderboardResponse', { 
        status: response.status, 
        ok: response.ok,
        statusText: response.statusText
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Log the raw data to debug
      logDebug('RawLeaderboardData', {
        data: data,
        leaderboard: data.leaderboard || []
      });
      
      // Process the leaderboard data to add rank
      // Ensure we're working with numbers for sorting
      const leaderboardData = (data.leaderboard || []).map(entry => ({
        ...entry,
        xp: Number(entry.xp || 0),
        highest_streak: Number(entry.highest_streak || 0),
        current_streak: Number(entry.current_streak || 0)
      }));
      
      // Sort by XP first (highest to lowest), then by highest streak, then by current streak
      const sortedData = [...leaderboardData].sort((a, b) => {
        // Primary sort by XP (descending)
        if (a.xp !== b.xp) return b.xp - a.xp;
        
        // Secondary sort by highest streak (descending)
        if (a.highest_streak !== b.highest_streak) return b.highest_streak - a.highest_streak;
        
        // Tertiary sort by current streak (descending)
        return b.current_streak - a.current_streak;
      });
      
      // Log the sorted data to debug
      logDebug('SortedLeaderboardData', {
        sortedData: sortedData,
        firstEntry: sortedData[0] || {},
        lastEntry: sortedData[sortedData.length - 1] || {}
      });
      
      // Add rank to each entry
      const processedData = sortedData.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
      
      logDebug('LeaderboardData', { 
        received: !!data,
        leaderboardArray: data.leaderboard ? 'exists' : 'missing',
        count: processedData.length,
        sample: processedData.slice(0, 2) || [],
        rawData: data
      });
      
      setLeaderboard(processedData);
    } catch (error) {
      setError(error.message || 'Failed to load leaderboard data');
      logDebug('LeaderboardError', { 
        message: error.message,
        stack: error.stack
      });
    } finally {
      setLoading(false);
    }
  }, [selectedClassroom, user, logDebug]);

  // No longer auto-fetching when classroom changes
  // Instead, we'll have a "View Leaderboard" button

  // Find current user in leaderboard
  const currentUser = useMemo(() => {
    // Log the full leaderboard data to see its structure
    logDebug('LeaderboardFullData', { 
      leaderboardEntries: leaderboard,
      firstEntry: leaderboard[0] || {},
      userIds: leaderboard.map(entry => entry.student_id),
      currentUserId: user?.data?.user?.id,
      userIdType: typeof user?.data?.user?.id
    });
    
    // Find user by student_id field (matching the actual data)
    const foundUser = leaderboard.find(entry => 
      entry.student_id === user?.data?.user?.id || 
      entry.student_id === Number(user?.data?.user?.id) ||
      String(entry.student_id) === String(user?.data?.user?.id)
    );
    
    logDebug('CurrentUser', { 
      userId: user?.data?.user?.id,
      userIdType: typeof user?.data?.user?.id,
      found: !!foundUser,
      currentUserData: foundUser,
      firstEntryFields: leaderboard[0] ? Object.keys(leaderboard[0]) : []
    });
    
    return foundUser;
  }, [leaderboard, user?.data?.user?.id, logDebug]);

  // Export leaderboard as image
  const exportLeaderboard = async () => {
    if (!leaderboardRef.current) {
      logDebug('Export', { error: 'Leaderboard ref not available' });
      return;
    }

    try {
      logDebug('Export', { status: 'starting' });
      // Show loading state for export
      const exportButton = document.getElementById('export-button');
      if (exportButton) {
        exportButton.disabled = true;
        exportButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Exporting...';
      }
      
      const canvas = await html2canvas(leaderboardRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `codecraft-leaderboard-${selectedClassroom}.png`;
      link.click();
      
      logDebug('Export', { status: 'completed' });
    } catch (error) {
      console.error('Error exporting leaderboard:', error);
      logDebug('ExportError', { 
        message: error.message,
        stack: error.stack
      });
    } finally {
      // Reset button state
      const exportButton = document.getElementById('export-button');
      if (exportButton) {
        exportButton.disabled = false;
        exportButton.innerHTML = '<svg class="w-4 h-4 mr-2"></svg>Export';
      }
    }
  };

  // Style getter for rank
  // eslint-disable-next-line
  const getRankStyle = (rank) => {
    const styles = {
      1: 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 border-yellow-200',
      2: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border-gray-200',
      3: 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border-amber-200',
      default: 'bg-white text-gray-800 border-gray-100'
    };
    return styles[rank] || styles.default;
  };

  // Render top 3 podium component
  const TopThreePodium = ({ leaderboard }) => {
    // Make sure we have at least 3 entries, or pad with empty slots
    const top3 = [...leaderboard.slice(0, 3)];
    while (top3.length < 3) {
      top3.push(null); // Add empty slots if needed
    }
    
    // Reorder to put 1st place in the middle (2nd, 1st, 3rd)
    const orderedPodium = [top3[1], top3[0], top3[2]];
    
    return (
      <div className="d-none d-md-flex justify-content-center mb-5 position-relative" style={{ height: '280px' }}>
        {/* Second Place - Left */}
        <div className="position-absolute" style={{ bottom: '0', left: '50%', marginLeft: '-250px', width: '180px' }}>
          {orderedPodium[0] ? (
            <div className={`d-flex flex-column align-items-center p-4 rounded-3 border ${
              orderedPodium[0].student_id === user?.data?.user?.id ? 'border-2 border-primary' : 'border-secondary'
            }`} style={{ 
              height: '220px', 
              background: 'linear-gradient(135deg, #e6e6e6, #f5f5f5, #ffffff)',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
            }}>
              <div className="mb-2">
                <Medal className="text-secondary" style={{ width: '2.5rem', height: '2.5rem', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))' }} />
              </div>
              <div className="text-center">
                <div className="fw-semibold fs-5 mb-1">
                  {orderedPodium[0].name !== 'undefined' ? orderedPodium[0].name : `Student ${orderedPodium[0].student_id}`}
                </div>
                <div className="badge mb-2" style={{ background: 'linear-gradient(to right, #C0C0C0, #E8E8E8)', color: '#333' }}>Silver Medal</div>
                <div className="d-flex justify-content-center gap-3">
                  <div className="text-center">
                    <div className="d-flex align-items-center justify-content-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-lightning-charge-fill text-warning" viewBox="0 0 16 16">
                        <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"/>
                      </svg>
                      <span className="fw-bold fs-5">{orderedPodium[0].xp || 0}</span>
                    </div>
                    <div className="small text-muted">XP</div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <Flame className="text-orange" style={{ width: '1rem', height: '1rem' }} />
                    <span className="small text-muted">Streak: {orderedPodium[0].current_streak || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column align-items-center p-4 rounded-3 border border-secondary shadow-sm opacity-50" style={{ 
              height: '220px',
              background: 'linear-gradient(135deg, #e6e6e6, #f5f5f5, #ffffff)'
            }}>
              <div className="mb-2">
                <Medal className="text-secondary" style={{ width: '2.5rem', height: '2.5rem' }} />
              </div>
              <div className="text-center">
                <div className="fw-semibold fs-5 mb-1">Silver Medal</div>
                <div className="badge mb-2" style={{ background: 'linear-gradient(to right, #C0C0C0, #E8E8E8)', color: '#333' }}>Not Yet Claimed</div>
              </div>
            </div>
          )}
        </div>
        
        {/* First Place - Middle/Center */}
        <div className="position-absolute" style={{ bottom: '0', left: '50%', marginLeft: '-90px', width: '180px', zIndex: 2 }}>
          {orderedPodium[1] ? (
            <div className={`d-flex flex-column align-items-center p-4 rounded-3 border ${
              orderedPodium[1].student_id === user?.data?.user?.id ? 'border-2 border-primary' : 'border-warning'
            }`} style={{ 
              height: '280px', 
              background: 'linear-gradient(135deg, #FFD700, #FFC800, #FFEF99)',
              boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)'
            }}>
              <div className="mb-3">
                <Trophy className="text-warning" style={{ 
                  width: '3.5rem', 
                  height: '3.5rem', 
                  filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.2))',
                  color: '#FFD700'
                }} />
              </div>
              <div className="text-center">
                <div className="fw-bold fs-4 mb-1 text-dark">
                  {orderedPodium[1].name !== 'undefined' ? orderedPodium[1].name : `Student ${orderedPodium[1].student_id}`}
                </div>
                <div className="badge mb-3" style={{ background: 'linear-gradient(to right, #FFD700, #FFC107)', color: '#5D4037' }}>Gold Medal</div>
                <div className="d-flex justify-content-center gap-4">
                  <div className="text-center">
                    <div className="d-flex align-items-center justify-content-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-lightning-charge-fill text-warning" viewBox="0 0 16 16">
                        <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"/>
                      </svg>
                      <span className="fw-bold fs-4">{orderedPodium[1].xp || 0}</span>
                    </div>
                    <div className="small text-dark">XP</div>
                  </div>
                </div>
                {/* <div className="mt-3">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <Flame className="text-orange" style={{ width: '1.25rem', height: '1.25rem' }} />
                    <span className="text-dark">Current Streak: {orderedPodium[1].current_streak || 0}</span>
                  </div>
                </div> */}
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column align-items-center p-4 rounded-3 border border-warning shadow opacity-50" style={{ 
              height: '280px',
              background: 'linear-gradient(135deg, #FFD700, #FFC800, #FFEF99)'
            }}>
              <div className="mb-3">
                <Trophy className="text-warning" style={{ width: '3.5rem', height: '3.5rem' }} />
              </div>
              <div className="text-center">
                <div className="fw-bold fs-4 mb-1 text-dark">Gold Medal</div>
                <div className="badge mb-3" style={{ background: 'linear-gradient(to right, #FFD700, #FFC107)', color: '#5D4037' }}>Not Yet Claimed</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Third Place - Right */}
        <div className="position-absolute" style={{ bottom: '0', left: '50%', marginLeft: '70px', width: '180px' }}>
          {orderedPodium[2] ? (
            <div className={`d-flex flex-column align-items-center p-4 rounded-3 border ${
              orderedPodium[2].student_id === user?.data?.user?.id ? 'border-2 border-primary' : 'border-danger-subtle'
            }`} style={{ 
              height: '200px', 
              background: 'linear-gradient(135deg, #CD7F32, #D2691E, #DEB887)',
              boxShadow: '0 4px 15px rgba(205, 127, 50, 0.2)'
            }}>
              <div className="mb-2">
                <Medal className="text-warning-emphasis" style={{ 
                  width: '2rem', 
                  height: '2rem', 
                  filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))',
                  color: '#CD7F32'
                }} />
              </div>
              <div className="text-center">
                <div className="fw-semibold fs-5 mb-1 text-white">
                  {orderedPodium[2].name !== 'undefined' ? orderedPodium[2].name : `Student ${orderedPodium[2].student_id}`}
                </div>
                <div className="badge mb-2" style={{ background: 'linear-gradient(to right, #CD7F32, #B87333)', color: '#FFF' }}>Bronze Medal</div>
                <div className="d-flex justify-content-center gap-3">
                  <div className="text-center">
                    <div className="d-flex align-items-center justify-content-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-lightning-charge-fill text-warning" viewBox="0 0 16 16">
                        <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"/>
                      </svg>
                      <span className="fw-bold fs-5 text-white">{orderedPodium[2].xp || 0}</span>
                    </div>
                    <div className="small text-white text-opacity-75">XP</div>
                  </div>
                </div>
                {/* <div className="mt-2">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <Flame className="text-orange" style={{ width: '1rem', height: '1rem' }} />
                    <span className="small text-white text-opacity-75">Streak: {orderedPodium[2].current_streak || 0}</span>
                  </div>
                </div> */}
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column align-items-center p-4 rounded-3 border border-danger-subtle shadow-sm opacity-50" style={{ 
              height: '200px',
              background: 'linear-gradient(135deg, #CD7F32, #D2691E, #DEB887)'
            }}>
              <div className="mb-2">
                <Medal className="text-warning-emphasis" style={{ width: '2rem', height: '2rem' }} />
              </div>
              <div className="text-center">
                <div className="fw-semibold fs-5 mb-1 text-white">Bronze Medal</div>
                <div className="badge mb-2" style={{ background: 'linear-gradient(to right, #CD7F32, #B87333)', color: '#FFF' }}>Not Yet Claimed</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Podium Base */}
        <div className="position-absolute" style={{ bottom: '0', left: '50%', marginLeft: '-250px', width: '500px', height: '30px' }}>
          <div className="d-flex h-100">
            <div className="flex-grow-1 rounded-top-3 border border-bottom-0" style={{ 
              marginTop: '10px', 
              background: 'linear-gradient(to bottom, #C0C0C0, #E8E8E8)'
            }}></div>
            <div className="flex-grow-1 rounded-top-3 border border-bottom-0" style={{ 
              background: 'linear-gradient(to bottom, #FFD700, #FFC107)'
            }}></div>
            <div className="flex-grow-1 rounded-top-3 border border-bottom-0" style={{ 
              marginTop: '20px', 
              background: 'linear-gradient(to bottom, #CD7F32, #D2691E)'
            }}></div>
          </div>
        </div>
      </div>
    );
  };

  // Render leaderboard entry component
  const LeaderboardEntry = ({ entry }) => {
    const isCurrentUser = entry.student_id === user?.data?.user?.id;
    
    return (
      <div
        className={`d-flex flex-column flex-sm-row align-items-sm-center justify-content-between p-3 rounded-3 border ${
          isCurrentUser ? 'border-2 border-primary' : ''
        } shadow-sm`}
        style={{
          background: entry.rank === 1 
            ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.2))' 
            : entry.rank === 2 
            ? 'linear-gradient(135deg, rgba(192, 192, 192, 0.1), rgba(192, 192, 192, 0.2))' 
            : entry.rank === 3 
            ? 'linear-gradient(135deg, rgba(205, 127, 50, 0.1), rgba(205, 127, 50, 0.2))' 
            : 'white',
          borderColor: entry.rank === 1 
            ? '#FFD700' 
            : entry.rank === 2 
            ? '#C0C0C0' 
            : entry.rank === 3 
            ? '#CD7F32' 
            : '#e0e0e0'
        }}
      >
        <div className="d-flex align-items-center gap-3 mb-3 mb-sm-0">
          <div>
            {entry.rank === 1 ? (
              <Trophy style={{ 
                width: '2rem', 
                height: '2rem', 
                color: '#FFD700',
                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.1))'
              }} />
            ) : entry.rank === 2 ? (
              <Medal style={{ 
                width: '2rem', 
                height: '2rem', 
                color: '#C0C0C0',
                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.1))'
              }} />
            ) : entry.rank === 3 ? (
              <Medal style={{ 
                width: '2rem', 
                height: '2rem', 
                color: '#CD7F32',
                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.1))'
              }} />
            ) : (
              <Users className="text-secondary" style={{ width: '2rem', height: '2rem' }} />
            )}
          </div>
          <div>
            <div className="fw-medium">
              {entry.name !== 'undefined' ? entry.name : `Student ${entry.student_id}`}
            </div>
            <div className="small text-muted">Rank #{entry.rank}</div>
          </div>
        </div>
        <div className="d-flex justify-content-start justify-content-sm-end gap-4">
          {/* XP */}
          <div className="text-center text-sm-end">
            <div className="d-flex align-items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-lightning-charge-fill text-warning" viewBox="0 0 16 16">
                <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"/>
              </svg>
              <span className="fw-semibold">{entry.xp || 0}</span>
            </div>
            <div className="small text-muted">XP</div>
          </div>
          
          {/* Highest Streak */}
          <div className="text-center text-sm-end">
            <div className="d-flex align-items-center gap-1">
              <Flame className="text-danger" style={{ width: '1rem', height: '1rem' }} />
              <span className="fw-semibold">{entry.highest_streak || 0}</span>
            </div>
            <div className="small text-muted">Highest Streak</div>
          </div>
          
          {/* Current Streak - Only for current user */}
          {isCurrentUser && (
            <div className="text-center text-sm-end">
              <div className="d-flex align-items-center gap-1">
                <Flame className="text-orange" style={{ width: '1rem', height: '1rem' }} />
                <span className="fw-semibold">{entry.current_streak || 0}</span>
              </div>
              <div className="small text-muted">Current Streak</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Empty state component
  // const EmptyState = () => (
  //   <div className="text-center py-5 bg-white rounded-3 border border-light">
  //     <Trophy className="text-secondary-subtle mx-auto mb-4" style={{ width: '3rem', height: '3rem' }} />
  //     <p className="text-muted">No leaderboard data available.</p>
  //   </div>
  // );

  // Initial state component
  const InitialState = () => (
    <div className="text-center py-5 bg-white rounded-3 border border-light">
      <Trophy className="text-primary-subtle mx-auto mb-4" style={{ width: '3rem', height: '3rem' }} />
      <p className="text-muted mb-4">Select a classroom and click "View Leaderboard" to see the rankings.</p>
    </div>
  );

  return (
    <div className="min-vh-100 bg-light">
      <LearnerSidebar />
      <main className="p-4" style={{ marginLeft: "260px" }}>
        <div className="container-fluid">
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4">
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                <div>
                  <h1 className="fs-4 fw-bold mb-0">
                    CodeCraft Leaderboard
                  </h1>
                </div>

                <div className="d-flex flex-column flex-sm-row gap-3 w-100 w-md-auto">
                  <select
                    value={selectedClassroom}
                    onChange={(e) => setSelectedClassroom(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Select a classroom</option>
                    {classrooms?.map((classroom) => (
                      <option key={classroom.classroom_id} value={classroom.classroom_id}>
                        {classroom.name}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    onClick={fetchLeaderboard}
                    disabled={!selectedClassroom || loading}
                    className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <Trophy style={{ width: '1rem', height: '1rem' }} />
                        <span>View Leaderboard</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    id="export-button"
                    onClick={exportLeaderboard}
                    disabled={!leaderboard.length || loading}
                    className="btn btn-dark d-flex align-items-center justify-content-center gap-2"
                  >
                    <Download style={{ width: '1rem', height: '1rem' }} />
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Current User Card (if found) */}
          {currentUser && (
            <div className="card shadow-sm border-primary mb-4">
              <div className="card-body p-4">
                <h5 className="card-title mb-3">Your Position</h5>
                <LeaderboardEntry entry={currentUser} />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="card shadow-sm">
            <div className="card-body p-4">
              {loading ? (
                <div className="d-flex justify-content-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-5 bg-danger-subtle rounded-3 border border-danger-subtle">
                  <AlertTriangle className="text-danger mx-auto mb-4" style={{ width: '3rem', height: '3rem' }} />
                  <p className="text-danger mb-4">{error}</p>
                  <button 
                    onClick={fetchLeaderboard}
                    className="btn btn-danger"
                    disabled={!selectedClassroom}
                  >
                    Try Again
                  </button>
                </div>
              ) : leaderboard.length > 0 ? (
                <div ref={leaderboardRef} className="d-flex flex-column gap-4">
                  {/* Top 3 Podium for larger screens */}
                  <TopThreePodium leaderboard={leaderboard} />

                  {/* List View (All entries) */}
                  <div className="d-flex flex-column gap-3">
                    {leaderboard.map((entry) => (
                      <LeaderboardEntry key={entry.user_id} entry={entry} />
                    ))}
                  </div>
                </div>
              ) : (
                <InitialState />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LearnerLeaderboard;