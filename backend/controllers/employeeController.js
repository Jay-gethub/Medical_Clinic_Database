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

// 2. Update employee profile (complete but only for first/last name, email, phone)
exports.updateProfile = (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, phone} = req.body;
  db.query(
    `UPDATE EMPLOYEES SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE employee_id = ?`,
    [first_name, last_name, email, phone, id],
    (err,result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Employee not found or no changes detected." });
      }

      if (result.changedRows === 0) {
        return res.status(200).json({ message: "No changes were made (data was the same)." });
      }
      const message =
      result.changedRows === 0
        ? "No changes detected — profile was already up to date."
        : "Profile updated successfully.";
    
      res.status(200).json({ message, result });
    });
};

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
};

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
    C.clinic_name,
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
  JOIN
      CLINIC C ON A.clinic_id = C.clinic_id
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

// 8. get all specialist
exports.getSpecialists = (req, res) => {
  const query = `
  SELECT d.employee_id, e.first_name, e.last_name, d.specialization
  FROM DOCTORS d
  JOIN EMPLOYEES e ON d.employee_id = e.employee_id
  WHERE d.specialization IS NOT NULL AND d.specialization != 'Primary Care'
  `;

  db.query(query, (err, results) => {
  if (err) {
    console.error('Error fetching specialists:', err);
    return res.status(500).json({ error: 'Failed to fetch specialists.' });
    }

    res.json(results);
  });
};

// 8. get pending referrals
exports.getPendingReferrals = (req, res) => {
  const specialistId = req.params.id;
  const query = `
    SELECT r.referral_id, r.referral_reason, r.referral_date, r.referral_notes, 
           r.expiration_date, p.first_name, p.last_name
    FROM REFERRALS r
    JOIN PATIENTS p ON r.patient_id = p.patient_id
    WHERE r.specialist_id = ? AND r.referral_status = 'Pending'
  `;

  db.query(query, [specialistId], (err, results) => {
    if (err) {
      console.error('Error fetching referrals:', err);
      return res.status(500).json({ error: 'Failed to fetch referrals.' });
    }
    //console.log(specialistId);
    //console.log(results);

    res.json(results);
  });
};

//9. update referral_status
exports.updateReferralStatus = (req, res) => {
  const referralId = req.params.referralId;
  const { status } = req.body;

  if (!['Approved', 'Declined'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value.' });
  }

  const query = `UPDATE REFERRALS SET referral_status = ? WHERE referral_id = ?`;

  db.query(query, [status, referralId], (err, result) => {
    if (err) {
      console.error('Error updating referral:', err);
      return res.status(500).json({ error: 'Failed to update referral status.' });
    }

    res.json({ message: 'Referral status updated successfully.' });
  });
};

//get patient mediacal record
exports.getPatientMedicalRecord = (req, res) => {
  const patientId = req.params.id;

  const queries = {
    basicInfo: `
      SELECT first_name, last_name, sex, dob
      FROM PATIENTS
      WHERE patient_id = ?
    `,
    allergies: `
      SELECT a.allergy_name, pa.severity, pa.date_recorded
      FROM Patient_Allergies pa
      JOIN ALLERGIES a ON pa.allergy_id = a.allergy_id
      WHERE pa.patient_id = ?
    `,
    immunizations: `
      SELECT i.immunization_name, pi.immunization_date, e.first_name AS administered_by_first_name, e.last_name AS administered_by_last_name
      FROM Patient_Immunizations pi
      JOIN IMMUNIZATIONS i ON pi.immunization_id = i.immunization_id
      LEFT JOIN EMPLOYEES e ON pi.administered_by = e.employee_id
      WHERE pi.patient_id = ? AND pi.shot_status = 'Completed'
    `,
    prescriptions: `
      SELECT prescription_name, dosage
      FROM PRESCRIPTIONS
      WHERE patient_id = ?
    `,
    diagnostics: `
      SELECT dt.test_type, dt.test_date, dt.results, dt.result_date, e.first_name AS doctor_first_name, e.last_name AS doctor_last_name
      FROM DIAGNOSTIC_TESTS dt
      LEFT JOIN EMPLOYEES e ON dt.doctor_id = e.employee_id
      WHERE dt.patient_id = ? AND dt.test_status = 'Completed'
    `
  };

  // Execute all queries in parallel
  Promise.all([
    new Promise((resolve, reject) => db.query(queries.basicInfo, [patientId], (err, result) => err ? reject(err) : resolve(result[0]))),
    new Promise((resolve, reject) => db.query(queries.allergies, [patientId], (err, result) => err ? reject(err) : resolve(result))),
    new Promise((resolve, reject) => db.query(queries.immunizations, [patientId], (err, result) => err ? reject(err) : resolve(result))),
    new Promise((resolve, reject) => db.query(queries.prescriptions, [patientId], (err, result) => err ? reject(err) : resolve(result))),
    new Promise((resolve, reject) => db.query(queries.diagnostics, [patientId], (err, result) => err ? reject(err) : resolve(result))),
  ])
    .then(([basicInfo, allergies, immunizations, prescriptions, diagnostics]) => {
      res.json({
        basicInfo,
        allergies,
        immunizations,
        prescriptions,
        diagnostics
      });
    })
    .catch((err) => {
      console.error('Error fetching medical record:', err);
      res.status(500).json({ error: 'Failed to fetch medical record.' });
    });
};

//get all allergy names
exports.getAllergiesNames = (req, res) => {
  db.query(
    `SELECT allergy_name FROM ALLERGIES `,
    (err, results) => {
      if (err) {
        console.error('Database error:', err); // helpful log
        return res.status(500).json({ error: 'Failed to fetch Allergies.' });
      }
      res.json(results);
    }
  );
};

//get all immunization names
exports.getImmunizationsNames = (req, res) => {
  db.query(
    `SELECT immunization_name FROM IMMUNIZATIONS `,
    (err, results) => {
      if (err) {
        console.error('Database error:', err); // helpful log
        return res.status(500).json({ error: 'Failed to fetch Immunizations.' });
      }
      res.json(results);
    }
  );
};

//add to patients known allergy
exports.createPatientAllergy = (req, res) => {
  const patientId = req.params.id;
  const { allergy_name, severity } = req.body;

  // Step 1: Get allergy_id from allergy_name
  db.query(
    'SELECT allergy_id FROM ALLERGIES WHERE allergy_name = ?',
    [allergy_name],
    (err, results) => {
      if (err) {
        console.error('Error querying allergy_id:', err);
        return res.status(500).json({ error: 'Failed to retrieve allergy_id' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Allergy not found' });
      }

      const allergyId = results[0].allergy_id;

      // Step 2: Insert into Patient_Allergies
      db.query(
        'INSERT INTO Patient_Allergies (patient_id, allergy_id, severity) VALUES (?, ?, ?)',
        [patientId, allergyId, severity],
        (err, insertResult) => {
          if (err) {
            console.error('Error inserting allergy:', err);
            return res.status(500).json({ error: 'Failed to insert allergy' });
          }

          return res.status(201).json({ message: 'Allergy successfully added to patient' });
        }
      );
    }
  );
};

//add to patient immunizations
exports.createPatientImmunization = (req, res) => {
  const patientId = req.params.id;
  const { immunization_name, immunization_date, doctor_id } = req.body;

  if (!immunization_name || !immunization_date || !doctor_id) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  // Step 1: Look up the immunization_id by name
  const immunizationQuery = 'SELECT immunization_id FROM IMMUNIZATIONS WHERE immunization_name = ?';

  db.query(immunizationQuery, [immunization_name], (err, immunizationResults) => {
    if (err) {
      console.error('Error fetching immunization ID:', err);
      return res.status(500).json({ error: 'Internal server error.' });
    }

    if (immunizationResults.length === 0) {
      return res.status(404).json({ error: 'Immunization not found.' });
    }

    const immunizationId = immunizationResults[0].immunization_id;

    // Step 2: Insert into Patient_Immunizations
    const insertQuery = `
      INSERT INTO Patient_Immunizations (patient_id, immunization_id, immunization_date, administered_by)
      VALUES (?, ?, ?, ?)
    `;

    db.query(insertQuery, [patientId, immunizationId, immunization_date, doctor_id], (insertErr, result) => {
      if (insertErr) {
        console.error('Error inserting patient immunization:', insertErr);
        return res.status(500).json({ error: 'Failed to schedule immunization.' });
      }

      res.status(201).json({ message: 'Immunization scheduled successfully.' });
    });
  });
};

//add Prescription
exports.createPrescription = (req, res) => {
  const patientId = req.params.id;
  const { prescription_name, instructions, patient_id, doctor_id, dosage, frequency, refills } = req.body;

  if (!prescription_name || !instructions || !patient_id || !doctor_id || !dosage || !frequency || refills === undefined) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const query = `
    INSERT INTO PRESCRIPTIONS (prescription_name, instructions, patient_id, doctor_id, dosage, frequency, refills)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [prescription_name, instructions, patientId, doctor_id, dosage, frequency, refills],
    (err, result) => {
      if (err) {
        console.error('Error inserting prescription:', err);
        return res.status(500).json({ error: 'Failed to insert prescription.' });
      }

      res.status(201).json({ message: 'Prescription created successfully.' });
    }
  );
};

// get a patient's prescriptions
exports.getPatientPresriptions = (req, res) => {
  const patientId = req.params.id;

  const query = `
    SELECT prescription_name, date_issued, instructions, dosage, frequency, refills
    FROM PRESCRIPTIONS
    WHERE patient_id = ?
    ORDER BY date_issued DESC
  `;

  db.query(query, [patientId], (err, result) => {
    if (err) {
      console.error('Error fetching prescriptions:', err);
      return res.status(500).json({ error: 'Failed to retrieve patient prescriptions' });
    }
    //console.log(result);
    res.status(200).json(result);
  });
};

//get pending immunizations
exports.getPendingImmunizations = (req, res) => {
  const patientId = req.params.id;

  const query = `
    SELECT 
      i.immunization_id,
      i.immunization_name,
      pi.immunization_date,
      pi.shot_status
    FROM 
      Patient_Immunizations pi
    JOIN 
      IMMUNIZATIONS i ON pi.immunization_id = i.immunization_id
    WHERE 
      pi.patient_id = ? AND pi.shot_status = 'Pending'
    ORDER BY 
      pi.immunization_date DESC
  `;

  db.query(query, [patientId], (err, results) => {
    if (err) {
      console.error('Error fetching pending immunizations:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json(results);
  });
};

// order diagnostics
exports.OrderDiagnostic = (req, res) => {
  const patientId = req.params.id;
  const { test_type, test_date, doctor_id } = req.body;

  if (!test_type || !test_date || !doctor_id) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const query = `
      INSERT INTO DIAGNOSTIC_TESTS (patient_id, test_type, test_date, doctor_id)
      VALUES (?, ?, ?, ?)
    `;

    db.query(query, [patientId, test_type, test_date, doctor_id]);

    res.status(200).json({ message: 'Diagnostic test ordered successfully.' });
  } catch (err) {
    console.error('Error ordering diagnostic test:', err);
    res.status(500).json({ error: 'Failed to order diagnostic test.' });
  }
};

//get pending diagnostics
exports.getPendingDiagnostics = (req, res) => {
  const patientId = req.params.id;

  const query = `
    SELECT test_type, test_date 
    FROM medical_clinic.DIAGNOSTIC_TESTS 
    WHERE patient_id = ?;
  `;

  db.query(query, [patientId], (err, results) => {
    if (err) {
      console.error('Error fetching pending diagnostics:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.json(results);
  });
};
