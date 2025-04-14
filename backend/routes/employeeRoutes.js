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


module.exports = router;