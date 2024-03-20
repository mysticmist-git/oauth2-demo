const jwt = require('jsonwebtoken');
const { jwtDecode } = require('jwt-decode');

const { google } = require('googleapis');

const client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'http://localhost:3000/oauth'
);

const User = require('../models/user');

async function auth(req, res, next) {
  const jwtToken = req.cookies.token;

  if (!jwtToken) {
    return res.status(401).json({ message: 'JWT Token not found' });
  }

  const tokens = jwt.verify(jwtToken, process.env.JWT_SECRET);
  client.setCredentials(tokens);

  if (!tokens.id_token) {
    return res.status(401).json({ message: 'Invalid tokens.id_token' });
  }

  const { sub } = jwtDecode(tokens.id_token);
  if (!sub) {
    return res.status(401).json({ message: 'Invalid userid' });
  }

  const expired = isAccessTokenExpired(tokens);
  if (expired) {
    const { credentials } = await client.refreshAccessToken();
    client.setCredentials(credentials);
  }

  try {
    const user = await User.findOne({ userid: sub });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
  } catch {
    return res.status(401).json({ message: 'User not found (error)' });
  }

  req.tokens = tokens;
  req.userid = sub;
  next();
}

function isAccessTokenExpired(tokens) {
  const expirationTime = tokens.expires_at;
  const currentTime = Date.now();
  return currentTime >= expirationTime;
}

module.exports = auth;
