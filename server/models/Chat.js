const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isGroupChat: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String,
    trim: true
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Chat', ChatSchema);