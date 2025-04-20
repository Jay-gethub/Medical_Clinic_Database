import React from 'react';
import "../../styles/About.css";
import logo from '../../assets/clinic-logo.png';

import doctorTeamImage from '../../assets/doctor-team.jpg';
import missionImage from '../../assets/mission-image.png';
import hexagonBgImage from '../../assets/medical-hexagon-bg.jpg';
const About = () => {
    return (
      <div 
        className="about"
        style={{
          backgroundImage: `url(${hexagonBgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed' // 
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
            {/* <li><a href="/about">About Us</a></li> */}
            <li><a href="/services">Services</a></li>
            <li><a href="/login">Patient Login</a></li>
            <li><a href="/login/employee">Employee Login</a></li>
          </ul>
        </nav>
  
        <main className="about-main">
          <div className="about-header">
            <h1>About Care Connect Clinic</h1>
            <p>Providing Quality Healthcare</p>
          </div>
          
          <section className="about-intro">
            <div className="about-content">
              <h2>Who We Are</h2>
              <p>
                Care Connect Clinic was founded with a simple mission: to provide accessible, 
                high-quality healthcare to our communities. What began as a small practice has grown 
                into a network of clinics across Houston, Miami, and New Orleans, serving thousands 
                of patients each year.
              </p>
              <p>
                Our team of board-certified physicians, nurse practitioners, and healthcare professionals 
                are committed to delivering personalized care that meets the unique needs of each patient.
              </p>
            </div>
            <div className="about-image">
              <img src={doctorTeamImage} alt="Care Connect medical team" />
            </div>
          </section>
  
          <section className="mission-values">
            <div className="mission-image">
              <img src={missionImage} alt="Care Connect mission" />
            </div>
            <div className="mission-content">
              <h2>Our Mission & Values</h2>
              <div className="value-item">
                <h3>Patient-Centered Care</h3>
                <p>We put patients first, designing our services around their needs and preferences.</p>
              </div>
              <div className="value-item">
                <h3>Excellence</h3>
                <p>We strive for excellence in all aspects of healthcare delivery, from clinical care to customer service.</p>
              </div>
              <div className="value-item">
                <h3>Compassion</h3>
                <p>We approach each patient with empathy, dignity, and respect.</p>
              </div>
              <div className="value-item">
                <h3>Innovation</h3>
                <p>We embrace new technologies and approaches to continually improve patient outcomes.</p>
              </div>
            </div>
          </section>
  
          {/* <section className="team-section">
            <h2>Our Leadership Team</h2>
            <div className="team-grid">
              <div className="team-member">
                <h3>Dr. Emily Johnson</h3>
                <p className="title">Medical Director</p>
                <p>Board Certified in Internal Medicine with over 15 years of experience in primary care.</p>
              </div>
              <div className="team-member">
                <h3>Dr. Michael Rodriguez</h3>
                <p className="title">Chief Medical Officer</p>
                <p>Specializes in Family Medicine with a focus on preventative care and chronic disease management.</p>
              </div>
              <div className="team-member">
                <h3>Sarah Thompson</h3>
                <p className="title">Director of Nursing</p>
                <p>MSN with expertise in patient education and care coordination.</p>
              </div>
              <div className="team-member">
                <h3>James Wilson</h3>
                <p className="title">Operations Director</p>
                <p>MBA with a background in healthcare administration and quality improvement.</p>
              </div>
            </div>
          </section> */}
  
          <section className="insurance-section">
            <h2>Insurance & Payments</h2>
            <p>We accept most major insurance plans and offer flexible payment options for our patients.</p>
            <div className="insurance-list">
              <ul>
                <li>Medicare</li>
                <li>Medicaid</li>
                <li>Blue Cross Blue Shield</li>
                <li>Aetna</li>
                <li>Cigna</li>
                <li>UnitedHealthcare</li>
                <li>Humana</li>
              </ul>
            </div>
            <p>Don't see your insurance listed? Contact our billing department at (555) 123-4567.</p>
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
  
  export default About;