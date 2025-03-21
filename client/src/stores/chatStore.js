// client/src/stores/chatStore.js
import { create } from 'zustand';
import { api } from '../services/api';
import { socket } from '../services/socketService';

export const useChatStore = create((set, get) => ({
  chats: [],
  activeChat: null,
  messages: [],
  loading: false,
  error: null,
  typingUsers: {},

  // Get user chats
  fetchChats: async () => {
    const { token } = get();
    
    if (!token) return;
    
    set({ loading: true });
    
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await api.get('/chats', { headers });
      
      set({ 
        chats: response.data,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Fetch chats error:', error);
      set({ 
        error: 'Failed to load chats',
        loading: false
      });
    }
  },

  // Access or create a chat with a user
  accessChat: async (userId) => {
    set({ loading: true });
    
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const response = await api.post('/chats', { userId }, { headers });
      
      // Check if chat already exists in our chats list
      const chatExists = get().chats.some(chat => chat._id === response.data._id);
      
      if (!chatExists) {
        set(state => ({ 
          chats: [response.data, ...state.chats]
        }));
      }
      
      set({
        activeChat: response.data,
        loading: false,
        error: null
      });
      
      return response.data;
    } catch (error) {
      console.error('Access chat error:', error);
      set({ 
        error: 'Failed to access chat',
        loading: false
      });
      return null;
    }
  },

  // Set active chat and fetch messages
  setActiveChat: async (chatId) => {
    // Find the chat from our list
    const chat = get().chats.find(c => c._id === chatId);
    
    if (!chat) return;
    
    set({ 
      activeChat: chat,
      messages: [],
      loading: true
    });
    
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const response = await api.get(`/chats/${chatId}/messages`, { headers });
      
      set({
        messages: response.data,
        loading: false,
        error: null
      });
      
      // Mark messages as read
      api.put(`/chats/${chatId}/read`, {}, { headers });
      
      // Emit read receipt to socket
      socket.emit('read_messages', { 
        chatId, 
        userId: JSON.parse(localStorage.getItem('user')).id 
      });
    } catch (error) {
      console.error('Fetch messages error:', error);
      set({ 
        error: 'Failed to load messages',
        loading: false
      });
    }
  },

  // Send a message
  sendMessage: async (content) => {
    const activeChat = get().activeChat;
    
    if (!activeChat) return;
    
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const response = await api.post('/messages', {
        chatId: activeChat._id,
        content
      }, { headers });
      
      // Update messages
      set(state => ({
        messages: [...state.messages, response.data.message]
      }));
      
      // Update chat's last message in chats list
      set(state => ({
        chats: state.chats.map(chat => 
          chat._id === activeChat._id
            ? { ...chat, lastMessage: response.data.message }
            : chat
        )
      }));
      
      // Handle AI response if present
      if (response.data.aiResponse) {
        set(state => ({
          messages: [...state.messages, response.data.aiResponse]
        }));
        
        // Update chat's last message again
        set(state => ({
          chats: state.chats.map(chat => 
            chat._id === activeChat._id
              ? { ...chat, lastMessage: response.data.aiResponse }
              : chat
          )
        }));
      }
      
      return response.data;
    } catch (error) {
      console.error('Send message error:', error);
      set({ error: 'Failed to send message' });
      return null;
    }
  },

  // Add a new message from socket
  addMessage: (message) => {
    // Only add if it belongs to the active chat
    if (get().activeChat?._id === message.chat) {
      set(state => ({
        messages: [...state.messages, message]
      }));
      
      // Mark as read and emit socket event
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      api.put(`/chats/${message.chat}/read`, {}, { headers });
      
      socket.emit('read_messages', { 
        chatId: message.chat, 
        userId: JSON.parse(localStorage.getItem('user')).id 
      });
    }
    
    // Update chat's last message in chats list
    set(state => ({
      chats: state.chats.map(chat => 
        chat._id === message.chat
          ? { ...chat, lastMessage: message }
          : chat
      )
    }));
  },

  // Create group chat
  createGroupChat: async (groupName, participants) => {
    set({ loading: true });
    
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const response = await api.post('/chats/group', {
        groupName,
        participants: JSON.stringify(participants)
      }, { headers });
      
      set(state => ({ 
        chats: [response.data, ...state.chats],
        activeChat: response.data,
        loading: false,
        error: null
      }));
      
      return response.data;
    } catch (error) {
      console.error('Create group chat error:', error);
      set({ 
        error: 'Failed to create group chat',
        loading: false
      });
      return null;
    }
  },

  // Add typing indicator
  setTyping: (chatId, userId) => {
    set(state => ({
      typingUsers: {
        ...state.typingUsers,
        [chatId]: [...(state.typingUsers[chatId] || []), userId]
      }
    }));
  },

  // Remove typing indicator
  removeTyping: (chatId, userId) => {
    set(state => ({
      typingUsers: {
        ...state.typingUsers,
        [chatId]: (state.typingUsers[chatId] || []).filter(id => id !== userId)
      }
    }));
  },

  // Add reaction to message
  addReaction: async (messageId, emoji) => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const response = await api.post('/messages/reaction', {
        messageId,
        emoji
      }, { headers });
      
      // Update message in messages list
      set(state => ({
        messages: state.messages.map(message => 
          message._id === messageId
            ? response.data
            : message
        )
      }));
      
      return response.data;
    } catch (error) {
      console.error('Add reaction error:', error);
      set({ error: 'Failed to add reaction' });
      return null;
    }
  }
}));
