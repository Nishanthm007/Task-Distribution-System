import React from 'react';
import { Users, FileSpreadsheet, LogOut, UserPlus } from 'lucide-react';

function Sidebar({ activeTab, setActiveTab, sidebarOpen, handleLogout }) {
  return (
    <div className={`fixed inset-y-0 left-0 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out bg-white/30 backdrop-blur-xl shadow-lg flex flex-col`}>
      <div className="flex-1 overflow-y-auto">
        <nav className="px-2 py-4 space-y-2">
          {['agents', 'add-agent', 'upload'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center w-full px-4 py-3 text-gray-700 rounded-xl transition-all duration-200 ${
                activeTab === tab 
                ? 'bg-white/50 shadow-lg' 
                : 'hover:bg-white/30'
              }`}
            >
              {tab === 'agents' && <Users className="w-5 h-5 mr-3" />}
              {tab === 'add-agent' && <UserPlus className="w-5 h-5 mr-3" />}
              {tab === 'upload' && <FileSpreadsheet className="w-5 h-5 mr-3" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200/50">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-white/30 rounded-xl transition-all duration-200"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
