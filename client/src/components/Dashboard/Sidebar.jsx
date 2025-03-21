import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import UserStatus from './UserStatus';
import { disconnectSocket } from '../../services/socketService';

const Sidebar = ({ activeSection, setActiveSection }) => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [userName, setUserName] = useState(user?.name || '');
  const [statusMessage, setStatusMessage] = useState(user?.statusMessage || '');
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || '#6366F1');
  const fileInputRef = useRef(null);

  const handleLogout = async () => {
    disconnectSocket();
    await logout();
    navigate('/login');
  };

  const navItems = [
    { id: 'chats', label: 'Chats', icon: '💬' },
    { id: 'contacts', label: 'Contacts', icon: '👥' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const avatarColors = ['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

  const handleAvatarClick = () => {
    if (activeSection === 'settings') fileInputRef.current?.click();
    else setActiveSection('settings');
  };

  return (
    <div className="flex h-full flex-col bg-gray-900 text-white w-72 shadow-lg transition-all">
      <div className="p-6 text-center border-b border-gray-700 font-bold text-xl tracking-wide">ChatApp</div>

      {/* User Profile */}
      <div className="p-6 border-b border-gray-700 text-center">
        <div className="relative mx-auto h-20 w-20 rounded-full cursor-pointer transition-all hover:scale-105 shadow-lg"
          onClick={handleAvatarClick} style={{ backgroundColor: avatarColor }}>
          <div className="flex items-center justify-center h-full text-2xl font-bold">{user?.name?.charAt(0) || 'U'}</div>
        </div>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />

        <p className="mt-3 font-semibold">{user?.name || 'User'}</p>
        <p className="text-sm text-gray-400">{user?.statusMessage || 'Available'}</p>
        <UserStatus />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        {navItems.map((item) => (
          <button key={item.id} onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center px-6 py-3 rounded-lg transition-all text-lg font-medium ${activeSection === item.id ? 'bg-indigo-600' : 'hover:bg-gray-800'}`}> 
            <span className="mr-3">{item.icon}</span>{item.label}
          </button>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700">
        <button onClick={handleLogout} className="w-full flex items-center justify-center px-6 py-3 rounded-lg text-lg font-medium bg-red-600 hover:bg-red-700 transition-all">
          🚪 Log Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
