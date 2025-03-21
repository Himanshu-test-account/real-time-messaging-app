// client/src/services/socketService.js
import { io } from 'socket.io-client';
import { useChatStore } from '../stores/chatStore';

const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export let socket;

// Function to establish a socket connection
export const socketConnect = (userId) => {
  if (socket) return socket; // Return existing socket connection if it exists

  // Initialize socket connection
  socket = io(socketUrl, {
    auth: {
      token: localStorage.getItem('token') // Use token from localStorage for authentication
    }
  });

  // Connection events
  socket.on('connect', () => {
    console.log('Socket connected');
    socket.emit('user_connected', userId); // Emit user connected event with userId
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  // Handle incoming message events
  socket.on('new_message', (message) => {
    useChatStore.getState().addMessage(message); // Add new message to the chat store
  });

  // Handle typing events
  socket.on('user_typing', ({ chatId, userId }) => {
    useChatStore.getState().setTyping(chatId, userId); // Update typing status in chat store
  });

  socket.on('user_stop_typing', ({ chatId, userId }) => {
    useChatStore.getState().removeTyping(chatId, userId); // Remove typing status
  });

  // Handle read receipt events
  socket.on('messages_read', ({ chatId, userId }) => {
    // Update read status of messages
    const { messages } = useChatStore.getState();
    const updatedMessages = messages.map(message => {
      if (message.chat === chatId && message.sender._id === userId && !message.read) {
        return { ...message, read: true, readAt: new Date() }; // Mark message as read
      }
      return message;
    });

    useChatStore.setState({ messages: updatedMessages });
  });

  return socket;
};

// Function to disconnect the socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null; // Reset socket to null after disconnection
  }
};
