const db = require("../config/db");

// Get all clinics
exports.getClinics = (req, res) => {
  const db = req.app.get("db");
  db.query("SELECT clinic_id, clinic_name FROM CLINIC", (err, results) => {
    if (err) {
      console.error("Error fetching clinics:", err); 
      return res.status(500).json({ error: "Database error" });
    }
    res.status(200).json(results);
  });
};

// Get all departments
exports.getDepartments = (req, res) => {
  const db = req.app.get("db");
  db.query("SELECT department_id, department_name FROM DEPARTMENTS", (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.status(200).json(results);
  });
};

// Get all employees
exports.getAllEmployees = (req, res) => {
  const db = req.app.get('db');
  const query = `
    SELECT 
      e.employee_id,
      e.first_name, 
      e.last_name, 
      e.email, 
      e.phone, 
      e.role, 
      e.clinic_id,
      c.clinic_name
    FROM EMPLOYEES e
    JOIN CLINIC c ON e.clinic_id = c.clinic_id
  `;

  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.length === 0) {
      return res.status(404).json({ message: "No employees found" });
    }
    res.status(200).json(result);
  });
};

//Get detailed employee by ID
exports.getEmployeeDetails = (req, res) => {
  const db = req.app.get('db');
  const employeeId = req.params.id;

  const query = `
    SELECT 
      E.employee_id,
      E.first_name,
      E.last_name,
      E.email,
      E.phone,
      E.sex,
      E.date_of_birth,
      E.role,
      E.specialization,
      C.clinic_name,
      D.department_name,
      A.street_num,
      A.street_name,
      A.city,
      A.state,
      A.postal_code
    FROM EMPLOYEES E
    JOIN ADDRESS A ON E.address_id = A.address_id
    LEFT JOIN CLINIC C ON E.clinic_id = C.clinic_id
    LEFT JOIN DEPARTMENTS D ON E.department_id = D.department_id
    WHERE E.employee_id = ?
  `;

  db.query(query, [employeeId], (err, results) => {
    if (err) {
      console.error("Error fetching employee details:", err);
      return res.status(500).json({ error: "Failed to fetch employee details" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(200).json(results[0]);
  });
};

// get employee by clinic
exports.getEmployeesByClinic = (req, res) => {
  const db = req.app.get("db");
  const { clinic_id } = req.query;

  db.query(
    "SELECT employee_id, first_name, last_name FROM EMPLOYEES WHERE clinic_id = ?",
    [clinic_id],
    (err, results) => {
      if (err) {
        console.error("Error fetching employees by clinic:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.status(200).json(results);
    }
  );
};

// Add new employee
// exports.createEmployee = (req, res) => {
//   const db = req.app.get("db");

//   db.beginTransaction((err) => {
//   const {
//     first_name, last_name, middle_name, address, email, phone,
//     sex, dob, education, role, specialization, clinic_id,
//     department_id, hire_date, license_number 
//   } = req.body;
  

//   const normalizedRole = role === "1" ? "Doctor"
//                       : role === "2" ? "Nurse"
//                       : role === "3" ? "Receptionist"
//                       : role === "4" ? "Database Admin"
//                       : role;

//   const insertAddressQuery = `
//     INSERT INTO ADDRESS (street_num, street_name, postal_code, city, state)
//     VALUES (?, ?, ?, ?, ?)
//   `;

//   db.query(insertAddressQuery, [
//     address.street_num,
//     address.street_name,
//     address.postal_code,
//     address.city,
//     address.state
//   ], (addressErr, addressResult) => {
//     if (addressErr) {
//       console.error("Address insert error:", addressErr);
//       return res.status(500).json({ error: "Failed to insert address" });
//     }

//     const addressId = addressResult.insertId;

//     const insertEmployeeQuery = `
//       INSERT INTO EMPLOYEES 
//       (first_name, last_name, middle_name, address_id, email, phone, sex,
//       date_of_birth, education, role, specialization, clinic_id, department_id, date_hired)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//     db.query(insertEmployeeQuery, [
//       first_name, last_name, middle_name || null,
//       addressId, email, phone, sex, dob,
//       education || null, normalizedRole,
//       specialization || null, clinic_id,
//       department_id || null, hire_date
//     ], (employeeErr, employeeResult) => {
//       if (employeeErr) {
//         console.error("Employee insert error:", employeeErr);
//         return res.status(500).json({ error: "Failed to create employee" });
//       }

//       const employeeId = employeeResult.insertId;

//       // Role-based insertion
//       if (normalizedRole === "Doctor") {
//         const doctorQuery = `
//   INSERT INTO DOCTORS (employee_id, clinic_id, department_id, specialization, license_number)
//   VALUES (?, ?, ?, ?, ?)`;
// db.query(doctorQuery, [employeeId, clinic_id, department_id, specialization, license_number], (err) => {
//           if (err) {
//             console.error("DOCTORS insert error:", err);
//             return res.status(500).json({ error: "Failed to insert into DOCTORS" });
//           }
//           return res.status(200).json({ message: "Doctor added successfully!" });
//         });
//       } else if (normalizedRole === "Nurse") {
//         const nurseQuery = `
//         INSERT INTO NURSES (employee_id, clinic_id, department_id, license_number)
//         VALUES (?, ?, ?, ?)`;
//       db.query(nurseQuery, [employeeId, clinic_id, department_id, normalizedRole, license_number], (err) => {
//           if (err) {
//             console.error("NURSES insert error:", err);
//             return res.status(500).json({ error: "Failed to insert into NURSES" });
//           }
//           return res.status(200).json({ message: "Nurse added successfully!" });
//         });
//       } else if (normalizedRole === "Receptionist") {
//         const recQuery = `
//           INSERT INTO RECEPTIONIST (employee_id, clinic_id, phone, email)
//           VALUES (?, ?, ?, ?)`;
//         db.query(recQuery, [employeeId, clinic_id, phone, email], (err) => {
//           if (err) {
//             console.error("RECEPTIONIST insert error:", err);
//             return res.status(500).json({ error: "Failed to insert into RECEPTIONIST" });
//           }
//           return res.status(200).json({ message: "Receptionist added successfully!" });
//         });
//       } else if (normalizedRole === "Database Admin") {
//         const dbAdminQuery = `
//           INSERT INTO DATABASE_MANAGER (employee_id, last_login)
//           VALUES (?, NOW())`;
//         db.query(dbAdminQuery, [employeeId], (err) => {
//           if (err) {
//             console.error("DATABASE_MANAGER insert error:", err);
//             return res.status(500).json({ error: "Failed to insert into DATABASE_MANAGER" });
//           }
//           return res.status(200).json({ message: "Database Admin added successfully!" });
//         });
//       } else {
//         return res.status(200).json({ message: "Employee created successfully!" });
//       }
//     });
//   });
// });
// };
exports.createEmployee = (req, res) => {
  const db = req.app.get("db");

  db.beginTransaction((err) => {
    if (err) {
      console.error("Transaction start error:", err);
      return res.status(500).json({ error: "Transaction failed to start" });
    }

    const {
      first_name, last_name, middle_name, address, email, phone,
      sex, dob, education, role, specialization, clinic_id,
      department_id, hire_date, license_number 
    } = req.body;

    const normalizedRole = role;

    const insertAddressQuery = `
      INSERT INTO ADDRESS (street_num, street_name, postal_code, city, state)
      VALUES (?, ?, ?, ?, ?)`;

    db.query(insertAddressQuery, [
      address.street_num,
      address.street_name,
      address.postal_code,
      address.city,
      address.state
    ], (addressErr, addressResult) => {
      if (addressErr) {
        console.error("Address insert error:", addressErr);
        return db.rollback(() => res.status(500).json({ error: "Failed to insert address" }));
      }

      const addressId = addressResult.insertId;

      const insertEmployeeQuery = `
        INSERT INTO EMPLOYEES 
        (first_name, last_name, middle_name, address_id, email, phone, sex,
         date_of_birth, education, role, specialization, clinic_id, department_id, date_hired)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      db.query(insertEmployeeQuery, [
        first_name, last_name, middle_name || null,
        addressId, email, phone, sex, dob,
        education || null, normalizedRole,
        specialization || null, clinic_id,
        department_id || null, hire_date
      ], (employeeErr, employeeResult) => {
        if (employeeErr) {
          console.error("Employee insert error:", employeeErr);
          return db.rollback(() => res.status(500).json({ error: "Failed to insert employee" }));
        }

        const employeeId = employeeResult.insertId;

        // Role-specific insert
        const roleInsert = () => {
          if (normalizedRole === "Doctor") {
            const query = `INSERT INTO DOCTORS (employee_id, clinic_id, department_id, specialization, license_number)
                           VALUES (?, ?, ?, ?, ?)`;
            return db.query(query, [employeeId, clinic_id, department_id, specialization, license_number], roleCallback);
          } else if (normalizedRole === "Nurse") {
            const query = `INSERT INTO NURSES (employee_id, clinic_id, department_id, license_number)
                           VALUES (?, ?, ?, ?)`;
            return db.query(query, [employeeId, clinic_id, department_id, license_number], roleCallback);
          } else if (normalizedRole === "Receptionist") {
            const query = `INSERT INTO RECEPTIONIST (employee_id, clinic_id)
                           VALUES (?, ?)`;
            return db.query(query, [employeeId, clinic_id], roleCallback);
          } else if (normalizedRole === "Database Administrator") {
            const query = `INSERT INTO DATABASE_MANAGER (employee_id, last_login)
                           VALUES (?, NOW())`;
            return db.query(query, [employeeId], roleCallback);
          } else {
            return roleCallback(null); // no insert for general employee
          }
        };

        const roleCallback = (roleErr) => {
          if (roleErr) {
            console.error("Role-specific insert error:", roleErr);
            return db.rollback(() => res.status(500).json({ error: "Failed role-specific insert" }));
          }

          // Create credentials
          const username = `E${first_name}${employeeId}`;
          const password = `${employeeId}`;

          const insertCreds = `
            INSERT INTO USER_CREDENTIALS (employee_id, username, password, role, is_active)
            VALUES (?, ?, ?, ?, 1)`;

          db.query(insertCreds, [employeeId, username, password, normalizedRole], (credErr) => {
            if (credErr) {
              console.error("Credential insert error:", credErr);
              return db.rollback(() => res.status(500).json({ error: "Failed to insert credentials" }));
            }

            db.commit((commitErr) => {
              if (commitErr) {
                return db.rollback(() => res.status(500).json({ error: "Failed to commit transaction" }));
              }

              return res.status(200).json({
                message: `${normalizedRole} added successfully!`,
                username,
                password
              });
            });
          });
        };

        roleInsert();
      });
    });
  });
};

// View schedule by employee ID
exports.getSchedulesByEmployeeId = (req, res) => {
  const db = req.app.get("db");
  const { id } = req.params;
  db.query(
    "SELECT * FROM SCHEDULES WHERE employee_id = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error("Error fetching schedule:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "No schedule found for this employee" });
      }
      res.status(200).json(results);
    }
  );
};

// // Add schedule for an employee
// exports.createSchedule = (req, res) => {
//   const db = req.app.get("db");
//   const { employee_id, clinic_id, day_of_week, start_time, end_time } = req.body;

//   const insertScheduleQuery = `
//     INSERT INTO SCHEDULES (employee_id, clinic_id, day_of_week, start_time, end_time)
//     VALUES (?, ?, ?, ?, ?)
//   `;

//   db.query(insertScheduleQuery, [employee_id, clinic_id, day_of_week, start_time, end_time], (err, result) => {
//     if (err) {
//       console.error("Schedule insert error:", err);
//       return res.status(500).json({ error: "Failed to create schedule" });
//     }
//     res.status(200).json({ message: "Schedule added successfully!" });
//   });
// };
exports.createSchedule = (req, res) => {
  const db = req.app.get("db");
  const { employee_id, clinic_id, day_of_week, start_time, end_time } = req.body;

  // Check if a schedule already exists for the same day and employee
  const checkQuery = `
    SELECT * FROM SCHEDULES
    WHERE employee_id = ? AND day_of_week = ?
  `;

  db.query(checkQuery, [employee_id, day_of_week], (checkErr, existing) => {
    if (checkErr) {
      console.error("Schedule check error:", checkErr);
      return res.status(500).json({ error: "Failed to validate schedule" });
    }

    if (existing.length > 0) {
      return res.status(400).json({ error: "Schedule already exists for this employee on this day" });
    }

    const insertQuery = `
      INSERT INTO SCHEDULES (employee_id, clinic_id, day_of_week, start_time, end_time)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(insertQuery, [employee_id, clinic_id, day_of_week, start_time, end_time], (err, result) => {
      if (err) {
        console.error("Schedule insert error:", err);
        return res.status(500).json({ error: "Failed to create schedule" });
      }
      res.status(200).json({ message: "Schedule added successfully!" });
    });
  });
};

//update schedule
exports.updateSchedule = (req, res) => {
  const db = req.app.get("db");
  const scheduleId = req.params.schedule_id;

  const {
    employee_id,
    clinic_id,
    start_time,
    end_time,
    day_of_week
  } = req.body;

  const query = `
    UPDATE SCHEDULES
    SET employee_id = ?, clinic_id = ?, start_time = ?, end_time = ?, day_of_week = ?
    WHERE schedule_id = ?
  `;

  db.query(query, [employee_id, clinic_id, start_time, end_time, day_of_week, scheduleId], (err, result) => {
    if (err) {
      console.error("Schedule update error:", err);
      return res.status(500).json({ error: "Failed to update schedule" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    res.status(200).json({ message: "Schedule updated successfully!" });
  });
};

// delete schedule
exports.deleteSchedule = (req, res) => {
  const db = req.app.get("db");
  const scheduleId = req.params.schedule_id;

  const deleteQuery = `
    DELETE FROM SCHEDULES
    WHERE schedule_id = ?
  `;

  db.query(deleteQuery, [scheduleId], (err, result) => {
    if (err) {
      console.error("Schedule delete error:", err);
      return res.status(500).json({ error: "Failed to delete schedule" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    res.status(200).json({ message: "Schedule deleted successfully!" });
  });
};

// Get Immunization Report
exports.getImmunizationReport = (req, res) => {
  const { startDate, endDate } = req.query;

  let query = `
    SELECT 
      i.immunization_id, i.immunization_name, COUNT(DISTINCT pi.patient_id) AS patient_count
    FROM 
      Patient_Immunizations pi
    JOIN 
      IMMUNIZATIONS i ON pi.immunization_id = i.immunization_id
  `;

  const conditions = [];
  const params = [];

  if (startDate) {
    conditions.push("pi.immunization_date >= ?");
    params.push(startDate);
  }

  if (endDate) {
    conditions.push("pi.immunization_date <= ?");
    params.push(endDate);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " GROUP BY i.immunization_name";

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error", details: err });
    if (result.length === 0) {
      return res.status(404).json({ message: "No Immunizations found in the selected date range" });
    }
    res.status(200).json(result);
  });
};

// Get Immunization Report 2 (detailed report)
exports.getImmunizationDetails = (req, res) => {
  const { immunization_id } = req.params;

  if (!immunization_id) {
    return res.status(400).json({ error: "Missing immunization_id" });
  }

  const query = `
    SELECT 
      pi.patient_id,
      p.first_name AS patient_first_name,
      p.last_name AS patient_last_name,
      pi.immunization_date,
      e.first_name AS doctor_first_name,
      e.last_name AS doctor_last_name
    FROM 
      Patient_Immunizations pi
    JOIN 
      PATIENTS p ON pi.patient_id = p.patient_id
    JOIN 
      EMPLOYEES e ON pi.administered_by = e.employee_id
    WHERE 
      pi.immunization_id = ?
  `;

  db.query(query, [immunization_id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error", details: err });
    if (result.length === 0) {
      return res.status(404).json({ message: "No records found for this immunization" });
    }
    res.status(200).json(result);
  });
};

exports.getDbManagerProfile = (req, res) => {
  const db = req.app.get("db");
  const { employee_id } = req.params;

  const query = `
    SELECT e.first_name, e.last_name, e.email, dm.last_login
    FROM EMPLOYEES e
    JOIN DATABASE_MANAGER dm ON e.employee_id = dm.employee_id
    WHERE e.employee_id = ?
  `;

  db.query(query, [employee_id], (err, results) => {
    if (err) {
      console.error("DB Manager profile fetch error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.status(200).json(results[0]);
  });
};
    
//diagnostic report
// Full list of test types from the SET definition
exports.DiagnosticReport = async (req, res) => {
  const allTestTypes = ['Biopsy', 'CT_Scan', 'Colonoscopy', 'Eye Exam', 'X-Ray'];
  const sql = `
    SELECT
      CONCAT(a.city, ', ', a.state) AS clinic_location,
      dt.test_type
    FROM DIAGNOSTIC_TESTS dt
    JOIN EMPLOYEES e ON dt.doctor_id = e.employee_id
    JOIN CLINIC c ON e.clinic_id = c.clinic_id
    JOIN ADDRESS a ON c.address_id = a.address_id
  `;

  try {
    const [rows] = await db.promise().query(sql);

    const result = [];

    rows.forEach(row => {
      const testTypes = row.test_type.split(',');
      testTypes.forEach(type => {
        result.push({
          clinic_location: row.clinic_location,
          test_type: type.trim(),
          total_tests: 1
        });
      });
    });

    // Group and count by clinic_location + test_type
    const grouped = {};
    result.forEach(({ clinic_location, test_type }) => {
      const key = `${clinic_location}__${test_type}`;
      if (!grouped[key]) {
        grouped[key] = {
          clinic_location,
          test_type,
          total_tests: 0
        };
      }
      grouped[key].total_tests += 1;
    });

    const allLocations = [...new Set(rows.map(r => r.clinic_location))];

    // Ensure all test types appear per location
    const finalResult = [];
    allLocations.forEach(location => {
      allTestTypes.forEach(testType => {
        const key = `${location}__${testType}`;
        if (grouped[key]) {
          finalResult.push(grouped[key]);
        } else {
          finalResult.push({
            clinic_location: location,
            test_type: testType,
            total_tests: 0
          });
        }
      });
    });

    res.status(200).json(finalResult);
  } catch (err) {
    console.error('Error fetching diagnostic report:', err);
    res.status(500).json({ error: 'Failed to retrieve diagnostic report' });
  }
};

  // Get Demographic Report of New Patients
  exports.getDemographicReport = (req, res) => {
    const db = req.app.get("db");
    const { startDate, endDate } = req.query;
  
    const query = `
      SELECT 
        p.patient_id,
        p.first_name,
        p.last_name,
        p.dob,
        p.sex,
        p.race,
        p.date_registered,
        CASE WHEN i.insurance_id IS NOT NULL THEN 1 ELSE 0 END AS has_insurance
      FROM PATIENTS p
      JOIN APPOINTMENTS a ON p.patient_id = a.patient_id
      LEFT JOIN INSURANCE_PLAN i ON p.patient_id = i.patient_id
      WHERE DATE(p.date_registered) BETWEEN ? AND ?
      GROUP BY p.patient_id
    `;
  
    db.query(query, [startDate, endDate], (err, results) => {
      if (err) {
        console.error("Demographic report error:", err);
        return res.status(500).json({ error: "Failed to fetch demographic report" });
      }
  
      res.status(200).json(results);
    });
  };