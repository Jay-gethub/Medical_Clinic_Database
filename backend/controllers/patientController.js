const db = require("../config/db");


// 1. Get patient profile
exports.getProfile = (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT p.*, a.*, ec.contact_first_name, ec.contact_last_name, ec.relationship, ec.phone
    FROM PATIENTS p
    JOIN ADDRESS a ON p.address_id = a.address_id
    LEFT JOIN EMERGENCY_CONTACT ec ON p.patient_id = ec.patient_id
    WHERE p.patient_id = ?
  `;
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result[0]);
  });
};
exports.getPatientByUsername = (req, res) => {
  const { username } = req.params;
  const sql = `
    SELECT p.patient_id
    FROM PATIENTS p
    JOIN USER_CREDENTIALS u ON p.user_id = u.user_id
    WHERE u.username = ?
  `;
  db.query(sql, [username], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ error: "Patient not found" });
    res.json({ patient_id: result[0].patient_id });
  });
};

// 2. Update patient profile
exports.updateProfile = (req, res) => {
  const {
    first_name, last_name, dob, phone_num, email, sex,
    street_num, street_name, postal_code, city, state,
    emergency_first_name, emergency_last_name, emergency_relationship, emergency_phone
  } = req.body;
  const { id } = req.params;

  // Step 1: Get address_id of the patient
  db.query("SELECT address_id FROM PATIENTS WHERE patient_id = ?", [id], (err, result) => {
    if (err || result.length === 0) {
      return res.status(500).json({ error: "Failed to get address ID", details: err });
    }

    const address_id = result[0].address_id;

    // Step 2: Update PATIENTS table
    db.query(
      `UPDATE PATIENTS 
       SET first_name = ?, last_name = ?, dob = ?, phone_num = ?, email = ?, sex = ? 
       WHERE patient_id = ?`,
      [first_name, last_name, dob, phone_num, email, sex, id],
      (err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to update patient", details: err });
        }

        // Step 3: Update ADDRESS table
        db.query(
          `UPDATE ADDRESS 
           SET street_num = ?, street_name = ?, postal_code = ?, city = ?, state = ? 
           WHERE address_id = ?`,
          [street_num, street_name, postal_code, city, state, address_id],
          (err) => {
            if (err) {
              return res.status(500).json({ error: "Failed to update address", details: err });
            }

            // Step 4: Conditionally update EMERGENCY_CONTACT
            if (
              emergency_first_name &&
              emergency_last_name &&
              emergency_relationship &&
              emergency_phone
            ) {
              const upsertEC = `
                INSERT INTO EMERGENCY_CONTACT 
                  (patient_id, contact_first_name, contact_last_name, relationship, phone)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                  contact_first_name = ?, contact_last_name = ?, relationship = ?, phone = ?
              `;
              db.query(
                upsertEC,
                [
                  id, emergency_first_name, emergency_last_name, emergency_relationship, emergency_phone,
                  emergency_first_name, emergency_last_name, emergency_relationship, emergency_phone
                ],
                (err) => {
                  if (err) {
                    return res.status(500).json({ error: "Failed to update emergency contact", details: err });
                  }

                  return res.json({ message: "Profile updated successfully" });
                }
              );
            } else {
              // No emergency contact info provided, just complete update
              return res.json({ message: "Profile updated successfully (no emergency contact changes)" });
            }
          }
        );
      }
    );
  });
};




// 3. Get insurance
exports.getInsurance = (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM INSURANCE_PLAN WHERE patient_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result[0]);
  });
};

// 4. Update insurance
exports.updateInsurance = (req, res) => {
  const { id } = req.params; // this is patient_id, not insurance_id
  const { provider_name, policy_number, covrage_details, effective_from, effective_to } = req.body;

  const upsertInsurance = `
    INSERT INTO INSURANCE_PLAN 
    (patient_id, provider_name, policy_number, covrage_details, effective_from, effective_to)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
    provider_name = ?, policy_number = ?, covrage_details = ?, effective_from = ?, effective_to = ?
  `;

  db.query(
    upsertInsurance,
    [
      id, provider_name, policy_number, covrage_details, effective_from, effective_to,
      provider_name, policy_number, covrage_details, effective_from, effective_to
    ],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Insurance updated successfully" });
    }
  );
};

//delete insurance
exports.deleteInsurance = (req, res) => {
  const { id } = req.params; // patient_id
  const sql = "DELETE FROM INSURANCE_PLAN WHERE patient_id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Insurance record deleted successfully" });
  });
};


// 5. Get bills
exports.getBills = (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM BILLING WHERE patient_id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

// 6. Pay bill (simulate)
exports.markBillPaid = (req, res) => {
  const { billing_id } = req.params;
  const { payment_method } = req.body;
  db.query(
    `UPDATE BILLING SET payment_status = 'Paid', payment_method = ?, payment_date = NOW() WHERE billing_id = ?`,
    [payment_method, billing_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Bill marked as paid" });
    }
  );
};

// 7. Get immunizations
exports.getImmunizations = (req, res) => {
  const { id } = req.params;
  db.query(
    `SELECT * FROM PATIENT_IMMUNIZATIONS JOIN IMMUNIZATIONS USING(immunization_id) WHERE patient_id = ?`,
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
};

// 8. Add immunization
exports.addImmunization = (req, res) => {
  const { patient_id, immunization_id, date_administered } = req.body;
  db.query(
    `INSERT INTO PATIENT_IMMUNIZATIONS (patient_id, immunization_id, date_administered) VALUES (?, ?, ?)`,
    [patient_id, immunization_id, date_administered],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Immunization added" });
    }
  );
};

// 9. Get diagnostics
exports.getDiagnostics = (req, res) => {
  const { id } = req.params;
  db.query(
    `SELECT * FROM DIAGNOSTIC_TESTS WHERE patient_id = ?`,
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
};

// 10. Get prescriptions
exports.getPrescriptions = (req, res) => {
  const { id } = req.params;
  db.query(
    `SELECT * FROM PRESCRIPTIONS WHERE patient_id = ?`,
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
};

// 11. Get medical records
exports.getMedicalRecords = (req, res) => {
  const { id } = req.params;
  db.query(
    `SELECT * FROM MEDICAL_RECORDS WHERE patient_id = ?`,
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
};

// 11. Get referrals
exports.getReferrals = (req, res) => {
  const { id } = req.params;
  //console.log(`SELECT * FROM REFERRALS WHERE patient_id = ${id}`);
  db.query(
    `SELECT 
       r.referral_id,
       r.patient_id,
       r.specialist_id,
       r.department_id,
       r.employee_id,
       r.appointment_id,
       r.referring_doctor_id,
       CONCAT(e.first_name, ' ', e.last_name) AS referring_doctor_name,
       r.referral_reason,
       r.referral_date,
       r.referral_status,
       r.referral_notes,
       r.expiration_date
     FROM REFERRALS r
     JOIN EMPLOYEES e ON r.referring_doctor_id = e.employee_id
     WHERE r.patient_id = ?`,
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      console.log('Query result:', result);
      res.json(result);
    }
  );

};

// Add self-reported medication
exports.addSelfMedication = (req, res) => {
  const db = req.app.get("db");
  const { patient_id, name, dosage } = req.body;

  if (!patient_id || !name) {
    return res.status(400).json({ error: "Patient ID and medication name are required" });
  }

  const sql = `
    INSERT INTO SELF_REPORTED_MEDICATIONS (patient_id, name, dosage)
    VALUES (?, ?, ?)
  `;
  db.query(sql, [patient_id, name, dosage], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: "Self-reported medication added successfully!" });
  });
};

// Get all self-reported medications for a patient
exports.getSelfMedications = (req, res) => {
  const { id } = req.params;
  const db = req.app.get("db");

  db.query("SELECT * FROM SELF_REPORTED_MEDICATIONS WHERE patient_id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Update self-reported medication
exports.updateSelfMedication = (req, res) => {
  const { medication_id } = req.params;
  const { name, dosage } = req.body;
  const db = req.app.get("db");

  if (!name) {
    return res.status(400).json({ error: "Medication name is required" });
  }

  const sql = `
    UPDATE SELF_REPORTED_MEDICATIONS
    SET name = ?, dosage = ?
    WHERE medication_id = ?
  `;
  db.query(sql, [name, dosage, medication_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: "Medication updated successfully!" });
  });
};


// Delete self-reported medication
exports.deleteMedication = (req, res) => {
  const medicationId = req.params.medicationId;

  db.query(
    'DELETE FROM SELF_REPORTED_MEDICATIONS WHERE medication_id = ?',
    [medicationId],
    (err, result) => {
      if (err) {
        console.error('Error deleting medication:', err);
        return res.status(500).json({ error: 'Failed to delete medication' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Medication not found' });
      }

      res.status(200).json({ message: 'Medication deleted successfully' });
    }
  );
};


// Add family history record
exports.addFamilyHistory = (req, res) => {
  const db = req.app.get("db");
  const { patient_id, condition_name, relationship, comments } = req.body;

  if (!patient_id || !condition_name) {
    return res.status(400).json({ error: "Patient ID and condition name are required" });
  }

  const sql = `
    INSERT INTO FAMILY_HISTORY (patient_id, condition_name, relationship, comments)
    VALUES (?, ?, ?, ?)
  `;
  db.query(sql, [patient_id, condition_name, relationship, comments], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: "Family history added successfully!" });
  });
};

// Get all family history records for a patient
exports.getFamilyHistory = (req, res) => {
  const { id } = req.params;
  const db = req.app.get("db");

  db.query("SELECT * FROM FAMILY_HISTORY WHERE patient_id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Update family history
exports.updateFamilyHistory = (req, res) => {
  const { fh_id } = req.params;
  const { condition_name, relationship, comments } = req.body;
  const db = req.app.get("db");

  const sql = `
    UPDATE FAMILY_HISTORY
    SET condition_name = ?, relationship = ?, comments = ?
    WHERE fh_id = ?
  `;
  db.query(sql, [condition_name, relationship, comments, fh_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: "Family history updated successfully!" });
  });
};

// Delete family history record
exports.deleteFamilyHistory = (req, res) => {
  const { fh_id } = req.params;

  const query = `DELETE FROM FAMILY_HISTORY WHERE fh_id = ?`;
  req.app.get("db").query(query, [fh_id], (err) => {
    if (err) return res.status(500).json({ error: "Failed to delete family history" });
    res.json({ message: "Family history deleted successfully" });
  });
};


// 1. Get all allergy names (for dropdown)
exports.getAllergyNames = (req, res) => {
  const query = 'SELECT allergy_name FROM ALLERGIES';
  req.app.get("db").query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch allergy names' });
    res.json(results);
  });
};

// 2. Get all allergies for a patient
exports.getPatientAllergies = (req, res) => {
  const { id } = req.params;
  const db = req.app.get("db");
  const query = `
    SELECT pa.patient_id, pa.allergy_id, a.allergy_name, pa.severity, pa.date_recorded
    FROM Patient_Allergies pa
    JOIN ALLERGIES a ON pa.allergy_id = a.allergy_id
    WHERE pa.patient_id = ?
  `;
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch patient allergies' });
    res.json(results);
  });
};

// 3. Add allergy for patient
exports.createPatientAllergy = (req, res) => {
  const { allergy_name, severity } = req.body;
  const { patient_id } = req.params;
  const db = req.app.get("db");

  const allergyIdQuery = 'SELECT allergy_id FROM ALLERGIES WHERE allergy_name = ?';
  db.query(allergyIdQuery, [allergy_name], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: 'Allergy not found' });

    const allergy_id = results[0].allergy_id;

    const insertQuery = `
      INSERT INTO Patient_Allergies (patient_id, allergy_id, severity)
      VALUES (?, ?, ?)
    `;

    db.query(insertQuery, [patient_id, allergy_id, severity], (err2) => {
      if (err2) return res.status(500).json({ error: 'Failed to insert allergy' });
      res.status(201).json({ message: 'Allergy added successfully' });
    });
  });
};

// 4. Update allergy for patient
exports.updatePatientAllergy = (req, res) => {
  const { patient_id, original_allergy_id } = req.params;
  const { allergy_name, severity } = req.body;
  const db = req.app.get("db");

  const allergyIdQuery = 'SELECT allergy_id FROM ALLERGIES WHERE allergy_name = ?';
  db.query(allergyIdQuery, [allergy_name], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: 'Allergy not found' });

    const new_allergy_id = results[0].allergy_id;

    const updateQuery = `
      UPDATE Patient_Allergies
      SET allergy_id = ?, severity = ?
      WHERE patient_id = ? AND allergy_id = ?
    `;
    db.query(updateQuery, [new_allergy_id, severity, patient_id, original_allergy_id], (err2) => {
      if (err2) return res.status(500).json({ error: 'Failed to update allergy' });
      res.status(200).json({ message: 'Allergy updated successfully' });
    });
  });
};

// 5. Delete allergy from patient
exports.deletePatientAllergy = (req, res) => {
  const { patient_id, allergy_id } = req.params;
  const db = req.app.get("db");

  const deleteQuery = `
    DELETE FROM Patient_Allergies
    WHERE patient_id = ? AND allergy_id = ?
  `;
  db.query(deleteQuery, [patient_id, allergy_id], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to delete allergy' });
    res.status(200).json({ message: 'Allergy deleted successfully' });
  });
};
//unseen notifications
exports.getNotifications = (req, res) => {
  const { id } = req.params; // patient_id
  const sql = `
    SELECT notification_id, message, created_at
    FROM NOTIFICATIONS
    WHERE patient_id = ? AND is_seen = 0
    ORDER BY created_at DESC
  `;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
exports.markNotificationsAsSeen = (req, res) => {
  const { notificationIds } = req.body; // array of notification IDs

  if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
    return res.status(400).json({ error: "Invalid or empty notification ID list" });
  }

  const sql = `
    UPDATE NOTIFICATIONS
    SET is_seen = 1
    WHERE notification_id IN (?)
  `;

  db.query(sql, [notificationIds], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Notifications marked as seen" });
  });
};
