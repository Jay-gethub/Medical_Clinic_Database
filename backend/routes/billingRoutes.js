//billingRoutes.js
const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');

router.get('/patient/:id', billingController.getBillsByPatient);
router.get('/invoice/:billingId/pdf', billingController.generateInvoice);

module.exports = router;
