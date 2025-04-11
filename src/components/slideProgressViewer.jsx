// import React, { useContext, useState } from 'react';
// import { toast } from 'react-toastify';
// import { ArrowUpCircle, ArrowDownCircle, MinusCircle, BookOpen, } from 'lucide-react';
// import { createPortal } from 'react-dom';
// import { AuthContext } from '../context/authContext';

// const SlideProgressViewer = ({ 
//   slide,
//   classroomId,
//   sectionId,
//   onClose
// }) => {
//     const { user } = useContext(AuthContext)
//   const [viewingProgress, setViewingProgress] = useState(false);
//   const [loadingProgress, setLoadingProgress] = useState(false);
//   const [progressData, setProgressData] = useState(null);

//   const fetchProgressData = async () => {
//     try {
//       setLoadingProgress(true);
//       const token = user?.data?.token;
//       const response = await fetch(
//         `https://codecraft-production.up.railway.app/learner/classrooms/${classroomId}/slides/${slide.slide_id}/progress`,
//         {
//           headers: {
//             'Authorization': token,
//             'Accept': 'application/json'
//           }
//         }
//       );

//       if (!response.ok) {
//         throw new Error('Failed to fetch progress data');
//       }

//       const data = await response.json();
//       setProgressData(data);
//       setViewingProgress(true);
//     } catch (err) {
//       console.error('Error fetching progress data:', err);
//       toast.error('Failed to load progress data');
//     } finally {
//       setLoadingProgress(false);
//     }
//   };

//   const calculateTrend = (scores) => {
//     if (!scores || scores.length < 2) return "Not enough data";
    
//     const firstScore = scores[scores.length - 1]?.score || 0;
//     const lastScore = scores[0]?.score || 0;
    
//     if (lastScore > firstScore) return "Improving";
//     if (lastScore < firstScore) return "Declining";
//     return "Stable";
//   };

//   const getTrendIcon = (trend) => {
//     switch (trend) {
//       case "Improving":
//         return <ArrowUpCircle className="text-success" />;
//       case "Declining":
//         return <ArrowDownCircle className="text-danger" />;
//       default:
//         return <MinusCircle className="text-primary" />;
//     }
//   };

//   // PerformanceHistoryCard component (similar to the one in SlideQuestionAnswering)

//   //eslint-disable-next-line
//   const PerformanceHistoryCard = () => {
//     if (!progressData) return null;
    
//     const { progressSummary, studyRecommendation } = progressData;
    
//     return (
//       <div className="card mb-4">
//         <div className="card-body">
//           <h3 className="card-title h5 mb-4">Your Learning Progress</h3>
          
//           <div className="row g-4 mb-4">
//             <div className="col-sm-4">
//               <div className="bg-light p-3 rounded text-center">
//                 <div className="text-primary small mb-1">Tests Taken</div>
//                 <div className="h3">{progressSummary.attemptCount || 0}</div>
//               </div>
//             </div>
            
//             <div className="col-sm-4">
//               <div className="bg-light p-3 rounded text-center">
//                 <div className="text-success small mb-1">Average Score</div>
//                 <div className="h3">{progressSummary.averageScore || "0"}%</div>
//               </div>
//             </div>
            
//             <div className="col-sm-4">
//               <div className="bg-light p-3 rounded text-center">
//                 <div className="text-info small mb-1">Best Score</div>
//                 <div className="h3">{progressSummary.highestScore || "0"}%</div>
//               </div>
//             </div>
//           </div>

//           {/* Recent Scores Chart */}
//           {progressSummary.lastFiveScores?.length > 0 && (
//             <div className="mb-4">
//               <div className="d-flex align-items-center mb-3">
//                 <h4 className="h6 mb-0">Recent Scores</h4>
//                 <div className="ms-2 d-flex align-items-center small">
//                   {getTrendIcon(calculateTrend(progressSummary.lastFiveScores))}
//                   <span className="ms-1">
//                     {calculateTrend(progressSummary.lastFiveScores)}
//                   </span>
//                 </div>
//               </div>
              
//               <div className="d-flex gap-2 align-items-end" style={{ height: "128px" }}>
//                 {progressSummary.lastFiveScores.slice(0, 5).map((score, index) => (
//                   <div key={index} className="flex-grow-1 d-flex flex-column align-items-center">
//                     <div 
//                       className={`w-100 rounded-top ${score.passingStatus === "Pass" ? "bg-success" : "bg-warning"}`}
//                       style={{ 
//                         height: `${Math.max(10, (score.score / 100) * 100)}%`,
//                         transition: "height 0.5s"
//                       }}
//                     />
//                     <div className="small text-muted mt-1 text-truncate" title={new Date(score.date).toLocaleDateString()}>
//                       {new Date(score.date).toLocaleDateString()}
//                     </div>
//                     <div className="small fw-bold">{score.score}%</div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Study Recommendations */}
//           {studyRecommendation && (
//             <div className="alert alert-warning">
//               <div className="d-flex">
//                 <BookOpen className="flex-shrink-0 me-2" />
//                 <div>
//                   <h4 className="h6 mb-1">Study Recommendations</h4>
//                   <p className="small mb-0">{studyRecommendation}</p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <>
//       <button
//         onClick={fetchProgressData}
//         disabled={loadingProgress}
//         className="btn btn-outline-primary d-flex align-items-center gap-2"
//         title="View Progress"
//       >
//         {loadingProgress ? (
//           <span className="spinner-border spinner-border-sm" />
//         ) : (
//           <>
//             <i className="bi bi-bar-chart-line me-1"></i>
//             View Progress
//           </>
//         )}
//       </button>
  
//       {viewingProgress && progressData && createPortal(
//         <div 
//           className="modal fade show d-block"
//           tabIndex="-1"
//           role="dialog"
//           aria-modal="true"
//           onClick={() => !loadingProgress && setViewingProgress(false)}
//           style={{
//             backgroundColor: 'rgba(0, 0, 0, 0.5)',
//             backdropFilter: 'blur(4px)',
//             WebkitBackdropFilter: 'blur(4px)'
//           }}
//         >
//           <div 
//             className="modal-dialog modal-lg modal-dialog-centered"
//             onClick={e => e.stopPropagation()}
//           >
//             <div className="modal-content border-0 shadow">
//               {/* Header */}
//               <div className="modal-header bg-primary bg-opacity-10 border-0 p-4">
//                 <div className="w-100">
//                   <div className="d-flex justify-content-between align-items-center mb-2">
//                     <h5 className="modal-title fw-bold text-primary d-flex align-items-center">
//                       <i className="bi bi-bar-chart-line me-2"></i>
//                       Performance Analysis
//                     </h5>
//                     <button 
//                       type="button" 
//                       className="btn-close" 
//                       onClick={() => setViewingProgress(false)}
//                       disabled={loadingProgress}
//                       aria-label="Close"
//                     />
//                   </div>
//                   <h3 className="fs-5 mb-0 text-dark">{progressData.slideName}</h3>
//                 </div>
//               </div>
  
//               {/* Body */}
//               <div className="modal-body p-4">
//                 {/* Stats Cards */}
//                 <div className="row g-3 mb-4">
//                   <div className="col-md-4">
//                     <div className="card h-100 border-0 bg-primary bg-opacity-10">
//                       <div className="card-body text-center p-3">
//                         <div className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '48px', height: '48px' }}>
//                           <i className="bi bi-bar-chart-line text-primary"></i>
//                         </div>
//                         <div className="text-primary mb-2">Average Score</div>
//                         <div className="display-6 fw-bold text-primary">
//                           {progressData.progressSummary.averageScore}%
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-md-4">
//                     <div className="card h-100 border-0 bg-success bg-opacity-10">
//                       <div className="card-body text-center p-3">
//                         <div className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '48px', height: '48px' }}>
//                           <i className="bi bi-trophy text-success"></i>
//                         </div>
//                         <div className="text-success mb-2">Highest Score</div>
//                         <div className="display-6 fw-bold text-success">
//                           {progressData.progressSummary.highestScore}%
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-md-4">
//                     <div className="card h-100 border-0 bg-warning bg-opacity-10">
//                       <div className="card-body text-center p-3">
//                         <div className="bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '48px', height: '48px' }}>
//                           <i className="bi bi-bullseye text-warning"></i>
//                         </div>
//                         <div className="text-warning mb-2">Total Attempts</div>
//                         <div className="display-6 fw-bold text-warning">
//                           {progressData.progressSummary.attemptCount}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
  
//                 {/* Performance Trend */}
//                 <div className="card border-0 shadow-sm mb-4">
//                   <div className="card-body p-3">
//                     <div className="d-flex justify-content-between align-items-center mb-3">
//                       <h4 className="fs-6 fw-bold mb-0">Performance Trend</h4>
//                       <div className="badge bg-light border px-3 py-2 d-flex align-items-center">
//                         <i className={`bi ${
//                           calculateTrend(progressData.progressSummary.lastFiveScores).includes('Improving') ? 'bi-graph-up-arrow text-success' : 
//                           calculateTrend(progressData.progressSummary.lastFiveScores).includes('Declining') ? 'bi-graph-down-arrow text-danger' : 
//                           'bi-dash-lg text-secondary'
//                         } me-2`}></i>
//                         <span className="fw-medium">
//                           {calculateTrend(progressData.progressSummary.lastFiveScores)}
//                         </span>
//                       </div>
//                     </div>
  
//                     <div className="table-responsive">
//                       <table className="table table-hover mb-0">
//                         <thead className="bg-light">
//                           <tr>
//                             <th className="rounded-start py-2 ps-3">Attempt</th>
//                             <th className="py-2">Date</th>
//                             <th className="py-2">Score</th>
//                             <th className="rounded-end py-2 pe-3">Status</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {progressData.progressSummary.lastFiveScores.map((score, index) => (
//                             <tr key={index}>
//                               <td className="py-2 ps-3">#{progressData.progressSummary.lastFiveScores.length - index}</td>
//                               <td className="py-2">{new Date(score.date).toLocaleDateString()}</td>
//                               <td className="py-2">
//                                 <span className={`badge rounded-pill ${
//                                   parseFloat(score.score) >= 80 ? 'bg-success bg-opacity-10 text-success' : 
//                                   parseFloat(score.score) >= 60 ? 'bg-primary bg-opacity-10 text-primary' : 
//                                   'bg-danger bg-opacity-10 text-danger'
//                                 }`}>
//                                   {score.score}%
//                                 </span>
//                               </td>
//                               <td className="py-2 pe-3">
//                                 <span className={`badge rounded-pill ${
//                                   score.passingStatus === 'Pass' 
//                                     ? 'bg-success bg-opacity-10 text-success' 
//                                     : 'bg-danger bg-opacity-10 text-danger'
//                                 }`}>
//                                   {score.passingStatus}
//                                 </span>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 </div>
  
//                 {/* Study Recommendations */}
//                 <div className="card border-0 shadow-sm">
//                   <div className="card-body p-3">
//                     <h4 className="fs-6 fw-bold mb-3">Study Recommendations</h4>
//                     <div className={`alert ${
//                       progressData.needsImprovement 
//                         ? 'bg-warning bg-opacity-10 border-warning' 
//                         : 'bg-success bg-opacity-10 border-success'
//                     } d-flex align-items-center gap-3 mb-0`}>
//                       <i className={`bi bi-book fs-5 ${
//                         progressData.needsImprovement ? 'text-warning' : 'text-success'
//                       }`}></i>
//                       <div className={progressData.needsImprovement ? 'text-warning' : 'text-success'}>
//                         {progressData.studyRecommendation}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
  
//               {/* Footer */}
//               <div className="modal-footer border-0 px-4 pb-4">
//                 <button
//                   type="button"
//                   className="btn btn-primary px-4 py-2"
//                   onClick={() => setViewingProgress(false)}
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>,
//         document.body
//       )}
  
//       <style jsx>{`
//         .modal.fade.show {
//           animation: modalFadeIn 0.3s ease-out;
//         }
        
//         .modal-dialog {
//           animation: modalSlideIn 0.4s ease-out;
//         }
        
//         @keyframes modalFadeIn {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }
        
//         @keyframes modalSlideIn {
//           from {
//             transform: translate(0, -30px);
//             opacity: 0;
//           }
//           to {
//             transform: translate(0, 0);
//             opacity: 1;
//           }
//         }
  
//         .table th {
//           font-weight: 600;
//           font-size: 0.85rem;
//           color: #6c757d;
//         }
  
//         .badge {
//           font-weight: 500;
//           padding: 0.45rem 0.75rem;
//         }
  
//         .rounded-start {
//           border-top-left-radius: 0.375rem;
//           border-bottom-left-radius: 0.375rem;
//         }
  
//         .rounded-end {
//           border-top-right-radius: 0.375rem;
//           border-bottom-right-radius: 0.375rem;
//         }
//       `}</style>
//     </>
//   );
// };

// export default SlideProgressViewer;