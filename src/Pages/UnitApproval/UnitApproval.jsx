import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Sidebar from "../../components/Sidebar";
import Select from "react-select";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const UnitApproval = () => {
  const [societies, setSocieties] = useState([]);
  const [selectedSociety, setSelectedSociety] = useState(null);
  const [homes, setHomes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(sessionStorage.getItem("userRole"));

  useEffect(() => {
    fetchSocieties();
  }, []);

  const fetchSocieties = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${API_URL}/societies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSocieties(response.data);
    } catch (error) {
      toast.error("Error fetching societies");
    }
  };

  const fetchHomes = async (societyId) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${API_URL}/homes/society/${societyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHomes(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setHomes([]);
        toast.warn("No homes found for this society");
      } else {
        toast.error("Error fetching homes");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocietyChange = (option) => {
    setSelectedSociety(option);
    if (option) fetchHomes(option.value);
    else setHomes([]);
  };

  const handleApprove = async (homeId) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.patch(
        `${API_URL}/homes/status/${homeId}`,
        { status: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Unit approved successfully");
      if (selectedSociety) fetchHomes(selectedSociety.value);
    } catch (error) {
      toast.error("Error approving unit");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar userRole={userRole} />
      <div className="flex-1 ml-64 p-6 overflow-auto">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Unit Approval</h2>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Society
            </label>
            <Select
              options={societies.map((s) => ({ value: s._id, label: s.SocietyName }))}
              value={selectedSociety}
              onChange={handleSocietyChange}
              isClearable
              placeholder="Choose a society..."
              className="w-full max-w-md"
            />
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading homes...</div>
          ) : selectedSociety && (
            <div className="overflow-x-auto rounded-md border">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Owner</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Block</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Flat</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Ownership</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Occupancy</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {homes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-gray-500 py-6">No homes pending approval.</td>
                    </tr>
                  ) : (
                    homes.map((home) => (
                      <tr key={home._id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">{home.UserId?.Name || "-"}</td>
                        <td className="px-4 py-2">{home.BId?.BlockName || "-"}</td>
                        <td className="px-4 py-2">{home.UId?.FlatNumber || "-"}</td>
                        <td className="px-4 py-2">{home.OwnershipType?.TypeName || "-"}</td>
                        <td className="px-4 py-2">{home.OccupancyStatus?.OSName || "-"}</td>
                        <td className="px-4 py-2">
                          <button
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                            onClick={() => handleApprove(home._id)}
                          >
                            Approve
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnitApproval;