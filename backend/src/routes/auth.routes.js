const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const router = express.Router();

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Scopes for Google Calendar and Meet
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

// Step 1: Redirect user to Google OAuth consent screen
router.get('/google', (req, res) => {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent' // Force consent screen to get refresh token
    });

    logger.info('Generated Google OAuth URL');
    res.redirect(authUrl);
  } catch (error) {
    logger.error('Failed to generate OAuth URL:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to initiate OAuth flow'
    });
  }
});

// Step 2: Handle OAuth callback and exchange code for tokens
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send(`
        <html>
          <head><title>OAuth Error</title></head>
          <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
            <h1 style="color: #e74c3c;">❌ Authorization Failed</h1>
            <p>No authorization code received from Google.</p>
            <a href="/api/auth/google" style="color: #3498db;">Try Again</a>
          </body>
        </html>
      `);
    }

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    logger.info('Successfully obtained OAuth tokens');

    // Display tokens to user for manual .env update
    res.send(`
      <html>
        <head>
          <title>OAuth Success</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              padding: 40px;
              background: #1e1e1e;
              color: #d4d4d4;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: #252526;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            }
            h1 {
              color: #4ec9b0;
              margin-bottom: 20px;
            }
            .success {
              color: #4ec9b0;
              font-size: 48px;
              margin-bottom: 20px;
            }
            .token-box {
              background: #1e1e1e;
              padding: 20px;
              border-radius: 4px;
              margin: 20px 0;
              border-left: 4px solid #4ec9b0;
            }
            .token-label {
              color: #569cd6;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .token-value {
              color: #ce9178;
              word-break: break-all;
              font-size: 12px;
              line-height: 1.6;
            }
            .instructions {
              background: #2d2d30;
              padding: 20px;
              border-radius: 4px;
              margin-top: 30px;
              border-left: 4px solid #dcdcaa;
            }
            .instructions h2 {
              color: #dcdcaa;
              margin-top: 0;
            }
            .instructions ol {
              line-height: 1.8;
            }
            .instructions code {
              background: #1e1e1e;
              padding: 2px 6px;
              border-radius: 3px;
              color: #ce9178;
            }
            .warning {
              background: #3c2f1f;
              border-left: 4px solid #d19a66;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .warning strong {
              color: #d19a66;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✅</div>
            <h1>Google Calendar OAuth Successful!</h1>
            <p>Copy these tokens to your <code>backend/src/.env</code> file:</p>
            
            <div class="token-box">
              <div class="token-label">GOOGLE_ACCESS_TOKEN=</div>
              <div class="token-value">${tokens.access_token}</div>
            </div>
            
            <div class="token-box">
              <div class="token-label">GOOGLE_REFRESH_TOKEN=</div>
              <div class="token-value">${tokens.refresh_token || 'Not provided - you may need to revoke access and try again'}</div>
            </div>
            
            ${tokens.expiry_date ? `
            <div class="token-box">
              <div class="token-label">GOOGLE_TOKEN_EXPIRY=</div>
              <div class="token-value">${tokens.expiry_date}</div>
            </div>
            ` : ''}

            <div class="warning">
              <strong>⚠️ Important:</strong> If GOOGLE_REFRESH_TOKEN is missing, you need to:
              <ol>
                <li>Go to <a href="https://myaccount.google.com/permissions" target="_blank" style="color: #4ec9b0;">Google Account Permissions</a></li>
                <li>Remove access for your app</li>
                <li>Visit <a href="/api/auth/google" style="color: #4ec9b0;">/api/auth/google</a> again</li>
              </ol>
            </div>
            
            <div class="instructions">
              <h2>📝 Next Steps:</h2>
              <ol>
                <li>Open <code>backend/src/.env</code> in your editor</li>
                <li>Add or update these lines with the tokens above</li>
                <li>Restart your backend server</li>
                <li>Test the booking chatbot!</li>
              </ol>
            </div>
          </div>
        </body>
      </html>
    `);

  } catch (error) {
    logger.error('OAuth callback error:', error);
    res.status(500).send(`
      <html>
        <head><title>OAuth Error</title></head>
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
          <h1 style="color: #e74c3c;">❌ Authorization Failed</h1>
          <p>${error.message}</p>
          <a href="/api/auth/google" style="color: #3498db;">Try Again</a>
        </body>
      </html>
    `);
  }
});

// Check OAuth status
router.get('/status', (req, res) => {
  const hasClientId = !!process.env.GOOGLE_CLIENT_ID;
  const hasClientSecret = !!process.env.GOOGLE_CLIENT_SECRET;
  const hasAccessToken = !!process.env.GOOGLE_ACCESS_TOKEN;
  const hasRefreshToken = !!process.env.GOOGLE_REFRESH_TOKEN;

  const isConfigured = hasClientId && hasClientSecret && hasAccessToken && hasRefreshToken;

  res.json({
    status: 'success',
    data: {
      configured: isConfigured,
      hasClientId,
      hasClientSecret,
      hasAccessToken,
      hasRefreshToken,
      setupUrl: isConfigured ? null : `${process.env.BASE_URL}/api/auth/google`
    }
  });
});

router.post('/login', (req, res) => {
  res.json({
    status: 'success',
    message: 'Login endpoint - to be implemented'
  });
});

router.post('/register', (req, res) => {
  res.json({
    status: 'success',
    message: 'Register endpoint - to be implemented'
  });
});

router.post('/logout', (req, res) => {
  res.json({
    status: 'success',
    message: 'Logout endpoint - to be implemented'
  });
});

module.exports = router;