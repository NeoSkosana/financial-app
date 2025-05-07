import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile: React.FC = () => {
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await axios.get('/api/profile', { headers: { Authorization: `Bearer ${token}` } });
        setUsername(res.data.username);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Profile</h1>
      <p><strong>Username:</strong> {username}</p>
    </div>
  );
};

export default Profile;
