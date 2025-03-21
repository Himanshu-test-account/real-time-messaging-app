import React, { useState, useRef, useEffect } from "react";
import { useChatStore } from "../../stores/chatStore";

const ChatInput = ({ socket, onSend, disabled = false }) => {
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);
  
  // Auto-focus the input when it mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);
  
  // Clean up typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        handleStopTyping();
      }
    };
  }, []);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage("");
      setIsExpanded(false);
      handleStopTyping();
    }
  };

  const handleTyping = () => {
    if (socket && socket.connected) {
      try {
        socket.emit("userTyping");
        
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          handleStopTyping();
        }, 2000);
      } catch (error) {
        console.error("Error emitting typing event:", error);
      }
    }
  };
  
  const handleStopTyping = () => {
    if (socket && socket.connected) {
      try {
        socket.emit("userStoppedTyping");
      } catch (error) {
        console.error("Error stopping typing event:", error);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (message.trim()) handleTyping();
    
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    
    // Toggle expanded mode with Shift+ArrowDown or Shift+ArrowUp
    if (e.shiftKey && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      setIsExpanded(prev => !prev);
    }
  };
  
  const handleChange = (e) => {
    setMessage(e.target.value);
    
    // Auto expand if text gets longer
    if (e.target.value.length > 80 && !isExpanded) {
      setIsExpanded(true);
    }
  };

  return (
    <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 border-t border-gray-200 shadow-xl transition-all duration-300 rounded-t-3xl">
      <div className={`flex items-center gap-3 ${isExpanded ? "mb-2" : ""}`}>
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            className={`w-full py-3 px-4 bg-white border border-gray-300 rounded-3xl outline-none transition-all duration-200 resize-none shadow-md text-gray-800 ${
              disabled
                ? "opacity-60 cursor-not-allowed"
                : "focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            }`}
            placeholder={disabled ? "Connection lost. Reconnecting..." : "Type a message..."}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (message.length > 80) setIsExpanded(true);
            }}
            rows={isExpanded ? 3 : 1}
            style={{ minHeight: isExpanded ? "80px" : "50px" }}
            disabled={disabled}
          />
          {!isExpanded && !disabled && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
              Press Enter to send
            </div>
          )}
        </div>

        <button
          onClick={handleSend}
          className={`h-12 w-12 flex items-center justify-center text-white rounded-full shadow-lg transition-all duration-300 transform ${
            disabled || !message.trim()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700 hover:scale-110"
          }`}
          aria-label="Send message"
          disabled={disabled || !message.trim()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>

      {isExpanded && !disabled && (
        <div className="flex items-center justify-between px-3">
          <div className="flex gap-2">
            <button 
              className="p-2 text-gray-100 hover:text-white transition-colors duration-200" 
              aria-label="Add emoji"
              onClick={() => {
                // This would normally open an emoji picker
                setMessage(prev => prev + "😊");
              }}
            >
              😊
            </button>
            <button 
              className="p-2 text-gray-100 hover:text-white transition-colors duration-200" 
              aria-label="Collapse input"
              onClick={() => setIsExpanded(false)}
            >
              ▲
            </button>
          </div>
          <div className="text-xs text-gray-200">
            Press Shift+Enter for a new line • Shift+↑/↓ to resize
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInput;