require("dotenv").config(); // Load environment variables from .env file
const nodemailer = require("nodemailer");

console.log("Email User:", process.env.EMAIL_USER);
console.log("Email User:", process.env.EMAIL_PASS);

// Initialize transporter
const transporter = nodemailer.createTransport({
    secure:true,
    host:'smtp.gmail.com',
    posrt:456,
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password

    },
});

// Test email function
const testEmail = async () => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: "vamsikrishnameka07@gmail.com", // Replace with a test email
            subject: "Test Email",
            text: "This is a test email.",
        });
        console.log("Test email sent successfully!");
    } catch (err) {
        console.error("Error sending test email:", err);
    }
};

// Call the testEmail function
testEmail();