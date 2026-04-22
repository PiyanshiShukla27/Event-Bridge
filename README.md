# EventBridge 🎓

A full-stack **College Event Management System** built with React, Node.js, Express, and MongoDB.

![EventBridge Login](https://img.shields.io/badge/Status-Live-brightgreen) ![Tech](https://img.shields.io/badge/Stack-MERN-blue)

## ✨ Features

### 🔐 Authentication
- JWT-based login/register with role-based access (Admin & Participant)

### 👨‍💼 Admin Panel
- **Create Events** — Name, description, date/time, venue, branch, max participants
- **Manage Events** — View, edit, delete events with search
- **Attendance Management** — Mark/verify participant attendance
- **Analytics Dashboard** — Participation charts & branch distribution

### 🎓 Participant Panel
- **Browse Events** — Search & filter by branch
- **One-Click Enrollment** — Enroll in available events
- **Self Attendance** — Mark attendance for enrolled events
- **Participation Certificates** — Auto-generated downloadable certificates (PNG)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (with in-memory fallback) |
| Auth | JWT (JSON Web Tokens) |
| Charts | Chart.js |
| Icons | Lucide React |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/PiyanshiShukla27/EventBridge.git
cd EventBridge

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### Run Locally

```bash
# Terminal 1: Start backend (port 5001)
cd server && npm start

# Terminal 2: Start frontend (port 5173)
cd client && npm run dev
```

Open **http://localhost:5173** in your browser.

> 💡 The app uses an **in-memory MongoDB** fallback, so it works immediately without a local MongoDB installation. Data resets on server restart.

### Connect to Real MongoDB (Optional)

Create `server/.env`:
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/eventbridge
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

## 📁 Project Structure

```
EventBridge/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page views (admin & participant)
│   │   ├── context/        # Auth context
│   │   └── api/            # Axios instance
│   └── vite.config.js
├── server/                 # Express Backend
│   ├── routes/             # API routes
│   ├── models/             # Mongoose schemas
│   ├── config/             # DB connection
│   └── index.js            # Server entry
└── README.md
```

## 📄 License

MIT © Piyanshi Shukla
