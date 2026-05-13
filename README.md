# FreelanceComm Google Meet Booking System

A premium freelance collective crafting digital products that move people. This project provides a fully functional Google Meet booking system integrated with a professional chatbot UI.

## 🚀 Overview

The system allows users to book meetings directly through a floating chatbot interface. Once a booking is confirmed, it automatically:
- Creates a Google Calendar event.
- Generates a unique Google Meet link.
- Sends email invitations to both the user and the administrator.
- Sets up automatic reminders (1 day and 30 minutes before the meeting).

---

## 🏗️ Project Structure

- **Frontend**: A React-based interface featuring an animated chatbot (`src/components/AppointmentBot.tsx`).
- **Backend**: An Express.js server handling Google API integrations and booking logic (`backend/`).

---

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js installed.
- A Google Cloud Project with Google Calendar API enabled.
- Google OAuth 2.0 Credentials (Client ID and Client Secret).

### 2. Installation

**Root (Frontend):**
```bash
npm install
npm run dev
```

**Backend:**
```bash
cd backend
npm install
npm run dev
```

### 3. Environment Configuration

Create a `.env` file in the `backend/src/` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# Admin Configuration
FREELANCECOMM_EMAIL=freelancecomm9@gmail.com
DEFAULT_TIMEZONE=Asia/Kolkata

# Security
JWT_SECRET=your_jwt_secret
```

---

## 🔐 Google OAuth Setup

To enable Google Meet creation:
1.  **Enable API**: Enable the **Google Calendar API** in your Google Cloud Console.
2.  **Consent Screen**: Configure the OAuth consent screen and add `https://www.googleapis.com/auth/calendar` and `https://www.googleapis.com/auth/calendar.events` scopes.
3.  **Authentication**: Visit `http://localhost:5000/api/auth/google` in your browser and sign in with the admin account to grant necessary permissions.

---

## 📡 API Reference

### Create a Booking
`POST /api/bookings`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "meetingTime": "2024-05-13T10:00:00.000Z",
  "duration": 30,
  "message": "Project discussion"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "meetLink": "https://meet.google.com/abc-defg-hij",
    "startTime": "2024-05-13T10:00:00.000Z"
  }
}
```

---

## 🎨 Chatbot Features

- **Interactive UI**: Smooth animations and step-by-step booking flow.
- **Real-time Availability**: Select from available Mon-Fri time slots.
- **Mobile Responsive**: Optimized for seamless use on all devices.
- **Instant Confirmation**: Displays the Google Meet link immediately after successful booking.

---

## 🐛 Troubleshooting

- **Backend Connection Issues**: Ensure the backend server is running on port 5000 and the `API_URL` in `AppointmentBot.tsx` is correctly configured.
- **No Email Received**: Check the backend logs, verify Google OAuth setup, and ensure the email isn't in the spam folder.
- **Calendar Errors**: Verify that the Google Calendar API is enabled and that you have completed the OAuth authentication flow.

---

## 📄 License

Proprietary - © FreelanceComm 2024
