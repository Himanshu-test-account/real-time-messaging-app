const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

module.exports = (io) => {
  // Store online users
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // User joins with their user ID
    socket.on('user_connected', async (userId) => {
      if (userId) {
        onlineUsers.set(userId, socket.id);
        
        // Update user status to online
        await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
        
        // Broadcast to all users that this user is online
        io.emit('user_status_change', { userId, isOnline: true });
      }
    });

    // Handle sending messages
    socket.on('send_message', async (messageData) => {
      try {
        const { chatId, senderId, recipientId, content } = messageData;
        
        // Save message to database
        const newMessage = new Message({
          chat: chatId,
          sender: senderId,
          content,
          createdAt: new Date()
        });
        
        await newMessage.save();
        
        // Update chat with last message
        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: newMessage._id
        });
        
        // Emit to sender for immediate UI update
        socket.emit('message_sent', newMessage);
        
        // Check if recipient is online and send message
        const recipientSocketId = onlineUsers.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('new_message', newMessage);
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    // Handle typing status
    socket.on('typing', ({ chatId, userId }) => {
      // Find recipients of this chat and emit typing status
      Chat.findById(chatId)
        .then(chat => {
          const recipients = chat.participants.filter(
            participant => participant.toString() !== userId
          );
          
          recipients.forEach(recipientId => {
            const recipientSocketId = onlineUsers.get(recipientId.toString());
            if (recipientSocketId) {
              io.to(recipientSocketId).emit('user_typing', { chatId, userId });
            }
          });
        })
        .catch(err => console.error('Error in typing event:', err));
    });

    // Handle stop typing
    socket.on('stop_typing', ({ chatId, userId }) => {
      Chat.findById(chatId)
        .then(chat => {
          const recipients = chat.participants.filter(
            participant => participant.toString() !== userId
          );
          
          recipients.forEach(recipientId => {
            const recipientSocketId = onlineUsers.get(recipientId.toString());
            if (recipientSocketId) {
              io.to(recipientSocketId).emit('user_stop_typing', { chatId, userId });
            }
          });
        })
        .catch(err => console.error('Error in stop typing event:', err));
    });

    // Handle read receipts
    socket.on('read_messages', async ({ chatId, userId }) => {
      try {
        // Mark all messages as read
        await Message.updateMany(
          { chat: chatId, sender: { $ne: userId }, read: false },
          { read: true, readAt: new Date() }
        );
        
        // Notify other participants
        const chat = await Chat.findById(chatId);
        const otherParticipants = chat.participants.filter(
          p => p.toString() !== userId
        );
        
        otherParticipants.forEach(participantId => {
          const participantSocketId = onlineUsers.get(participantId.toString());
          if (participantSocketId) {
            io.to(participantSocketId).emit('messages_read', { chatId, userId });
          }
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log('Client disconnected:', socket.id);
      
      // Find user id associated with this socket
      let disconnectedUserId = null;
      
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          break;
        }
      }
      
      if (disconnectedUserId) {
        // Remove from online users
        onlineUsers.delete(disconnectedUserId);
        
        // Update user status in database
        await User.findByIdAndUpdate(disconnectedUserId, {
          isOnline: false,
          lastSeen: new Date()
        });
        
        // Broadcast to all users that this user is offline
        io.emit('user_status_change', {
          userId: disconnectedUserId,
          isOnline: false,
          lastSeen: new Date()
        });
      }
    });
  });
};