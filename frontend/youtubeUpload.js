const fs = require("fs");
const { google } = require("googleapis");
require("dotenv").config();

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

// Set refresh token (Get this manually via OAuth flow)
oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const youtube = google.youtube({ version: "v3", auth: oauth2Client });

async function uploadVideo(filePath, title, description) {
    const response = await youtube.videos.insert({
        part: "snippet,status",
        requestBody: {
            snippet: {
                title: title,
                description: description,
                categoryId: "27", // Category for Education
            },
            status: {
                privacyStatus: "unlisted", // "public", "private", or "unlisted"
            },
        },
        media: {
            body: fs.createReadStream(filePath),
        },
    });

    console.log("Video uploaded successfully:", response.data);
    return response.data.id; // Returns the YouTube video ID
}

module.exports = uploadVideo;
