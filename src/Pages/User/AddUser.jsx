import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Sidebar from "../../components/Sidebar";
import Select from "react-select";
import { jwtDecode } from "jwt-decode";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AddUser = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    roleId: "",
    adminId: "",
    SId: "", // Add society ID to formData
  });
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [societies, setSocieties] = useState([]); // Add state for societies
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  const userRole = sessionStorage.getItem('userRole');

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchAdmins();
    fetchSocieties(); // Fetch societies on component mount
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      if (response.status === 404) {
        toast.warn("No Users Found");
        setUsers([]);
      } else {
        setUsers(response.data);
      }
      setLoading(false);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.warn("No Users Found");
        setUsers([]);
      }
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${API_URL}/roles`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      setRoles(response.data);
    } catch (error) {
      toast.error("Error fetching roles");
    }
  };

  // Add function to fetch admins
  const fetchAdmins = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/admins`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      setAdmins(response.data);
    } catch (error) {
      toast.error("Error fetching admins");
    }
  };

  // Add function to fetch societies
  const fetchSocieties = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;

      const response = await axios.post(
        `${API_URL}/societies/admin/`,
        {
          AdminId: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSocieties(response.data);
    } catch (error) {
      toast.error("Error fetching societies");
    }
  };

  // Add handler for society change
  const handleSocietyChange = (selectedOption) => {
    const societyId = selectedOption.value;
    setFormData({
      ...formData,
      SId: societyId,
    });
  };

  const generatePassword = () => {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        Name: formData.name,
        Email: formData.email,
        Phone: formData.phone,
        RoleId: formData.roleId,
        AdminId: formData.adminId,
        SId: formData.SId, // Include society ID in request
      };

      await axios.post(`${API_URL}/users`, userData, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      toast.success(
        "User created successfully! Password has been sent to their email."
      );
      setFormData({ name: "", email: "", phone: "", password: "", roleId: "", adminId: "", SId: "" });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating user");
    }
  };

  const handleStatusChange = async (userId, currentStatus) => {
    try {
      await axios.post(
        `${API_URL}/users/status`,
        {
          userId: userId,
          status: !currentStatus
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      toast.success("User status updated successfully");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating user status");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.Name,
      email: user.Email,
      phone: user.Phone,
      roleId: user.RoleId,
      adminId: user.AdminId || "",
      SId: user.SId || "", // Include society ID when editing
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(
        `${API_URL}/users/${editingUser._id}`,
        {
          Name: formData.name,
          Email: formData.email,
          Phone: formData.phone,
          RoleId: formData.roleId,
          AdminId: formData.adminId,
          SId: formData.SId, // Include society ID in update
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      toast.success("User updated successfully");
      setEditingUser(null);
      setFormData({ name: "", email: "", phone: "", password: "", roleId: "", adminId: "", SId: "" });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating user");
    }
  };

  return (
    <div className="flex">
      <Sidebar userRole={userRole} />
      <div className="flex-1 p-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">
            {editingUser ? 'Edit User' : 'Add New User'}
          </h1>

          {/* Form Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <form onSubmit={editingUser ? handleUpdate : handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter user name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter user email"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label
                  htmlFor="roleId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Role
                </label>
                <select
                  id="roleId"
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a role</option>
                  {roles
                    .filter(role => role.RoleName !== "SuperAdmin" && role.RoleName !== "Admin" && role.RoleName !== "User")
                    .map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.RoleName}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Society
                </label>
                <Select
                  options={societies.map((society) => ({
                    value: society._id,
                    label: society.SocietyName,
                  }))}
                  onChange={handleSocietyChange}
                  placeholder="Select society"
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable={true}
                  value={formData.SId ? {
                    value: formData.SId,
                    label: societies.find(s => s._id === formData.SId)?.SocietyName || "Select society"
                  } : null}
                />
              </div>

              <div className="md:col-span-2">
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Password will be automatically generated
                    and sent to the user's email address.
                  </p>
                </div>
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>

                {editingUser && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUser(null);
                      setFormData({ name: "", email: "", phone: "", password: "", roleId: "" });
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* User List Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <h2 className="text-xl font-bold p-6 border-b">User List</h2>
            {loading ? (
              <div className="text-center p-6">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Phone</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users
                      .filter(user => 
                        user.RoleId?.RoleName !== "Admin" && 
                        user.RoleId?.RoleName !== "SuperAdmin"
                      )
                      .map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.Name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{user.Email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                            <div className="text-sm text-gray-500">{user.Phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{user.RoleId?.RoleName || "N/A"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.status 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.status ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-3">
                              <button
                                onClick={() => handleEdit(user)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleStatusChange(user._id, user.status)}
                                className="relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none"
                                style={{
                                  backgroundColor: user.status ? '#10B981' : '#EF4444'
                                }}
                              >
                                <span className="sr-only">
                                  {user.status ? 'Deactivate' : 'Activate'}
                                </span>
                                <span
                                  className={`${
                                    user.status ? 'translate-x-6' : 'translate-x-1'
                                  } inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out`}
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUser
