// controllers/paymentController.js
const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const puppeteer = require('puppeteer');

exports.generateReceipt = (req, res) => {
  const paymentId = req.params.paymentId;

  db.query(
    `
    SELECT 
      p.payment_id, p.billing_id, p.amount_paid, p.payment_method, p.payment_date,
      b.total_amount,
      pt.first_name AS patient_first, pt.last_name AS patient_last,
      e.first_name AS doctor_first, e.last_name AS doctor_last,
      dept.department_name
    FROM PAYMENTS p
    JOIN BILLING b ON p.billing_id = b.billing_id
    JOIN PATIENTS pt ON b.patient_id = pt.patient_id
    LEFT JOIN APPOINTMENTS a ON b.appointment_id = a.appointment_id
    LEFT JOIN DOCTORS d ON a.doctor_id = d.employee_id
    LEFT JOIN EMPLOYEES e ON d.employee_id = e.employee_id
    LEFT JOIN DEPARTMENTS dept ON d.department_id = dept.department_id
    WHERE p.payment_id = ?
    `,
    [paymentId],
    async (err, results) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (!results.length) {
        return res.status(404).json({ error: "Receipt not found" });
      }

      const data = results[0];
      data.patient_name = `${data.patient_last}, ${data.patient_first}`;
      data.doctor_name = `Dr. ${data.doctor_first} ${data.doctor_last}`;
      data.balance = (data.total_amount - data.amount_paid).toFixed(2);
      data.payment_date = new Date(data.payment_date).toLocaleDateString();

      const templateHtml = fs.readFileSync(path.join(__dirname, '../templates/receiptTemplate.html'), 'utf8');
      const compiled = handlebars.compile(templateHtml);
      const html = compiled(data);

      try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();

        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename=receipt-${paymentId}.pdf`,
          'Content-Length': pdfBuffer.length,
        });
        res.end(pdfBuffer);
      } catch (err) {
        console.error("PDF generation error:", err);
        res.status(500).json({ error: "Failed to generate receipt" });
      }
    }
  );
};


exports.makePayment = (req, res) => {
    const { billing_id, amount_paid, payment_method } = req.body;
  
    if (!billing_id || !amount_paid || !payment_method) {
      return res.status(400).json({ error: "Missing required fields" });
    }
  
    // Step 1: Get billing info to check if it's a late fee
    db.query(
      `SELECT total_amount, appointment_id, 
              (SELECT appointment_status FROM APPOINTMENTS WHERE appointment_id = b.appointment_id) AS appointment_status 
       FROM BILLING b 
       WHERE billing_id = ?`,
      [billing_id],
      (err, results) => {
        if (err || results.length === 0) {
          return res.status(500).json({ error: "Billing lookup failed", details: err });
        }
  
        const { total_amount, appointment_id, appointment_status } = results[0];
        const isLateFee = Number(total_amount) === 25 && appointment_status === 'Canceled';
  
        if (isLateFee && amount_paid < 25) {
          return res.status(400).json({ error: "Late cancellation fee must be paid in full." });
        }
  
        // Step 2: Insert payment
        db.query(
          `INSERT INTO PAYMENTS (billing_id, amount_paid, payment_date, payment_method)
           VALUES (?, ?, CURDATE(), ?)`,
          [billing_id, amount_paid, payment_method],
          (err, result) => {
            if (err) {
              console.error("Payment insert failed:", err);
              return res.status(500).json({ error: "Payment insert failed" });
            }
  
            const payment_id = result.insertId;
  
            // Step 3: Recalculate payment status
            db.query(
              `SELECT SUM(amount_paid) AS total_paid FROM PAYMENTS WHERE billing_id = ?`,
              [billing_id],
              (err, sumRows) => {
                if (err) return res.status(500).json({ error: "Failed to sum payments" });
  
                const totalPaid = sumRows[0].total_paid;
                let status = totalPaid >= total_amount ? "Paid" : "Partial";
  
                db.query(
                  `UPDATE BILLING SET payment_status = ? WHERE billing_id = ?`,
                  [status, billing_id],
                  (err) => {
                    if (err) return res.status(500).json({ error: "Failed to update billing status" });
  
                    return res.status(200).json({
                      message: "Payment recorded",
                      payment_status: status,
                      payment_id: payment_id, // so frontend can fetch receipt
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  };
  