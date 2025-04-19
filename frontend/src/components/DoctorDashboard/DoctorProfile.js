//admin profile page
import React, { useState, useEffect } from 'react';
import '../../styles/AdminDashboard.css';

const DoctorProfile = () => {
const [profile, setProfile] = useState(null);

  //fetch employee ID from localStorage then fetch employee data from DB
  const userData = JSON.parse(localStorage.getItem('user'));
  const employeeId = userData.employee_id;
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!employeeId) {
      console.error('No employee ID found in localStorage.');
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5000/api/employee/${employeeId}`)
      .then((res) => res.json())
      .then((data) => {
        setProfile({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching profile:', error);
        setLoading(false);
      });
  }, [employeeId]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert('Profile updated successfully! (simulated)');
  };

  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p>Unable to load profile.</p>;

  return (
    <form onSubmit={handleSave} className="admin-box">
      <h3>My Profile</h3>
      <input name="first_name" placeholder="First Name" value={profile.first_name} onChange={handleChange} required />
      <input name="last_name" placeholder="Last Name" value={profile.last_name} onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" value={profile.email} onChange={handleChange} required />
      <input name="phone" placeholder="Phone Number" value={profile.phone} onChange={handleChange} required />
      <button type="submit">Save Changes</button>
    </form>
  );
};

export default DoctorProfile;
