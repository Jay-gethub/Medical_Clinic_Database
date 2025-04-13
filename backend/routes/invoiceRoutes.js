const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

router.get('/:billingId/pdf', invoiceController.generateInvoice);

module.exports = router;
