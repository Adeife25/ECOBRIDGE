const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fs = require("fs");
const connectDB = require('./config/db');
const passport = require('passport');
require('./config/passport'); // load Google strategy
const wasteRoutes = require('./routes/wasteRoutes');
const adminRoutes = require('./routes/admin.routes');
const pickupRoutes = require("./routes/pickupRoutes"); 
const historyRoutes = require("./routes/historyRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const partnerRoutes = require("./routes/partnerRoutes");
const messageRoutes = require("./routes/messageRoutes");
const fileUpload = require('express-fileupload');


require("./cron/reminderCron");


const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');

const app = express();

require("./cron/reminderCron");


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅
app.use(fileUpload()); // ✅ enable file upload
app.use(passport.initialize());

// Connect DB
connectDB();

// Routes
app.use('/api/auth', authRoutes);       // local signup/login/password
app.use('/api/protected', protectedRoutes);       // protected routes
app.use("/api/pickups", pickupRoutes);  // pickup
app.use("/api/history", historyRoutes); //history
app.use('/api/notifications', notificationRoutes); //notification
app.use("/api/partner", partnerRoutes);  //partner homepage
app.use("/api/messages", messageRoutes);

// Google OAuth routes (SME only)
app.get('/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/api/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    if (!req.user) {
      return res.status(401).json({ msg: 'Google authentication failed' });
    }

    // Always SME role for Google signup
    const payload = { user: { id: req.user.id, role: 'SME' } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, role: 'SME' });
  }
);


// Mount routes
app.use('/api/waste', wasteRoutes);

//admin
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
