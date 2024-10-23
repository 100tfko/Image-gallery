require('dotenv').config(); // Load .env file

const express = require('express');
const axios = require('axios'); // For making HTTP requests to Unsplash
const path = require('path');
const app = express();

// Load environment variables from .env file
const clientID = process.env.UNSPLASH_CLIENT_ID;
const clientSecret = process.env.UNSPLASH_CLIENT_SECRET;
const redirectUri = process.env.UNSPLASH_REDIRECT_URI;

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Route for the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Step 1: OAuth login route - Redirect user to Unsplash authorization page
app.get('/login', (req, res) => {
  const authURL = `https://unsplash.com/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectUri}&response_type=code&scope=public+read_user`;
  res.redirect(authURL); // Redirect the user to Unsplash to authenticate
});

// Step 2: OAuth callback route - Handle the callback from Unsplash
app.get('/callback', async (req, res) => {
  const code = req.query.code; // Authorization code from the URL

  if (!code) {
    return res.status(400).send('Authorization code not found.');
  }

  try {
    // Step 3: Exchange the authorization code for an access token
    const tokenResponse = await axios.post('https://unsplash.com/oauth/token', {
      client_id: clientID,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code: code,
      grant_type: 'authorization_code',
    });

    const accessToken = tokenResponse.data.access_token;

    // Now you have the access token to make authenticated requests to Unsplash
    // You can pass this access token back to the client or use it server-side to make API requests

    res.send(`Logged in successfully! Your access token is: ${accessToken}`);
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    res.status(500).send('Failed to retrieve access token');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});