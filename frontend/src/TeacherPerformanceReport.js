import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import './TeacherPerformanceReport.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const TeacherPerformanceReport = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState({
    students: false,
    performance: false
  });
  const [error, setError] = useState(null);

  // Fetch all students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(prev => ({ ...prev, students: true }));
        setError(null);
        const response = await axios.get('http://localhost:5000/api/students/all');
        setStudents(response.data || []);
      } catch (err) {
        console.error('Failed to fetch students:', err);
        setError('Failed to load student list. Please try again.');
      } finally {
        setLoading(prev => ({ ...prev, students: false }));
      }
    };
    fetchStudents();
  }, []);

  // Fetch performance data when student is selected
  useEffect(() => {
    if (!selectedStudent) return;

    const fetchPerformanceData = async () => {
      try {
        setLoading(prev => ({ ...prev, performance: true }));
        setError(null);
        const response = await axios.get(
          `http://localhost:5000/api/performance/${selectedStudent}`
        );
        setPerformanceData(response.data || {
          studentInfo: {},
          attendance: {},
          quizzes: {},
          assignments: {}
        });
      } catch (err) {
        console.error('Failed to fetch performance:', err);
        setError('Failed to load performance data. Please try again.');
        setPerformanceData(null);
      } finally {
        setLoading(prev => ({ ...prev, performance: false }));
      }
    };
    fetchPerformanceData();
  }, [selectedStudent]);

  const handleStudentClick = (email) => {
    console.log('Student selected:', email);
    setSelectedStudent(email);
  };

  // Safely get student info with fallbacks
  const getStudentInfo = () => {
    return {
      fullName: performanceData?.studentInfo?.fullName || 'Not Available',
      email: performanceData?.studentInfo?.email || 'N/A',
      course: performanceData?.studentInfo?.course || 'N/A'
    };
  };

  // Prepare chart data with fallbacks
  const attendanceChartData = {
    labels: ['Attended', 'Missed'],
    datasets: [
      {
        data: [
          performanceData?.attendance?.totalClassesAttended || 0,
          (performanceData?.attendance?.totalClassesAvailable || 0) - 
          (performanceData?.attendance?.totalClassesAttended || 0)
        ],
        backgroundColor: ['#36A2EB', '#FF6384'],
      }
    ]
  };

  const quizChartData = {
    labels: performanceData?.quizzes?.quizResults?.map((_, i) => `Quiz ${i + 1}`) || ['No quizzes'],
    datasets: [
      {
        label: 'Score',
        data: performanceData?.quizzes?.quizResults?.map(q => q.score) || [0],
        backgroundColor: '#4CAF50'
      }
    ]
  };

  const assignmentChartData = {
    labels: ['Submitted', 'Pending'],
    datasets: [
      {
        data: [
          performanceData?.assignments?.assignmentsSubmitted || 0,
          (performanceData?.assignments?.totalAssignments || 0) - 
          (performanceData?.assignments?.assignmentsSubmitted || 0)
        ],
        backgroundColor: ['#FFCE56', '#9966FF']
      }
    ]
  };

  // Assignment details component
  const AssignmentDetails = () => {
    const assignments = performanceData?.assignments?.details || [];
    
    return (
      <div className="assignment-details">
        <h4>Assignment Details</h4>
        {assignments.length > 0 ? (
          <div className="assignment-table-container">
            <table className="assignment-table">
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Status</th>
                  <th>Submission</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{assignment.title || 'Untitled Assignment'}</strong>
                      <div className="due-date">
                        Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${assignment.submitted ? 'submitted' : 'pending'}`}>
                        {assignment.submitted ? 'Submitted' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {assignment.submitted ? (
                        <>
                          <div>{assignment.submissionDate ? new Date(assignment.submissionDate).toLocaleDateString() : 'Unknown date'}</div>
                          <div>{assignment.fileName || 'Unnamed file'}</div>
                        </>
                      ) : (
                        'Not submitted'
                      )}
                    </td>
                    <td>
                      {assignment.submitted && assignment.fileName && (
                        <a 
                          href={`http://localhost:5000/api/download/${encodeURIComponent(assignment.fileName)}`}
                          className="download-btn"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-assignments">No assignments found for this student.</p>
        )}
      </div>
    );
  };

  const studentInfo = getStudentInfo();

  return (
    <div className="teacher-performance-container">
      <h1 className="header">Student Performance Dashboard</h1>
      
      {error && <div className="error-alert">{error}</div>}
      
      <div className="student-list-container">
        <h2 className="student-list-title">Students</h2>
        {loading.students ? (
          <div className="loading-spinner">Loading student list...</div>
        ) : students.length > 0 ? (
          <div className="student-list">
            {students.map(student => (
              <div
                key={student.email}
                className={`student-card ${selectedStudent === student.email ? 'selected' : ''}`}
                onClick={() => handleStudentClick(student.email)}
              >
                <div className="student-info">
                  <span className="student-name">{student.fullName || 'Unknown Student'}</span>
                  <span className="student-email">{student.email || 'N/A'}</span>
                  <span className="student-course">{student.course || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-students">No students found in this course.</p>
        )}
      </div>

      {loading.performance && (
        <div className="loading-spinner">Loading performance data...</div>
      )}

      {performanceData && (
        <div className="performance-dashboard">
          <div className="student-header">
            <h2> Performance Report</h2>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3>Attendance</h3>
              <div className="chart-container">
                <Pie
                  data={attendanceChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' },
                      title: { display: true, text: 'Attendance Record' }
                    }
                  }}
                />
              </div>
              <div className="chart-stats">
                <p>
                  <strong>Attendance Rate:</strong> {performanceData.attendance?.attendancePercentage?.toFixed(2) || 0}%
                </p>
                <p>
                  <strong>Classes Attended:</strong> {performanceData.attendance?.totalClassesAttended || 0} of {performanceData.attendance?.totalClassesAvailable || 0}
                </p>
              </div>
            </div>

            <div className="chart-card">
              <h3>Quiz Performance</h3>
              <div className="chart-container">
                <Bar
                  data={quizChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' },
                      title: { display: true, text: 'Quiz Scores' }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 5
                      }
                    }
                  }}
                />
              </div>
              <div className="chart-stats">
                <p>
                  <strong>Average Score:</strong> {performanceData.quizzes?.averageScore?.toFixed(2) || 0}%
                </p>
                <p>
                  <strong>Quizzes Taken:</strong> {performanceData.quizzes?.totalQuizzesTaken || 0}
                </p>
              </div>
            </div>

            
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherPerformanceReport; 