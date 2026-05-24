const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const calculatePriority = require('../utils/priorityLogic');
const maxHeap = require('../utils/MaxHeap');
const nodemailer = require('nodemailer');

// 1. GLOBAL CLINICAL BREAK STATE VARIABLE
let isDoctorOnBreak = false;

// 2. CONFIGURE SMTP OUTGOING EMAIL DISPATCH TRANSPORTER
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Helper function to extract a clean, capitalized name from an email address
 */
function getNameFromEmail(email) {
    if (!email) return "Patient";
    const partBeforeAt = email.split('@')[0];
    return partBeforeAt.charAt(0).toUpperCase() + partBeforeAt.slice(1);
}

/**
 * Helper function to calculate a dynamic estimated treatment time based on priority
 */
function getEstimatedTime(priorityScore) {
    if (priorityScore >= 9) return "Immediate Medical Evaluation (Within 10-15 Mins)";
    if (priorityScore >= 7) return "Urgent Clinical Review (Within 20-30 Mins)";
    if (priorityScore >= 5) return "Standard Consultation (Within 35-45 Mins)";
    return "Routine Consultation (Expected 45+ Mins)";
}

/**
 * @route   GET /api/appointments/history
 * @desc    Retrieves all closed/finalized consultations for patient archive lookups
 */
router.get('/history', async (req, res) => {
    try {
        // Queries MySQL for records whose clinical triage flow has been finalized
        const finalizedRecords = await Appointment.findAll({
            where: { status: 'treated' },
            order: [['createdAt', 'DESC']] // Keeps newest medical files at the top
        });

        // Loop through to enrich history rows with correct matching database names if available
        const enrichedHistory = await Promise.all(
            finalizedRecords.map(async (record) => {
                const plainRecord = record.get({ plain: true });
                const associatedUser = await User.findOne({ where: { email: plainRecord.patientEmail } });

                plainRecord.patientName = (associatedUser && associatedUser.name)
                    ? associatedUser.name
                    : getNameFromEmail(plainRecord.patientEmail);

                return plainRecord;
            })
        );

        res.json(enrichedHistory);
    } catch (err) {
        console.error("❌ ARCHIVE DB RETRIEVAL ERROR:", err.message);
        res.status(500).json({ error: "Internal server error syncing archive files." });
    }
});

/**
 * @route   POST /api/appointments/toggle-break
 * @desc    Toggles break state and automatically emails all waiting patients if true
 */
router.post('/toggle-break', async (req, res) => {
    isDoctorOnBreak = req.body.onBreak;
    console.log(`🏥 Clinical Break Mode Status Changed -> Paused: ${isDoctorOnBreak}`);

    if (isDoctorOnBreak) {
        try {
            let waitingPatients = [];
            if (maxHeap && maxHeap.heap && Array.isArray(maxHeap.heap)) {
                waitingPatients = maxHeap.heap;
            }

            if (waitingPatients.length > 0) {
                console.log(`✉️ Dispatching clinical advisory updates to ${waitingPatients.length} patients...`);

                waitingPatients.forEach((patient, index) => {
                    const currentTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

                    const mailOptions = {
                        from: '"SmartCare Medical Center" <no-reply@smartcarehospital.com>',
                        to: patient.patientEmail,
                        subject: '🏥 SMARTCARE MEDICAL CENTER | CLINICAL ADVISORY: Temporary Patient Intake Pause',
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 8px; color: #1e293b;">
                                <div style="border-bottom: 2px solid #f59e0b; padding-bottom: 15px; margin-bottom: 20px;">
                                    <h2 style="color: #d97706; margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 0.5px;">SmartCare Medical Center</h2>
                                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Emergency Department | Patient Care Operations Notice</p>
                                </div>
                                
                                <p style="font-size: 14px; line-height: 1.5;">Dear <strong>${patient.patientName}</strong>,</p>
                                <p style="font-size: 14px; line-height: 1.5; color: #334155;">This is an automated operational update regarding your emergency department check-in status. As of <strong>${currentTimestamp}</strong>, the attending emergency physician has temporarily stepped away to manage urgent administrative documentation or an essential clinical rest interval.</p>
                                
                                <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0;">
                                    <h4 style="margin: 0 0 10px 0; color: #b45309; font-size: 13px; text-transform: uppercase;">Reserved Triage Status</h4>
                                    <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                                        <tr><td style="padding: 4px 0; color: #64748b;"><strong>Your Confirmed Queue Position:</strong></td><td style="color: #1e293b; font-weight: bold;">Patient #${index + 1} in line</td></tr>
                                        <tr><td style="padding: 4px 0; color: #64748b;"><strong>Assigned Clinical Priority Level:</strong></td><td style="color: #1e293b; font-weight: bold;">Category Level ${patient.priorityScore} / 10</td></tr>
                                        <tr><td style="padding: 4px 0; color: #64748b;"><strong>Current Status:</strong></td><td style="color: #b45309; font-weight: bold;">Temporarily On Hold (Position Fully Secured)</td></tr>
                                    </table>
                                </div>
                                
                                <p style="font-size: 14px; line-height: 1.5; color: #334155;"><strong>No action or re-registration is required on your part.</strong> Your exact placement within our medical triage sequence is safely locked and cannot be bypassed by incoming requests. Consultations and active check-in processing will resume immediately when the medical officer logs back onto the care command terminal.</p>
                                
                                <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; border-radius: 6px; margin-top: 15px; font-size: 12px; font-style: italic; color: #475569;">
                                    Note: If you feel your emergency symptoms have suddenly worsened while on hold, please look back at your patient panel entry view to update your physiological biological vital checkpoints immediately.
                                </div>

                                <div style="margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #94a3b8; line-height: 1.4;">
                                    <p style="margin: 0 0 5px 0;"><strong>Emergency Room Outpatient Support:</strong> +91 (022) 555-8710 | support@smartcarehospital.com</p>
                                    <p style="margin: 0;">CONFIDENTIALITY & PRIVACY NOTICE: This transmission is intended solely for the designated recipient and contains confidential medical information protected under standard patient privacy guidelines.</p>
                                </div>
                            </div>
                        `
                    };
                    transporter.sendMail(mailOptions).catch(err => console.error(`❌ Break Email Error for ${patient.patientEmail}:`, err.message));
                });
            }
        } catch (mailError) {
            console.error("Failed to compile break notification dispatch loop:", mailError.message);
        }
    }

    res.json({ success: true, isDoctorOnBreak });
});

/**
 * @route   GET /api/appointments/break-status
 */
router.get('/break-status', (req, res) => {
    res.json({ isDoctorOnBreak });
});

/**
 * @route   POST /api/appointments/book
 * @desc    Processes symptoms and incoming vital metrics to compute accurate priority score rankings.
 */
router.post('/book', async (req, res) => {
    try {
        if (isDoctorOnBreak) {
            return res.status(503).json({
                error: "Intake Held: The attending physician is currently on a clinical break. Operations will resume shortly."
            });
        }

        const emailInput = req.body.patientEmail || req.body.email;
        const { disease } = req.body;

        // INTERCEPT VITALS BLOCK INCOMING FROM CLIENT APPS
        const vitalsInput = req.body.vitals || null;

        if (!emailInput) {
            return res.status(400).json({ error: "Your session token context has expired. Please sign out and log back in." });
        }

        if (!disease || disease.trim() === "") {
            return res.status(400).json({ error: "Please state your active symptoms." });
        }

        const registeredUser = await User.findOne({ where: { email: emailInput } });

        let exactRegistrationName = "Patient";
        if (registeredUser && registeredUser.name) {
            exactRegistrationName = registeredUser.name;
        } else {
            exactRegistrationName = getNameFromEmail(emailInput);
        }

        // PASS BOTH PATHS SO PHYSIOLOGICAL VARIABLES OVERRIDE TEXT STRINGS
        const priorityScore = calculatePriority(disease, vitalsInput) || 3;

        const appointment = await Appointment.create({
            patientName: exactRegistrationName,
            patientEmail: emailInput,
            disease: disease,
            priorityScore: priorityScore,
            status: 'waiting'
        });

        if (maxHeap) {
            const plainPatient = appointment.get({ plain: true });
            if (typeof maxHeap.insert === 'function') {
                maxHeap.insert(plainPatient);
            } else if (maxHeap.heap && Array.isArray(maxHeap.heap)) {
                maxHeap.heap.push(plainPatient);
                maxHeap.heap.sort((a, b) => b.priorityScore - a.priorityScore);
            }
        }

        // CALCULATE LIVE QUEUE SEQUENCE POSITION POST-INSERTION
        let sequencePosition = 1;
        if (maxHeap && maxHeap.heap && Array.isArray(maxHeap.heap)) {
            const matchedIndex = maxHeap.heap.findIndex(p => Number(p.id) === Number(appointment.id));
            if (matchedIndex !== -1) {
                sequencePosition = matchedIndex + 1;
            }
        }

        // GET FORMAL TIMING & LOCALIZED TIMESTAMP DATA STRINGS
        const estimatedTimeWindow = getEstimatedTime(priorityScore);
        const bookingTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

        // DYNAMIC OFFICIAL CONFIRMATION EMAIL TEMPLATE (REAL CLINICAL PHRASING)
        const mailOptions = {
            from: '"SmartCare Medical Center" <no-reply@smartcarehospital.com>',
            to: emailInput,
            subject: '🏥 SMARTCARE MEDICAL CENTER | Confirmation of Emergency Triage Registration',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 8px; color: #1e293b;">
                    <div style="border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px;">
                        <h2 style="color: #1e3a8a; margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 0.5px;">SmartCare Medical Center</h2>
                        <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Emergency Department | Patient Care Confirmation Record</p>
                    </div>
                    
                    <p style="font-size: 14px; line-height: 1.5;">Dear <strong>${exactRegistrationName}</strong>,</p>
                    <p style="font-size: 14px; line-height: 1.5; color: #334155;">This email confirms that your emergency registration and initial symptom details have been successfully recorded by our clinical triage management system at <strong>${bookingTimestamp}</strong>.</p>
                    
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <h4 style="margin: 0 0 10px 0; color: #1e3a8a; font-size: 13px; text-transform: uppercase;">Emergency Room Registration Details</h4>
                        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                            <tr><td style="padding: 6px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>Reported Symptoms:</strong></td><td style="padding: 6px 0; border-bottom: 1px solid #f1f5f9; color: #1e293b; font-weight: bold;">${disease}</td></tr>
                            <tr><td style="padding: 6px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>Clinical Priority Level:</strong></td><td style="padding: 6px 0; border-bottom: 1px solid #f1f5f9; color: #dc2626; font-weight: bold;">Category Level ${priorityScore} / 10</td></tr>
                            <tr><td style="padding: 6px 0; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>Current Queue Position:</strong></td><td style="padding: 6px 0; border-bottom: 1px solid #f1f5f9; color: #2563eb; font-weight: bold;">Patient #${sequencePosition} in line</td></tr>
                            <tr><td style="padding: 6px 0; color: #64748b;"><strong>Estimated Consultation Window:</strong></td><td style="padding: 6px 0; color: #16a34a; font-weight: bold;">${estimatedTimeWindow}</td></tr>
                        </table>
                    </div>
                    
                    <p style="font-size: 13px; color: #475569; line-height: 1.5;">Please monitor your patient dashboard console. Your position in the queue updates dynamically in real-time as the medical team completes active evaluations for patients with higher-urgency conditions.</p>
                    
                    <div style="margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #94a3b8; line-height: 1.4;">
                        <p style="margin: 0 0 5px 0;"><strong>Emergency Room Outpatient Support:</strong> +91 (022) 555-8710 | support@smartcarehospital.com</p>
                        <p style="margin: 0;">CONFIDENTIALITY & PRIVACY NOTICE: This transmission is intended solely for the designated recipient and contains confidential medical information protected under standard patient privacy guidelines.</p>
                    </div>
                </div>
            `
        };
        transporter.sendMail(mailOptions).catch(err => console.error("❌ SMTP Intake Confirmation Error:", err.message));

        res.status(201).json({ msg: "Appointment recorded!", priorityScore, queuePosition: sequencePosition, appointment });

    } catch (err) {
        console.error("DATABASE REGISTRATION FAULT ERROR:", err.message);
        res.status(500).json({ error: err.message });
    }
});

/**
 * @route   GET /api/appointments/analytics
 */
router.get('/analytics', async (req, res) => {
    try {
        const totalCount = await Appointment.count();
        const treatedCount = await Appointment.count({ where: { status: 'treated' } });
        const waitingCount = await Appointment.count({ where: { status: 'waiting' } });
        const logs = await Appointment.findAll({ order: [['createdAt', 'DESC']] });

        res.json({ total: totalCount, treated: treatedCount, waiting: waitingCount, logs: logs });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @route   POST /api/appointments/treat
 * @desc    Finalizes an emergency case with custom medical officer treatment diagnosis logs
 */
router.post('/treat', async (req, res) => {
    const appointmentId = req.body.id || req.body.appointmentId;
    const { doctorNotes } = req.body; // Intercepts the prescription details sent from client modal views

    if (!appointmentId) return res.status(400).json({ error: "Missing patient ID identifier." });

    try {
        const appointment = await Appointment.findByPk(appointmentId);
        if (!appointment) {
            return res.status(404).json({ error: "Patient medical record file not found." });
        }

        // Apply state status shifts and append the doctor's custom input logs directly
        appointment.status = 'treated';
        appointment.doctorNotes = doctorNotes || "Outpatient care flow finalized by the attending physician.";
        await appointment.save();

        // Safe cleanup slice: evict patient from active heap memory
        if (maxHeap && maxHeap.heap && Array.isArray(maxHeap.heap)) {
            maxHeap.heap = maxHeap.heap.filter(p => Number(p.id) !== Number(appointmentId));
        }

        res.json({ 
            msg: "Patient medical tracking file finalized successfully.", 
            id: appointmentId,
            doctorNotes: appointment.doctorNotes
        });
    } catch (err) {
        console.error("❌ TREATMENT RESOLUTION PIPELINE FAULT:", err.message);
        res.status(500).json({ error: err.message });
    }
});

/**
 * @route   GET /api/appointments/next
 */
router.get('/next', async (req, res) => {
    try {
        let nextPatient = null;

        if (maxHeap && typeof maxHeap.extractMax === 'function') {
            try { nextPatient = maxHeap.extractMax(); } catch (e) { }
        } else if (maxHeap && maxHeap.heap && Array.isArray(maxHeap.heap)) {
            nextPatient = maxHeap.heap.shift();
        }

        if (!nextPatient) {
            const dbFallbackPatient = await Appointment.findOne({
                where: { status: 'waiting' },
                order: [['priorityScore', 'DESC'], ['createdAt', 'ASC']]
            });
            if (dbFallbackPatient) nextPatient = dbFallbackPatient.get({ plain: true });
        }

        if (!nextPatient) return res.status(404).json({ msg: "The patient queue is currently empty" });

        const targetUser = await User.findOne({ where: { email: nextPatient.patientEmail } });
        nextPatient.patientName = (targetUser && targetUser.name) ? targetUser.name : getNameFromEmail(nextPatient.patientEmail);

        res.json(nextPatient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @route   GET /api/appointments/queue
 */
router.get('/queue', async (req, res) => {
    try {
        let activeQueue = [];

        if (maxHeap && maxHeap.heap && Array.isArray(maxHeap.heap)) {
            activeQueue = JSON.parse(JSON.stringify(maxHeap.heap));
        }

        if (activeQueue.length === 0) {
            const dbBackupWaiting = await Appointment.findAll({
                where: { status: 'waiting' },
                order: [['priorityScore', 'DESC'], ['createdAt', 'ASC']]
            });
            activeQueue = dbBackupWaiting.map(patient => patient.get({ plain: true }));
        }

        for (let i = 0; i < activeQueue.length; i++) {
            const currentPatient = activeQueue[i];
            const associatedUser = await User.findOne({ where: { email: currentPatient.patientEmail } });

            let resolvedName = "Patient";
            if (associatedUser && associatedUser.name) {
                resolvedName = associatedUser.name;
            } else {
                resolvedName = getNameFromEmail(currentPatient.patientEmail);
            }

            activeQueue[i].patientName = resolvedName;

            if (maxHeap && maxHeap.heap && maxHeap.heap[i]) {
                maxHeap.heap[i].patientName = resolvedName;
            }
        }

        res.json(activeQueue);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;