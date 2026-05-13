const axios = require('axios');
const twilio = require('twilio');
const dialogflow = require('dialogflow');
const natural = require('natural');
const logger = require('../utils/logger');
const { calendarService } = require('./calendar.service');

class ChatbotService {
  constructor() {
    this.twilioClient = null;
    this.dialogflowSessionClient = null;
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
    this.initialized = false;
  }

  async initialize() {
    try {
      // Initialize Twilio for WhatsApp
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        this.twilioClient = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        logger.info('Twilio WhatsApp client initialized');
      }

      // Initialize Dialogflow for NLP
      if (process.env.DIALOGFLOW_PROJECT_ID) {
        const credentials = {
          client_email: process.env.DIALOGFLOW_CLIENT_EMAIL,
          private_key: process.env.DIALOGFLOW_PRIVATE_KEY.replace(/\\n/g, '\n')
        };

        this.dialogflowSessionClient = new dialogflow.SessionsClient({ credentials });
        logger.info('Dialogflow NLP client initialized');
      }

      this.initialized = true;
      logger.info('Chatbot service initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize chatbot service:', error);
      throw error;
    }
  }

  async processMessage(message, platform = 'web', userId = null) {
    try {
      // Extract intent and entities using NLP
      const nlpResult = await this.extractIntent(message);
      
      // Process based on intent
      switch (nlpResult.intent) {
        case 'book_meeting':
          return await this.handleBookingIntent(nlpResult, userId);
        
        case 'reschedule_meeting':
          return await this.handleRescheduleIntent(nlpResult, userId);
        
        case 'cancel_meeting':
          return await this.handleCancelIntent(nlpResult, userId);
        
        case 'check_availability':
          return await this.handleAvailabilityIntent(nlpResult);
        
        case 'get_meeting_info':
          return await this.handleMeetingInfoIntent(nlpResult, userId);
        
        case 'greeting':
          return this.generateGreetingResponse();
        
        case 'help':
          return this.generateHelpResponse();
        
        default:
          return this.generateDefaultResponse();
      }
    } catch (error) {
      logger.error('Failed to process message:', error);
      return this.generateErrorResponse();
    }
  }

  async extractIntent(message) {
    // Try Dialogflow first if available
    if (this.dialogflowSessionClient) {
      try {
        const sessionPath = this.dialogflowSessionClient.sessionPath(
          process.env.DIALOGFLOW_PROJECT_ID,
          `session-${Date.now()}`
        );

        const request = {
          session: sessionPath,
          queryInput: {
            text: {
              text: message,
              languageCode: 'en'
            }
          }
        };

        const responses = await this.dialogflowSessionClient.detectIntent(request);
        const result = responses[0].queryResult;
        
        return {
          intent: result.intent.displayName,
          confidence: result.intentDetectionConfidence,
          entities: result.parameters.fields,
          fullfillmentText: result.fulfillmentText
        };
      } catch (error) {
        logger.warn('Dialogflow failed, falling back to rule-based NLP:', error);
      }
    }

    // Fallback to rule-based NLP
    return this.ruleBasedNLP(message);
  }

  ruleBasedNLP(message) {
    const tokens = this.tokenizer.tokenize(message.toLowerCase());
    const stemmedTokens = tokens.map(token => this.stemmer.stem(token));

    // Intent detection
    let intent = 'unknown';
    const entities = {};

    // Check for booking keywords
    const bookingKeywords = ['book', 'schedule', 'meeting', 'appointment', 'call', 'demo'];
    if (bookingKeywords.some(keyword => stemmedTokens.includes(this.stemmer.stem(keyword)))) {
      intent = 'book_meeting';
    }

    // Check for rescheduling keywords
    const rescheduleKeywords = ['reschedule', 'change', 'move', 'postpone'];
    if (rescheduleKeywords.some(keyword => stemmedTokens.includes(this.stemmer.stem(keyword)))) {
      intent = 'reschedule_meeting';
    }

    // Check for cancellation keywords
    const cancelKeywords = ['cancel', 'delete', 'remove'];
    if (cancelKeywords.some(keyword => stemmedTokens.includes(this.stemmer.stem(keyword)))) {
      intent = 'cancel_meeting';
    }

    // Extract date and time
    const dateRegex = /\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b|\b(\d{4})[/-](\d{1,2})[/-](\d{1,2})\b/;
    const timeRegex = /\b(\d{1,2}):(\d{2})\s*(am|pm)?\b/i;
    
    const dateMatch = message.match(dateRegex);
    const timeMatch = message.match(timeRegex);

    if (dateMatch) entities.date = dateMatch[0];
    if (timeMatch) entities.time = timeMatch[0];

    // Extract duration
    const durationRegex = /\b(\d+)\s*(minute|hour|hr|min)\b/i;
    const durationMatch = message.match(durationRegex);
    if (durationMatch) entities.duration = durationMatch[0];

    return {
      intent,
      confidence: 0.7,
      entities,
      fullfillmentText: null
    };
  }

  async handleBookingIntent(nlpResult, userId) {
    try {
      // Extract booking details from entities
      const bookingDetails = this.extractBookingDetails(nlpResult.entities);
      
      // Check availability
      const availability = await calendarService.checkAvailability({
        startTime: bookingDetails.startTime,
        endTime: bookingDetails.endTime,
        timeZone: bookingDetails.timeZone
      });

      if (!availability.available) {
        return {
          type: 'text',
          content: `Sorry, that time slot is not available. Here are some alternative times:`,
          alternatives: await this.getAlternativeTimes(bookingDetails)
        };
      }

      // Create booking
      const booking = {
        userId,
        title: bookingDetails.title || 'Meeting with FreelanceComm',
        description: bookingDetails.description || 'Scheduled via chatbot',
        startTime: bookingDetails.startTime,
        endTime: bookingDetails.endTime,
        timeZone: bookingDetails.timeZone,
        attendees: bookingDetails.attendees || []
      };

      // In a real implementation, save to database and create Google Meet
      const meeting = await calendarService.createGoogleMeetEvent(booking);

      return {
        type: 'booking_confirmation',
        content: `✅ Meeting booked successfully!`,
        details: {
          meetingLink: meeting.meetLink,
          dateTime: booking.startTime,
          duration: bookingDetails.duration,
          title: booking.title
        },
        actions: [
          { type: 'add_to_calendar', url: meeting.htmlLink },
          { type: 'join_meeting', url: meeting.meetLink }
        ]
      };
    } catch (error) {
      logger.error('Failed to handle booking intent:', error);
      return {
        type: 'text',
        content: 'Sorry, I encountered an error while booking your meeting. Please try again or contact support.'
      };
    }
  }

  extractBookingDetails(entities) {
    // Parse entities and create booking details
    // This is a simplified version - in production, you'd have more robust parsing
    const now = new Date();
    const defaultDate = now.toISOString().split('T')[0];
    const defaultTime = '10:00';
    const defaultDuration = 30; // minutes

    return {
      date: entities.date || defaultDate,
      time: entities.time || defaultTime,
      duration: entities.duration ? parseInt(entities.duration) : defaultDuration,
      timeZone: process.env.DEFAULT_TIMEZONE,
      title: entities.title || 'Meeting',
      description: entities.description || ''
    };
  }

  async getAlternativeTimes(bookingDetails) {
    // Generate alternative time slots
    const alternatives = [];
    const baseTime = new Date(`${bookingDetails.date}T${bookingDetails.time}`);
    
    for (let i = 1; i <= 3; i++) {
      const altTime = new Date(baseTime.getTime() + (i * 60 * 60 * 1000)); // Add i hours
      alternatives.push({
        time: altTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: altTime.toLocaleDateString()
      });
    }

    return alternatives;
  }

  async handleRescheduleIntent(nlpResult, userId) {
    return {
      type: 'text',
      content: 'I can help you reschedule your meeting. Please provide the meeting ID and your preferred new time.'
    };
  }

  async handleCancelIntent(nlpResult, userId) {
    return {
      type: 'text',
      content: 'I can help you cancel your meeting. Please provide the meeting ID to proceed.'
    };
  }

  async handleAvailabilityIntent(nlpResult) {
    return {
      type: 'text',
      content: 'I can check availability for you. Please specify a date and time range.'
    };
  }

  async handleMeetingInfoIntent(nlpResult, userId) {
    return {
      type: 'text',
      content: 'I can retrieve your meeting information. Please provide the meeting ID.'
    };
  }

  generateGreetingResponse() {
    const greetings = [
      "Hello! I'm your FreelanceComm booking assistant. How can I help you today?",
      "Hi there! Ready to schedule a Google Meet? Just tell me when you'd like to meet.",
      "Welcome! I can help you book, reschedule, or cancel meetings. What would you like to do?"
    ];
    
    return {
      type: 'text',
      content: greetings[Math.floor(Math.random() * greetings.length)],
      quickReplies: ['Book a meeting', 'Check availability', 'Reschedule', 'Cancel']
    };
  }

  generateHelpResponse() {
    return {
      type: 'text',
      content: `I can help you with:
• Booking new Google Meet meetings
• Rescheduling existing meetings
• Cancelling meetings
• Checking availability
• Getting meeting details

Just tell me what you'd like to do!`,
      quickReplies: ['Book meeting', 'Reschedule', 'Cancel', 'Availability']
    };
  }

  generateDefaultResponse() {
    return {
      type: 'text',
      content: "I'm not sure I understand. You can ask me to book a meeting, check availability, or manage existing bookings. How can I help?",
      quickReplies: ['Book meeting', 'Help', 'Availability']
    };
  }

  generateErrorResponse() {
    return {
      type: 'text',
      content: "Sorry, I'm having trouble processing your request. Please try again or contact support@freelancecomm.in for assistance."
    };
  }

  async sendWhatsAppMessage(to, message) {
    if (!this.twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    try {
      const response = await this.twilioClient.messages.create({
        body: message.content,
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:${to}`
      });

      logger.info('WhatsApp message sent:', response.sid);
      return response;
    } catch (error) {
      logger.error('Failed to send WhatsApp message:', error);
      throw error;
    }
  }

  async sendTelegramMessage(chatId, message) {
    // Telegram bot implementation
    // This would require a Telegram bot token
    return { success: true };
  }
}

// Singleton instance
const chatbotService = new ChatbotService();

// Initialize function for server startup
async function initializeChatbot() {
  try {
    await chatbotService.initialize();
    return chatbotService;
  } catch (error) {
    logger.error('Failed to initialize chatbot:', error);
    throw error;
  }
}

module.exports = {
  chatbotService,
  initializeChatbot
};