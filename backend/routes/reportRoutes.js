const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Main revenue report with filters
router.get('/revenue-summary', reportController.getRevenueReport);

// Filter options
router.get('/filters/clinics', reportController.getClinics);
router.get('/filters/departments', reportController.getDepartments);
router.get('/filters/doctors', reportController.getDoctors);

module.exports = router;
