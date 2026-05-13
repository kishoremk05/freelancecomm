const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendar.controller');

// Calendar routes
router.get('/events', calendarController.listEvents);
router.post('/sync', calendarController.syncCalendar);
router.get('/busy', calendarController.getBusyPeriods);
router.get('/availability', calendarController.checkAvailability);

module.exports = router;