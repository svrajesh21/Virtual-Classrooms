import React, { useState, useEffect } from "react";
import axios from "axios";

const UploadResource = () => {
    const [title, setTitle] = useState("");
    const [file, setFile] = useState(null);
    const [uploadedResources, setUploadedResources] = useState([]);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/resources");
            setUploadedResources(response.data);
        } catch (error) {
            console.error("Error fetching resources:", error);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !file) {
            alert("Please enter a title and select a file.");
            return;
        }

        const facultyEmail = localStorage.getItem("teacherEmail");
        if (!facultyEmail) {
            alert("Faculty email is missing. Please log in again.");
            return;
        }

        const formData = new FormData();
        formData.append("resourceFile", file);
        formData.append("title", title);
        formData.append("uploadedBy", facultyEmail);

        try {
            const response = await axios.post("http://localhost:5000/api/upload-resource", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert("Upload Successful!");
            setTitle(""); // Clear the title field
            setFile(null); // Clear the file selection
            fetchResources(); // Refresh uploaded resources
        } catch (error) {
            console.error("Upload Error:", error);
            alert("Error uploading resource.");
        }
    };

    const handleDownload = async (fileName) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/download-resource/${fileName}`, {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error downloading resource:", error);
            alert("Error downloading resource.");
        }
    };

    return (
        <div className="upload-resource-container">
            <h2>Upload Resource</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title:</label>
                    <input
                        type="text"
                        value={title}
                        placeholder="Enter resource title"
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Select File:</label>
                    <label htmlFor="file-upload" className="custom-file-upload">
                        Choose File
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        onChange={handleFileChange}
                        required
                        style={{ display: "none" }}
                    />
                    {file && <p>Selected File: {file.name}</p>}
                </div>
                <button type="submit">Upload</button>
            </form>

            <h3>Uploaded Resources</h3>
            {uploadedResources.length > 0 ? (
                <ul>
                    {uploadedResources.map((resource, index) => (
                        <li key={index}>
                            <strong>{resource.title}</strong> - {resource.fileName}
                            <button onClick={() => handleDownload(resource.fileName)}>
                                Download
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No resources uploaded yet.</p>
            )}
        </div>
    );
};

export default UploadResource;
