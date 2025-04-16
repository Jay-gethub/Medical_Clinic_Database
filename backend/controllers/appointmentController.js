// // appointmentController is the controller for creating/updating/deleting appointments
// const db = require('../config/db');
// // Get doctors by clinic ID
// exports.getDoctorsByClinic = async (req, res) => {
//   const clinicId = req.params.clinicId;

//   try {
//     const [doctors] = await db.query(
//       `SELECT 
//          d.employee_id, 
//          e.first_name, 
//          e.last_name, 
//          e.sex, 
//          d.specialization, 
//          d.department_id, 
//          dept.department_name
//        FROM DOCTORS d
//        JOIN EMPLOYEES e ON d.employee_id = e.employee_id
//        JOIN DEPARTMENTS dept ON d.department_id = dept.department_id
//        WHERE d.clinic_id = ?`,
//       [clinicId]
//     );

//     res.status(200).json(doctors);
//   } catch (error) {
//     console.error("Error fetching doctors:", error);
//     res.status(500).json({ error: "Failed to fetch doctors by clinic" });
//   }
// };

// exports.getAllAppointments = async (req, res) => {
//     try {
//         const [appointments] = await db.query("SELECT * FROM APPOINTMENTS");
//         res.json(appointments);
//     } catch (error) {
//         res.status(500).json({ error: "Unable to fetch appointments."});
//     }
// };

// exports.createAppointment = async (req, res) => {
//     const { patient_id, doctor_id, clinic_id, start_time, end_time, appointment_type, appointment_status } = req.body;
//     const created_by = req.user.user_id; // Get patient ID from the token
    
//     // Ensure the logged-in user is a patient
//      if (req.user.role !== "Patient") {
//         return res.status(403).json({ error: "Only patients can create appointments" });
//         }
    
//     try {
//         // 1. Ensure all required fields are provided
//         if (!patient_id || !doctor_id || !clinic_id || !start_time || !end_time) {
//             return res.status(400).json({ error: "All fields are required." });
//         }

//         // 2. Validate time range
//         const startTime = new Date(start_time);
//         const endTime = new Date(end_time);
//         if (startTime >= endTime) {
//             return res.status(400).json({ error: "Start time must be before end time." });
//         }

//         // 3. Ensure appointment is not in the past
//         const now = new Date();
//         if (startTime < now) {
//             return res.status(400).json({ error: "Appointment time must be in the future." });
//         }

//         // 4. Check if patient, doctor, and clinic exist
//         const [patient] = await db.query("SELECT id FROM PATIENTS WHERE id = ?", [patient_id]);
//         const [doctor] = await db.query("SELECT id FROM DOCTORS WHERE id = ?", [doctor_id]);
//         const [clinic] = await db.query("SELECT id FROM CLINIC WHERE id = ?", [clinic_id]);

//         if (!patient.length || !doctor.length || !clinic.length) {
//             return res.status(404).json({ error: "Invalid patient, doctor, or clinic ID." });
//         }

//         // 5. Check for overlapping appointments for the doctor
//         const [existingAppointments] = await db.query(
//             "SELECT * FROM APPOINTMENTS WHERE doctor_id = ? AND ((start_time BETWEEN ? AND ?) OR (end_time BETWEEN ? AND ?))",
//             [doctor_id, start_time, end_time, start_time, end_time]

//         );

//         if (existingAppointments.length > 0) {
//             return res.status(400).json({ error: "Doctor is already booked for this time." });
//         }

//         //Checking to see if the appointment_type is 'Specialist'. If it is, then must ensure patient has a referral (trigger).
//         if (appointment_type === "Specialist") {
//         const referralQuery = `
//           SELECT * FROM REFERRALS
//           WHERE patient_id = ? AND referral_status != 'Declined'
//         `;
//         const [referral] = await db.query(referralQuery, [patient_id]);
  
//         if (!referral.length) {
//           return res.status(403).json({ error: "A valid referral is required for a specialist appointment" });
//         }
//       }

//         // 6. Insert appointment if all checks pass
//         const result = await db.query(
//             "INSERT INTO APPOINTMENTS (patient_id, doctor_id, clinic_id, start_time, end_time, appointment_type, appointment_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
//             [patient_id, doctor_id, clinic_id, start_time, end_time, appointment_type, appointment_status]
//         );

//         res.json({ id: result[0].insertId, message: "Appointment created successfully." });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Unable to create an appointment." });
//     }
// };

// exports.createAppointmentByReceptionist = async (req, res) => {
//     const { patient_id, doctor_id, clinic_id, start_time, end_time, appointment_type, appointment_status } = req.body;
//     const receptionist_id = req.user.employee_id; // Now using `employee_id` from `req.user`
    
//     // Ensure the logged-in user is a receptionist
//     if (req.user.role !== "Receptionist") {
//         return res.status(403).json({ error: "Only receptionists can create appointments." });
//     }
    

//     if (!receptionist_id) {
//         return res.status(403).json({ error: "Unauthorized: Receptionist ID required." });
//     }
//      try {
//         // 1. Ensure all required fields are provided
//         if (!patient_id || !doctor_id || !clinic_id || !start_time || !end_time) {
//             return res.status(400).json({ error: "All fields are required." });
//         }

//         // 2. Validate time range
//         const startTime = new Date(start_time);
//         const endTime = new Date(end_time);
//         if (startTime >= endTime) {
//             return res.status(400).json({ error: "Start time must be before end time." });
//         }

//         // 3. Ensure appointment is not in the past
//         const now = new Date();
//         if (startTime < now) {
//             return res.status(400).json({ error: "Appointment time must be in the future." });
//         }

//         // 4. Check if patient, doctor, and clinic exist
//         const [patient] = await db.query("SELECT id FROM PATIENTS WHERE id = ?", [patient_id]);
//         const [doctor] = await db.query("SELECT id FROM DOCTORS WHERE id = ?", [doctor_id]);
//         const [clinic] = await db.query("SELECT id FROM CLINIC WHERE id = ?", [clinic_id]);

//         if (!patient.length || !doctor.length || !clinic.length) {
//             return res.status(404).json({ error: "Invalid patient, doctor, or clinic ID." });
//         }

//         // 5. Check for overlapping appointments for the doctor
//         const [existingAppointments] = await db.query(
//             "SELECT * FROM APPOINTMENTS WHERE doctor_id = ? AND ((start_time BETWEEN ? AND ?) OR (end_time BETWEEN ? AND ?))",
//             [doctor_id, start_time, end_time, start_time, end_time]      
//         );

//         if (existingAppointments.length > 0) {
//             return res.status(400).json({ error: "Doctor is already booked for this time." });
//         }

//         // 6. Insert appointment if all checks pass
//         // Insert appointment with `created_by` as receptionist_id (employee_id)
//         const result = await db.query(
//             "INSERT INTO APPOINTMENTS (patient_id, doctor_id, clinic_id, start_time, end_time, appointment_type, appointment_status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
//             [patient_id, doctor_id, clinic_id, start_time, end_time, appointment_type, appointment_status, receptionist_id]
//         );

//         res.json({ id: result[0].insertId, message: "Appointment created successfully." });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Unable to create an appointment." });
//     }
// };


// exports.getAppointmentById = async (req, res) => {
//     try {
//         const [appointment] = await db.query("SELECT * FROM APPOINTMENTS WHERE appointment_id = ?", [req.params.id]);
//         if (appointment.length === 0) return res.status(404).json({ message: "Appointment not found." });
//         res.json(appointment[0]);
//     } catch (error) {
//         res.status(500).json({ error: "Unable to fetch appointment." });
//     }
// };

// exports.updateAppointment = async (req, res) => {
//     try {
//       const { appointment_id } = req.params;
//       const { patient_id, doctor_id, clinic_id, start_time, end_time, reason, appointment_status } = req.body;
  
//       // Step 1: Check if the appointment exists and retrieve `created_by`
//       const [appointment] = await db.query("SELECT * FROM APPOINTMENTS WHERE appointment_id = ?", [appointment_id]);
//       if (!appointment.length) {
//         return res.status(404).json({ error: "Appointment not found" });
//       }
  
//       const created_by = appointment[0].created_by; // Preserve the original creator
  
//       // Prevent updates if the appointment is already "Canceled" or "Finished"
//       if (["Canceled", "Finished"].includes(appointment[0].appointment_status)) {
//         return res.status(403).json({ error: "Cannot update a canceled or finished appointment" });
//       }
  
//       // Validate required fields
//       if (!patient_id || !doctor_id || !clinic_id || !start_time || !end_time || !appointment_status) {
//         return res.status(400).json({ error: "Missing required fields. Ensure all attributes are provided." });
//       }
  
//       // Ensure start_time is before end_time
//       const startTime = new Date(start_time);
//       const endTime = new Date(end_time);
//       if (startTime >= endTime) {
//         return res.status(400).json({ error: "Start time must be before end time" });
//       }
  
//       // Step 2: Check for doctor schedule conflicts
//       const checkQuery = `
//         SELECT * FROM APPOINTMENTS 
//         WHERE doctor_id = ? 
//         AND appointment_id != ?  -- Ensure we don't compare against the same appointment
//         AND ((start_time BETWEEN ? AND ?) OR (end_time BETWEEN ? AND ?))
//       `;
  
//       const [existingAppointments] = await db.query(checkQuery, [doctor_id, appointment_id, start_time, end_time, start_time, end_time]);
  
//       if (existingAppointments.length > 0) {
//         return res.status(409).json({ error: "Doctor is already booked for this time slot" });
//       }
  
//       // Step 3: Update the appointment details, keeping `created_by` unchanged
//       const updateQuery = `
//         UPDATE APPOINTMENTS 
//         SET patient_id = ?, doctor_id = ?, clinic_id = ?, start_time = ?, end_time = ?, reason = ?, appointment_status = ?, created_by = ?
//         WHERE appointment_id = ?
//       `;
  
//       await db.query(updateQuery, [patient_id, doctor_id, clinic_id, start_time, end_time, reason, appointment_status, created_by, appointment_id]);
  
//       res.status(200).json({ message: "Appointment updated successfully" });
  
//     } catch (err) {
//       console.error("Error updating appointment:", err);
//       res.status(500).json({ error: "Internal server error" });
//     }
//   };
  
  

//  exports.cancelAppointment = async (req, res) => {
//     try {
//       const { appointment_id } = req.params;
  
//       // Step 1: Retrieve the appointment details
//       const [appointment] = await db.query("SELECT * FROM APPOINTMENTS WHERE appointment_id = ?", [appointment_id]);
//       if (!appointment.length) {
//         return res.status(404).json({ error: "Appointment not found" });
//       }
  
//       const { patient_id, start_time, appointment_status, created_by } = appointment[0];
  
//       // Ensure only the patient who booked the appointment can cancel it
//       if (req.user.role === "Patient" && created_by !== req.user.patient_id) {
//         return res.status(403).json({ error: "You can only cancel your own appointments" });
//       }
  
//       // Prevent cancellation of already canceled or finished appointments
//       if (["Canceled", "Finished"].includes(appointment_status)) {
//         return res.status(403).json({ error: "Cannot cancel an appointment that is already canceled or finished" });
//       }
  
//       // Step 2: Check if cancellation is within 24 hours
//       const now = new Date();
//       const appointmentStartTime = new Date(start_time);
//       const hoursDifference = (appointmentStartTime - now) / (1000 * 60 * 60); // Convert milliseconds to hours
  
//       let fineAmount = 0;
//       if (hoursDifference < 24) {
//         fineAmount = 25; // Minimum fine of $25
//       }
  
//       // Step 3: Update appointment_status to "Canceled"
//       const updateQuery = "UPDATE APPOINTMENTS SET appointment_status = 'Canceled' WHERE appointment_id = ?";
//       await db.query(updateQuery, [appointment_id]);
  
//       // Step 4: If a fine applies, update the patient's billing total_amount
//       if (fineAmount > 0) {
//         const billingQuery = `
//           UPDATE BILLING 
//           SET total_amount = total_amount + ? 
//           WHERE patient_id = ?
//         `;
//         await db.query(billingQuery, [fineAmount, patient_id]);
//       }
  
//       res.status(200).json({
//         message: "Appointment canceled successfully",
//         fine: fineAmount > 0 ? `A fine of $${fineAmount} has been added to your billing account.` : "No fine applied."
//       });
  
//     } catch (err) {
//       console.error("Error canceling appointment:", err);
//       res.status(500).json({ error: "Internal server error" });
//     }
//   };
  

//  exports.deleteAppointment = async (req, res) => {
//     try {
//       const { appointment_id } = req.params;
  
//       // Check if the appointment exists
//       const [appointment] = await db.query("SELECT * FROM APPOINTMENTS WHERE appointment_id = ?", [appointment_id]);
//       if (!appointment.length) {
//         return res.status(404).json({ error: "Appointment not found" });
//       }
  
//       // Ensure only a receptionist or admin can delete
//       if (!["Receptionist", "Admin"].includes(req.user.role)) {
//         return res.status(403).json({ error: "Only receptionists or admins can delete appointments" });
//       }
  
//       // Delete the appointment
//       const deleteQuery = "DELETE FROM APPOINTMENTS WHERE appointment_id = ?";
//       await db.query(deleteQuery, [appointment_id]);
  
//       res.status(200).json({ message: "Appointment deleted successfully" });
  
//     } catch (err) {
//       console.error("Error deleting appointment:", err);
//       res.status(500).json({ error: "Internal server error" });
//     }
//   };
  

// exports.checkInPatient = async (req, res) => {
//     const { appointment_id } = req.params;
//     const check_in_time = new Date();
    
//     try {
//         const [appointment] = await db.query("SELECT * FROM APPOINTMENTS WHERE id = ?", [appointment_id]);

//         if (!appointment.length) {
//             return res.status(404).json({ error: "Unable to find appointment." });
//         }
        
//         // Ensure only a receptionist can check in a patient
//         if (req.user.role !== "Receptionist") {
//             return res.status(403).json({ error: "Only receptionists can check in patients" });
//         }
  
//         // Update check-in time
//         const updateQuery = "UPDATE APPOINTMENTS SET patient_check_in_time = ? WHERE appointment_id = ?";
//         await db.query(updateQuery, [check_in_time, appointment_id]);
  
//       res.status(200).json({ message: "Patient checked in successfully", check_in_time });
  
//     } catch (err) {
//       console.error("Error checking in patient:", err);
//       res.status(500).json({ error: "Internal server error" });
//     }
// };

// exports.checkOutPatient = async (req, res) => {
//     const { appointment_id } = req.params;
//     const check_out_time = new Date();

//     try {
//         const [appointment] = await db.query("SELECT * FROM APPOINTMENTS WHERE id = ?", [appointment_id]);

//         if (!appointment.length) {
//             return res.status(404).json({ error: "Unable to find appointment." });
//         }

//         // Ensure only a receptionist can check out a patient
//         if (req.user.role !== "Receptionist") {
//             return res.status(403).json({ error: "Only receptionists can check out patients" });
//         }
  
//         // Update check-out time and mark appointment as Finished
//         const updateQuery = "UPDATE APPOINTMENTS SET patient_check_out_time = ?, appointment_status = 'Finished' WHERE appointment_id = ?";
//         await db.query(updateQuery, [check_out_time, appointment_id]);
  
//         res.status(200).json({ message: "Patient checked out successfully", check_out_time });
  
//     } catch (err) {
//       console.error("Error checking out patient:", err);
//       res.status(500).json({ error: "Internal server error" });
//     }
// };
// exports.getAppointmentsByStatus = async (req, res) => {
//   const { status } = req.query;

//   try {
//     const [appointments] = await db.query(
//       "SELECT * FROM APPOINTMENTS WHERE appointment_status = ?",
//       [status]
//     );

//     res.status(200).json(appointments);
//   } catch (error) {
//     console.error("Error fetching appointments:", error);
//     res.status(500).json({ error: "Unable to fetch appointments by status." });
//   }
// };
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
    [clinicId], // ✅ COMMA ADDED HERE
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
          [doctor_id, start_time, end_time, start_time, end_time],
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
                [patient_id, doctor_id, clinic_id, start_time, end_time, appointment_type, appointment_status, created_by],
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