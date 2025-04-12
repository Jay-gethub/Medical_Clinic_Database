import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/PatientLogin.css';
import logo from '../../assets/clinic-logo.png';
import bgImage from '../../assets/Home.png';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
const PatientLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username || !password) {
      setErrorMsg("Please enter both username and password.");
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/login', { username, password });

      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect based on role
      if (user.role === 'Patient') {
        // Resolve patient_id using username
        const resolveRes = await axios.get(`http://localhost:5000/api/patient/resolve-by-username/${username}`);

        const patientId = resolveRes.data.patient_id;
  
        // Store patient_id for later use (e.g., in dashboard)
        localStorage.setItem('patientId', patientId);
  
        // Navigate
        navigate('/patient/dashboard');
      }
  
    }  catch (err) {
      setErrorMsg(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div
  className="auth-page" 
  style={{
    backgroundImage: `url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100vh'
  }}
> <nav className="navbar">
  <div className="logo">
    <img src={require('../../assets/clinic-logo.png')} alt="MedBridge Clinic Logo" />
    <h1>Care Connect Clinic</h1>
  </div>
  <ul className="nav-links">
    <li><a href="/">Home</a></li>
    <li><a href="#about">About Us</a></li>
          <li><a href="#services">Services</a></li>
       
  </ul>
</nav>

    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="MedBridge Clinic Logo" className="login-logo" />
        <h2>Patient Login</h2>
        <form onSubmit={handleSubmit}>
          {/* <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          /> */}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
          />
          
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
           
            <span
            className="eye-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </span>
          
             
          </div>
          {errorMsg && <p className="error-msg">{errorMsg}</p>}
          <button type="submit">Login</button>
        </form>
        <p className="register-link">
          Are you a new patient? <a href="/register">Register here.</a>
        </p>
      </div>
    </div>
    </div>
  );
};

export default PatientLogin;
          
