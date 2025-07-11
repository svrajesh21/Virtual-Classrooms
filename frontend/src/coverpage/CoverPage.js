import React, { useState } from 'react';
import './coverpage.css'; // Import the enhanced CSS file

const CoverPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  // Function to handle login button click
  const handleLoginClick = () => {
    // Redirect to the login page
    window.location.href = '/login'; // Replace with your login route
  };

  // Function to handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      console.log("Sending form data:", formData);
  
      const response = await fetch("http://localhost:5000/api/contact", { // Ensure correct backend URL
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      console.log("Response status:", response.status);
  
      if (response.ok) {
        const data = await response.json();
        alert(data.message); // Show success message from backend
        setFormData({ name: "", email: "", message: "" }); // Clear the form
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        alert(errorData.message || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="cover-page">
      {/* Particle Animation Container */}
      <div className="particles"></div>

      {/* Main Content */}
      <section id="home" className="cover-content">
        <h1>Welcome to Virtual Classroom</h1>
        <p>Learn, Collaborate, and Grow</p>
        <button className="login-button" onClick={handleLoginClick}>
          Login
        </button>
      </section>

      {/* About Us Section */}
      <section id="about" className="about-us">
        <h2>About Us</h2>
        <p>
          We are a team of passionate educators and developers dedicated to creating an immersive and interactive virtual learning environment. Our mission is to make education accessible, engaging, and fun for everyone.
        </p>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <h2>Features</h2>
        <div className="card-container">
          <div className="card">
            <div className="card-front">
              <h3>Interactive Lessons</h3>
            </div>
            <div className="card-back">
              <p>Engage with live sessions, quizzes, and interactive content.</p>
            </div>
          </div>
          <div className="card">
            <div className="card-front">
              <h3>Collaborate</h3>
            </div>
            <div className="card-back">
              <p>Work with peers and instructors in real-time.</p>
            </div>
          </div>
          <div className="card">
            <div className="card-front">
              <h3>Grow</h3>
            </div>
            <div className="card-back">
              <p>Track your progress and achieve your learning goals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials">
        <h1>Testimonials</h1>
        <div className="testimonial-container">
          <div className="testimonial">
            <p>"This platform has transformed the way I learn. Highly recommended!"</p>
            <span>- John Doe</span>
          </div>
          <div className="testimonial">
            <p>"The interactive features make learning so much fun and engaging."</p>
            <span>- Jane Smith</span>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="contact-us">
        <h2>Contact Us</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleInputChange}
            required
          ></textarea>
          <button type="submit">Send Message</button>
        </form>
      </section>
    </div>
  );
};

export default CoverPage;