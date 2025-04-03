const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Resource = require("../models/resourceSchema");

const router = express.Router();

// Configure Multer storage
const resourceStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const resourceDir = path.join(__dirname, "../uploads/resources");
        if (!fs.existsSync(resourceDir)) {
            fs.mkdirSync(resourceDir, { recursive: true });
        }
        cb(null, resourceDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const resourceUpload = multer({ storage: resourceStorage }).single("resourceFile");

// Upload Resource
router.post("/upload-resource", resourceUpload, async (req, res) => {
    try {
        console.log("Upload Request Received:", req.body);
        console.log("File Received:", req.file);

        const { title, uploadedBy } = req.body;
        if (!req.file || !title || !uploadedBy) {
            console.log("Missing fields:", { file: req.file, title, uploadedBy });
            return res.status(400).json({ message: "All fields are required" });
        }

        const newResource = new Resource({
            title,
            filePath: req.file.path,
            fileName: req.file.filename,
            uploadedBy,
        });

        await newResource.save();
        res.json({ message: "Resource uploaded successfully", resource: newResource });
    } catch (error) {
        console.error("Error uploading resource:", error);
        res.status(500).json({ message: "Error uploading resource" });
    }
});


// Get All Resources
router.get("/resources", async (req, res) => {
    try {
        const resources = await Resource.find();
        res.json(resources);
    } catch (error) {
        console.error("Error fetching resources:", error);
        res.status(500).json({ message: "Error fetching resources" });
    }
});

// Download Resource
router.get("/download-resource/:fileName", (req, res) => {
    const filePath = path.join(__dirname, "../uploads/resources", req.params.fileName);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ message: "File not found" });
    }
});

module.exports = router;
