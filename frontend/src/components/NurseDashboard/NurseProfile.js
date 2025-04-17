//NurseProfile.js
//nurse profile page
import React, { useState, useEffect } from 'react';
import '../../styles/AdminDashboard.css'; // can rename this later if needed

const NurseProfile = () => {
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

  const handleSave = async (e) => {
    e.preventDefault();
  
    try {
      const res = await fetch(`http://localhost:5000/api/employee/update-profile/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });
  
      const result = await res.json();
  
      if (res.ok) {
        alert('Profile updated successfully!');
      } else {
        console.error('Update failed:', result.error);
        alert('Failed to update profile.');
      }
    } catch (error) {
      console.error('Error during update:', error);
      alert('An error occurred while updating profile.');
    }
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

export default NurseProfile;
