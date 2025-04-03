const TeacherAssignment = require('../models/teacherAssignmentModel');
const Teacher = require('../models/teacherModel');
const notificationController = require('./notificationController');

exports.createAssignment = async (req, res) => {
    const { title, description, dueDate, teacherEmail } = req.body;

    if (!title || !description || !dueDate || !teacherEmail) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const teacher = await Teacher.findOne({ email: teacherEmail });
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        const newAssignment = new TeacherAssignment({ 
            title, 
            description, 
            dueDate, 
            teacherEmail 
        });
        await newAssignment.save();
        
        // Create notification
        await notificationController.createNotification({
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

        res.status(201).json({ message: "Assignment created successfully" });
    } catch (error) {
        res.status(500).json({ 
            message: "Error creating assignment", 
            error: error.message 
        });
    }
};

// Add other assignment controller methods as needed...