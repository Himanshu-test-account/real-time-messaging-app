const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const aiService = require('../services/aiService');

// Get all chats for a user
exports.getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: { $elemMatch: { $eq: req.user.id } }
    })
      .populate('participants', '-password')
      .populate('lastMessage')
      .populate('groupAdmin', '-password')
      .sort({ updatedAt: -1 });
    
    res.json(chats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Create or access one-on-one chat
exports.accessChat = async (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ msg: 'UserId param not sent with request' });
  }
  
  try {
    // Check if chat exists
    let chat = await Chat.findOne({
      isGroupChat: false,
      $and: [
        { participants: { $elemMatch: { $eq: req.user.id } } },
        { participants: { $elemMatch: { $eq: userId } } }
      ]
    })
      .populate('participants', '-password')
      .populate('lastMessage');
    
    if (chat) {
      return res.json(chat);
    }
    
    // If no chat exists, create one
    const chatData = {
      participants: [req.user.id, userId],
      isGroupChat: false
    };
    
    const newChat = await Chat.create(chatData);
    
    // Populate the new chat
    const fullChat = await Chat.findById(newChat._id)
      .populate('participants', '-password');
    
    res.json(fullChat);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Create group chat
exports.createGroupChat = async (req, res) => {
  if (!req.body.groupName || !req.body.participants) {
    return res.status(400).json({ msg: 'Please provide all required fields' });
  }
  
  let participants = JSON.parse(req.body.participants);
  
  if (participants.length < 2) {
    return res.status(400).json({ msg: 'At least 2 users are required to form a group chat' });
  }
  
  // Add current user to participants
  participants.push(req.user.id);
  
  try {
    const groupChat = await Chat.create({
      groupName: req.body.groupName,
      participants: participants,
      isGroupChat: true,
      groupAdmin: req.user.id
    });
    
    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate('participants', '-password')
      .populate('groupAdmin', '-password');
    
    res.json(fullGroupChat);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Add message to chat
exports.sendMessage = async (req, res) => {
  const { chatId, content } = req.body;
  
  if (!chatId || !content) {
    return res.status(400).json({ msg: 'Please provide chatId and content' });
  }
  
  try {
    // Create new message
    let message = new Message({
      chat: chatId,
      sender: req.user.id,
      content
    });
    
    await message.save();
    
    // Populate message with sender info
    message = await message.populate('sender', 'username avatar');
    message = await message.populate('chat');
    
    // Update chat's lastMessage
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id
    });
    
    // Check if this is an AI chat and generate response
    const chat = await Chat.findById(chatId);
    
    // Check if any participant is AI (for demo, let's say userId = 'ai-bot')
    const isAIChat = chat.participants.some(
      participant => participant.toString() === 'ai-bot'
    );
    
    if (isAIChat) {
      // Generate AI response
      const aiResponse = aiService.generateResponse(content);
      
      // Create AI message
      const aiMessage = new Message({
        chat: chatId,
        sender: 'ai-bot', // AI bot ID
        content: aiResponse,
        isAI: true
      });
      
      await aiMessage.save();
      
      // Update chat's lastMessage to AI response
      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: aiMessage._id
      });
      
      // Include AI response in reply
      res.json({ message, aiResponse: aiMessage });
    } else {
      res.json({ message });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get messages for a chat
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    await Message.updateMany(
      { 
        chat: req.params.chatId,
        sender: { $ne: req.user.id },
        read: false
      },
      { 
        read: true,
        readAt: new Date()
      }
    );
    
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Add reaction to message
exports.addReaction = async (req, res) => {
  const { messageId, emoji } = req.body;
  
  try {
    // Check if user already reacted
    const message = await Message.findById(messageId);
    
    const existingReaction = message.reactions.find(
      reaction => reaction.user.toString() === req.user.id
    );
    
    if (existingReaction) {
      // Update existing reaction
      await Message.updateOne(
        { 
          _id: messageId,
          'reactions.user': req.user.id
        },
        {
          $set: { 'reactions.$.emoji': emoji }
        }
      );
    } else {
      // Add new reaction
      await Message.findByIdAndUpdate(
        messageId,
        {
          $push: { 
            reactions: { 
              user: req.user.id,
              emoji
            }
          }
        }
      );
    }
    
    // Get updated message
    const updatedMessage = await Message.findById(messageId)
      .populate('sender', 'username avatar')
      .populate('reactions.user', 'username avatar');
    
    res.json(updatedMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};