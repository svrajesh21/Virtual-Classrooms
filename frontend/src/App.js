import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CoverPage from "./coverpage/CoverPage"; // Import CoverPage
import Login from "./Login";
import Signup from "./Signup";
import SubmitAssignment from "./SubmitAssignment";
import AssignmentList from "./AssignmentList";
import AdminDashboard from "./AdminDashboard";
import TeacherDashboard from "./TeacherDashboard";
import StudentDashboard from "./StudentDashboard";
import CreateAssignment from "./CreateAssignment";
import ForgotPassword from "./ForgotPassword"; // Import the new ForgotPassword component
import ResetPassword from "./ResetPassword"; // Import the ResetPassword component

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<CoverPage />} /> {/* Updated default route */}
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Add Forgot Password route */}
                <Route path="/reset-password" element={<ResetPassword />} /> {/* Add Reset Password route */}
                <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                <Route path="/student-dashboard" element={<StudentDashboard />} />
                <Route path="/submit-assignment" element={<SubmitAssignment />} />
                <Route path="/assignments" element={<AssignmentList />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/create-assignments" element={<CreateAssignment />} />
            </Routes>
        </Router>
    );
}

export default App;