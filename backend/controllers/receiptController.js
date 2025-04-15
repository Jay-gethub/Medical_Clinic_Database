const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const puppeteer = require('puppeteer');
const db = require('../config/db');

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
