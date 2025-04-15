const db = require("../config/db");

// 1. Get employee profile
exports.getProfileById = (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM EMPLOYEES WHERE employee_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ error: "Employee not found" });
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
    employee_id, // same as specialist
    referral_reason,
    referral_date,
    referral_notes,
    expiration_date,
    specialist_id
  } = req.body;
  console.log(referring_doctor_id);
  // Step 1: Get department_id of referring doctor
  db.query(
    'SELECT department_id FROM EMPLOYEES WHERE employee_id = ?',
    [specialist_id],
    (err, deptResult) => {
      if (err || !deptResult.length) {
        console.error('Error fetching department_id:', err);
        return res.status(500).json({ error: 'Error: Failed to create referral.' });
      }

      const department_id = deptResult[0].department_id;

      // Step 2: Get most recent finished appointment between patient and specialist
      db.query(
        `SELECT appointment_id
         FROM APPOINTMENTS
         WHERE patient_id = ? AND doctor_id = ? AND appointment_status = 'Finished'
         ORDER BY end_time DESC
         LIMIT 1`,
        [patient_id, referring_doctor_id],
        (err, appointmentResult) => {
          if (err || !appointmentResult.length) {
            console.error('Error fetching appointment:', err);
            return res.status(500).json({ error: 'Error looking up appointments' });
          }

          const appointment_id = appointmentResult[0].appointment_id;

          // Step 3: Insert into REFERRALS table
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
              referring_doctor_id,
              appointment_id,
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
                return res.status(500).json({ error: 'Error: Failed to create referral.' });
              }

              res.status(201).json({ message: 'Referral created successfully.' });
            }
          );
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

//6. get all patients
exports.getAllPatients = (req, res) => {
  db.query(
    'SELECT patient_id, first_name, last_name FROM PATIENTS',
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch patients.' });
      res.json(results);
    }
  );
};

// 7. get patient info for receptionist
exports.getPatientInfo = (req, res) => {
  const query = `
  SELECT 
    P.first_name AS patient_first_name,
    P.last_name AS patient_last_name,
    P.email,
    P.phone_num,
    A.start_time,
    A.appointment_status,
    E.first_name AS doctor_first_name,
    E.last_name AS doctor_last_name
  FROM 
      APPOINTMENTS A
  JOIN 
      PATIENTS P ON A.patient_id = P.patient_id
  JOIN 
      DOCTORS D ON A.doctor_id = D.employee_id
  JOIN 
      EMPLOYEES E ON D.employee_id = E.employee_id
  ORDER BY
    A.start_time;
    `;
  db.query(query,(err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.length === 0) return res.status(404).json({ error: "Patient not found" });
      res.json(result);
    }
  );
};

