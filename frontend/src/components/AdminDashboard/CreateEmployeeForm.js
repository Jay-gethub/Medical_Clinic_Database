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
        'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
        'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
        'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
        'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
        'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
        'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
        'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
        'Wisconsin','Wyoming'
      ],
      successMsg: '',
      errorMsg: '',
      employeeData: {
        first_name: '',
        last_name: '',
        middle_name: '',
        address: { street_num: '', street_name: '', postal_code: '', city: '', state: '' },
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
      showPopup: false,
      loginInfo: null,
      errors: {}
    };
  }

  async componentDidMount() {
    try {
      const [clinicRes, deptRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/clinics'),
        axios.get('http://localhost:5000/api/admin/departments')
      ]);
      this.setState({ clinics: clinicRes.data, departments: deptRes.data });
    } catch (err) {
      console.error('Failed to fetch lists:', err);
    }
  }

  validateField = (name, value) => {
    let error = '';
    const required = ['first_name','last_name','email','phone','sex','dob','role','clinic_id','hire_date'];
    if (required.includes(name) && !value) {
      error = 'This field is required';
    }
    if (name === 'postal_code' && value && !/^\d{5}(?:-\d{4})?$/.test(value)) {
      error = 'Invalid ZIP code';
    }
    return error;
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    const formatted = name === 'phone' ? value.replace(/\D/g, '').slice(0,10) : value;
    const errors = { ...this.state.errors, [name]: this.validateField(name, formatted) };
    const employeeData = { ...this.state.employeeData };

    if (name in employeeData) {
      employeeData[name] = formatted;
    } else {
      employeeData.address[name] = formatted;
    }

    if (name === 'role') {
      // Clear dependent fields
      employeeData.specialization = '';
      employeeData.department_id = '';
      employeeData.license_number = '';
    }

    this.setState({ employeeData, errors, successMsg: '', errorMsg: '' });
  }

  validateForm = () => {
    const { employeeData } = this.state;
    let errors = {};
    let valid = true;

    // Required
    ['first_name','last_name','email','phone','sex','dob','role','clinic_id','hire_date']
      .forEach(f => {
        if (!employeeData[f]) {
          errors[f] = 'Required'; valid = false;
        }
      });
    ['street_num','street_name','postal_code','city','state']
      .forEach(f => {
        if (!employeeData.address[f]) {
          errors[f] = 'Required'; valid = false;
        }
      });

    // Role-specific
    if ((employeeData.role === 'Doctor' || employeeData.role === 'Nurse') && !employeeData.license_number) {
      errors.license_number = 'License required'; valid = false;
    }
    if (employeeData.role === 'Doctor') {
      if (!employeeData.specialization) { errors.specialization = 'Required for doctors'; valid = false; }
      if (!employeeData.department_id) { errors.department_id = 'Required for doctors'; valid = false; }
    }
    if (employeeData.role === 'Nurse' && !employeeData.department_id) {
      errors.department_id = 'Required for nurses'; valid = false;
    }

    this.setState({ errors });
    return valid;
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    if (!this.validateForm()) {
      this.setState({ errorMsg: 'Please fix errors.', successMsg: '' });
      return;
    }

    const { employeeData } = this.state;
    try {
      const res = await axios.post(
        'http://localhost:5000/api/admin/create-employee',
        { ...employeeData, ...employeeData.address }
      );
      const { username, password } = res.data;
      this.setState({
        successMsg: `${employeeData.role} ${employeeData.first_name} ${employeeData.last_name} added!`,
        loginInfo: { username, password },
        showPopup: true,
        errorMsg: ''
      });
    } catch (err) {
      console.error(err);
      this.setState({ errorMsg: 'Creation failed.', successMsg: '' });
    }
  }

  render() {
    const { employees, clinics, departments, states, employeeData, errors, successMsg, errorMsg, showPopup, loginInfo } = this.state;

    return (
      <div>
        {showPopup && loginInfo && (
          <div className="popup-overlay">
            <div className="popup-box">
              <h3>{employeeData.role} created!</h3>
              <p>Username: <code>{loginInfo.username}</code></p>
              <p>Password: <code>{loginInfo.password}</code></p>
              <button onClick={() => this.setState({ showPopup: false, loginInfo: null })}>Close</button>
            </div>
          </div>
        )}

        <form onSubmit={this.handleSubmit} className="admin-box">
          <h3>Create New Employee</h3>
          {successMsg && <div className="success-message">{successMsg}</div>}
          {errorMsg && <div className="error-message">{errorMsg}</div>}

          <input name="first_name" placeholder="First Name *" value={employeeData.first_name} onChange={this.handleChange} className={errors.first_name?'input-error':''} />
          {errors.first_name && <div className="error-message">{errors.first_name}</div>}

          <input name="last_name" placeholder="Last Name *" value={employeeData.last_name} onChange={this.handleChange} className={errors.last_name?'input-error':''} />
          {errors.last_name && <div className="error-message">{errors.last_name}</div>}

          <input name="middle_name" placeholder="Middle Name" value={employeeData.middle_name} onChange={this.handleChange} />

          <h4>Address</h4>
          {['street_num','street_name','postal_code','city'].map(f => (
            <div key={f}>
              <input name={f} placeholder={`${f.replace('_',' ')} *`} value={employeeData.address[f]} onChange={this.handleChange} className={errors[f]?'input-error':''} />
              {errors[f] && <div className="error-message">{errors[f]}</div>}
            </div>
          ))}
          <select name="state" value={employeeData.address.state} onChange={this.handleChange} className={errors.state?'input-error':''}>
            <option value="">-- Select State --</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <input type="email" name="email" placeholder="Email *" value={employeeData.email} onChange={this.handleChange} className={errors.email?'input-error':''} />
          {errors.email && <div className="error-message">{errors.email}</div>}

          <input name="phone" placeholder="Phone * (10 digits)" value={employeeData.phone} onChange={this.handleChange} className={errors.phone?'input-error':''} />

          <label><h4>Date of Birth *</h4></label>
          <input type="date" name="dob" value={employeeData.dob} onChange={this.handleChange} className={errors.dob?'input-error':''} />

          <input name="education" placeholder="Education" value={employeeData.education} onChange={this.handleChange} />

          <select name="sex" value={employeeData.sex} onChange={this.handleChange} className={errors.sex?'input-error':''}>
            <option value="">-- Select Gender --</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <select
            name="role"
            value={employeeData.role}
            onChange={this.handleChange}
            required
          >
            <option value="">-- Select Role --</option>
            <option value="Doctor">Doctor</option>
            <option value="Nurse">Nurse</option>
            <option value="Receptionist">Receptionist</option>
            <option value="Database Administrator">Database Administrator</option>
          </select>

          {errors.role && <div className="error-message">{errors.role}</div>}

          {employeeData.role === 'Doctor' && (
            <input name="specialization" placeholder="Specialization *" value={employeeData.specialization} onChange={this.handleChange} className={errors.specialization?'input-error':''} />
          )}
          {errors.specialization && <div className="error-message">{errors.specialization}</div>}

          {(employeeData.role === 'Doctor' || employeeData.role === 'Nurse') && (
            <select name="department_id" value={employeeData.department_id} onChange={this.handleChange} className={errors.department_id?'input-error':''}>
              <option value="">-- Select Department --</option>
              {departments.map(d => <option key={d.department_id} value={d.department_id}>{d.department_name}</option>)}
            </select>
          )}
          {errors.department_id && <div className="error-message">{errors.department_id}</div>}

          {(employeeData.role === 'Doctor' || employeeData.role === 'Nurse') && (
            <input name="license_number" placeholder="License Number *" value={employeeData.license_number} onChange={this.handleChange} className={errors.license_number?'input-error':''} />
          )}
          {errors.license_number && <div className="error-message">{errors.license_number}</div>}

          <select name="clinic_id" value={employeeData.clinic_id} onChange={this.handleChange} className={errors.clinic_id?'input-error':''}>
            <option value="">-- Select Clinic --</option>
            {clinics.map(c => <option key={c.clinic_id} value={c.clinic_id}>{c.clinic_name}</option>)}
          </select>
          {errors.clinic_id && <div className="error-message">{errors.clinic_id}</div>}

          <label><h4>Hire Date *</h4></label>
          <input type="date" name="hire_date" value={employeeData.hire_date} onChange={this.handleChange} className={errors.hire_date?'input-error':''} />
          {errors.hire_date && <div className="error-message">{errors.hire_date}</div>}

          <button type="submit" className="submit-btn">Add Employee</button>
        </form>
      </div>
    );
  }
}

export default CreateEmployeeForm;
