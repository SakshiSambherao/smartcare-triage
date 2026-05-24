const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const sendEmail = require('../utils/emailService');

// POST: Trigger Doctor Break and Notify Patients
router.post('/doctor-break', async (req, res) => {
    try {
        const { doctorName, status, delayMinutes } = req.body; 

        // 1. Update Doctor Status in MySQL Workbench
        await Doctor.update({ status: status }, { where: { name: doctorName } });

        // 2. Find all patients who are currently 'waiting'
        const waitingPatients = await Appointment.findAll({ where: { status: 'waiting' } });

        // 3. Send Email to each patient if doctor is on break
        if (status === 'on_break') {
            const emailPromises = waitingPatients.map(patient => {
                const htmlContent = `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                        <h2 style="color: #d9534f;">🏥 Appointment Update</h2>
                        <p>Dear <b>${patient.patientName}</b>,</p>
                        <p>We wish to inform you that <b>Dr. ${doctorName}</b> is currently on an emergency break.</p>
                        <p>Your appointment has been shifted by approximately <b>${delayMinutes} minutes</b>.</p>
                        <p>We apologize for the wait and appreciate your cooperation.</p>
                        <hr>
                        <small>SmartCare Triage System - Sterling Institute</small>
                    </div>
                `;
                return sendEmail(patient.patientEmail, "⚠️ Schedule Update: Dr. " + doctorName, htmlContent);
            });

            // Wait for all emails to be sent
            await Promise.all(emailPromises);
        }

        res.json({ msg: `Doctor status updated to ${status}. ${waitingPatients.length} patients notified.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;