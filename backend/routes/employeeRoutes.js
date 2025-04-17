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

//get patient info for receptionist
router.get('/patient-table', employeeController.getPatientInfo);

//get all specialist
router.get('/all-specialists', employeeController.getSpecialists);

//get all specialist
router.get('/pending-referrals/:id', employeeController.getPendingReferrals);

//get employee by id
router.get('/:id', employeeController.getProfileById);

//update referral_status
router.put('/update-referral-status/:referralId', employeeController.updateReferralStatus);

//update employee profile
router.put('/update-profile/:id', employeeController.updateProfile);


module.exports = router;