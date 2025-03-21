export const generateAIResponse = (message) => {
    const normalizedMessage = message.toLowerCase().trim();
    
    // Basic pattern matching for common messages
    const patterns = [
      { regex: /hello|hi|hey|howdy/i, responses: ['Hi there!', 'Hello!', 'Hey, how can I help?'] },
      { regex: /how are you/i, responses: ['I\'m doing well, thanks for asking!', 'All good here! How about you?'] },
      { regex: /bye|goodbye/i, responses: ['Goodbye!', 'See you later!', 'Take care!'] },
      { regex: /thank(s| you)/i, responses: ['You\'re welcome!', 'Happy to help!', 'Anytime!'] },
      { regex: /help/i, responses: ['How can I assist you?', 'What do you need help with?'] },
      { regex: /name/i, responses: ['I\'m ChatBot, your AI assistant!', 'You can call me ChatBot.'] },
      { regex: /weather/i, responses: ['I don\'t have real-time weather data, but I hope it\'s nice where you are!'] },
      { regex: /time/i, responses: ['I don\'t have access to current time, but it\'s always a good time to chat!'] },
      { regex: /love|like you/i, responses: ['That\'s very kind of you!', 'I appreciate that!'] },
      { regex: /who (are|r) you/i, responses: ['I\'m an AI chatbot built for this messaging app!'] }
    ];
    
    // Find matching pattern
    for (const pattern of patterns) {
      if (pattern.regex.test(normalizedMessage)) {
        const randomIndex = Math.floor(Math.random() * pattern.responses.length);
        return pattern.responses[randomIndex];
      }
    }
    
    // Default responses for unknown inputs
    const defaultResponses = [
      'Interesting! Tell me more.',
      'I\'m not sure I understand. Could you explain?',
      'I\'m still learning, but I\'m here to chat!',
      'That\'s interesting! How can I help you with that?',
      'I see. What else would you like to talk about?'
    ];
    
    const randomIndex = Math.floor(Math.random() * defaultResponses.length);
    return defaultResponses[randomIndex];
  };
  
  // Export functions for use in components
  export default {
    generateAIResponse
  };