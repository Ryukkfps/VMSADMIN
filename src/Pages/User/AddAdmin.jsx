import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Sidebar from "../../components/Sidebar";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AddAdmin = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAdmin, setEditingAdmin] = useState(null);

  const userRole = sessionStorage.getItem('userRole');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/admins`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      if (response.status === 404) {
        toast.warn("No Admins Found");
        setAdmins([]);
      } else {
        setAdmins(response.data);
      }
      setLoading(false);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.warn("No Admins Found");
        setAdmins([]);
      }
      setLoading(false);
    }
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
      const adminData = {
        Name: formData.name,
        Email: formData.email,
        Phone: formData.phone,
        password: generatePassword(),
        RoleId: "67d679fb45044b166b2fc8ec",
      };

      await axios.post(`${API_URL}/users`, adminData, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      toast.success(
        "Admin created successfully! Password has been sent to their email."
      );
      setFormData({ name: "", email: "", phone: "", password: "" });
      fetchAdmins(); // Refresh the admin list
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating admin");
    }
  };

  const handleStatusChange = async (adminId, currentStatus) => {
    try {
      console.log(adminId, currentStatus);
      await axios.post(
        `${API_URL}/users/status`,
        {
          userId: adminId,
          status: !currentStatus
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Admin status updated successfully");
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating admin status");
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.Name,
      email: admin.Email,
      phone: admin.Phone,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(
        `${API_URL}/users/${editingAdmin._id}`,
        {
          Name: formData.name,
          Email: formData.email,
          Phone: formData.phone,
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Admin updated successfully");
      setEditingAdmin(null);
      setFormData({ name: "", email: "", phone: "", password: "" });
      fetchAdmins();
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error("Admin not found");
      } else {
        toast.error(error.response?.data?.message || "Error updating admin");
      }
    }
  };

  return (
    <div className="flex">
      <Sidebar userRole={userRole} />
      <div className="flex-1 ml-64 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">
            {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
          </h1>

          {/* Form Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <form onSubmit={editingAdmin ? handleUpdate : handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  placeholder="Enter admin name"
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
                  placeholder="Enter admin email"
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

              <div className="md:col-span-2">
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Password will be automatically generated
                    and sent to the admin's email address.
                  </p>
                </div>
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  {editingAdmin ? 'Update Admin' : 'Create Admin'}
                </button>

                {editingAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAdmin(null);
                      setFormData({ name: "", email: "", phone: "", password: "" });
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Admin List Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <h2 className="text-xl font-bold p-6 border-b">Admin List</h2>
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {admins.map((admin) => (
                      <tr key={admin._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{admin.Name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{admin.Email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="text-sm text-gray-500">{admin.Phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            admin.status 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {admin.status ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => handleEdit(admin)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleStatusChange(admin._id, admin.status)}
                              className="relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none"
                              style={{
                                backgroundColor: admin.status ? '#10B981' : '#EF4444'
                              }}
                            >
                              <span className="sr-only">
                                {admin.status ? 'Deactivate' : 'Activate'}
                              </span>
                              <span
                                className={`${
                                  admin.status ? 'translate-x-6' : 'translate-x-1'
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

export default AddAdmin;
