const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");

// Get doctors by clinic
router.get("/doctors/by-clinic/:clinicId", appointmentController.getDoctorsByClinic);

// Appointment creation
router.post("/create", authenticateUser, authorizeRole(["Patient"]), appointmentController.createAppointment);
//router.post("/create-by-receptionist", authenticateUser, authorizeRole(["Receptionist"]), appointmentController.createAppointmentByReceptionist);

// Appointment management

//router.put("/complete/:appointment_id", authenticateUser, authorizeRole(["Doctor", "Receptionist"]), appointmentController.completeAppointment);
router.put("/check-in/:appointment_id", authenticateUser, authorizeRole(["Receptionist"]), appointmentController.checkInPatient);
router.put("/check-out/:appointment_id", authenticateUser, authorizeRole(["Receptionist"]), appointmentController.checkOutPatient);
// Appointment history
router.get("/my-appointments", appointmentController.getAppointmentsByPatient);

// Cancel appointment
router.put("/cancel/:appointment_id", appointmentController.cancelAppointment);

// Get appointments by status
router.get("/status", authenticateUser, appointmentController.getAppointmentsByStatus);
// Referral check (inline)
router.get("/referrals/check", appointmentController.checkReferralValidity);
router.get('/booked-slots', appointmentController.getBookedSlots);

module.exports = router;
