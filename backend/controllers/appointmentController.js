
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
    [clinicId], //COMMA ADDED HERE
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
  db.query("SELECT * FROM APPOINTMENTS WHERE appointment_id = ?", [req.params.id], (error, appointment) => {
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

  console.log("Incoming appointment request by user:", created_by);
  console.log("Request body:", req.body);

  if (req.user.role !== "Patient") {
    return res.status(403).json({ error: "Only patients can create appointments" });
  }

  if (!doctor_id || !clinic_id || !start_time || !end_time || !appointment_type || !appointment_status) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const startTime = new Date(start_time);
  const endTime = new Date(end_time);
  if (startTime >= endTime) {
    return res.status(400).json({ error: "Start time must be before end time." });
  }

  const now = new Date();
  if (startTime < now) {
    return res.status(400).json({ error: "Appointment time must be in the future." });
  }

  // Step 1: Fetch patient_id from PATIENTS using user_id
  db.query("SELECT patient_id FROM PATIENTS WHERE user_id = ?", [created_by], (error, patient) => {
    if (error || !patient.length) {
      console.error("Patient lookup failed:", error);
      return res.status(404).json({ error: "Patient not found." });
    }

    const patient_id = patient[0].patient_id;
    console.log("Resolved patient_id:", patient_id);

    // Step 2: Validate doctor
    db.query("SELECT employee_id FROM DOCTORS WHERE employee_id = ?", [doctor_id], (error, doctor) => {
      if (error || !doctor.length) {
        console.error(" Doctor not found or error:", error);
        return res.status(404).json({ error: "Doctor not found." });
      }

      // Step 3: Validate clinic
      db.query("SELECT clinic_id FROM CLINIC WHERE clinic_id = ?", [clinic_id], (error, clinic) => {
        if (error || !clinic.length) {
          console.error(" Clinic not found or error:", error);
          return res.status(404).json({ error: "Clinic not found." });
        }

        // Step 4: Check time conflict
        db.query(
          `SELECT * FROM APPOINTMENTS 
           WHERE doctor_id = ? AND appointment_status = 'Scheduled' 
           AND ((start_time BETWEEN ? AND ?) OR (end_time BETWEEN ? AND ?))`,
          [doctor_id, start_time, end_time, start_time, end_time],
          (error, existingAppointments) => {
            if (error) {
              console.error("Conflict check error:", error);
              return res.status(500).json({ error: "Unable to check appointment conflicts." });
            }

            if (existingAppointments.length > 0) {
              return res.status(400).json({ error: "Doctor is already booked for this time." });
            }

            // Step 5: If Specialist appointment, check for referral
            if (appointment_type === "Specialist") {
              db.query(
                `SELECT * FROM REFERRALS 
                 WHERE patient_id = ? AND doctor_id = ? AND referral_status != 'Declined'`,
                [patient_id, doctor_id],
                (error, referral) => {
                  if (error) {
                    console.error(" Referral check failed:", error);
                    return res.status(500).json({ error: "Referral check failed." });
                  }

                  if (!referral.length) {
                    return res.status(403).json({ error: "A valid referral is required for a specialist appointment." });
                  }

                  linkDoctorAndInsert(patient_id);
                }
              );
            } else {
              linkDoctorAndInsert(patient_id);
            }

            // Step 6: Link doctor-patient if not already linked, then insert appointment
            function linkDoctorAndInsert(patient_id) {
              db.query(
                "SELECT * FROM Doctor_Patient WHERE doctor_id = ? AND patient_id = ?",
                [doctor_id, patient_id],
                (error, relation) => {
                  if (error) {
                    console.error(" Doctor-patient check failed:", error);
                    return res.status(500).json({ error: "Doctor-patient check failed." });
                  }

                  if (relation.length === 0) {
                    console.log("Linking doctor and patient...");
                    db.query(
                      "INSERT INTO Doctor_Patient (doctor_id, patient_id, assignment_date) VALUES (?, ?, NOW())",
                      [doctor_id, patient_id],
                      (err) => {
                        if (err) {
                          console.error(" Failed to link doctor and patient:", err);
                          return res.status(500).json({ error: "Failed to link doctor and patient." });
                        }
                        insertAppointment(patient_id);
                      }
                    );
                  } else {
                    insertAppointment(patient_id);
                  }
                }
              );
            }

            // Step 7: Insert final appointment
            function insertAppointment(patient_id) {
              console.log("Inserting appointment with:", {
                patient_id,
                doctor_id,
                clinic_id,
                start_time,
                end_time,
                appointment_type,
                appointment_status,
                created_by,
              });

              db.query(
                `INSERT INTO APPOINTMENTS 
                (patient_id, doctor_id, clinic_id, start_time, end_time, appointment_type, appointment_status, created_at, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
                [
                  patient_id,
                  doctor_id,
                  clinic_id,
                  start_time,
                  end_time,
                  appointment_type,
                  appointment_status,
                  created_by,
                ],
                (error, result) => {
                  if (error) {
                    console.error(" Appointment insert failed:", error);
                    return res.status(500).json({ error: "Unable to create an appointment." });
                  }

                  console.log("Appointment created successfully, ID:", result.insertId);
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


// exports.createAppointment = (req, res) => {
//   const { doctor_id, clinic_id, start_time, end_time, appointment_type, appointment_status } = req.body;
//   const created_by = req.user.user_id;

//   if (req.user.role !== "Patient") {
//     return res.status(403).json({ error: "Only patients can create appointments" });
//   }

//   if (!doctor_id || !clinic_id || !start_time || !end_time || !appointment_type || !appointment_status) {
//     return res.status(400).json({ error: "All fields are required." });
//   }

//   const startTime = new Date(start_time);
//   const endTime = new Date(end_time);
//   if (startTime >= endTime) {
//     return res.status(400).json({ error: "Start time must be before end time." });
//   }

//   const now = new Date();
//   if (startTime < now) {
//     return res.status(400).json({ error: "Appointment time must be in the future." });
//   }

//   // Fetch patient_id using the user_id
//   db.query("SELECT patient_id FROM PATIENTS WHERE user_id = ?", [created_by], (error, patient) => {
//     if (error || !patient.length) {
//       console.error(error);
//       return res.status(404).json({ error: "Patient not found." });
//     }

//     const patient_id = patient[0].patient_id;

//     // Validate doctor
//     db.query("SELECT employee_id FROM DOCTORS WHERE employee_id = ?", [doctor_id], (error, doctor) => {
//       if (error || !doctor.length) {
//         return res.status(404).json({ error: "Doctor not found." });
//       }

//       //Validate clinic
//       db.query("SELECT clinic_id FROM CLINIC WHERE clinic_id = ?", [clinic_id], (error, clinic) => {
//         if (error || !clinic.length) {
//           return res.status(404).json({ error: "Clinic not found." });
//         }

//         // Check for time conflict
//         // db.query(
//         //   "SELECT * FROM APPOINTMENTS WHERE doctor_id = ? AND ((start_time BETWEEN ? AND ?) OR (end_time BETWEEN ? AND ?))",
//         //   [doctor_id, start_time, end_time, start_time, end_time],
//         //   (error, existingAppointments) => {
//         //     if (error) return res.status(500).json({ error: "Unable to check appointment conflicts." });

//         //     if (existingAppointments.length > 0) {
//         //       return res.status(400).json({ error: "Doctor is already booked for this time." });
//         //     }
//         db.query(
//           "SELECT * FROM APPOINTMENTS WHERE doctor_id = ? AND appointment_status = 'Scheduled' AND ((start_time BETWEEN ? AND ?) OR (end_time BETWEEN ? AND ?))",
//           [doctor_id, start_time, end_time, start_time, end_time],
//           (error, existingAppointments) => {
//             if (error) return res.status(500).json({ error: "Unable to check appointment conflicts." });
        
//             if (existingAppointments.length > 0) {
//               return res.status(400).json({ error: "Doctor is already booked for this time." });
//             }
        
        

//             // Referral check if specialist
//             if (appointment_type === "Specialist") {
//               db.query(
//                 `SELECT * FROM REFERRALS WHERE patient_id = ? AND doctor_id = ? AND referral_status != 'Declined'`,
//                 [patient_id, doctor_id],
//                 (error, referral) => {
//                   if (error) return res.status(500).json({ error: "Referral check failed." });

//                   if (!referral.length) {
//                     return res.status(403).json({ error: "A valid referral is required for a specialist appointment." });
//                   }

//                   linkDoctorAndInsert(patient_id);
//                 }
//               );
//             } else {
//               linkDoctorAndInsert(patient_id);
//             }

//             // Doctor-patient relationship check + insert
//             function linkDoctorAndInsert(patient_id) {
//               db.query(
//                 "SELECT * FROM Doctor_Patient WHERE doctor_id = ? AND patient_id = ?",
//                 [doctor_id, patient_id],
//                 (error, relation) => {
//                   if (error) return res.status(500).json({ error: "Doctor-patient check failed." });

//                   if (relation.length === 0) {
//                     db.query(
//                       "INSERT INTO Doctor_Patient (doctor_id, patient_id, assignment_date) VALUES (?, ?, NOW())",
//                       [doctor_id, patient_id],
//                       (err) => {
//                         if (err) return res.status(500).json({ error: "Failed to link doctor and patient." });
//                         insertAppointment(patient_id);
//                       }
//                     );
//                   } else {
//                     insertAppointment(patient_id);
//                   }
//                 }
//               );
//             }

//             // Final insert into appointments
//             function insertAppointment(patient_id) {
//               db.query(
//                 `INSERT INTO APPOINTMENTS 
//                 (patient_id, doctor_id, clinic_id, start_time, end_time, appointment_type, appointment_status, created_at, created_by)
//                 VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
//                 [patient_id, doctor_id, clinic_id, start_time, end_time, appointment_type, appointment_status, created_by],
//                 (error, result) => {
//                   if (error) return res.status(500).json({ error: "Unable to create an appointment." });

//                   res.status(201).json({
//                     id: result.insertId,
//                     message: "Appointment created successfully.",
//                   });
//                 }
//               );
//             }
//           }
//         );
//       });
//     });
//   });
// };
exports.getBookedSlots = (req, res) => {
  const { doctor_id, date } = req.query;

  if (!doctor_id || !date) {
    return res.status(400).json({ error: "Missing doctor_id or date" });
  }

  const startOfDay = `${date} 00:00:00`;
  const endOfDay = `${date} 23:59:59`;

  const query = `
    SELECT start_time, end_time FROM APPOINTMENTS
    WHERE doctor_id = ? AND appointment_status = 'Scheduled'
    AND start_time BETWEEN ? AND ?
  `;

  db.query(query, [doctor_id, startOfDay, endOfDay], (err, results) => {
    if (err) {
      console.error("Error fetching booked slots:", err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json(results);
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
    WHERE patient_id = ? AND doctor_id = ? AND referral_status != 'Declined'
  `;

  db.query(query, [patientId, doctorId], (err, results) => {
    if (err) {
      console.error("Referral check failed:", err);
      return res.status(500).json({ error: "Internal server error." });
    }

    res.json({ valid: results.length > 0 });
  });
};