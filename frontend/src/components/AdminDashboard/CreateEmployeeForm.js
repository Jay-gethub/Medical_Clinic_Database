//CreateEmployeeForm.js
import React from 'react';
import axios from 'axios';
import '../../styles/AdminDashboard.css';

class CreateEmployeeForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clinics: [],
      departments: [],
      states: [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
        'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
        'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
        'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
        'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
        'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
        'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
        'Wisconsin', 'Wyoming'
      ],
      successMsg: '',
      errorMsg: '',
      employeeData: {
        first_name: '', 
        last_name: '', 
        middle_name: '',
        address: { 
          street_num: '', 
          street_name: '', 
          postal_code: '', 
          city: '', 
          state: '' 
        },
        email: '', 
        phone: '', 
        sex: '', 
        dob: '', 
        education: '', 
        role: '',
        specialization: '', 
        clinic_id: '', 
        department_id: '', 
        license_number: '',
        hire_date: ''
      },
      errors: {}
    };
  }

  async componentDidMount() {
    try {
      const clinicRes = await axios.get("http://localhost:5000/api/admin/clinics");
      const deptRes = await axios.get("http://localhost:5000/api/admin/departments");

      this.setState({
        clinics: clinicRes.data,
        departments: deptRes.data
      });
    } catch (err) {
      console.error("Failed to fetch clinics or departments", err);
    }
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    const { employeeData, errors } = this.state;

    let formattedValue = value;
    if (name === 'phone') {
      formattedValue = value.replace(/[^\d]/g, '').slice(0, 10);
    }

    const error = this.validateField(name, formattedValue);
    const updatedErrors = { ...errors, [name]: error };

    let updatedEmployeeData;
    if (name in employeeData) {
      updatedEmployeeData = { ...employeeData, [name]: formattedValue };
    } else {
      updatedEmployeeData = {
        ...employeeData,
        address: { ...employeeData.address, [name]: formattedValue }
      };
    }

    if (name === 'role') {
      updatedEmployeeData.specialization = '';
      updatedEmployeeData.department_id = '';
    }

    this.setState({
      employeeData: updatedEmployeeData,
      errors: updatedErrors,
      successMsg: '',
      errorMsg: ''
    });
  };

  validateField = (name, value) => {
    let error = '';
    if (!value && ["first_name", "last_name", "email", "phone", "sex", "dob", "role", "clinic_id", "hire_date"].includes(name)) {
      error = "This field is required";
    }
  

    if (name === 'postal_code') {
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (!zipRegex.test(value)) {
        error = 'Invalid ZIP code format';
      }
    }

    return error;
  };

  validateForm = () => {
    const { employeeData } = this.state;
    let errors = {};
    let isValid = true;

    const requiredFields = ['first_name', 'last_name', 'email', 'phone', 'sex', 'dob', 'role', 'clinic_id', 'hire_date'];
    const requiredAddressFields = ['street_num', 'street_name', 'postal_code', 'city', 'state'];

    requiredFields.forEach(field => {
      if (!employeeData[field]) {
        errors[field] = 'This field is required';
        isValid = false;
      }
    });

    requiredAddressFields.forEach(field => {
      if (!employeeData.address[field]) {
        errors[field] = 'This field is required';
        isValid = false;
      }
    });
    if ((employeeData.role === '1' || employeeData.role === '2') && !employeeData.license_number) {
      errors.license_number = 'License number is required for this role';
      isValid = false;
    }
    

    if (employeeData.role === '1' && (!employeeData.specialization || !employeeData.department_id)) {
      errors.specialization = 'Specialization is required for doctors';
      errors.department_id = 'Department is required for doctors';
      isValid = false;
    }

    if (employeeData.role === '2' && !employeeData.department_id) {
      errors.department_id = 'Department is required for nurses';
      isValid = false;
    }

    this.setState({ errors });
    return isValid;
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    if (!this.validateForm()) {
      this.setState({ errorMsg: 'Please correct the errors in the form.', successMsg: '' });
      return;
    }

    try {
      const { employeeData } = this.state;
      const res = await axios.post("http://localhost:5000/api/admin/create-employee", employeeData);
      if (res.status === 200) {
        this.setState({
          successMsg: "Employee created successfully!",
          errorMsg: '',
          employeeData: {
            first_name: '', last_name: '', middle_name: '',
            address: { street_num: '', street_name: '', postal_code: '', city: '', state: '' },
            email: '', phone: '', sex: '', dob: '', education: '', role: '',
            specialization: '', clinic_id: '', department_id: '', hire_date: ''
          },
          errors: {}
        });
      }
    } catch (err) {
      console.error(err);
      this.setState({ errorMsg: 'Error creating employee.', successMsg: '' });
    }
  };

  render() {
    const { employeeData, errors, clinics, departments, states, successMsg, errorMsg } = this.state;

    return (
      <form onSubmit={this.handleSubmit} className="admin-box">
        <h3>Create New Employee</h3>

        {successMsg && <div className="success-message">{successMsg}</div>}
        {errorMsg && <div className="error-message">{errorMsg}</div>}

        <input name="first_name" value={employeeData.first_name} onChange={this.handleChange} placeholder="First Name *" className={errors.first_name ? 'input-error' : ''} />
        {errors.first_name && <div className="error-message">{errors.first_name}</div>}

        <input name="last_name" value={employeeData.last_name} onChange={this.handleChange} placeholder="Last Name *" className={errors.last_name ? 'input-error' : ''} />
        {errors.last_name && <div className="error-message">{errors.last_name}</div>}

        <input name="middle_name" value={employeeData.middle_name} onChange={this.handleChange} placeholder="Middle Name" />

        <h4>Address</h4>
        {['street_num', 'street_name', 'postal_code', 'city'].map(field => (
          <input
            key={field}
            name={field}
            value={employeeData.address[field]}
            onChange={this.handleChange}
            placeholder={`${field.replace('_', ' ')} *`}
            className={errors[field] ? 'input-error' : ''}
          />
        ))}

        <select name="state" value={employeeData.address.state} onChange={this.handleChange} className={errors.state ? 'input-error' : ''}>
          <option value="">-- Select State --</option>
          {states.map((stateName) => (
            <option key={stateName} value={stateName}>{stateName}</option>
          ))}
        </select>

        <input name="email" value={employeeData.email} onChange={this.handleChange} placeholder="Email *" className={errors.email ? 'input-error' : ''} />
        {errors.email && <div className="error-message">{errors.email}</div>}

        <input name="phone" value={employeeData.phone} onChange={this.handleChange} placeholder="Phone * (10 digits)" className={errors.phone ? 'input-error' : ''} />

        <label htmlFor="dob"><h4>Date of Birth *</h4></label>
<input 
  id="dob"
  name="dob" 
  type="date" 
  value={employeeData.dob} 
  onChange={this.handleChange} 
  className={errors.dob ? 'input-error' : ''} 
/>


        <input name="education" value={employeeData.education} onChange={this.handleChange} placeholder="Education (e.g. MBBS, BSc in Nursing)" />

        <select name="sex" value={employeeData.sex} onChange={this.handleChange} className={errors.sex ? 'input-error' : ''}>
          <option value="">-- Select Gender --</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <select name="role" value={employeeData.role} onChange={this.handleChange} className={errors.role ? 'input-error' : ''}>
          <option value="">-- Select Role --</option>
          <option value="1">Doctor</option>
          <option value="2">Nurse</option>
          <option value="3">Receptionist</option>
          <option value="4">Database Administrator</option>
        </select>

        {employeeData.role === '1' && (
          <input
            name="specialization"
            value={employeeData.specialization}
            onChange={this.handleChange}
            placeholder="Specialization *"
            className={errors.specialization ? 'input-error' : ''}
          />
        )}

        {(employeeData.role === '1' || employeeData.role === '2') && (
          <select name="department_id" value={employeeData.department_id} onChange={this.handleChange} className={errors.department_id ? 'input-error' : ''}>
            <option value="">-- Select Department --</option>
            {departments.map(dept => (
              <option key={dept.department_id} value={dept.department_id}>{dept.department_name}</option>
            ))}
          </select>
        )}
        {/* {(employeeData.role === '1' || employeeData.role === '2') && (
  <input
    name="license_number"
    value={employeeData.license_number || ''}
    onChange={this.handleChange}
    placeholder="License Number *"
    className={errors.license_number ? 'input-error' : ''}
  />
)} */}
{(employeeData.role === '1' || employeeData.role === '2') && (
  <>
    <input
      name="license_number"
      value={employeeData.license_number || ''}
      onChange={this.handleChange}
      placeholder="License Number *"
      className={errors.license_number ? 'input-error' : ''}
    />
    {errors.license_number && <div className="error-message">{errors.license_number}</div>}
  </>
)}

{errors.license_number && <div className="error-message">{errors.license_number}</div>}


        <select name="clinic_id" value={employeeData.clinic_id} onChange={this.handleChange} className={errors.clinic_id ? 'input-error' : ''}>
          <option value="">-- Select Clinic --</option>
          {clinics.map(clinic => (
            <option key={clinic.clinic_id} value={clinic.clinic_id}>{clinic.clinic_name}</option>
          ))}
        </select>

        <label htmlFor="hire_date"><h4>Hire Date *</h4></label>
<input 
  id="hire_date"
  name="hire_date" 
  type="date" 
  value={employeeData.hire_date} 
  onChange={this.handleChange} 
  className={errors.hire_date ? 'input-error' : ''} 
/>


        <button type="submit">Add Employee</button>
      </form>
    );
  }
}

export default CreateEmployeeForm;
