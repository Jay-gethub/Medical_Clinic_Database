const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");


// Get patient profile
router.get("/profile/:id", patientController.getProfile);

// Update patient profile
router.put("/profile/:id", patientController.updateProfile);
// patientRoutes.js
router.get("/resolve-by-username/:username", patientController.getPatientByUsername);



// Get insurance info
router.get("/insurance/:id", patientController.getInsurance);

// Update insurance info
router.put("/insurance/:id", patientController.updateInsurance);
router.delete("/insurance/:id", patientController.deleteInsurance);

// Get patient bills
router.get("/bills/:id", patientController.getBills);

// Simulate payment
router.put("/bills/pay/:billing_id", patientController.markBillPaid);

// Get patient immunizations
router.get("/immunizations/:id", patientController.getImmunizations);

// Add immunization
router.post("/immunizations", patientController.addImmunization);

// Get diagnostic tests
router.get("/diagnostics/:id", patientController.getDiagnostics);

// Get prescriptions
router.get("/prescriptions/:id", patientController.getPrescriptions);

// Get medical records
router.get("/medical-records/:id", patientController.getMedicalRecords);

// Get referrals
router.get("/referrals/:id", patientController.getReferrals);

// --- Self-Reported Medications ---
router.post('/self-medications', patientController.addSelfMedication);
router.get('/self-medications/:id', patientController.getSelfMedications);
router.put('/self-medications/:medication_id', patientController.updateSelfMedication);
router.delete('/self-medications/:medicationId', patientController.deleteMedication);



// --- Family History ---
router.post('/family-history', patientController.addFamilyHistory);
router.get('/family-history/:id', patientController.getFamilyHistory);
router.put('/family-history/:fh_id', patientController.updateFamilyHistory);
router.delete('/family-history/:fh_id', patientController.deleteFamilyHistory);
// Allergy routes
router.get('/allergies/names', patientController.getAllergyNames);
router.get('/allergies/:id', patientController.getPatientAllergies);
router.post('/allergies/:patient_id', patientController.createPatientAllergy);
router.put('/allergies/:patient_id/:original_allergy_id', patientController.updatePatientAllergy);
router.delete('/allergies/:patient_id/:allergy_id', patientController.deletePatientAllergy);


module.exports = router;
