import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import UserStatus from './UserStatus';
import { disconnectSocket } from '../../services/socketService';

const Sidebar = ({ activeSection, setActiveSection }) => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [userName, setUserName] = useState('');
  const [statusMessage, setStatusMessage] = useState(user?.statusMessage || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user?.name) {
      setUserName(user.name);
    }
    if (user?.statusMessage) {
      setStatusMessage(user.statusMessage);
    }
  }, [user]);

  const handleLogout = async () => {
    disconnectSocket();
    await logout();
    navigate('/login');
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
        updateUser({ avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    updateUser({ name: userName, statusMessage });
    setIsEditingProfile(false);
  };

  return (
    <div className="flex h-full flex-col bg-gray-900 text-white w-72 shadow-lg transition-all">
      <div className="p-6 text-center border-b border-gray-700 font-bold text-xl tracking-wide">ChatApp</div>

      {/* User Profile */}
      <div className="p-6 border-b border-gray-700 text-center">
        <div
          className="relative mx-auto h-20 w-20 rounded-full cursor-pointer transition-all hover:scale-105 shadow-lg overflow-hidden"
          onClick={handleAvatarClick}
        >
          {avatar ? (
            <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-2xl font-bold bg-gray-600">
              {userName.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />

        {isEditingProfile ? (
          <div className="mt-3">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full p-2 text-black rounded-md"
            />
            <button onClick={handleSaveProfile} className="mt-2 px-4 py-2 bg-blue-600 rounded-md">Save</button>
          </div>
        ) : (
          <>
            <p className="mt-3 font-semibold">{userName || 'User'}</p>
            <p className="text-sm text-gray-400">{statusMessage || 'Available'}</p>
            <button onClick={handleEditProfile} className="mt-2 text-blue-400 hover:underline">Edit Profile</button>
          </>
        )}
        <UserStatus />
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-6 py-3 rounded-lg text-lg font-medium bg-red-600 hover:bg-red-700 transition-all"
        >
          🚪 Log Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
