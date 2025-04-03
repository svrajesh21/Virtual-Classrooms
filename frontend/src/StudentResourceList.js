import React, { useState, useEffect } from "react";
import axios from "axios";

const StudentResourceList = () => {
    const [resources, setResources] = useState([]);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/resources");
            setResources(response.data);
        } catch (error) {
            console.error("Error fetching resources:", error);
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
        <div className="student-resource-container">
            <h2>Available Resources</h2>
            {resources.length > 0 ? (
                <ul>
                    {resources.map((resource, index) => (
                        <li key={index}>
                            <strong>{resource.title}</strong> - {resource.fileName}
                            <p><b>Uploaded By:</b> {resource.uploadedBy}</p>
                            <button onClick={() => handleDownload(resource.fileName)}>Download</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No resources available.</p>
            )}
        </div>
    );
};

export default StudentResourceList;
