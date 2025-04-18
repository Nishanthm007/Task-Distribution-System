import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import AgentList from './AgentList';
import AddAgent from './AddAgent';
import UploadList from './UploadList';
import Sidebar from './Sidebar';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('agents');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'agents':
        return <AgentList />;
      case 'add-agent':
        return <AddAgent />;
      case 'upload':
        return <UploadList />;
      default:
        return <AgentList />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500/70 via-purple-500/70 to-pink-500/70 animate-gradient-x">
      <div className="fixed top-0 left-0 right-0 bg-white/30 backdrop-blur-xl shadow-lg z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-900">Tasks Distribution System</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen pt-16">
        <Sidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          handleLogout={handleLogout}
        />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;
