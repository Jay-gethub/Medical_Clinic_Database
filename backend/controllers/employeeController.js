const db = require("../config/db");

// 1. Get employee profile
exports.getProfile = (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM EMPLOYEES WHERE employee_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result[0]);
  });
};

// 2. Update employee profile (NOT complete)
/* exports.updateProfile = (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, middle_name, dob, address_id, phone_num} = req.body;
  db.query(
    `UPDATE EMPLOYEES SET first_name = ?, last_name = ?, middle_name = ?, dob = ?, address_id = ?, phone_num = ? WHERE employee_id = ?`,
    [first_name, last_name, middle_name, dob, address_id, phone_num, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Profile updated successfully" });
    }
  );}; */

  // 3.
  // controller/doctorController.js
exports.getAssignedPatients = (req, res) => {
  const doctorId = req.params.id;

  const query = `
    SELECT 
      p.patient_id,
      p.first_name,
      p.last_name,
      p.dob,
      p.sex,
      p.phone_num,
      a.street_num,
      a.street_name,
      a.city,
      a.state,
      a.postal_code,
      GROUP_CONCAT(al.allergy_name SEPARATOR ', ') AS allergies,
      dp.assignment_date
    FROM Doctor_Patient dp
    JOIN PATIENTS p ON dp.patient_id = p.patient_id
    JOIN ADDRESS a ON p.address_id = a.address_id
    LEFT JOIN Patient_Allergies pa ON p.patient_id = pa.patient_id
    LEFT JOIN ALLERGIES al ON pa.allergy_id = al.allergy_id
    WHERE dp.doctor_id = ?
    GROUP BY p.patient_id;
  `;

  db.query(query, [doctorId], (err, result) => {
    if (err) {
      console.error('Query error:', err.message);
      return res.status(500).json({ error: 'Database query failed.' });
    }

    res.json(result);
  });
};

//4. create a referral
exports.createReferral = (req, res) => {
  const {
    patient_id,
    referring_doctor_id,
    employee_id,
    appointment_id,// ******need to add later, appointment must either be made at the same time or before referral **********
    referral_reason,
    referral_date,
    referral_notes,
    expiration_date,
    specialist_id
  } = req.body;

  // Step 1: Get department_id from EMPLOYEES table
  db.query(
    'SELECT department_id FROM EMPLOYEES WHERE employee_id = ?',
    [referring_doctor_id],
    (err, deptResult) => {
      if (err) {
        console.error('Error fetching department_id:', err);
        return res.status(500).json({ error: 'Database error.' });
      }

      if (!deptResult.length) {
        return res.status(400).json({ error: 'Doctor not found or has no department.' });
      }

      const department_id = deptResult[0].department_id;

      // Step 2: Insert into REFERRALS table
      db.query(
        `INSERT INTO REFERRALS (
          patient_id,
          referring_doctor_id,
          employee_id,
          appointment_id,
          referral_reason,
          referral_date,
          referral_notes,
          expiration_date,
          specialist_id,
          department_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          patient_id,
          referring_doctor_id,
          employee_id,
          referral_reason,
          referral_date,
          referral_notes,
          expiration_date,
          specialist_id,
          department_id
        ],
        (err, result) => {
          if (err) {
            console.error('Error inserting referral:', err);
            return res.status(500).json({ error: 'Failed to create referral.' });
          }

          res.status(201).json({ message: 'Referral created successfully.' });
        }
      );
    }
  );
};

//5. get all doctors
exports.getAllDoctors = (req, res) => {
  db.query(
    `SELECT employee_id, first_name, last_name FROM EMPLOYEES WHERE role = 'Doctor'`,
    (err, results) => {
      if (err) {
        console.error('Database error:', err); // helpful log
        return res.status(500).json({ error: 'Failed to fetch doctors.' });
      }
      res.json(results);
    }
  );
}