import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Sidebar from '../../components/Sidebar';
import Select from 'react-select';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AddSociety = () => {
  const [formData, setFormData] = useState({
    City: '',
    SocietyName: '',
    Address: '',
    NumberofBlocks: '',
    NumberofUnits: ''
  });
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [societies, setSocieties] = useState([]);
  
  const userRole = sessionStorage.getItem('userRole');

  useEffect(() => {
    fetchCities();
    fetchSocieties();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await axios.get(`${API_URL}/cities`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      setCities(response.data);
    } catch (error) {
      toast.error('Error fetching cities');
    }
  };

  const fetchSocieties = async () => {
    try {
      const response = await axios.get(`${API_URL}/societies`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      setSocieties(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.warn('No Societies Found');
        setSocieties([]);
      } else {
        toast.error('Error fetching societies');
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCityChange = (selectedOption) => {
    setFormData({
      ...formData,
      City: selectedOption.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(`${API_URL}/societies`, formData, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      toast.success('Society added successfully!');
      setFormData({
        City: '',
        SocietyName: '',
        Address: '',
        NumberofBlocks: '',
        NumberofUnits: ''
      });
      fetchSocieties();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding society');
    } finally {
      setLoading(false);
    }
  };

  const cityOptions = cities.map(city => ({
    value: city.City,
    label: city.City
  }));

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userRole={userRole} />
      <div className="flex-1 ml-64 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Register New Society</h1>

          {/* Form Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <Select
                  options={cityOptions}
                  onChange={handleCityChange}
                  placeholder="Search and select city"
                  className="basic-single"
                  classNamePrefix="select"
                  isSearchable={true}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Society Name
                </label>
                <input
                  type="text"
                  name="SocietyName"
                  value={formData.SocietyName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter society name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  name="Address"
                  value={formData.Address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter complete address"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Blocks
                </label>
                <input
                  type="number"
                  name="NumberofBlocks"
                  value={formData.NumberofBlocks}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter number of blocks"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Units
                </label>
                <input
                  type="number"
                  name="NumberofUnits"
                  value={formData.NumberofUnits}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter number of units"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
                >
                  {loading ? 'Adding...' : 'Register Society'}
                </button>
              </div>
            </form>
          </div>

          {/* Society List Section */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <h2 className="text-xl font-semibold p-6 border-b">Registered Societies</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Society Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blocks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {societies.length > 0 ? (
                    societies.map((society) => (
                      <tr key={society._id}>
                        <td className="px-6 py-4 whitespace-nowrap">{society.SocietyName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{society.City}</td>
                        <td className="px-6 py-4">{society.Address}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{society.NumberofBlocks}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{society.NumberofUnits}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No societies found</td>
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

export default AddSociety
