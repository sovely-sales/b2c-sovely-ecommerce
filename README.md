# Sovely B2C E-commerce Platform 🛍️

Sovely is a premium, full-stack B2C e-commerce platform designed for a seamless shopping experience. It features a high-performance React frontend, a robust Node.js/Express backend, and a comprehensive Admin Dashboard for business management.

## ✨ Key Features

### 🛒 Customer Experience
- **Premium UI/UX**: Tighter, professional layout (1240px) with glass-morphism effects and smooth animations.
- **Dynamic Shopping**: Advanced cart management, saved addresses for fast checkout, and real-time order tracking.
- **Secure Payments**: Integrated with Razorpay for secure online transactions.
- **Order Tracking**: Visual tracking stepper to monitor package status from "Placed" to "Delivered".

### 👨‍💼 Admin Dashboard
- **Management Portal**: A dedicated, app-like interface for managing business operations.
- **Order Control**: Real-time status updates (Pending, Processing, Shipped, Delivered) and payment verification.
- **Customer Insights**: Access to customer directory with contact information and order history.
- **Responsive Stats**: Live counters for total revenue, orders, and customer growth.

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, Lucide Icons, Vanilla CSS (Design System focused).
- **Backend**: Node.js, Express.js, MongoDB (Mongoose).
- **Authentication**: JSON Web Token (JWT) with role-based access (Admin/User).
- **Payments**: Razorpay API.

## 📦 Project Structure

```text
sov_b2c/
├── backend/            # Express Server, API Routes & Database Models
├── sovely-app/         # Vite + React Frontend Application
├── .env.example        # Environment variable template
├── .gitignore          # Root-level git protection
└── README.md           # Documentation
```

## 🛠️ Local Setup

### 1. Prerequisites
- Node.js installed
- MongoDB Atlas account or local MongoDB instance

### 2. Backend Setup
```bash
cd backend
npm install
# Create a .env file based on .env.example
node server.js
```

### 3. Frontend Setup
```bash
cd sovely-app
npm install
# Create a .env file with VITE_API_URL=http://localhost:8014
npm run dev
```

## 🔑 Environment Variables

Refer to `.env.example` in the root directory for the full list of required variables, including:
- `MONGODB_URI`
- `JWT_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

## 🛡️ Security
This project uses role-based authentication. Admin credentials must be created via the backend seeding script or manually in the database.

## 📄 License
This project is for internal Sovely Sales use. All rights reserved.
