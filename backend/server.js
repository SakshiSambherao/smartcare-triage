const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 1. Import Database Connection (Sequelize)
const { connectDB, sequelize } = require('./config/db');

// 2. Import Models
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const Inquiry = require('./models/Inquiry'); // <--- ADDED: Inquiry Model Import

// 3. Import Modular Routes & Shared Memory Cache Structure
const appointmentRoutes = require('./routes/appointmentRoutes');
const maxHeap = require('./utils/MaxHeap'); // Dynamic Sorting Data Structure Instance

const app = express();

// --- Middleware ---
app.use(cors()); // Critical: Allows your React frontend to communicate with this API
app.use(express.json());

// --- Database Connection ---
connectDB();

/**
 * Inline helper utility to extract a clean, capitalized name from an email address
 * (Used for backwards-compatibility hydration on server startup)
 */
function getNameFromEmail(email) {
    if (!email) return "Patient";
    const partBeforeAt = email.split('@')[0];
    return partBeforeAt.charAt(0).toUpperCase() + partBeforeAt.slice(1);
}

// --- API ROUTES ---

// 1. Hospital Portal Authentication Routes
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const userExists = await User.findOne({ where: { email } });
        if (userExists) return res.status(400).json({ msg: "An account with this email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name, // Officially saving user-provided names on registration now!
            email,
            password: hashedPassword,
            role: role || 'patient'
        });
        res.status(201).json({ msg: "User registered successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ msg: "Patient registration failed", error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ msg: "Clinical record account not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid credentials provided" });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '1h' }
        );

        // Intuitively fallback to email string parsing if user model row has no name set yet
        const resolvedName = user.name || getNameFromEmail(user.email);
        const resolvedEmail = user.email || email;

        res.json({
            token,
            user: {
                id: user.id,
                name: resolvedName,
                email: resolvedEmail,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ msg: "Internal login verification error", error: error.message });
    }
});

// 2. Emergency Case & Triage Intake Routing Hub
app.use('/api/appointments', appointmentRoutes);

// 3. Pre-Registration / Contact Form Intake Route (UPDATED FOR MYSQL)
app.post('/api/contact', async (req, res) => { // <--- Made route async
    const { name, email, phone, department, message } = req.body;

    try {
        // SAVES TO MYSQL DATABASE
        const newInquiry = await Inquiry.create({
            name,
            email,
            phone,
            department,
            message
        });

        // Logs the patient inquiry directly to the backend terminal
        console.log(`\n================================================`);
        console.log(`🏥 NEW PATIENT INQUIRY SAVED TO DATABASE 🏥`);
        console.log(`================================================`);
        console.log(`Database ID  : #${newInquiry.id}`);
        console.log(`Patient Name : ${name}`);
        console.log(`Contact Email: ${email}`);
        console.log(`Phone Number : ${phone}`);
        console.log(`Routed To    : ${department}`);
        console.log(`Message/Desc : "${message}"`);
        console.log(`================================================\n`);

        // Return a success response to trigger the green UI banner on the frontend
        return res.status(200).json({ success: true, msg: "Inquiry received and logged successfully." });
    } catch (error) {
        console.error("❌ Database Save Error for Inquiry:", error);
        return res.status(500).json({ success: false, msg: "Failed to save inquiry to database." });
    }
});

// --- Base Medical Server Health Verification Route ---
app.get('/', (req, res) => {
    res.send('🏥 SmartCare Critical Hospital System Network Server is Online and Synchronized.');
});

// --- Relational Database Synchronization & Max-Heap Hydration Engine ---
sequelize.sync({ alter: true })
    .then(async () => {
        console.log('📂 Database Tables Synced & Updated Successfully');

        try {
            // A. Query database records for active patient files matching your strict lowercase ENUM criteria
            const activeWaitingPatients = await Appointment.findAll({
                where: { status: 'waiting' },
                order: [['priorityScore', 'DESC'], ['createdAt', 'ASC']]
            });

            // B. Securely wipe local memory storage references to avoid stack duplicates
            if (maxHeap) {
                if (typeof maxHeap.clear === 'function') {
                    maxHeap.clear();
                } else {
                    maxHeap.heap = [];
                }
            }

            // C. Unpack elements, resolve real user names dynamically, and push to RAM
            if (activeWaitingPatients.length > 0 && maxHeap) {
                for (const patient of activeWaitingPatients) {
                    const plainPatientObject = patient.get({ plain: true });

                    // CRITICAL ENUM INTERCEPT REPAIR: Fix legacy data and parse placeholder strings out natively
                    const matchingUser = await User.findOne({ where: { email: plainPatientObject.patientEmail } });

                    let finalName = "Patient";
                    if (matchingUser && matchingUser.name) {
                        finalName = matchingUser.name;
                    } else {
                        finalName = getNameFromEmail(plainPatientObject.patientEmail);
                    }

                    // Assign name back to the model object payload to be transmitted cleanly
                    plainPatientObject.patientName = finalName;

                    // Sync the clean string back into MySQL permanently
                    patient.patientName = finalName;
                    await patient.save();

                    if (typeof maxHeap.insert === 'function') {
                        maxHeap.insert(plainPatientObject);
                    } else if (maxHeap.heap && Array.isArray(maxHeap.heap)) {
                        maxHeap.heap.push(plainPatientObject);
                    }
                }

                if (maxHeap.heap && Array.isArray(maxHeap.heap)) {
                    maxHeap.heap.sort((a, b) => b.priorityScore - a.priorityScore);
                }

                console.log(`🏥 Heap Memory Hydrated: Reloaded and corrected ${activeWaitingPatients.length} pending triage cases into live memory.`);
            } else {
                console.log('🏥 Heap Memory Hydrated: No pending emergency room cases found in database.');
            }

        } catch (hydrationError) {
            console.error("⚠️ Server Boot Warning: Could not re-populate heap structure on startup:", hydrationError.message);
        }
    })
    .catch((err) => {
        console.error('❌ Database Sync Error:', err.message);
    });

// --- Initialize Server Listeners ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("🚀 Hospital Server is executing on port " + PORT);
    console.log("🔗 Interface Access Node: http://localhost:" + PORT);
});