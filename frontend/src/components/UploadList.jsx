import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileSpreadsheet, Users, ClipboardList, User, AlertCircle, CheckCircle2, Circle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

function UploadList() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({
    totalAgents: 0,
    totalTasks: 0,
    tasksPerAgent: []
  });
  const [distributionDetails, setDistributionDetails] = useState(null);
  const [expandedAgent, setExpandedAgent] = useState(null);
  const [agentTasks, setAgentTasks] = useState({});
  const [loadingTasks, setLoadingTasks] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/tasks/stats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setDistributionDetails(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file to upload', {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
        },
        icon: '❌',
        position: 'top-center',
      });
      return;
    }

    // Validate file extension
    const allowedExtensions = ['.csv', '.xlsx'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(`.${fileExtension}`)) {
      toast.error('Invalid file format. Please upload a CSV or Excel file (.csv, .xlsx)', {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
        },
        icon: '❌',
        position: 'top-center',
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/tasks/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.message) {
        setDistributionDetails(response.data.distribution);
        toast.success('Tasks have been successfully uploaded and distributed!', {
          duration: 4000,
          style: {
            background: '#10B981',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
          },
          icon: '✅',
          position: 'top-center',
        });
        setFile(null);
        fetchStats();
      }
    } catch (error) {
      console.error('Upload error:', error);
      let errorMessage = 'Error uploading file. Please try again.';
      
      if (error.response) {
        switch (error.response.status) {
          case 400:
            if (error.response.data.message === 'No agents found. Please add agents before uploading tasks.') {
              errorMessage = (
                <div className="text-left">
                  <p className="font-semibold mb-2">No agents found!</p>
                  <p className="text-sm">Please add agents before uploading tasks. You can add agents by clicking the "Add Agent" button in the Agents section.</p>
                </div>
              );
            } else if (error.response.data.message === 'No valid tasks found in the file') {
              errorMessage = 'The file does not contain any valid tasks. Please check the file and try again.';
            } else if (error.response.data.invalidRows) {
              errorMessage = (
                <div className="text-left">
                  <p className="font-semibold mb-2">Invalid data found in the following rows:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    {error.response.data.invalidRows.map((row, index) => (
                      <li key={index} className="text-sm">
                        Row {index + 1}: Missing {!row.FirstName ? 'FirstName' : ''} {!row.Phone ? 'Phone' : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            } else {
              errorMessage = error.response.data.message || 'Invalid file format or empty data';
            }
            break;
          case 401:
            errorMessage = 'Your session has expired. Please login again to continue';
            break;
          case 500:
            errorMessage = 'Server error occurred. Please try again later';
            break;
          default:
            errorMessage = error.response.data.message || 'An error occurred while uploading the file';
        }
      }

      toast.error(errorMessage, {
        duration: 5000,
        style: {
          background: '#EF4444',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
        },
        icon: '❌',
        position: 'top-center',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAgentClick = async (agentId) => {
    if (expandedAgent === agentId) {
      setExpandedAgent(null);
      return;
    }

    try {
      setLoadingTasks(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/tasks/agent/${agentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setAgentTasks(prev => ({
        ...prev,
        [agentId]: response.data
      }));
      setExpandedAgent(agentId);
    } catch (error) {
      console.error('Error fetching agent tasks:', error);
      toast.error('Failed to fetch tasks for this agent');
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleMarkTaskCompleted = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/tasks/task/${taskId}/complete`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Refresh the agent's tasks without closing the list
      if (expandedAgent) {
        const response = await axios.get(`http://localhost:5000/api/tasks/agent/${expandedAgent}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setAgentTasks(prev => ({
          ...prev,
          [expandedAgent]: response.data
        }));
      }
      
      toast.success('Task marked as completed');
    } catch (error) {
      console.error('Error marking task as completed:', error);
      toast.error('Failed to mark task as completed');
    }
  };

  return (
    <div className="space-y-6">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            style: {
              background: '#10B981',
            },
            icon: '✅',
          },
          error: {
            style: {
              background: '#EF4444',
            },
            icon: '❌',
          },
        }}
      />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
          <FileSpreadsheet className="w-6 h-6 mr-2" />
          Upload Task List
        </h2>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Upload Form - Left Side */}
        <div className="col-span-7">
          <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <Upload className="mx-auto h-16 w-16 text-gray-400" />
                <div className="mt-4">
                  <label className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      {file ? file.name : 'Select a file'}
                    </span>
                    <input type="file" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
                <p className="mt-2 text-xs text-gray-500">Supported formats: CSV, XLSX</p>
              </div>

              <button
                type="submit"
                disabled={!file || uploading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white 
                  ${uploading || !file ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {uploading ? 'Uploading...' : 'Upload and Distribute Tasks'}
              </button>
            </form>
          </div>
        </div>

        {/* Requirements Panel - Right Side */}
        <div className="col-span-5">
          <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
            <div className="bg-yellow-50 dark:bg-yellow-900 p-6 rounded-xl">
              <div className="flex items-start">
                <AlertCircle className="h-6 w-6 text-yellow-400 mr-3 mt-1" />
                <div>
                  <h4 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-3">
                    File Requirements
                  </h4>
                  <ul className="space-y-3 text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside">
                    <li>File must contain FirstName and Phone columns</li>
                    <li>Notes column is optional</li>
                    <li>Exactly 5 agents must exist in the system</li>
                    <li>Tasks will be distributed equally among agents</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadList;