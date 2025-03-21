// server/routes/chat.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

// @route   GET api/chats
// @desc    Get all chats for a user
// @access  Private
router.get('/', auth, chatController.getUserChats);

// @route   POST api/chats
// @desc    Create or access one-on-one chat with another user
// @access  Private
router.post('/access', auth, chatController.accessChat);

// @route   POST api/chats/group
// @desc    Create a group chat
// @access  Private
router.post('/group', auth, chatController.createGroupChat);

// @route   POST api/chats/message
// @desc    Send a message to a chat
// @access  Private
router.post('/message', auth, chatController.sendMessage);

// @route   GET api/chats/messages/:chatId
// @desc    Get all messages for a chat
// @access  Private
router.get('/messages/:chatId', auth, chatController.getMessages);

// @route   POST api/chats/messages/read/:chatId
// @desc    Mark all messages as read in a chat
// @access  Private
router.post('/messages/read/:chatId', auth, chatController.markAsRead);

// @route   POST api/chats/messages/reaction
// @desc    Add a reaction (emoji) to a message
// @access  Private
router.post('/messages/reaction', auth, chatController.addReaction);

module.exports = router;
