import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Sidebar from "../../components/Sidebar";
import Select from "react-select";
import { jwtDecode } from "jwt-decode";
import * as XLSX from "xlsx";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AddUnit = () => {
  const [formData, setFormData] = useState({
    BlockId: "",
    FlatNumber: "",
  });
  const [societies, setSocieties] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSociety, setSelectedSociety] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const userRole = sessionStorage.getItem("userRole");

  useEffect(() => {
    fetchSocieties();
  }, []);

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

  const fetchBlocks = async (societyId) => {
    if (!societyId) return;
    try {
      const response = await axios.post(
        `${API_URL}/blocks/societyid`,
        {
          societyid: societyId
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      setBlocks(response.data);
    } catch (error) {
      toast.error("Error fetching blocks");
    }
  };

  const fetchUnits = async (blockId) => {
    if (!blockId) return;
    try {
      const response = await axios.post(
        `${API_URL}/units/blockid`,
        {
          blockid: blockId
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      setUnits(response.data);
    } catch (error) {
      toast.error("Error fetching units");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSocietyChange = (selectedOption) => {
    const societyId = selectedOption.value;
    setSelectedSociety(societyId);
    setFormData({
      ...formData,
      BlockId: "",
    });
    fetchBlocks(societyId);
  };

  const handleBlockChange = (selectedOption) => {
    const blockId = selectedOption.value;
    setFormData({
      ...formData,
      BlockId: blockId,
    });
    fetchUnits(blockId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingUnit) {
        // Update existing unit
        await axios.patch(
          `${API_URL}/units/${editingUnit._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        toast.success("Unit updated successfully!");
        setEditingUnit(null);
      } else {
        // Add new unit
        await axios.post(`${API_URL}/units`, formData, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });
        toast.success("Unit added successfully!");
      }

      setFormData({
        BlockId: formData.BlockId,
        FlatNumber: "",
      });
      fetchUnits(formData.BlockId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error processing unit");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (unit) => {
    setEditingUnit(unit);
    setFormData({
      ...formData,
      FlatNumber: unit.FlatNumber,
      BlockId: unit.BlockId,
    });
  };

  const handleDelete = async (unitId) => {
    if (window.confirm("Are you sure you want to delete this unit?")) {
      try {
        await axios.delete(`${API_URL}/units/${unitId}`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });
        toast.success("Unit deleted successfully!");
        fetchUnits(formData.BlockId);
      } catch (error) {
        toast.error(error.response?.data?.message || "Error deleting unit");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingUnit(null);
    setFormData({
      ...formData,
      FlatNumber: "",
    });
  };

  const handleFileChange = (e) => {
    setImportFile(e.target.files[0]);
  };

  const handleImport = async () => {
    if (!formData.BlockId) {
      toast.error("Please select a block first");
      return;
    }

    if (!importFile) {
      toast.error("Please select an Excel file to import");
      return;
    }

    setLoading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet);
        
        if (rows.length === 0) {
          toast.error("No data found in the Excel file");
          setLoading(false);
          return;
        }

        let successCount = 0;
        let errorCount = 0;

        // Process each row
        for (const row of rows) {
          const flatNumber = row.FlatNumber || row.flatNumber || row.UnitNumber || row.unitNumber || Object.values(row)[0];
          
          if (!flatNumber) continue;

          try {
            await axios.post(`${API_URL}/units`, 
              { BlockId: formData.BlockId, FlatNumber: flatNumber },
              {
                headers: {
                  Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
              }
            );
            successCount++;
          } catch (error) {
            errorCount++;
            console.error("Error importing unit:", flatNumber, error);
          }
        }

        toast.success(`Successfully imported ${successCount} units`);
        if (errorCount > 0) {
          toast.warning(`Failed to import ${errorCount} units`);
        }
        
        fetchUnits(formData.BlockId);
      };
      
      reader.readAsArrayBuffer(importFile);
    } catch (error) {
      toast.error("Error processing Excel file");
    } finally {
      setLoading(false);
      setImportFile(null);
    }
  };

  const societyOptions = societies.map((society) => ({
    value: society._id,
    label: society.SocietyName,
  }));

  const blockOptions = blocks.map((block) => ({
    value: block._id,
    label: block.BlockName,
  }));

  const downloadTemplate = () => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Create sample data
    const sampleData = [
      { FlatNumber: "101" },
      { FlatNumber: "102" },
      { FlatNumber: "103" }
    ];
    
    // Convert sample data to worksheet
    const ws = XLSX.utils.json_to_sheet(sampleData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Units Template");
    
    // Generate and download the file
    XLSX.writeFile(wb, "units_import_template.xlsx");
    
    toast.success("Template downloaded successfully");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userRole={userRole} />
      <div className="flex-1 ml-64 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">
            {editingUnit ? "Edit Unit" : "Add New Unit"}
          </h1>

          {/* Form Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Society
                </label>
                <Select
                  options={societyOptions}
                  onChange={handleSocietyChange}
                  placeholder="Select society"
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable={true}
                  isDisabled={editingUnit !== null}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Block
                </label>
                <Select
                  options={blockOptions}
                  onChange={handleBlockChange}
                  placeholder="Select block"
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable={true}
                  isDisabled={!selectedSociety || editingUnit !== null}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Number (Flat Number)
                </label>
                <input
                  type="text"
                  name="FlatNumber"
                  value={formData.FlatNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter unit number"
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  disabled={loading || !formData.BlockId}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
                >
                  {loading
                    ? editingUnit
                      ? "Updating..."
                      : "Adding..."
                    : editingUnit
                    ? "Update Unit"
                    : "Add Unit"}
                </button>
                
                {editingUnit && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Import Section with Download Template Button */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Import Units</h2>
              <button
                type="button"
                onClick={downloadTemplate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Template
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Excel File
                </label>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Excel file should have a column named "FlatNumber" or first column with unit numbers
                </p>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={loading || !importFile || !formData.BlockId}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-300"
                >
                  {loading ? "Importing..." : "Import Units"}
                </button>
              </div>
            </div>
          </div>

          {/* Units List Section */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <h2 className="text-xl font-semibold p-6 border-b">Units</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Number
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {units.length > 0 ? (
                    units.map((unit) => (
                      <tr key={unit._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {unit.FlatNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(unit)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(unit._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="2"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No units found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUnit
