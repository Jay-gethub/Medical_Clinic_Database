// paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// POST: Make a payment
router.post('/pay', paymentController.makePayment);

// GET: Download receipt PDF
router.get('/receipt/:paymentId/pdf', paymentController.generateReceipt);

module.exports = router;