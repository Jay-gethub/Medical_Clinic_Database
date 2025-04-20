import React from 'react';
import "../../styles/Services.css";
import logo from '../../assets/clinic-logo.png';
import bgImage from '../../assets/healthcare-bg.jpg';

const Services = () => {
  return (
    <div 
      className="services"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <nav className="navbar">
        <div className="logo">
          <a href="/">
            <img src={logo} alt="Care Connect Clinic Logo" />
            <h1>Care Connect Clinic</h1>
          </a>
        </div>
        <ul className="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="/about">About Us</a></li>
          <li><a href="/login">Patient Login</a></li>
          <li><a href="/login/employee">Employee Login</a></li>
        </ul>
      </nav>

      <main className="services-main">
        <div className="services-header">
          <h1>Our Services</h1>
          <p>Comprehensive healthcare solutions for your entire family</p>
        </div>
        
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon primary-care"></div>
            <h2>Primary Care</h2>
            <p>Our primary care services focus on prevention, early detection, and management of common health conditions.</p>
            <ul className="service-features">
              <li>Annual physical examinations</li>
              <li>Preventive health screenings</li>
              <li>Immunizations and vaccinations</li>
              <li>Management of chronic conditions</li>
              <li>Treatment of acute illnesses</li>
            </ul>
            
          </div>

          <div className="service-card">
            <div className="service-icon pediatrics"></div>
            <h2>Pediatrics</h2>
            <p>Specialized healthcare for infants, children, and adolescents to support healthy growth and development.</p>
            <ul className="service-features">
              <li>Well-child visits</li>
              <li>Childhood immunizations</li>
              <li>Developmental screenings</li>
              <li>School and sports physicals</li>
              <li>Treatment of childhood illnesses</li>
            </ul>
            
          </div>

          <div className="service-card">
            <div className="service-icon internal-medicine"></div>
            <h2>Internal Medicine</h2>
            <p>Comprehensive care for adults focusing on prevention, diagnosis, and treatment of adult diseases.</p>
            <ul className="service-features">
              <li>Comprehensive adult physicals</li>
              <li>Management of complex chronic conditions</li>
              <li>Specialized diagnostic services</li>
              <li>Health risk assessments</li>
              <li>Coordination with specialists</li>
            </ul>
            
          </div>

          <div className="service-card">
            <div className="service-icon cardiology"></div>
            <h2>Cardiology</h2>
            <p>Specialized care for heart health, focusing on prevention, diagnosis, and treatment of cardiovascular conditions.</p>
            <ul className="service-features">
              <li>Cardiovascular risk assessments</li>
              <li>ECG/EKG monitoring</li>
              <li>Blood pressure management</li>
              <li>Cholesterol management</li>
              <li>Heart disease prevention</li>
            </ul>
      
          </div>
        </div>

        <section className="additional-services">
          <h2>Diagnostic Services</h2>
          <p>We offer a range of diagnostic services to help identify and treat health conditions:</p>
          <div className="diagnostic-services">
            <div className="diagnostic-item">
              <h3>Laboratory Tests</h3>
              <p>Complete blood work, urinalysis, and other diagnostic tests</p>
            </div>
            <div className="diagnostic-item">
              <h3>X-Ray</h3>
              <p>Digital X-ray imaging for diagnostic purposes</p>
            </div>
            <div className="diagnostic-item">
              <h3>CT Scan</h3>
              <p>Advanced imaging for detailed internal views</p>
            </div>
            <div className="diagnostic-item">
              <h3>Colonoscopy</h3>
              <p>Colon cancer screening and digestive health</p>
            </div>
            <div className="diagnostic-item">
              <h3>Biopsy</h3>
              <p>Tissue sample collection for diagnosis</p>
            </div>
            <div className="diagnostic-item">
              <h3>Eye Exam</h3>
              <p>Vision testing and eye health assessments</p>
            </div>
          </div>
        </section>

        <section className="appointment-section">
          <div className="appointment-content">
            <h2>Schedule an Appointment</h2>
            <p>Contact us to schedule an appointment with one of our healthcare providers.</p>
            <a href="/login" className="cta-button">Request Appointment</a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <h3>Our Locations</h3>
        <div className="locations">
          <div className="location">
            <strong>Houston, TX</strong>
            <p>123 Medical Plaza, Houston, TX 77002</p>
          </div>
          <div className="location">
            <strong>Miami, FL</strong>
            <p>789 Sunshine Blvd, Miami, FL 33101</p>
          </div>
          <div className="location">
            <strong>New Orleans, LA</strong>
            <p>456 Bourbon Street, New Orleans, LA 70112</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Services;