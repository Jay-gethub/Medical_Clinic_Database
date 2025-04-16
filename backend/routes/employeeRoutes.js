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

//get employee by id
router.get('/:id', employeeController.getProfileById);

module.exports = router;