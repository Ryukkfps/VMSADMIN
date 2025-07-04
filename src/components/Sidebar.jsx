import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Sidebar = ({userRole}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userRole');
    navigate('/login');
  };

  const renderMenuItems = () => {
    if (userRole === 'SuperAdmin') {
      return (
        <>
          <li className="mb-4">
            <Link to="/dashboard" className="hover:text-blue-400">Dashboard</Link>
          </li>
          <li className="mb-4">
            <Link to="/add-admin" className="hover:text-blue-400">Manage Admins</Link>
          </li>
          <li className="mb-4">
            <Link to="/register-society" className="hover:text-blue-400">Manage Societies</Link>
          </li>
          <li className="mb-4">
            <Link to="/admin-analytics" className="hover:text-blue-400">Admin Analytics</Link>
          </li>
          <li className="mb-4">
            <Link to="/feedback" className="hover:text-blue-400">Feedback</Link>
          </li>
        </>
      );
    } else {
      return (
        <>
          <li className="mb-4">
            <Link to="/dashboard" className="hover:text-blue-400">Dashboard</Link>
          </li>
          <li className="mb-4">
            <Link to="/add-user" className="hover:text-blue-400">Add User</Link>
          </li>
          <li className="mb-4">
            <Link to="/add-blocks" className="hover:text-blue-400">Add Blocks</Link>
          </li>
          <li className="mb-4">
            <Link to="/add-units" className="hover:text-blue-400">Add Units</Link>
          </li>
          <li className="mb-4">
            <Link to="/unit-approval" className="hover:text-blue-400">Unit Approval</Link>
          </li>
          
        </>
      );
    }
  };

  return (
    <div className="sidebar bg-gray-800 text-white w-64 fixed h-screen p-4 overflow-y-auto z-10">
      <h2 className="text-2xl font-bold mb-6">
        {userRole === 'SuperAdmin' ? 'Super Admin' : 'Admin'} Dashboard
      </h2>
      <nav>
        <ul>
          {renderMenuItems()}
          <li className="mb-4">
            <button 
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
