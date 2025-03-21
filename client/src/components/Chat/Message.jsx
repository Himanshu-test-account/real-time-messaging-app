import React from "react";

const Message = ({ message, isOwn }) => {
  // Format timestamp if available
  const formattedTime = message.timestamp 
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3 px-2 md:px-4 max-w-full`}>
      <div
        className={`relative max-w-[85%] md:max-w-[70%] p-3 md:p-4 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md
          ${isOwn 
            ? "bg-primary-600 text-white rounded-tr-none" 
            : "bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200"
          }`}
      >
        {!isOwn && (
          <div className="text-xs font-medium text-gray-600 mb-1">
            {message.sender}
          </div>
        )}
        
        <p className="text-sm md:text-base break-words">{message.content}</p>
        
        <div className={`text-[10px] mt-1 text-right ${isOwn ? "text-gray-200" : "text-gray-500"}`}>
          {formattedTime}
        </div>
        
        {/* Message tail/pointer */}
        <div 
          className={`absolute top-0 w-4 h-4 
            ${isOwn 
              ? "right-0 bg-primary-600 transform translate-x-1/4 -translate-y-1/4 rotate-45" 
              : "left-0 bg-gray-100 transform -translate-x-1/4 -translate-y-1/4 rotate-45 border-l border-t border-gray-200"
            }`}
        />
      </div>
    </div>
  );
};

export default Message;