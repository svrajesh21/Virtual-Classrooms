require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Video = require("./models/videoSchema");


const app = express();

// Request logging middleware - MUST be at the top
app.use((req, res, next) => {
    console.log('\n=== New Request ===');
    console.log('Time:', new Date().toISOString());
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('Query:', req.query);
    console.log('Body:', req.body);
    console.log('Headers:', req.headers);
    console.log('==================\n');
    next();
});

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Add route logging middleware
app.use((req, res, next) => {
    console.log(`\n=== Route Handler ===`);
    console.log(`Handling ${req.method} ${req.path}`);
    console.log(`==================\n`);
    next();
});

// Test route for questions endpoint - MUST be at the top
app.get("/api/test/questions", (req, res) => {
    console.log('Test route hit');
    res.json({ message: "Questions endpoint is accessible" });
});

const Attendance = require("./models/attendanceSchema");
const resourceRoutes = require("./routes/resourceRoutes");

app.use("/api", resourceRoutes);

// Import Quiz Routes
const quizRoutes = require("./routes/quizRoutes");
app.use("/api", quizRoutes);

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// MongoDB Connection
const mongoURI = "mongodb://localhost:27017/Virtual";
console.log('Attempting to connect to MongoDB...');
mongoose.connect(mongoURI)
    .then(() => {
        console.log("✅ MongoDB Connected Successfully");
        // Test database connection by listing collections
        mongoose.connection.db.listCollections().toArray((err, collections) => {
            if (err) {
                console.error('Error listing collections:', err);
            } else {
                console.log('Available collections:', collections.map(c => c.name));
            }
        });
    })
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
        console.error("Connection details:", {
            uri: mongoURI,
            error: err.message,
            stack: err.stack
        });
    });

// Student Schema
const StudentSchema = new mongoose.Schema({
    fullName: String,
    dob: String,
    email: { type: String, unique: true },
    password: String,
    course: String,
    role: { type: String, default: "student" },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
});
const Student = mongoose.model("Student", StudentSchema, "students");

// Teacher Schema
const TeacherSchema = new mongoose.Schema({
    name: String,
    dob: String,
    email: { type: String, unique: true },
    password: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
});
const Teacher = mongoose.model("Teacher", TeacherSchema, "teachers");

// Assignment Schema
const submissionSchema = new mongoose.Schema({
    assignmentId: String,
    assignmentTitle: String,
    email: String,
    filePath: String,
    fileName: String,
});

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Create the Submission model
const Submission = mongoose.model("Submission", submissionSchema);

const upload = multer().single("assignmentFile");

// Contact Us Endpoint
app.post("/api/contact", async (req, res) => {
    const { name, email, message } = req.body;
  
    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: "vamsikrishnameka07@gmail.com",
            subject: `New Contact Form Submission from ${name}`,
            text: `
                Name: ${name}
                Email: ${email}
                Message: ${message}
            `,
        };
  
        await transporter.sendMail(mailOptions);
        res.json({ message: "Message sent successfully!" });
    } catch (err) {
        console.error("Error in /api/contact:", err);
        res.status(500).json({ message: "Error sending message", error: err.message });
    }
});

// Student Signup Route
app.post("/api/signup", async (req, res) => {
    const { fullName, dob, email, password, course } = req.body;
    if (!fullName || !dob || !email || !password || !course) {
        return res.status(400).json({ message: "Please enter all fields" });
    }

    try {
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newStudent = new Student({ fullName, dob, email, password: hashedPassword, course, role: "student" });

        await newStudent.save();
        res.json({ message: "Student registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error registering student" });
    }
});

// Teacher Registration
app.post("/api/register-teacher", async (req, res) => {
    const { name, email, password, dob } = req.body;
    if (!name || !email || !password || !dob) {
        return res.status(400).json({ message: "Please enter all fields" });
    }

    try {
        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newTeacher = new Teacher({ name, email, password: hashedPassword, dob });

        await newTeacher.save();
        res.json({ message: "Teacher registered successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error registering teacher" });
    }
});

// Login Route
app.post("/api/login", async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ message: "Please enter all fields" });
    }

    try {
        const User = role === "Teacher" ? Teacher : Student;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        if (role === "Teacher") {
            return res.json({
                success: true,
                message: "Login successful",
                email,
                role,
                name: user.name,
                id: user._id,
            });
        } else {
            // Student login response
            return res.json({
                success: true,
                message: "Login successful",
                email,
                role,
                fullName: user.fullName,
                id: user._id,
                course: user.course
            });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Error logging in" });
    }
});

// Forgot Password Endpoint
app.post("/api/forgot-password", async (req, res) => {
    const { email } = req.body;

    try {
        const student = await Student.findOne({ email });
        const teacher = await Teacher.findOne({ email });
        const user = student || teacher;

        if (!user) {
            return res.status(404).json({ message: "Email not found" });
        }

        const resetToken = crypto.randomBytes(20).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Request",
            text: `Click the link to reset your password: ${resetLink}`,
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: "Password reset link sent to your email" });
    } catch (err) {
        console.error("Error in /api/forgot-password:", err);
        res.status(500).json({ message: "Error processing request", error: err.message });
    }
});

// Reset Password Endpoint
app.post("/api/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const student = await Student.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });
        const teacher = await Teacher.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });
        const user = student || teacher;

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: "Password reset successful" });
    } catch (err) {
        console.error("Error in /api/reset-password:", err);
        res.status(500).json({ message: "Error resetting password", error: err.message });
    }
});

// Assignment submission endpoint
app.post("/api/submit-assignment", upload, async (req, res) => {
    try {
        const { assignmentId, assignmentTitle } = req.body;
        const file = req.file;
        const studentEmail = req.headers["user-email"];

        if (!file) {
            return res.status(400).json({ message: "No file uploaded." });
        }
        if (!studentEmail) {
            return res.status(400).json({ message: "User email not found." });
        }

        const uniqueKey = `${assignmentId}_${studentEmail}`;
        const fileExtension = path.extname(file.originalname);
        const fileName = `${uniqueKey}${fileExtension}`;
        const filePath = path.join(uploadsDir, fileName);

        fs.writeFileSync(filePath, file.buffer);

        const newSubmission = new Submission({
            assignmentId,
            assignmentTitle,
            email: studentEmail,
            filePath,
            fileName,
        });
        await newSubmission.save();

        res.json({ message: "File uploaded successfully!", file: { path: filePath, name: fileName } });
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

// Fetch Assignments for a Student
app.get("/api/assignments/:email", async (req, res) => {
    try {
        const email = req.params.email;
        const submissions = await Submission.find({ email });
        res.json(submissions);
    } catch (error) {
        console.error("Error fetching assignments:", error);
        res.status(500).json({ message: "Error fetching assignments." });
    }
});

// Fetch Submissions for an Assignment
app.get("/api/submissions/:assignmentId", async (req, res) => {
    const assignmentId = req.params.assignmentId;
    const teacherEmail = req.query.teacherEmail;

    if (!teacherEmail) {
        return res.status(400).json({ message: "Teacher email is required" });
    }

    try {
        const assignment = await TeacherAssignment.findOne({ _id: assignmentId, teacherEmail });
        if (!assignment) {
            return res.status(403).json({ message: "You are not authorized to view these submissions" });
        }

        const submissions = await Submission.find({ assignmentId });
        res.json(submissions);
    } catch (error) {
        console.error("Error fetching submissions:", error);
        res.status(500).json({ message: "Error fetching submissions" });
    }
});

// Download Assignment File
app.get("/api/download/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "uploads", filename);

    if (fs.existsSync(filePath)) {
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error("Error downloading file:", err);
                res.status(500).json({ message: "Error downloading file" });
            }
        });
    } else {
        res.status(404).json({ message: "File not found" });
    }
});

// Fetch Student Details
app.get("/api/student/:email", async (req, res) => {
    try {
        const email = req.params.email;
        const student = await Student.findOne({ email: email });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.json(student);
    } catch (err) {
        console.error("Error fetching student details:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Fetch Teacher Details
app.get("/api/teacher/:email", async (req, res) => {
    try {
        const email = req.params.email;
        const teacher = await Teacher.findOne({ email: email });
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }
        res.json(teacher);
    } catch (err) {
        console.error("Error fetching teacher details:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Update Teacher Details
app.put("/api/teacher/update", async (req, res) => {
    const { email, name, dob } = req.body;

    try {
        await Teacher.updateOne({ email }, { $set: { name, dob } });
        res.json({ success: true, message: "Details updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error updating details" });
    }
});

// Update Student Details
app.put("/api/student/update", async (req, res) => {
    const { email, fullName, dob } = req.body;

    try {
        await Student.updateOne({ email }, { $set: { fullName, dob } });
        res.json({ success: true, message: "Details updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error updating details" });
    }
});

// Teacher Assignment Schema
const TeacherAssignmentSchema = new mongoose.Schema({
    teacherEmail: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    uploadDate: { type: Date, default: Date.now },
});

const TeacherAssignment = mongoose.model("TeacherAssignment", TeacherAssignmentSchema, "teacherAssignments");

// Create Assignment
app.post("/api/create-assignment", async (req, res) => {
    const { title, description, dueDate, teacherEmail } = req.body;

    if (!title || !description || !dueDate || !teacherEmail) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const teacher = await Teacher.findOne({ email: teacherEmail });
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        const newAssignment = new TeacherAssignment({ title, description, dueDate, teacherEmail });
        await newAssignment.save();
        
        // Create notification with error handling
        try {
            const notification = new Notification({
                type: 'ASSIGNMENT',
                title: `New Assignment: ${title}`,
                message: `Due: ${new Date(dueDate).toLocaleDateString()}`,
                data: {
                    assignmentId: newAssignment._id,
                    teacherName: teacher.name,
                    title,
                    dueDate
                },
                link: `/assignments/${newAssignment._id}`
            });
            await notification.save();
            console.log('Assignment notification created successfully:', notification);
        } catch (notifError) {
            console.error('Error creating assignment notification:', notifError);
            // Don't fail the whole request if notification fails
        }

        res.json({ message: "Assignment created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error creating assignment", error: error.message });
    }
});

// Fetch Assignments for a Specific Teacher
app.get("/api/teacherAssignments", async (req, res) => {
    const userRole = req.query.role;
    const teacherEmail = req.query.teacherEmail;

    try {
        let assignments;
        if (userRole === "Teacher" && teacherEmail) {
            assignments = await TeacherAssignment.find({ teacherEmail });
        } else {
            assignments = await TeacherAssignment.find({});
        }
        res.json(assignments);
    } catch (err) {
        console.error("Error retrieving assignments:", err);
        res.status(500).json({ message: "Error retrieving assignments" });
    }
});

// Delete Assignment
app.delete("/api/teacher/assignments/delete/:id", async (req, res) => {
    try {
        const assignment = await TeacherAssignment.findByIdAndDelete(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }
        res.json({ message: "Assignment deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting assignment" });
    }
});

// Serve Uploaded Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Endpoint to upload video (Google Drive embed link)
// Updated video upload endpoint
app.post("/api/videos", async (req, res) => {
    const { title, url, teacherName, teacherId } = req.body;

    if (!title || !url || !teacherName || !teacherId) {
        return res.status(400).json({ message: "Title, URL, teacher name, and teacher ID are required" });
    }

    try {
        const newVideo = new Video({ title, url, teacherName, teacherId });
        await newVideo.save();
        
        // Create notification with error handling
        try {
            const notification = new Notification({
                type: 'VIDEO',
                title: `New Video: ${title}`,
                message: `A new video has been uploaded by ${teacherName}`,
                data: {
                    videoId: newVideo._id,
                    teacherName,
                    title
                },
                link: `/videos/${newVideo._id}`
            });
            await notification.save();
            console.log('Video notification created successfully:', notification);
        } catch (notifError) {
            console.error('Error creating video notification:', notifError);
            // Don't fail the whole request if notification fails
        }

        res.json({ message: "Video uploaded successfully", url });
    } catch (error) {
        console.error("Error uploading video:", error);
        res.status(500).json({ message: "Error uploading video" });
    }
});


// Endpoint to fetch videos
app.get("/api/videos", async (req, res) => {
    try {
        const videos = await Video.find();
        res.json(videos);
    } catch (error) {
        console.error("Error fetching videos:", error);
        res.status(500).json({ message: "Error fetching videos" });
    }
});

// Fetch a single video by ID
app.get("/api/videos/:id", async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }
        res.json(video);
    } catch (error) {
        console.error("Error fetching video:", error);
        res.status(500).json({ message: "Error fetching video" });
    }
});

// Mark Attendance Endpoint
app.post("/api/videos/:videoId/attendance", async (req, res) => {
    const { videoId } = req.params;
    const { studentEmail, watchPercentage } = req.body;

    console.log(`Received attendance request:`, { videoId, studentEmail, watchPercentage });

    if (!studentEmail || !watchPercentage) {
        return res.status(400).json({ message: "Student email and watch percentage are required" });
    }

    try {
        const existingAttendance = await Attendance.findOne({ videoId, studentEmail });
        if (existingAttendance) {
            return res.status(400).json({ message: "Attendance already marked for this video" });
        }

        if (watchPercentage >= 60) {
            const newAttendance = new Attendance({
                videoId,
                studentEmail,
                watchPercentage,
            });

            await newAttendance.save();
            console.log("Attendance stored in DB:", newAttendance);
            return res.json({ message: "Attendance marked successfully" });
        } else {
            console.log("Watch percentage below 60%. Attendance not stored.");
            return res.status(400).json({ message: "Watch percentage is less than 60%" });
        }
    } catch (err) {
        console.error("Error storing attendance:", err);
        res.status(500).json({ message: "Error marking attendance", error: err.message });
    }
});

// Fetch Attendance for a Student
app.get("/api/attendance/student/:studentEmail", async (req, res) => {
    const { studentEmail } = req.params;

    try {
        const attendanceRecords = await Attendance.find({ studentEmail });
        if (attendanceRecords.length === 0) {
            return res.status(404).json({ message: "No attendance records found for this student" });
        }
        res.json(attendanceRecords);
    } catch (err) {
        console.error("Error fetching attendance records:", err);
        res.status(500).json({ message: "Error fetching attendance records", error: err.message });
    }
});

// Fetch Attendance for a Video
app.get("/api/attendance/video/:videoId", async (req, res) => {
    const { videoId } = req.params;

    try {
        const attendanceRecords = await Attendance.find({ videoId });
        res.json(attendanceRecords);
    } catch (err) {
        console.error("Error fetching attendance records:", err);
        res.status(500).json({ message: "Error fetching attendance records", error: err.message });
    }
});

// Chat Schema
const ChatSchema = new mongoose.Schema({
    videoId: { type: mongoose.Schema.Types.ObjectId, required: true },
    studentEmail: { type: String, required: true },
    studentName: { type: String, required: true },
    message: { type: String, required: true },
    reply: { 
        text: String,
        repliedAt: Date,
        teacherName: String
    },
    timestamp: { type: Date, default: Date.now }
});

// Create the Chat model
const Chat = mongoose.model("Chat", ChatSchema, "chats");

// Teacher Questions endpoint - Updated with unique path using teacher1
app.get("/api/teacher1/unanswered-questions/:email", async (req, res) => {
    const { email } = req.params;

    try {
        if (!email) {
            return res.status(400).json({ message: "Teacher email is required" });
        }

        // Find teacher by email
        const teacher = await Teacher.findOne({ email });
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        // Find videos uploaded by this teacher
        const videos = await Video.find({ teacherId: teacher._id });
        
        // Get video IDs
        const videoIds = videos.map(video => video._id);

        // Find unanswered questions for these videos
        const questions = await Chat.find({
            videoId: { $in: videoIds },
            $or: [
                { reply: { $exists: false } },
                { reply: null }
            ]
        });

        res.json(questions);
    } catch (err) {
        console.error('Error in questions endpoint:', err);
        res.status(500).json({ message: "Error fetching questions" });
    }
});

// Endpoint to submit teacher's reply to a question
app.post("/api/teacher/questions/:questionId/reply", async (req, res) => {
    const { questionId } = req.params;
    const { reply, teacherName } = req.body;

    if (!reply || !teacherName) {
        return res.status(400).json({ message: "Reply text and teacher name are required" });
    }

    try {
        const updatedQuestion = await Chat.findByIdAndUpdate(
            questionId,
            {
                reply: {
                    text: reply,
                    repliedAt: new Date(),
                    teacherName: teacherName
                }
            },
            { new: true }
        );

        if (!updatedQuestion) {
            return res.status(404).json({ message: "Question not found" });
        }

        res.json({ message: "Reply submitted successfully", question: updatedQuestion });
    } catch (err) {
        console.error('Error submitting reply:', err);
        res.status(500).json({ message: "Error submitting reply", error: err.message });
    }
});

// Chat endpoints
app.post("/api/chat", async (req, res) => {
    try {
        const { videoId, studentEmail, studentName, message } = req.body;
        
        if (!videoId || !studentEmail || !studentName || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newChat = new Chat({ 
            videoId, 
            studentEmail, 
            studentName, 
            message,
            reply: null  // Initialize reply field as null
        });
        await newChat.save();
        
        res.json({ success: true, message: "Message sent successfully" });
    } catch (err) {
        console.error("Error saving chat message:", err);
        res.status(500).json({ message: "Error sending message" });
    }
});

app.get("/api/chat/:videoId", async (req, res) => {
    try {
        const messages = await Chat.find({ videoId: req.params.videoId })
            .sort({ timestamp: 1 })
            .limit(50);
        res.json(messages);
    } catch (err) {
        console.error("Error fetching chat messages:", err);
        res.status(500).json({ message: "Error fetching messages" });
    }
});

// Migration script to update existing chat documents
app.get("/api/migrate-chats", async (req, res) => {
    try {
        const result = await Chat.updateMany(
            { reply: { $exists: false } },
            { $set: { reply: null } }
        );
        res.json({ 
            message: "Migration completed", 
            modifiedCount: result.modifiedCount 
        });
    } catch (err) {
        console.error('Migration error:', err);
        res.status(500).json({ message: "Error during migration", error: err.message });
    }
});


// Add this near your other schemas (around line 130)
// Notification Schema
const NotificationSchema = new mongoose.Schema({
    type: { type: String, enum: ['ASSIGNMENT', 'VIDEO', 'ANNOUNCEMENT'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed }, // Additional data like assignment details
    link: { type: String }, // Optional link to navigate to
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});
const Notification = mongoose.model('Notification', NotificationSchema, 'notifications');

// Add these endpoints near your other endpoints (around line 900)
// Get all notifications
app.get('/api/notifications', async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        res.json(notifications);
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
});

// Mark notification as read
app.put('/api/notifications/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { $set: { read: true } },
            { new: true }
        );
        res.json(notification);
    } catch (err) {
        console.error('Error marking notification as read:', err);
        res.status(500).json({ message: 'Error marking notification as read' });
    }
});

// Modify your video upload endpoint (around line 750) to create a notification
app.post("/api/videos", async (req, res) => {
    const { title, url, teacherName, teacherId } = req.body;

    if (!title || !url || !teacherName || !teacherId) {
        return res.status(400).json({ message: "Title, URL, teacher name, and teacher ID are required" });
    }

    try {
        const newVideo = new Video({ title, url, teacherName, teacherId });
        await newVideo.save();
        
        // Create notification
        const notification = new Notification({
            type: 'VIDEO',
            title: `New Video: ${title}`,
            message: `A new video has been uploaded by ${teacherName}`,
            data: {
                videoId: newVideo._id,
                teacherName,
                title
            },
            link: `/videos/${newVideo._id}`
        });
        await notification.save();

        res.json({ message: "Video uploaded successfully", url });
    } catch (error) {
        console.error("Error uploading video:", error);
        res.status(500).json({ message: "Error uploading video" });
    }
});

// Modify your assignment creation endpoint (around line 650) to create a notification
app.post("/api/create-assignment", async (req, res) => {
    const { title, description, dueDate, teacherEmail } = req.body;

    if (!title || !description || !dueDate || !teacherEmail) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Find teacher to get their name
        const teacher = await Teacher.findOne({ email: teacherEmail });
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        const newAssignment = new TeacherAssignment({ title, description, dueDate, teacherEmail });
        await newAssignment.save();
        
        // Create notification
        const notification = new Notification({
            type: 'ASSIGNMENT',
            title: `New Assignment: ${title}`,
            message: `Due: ${new Date(dueDate).toLocaleDateString()}`,
            data: {
                assignmentId: newAssignment._id,
                teacherName: teacher.name,
                title,
                dueDate
            },
            link: `/assignments/${newAssignment._id}`
        });
        await notification.save();

        res.json({ message: "Assignment created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error creating assignment", error: error.message });
    }
});

// Add this with your other endpoints
app.get('/api/notifications/unread-count', async (req, res) => {
    try {
        const count = await Notification.countDocuments({ read: false });
        res.json({ count });
    } catch (err) {
        console.error('Error counting unread notifications:', err);
        res.status(500).json({ message: 'Error counting unread notifications' });
    }
});

// Add this near your other routes in server.js

// Get all student emails
app.get("/api/students/all", async (req, res) => {
    try {
        const students = await Student.find({}, 'email fullName course');
        res.json(students);
    } catch (err) {
        console.error("Error fetching student emails:", err);
        res.status(500).json({ message: "Error fetching student emails" });
    }
});

// Get performance data for a specific student
// Update the performance endpoint to include assignment details
app.get("/api/performance/:studentEmail", async (req, res) => {
    try {
        const { studentEmail } = req.params;

        // Get student info
        const studentInfo = await Student.findOne({ email: studentEmail }, 'fullName email course');
        if (!studentInfo) {
            return res.status(404).json({ error: "Student not found" });
        }

        // Get attendance data
        const attendanceRecords = await Attendance.find({ studentEmail });
        const totalClassesAvailable = await Video.countDocuments();
        const totalClassesAttended = attendanceRecords.length;
        const attendancePercentage = totalClassesAvailable > 0 
            ? (totalClassesAttended / totalClassesAvailable) * 100 
            : 0;

        // Get quiz data
        const quizResults = await QuizResult.find({ studentEmail });
        const averageScore = quizResults.length > 0 
            ? quizResults.reduce((sum, result) => sum + result.score, 0) / quizResults.length 
            : 0;

        // Get assignment data - modified to match your structure
        const submissions = await Submission.find({ email: studentEmail });
        const allAssignments = await TeacherAssignment.find();
        const totalAssignments = allAssignments.length;
        
        // Create detailed assignment data
        const assignmentDetails = allAssignments.map(assignment => {
            const submission = submissions.find(sub => sub.assignmentId === assignment._id.toString());
            return {
                assignmentId: assignment._id,
                title: assignment.title,
                dueDate: assignment.dueDate,
                submitted: !!submission,
                submissionDate: submission ? submission.createdAt : null,
                fileName: submission ? submission.fileName : null,
                filePath: submission ? submission.filePath : null
            };
        });

        res.json({
            studentInfo,
            attendance: {
                totalClassesAvailable,
                totalClassesAttended,
                attendancePercentage,
                records: attendanceRecords
            },
            quizzes: {
                averageScore,
                quizResults,
                totalQuizzesTaken: quizResults.length
            },
            assignments: {
                totalAssignments,
                assignmentsSubmitted: submissions.length,
                assignmentCompletionPercentage: totalAssignments > 0 
                    ? (submissions.length / totalAssignments) * 100 
                    : 0,
                details: assignmentDetails
            }
        });
    } catch (err) {
        console.error("Error fetching performance data:", err);
        res.status(500).json({ message: "Error fetching performance data" });
    }
});

// Start the server
app.listen(5000, () => console.log("🚀 Server running on port 5000")); 