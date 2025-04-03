import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import "./PerformanceReport.css";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const PerformanceReport = () => {
    const [performanceData, setPerformanceData] = useState(null);
    const studentEmail = localStorage.getItem("studentEmail");

    useEffect(() => {
        const fetchPerformanceData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/performance/${studentEmail}`);
                setPerformanceData(response.data);
            } catch (error) {
                console.error("Error fetching performance data:", error);
            }
        };
        fetchPerformanceData();
    }, [studentEmail]);

    if (!performanceData) return <p>Loading performance report...</p>;

    // Data for the attendance pie chart
    const attendanceData = {
        labels: ["Attended", "Missed"],
        datasets: [
            {
                data: [
                    performanceData.attendance.totalClassesAttended,
                    performanceData.attendance.totalClassesAvailable - performanceData.attendance.totalClassesAttended,
                ],
                backgroundColor: ["#36A2EB", "#FF6384"],
            },
        ],
    };

    // Data for the quiz scores bar chart
    const quizData = {
        labels: performanceData.quizzes.quizResults.map((result, index) => `Quiz ${index + 1}`),
        datasets: [
            {
                label: "Score",
                data: performanceData.quizzes.quizResults.map((result) => result.score),
                backgroundColor: "#4CAF50",
                barPercentage: 0.5, // Adjust this value to control bar width (0 to 1)
            categoryPercentage: 0.8, 
            },
        ],
    };

    return (
        <div className="performance-report">
            <h1>Performance Report</h1>

            <div className="attendance-chart">
                <h2>Attendance</h2>
                <div className="chart-container">
                    <Pie
                        data={attendanceData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false, // Disable aspect ratio to control size
                            plugins: {
                                legend: {
                                    position: "top",
                                },
                                title: {
                                    display: true,
                                    text: "Attendance",
                                },
                            },
                        }}
                        width={350} // Increased from 300
                        height={200} // Increased from 150
                    />
                </div>
                <p>
                    Attendance Percentage: {performanceData.attendance.attendancePercentage.toFixed(2)}%
                </p>
            </div>

            <div className="quiz-chart">
                <h2>Quiz Scores</h2>
                <Bar
                    data={quizData}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: "top",
                            },
                            title: {
                                display: true,
                                text: "Quiz Scores",
                            },
                        },
                    }}
                />
                <p>Average Score: {performanceData.quizzes.averageScore.toFixed(2)}</p>
            </div>
        </div>
    );
};

export default PerformanceReport;