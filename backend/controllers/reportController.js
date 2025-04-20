const db = require('../config/db');
// Revenue Report 
exports.getRevenueReport = (req, res) => {
  const { startDate, endDate, clinic, department, doctor } = req.query;

  let query = `
    SELECT 
      cl.clinic_name,
      d.department_name,
      CONCAT(e.first_name, ' ', e.last_name) AS doctor_name,
      SUM(p.amount_paid) AS total_revenue
    FROM PAYMENTS p
    JOIN BILLING b ON p.billing_id = b.billing_id
    JOIN APPOINTMENTS a ON b.appointment_id = a.appointment_id
    JOIN DOCTORS doc ON a.doctor_id = doc.employee_id
    JOIN EMPLOYEES e ON doc.employee_id = e.employee_id
    JOIN DEPARTMENTS d ON doc.department_id = d.department_id
    JOIN CLINIC cl ON a.clinic_id = cl.clinic_id
    WHERE 1=1
  `;

  const params = [];

  if (startDate) {
    query += ' AND p.payment_date >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND p.payment_date <= ?';
    params.push(endDate);
  }

  if (clinic && clinic !== 'all') {
    query += ' AND cl.clinic_name = ?';
    params.push(clinic);
  }

  if (department && department !== 'all') {
    query += ' AND d.department_name = ?';
    params.push(department);
  }

  if (doctor && doctor !== 'all') {
    query += ' AND CONCAT(e.first_name, " ", e.last_name) = ?';
    params.push(doctor);
  }

  query += `
    GROUP BY cl.clinic_name, d.department_name, doctor_name
    ORDER BY cl.clinic_name, d.department_name, doctor_name
  `;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error generating revenue report:", err);
      res.status(500).json({ message: "Internal server error" });
    } else {
      res.json(results);
    }
  });
};

// Clinics for filter dropdown
exports.getClinics = (req, res) => {
  db.query('SELECT DISTINCT clinic_name FROM CLINIC', (err, results) => {
    if (err) {
      console.error("Error fetching clinics:", err);
      res.status(500).json({ message: "Error fetching clinics" });
    } else {
      res.json(results.map(r => r.clinic_name));
    }
  });
};

// Departments for filter dropdown
exports.getDepartments = (req, res) => {
  db.query('SELECT DISTINCT department_name FROM DEPARTMENTS', (err, results) => {
    if (err) {
      console.error("Error fetching departments:", err);
      res.status(500).json({ message: "Error fetching departments" });
    } else {
      res.json(results.map(r => r.department_name));
    }
  });
};

// Doctors for filter dropdown
exports.getDoctors = (req, res) => {
  db.query(`
    SELECT DISTINCT CONCAT(e.first_name, ' ', e.last_name) AS doctor_name
    FROM DOCTORS d
    JOIN EMPLOYEES e ON d.employee_id = e.employee_id
  `, (err, results) => {
    if (err) {
      console.error("Error fetching doctors:", err);
      res.status(500).json({ message: "Error fetching doctors" });
    } else {
      res.json(results.map(r => r.doctor_name));
    }
  });
};

