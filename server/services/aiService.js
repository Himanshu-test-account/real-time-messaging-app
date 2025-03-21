// server/services/aiService.js

class AIService {
    // Generates a simple AI response based on the user's message
    static generateResponse(userMessage) {
      // Basic AI response logic: simple pattern-based response
      const lowerMessage = userMessage.toLowerCase();
  
      // Respond based on keywords in the user's message
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return "Hello! How can I assist you today?";
      } else if (lowerMessage.includes('how are you')) {
        return "I'm just a bot, but I'm doing well, thanks for asking!";
      } else if (lowerMessage.includes('weather')) {
        return "I don't know the weather, but I hope it's sunny where you are!";
      } else if (lowerMessage.includes('help')) {
        return "I'm here to help! What can I assist you with?";
      } else {
        return `I’m not sure I understand, but you said: "${userMessage}". Try asking me something else!`;
      }
    }
  }
  
  module.exports = AIService;
  