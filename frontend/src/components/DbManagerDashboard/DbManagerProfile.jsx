import React, { useState, useEffect } from 'react';
import '../../styles/DbManagerDashboard.css';

const DbManagerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const userData = JSON.parse(localStorage.getItem('user'));
  const employeeId = userData?.employee_id;

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
          last_login: data.last_login || '',
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load profile:', err);
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
        headers: { 'Content-Type': 'application/json' },
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
      alert('An error occurred while updating the profile.');
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (!profile) return <p>Unable to load profile.</p>;

  return (
    <form onSubmit={handleSave} className="admin-box">
      <input name="first_name" value={profile.first_name} onChange={handleChange} required />
      <input name="last_name" value={profile.last_name} onChange={handleChange} required />
      <input type="email" name="email" value={profile.email} onChange={handleChange} required />
      <input name="phone" value={profile.phone} onChange={handleChange} required />
      <p><strong>Last Login:</strong> {new Date(profile.last_login).toLocaleString()}</p>
      <button type="submit">Save Changes</button>
    </form>
  );
};

export default DbManagerProfile;
