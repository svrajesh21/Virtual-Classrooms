import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CoverPage from "./coverpage/CoverPage";
import Login from "./Login";
import Signup from "./Signup";
import SubmitAssignment from "./SubmitAssignment";
import AssignmentList from "./AssignmentList";
import AdminDashboard from "./AdminDashboard";
import TeacherDashboard from "./TeacherDashboard";
import StudentDashboard from "./StudentDashboard";
import CreateAssignment from "./CreateAssignment";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import RecordedClasses from "./RecordedClasses";
import VideoPlayer from "./VideoPlayer";
import UploadClasses from "./UploadClasses";
import Attendance from "./Attendance";
import VideoList from "./VideoList";
import CreateQuiz from "./CreateQuiz";
import TakeQuiz from "./TakeQuiz";
import Quiz from "./Quiz";
import PerformanceReport from "./PerformanceReport";
import UploadResource from "./UploadResource"; // Correct import
import StudentResourceList from "./StudentResourceList"; // Correct import
import TeacherQuestions from "./TeacherQuestions"; // Correct import
import NotificationDashboard from "./NotificationDashboard"; // Correct import
import TeacherPerformanceReport from "./TeacherPerformanceReport"; // Correct import


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<CoverPage />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                <Route path="/student-dashboard" element={<StudentDashboard />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/submit-assignment" element={<SubmitAssignment />} />
                <Route path="/assignments" element={<AssignmentList />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/create-assignments" element={<CreateAssignment />} />
                <Route path="/upload-classes" element={<UploadClasses />} />
                <Route path="/recorded-classes" element={<RecordedClasses />} />
                <Route path="/video-player/:videoId" element={<VideoPlayer />} />
                <Route path="/video-list" element={<VideoList />} />
                <Route path="/create-quiz" element={<CreateQuiz />} />
                <Route path="/take-quiz" element={<TakeQuiz />} />
                <Route path="/quiz/:quizId" element={<Quiz />} />
                <Route path="/performance" element={<PerformanceReport />} />
                <Route path="/upload-resource" element={<UploadResource />} /> {/* Fixed route */}
                <Route path="/Student-Resource" element={<StudentResourceList />} /> {/* Fixed route */}
                <Route path="/Teacher-Questions" element={<TeacherQuestions />} /> {/* Fixed route */}
                <Route path="/Notification-Dashboard" element={<NotificationDashboard />} /> {/* Fixed route */}
                <Route path="/Teacher-Performance" element={<TeacherPerformanceReport />} /> {/* Fixed route */}
            </Routes>
        </Router>
    );
}

export default App;
