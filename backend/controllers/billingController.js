const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const puppeteer = require('puppeteer');


exports.generateInvoice = (req, res) => {
  const billingId = req.params.billingId;

  db.query(
    `
    SELECT 
      b.billing_id, b.billing_date, b.due_date, b.total_amount AS amount,
       p.first_name AS patient_first, p.last_name AS patient_last,
      c.clinic_name, 
      e.first_name AS doctor_first, e.last_name AS doctor_last,
      a.appointment_type AS service_type,
      dept.department_name AS department_name

    FROM BILLING b
    JOIN PATIENTS p ON b.patient_id = p.patient_id
    LEFT JOIN APPOINTMENTS a ON b.appointment_id = a.appointment_id
    LEFT JOIN DOCTORS d ON a.doctor_id = d.employee_id
    LEFT JOIN EMPLOYEES e ON d.employee_id = e.employee_id
    LEFT JOIN CLINIC c ON a.clinic_id = c.clinic_id
    LEFT JOIN DEPARTMENTS dept ON d.department_id = dept.department_id
    WHERE b.billing_id = ?
    `,
    [billingId],
    async (err, results) => {
      if (err) {
        console.error("❌ DB query error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (!results.length) {
        return res.status(404).json({ error: "Billing record not found" });
      }

      // Prepare data for the template
      const data = results[0];
      data.billing_date = new Date(data.billing_date).toLocaleDateString();
      data.due_date = new Date(data.due_date).toLocaleDateString();
      data.description = "Medical services rendered under appointment";
      data.patient_name = `${data.patient_last}, ${data.patient_first}`;
      data.doctor_name = `${data.doctor_first} ${data.doctor_last}`;
      data.service_type = `Appointment with ${data.department_name} Provider`;


      
      try {
        data.logoBase64 = fs.readFileSync(
            path.join(__dirname, '../../frontend/src/assets/clinic-logo.png'),
            'base64'
          );
      } catch (logoErr) {
        console.warn("Logo not found, skipping logo");
        data.logoBase64 = '';
      }

      try {
        const templatePath = path.join(__dirname, '../templates/invoiceTemplate.html');
        const templateHtml = fs.readFileSync(templatePath, 'utf8');
        const compiled = handlebars.compile(templateHtml);
        const html = compiled(data);

        // Optional: save for debugging
        // fs.writeFileSync("debug-invoice.html", html);

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        console.log("📄 Setting HTML...");
        await page.setContent(html, { waitUntil: 'networkidle0' });

        console.log("🖨️ Generating PDF...");
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();

        console.log("✅ PDF generated, sending to browser...");

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=invoice-${billingId}.pdf`);
        res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename=invoice-${billingId}.pdf`,
            'Content-Length': pdfBuffer.length,
          });
          res.end(pdfBuffer);
          
      } catch (pdfErr) {
        console.error("🚨 PDF generation error:", pdfErr);
        res.status(500).json({ error: "Failed to generate PDF" });
      }
    }
  );
};
exports.getBillsByPatient = (req, res) => {
    const patientId = req.params.id;
  
    const query = `
  SELECT 
    b.billing_id,
    b.appointment_id,
    b.total_amount,  -- ✅ make sure this is included
    b.payment_status,
    b.due_date,
    COALESCE(SUM(p.amount_paid), 0) AS total_paid,
    (b.total_amount - COALESCE(SUM(p.amount_paid), 0)) AS amount_due,
    a.appointment_status
  FROM BILLING b
  LEFT JOIN PAYMENTS p ON b.billing_id = p.billing_id
  LEFT JOIN APPOINTMENTS a ON b.appointment_id = a.appointment_id
  WHERE b.patient_id = ?
  GROUP BY 
    b.billing_id, b.appointment_id, b.total_amount, b.payment_status, b.due_date, a.appointment_status
`;


  
    db.query(query, [patientId], (err, results) => {
      if (err) {
        console.error("❌ Failed to fetch billing data:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(results);
    });
  };
  