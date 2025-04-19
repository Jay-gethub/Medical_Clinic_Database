const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");

router.get("/assigned-patients/:id", employeeController.getAssignedPatients);

//create referrals
router.post("/create-referrals/", employeeController.createReferral);

//get all doctors
router.get("/all-doctors", employeeController.getAllDoctors);

//get all patients
router.get('/all-patients', employeeController.getAllPatients);

//get appointment info for receptionist appointment table
router.get('/appointment-table', employeeController.getPatientInfo);

//update appointment status
router.put('/update-appointment', employeeController.updateAppointmentStatus);

//get all specialist
router.get('/all-specialists', employeeController.getSpecialists);

//get all specialist
router.get('/pending-referrals/:id', employeeController.getPendingReferrals);

//update referral_status
router.put('/update-referral-status/:referralId', employeeController.updateReferralStatus);

//update employee profile
router.put('/update-profile/:id', employeeController.updateProfile);

//get medical record of patient
router.get('/patient-medical-record/:id', employeeController.getPatientMedicalRecord);

//get all allergies
router.get('/allergy-names', employeeController.getAllergiesNames);

//get all immunizations
router.get('/immunization-names', employeeController.getImmunizationsNames);

//update patient's known allergies
router.post('/add-patient-allergy/:id', employeeController.createPatientAllergy);

//add patient immunization
router.post('/add-patient-immunization/:id', employeeController.createPatientImmunization);

//add patient immunization
router.post('/add-prescription/:id', employeeController.createPrescription);

//get a patient's prescriptions
router.get('/patient-prescriptions/:id', employeeController.getPatientPresriptions);

//get patient's pending immunizations
router.get('/pending-immunizations/:id', employeeController.getPendingImmunizations);

//order diagnostic
router.post('/order-diagnostic/:id', employeeController.OrderDiagnostic);

//get patient's pending diagnostics
router.get('/pending-diagnostics/:id', employeeController.getPendingDiagnostics);

//mark immunization complete
router.post('/mark-immunization-complete', employeeController.MarkImmunizationComplete);

//get employee by id
router.get('/:id', employeeController.getProfileById);


module.exports = router;