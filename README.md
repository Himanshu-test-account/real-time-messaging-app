# Real-Time Messaging App

## Overview
This is a real-time messaging application built with a **Node.js/Express** backend and a **React (Vite)** frontend. It uses **Socket.IO** for instant messaging and **MongoDB** for data storage.

## Features
- **User Authentication** (JWT-based login & registration)
- **Real-time Chat** using WebSockets
- **Typing Indicators & Read Receipts**
- **Online/Offline Status Tracking**
- **Responsive UI with Tailwind CSS**

## Tech Stack
### Backend (Server)
- **Node.js** with **Express.js**
- **MongoDB** with Mongoose
- **Socket.IO** for real-time communication
- **JWT** authentication
- **Passport.js** for session handling

### Frontend (Client)
- **React** (Vite)
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Socket.IO client** for real-time interactions

---

## Installation & Setup
### 1. Clone the Repository
```sh
git clone https://github.com/your-repo/real-time-messaging-app.git
cd real-time-messaging-app
```

### 2. Backend Setup
```sh
cd server
npm install
```

- Create a `.env` file inside the `server` folder and add:
  ```env
  MONGO_URI=<your_mongodb_connection>
  JWT_SECRET=<your_secret_key>
  PORT=5000
  ```
- Start the backend:
  ```sh
  npm start
  ```

### 3. Frontend Setup
```sh
cd ../client
npm install
```
- Create a `.env` file inside the `client` folder and add:
  ```env
  VITE_API_URL=http://localhost:5000
  ```
- Start the frontend:
  ```sh
  npm run dev
  ```

---

## Project Structure
### Backend (Server)
```
server/
│── config/
│   ├── db.js (MongoDB connection)
│   ├── passport.js (Authentication)
│   ├── socket.js (Socket.IO setup)
│── controllers/
│   ├── authController.js (Login/Register)
│   ├── chatController.js (Message handling)
│   ├── userController.js (User management)
│── models/
│   ├── User.js (User schema)
│   ├── Message.js (Message schema)
│── routes/
│   ├── authRoutes.js (Auth API routes)
│   ├── chatRoutes.js (Chat API routes)
│   ├── userRoutes.js (User API routes)
│── server.js (Main entry point)
```

### Frontend (Client)
```
client/
│── src/
│   ├── components/
│   │   ├── ChatArea.jsx (Main chat UI)
│   │   ├── ChatInput.jsx (Input box)
│   │   ├── Sidebar.jsx (Navigation sidebar)
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   ├── App.jsx (Main entry component)
│── index.html (Root HTML file)
│── tailwind.config.js (Styling setup)
│── vite.config.js (Vite configuration)
```

---

## How to Use
1. Register/Login using the authentication page.
2. Start a chat in the chat dashboard.
3. See real-time updates when a user is typing.
4. Receive message read receipts.

---

## Video Recording Script
### **1. Introduction (30s)**
- "Welcome! This is a real-time messaging app built with React, Node.js, and Socket.IO."
- "In this video, I'll walk you through both the frontend and backend."

### **2. Backend Overview (2 min)**
- Explain the `server.js` file and how Express initializes routes.
- Show `authController.js` for user login/signup.
- Show `socket.js` handling real-time events.

### **3. Frontend Overview (2 min)**
- Show `ChatArea.jsx` handling chat display.
- Explain `ChatInput.jsx` and typing indicators.
- Discuss `Sidebar.jsx` for navigation.

### **4. Running the App (1 min)**
- "Now, let's see it in action!" (Show the login, chat, and real-time updates.)

---

## Future Enhancements
- Add file sharing feature.
- Implement group chat functionality.
- Improve UI animations for a better user experience.

---


