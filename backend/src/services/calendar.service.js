const { google } = require('googleapis');
const { OAuth2 } = google.auth;
const logger = require('../utils/logger');

class CalendarService {
  constructor() {
    this.calendar = null;
    this.oauth2Client = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      // Check if Google credentials are configured
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        throw new Error('Google credentials not configured');
      }

      this.oauth2Client = new OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      // Set credentials (in production, this would come from database)
      // For now, skip if tokens are not available
      if (process.env.GOOGLE_ACCESS_TOKEN && process.env.GOOGLE_REFRESH_TOKEN) {
        this.oauth2Client.setCredentials({
          access_token: process.env.GOOGLE_ACCESS_TOKEN,
          refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
          scope: 'https://www.googleapis.com/auth/calendar',
          token_type: 'Bearer',
          expiry_date: process.env.GOOGLE_TOKEN_EXPIRY
        });
      } else {
        logger.warn('Google OAuth tokens not configured - calendar features will be limited');
      }

      this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      this.initialized = true;
      
      logger.info('Google Calendar service initialized successfully');
      return true;
    } catch (error) {
      logger.error('Failed to initialize Google Calendar service:', error);
      throw error;
    }
  }

  async createGoogleMeetEvent(bookingData) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const event = {
        summary: bookingData.title || 'Meeting with FreelanceComm',
        description: bookingData.description || 'Scheduled via FreelanceComm Booking Chatbot',
        start: {
          dateTime: bookingData.startTime,
          timeZone: bookingData.timeZone || process.env.DEFAULT_TIMEZONE,
        },
        end: {
          dateTime: bookingData.endTime,
          timeZone: bookingData.timeZone || process.env.DEFAULT_TIMEZONE,
        },
        attendees: bookingData.attendees || [],
        conferenceData: {
          createRequest: {
            requestId: `meeting-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 } // 30 minutes before
          ]
        }
      };

      const response = await this.calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all'
      });

      logger.info('Google Meet event created:', response.data.id);
      logger.info('Event attendees:', JSON.stringify(response.data.attendees));
      logger.info('Send updates setting:', 'all');
      
      return {
        eventId: response.data.id,
        meetLink: response.data.hangoutLink,
        htmlLink: response.data.htmlLink,
        startTime: response.data.start.dateTime,
        endTime: response.data.end.dateTime,
        status: response.data.status
      };
    } catch (error) {
      logger.error('Failed to create Google Meet event:', error);
      throw error;
    }
  }

  async getEvent(eventId) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const response = await this.calendar.events.get({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        eventId: eventId
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to get event:', error);
      throw error;
    }
  }

  async updateEvent(eventId, updates) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const response = await this.calendar.events.patch({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        eventId: eventId,
        resource: updates,
        sendUpdates: 'all'
      });

      logger.info('Google Meet event updated:', eventId);
      return response.data;
    } catch (error) {
      logger.error('Failed to update event:', error);
      throw error;
    }
  }

  async deleteEvent(eventId) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      await this.calendar.events.delete({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        eventId: eventId,
        sendUpdates: 'all'
      });

      logger.info('Google Meet event deleted:', eventId);
      return true;
    } catch (error) {
      logger.error('Failed to delete event:', error);
      throw error;
    }
  }

  async checkAvailability(timeSlot) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const response = await this.calendar.freebusy.query({
        resource: {
          timeMin: timeSlot.startTime,
          timeMax: timeSlot.endTime,
          timeZone: timeSlot.timeZone || process.env.DEFAULT_TIMEZONE,
          items: [{ id: process.env.GOOGLE_CALENDAR_ID || 'primary' }]
        }
      });

      const busySlots = response.data.calendars[process.env.GOOGLE_CALENDAR_ID || 'primary'].busy;
      return {
        available: busySlots.length === 0,
        busySlots: busySlots
      };
    } catch (error) {
      logger.error('Failed to check availability:', error);
      throw error;
    }
  }

  async listEvents(timeMin, timeMax, maxResults = 10) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const response = await this.calendar.events.list({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        timeMin: timeMin,
        timeMax: timeMax,
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime'
      });

      return response.data.items;
    } catch (error) {
      logger.error('Failed to list events:', error);
      throw error;
    }
  }

  async refreshToken() {
    try {
      const { tokens } = await this.oauth2Client.refreshAccessToken();
      this.oauth2Client.setCredentials(tokens);
      
      // Save new tokens to database in production
      logger.info('Google Calendar token refreshed');
      return tokens;
    } catch (error) {
      logger.error('Failed to refresh token:', error);
      throw error;
    }
  }
}

// Singleton instance
const calendarService = new CalendarService();

// Initialize function for server startup
async function initializeGoogleCalendar() {
  try {
    await calendarService.initialize();
    return calendarService;
  } catch (error) {
    logger.error('Failed to initialize Google Calendar:', error);
    throw error;
  }
}

module.exports = {
  calendarService,
  initializeGoogleCalendar
};