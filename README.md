# 📚 Virtual Classrooms

A full-stack web application that simplifies online teaching and learning, built using **React.js**, **Node.js**, and **MongoDB**.

---

## 🚀 Features

### 👩‍🏫 For Teachers:
- Upload and manage classes
- Track student attendance
- Post and manage assignments
- Respond to student queries

### 🎓 For Students:
- Browse and join classes
- Submit assignments online
- Ask questions and get help from teachers
- Access all study content in one place

> ⏱️ Designed to save up to **30%** of manual study and coordination time

---

## 🔐 Login & Access Control

### 👥 Student vs Teacher Access

- ✅ **Students** must **sign up** using the regular login/signup form on the homepage.
- 🔒 **Teachers** must go through the **Admin Dashboard** to register.
  - This ensures students **cannot act as teachers**.
  - 🛡️ **Admin Dashboard Password**: `admin123`

---

## 🎥 Attendance Logic

- Attendance is **automatically recorded** for students **only if**:
  - They watch the uploaded video class.
  - ⏳ **At least 70%** of the video must be completed.

> Prevents fake attendance and ensures student participation.

---

## 🛠 Tech Stack

| Frontend     | Backend      | Database |
|--------------|--------------|----------|
| React.js     | Node.js      | MongoDB  |


---

## 📂 Project Structure

```
/frontend     → React frontend  
/backend      → Node.js   
/database     → MongoDB   
```

---

## 📦 Installation

1. **Clone the repo**
```bash
git clone https://github.com/svrajesh21/Virtual-Classrooms.git
cd Virtual-Classrooms
```

2. **Start frontend**
```bash
cd frontend
npm install
npm start
```

3. **Start backend**
```bash
cd backend
npm install
npm start
```

---

## 🧪 Environment Variables

Make sure to add your `.env` files with the appropriate API keys and Client IDs

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙋‍♂️ Author

Developed by **SV Rajesh**  

## 📬 Contact

Feel free to reach out for collaboration or feedback!

📧 **Email**: svrajesh21@example.com  
🔗 **LinkedIn**: [linkedin.com/in/s-v-rajesh-126ab4265](linkedin.com/in/s-v-rajesh-126ab4265)  
🐙 **GitHub**: [github.com/svrajesh21](https://github.com/svrajesh21)

