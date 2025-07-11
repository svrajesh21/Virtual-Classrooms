const mongoose = require('mongoose');

const TeacherAssignmentSchema = new mongoose.Schema({
    teacherEmail: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TeacherAssignment', TeacherAssignmentSchema);