const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");

router.get("/assigned-patients/:id", employeeController.getAssignedPatients);
<<<<<<< HEAD
=======

//create referrals
router.post("/create-referrals/", employeeController.createReferral);

//get all doctors
router.get("/all-doctors", employeeController.getAllDoctors);

//get all patients
router.get('/all-patients', employeeController.getAllPatients);

>>>>>>> a419df2290abfc5ea3f7893f1f2c13ab3557064a
module.exports = router;