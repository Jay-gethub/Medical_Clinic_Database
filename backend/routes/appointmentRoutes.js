// //appointmentRoutes 
// const express = require("express");
// const { 
//   createAppointment, 
//   createAppointmentByReceptionist, 
//   //updateAppointment, 
//   cancelAppointment, 
//   checkInPatient, 
//   checkOutPatient, 
//   completeAppointment, 
//   getAppointmentsByStatus,
//   getDoctorsByClinic
// } = require("../controllers/appointmentController");
// const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");

// const router = express.Router();
// router.get("/doctors/by-clinic/:clinicId", authenticateUser, getDoctorsByClinic);// get doctors by clinic
// /* 
//   APPOINTMENT CREATION ROUTES
//  */
// // Patients create their own appointments
// router.post("/create", authenticateUser, authorizeRole(["Patient"]), createAppointment);

// // Receptionists create appointments for patients
// router.post("/create-by-receptionist", authenticateUser, authorizeRole(["Receptionist"]), createAppointmentByReceptionist);

// /* 
//   APPOINTMENT MANAGEMENT ROUTES
//  */
// // Updating appointment details
// //router.put("/update/:appointment_id", authenticateUser, updateAppointment);

// // Cancel an appointment (Patients & Receptionists, includes fine enforcement)
// router.put("/cancel/:appointment_id", authenticateUser, cancelAppointment);

// // Mark appointment as "Finished" (Doctors & Receptionists)
// router.put("/complete/:appointment_id", authenticateUser, authorizeRole(["Doctor", "Receptionist"]), completeAppointment);

// // Checking in a patient (Receptionists)
// router.put("/check-in/:appointment_id", authenticateUser, authorizeRole(["Receptionist"]), checkInPatient);

// // Checking out a patient (Receptionists, also marks appointment as finished)
// router.put("/check-out/:appointment_id", authenticateUser, authorizeRole(["Receptionist"]), checkOutPatient);

// /* 
//   FETCHING APPOINTMENTS ROUTE
//  */
// // Get appointments filtered by status ("Scheduled", "Canceled", "Finished")
// router.get("/status", authenticateUser, getAppointmentsByStatus);

// module.exports = router;

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
router.get('/booked-slots/:doctorId/:date', appointmentController.getBookedSlotsForDoctor);

//router.put("/complete/:appointment_id", authenticateUser, authorizeRole(["Doctor", "Receptionist"]), appointmentController.completeAppointment);
router.put("/check-in/:appointment_id", authenticateUser, authorizeRole(["Receptionist"]), appointmentController.checkInPatient);
router.put("/check-out/:appointment_id", authenticateUser, authorizeRole(["Receptionist"]), appointmentController.checkOutPatient);
router.post('/appointments/by-receptionist', authenticateUser, appointmentController.createAppointmentByReceptionist);

// Appointment history
router.get("/my-appointments", appointmentController.getAppointmentsByPatient);

// Cancel appointment
router.put("/cancel/:appointment_id", appointmentController.cancelAppointment);

// Get appointments by status
router.get("/status", authenticateUser, appointmentController.getAppointmentsByStatus);
// Referral check (inline)
router.get("/referrals/check", appointmentController.checkReferralValidity);

// appointmetnts by doctor id
router.get("/doctor-appointments/:id", appointmentController.getAppointmentByDoctor);
router.get('/doctor/:doctorId', appointmentController.getDoctorAppointments);
module.exports = router;
