require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto"); // To generate a reset token
const nodemailer = require("nodemailer"); // For sending emails

const app = express();
app.use(express.json());
app.use(cors());

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
    },
});

// MongoDB Connection
const mongoURI = "mongodb://localhost:27017/Virtual";
mongoose.connect(mongoURI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

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

// Add body parsing middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors());

const upload = multer().single("assignmentFile"); // Parse form data without saving the file

// Contact Us Endpoint
app.post("/api/contact", async (req, res) => {
    const { name, email, message } = req.body;
  
    // Validate input fields
    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    try {
        
      // Configure the email options
      const mailOptions = {
        from: process.env.EMAIL_USER, // Sender email (mvamsikrishna78877887@gmail.com)
        to: "vamsikrishnameka07@gmail.com", // Admin email
        subject: `New Contact Form Submission from ${name}`, // Email subject
        text: `
          Name: ${name}
          Email: ${email}
          Message: ${message}
        `, // Email body
      };
  
      // Use nodemailer to send the email
      await transporter.sendMail(mailOptions);
  
      // Send success response
      res.json({ message: "Message sent successfully!" });
    } catch (err) {
      // Log the error and send error response
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

// Teacher Registration (Only Admin Can Do This)
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

    const User = role === "Teacher" ? Teacher : Student;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    res.json({ success: true, message: "Login successful", email, role });
});

// Forgot Password Endpoint
app.post("/api/forgot-password", async (req, res) => {
    const { email } = req.body;

    try {
        // Check if email exists in Student or Teacher collection
        const student = await Student.findOne({ email });
        const teacher = await Teacher.findOne({ email });
        const user = student || teacher;

        if (!user) {
            return res.status(404).json({ message: "Email not found" });
        }

        // Generate a reset token and set expiration time (e.g., 1 hour)
        const resetToken = crypto.randomBytes(20).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send email with reset link
        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Request",
            text: `Click the link to reset your password: ${resetLink}`,
        };

        // Use nodemailer to send the email
        await transporter.sendMail(mailOptions);

        res.json({ message: "Password reset link sent to your email" });
    } catch (err) {
        console.error("Error in /api/forgot-password:", err);
        res.status(500).json({ message: "Error processing request", error: err.message });
    }
});

// Reset Password Endpoint
app.post("/api/reset-password", async (req, res) => {
    console.log("hiii");
    const { token, newPassword } = req.body;
    

    try {
        // Find user by reset token and check expiration
        const student = await Student.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });
        const teacher = await Teacher.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });
        const user = student || teacher;

        console.log("Token received:", token); // Debugging line
        console.log("User found:", user); // Debugging line
       

        if (!user) {
            console.log("namaste");
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Hash the new password and update user
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log("New hashed password:", hashedPassword); // Log the hashed password

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        console.log("User password updated successfully:", user); // Log the updated user object

        res.json({ message: "Password reset successful" });
    } catch (err) {
        console.error("Error in /api/reset-password:", err);
        res.status(500).json({ message: "Error resetting password", error: err.message });
    }
});

app.post("/api/submit-assignment", upload, async (req, res) => {
    try {
        const { assignmentId, assignmentTitle } = req.body;
        const file = req.file; // Access the uploaded file
        const studentEmail = req.headers["user-email"]; // Get email from headers

        if (!file) {
            return res.status(400).json({ message: "No file uploaded." });
        }
        if (!studentEmail) {
            return res.status(400).json({ message: "User email not found." });
        }

        // Generate a unique filename
        const uniqueKey = `${assignmentId}_${studentEmail}`;
        const fileExtension = path.extname(file.originalname);
        const fileName = `${uniqueKey}${fileExtension}`;
        const filePath = path.join(uploadsDir, fileName);

        // Save the file to the uploads folder
        fs.writeFileSync(filePath, file.buffer);

        // Save the file path and metadata in the database
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
    const teacherEmail = req.query.teacherEmail; // Get teacherEmail from query params

    if (!teacherEmail) {
        return res.status(400).json({ message: "Teacher email is required" });
    }

    try {
        // Check if the assignment belongs to the logged-in teacher
        const assignment = await TeacherAssignment.findOne({ _id: assignmentId, teacherEmail });
        if (!assignment) {
            return res.status(403).json({ message: "You are not authorized to view these submissions" });
        }

        // Fetch submissions for the assignment
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

    // Check if the file exists
    if (fs.existsSync(filePath)) {
        // Set headers to force download
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
        const newAssignment = new TeacherAssignment({ title, description, dueDate, teacherEmail });
        await newAssignment.save();
        res.json({ message: "Assignment created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error creating assignment", error: error.message });
    }
});

// Fetch Assignments for a Specific Teacher
app.get("/api/teacherAssignments", async (req, res) => {
    const userRole = req.query.role; // Get the user's role from query params
    const teacherEmail = req.query.teacherEmail; // Get teacherEmail if the user is a teacher

    try {
        let assignments;
        if (userRole === "Teacher" && teacherEmail) {
            // Fetch assignments only for the logged-in teacher
            assignments = await TeacherAssignment.find({ teacherEmail });
        } else {
            // Fetch all assignments for students
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

app.listen(5000, () => console.log("🚀 Server running on port 5000"));