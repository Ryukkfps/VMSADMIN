import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Login from "./Pages/Login/Login";
import Dashboard from "./Pages/Dashboard/Dashboard";
import 'react-toastify/dist/ReactToastify.css';
import AddAdmin from "./Pages/User/AddAdmin";
import AddSociety from "./Pages/SocietyManagement/AddSociety";
import AddUser from "./Pages/User/AddUser";
import AddBlock from "./Pages/SocietyManagement/AddBlock";
import AddUnit from "./Pages/SocietyManagement/AddUnit";
import UnitApproval from "./Pages/UnitApproval/UnitApproval";
// import Navbar from './components/Navbar';

function App() {
  return (
    <>
      <Router>
        <div className="App">
          {/* <Navbar /> */}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-admin" element={<AddAdmin />} />
            <Route path="/add-user" element={<AddUser />} />
            <Route path="/register-society" element={<AddSociety />} />
            <Route path="/add-blocks" element={<AddBlock />} />
            <Route path="/add-units" element={<AddUnit />} />
            <Route path="/unit-approval" element={<UnitApproval />} />
            {/* <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} /> */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
