import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Sidebar from "../../components/Sidebar";
import Select from "react-select";
import { jwtDecode } from "jwt-decode";
import * as XLSX from "xlsx";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AddBlock = () => {
  const [formData, setFormData] = useState({
    SId: "",
    BlockName: "",
  });
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [editingBlock, setEditingBlock] = useState(null);
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
      console.log(userId);

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSocietyChange = (selectedOption) => {
    const societyId = selectedOption.value;
    setFormData({
      ...formData,
      SId: societyId,
    });
    fetchBlocks(societyId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingBlock) {
        // Update existing block using PATCH method
        await axios.patch(
          `${API_URL}/blocks/${editingBlock._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        toast.success("Block updated successfully!");
        setEditingBlock(null);
      } else {
        // Add new block
        await axios.post(`${API_URL}/blocks`, formData, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });
        toast.success("Block added successfully!");
      }

      setFormData({
        SId: "",
        BlockName: "",
      });
      fetchBlocks(formData.SId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error processing block");
    } finally {
      setLoading(false);
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

  const handleEdit = (block) => {
    setEditingBlock(block);
    setFormData({
      ...formData,
      BlockName: block.BlockName,
    });
  };

  const handleDelete = async (blockId) => {
    if (window.confirm("Are you sure you want to delete this block?")) {
      try {
        await axios.delete(`${API_URL}/blocks/${blockId}`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });
        toast.success("Block deleted successfully!");
        fetchBlocks(formData.SId);
      } catch (error) {
        toast.error(error.response?.data?.message || "Error deleting block");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingBlock(null);
    setFormData({
      ...formData,
      BlockName: "",
    });
  };

  const handleFileChange = (e) => {
    setImportFile(e.target.files[0]);
  };

  const handleImport = async () => {
    if (!formData.SId) {
      toast.error("Please select a society first");
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
          const blockName = row.BlockName || row.blockName || row.Block || row.block || Object.values(row)[0];
          
          if (!blockName) continue;

          try {
            await axios.post(`${API_URL}/blocks`, 
              { SId: formData.SId, BlockName: blockName },
              {
                headers: {
                  Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
              }
            );
            successCount++;
          } catch (error) {
            errorCount++;
            console.error("Error importing block:", blockName, error);
          }
        }

        toast.success(`Successfully imported ${successCount} blocks`);
        if (errorCount > 0) {
          toast.warning(`Failed to import ${errorCount} blocks`);
        }
        
        fetchBlocks(formData.SId);
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

  const downloadTemplate = () => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Create sample data
    const sampleData = [
      { BlockName: "Block A" },
      { BlockName: "Block B" },
      { BlockName: "Block C" }
    ];
    
    // Convert sample data to worksheet
    const ws = XLSX.utils.json_to_sheet(sampleData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Blocks Template");
    
    // Generate and download the file
    XLSX.writeFile(wb, "blocks_import_template.xlsx");
    
    toast.success("Template downloaded successfully");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userRole={userRole} />
      <div className="flex-1 ml-64 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">
            {editingBlock ? "Edit Block" : "Add New Block"}
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
                  isDisabled={editingBlock !== null}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Block Name
                </label>
                <input
                  type="text"
                  name="BlockName"
                  value={formData.BlockName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter block name"
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
                >
                  {loading
                    ? editingBlock
                      ? "Updating..."
                      : "Adding..."
                    : editingBlock
                    ? "Update Block"
                    : "Add Block"}
                </button>
                
                {editingBlock && (
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
              <h2 className="text-xl font-semibold">Import Blocks</h2>
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
                  Excel file should have a column named "BlockName" or first column with block names
                </p>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={loading || !importFile}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-300"
                >
                  {loading ? "Importing..." : "Import Blocks"}
                </button>
              </div>
            </div>
          </div>

          {/* Blocks List Section */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <h2 className="text-xl font-semibold p-6 border-b">Blocks</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Block Name
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {blocks.length > 0 ? (
                    blocks.map((block) => (
                      <tr key={block._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {block.BlockName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(block)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(block._id)}
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
                        No blocks found
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

export default AddBlock;
