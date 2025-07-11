const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    filePath: { type: String, required: true },
    fileName: { type: String, required: true },
    uploadedBy: { type: String, required: true }, // Faculty Email or ID
    uploadDate: { type: Date, default: Date.now },
});

const Resource = mongoose.model("Resource", resourceSchema);

module.exports = Resource;
