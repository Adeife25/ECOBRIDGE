

# 🌱 EcoBridge

### E-Waste Management Platform Connecting SMEs with Recyclers

**EcoBridge** is an e-waste management platform designed to connect **Small and Medium-sized Enterprises (SMEs)** with **recycling partners**.

The platform allows SMEs to record and manage their electronic waste, request pickups, communicate with recycling partners, and track their waste management history. Partners can discover available waste and manage pickup requests, while administrators can monitor platform activity and performance through a centralized dashboard.

> **EcoBridge's goal is to make e-waste collection more organized, transparent, and accessible by creating a digital connection between businesses and recycling partners.**

---

## Problem

Electronic waste is one of the fastest-growing waste streams, yet many businesses lack a structured way to manage and dispose of their electronic waste responsibly.

EcoBridge addresses this problem by providing a centralized platform where:

* **SMEs** can log and manage their e-waste.
* **Recycling Partners** can discover available waste and handle pickup requests.
* **Admins** can monitor users, activities, trends, and platform performance.

---

## How EcoBridge Works

```text
                 ┌─────────────────┐
                 │      SME        │
                 │                 │
                 │ Log E-Waste     │
                 │ Request Pickup  │
                 │ Message Partner │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │    EcoBridge    │
                 │     Backend     │
                 │                 │
                 │ Auth            │
                 │ Waste Logs      │
                 │ Pickups         │
                 │ Messaging       │
                 │ Notifications   │
                 │ History         │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │ Recycling       │
                 │ Partner         │
                 │                 │
                 │ View Waste      │
                 │ Manage Pickups  │
                 │ Communicate     │
                 └─────────────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │     Admin       │
                 │                 │
                 │ Dashboard       │
                 │ Analytics       │
                 │ Activities      │
                 └─────────────────┘
```

---

##  Features

### Authentication & Authorization

* Role-based authentication
* Three user roles:

  * SME
  * Recycling Partner
  * Admin
* Email/password authentication
* Google authentication for SMEs
* JWT-based authentication
* Forgot password functionality
* Password reset
* Role-based access control

### Waste Management

* Create waste logs
* Manage waste records
* Track waste history
* Categorize waste
* Make waste visible to recycling partners

###  Pickup Management

* SMEs can request waste pickups
* Partners can view pickup requests
* Pickup status management
* Successful partner selection
* Pickup completion tracking

###  Messaging

* communication between SMEs and Partners
* Inbox
* Conversation management
* Pickup-related communication
* Conversation status tracking

###  Notifications

Users receive notifications for:

* Pickup requests
* Pickup reminders
* Contamination alerts
* New messages
* Other relevant platform activities

###  Admin Dashboard

Administrators can monitor:

* Platform overview
* User activity
* Waste activity
* Pickup activity
* Trends
* Recent activities
* Platform metrics

###  History

Users can view historical records including:

* Waste logs
* Pickup requests
* Completed pickups
* Other relevant activities

---

##  Tech Stack

### Backend

* **Node.js**
* **Express.js**
* **JavaScript**
* **MongoDB**
* **JWT**
* **Google OAuth**
* **REST API**

### Development Tools

* **Git**
* **GitHub**
* **Postman**
* **VS Code**

---

## Project Structure

```text
ECOBRIDGE/
├── controllers/
├── models/
├── routes/
├── middleware/
├── services/
├── utils/
├── config/
├── app.js
├── server.js
├── package.json
└── .env
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000

MONGO_URI=<your-mongodb-uri>

JWT_SECRET=<your-jwt-secret>

ADMIN_ACCESS_CODE=<your-admin-code>

GOOGLE_CLIENT_ID=<google-client-id>

GOOGLE_CLIENT_SECRET=<google-client-secret>
```

> **Never commit your `.env` file or expose your secrets publicly.**

---

##  Getting Started

### Prerequisites

Make sure you have installed:

* Node.js v18+
* MongoDB
* Git

### Installation

Clone the repository:

```bash
git clone https://github.com/<your-username>/<repo-name>.git
```

Navigate into the project:

```bash
cd ECOBRIDGE
```

Install dependencies:

```bash
npm install
```

Create your `.env` file and add the required environment variables.

### Run the application

For development:

```bash
npm run dev
```

The server should start at:

```text
http://localhost:5000
```

---

#  API Endpoints

## Authentication

| Method | Endpoint                        | Description                  |
| ------ | ------------------------------- | ---------------------------- |
| POST   | `/api/auth/register/admin`      | Register an Admin            |
| POST   | `/api/auth/register/partner`    | Register a Partner           |
| POST   | `/api/auth/register/businesses` | Register an SME              |
| POST   | `/api/auth/login`               | Login                        |
| POST   | `/api/auth/forgot-password`     | Generate password reset code |
| POST   | `/api/auth/reset-password`      | Reset password               |

---

##  Messaging

| Method | Endpoint                                    | Description                |
| ------ | ------------------------------------------- | -------------------------- |
| POST   | `/api/messages`                             | Send a message             |
| GET    | `/api/messages/inbox`                       | Get inbox                  |
| GET    | `/api/messages/conversation/:id`            | Get conversation messages  |
| PATCH  | `/api/messages/conversation/:id/successful` | Mark partner as successful |
| PATCH  | `/api/messages/conversation/:id/completed`  | Mark pickup as completed   |

---

##  Notifications

| Method | Endpoint                          | Description                   |
| ------ | --------------------------------- | ----------------------------- |
| GET    | `/api/notifications`              | Get user notifications        |
| PATCH  | `/api/notifications/:id/read`     | Mark notification as read     |
| GET    | `/api/notifications/unread-count` | Get unread notification count |

---

##  Admin

| Method | Endpoint               | Description                      |
| ------ | ---------------------- | -------------------------------- |
| GET    | `/api/admin/dashboard` | Get admin metrics and activities |

---

##  History

| Method | Endpoint       | Description                                       |
| ------ | -------------- | ------------------------------------------------- |
| GET    | `/api/history` | Get user history including waste logs and pickups |

---

##  API Testing

The API can be tested using **Postman** or any REST API client.

Authentication-protected endpoints require a valid JWT token.

Example:

```http
Authorization: Bearer <your-jwt-token>
```

---

##  Core User Flow

### SME

```text
Register/Login
      ↓
Log E-Waste
      ↓
View Waste
      ↓
Request Pickup
      ↓
Communicate with Partner
      ↓
Select Partner
      ↓
Pickup Completed
      ↓
View History
```

### Recycling Partner

```text
Register/Login
      ↓
View Available Waste
      ↓
Receive/Manage Pickup Request
      ↓
Communicate with SME
      ↓
Complete Pickup
      ↓
View History
```

### Admin

```text
Login
  ↓
Admin Dashboard
  ↓
Monitor Platform
  ↓
View Metrics & Trends
  ↓
Monitor Activities
```

---

## Security

EcoBridge implements several security measures including:

* JWT authentication
* Password protection
* Role-based authorization
* Protected API routes
* Environment-based secret management
* Restricted administrative access

---

## Impact

EcoBridge is designed to contribute to a more organized e-waste ecosystem by:

* Helping SMEs properly track their electronic waste
* Connecting businesses with recycling partners
* Making pickup coordination easier
* Improving visibility into waste management activities
* Providing administrators with useful platform insights

---

##  Future Improvements

Planned improvements may include:

* AI-powered waste categorization
* Image-based waste identification
* Recycler verification
* Location-based partner matching
* Pickup tracking
* Advanced analytics
* Email/SMS notifications
* Recycling certificates
* Waste impact reports
* Mobile application
* Automated reporting

---

## Screenshots

*Add screenshots of the EcoBridge platform here.*

Recommended screenshots:

1. Landing page
2. SME dashboard
3. Waste logging page
4. Available waste / partner dashboard
5. Pickup request
6. Messaging interface
7. Notifications
8. Admin dashboard

---

##  Demo

**Live Demo:** (https://ecobridge-backend-x2uh.onrender.com)


**Frontend **
https://greenlogic-team15.github.io/-EcoBridge-Waste-Intelligence-Platform-/
---

