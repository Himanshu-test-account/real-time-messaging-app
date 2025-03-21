import React from "react";

const TypingIndicator = ({ users }) => {
  if (!users || users.length === 0) return null;
  
  return (
    <div className="flex items-center px-4 py-2 mb-2 max-w-[70%]">
      <div className="flex space-x-1 mr-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
      </div>
      <div className="text-gray-500 text-sm font-medium">
        {users.length === 1 
          ? `${users[0]} is typing...` 
          : users.length === 2 
            ? `${users[0]} and ${users[1]} are typing...`
            : `${users.length} people are typing...`
        }
      </div>
    </div>
  );
};

export default TypingIndicator;