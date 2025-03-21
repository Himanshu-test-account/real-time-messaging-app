import React, { useState, useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import Message from "./Message";
import TypingIndicator from "./TypingIndicator";
import { io } from "socket.io-client";

const ChatArea = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const socketRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  useEffect(() => {
    // Initialize socket connection with explicit root namespace
    try {
      const serverUrl = import.meta.env.VITE_SOCKET_URL;
      // Connect to root namespace explicitly by not specifying a namespace
      socketRef.current = io(serverUrl, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        transports: ['websocket', 'polling']
      });
      
      // Connection event listeners
      socketRef.current.on("connect", () => {
        console.log("Socket connected successfully");
        setConnectionStatus("connected");
      });
      
      socketRef.current.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setConnectionStatus("error");
      });
      
      socketRef.current.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        setConnectionStatus("disconnected");
      });

      // Message event listeners
      socketRef.current.on("receiveMessage", (message) => {
        setMessages((prev) => [...prev, message]);
      });
      
      socketRef.current.on("userTyping", (username) => {
        setTypingUsers((prev) => {
          if (!prev.includes(username)) {
            return [...prev, username];
          }
          return prev;
        });
      });
      
      socketRef.current.on("userStoppedTyping", (username) => {
        setTypingUsers((prev) => prev.filter((u) => u !== username));
      });
    } catch (error) {
      console.error("Error initializing socket:", error);
      setConnectionStatus("error");
    }

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.off("receiveMessage");
        socketRef.current.off("userTyping");
        socketRef.current.off("userStoppedTyping");
        socketRef.current.off("connect");
        socketRef.current.off("connect_error");
        socketRef.current.off("disconnect");
        socketRef.current.disconnect();
      }
    };
  }, []); // Empty dependency array to run only once on mount

  const sendMessage = (content) => {
    if (!user || !user.username) {
      console.warn("User is undefined, cannot send message");
      return;
    }
    
    const newMessage = { sender: user.username, content, timestamp: new Date().toISOString() };
    socketRef.current.emit("sendMessage", newMessage);
    setMessages((prev) => [...prev, newMessage]);
  };
  

  return (
    <div className="flex flex-col h-full bg-white shadow-md rounded-lg">
      <ChatHeader connectionStatus={connectionStatus} />
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No messages yet</div>
        ) : (
          messages.map((msg, index) => (
            <Message
              key={index}
              message={msg}
              isOwn={msg.sender === user.username}
            />
          ))
        )}
        {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}
      </div>
      <ChatInput
        socket={socketRef.current}
        onSend={sendMessage}
        disabled={connectionStatus !== "connected"}
      />
    </div>
  );
};

export default ChatArea;