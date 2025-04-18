import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserX, UserCheck, Pencil, Trash2, Users, AlertCircle, CheckCircle2, Circle, Plus, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AgentList = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [expandedAgent, setExpandedAgent] = useState(null);
  const [agentTasks, setAgentTasks] = useState({});
  const [taskCounts, setTaskCounts] = useState({});
  const [stats, setStats] = useState({
    totalAgents: 0,
    totalTasks: 0,
    averageTasksPerAgent: 0
  });
  const [isClearingTasks, setIsClearingTasks] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    if (agents.length > 0) {
      fetchTaskCounts();
    }
  }, [agents]);

  useEffect(() => {
    if (Object.keys(taskCounts).length > 0) {
      const totalTasks = Object.values(taskCounts).reduce((sum, count) => sum + count, 0);
      setStats({
        totalAgents: agents.length,
        totalTasks,
        averageTasksPerAgent: agents.length > 0 ? (totalTasks / agents.length).toFixed(1) : 0
      });
    }
  }, [taskCounts, agents]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const response = await axios.get('http://localhost:5000/api/agents', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
      setAgents(response.data.data.agents);
      setError(null);
      } else {
        throw new Error(response.data.message || 'Failed to fetch agents');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching agents');
      console.error('Error fetching agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskCounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const counts = {};
      
      for (const agent of agents) {
        const response = await axios.get(`http://localhost:5000/api/tasks/agent/${agent._id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        counts[agent._id] = response.data.tasks.length;
      }
      
      setTaskCounts(counts);
    } catch (error) {
      console.error('Error fetching task counts:', error);
    }
  };

  const handleAgentClick = async (agentId) => {
    if (expandedAgent === agentId) {
      setExpandedAgent(null);
      return;
    }

    try {
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
    }
  };

  const handleMarkTaskCompleted = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/tasks/${taskId}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Refresh the tasks for the expanded agent
      if (expandedAgent) {
        handleAgentClick(expandedAgent);
      }
      // Refresh the task counts
      fetchTaskCounts();
    } catch (error) {
      console.error('Error marking task as completed:', error);
      toast.error('Failed to mark task as completed');
    }
  };

  const handleDeleteAgent = async (agentId) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/agents/${agentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Agent deleted successfully');
      fetchAgents(); // Refresh the list
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast.error(error.response?.data?.message || 'Failed to delete agent');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllTasks = async () => {
    if (!window.confirm('Are you sure you want to clear all tasks? This action cannot be undone.')) {
      return;
    }

    setClearing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete('http://localhost:5000/api/tasks/clear', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.message) {
        toast.success('All tasks cleared successfully!', {
          duration: 4000,
          style: {
            background: '#10B981',
            color: '#fff',
          },
          icon: '✅',
        });
        fetchAgents();
      }
    } catch (error) {
      console.error('Error clearing tasks:', error);
      toast.error(error.response?.data?.message || 'Error clearing tasks. Please try again.', {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: '#fff',
        },
        icon: '❌',
      });
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
          <Users className="w-6 h-6 mr-2" />
          Agents
        </h2>
        <button
          onClick={handleClearAllTasks}
          disabled={clearing}
          className="flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-red-600/90 backdrop-blur-xl hover:bg-red-700/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300"
        >
          {clearing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Clearing...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Tasks
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-100/90 backdrop-blur-xl p-4 rounded-xl">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Stats Panel - Left Side */}
        <div className="col-span-3 space-y-4">
          <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow p-6 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900">
                <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Agents</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalAgents}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow p-6 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tasks</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalTasks}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow p-6 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <Circle className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Tasks per Agent</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.averageTasksPerAgent}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Table - Right Side */}
        <div className="col-span-9">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tasks Assigned
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {agents.map((agent) => (
                    <React.Fragment key={agent._id}>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {agent.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {agent.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {taskCounts[agent._id] || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => handleAgentClick(agent._id)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                              {expandedAgent === agent._id ? 'Hide Tasks' : 'View Tasks'}
                            </button>
                            <button
                              onClick={() => handleDeleteAgent(agent._id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedAgent === agent._id && (
                        <tr>
                          <td colSpan="4" className="px-0 py-0">
                            <div className="bg-gray-50 dark:bg-gray-700 p-4">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Assigned Tasks</h4>
                              {agentTasks[agent._id]?.tasks?.length > 0 ? (
                                <div className="space-y-3">
                                  {agentTasks[agent._id].tasks.map((task, taskIndex) => (
                                    <div key={taskIndex} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {task.firstName}
                                          </p>
                                          <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {task.phone}
                                          </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(task.assignedAt).toLocaleDateString()}
                                          </span>
                                          <button
                                            onClick={() => handleMarkTaskCompleted(task._id)}
                                            disabled={task.completed}
                                            className={`p-1 rounded-full ${
                                              task.completed 
                                                ? 'text-green-500 cursor-default' 
                                                : 'text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900'
                                            }`}
                                          >
                                            {task.completed ? (
                                              <CheckCircle2 className="h-5 w-5" />
                                            ) : (
                                              <Circle className="h-5 w-5" />
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                      {task.notes && (
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                          {task.notes}
                                        </p>
                                      )}
                                      {task.completed && (
                                        <p className="mt-1 text-xs text-green-500">
                                          Completed on {new Date(task.completedAt).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                  No tasks assigned to this agent
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Agent Modal */}
      {showAddAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Add New Agent
            </h3>
            <form onSubmit={handleAddAgent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={newAgent.email}
                  onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddAgent(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Agent Modal */}
      {editingAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Edit Agent
            </h3>
            <form onSubmit={handleEditAgent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name
                </label>
                <input
                  type="text"
                  value={editingAgent.name}
                  onChange={(e) => setEditingAgent({ ...editingAgent, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={editingAgent.email}
                  onChange={(e) => setEditingAgent({ ...editingAgent, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingAgent(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentList;