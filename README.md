# ECOBRIDGE MVP

ECOBRIDGE is an MVP platform for waste management connecting SMEs, Partners, and Admins. This backend provides user authentication, waste log management, pickup requests, messaging, notifications, and admin dashboards.

## **Features**

- User roles: SME, Partner, Admin
- Authentication: Email/Password & Google (SME only)
- Waste Log creation and management
- Pickup requests for Partners
- Real-time messaging between SMEs and Partners
- Notifications: Pickup reminders, contamination alerts, messages
- Admin dashboard: Overview, trends, activities
- Password reset & forgot password
- History
## **Getting Started**

### **Prerequisites**
- Node.js v18+  
- MongoDB database  

### **Installation**
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd ECOBRIDGE
npm install

Environment Variables

Create a .env file in the root:

# PORT=5000
# MONGO_URI=<your-mongodb-uri>
# JWT_SECRET=<your-jwt-secret>
# ADMIN_ACCESS_CODE=<your-admin-code>
# GOOGLE_CLIENT_ID=<google-client-id>
# GOOGLE_CLIENT_SECRET=<google-client-secret>

### RUnning the project
npm run dev

Server should run at http://localhost:5000.
API Endpoints

/api/auth/register/admin → Admin signup

/api/auth/register/partner → Partner signup

/api/auth/register/businesses → SME signup

/api/auth/login → Login

/api/auth/forgot-password → Generate reset code

/api/auth/reset-password → Reset password

/api/messages → Send message

/api/messages/inbox → Get inbox

/api/messages/conversation/:id → Get conversation messages

/api/messages/conversation/:id/successful → Mark partner successful (SME only)

/api/messages/conversation/:id/completed → Mark pickup completed (SME only)

/api/notifications → Get user notifications

/api/notifications/:id/read → Mark notification as read

/api/notifications/unread-count → Get unread notifications count

/api/admin/dashboard → Admin metrics and activities

/api/history → Get user history (logs & pickups)


License

This project is private and not open for public use.
