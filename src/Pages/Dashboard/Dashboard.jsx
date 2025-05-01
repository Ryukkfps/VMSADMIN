import React, { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';
import Sidebar from '../../components/Sidebar';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;
        const response = await axios.get(`${API_URL}/users/${userId}/role`);
        setUserRole(response.data.roleName);
        sessionStorage.setItem('userRole', response.data.roleName);
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    fetchUserRole();
  }, []);

  if (!userRole) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userRole={userRole} />
      <div className="flex-1 ml-64 p-6 overflow-auto">
        {userRole === 'SuperAdmin' ? (
          <SuperAdminDashboard />
        ) : (
          <AdminDashboard />
        )}
      </div>
    </div>
  );
};

export default Dashboard;

