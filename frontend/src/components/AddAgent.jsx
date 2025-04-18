import React, { useState } from 'react';
import axios from 'axios';
import { UserPlus, AlertCircle } from 'lucide-react';

function AddAgent() {
  const initialFormData = {
    name: '',
    email: '',
    mobile: '',
    password: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const response = await axios.post(
        'http://localhost:5000/api/agents',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess('Agent added successfully!');
      setFormData(initialFormData); // Reset form
    } catch (err) {
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to add agent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
          <UserPlus className="w-6 h-6 mr-2" />
          Add New Agent
        </h2>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Form Panel - Left Side */}
        <div className="col-span-8">
          <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter agent's full name"
                />
              </div>

              <div className="col-span-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter agent's email"
                />
              </div>

              <div className="col-span-1">
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-900">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{10}"
                  className="mt-1 block w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter 10-digit mobile number"
                />
              </div>

              <div className="col-span-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="mt-1 block w-full px-4 py-3 bg-white/50 backdrop-blur-xl border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter password (min 6 characters)"
                />
              </div>

              <div className="col-span-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setFormData(initialFormData)}
                  className="px-6 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white/50 backdrop-blur-xl hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600/90 backdrop-blur-xl hover:bg-indigo-700/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-300"
                >
                  {loading ? 'Adding...' : 'Add Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Status Panel - Right Side */}
        <div className="col-span-4">
          {(error || success) && (
            <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
              {error && (
                <div className="p-4 bg-red-100/90 backdrop-blur-xl border border-red-400 text-red-700 rounded-xl flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {error}
                </div>
              )}
              {success && (
                <div className="p-4 bg-green-100/90 backdrop-blur-xl border border-green-400 text-green-700 rounded-xl flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {success}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddAgent;