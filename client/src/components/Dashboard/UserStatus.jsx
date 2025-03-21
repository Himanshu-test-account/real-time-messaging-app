import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { socket } from '../../services/socketService';

const UserStatus = () => {
  const [status, setStatus] = useState('online');
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();
  const statusMenuRef = useRef(null);

  const statusOptions = [
    { value: 'online', label: 'Online', color: 'bg-green-500', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    { value: 'away', label: 'Away', color: 'bg-yellow-500',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
    },
    { value: 'busy', label: 'Busy', color: 'bg-red-500',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    },
    { value: 'offline', label: 'Invisible', color: 'bg-gray-500',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3.707 2.293a1 1 0 00-1.414 1.414l6.921 6.922c.05.062.105.118.168.167l6.91 6.911a1 1 0 001.415-1.414l-.675-.675a9.001 9.001 0 00-.668-11.982A1 1 0 1014.95 5.05a7.002 7.002 0 01.657 9.143l-1.435-1.435a5.002 5.002 0 00-.636-6.294A1 1 0 0012.12 7.88c.924.923 1.12 2.3.587 3.415l-1.992-1.992a.922.922 0 00-.018-.018l-6.99-6.991zM3.238 8.187a1 1 0 00-1.933-.516c-.8.303-1.05.641-1.49.952 1.527.723 2.886 1.842 4 3.257a1 1 0 001.535-1.286 7.95 7.95 0 00-2.112-2.408z" />
          <path d="M15.89 14.322l-3.127-3.127c.031-.03.064-.059.099-.086a2 2 0 002.618-2.618l-3.127-3.127A4 4 0 0114 10c0 1.73-1.072 3.212-2.582 3.84l-.528-.528z" />
        </svg>
      )
    }
  ];

  useEffect(() => {
    if (socket && user) {
      // Emit status change
      socket.emit('status_change', { userId: user.id, status });
    }
  }, [status, user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [statusMenuRef]);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setIsOpen(false);
  };

  // Find current status object
  const currentStatus = statusOptions.find(option => option.value === status);

  return (
    <div className="relative" ref={statusMenuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center mt-1 px-3 py-1.5 text-xs rounded-full bg-gray-700 hover:bg-gray-600 transition-all duration-200"
      >
        <span className={`h-2 w-2 rounded-full mr-2 ${currentStatus.color}`}></span>
        {currentStatus.label}
        <svg className="w-3 h-3 ml-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute left-0 mt-2 w-40 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-10 py-1 transform transition-all duration-150 origin-top-left">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className={`w-full text-left block px-4 py-2 text-sm hover:bg-gray-700 transition-colors duration-150 ${
                status === option.value ? 'bg-gray-700 text-white' : 'text-gray-200'
              }`}
            >
              <div className="flex items-center">
                <span className={`relative h-4 w-4 flex items-center justify-center mr-3`}>
                  <span className={`absolute inset-0 ${option.color} rounded-full opacity-30`}></span>
                  <span className={`h-2 w-2 rounded-full ${option.color}`}></span>
                </span>
                <span>{option.label}</span>
                {status === option.value && (
                  <span className="ml-auto text-indigo-400">
                    {option.icon}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserStatus;