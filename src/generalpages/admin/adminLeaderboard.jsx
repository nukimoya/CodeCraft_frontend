import React, { useState, useEffect, useCallback, useRef, useMemo, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import AdminSidebar from '../../components/adminSidebar';

const AdminLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showClassroomDropdown, setShowClassroomDropdown] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  
  const { user } = useContext(AuthContext);
  // const navigate = useNavigate();
  
  const leaderboardRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // Simple debug logging function
//   const logDebug = useCallback((section, data) => {
//     console.log(`[DEBUG:${section}]`, data);
//   }, []);
  
  // Fetch classrooms
  const fetchClassrooms = useCallback(async () => {
    try {
      setLoading(true);
      
      const token = user?.data?.token;
      if (!token) {
        console.log('ClassroomsFetch: No token available');
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch(
        'https://codecraft-production.up.railway.app/admin/classrooms',
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          } 
        }
      );
      
    //   console.log('ClassroomsResponse:', { 
    //     status: response.status, 
    //     ok: response.ok,
    //     statusText: response.statusText
    //   });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // console.log('ClassroomsData:', { 
      //   received: !!data,
      //   classroomsArray: data.classrooms ? 'exists' : 'missing',
      //   count: data.classrooms?.length || 0
      // });
      
      setClassrooms(data.classrooms || []);
      
      // Auto-select the first classroom if available
      if (data.classrooms?.length > 0 && !selectedClassroom) {
        setSelectedClassroom(data.classrooms[0].classroom_id);
      }
    } catch (error) {
      setError(error.message || 'Failed to load classrooms');
      console.error('ClassroomsError:', error);
    } finally {
      setLoading(false);
    }
  }, [user, selectedClassroom]);
  
  // Fetch user details for all students in the leaderboard
  const fetchUserDetails = useCallback(async (studentIds) => {
    if (!studentIds.length) return;
    
    try {
      const token = user?.data?.token;
      if (!token) return;
      
      // Create a mapping object to store user details
      const details = {};
      
      // Fetch details for each student ID
      await Promise.all(studentIds.map(async (studentId) => {
        try {
          const response = await fetch(
            `https://codecraft-production.up.railway.app/learner/${studentId}/profile`,
            { 
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              } 
            }
          );
          
          if (response.ok) {
            const userData = await response.json();
            details[studentId] = userData;
          }
        } catch (error) {
          console.error(`Error fetching details for user ${studentId}:`, error);
        }
      }));
      
      setUserDetails(details);
    //   console.log('UserDetails:', { count: Object.keys(details).length });
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  }, [user]);
  
  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async () => {
    if (!selectedClassroom) {
      // console.log('LeaderboardFetch: No classroom selected');
      setError('Please select a classroom to view the leaderboard.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const token = user?.data?.token;
      if (!token) {
        console.log('LeaderboardToken: No token available');
        throw new Error('Authentication token not found');
      }
      
      const url = `https://codecraft-production.up.railway.app/admin/classrooms/${selectedClassroom}/leaderboard`;
    //   console.log('LeaderboardFetch:', { url, method: 'GET', classroomId: selectedClassroom });
      
      const response = await fetch(
        url,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          } 
        }
      );
      
    //   console.log('LeaderboardResponse:', { 
    //     status: response.status, 
    //     ok: response.ok,
    //     statusText: response.statusText
    //   });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Log the raw data to debug
    //   console.log('RawLeaderboardData:', {
    //     data: data,
    //     leaderboard: data.leaderboard || []
    //   });
      
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
    //   console.log('SortedLeaderboardData:', {
    //     firstEntry: sortedData[0] || {},
    //     lastEntry: sortedData[sortedData.length - 1] || {}
    //   });
      
      // Add rank to each entry
      const processedData = sortedData.map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
      
    //   console.log('LeaderboardData:', { 
    //     count: processedData.length,
    //     sample: processedData.slice(0, 2) || []
    //   });
      setLeaderboard(processedData);
      
      // Extract student IDs to fetch user details
      const studentIds = processedData.map(entry => entry.student_id).filter(Boolean);
      fetchUserDetails(studentIds);
    } catch (error) {
      setError(error.message || 'Failed to load leaderboard data');
      console.error('LeaderboardError:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedClassroom, user, fetchUserDetails]);
  
  // Initial load
  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);
  
  // Fetch leaderboard when classroom changes
  useEffect(() => {
    if (selectedClassroom) {
      fetchLeaderboard();
    }
  }, [selectedClassroom, fetchLeaderboard]);
  
  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowClassroomDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Helper function to get user name
  const getUserName = (entry) => {
    const userDetail = userDetails[entry.student_id] || {};
    
    if (entry.name && entry.name !== 'undefined') {
      return entry.name;
    }
    
    if (userDetail.first_name && userDetail.last_name) {
      return `${userDetail.first_name} ${userDetail.last_name}`;
    }
    
    return userDetail.username || `Student ${entry.student_id}`;
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
                <i className="bi bi-award fs-1 text-secondary"></i>
              </div>
              <div className="text-center">
                <div className="fw-semibold fs-5 mb-1">
                  {getUserName(orderedPodium[0])}
                </div>
                <div className="badge mb-2" style={{ background: 'linear-gradient(to right, #C0C0C0, #E8E8E8)', color: '#333' }}>Silver Medal</div>
                <div className="d-flex justify-content-center gap-3">
                  <div className="text-center">
                    <div className="d-flex align-items-center justify-content-center gap-1">
                      <i className="bi bi-lightning-charge-fill text-warning"></i>
                      <span className="fw-bold fs-5">{orderedPodium[0].xp || 0}</span>
                    </div>
                    <div className="small text-muted">XP</div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <i className="bi bi-fire text-orange"></i>
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
                <i className="bi bi-award fs-1 text-secondary"></i>
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
                <i className="bi bi-trophy fs-1 text-warning"></i>
              </div>
              <div className="text-center">
                <div className="fw-bold fs-4 mb-1 text-dark">
                  {getUserName(orderedPodium[1])}
                </div>
                <div className="badge mb-3" style={{ background: 'linear-gradient(to right, #FFD700, #FFC107)', color: '#5D4037' }}>Gold Medal</div>
                <div className="d-flex justify-content-center gap-4">
                  <div className="text-center">
                    <div className="d-flex align-items-center justify-content-center gap-1">
                      <i className="bi bi-lightning-charge-fill text-warning fs-5"></i>
                      <span className="fw-bold fs-4">{orderedPodium[1].xp || 0}</span>
                    </div>
                    <div className="small text-muted">XP</div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <i className="bi bi-fire text-danger"></i>
                    <span className="small text-muted">Streak: {orderedPodium[1].current_streak || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column align-items-center p-4 rounded-3 border border-warning shadow opacity-50" style={{ 
              height: '280px',
              background: 'linear-gradient(135deg, #FFD700, #FFC800, #FFEF99)'
            }}>
              <div className="mb-3">
                <i className="bi bi-trophy fs-1 text-warning"></i>
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
                <i className="bi bi-award fs-1 text-warning-emphasis"></i>
              </div>
              <div className="text-center">
                <div className="fw-semibold fs-5 mb-1 text-white">
                  {getUserName(orderedPodium[2])}
                </div>
                <div className="badge mb-2" style={{ background: 'linear-gradient(to right, #CD7F32, #B87333)', color: '#FFF' }}>Bronze Medal</div>
                <div className="d-flex justify-content-center gap-3">
                  <div className="text-center">
                    <div className="d-flex align-items-center justify-content-center gap-1">
                      <i className="bi bi-lightning-charge-fill text-warning"></i>
                      <span className="fw-bold fs-5 text-white">{orderedPodium[2].xp || 0}</span>
                    </div>
                    <div className="small text-white text-opacity-75">XP</div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="d-flex align-items-center justify-content-center gap-1">
                    <i className="bi bi-fire text-orange"></i>
                    <span className="small text-white text-opacity-75">Streak: {orderedPodium[2].current_streak || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column align-items-center p-4 rounded-3 border border-danger-subtle shadow-sm opacity-50" style={{ 
              height: '200px',
              background: 'linear-gradient(135deg, #CD7F32, #D2691E, #DEB887)'
            }}>
              <div className="mb-2">
                <i className="bi bi-award fs-1 text-warning-emphasis"></i>
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
    return (
      <div
        className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between p-3 rounded-3 border shadow-sm"
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
              <i className="bi bi-trophy fs-3 text-warning"></i>
            ) : entry.rank === 2 ? (
              <i className="bi bi-award fs-3 text-secondary"></i>
            ) : entry.rank === 3 ? (
              <i className="bi bi-award fs-3 text-warning-emphasis"></i>
            ) : (
              <i className="bi bi-person fs-3 text-secondary"></i>
            )}
          </div>
          <div>
            <div className="fw-medium">
              {getUserName(entry)}
            </div>
            <div className="small text-muted">Rank #{entry.rank}</div>
          </div>
        </div>
        <div className="d-flex justify-content-start justify-content-sm-end gap-4">
          {/* XP */}
          <div className="text-center text-sm-end">
            <div className="d-flex align-items-center gap-1">
              <i className="bi bi-lightning-charge-fill text-warning"></i>
              <span className="fw-semibold">{entry.xp || 0}</span>
            </div>
            <div className="small text-muted">XP</div>
          </div>
          
          {/* Current Streak */}
          <div className="text-center text-sm-end">
            <div className="d-flex align-items-center gap-1">
              <i className="bi bi-fire text-danger"></i>
              <span className="fw-semibold">{entry.current_streak || 0}</span>
            </div>
            <div className="small text-muted">Current Streak</div>
          </div>
          
          {/* Highest Streak */}
          <div className="text-center text-sm-end">
            <div className="d-flex align-items-center gap-1">
              <i className="bi bi-fire text-danger"></i>
              <span className="fw-semibold">{entry.highest_streak || 0}</span>
            </div>
            <div className="small text-muted">Highest Streak</div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render initial state when no data is available
  const InitialState = () => (
    <div className="text-center py-5">
      <div className="mb-4">
        <i className="bi bi-trophy fs-1 text-secondary mx-auto" style={{ opacity: 0.5 }}></i>
      </div>
      <h3 className="h5 text-secondary mb-3">No Leaderboard Data Available</h3>
      <p className="text-muted mb-4">
        {selectedClassroom 
          ? "There are no students in this classroom yet or they haven't earned any XP."
          : "Please select a classroom to view the leaderboard."}
      </p>
      {!selectedClassroom && classrooms.length > 0 && (
        <button 
          onClick={() => setShowClassroomDropdown(true)}
          className="btn btn-primary"
        >
          Select Classroom
        </button>
      )}
    </div>
  );
  
  // Get current classroom name
  const currentClassroomName = useMemo(() => {
    const classroom = classrooms.find(c => c.classroom_id === selectedClassroom);
    return classroom ? classroom.name : 'Select Classroom';
  }, [classrooms, selectedClassroom]);
  
  return (
    <div className="vh-100 bg-white d-flex">
      <AdminSidebar />
      <main className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
            <div>
              <h1 className="h3 mb-1">Student Leaderboard</h1>
              <p className="text-muted mb-0">Track student progress and achievements</p>
            </div>
            
            {/* Classroom Selector */}
            <div className="mt-3 mt-md-0 position-relative" ref={dropdownRef}>
              <button 
                className="btn btn-outline-primary d-flex align-items-center gap-2"
                onClick={() => setShowClassroomDropdown(!showClassroomDropdown)}
                disabled={loading || classrooms.length === 0}
              >
                <span>{currentClassroomName}</span>
                <i className="bi bi-chevron-down"></i>
              </button>
              
              {showClassroomDropdown && classrooms.length > 0 && (
                <div className="position-absolute top-100 end-0 mt-1 bg-white border rounded shadow-sm" style={{ zIndex: 1000, minWidth: '250px' }}>
                  <div className="p-2 border-bottom">
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      placeholder="Search classrooms..." 
                    />
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {classrooms.map(classroom => (
                      <button
                        key={classroom.classroom_id}
                        className="dropdown-item py-2 px-3 text-start d-flex justify-content-between align-items-center"
                        onClick={() => {
                          setSelectedClassroom(classroom.classroom_id);
                          setShowClassroomDropdown(false);
                          fetchLeaderboard();
                        }}
                      >
                        <span>{classroom.name}</span>
                        {selectedClassroom === classroom.classroom_id && (
                          <span className="text-primary">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger mb-4">
              <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <div>{error}</div>
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
              ) : leaderboard.length > 0 ? (
                <div ref={leaderboardRef} className="d-flex flex-column gap-4">
                  {/* Top 3 Podium */}
                  <TopThreePodium leaderboard={leaderboard} />
                  
                  {/* Leaderboard List */}
                  <div className="mt-4">
                    <h4 className="h5 mb-3">Complete Rankings</h4>
                    <div className="d-flex flex-column gap-3">
                      {leaderboard.map((entry) => (
                        <LeaderboardEntry key={entry.student_id} entry={entry} />
                      ))}
                    </div>
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

export default AdminLeaderboard;