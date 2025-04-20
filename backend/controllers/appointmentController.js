
const db = require('../config/db');

// Get doctors by clinic ID
exports.getDoctorsByClinic = (req, res) => {
  const clinicId = req.params.clinicId;

  db.query(
    `SELECT 
       d.employee_id, 
       e.first_name, 
       e.last_name, 
       e.sex, 
       d.specialization, 
       d.department_id, 
       dept.department_name
     FROM DOCTORS d
     JOIN EMPLOYEES e ON d.employee_id = e.employee_id
     JOIN DEPARTMENTS dept ON d.department_id = dept.department_id
     WHERE d.clinic_id = ?`,
    [clinicId], 
    (error, doctors) => {
      if (error) {
        console.error("Error fetching doctors:", error);
        return res.status(500).json({ error: "Failed to fetch doctors by clinic" });
      }
      res.status(200).json(doctors);
    }
  );
};

exports.getAllAppointments = (req, res) => {
  db.query("SELECT * FROM APPOINTMENTS", (error, appointments) => {
    if (error) {
      return res.status(500).json({ error: "Unable to fetch appointments." });
    }
    res.json(appointments);
  });
};

exports.getAppointmentById = (req, res) => {
  db.query("SELECT * FROM APPOINTMENTS WHERE doctor_id = ?", [req.params.id], (error, appointment) => {
  if (error) {
    return res.status(500).json({ error: "Unable to fetch appointment." });
  }
  
  if (appointment.length === 0) {
    return res.status(404).json({ message: "Appointment not found." });
  }
  
  res.json(appointment[0]);
});
};

exports.createAppointment = (req, res) => {
  const { doctor_id, clinic_id, start_time, end_time, appointment_type, appointment_status } = req.body;
  const created_by = req.user.user_id;

  if (req.user.role !== "Patient") {
    return res.status(403).json({ error: "Only patients can create appointments" });
  }

  if (!doctor_id || !clinic_id || !start_time || !end_time || !appointment_type || !appointment_status) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const startTime = new Date(start_time);
const endTime = new Date(end_time);

// If timezoneOffset is provided, adjust for timezone
if (req.body.timezoneOffset) {
  // Subtract the offset because getTimezoneOffset returns minutes BEHIND UTC
  startTime.setMinutes(startTime.getMinutes() - req.body.timezoneOffset);
  endTime.setMinutes(endTime.getMinutes() - req.body.timezoneOffset);
}
  if (startTime >= endTime) {
    return res.status(400).json({ error: "Start time must be before end time." });
  }

  const now = new Date();
  if (startTime < now) {
    return res.status(400).json({ error: "Appointment time must be in the future." });
  }

  // Fetch patient_id using the user_id
  db.query("SELECT patient_id FROM PATIENTS WHERE user_id = ?", [created_by], (error, patient) => {
    if (error || !patient.length) {
      console.error(error);
      return res.status(404).json({ error: "Patient not found." });
    }

    const patient_id = patient[0].patient_id;

    // Validate doctor
    db.query("SELECT employee_id FROM DOCTORS WHERE employee_id = ?", [doctor_id], (error, doctor) => {
      if (error || !doctor.length) {
        return res.status(404).json({ error: "Doctor not found." });
      }

      //Validate clinic
      db.query("SELECT clinic_id FROM CLINIC WHERE clinic_id = ?", [clinic_id], (error, clinic) => {
        if (error || !clinic.length) {
          return res.status(404).json({ error: "Clinic not found." });
        }

        // Check for time conflict
        db.query(
          "SELECT * FROM APPOINTMENTS WHERE doctor_id = ? AND ((start_time BETWEEN ? AND ?) OR (end_time BETWEEN ? AND ?))",
          [doctor_id, startTime, endTime, startTime, endTime],
          (error, existingAppointments) => {
            if (error) return res.status(500).json({ error: "Unable to check appointment conflicts." });

            if (existingAppointments.length > 0) {
              return res.status(400).json({ error: "Doctor is already booked for this time." });
            }

            // Referral check if specialist
            if (appointment_type === "Specialist") {
              db.query(
                `SELECT * FROM REFERRALS WHERE patient_id = ? AND specialist_id = ? AND referral_status != 'Declined'`,
                [patient_id, doctor_id],
                (error, referral) => {
                  if (error) return res.status(500).json({ error: "Referral check failed." });

                  if (!referral.length) {
                    return res.status(403).json({ error: "A valid referral is required for a specialist appointment." });
                  }

                  linkDoctorAndInsert(patient_id);
                }
              );
            } else {
              linkDoctorAndInsert(patient_id);
            }

            // Doctor-patient relationship check + insert
            function linkDoctorAndInsert(patient_id) {
              db.query(
                "SELECT * FROM Doctor_Patient WHERE doctor_id = ? AND patient_id = ?",
                [doctor_id, patient_id],
                (error, relation) => {
                  if (error) return res.status(500).json({ error: "Doctor-patient check failed." });

                  if (relation.length === 0) {
                    db.query(
                      "INSERT INTO Doctor_Patient (doctor_id, patient_id, assignment_date) VALUES (?, ?, NOW())",
                      [doctor_id, patient_id],
                      (err) => {
                        if (err) return res.status(500).json({ error: "Failed to link doctor and patient." });
                        insertAppointment(patient_id);
                      }
                    );
                  } else {
                    insertAppointment(patient_id);
                  }
                }
              );
            }

            // Final insert into appointments
            function insertAppointment(patient_id) {
              db.query(
                `INSERT INTO APPOINTMENTS 
                (patient_id, doctor_id, clinic_id, start_time, end_time, appointment_type, appointment_status, created_at, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
                [patient_id, doctor_id, clinic_id, startTime, endTime, appointment_type, appointment_status, created_by],
                (error, result) => {
                  
                  if (error) {
                    console.error('Insert Error:', error);
                    return res.status(500).json({ error: "Unable to create an appointment." });
                  }

                  res.status(201).json({
                    id: result.insertId,
                    message: "Appointment created successfully.",
                  });
                }
              );
            }
          }
        );
      });
    });
  });
};

exports.updateAppointment = (req, res) => {
  const { appointment_id } = req.params;
  const { patient_id, doctor_id, clinic_id, start_time, end_time, reason, appointment_status } = req.body;

  // Step 1: Check if the appointment exists and retrieve `created_by`
  db.query("SELECT * FROM APPOINTMENTS WHERE appointment_id = ?", [appointment_id], (error, appointment) => {
    if (error) {
      console.error("Error updating appointment:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
    
    if (!appointment.length) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    
    const created_by = appointment[0].created_by; // Preserve the original creator
    
    // Prevent updates if the appointment is already "Canceled" or "Finished"
    if (["Canceled", "Finished"].includes(appointment[0].appointment_status)) {
      return res.status(403).json({ error: "Cannot update a canceled or finished appointment" });
    }
    
    // Validate required fields
    if (!patient_id || !doctor_id || !clinic_id || !start_time || !end_time || !appointment_status) {
      return res.status(400).json({ error: "Missing required fields. Ensure all attributes are provided." });
    }
    
    // Ensure start_time is before end_time
    const startTime = new Date(start_time);
    const endTime = new Date(end_time);
    if (startTime >= endTime) {
      return res.status(400).json({ error: "Start time must be before end time" });
    }
    
    // Step 2: Check for doctor schedule conflicts
    const checkQuery = `
      SELECT * FROM APPOINTMENTS 
      WHERE doctor_id = ? 
      AND appointment_id != ?  -- Ensure we don't compare against the same appointment
      AND ((start_time BETWEEN ? AND ?) OR (end_time BETWEEN ? AND ?))
    `;
    
    db.query(checkQuery, [doctor_id, appointment_id, start_time, end_time, start_time, end_time], (error, existingAppointments) => {
      if (error) {
        console.error("Error updating appointment:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
      
      if (existingAppointments.length > 0) {
        return res.status(409).json({ error: "Doctor is already booked for this time slot" });
      }
      
      // Step 3: Update the appointment details, keeping `created_by` unchanged
      const updateQuery = `
        UPDATE APPOINTMENTS 
        SET patient_id = ?, doctor_id = ?, clinic_id = ?, start_time = ?, end_time = ?, reason = ?, appointment_status = ?, created_by = ?
        WHERE appointment_id = ?
      `;
      
      db.query(updateQuery, [patient_id, doctor_id, clinic_id, start_time, end_time, reason, appointment_status, created_by, appointment_id], (error) => {
        if (error) {
          console.error("Error updating appointment:", error);
          return res.status(500).json({ error: "Internal server error" });
        }
        
        res.status(200).json({ message: "Appointment updated successfully" });
      });
    });
  });
};

// exports.cancelAppointment = (req, res) => {
//   const { appointment_id } = req.params;

//   // Step 1: Retrieve the appointment details
//   db.query("SELECT * FROM APPOINTMENTS WHERE appointment_id = ?", [appointment_id], (error, appointment) => {
//     if (error) {
//       console.error("Error canceling appointment:", error);
//       return res.status(500).json({ error: "Internal server error" });
//     }
    
//     if (!appointment.length) {
//       return res.status(404).json({ error: "Appointment not found" });
//     }
    
//     const { patient_id, start_time, appointment_status, created_by } = appointment[0];
    
//     // Ensure only the patient who booked the appointment can cancel it
//     if (req.user.role === "Patient" && created_by !== req.user.patient_id) {
//       return res.status(403).json({ error: "You can only cancel your own appointments" });
//     }
    
//     // Prevent cancellation of already canceled or finished appointments
//     if (["Canceled", "Finished"].includes(appointment_status)) {
//       return res.status(403).json({ error: "Cannot cancel an appointment that is already canceled or finished" });
//     }
    
//     // Step 2: Check if cancellation is within 24 hours
//     const now = new Date();
//     const appointmentStartTime = new Date(start_time);
//     const hoursDifference = (appointmentStartTime - now) / (1000 * 60 * 60); // Convert milliseconds to hours
    
//     let fineAmount = 0;
//     if (hoursDifference < 24) {
//       fineAmount = 25; // Minimum fine of $25
//     }
    
//     // Step 3: Update appointment_status to "Canceled"
//     const updateQuery = "UPDATE APPOINTMENTS SET appointment_status = 'Canceled' WHERE appointment_id = ?";
//     db.query(updateQuery, [appointment_id], (error) => {
//       if (error) {
//         console.error("Error canceling appointment:", error);
//         return res.status(500).json({ error: "Internal server error" });
//       }
      
//       // Step 4: If a fine applies, update the patient's billing total_amount
//       if (fineAmount > 0) {
//         const billingQuery = `
//           UPDATE BILLING 
//           SET total_amount = total_amount + ? 
//           WHERE patient_id = ?
//         `;
        
//         db.query(billingQuery, [fineAmount, patient_id], (error) => {
//           if (error) {
//             console.error("Error applying fine:", error);
//             // Continue with success response even if applying the fine fails
//           }
          
//           completeResponse();
//         });
//       } else {
//         completeResponse();
//       }
      
//       function completeResponse() {
//         res.status(200).json({
//           message: "Appointment canceled successfully",
//           fine: fineAmount > 0 ? `A fine of $${fineAmount} has been added to your billing account.` : "No fine applied."
//         });
//       }
//     });
//   });
// };

// exports.getAppointmentsByPatient = (req, res) => {
//   // Get patient_id from authenticated user
//   const patientId = req.user.patient_id;
  
//   // Log for debugging
//   console.log("Fetching appointments for patient:", patientId);

//   // Check if patientId exists
//   if (!patientId) {
//     console.error("No patient_id found in request");
//     return res.status(400).json({ error: "Patient ID is required" });
//   }

//   const query = `
//     SELECT a.*, d.first_name AS doctor_first_name, d.last_name AS doctor_last_name
//     FROM APPOINTMENTS a
//     LEFT JOIN EMPLOYEE d ON a.doctor_id = d.employee_id
//     WHERE a.patient_id = ?
//     ORDER BY a.start_time DESC
//   `;

//   // Execute query with error handling
//   db.query(query, [patientId], (error, results) => {
//     if (error) {
//       console.error("Database error fetching appointments:", error);
//       return res.status(500).json({ error: "Failed to fetch appointments" });
//     }

//     // Convert dates to ISO strings for consistent parsing in frontend
//     const appointments = results.map(appt => ({
//       ...appt,
//       start_time: appt.start_time instanceof Date ? appt.start_time.toISOString() : appt.start_time,
//       end_time: appt.end_time instanceof Date ? appt.end_time.toISOString() : appt.end_time
//     }));

//     console.log(`Found ${appointments.length} appointments for patient ${patientId}`);
//     res.json(appointments);
//   });
// };
// exports.getAppointmentsByPatient = (req, res) => {
//   console.log("Request user object:", req.user);
  
//   // Get user_id from authentication
//   const user_id = req.user?.user_id;
  
//   if (!user_id) {
//     console.error("No user_id found in request");
//     return res.status(400).json({ error: "Authentication error. Please log in again." });
//   }

//   // First, get the patient_id from the user_id
//   db.query("SELECT patient_id FROM PATIENTS WHERE user_id = ?", [user_id], (error, patient) => {
//     if (error) {
//       console.error("Database error looking up patient:", error);
//       return res.status(500).json({ error: "Failed to fetch patient information" });
//     }
    
//     if (!patient || patient.length === 0) {
//       console.error("No patient found for user_id:", user_id);
//       return res.status(404).json({ error: "Patient record not found" });
//     }
    
//     const patient_id = patient[0].patient_id;
//     console.log("Found patient_id:", patient_id, "for user_id:", user_id);

//     // Now get the appointments
//     const query = `
//       SELECT a.*, d.first_name AS doctor_first_name, d.last_name AS doctor_last_name
//       FROM APPOINTMENTS a
//       LEFT JOIN EMPLOYEE d ON a.doctor_id = d.employee_id
//       WHERE a.patient_id = ?
//       ORDER BY a.start_time DESC
//     `;

//     db.query(query, [patient_id], (error, results) => {
//       if (error) {
//         console.error("Database error fetching appointments:", error);
//         return res.status(500).json({ error: "Failed to fetch appointments" });
//       }

//       // Convert dates to ISO strings for consistent parsing in frontend
//       const appointments = results.map(appt => ({
//         ...appt,
//         start_time: appt.start_time instanceof Date ? appt.start_time.toISOString() : appt.start_time,
//         end_time: appt.end_time instanceof Date ? appt.end_time.toISOString() : appt.end_time
//       }));

//       console.log(`Found ${appointments.length} appointments for patient ${patient_id}`);
//       res.json(appointments);
//     });
//   });
// };
exports.getAppointmentsByPatient = (req, res) => {
  const patient_id = req.query.patientId;

  if (!patient_id) {
    return res.status(400).json({ error: "Missing patient ID in request." });
  }

  const query = `
    SELECT a.*, d.first_name AS doctor_first_name, d.last_name AS doctor_last_name
    FROM APPOINTMENTS a
    LEFT JOIN EMPLOYEES d ON a.doctor_id = d.employee_id
    WHERE a.patient_id = ?
    ORDER BY a.start_time DESC
  `;

  db.query(query, [patient_id], (error, results) => {
    if (error) {
      console.error("Error fetching appointments:", error);
      return res.status(500).json({ error: "Failed to fetch appointments" });
    }

    const appointments = results.map(appt => ({
      ...appt,
      start_time: new Date(appt.start_time).toISOString(),
      end_time: new Date(appt.end_time).toISOString()
    }));

    res.json(appointments);
  });
};

exports.cancelAppointment = (req, res) => {
  const { appointment_id } = req.params;
  const { patientId } = req.body;

  if (!patientId) {
    return res.status(400).json({ error: "Missing patient ID." });
  }

  // Step 1: Fetch appointment
  db.query("SELECT * FROM APPOINTMENTS WHERE appointment_id = ?", [appointment_id], (error, appointment) => {
    if (error) {
      console.error("Error fetching appointment:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!appointment.length) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const { patient_id: appt_patient_id, start_time, appointment_status } = appointment[0];

    // Step 2: Authorization check — make sure it's their appointment
    if (appt_patient_id != patientId) {
      return res.status(403).json({ error: "You can only cancel your own appointments." });
    }

    // Step 3: Prevent invalid cancels
    if (["Canceled", "Finished"].includes(appointment_status)) {
      return res.status(403).json({ error: "Cannot cancel an appointment that is already canceled or finished." });
    }

    // Step 4: Just cancel — trigger will handle fine
    db.query(
      "UPDATE APPOINTMENTS SET appointment_status = 'Canceled' WHERE appointment_id = ?",
      [appointment_id],
      (error) => {
        if (error) {
          console.error("Error updating appointment:", error);
          return res.status(500).json({ error: "Failed to cancel appointment." });
        }

        res.status(200).json({
          message: "Appointment canceled successfully.",
          note: "If this cancellation occurred within 24 hours, a fine may be applied by the system.",
        });
      }
    );
  });
};

exports.deleteAppointment = (req, res) => {
  const { appointment_id } = req.params;

  // Check if the appointment exists
  db.query("SELECT * FROM APPOINTMENTS WHERE appointment_id = ?", [appointment_id], (error, appointment) => {
    if (error) {
      console.error("Error deleting appointment:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
    
    if (!appointment.length) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    
    // Ensure only a receptionist or admin can delete
    if (!["Receptionist", "Admin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Only receptionists or admins can delete appointments" });
    }
    
    // Delete the appointment
    const deleteQuery = "DELETE FROM APPOINTMENTS WHERE appointment_id = ?";
    db.query(deleteQuery, [appointment_id], (error) => {
      if (error) {
        console.error("Error deleting appointment:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
      
      res.status(200).json({ message: "Appointment deleted successfully" });
    });
  });
};

exports.checkInPatient = (req, res) => {
  const { appointment_id } = req.params;
  const check_in_time = new Date();
  
  db.query("SELECT * FROM APPOINTMENTS WHERE appointment_id = ?", [appointment_id], (error, appointment) => {
    if (error) {
      console.error("Error checking in patient:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
    
    if (!appointment.length) {
      return res.status(404).json({ error: "Unable to find appointment." });
    }
    
    // Ensure only a receptionist can check in a patient
    if (req.user.role !== "Receptionist") {
      return res.status(403).json({ error: "Only receptionists can check in patients" });
    }
    
    // Update check-in time
    const updateQuery = "UPDATE APPOINTMENTS SET patient_check_in_time = ? WHERE appointment_id = ?";
    db.query(updateQuery, [check_in_time, appointment_id], (error) => {
      if (error) {
        console.error("Error checking in patient:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
      
      res.status(200).json({ message: "Patient checked in successfully", check_in_time });
    });
  });
};

exports.checkOutPatient = (req, res) => {
  const { appointment_id } = req.params;
  const check_out_time = new Date();
  
  db.query("SELECT * FROM APPOINTMENTS WHERE appointment_id = ?", [appointment_id], (error, appointment) => {
    if (error) {
      console.error("Error checking out patient:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
    
    if (!appointment.length) {
      return res.status(404).json({ error: "Unable to find appointment." });
    }
    
    // Ensure only a receptionist can check out a patient
    if (req.user.role !== "Receptionist") {
      return res.status(403).json({ error: "Only receptionists can check out patients" });
    }
    
    // Update check-out time and mark appointment as Finished
    const updateQuery = "UPDATE APPOINTMENTS SET patient_check_out_time = ?, appointment_status = 'Finished' WHERE appointment_id = ?";
    db.query(updateQuery, [check_out_time, appointment_id], (error) => {
      if (error) {
        console.error("Error checking out patient:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
      
      res.status(200).json({ message: "Patient checked out successfully", check_out_time });
    });
  });
};

exports.getAppointmentsByStatus = (req, res) => {
  const { status } = req.query;
  
  db.query(
    "SELECT * FROM APPOINTMENTS WHERE appointment_status = ?",
    [status],
    (error, appointments) => {
      if (error) {
        console.error("Error fetching appointments:", error);
        return res.status(500).json({ error: "Unable to fetch appointments by status." });
      }
      
      res.status(200).json(appointments);
    }
  );
};

exports.checkReferralValidity = (req, res) => {
  const { patientId, doctorId } = req.query;

  if (!patientId || !doctorId) {
    return res.status(400).json({ error: "Missing patientId or doctorId." });
  }

  const query = `
    SELECT * FROM REFERRALS
    WHERE patient_id = ? AND specialist_id = ? AND referral_status != 'Declined'
  `;

  db.query(query, [patientId, doctorId], (err, results) => {
    if (err) {
      console.error("Referral check failed:", err);
      return res.status(500).json({ error: "Internal server error." });
    }

    res.json({ valid: results.length > 0 });
  });
};

//get appointment by doctor_id 
exports.getAppointmentByDoctor = (req, res) => {
  const doctorId = req.params.doctorId;

  const query = `
    SELECT a.appointment_id, a.start_time, p.first_name, p.last_name
    FROM APPOINTMENTS a
    JOIN PATIENTS p ON a.patient_id = p.patient_id
    JOIN REFERRALS r ON r.patient_id = a.patient_id AND r.specialist_id = a.doctor_id
    WHERE a.doctor_id = ? AND r.referral_status = 'Pending'
  `;

  db.query(query, [doctorId], (err, results) => {
    if (err) {
      console.error('Error fetching referred appointments:', err);
      return res.status(500).json({ error: 'Failed to fetch referred appointments.' });
    }

    res.json(results);
  });
};

exports.getDoctorAppointments = (req, res) => {
  const doctorId = req.params.doctorId;

  const query = `
    SELECT 
      a.appointment_id,
      a.start_time,
      a.end_time,
      a.appointment_status,
      a.appointment_type,
      p.patient_id,
      p.first_name AS patient_first_name,
      p.last_name AS patient_last_name
    FROM APPOINTMENTS a
    JOIN PATIENTS p ON a.patient_id = p.patient_id
    WHERE a.doctor_id = ?
    ORDER BY a.start_time ASC
  `;

  db.query(query, [doctorId], (error, results) => {
    if (error) {
      console.error("Error fetching doctor appointments:", error);
      return res.status(500).json({ error: "Failed to retrieve appointments" });
    }
    res.json(results);
  });
};

exports.getBookedSlotsForDoctor = (req, res) => {
  const { doctorId, date } = req.params;

  const query = `
    SELECT start_time, end_time
    FROM APPOINTMENTS
    WHERE doctor_id = ?
      AND DATE(start_time) = ?
      AND appointment_status IN ('Scheduled', 'Confirmed')
  `;

  db.query(query, [doctorId, date], (err, results) => {
    if (err) {
      console.error("Error fetching booked slots:", err);
      return res.status(500).json({ error: "Failed to fetch booked slots." });
    }

    res.status(200).json(results);
  });
};

exports.getImmunizations = (req, res) => {
  const { id } = req.params;
  db.query(
    `SELECT 
    i.immunization_name,
    pi.immunization_date,
    pi.shot_status,
    CONCAT(e.first_name, ' ', IFNULL(e.middle_name, ''), ' ', e.last_name) AS administered_by
    FROM 
        Patient_Immunizations pi
    JOIN 
        IMMUNIZATIONS i ON pi.immunization_id = i.immunization_id
    LEFT JOIN 
        EMPLOYEES e ON pi.administered_by = e.employee_id
    WHERE 
        pi.patient_id = ?;
`,
    [id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
};

// Create appointment on behalf of patient by receptionist
exports.createAppointmentByReceptionist = (req, res) => {
  const { patient_id, doctor_id, clinic_id, start_time, end_time, appointment_type, appointment_status, timezoneOffset } = req.body;
  const created_by = req.user.user_id;

  if (req.user.role !== "Receptionist") {
    return res.status(403).json({ error: "Only receptionists can create appointments this way." });
  }

  if (!patient_id || !doctor_id || !clinic_id || !start_time || !end_time || !appointment_type || !appointment_status) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const startTime = new Date(start_time);
  const endTime = new Date(end_time);

  if (timezoneOffset) {
    startTime.setMinutes(startTime.getMinutes() - timezoneOffset);
    endTime.setMinutes(endTime.getMinutes() - timezoneOffset);
  }

  if (startTime >= endTime) {
    return res.status(400).json({ error: "Start time must be before end time." });
  }

  if (startTime < new Date()) {
    return res.status(400).json({ error: "Appointment must be in the future." });
  }

  // Validate doctor
  db.query("SELECT employee_id FROM DOCTORS WHERE employee_id = ?", [doctor_id], (err, doctor) => {
    if (err || !doctor.length) {
      return res.status(404).json({ error: "Doctor not found." });
    }

    // Validate clinic
    db.query("SELECT clinic_id FROM CLINIC WHERE clinic_id = ?", [clinic_id], (err, clinic) => {
      if (err || !clinic.length) {
        return res.status(404).json({ error: "Clinic not found." });
      }

      // Check for doctor time conflict
      db.query(
        "SELECT * FROM APPOINTMENTS WHERE doctor_id = ? AND ((start_time BETWEEN ? AND ?) OR (end_time BETWEEN ? AND ?))",
        [doctor_id, startTime, endTime, startTime, endTime],
        (err, conflict) => {
          if (err) return res.status(500).json({ error: "Conflict check failed." });

          if (conflict.length > 0) {
            return res.status(400).json({ error: "Doctor is already booked at this time." });
          }

          // Check referral if it's a specialist appointment
          if (appointment_type === "Specialist") {
            db.query(
              `SELECT * FROM REFERRALS WHERE patient_id = ? AND specialist_id = ? AND referral_status != 'Declined'`,
              [patient_id, doctor_id],
              (err, referral) => {
                if (err) return res.status(500).json({ error: "Referral check failed." });

                if (!referral.length) {
                  return res.status(403).json({ error: "Referral is required for specialist appointment." });
                }

                linkDoctorAndInsert();
              }
            );
          } else {
            linkDoctorAndInsert();
          }

          // Link doctor-patient if needed
          function linkDoctorAndInsert() {
            db.query(
              "SELECT * FROM Doctor_Patient WHERE doctor_id = ? AND patient_id = ?",
              [doctor_id, patient_id],
              (err, relation) => {
                if (err) return res.status(500).json({ error: "Doctor-patient check failed." });

                if (!relation.length) {
                  db.query(
                    "INSERT INTO Doctor_Patient (doctor_id, patient_id, assignment_date) VALUES (?, ?, NOW())",
                    [doctor_id, patient_id],
                    (err) => {
                      if (err) return res.status(500).json({ error: "Failed to link doctor and patient." });
                      insertAppointment();
                    }
                  );
                } else {
                  insertAppointment();
                }
              }
            );
          }

          function insertAppointment() {
            db.query(
              `INSERT INTO APPOINTMENTS 
              (patient_id, doctor_id, clinic_id, start_time, end_time, appointment_type, appointment_status, created_at, created_by)
              VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
              [patient_id, doctor_id, clinic_id, startTime, endTime, appointment_type, appointment_status, created_by],
              (err, result) => {
                if (err) {
                  console.error("Appointment insert error:", err);
                  return res.status(500).json({ error: "Failed to create appointment." });
                }

                res.status(201).json({ id: result.insertId, message: "Appointment created by receptionist." });
              }
            );
          }
        }
      );
    });
  });
};
