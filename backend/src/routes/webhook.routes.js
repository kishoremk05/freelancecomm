const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

// WhatsApp webhook (Twilio)
router.post('/whatsapp', webhookController.handleWhatsAppMessage);

// Telegram webhook
router.post('/telegram', webhookController.handleTelegramMessage);

// Web chat webhook
router.post('/chat', webhookController.handleChatMessage);

// Dialogflow fulfillment webhook
router.post('/dialogflow', webhookController.handleDialogflowWebhook);

// Google Calendar notification webhook
router.post('/calendar', webhookController.handleCalendarNotification);

// Booking confirmation webhook
router.post('/booking-confirmation', webhookController.handleBookingConfirmation);

// Test webhook endpoint
router.post('/test', webhookController.testWebhook);

// Get webhook status
router.get('/status', webhookController.getWebhookStatus);

module.exports = router;