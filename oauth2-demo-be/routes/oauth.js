const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const { google } = require('googleapis');
const { jwtDecode } = require('jwt-decode');

const redirectUrl = 'http://127.0.0.1:3000/oauth';
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  redirectUrl
);

const User = require('../models/user');

// GET oauth2 request
router.get('/request', function (req, res, next) {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope:
      'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid https://www.googleapis.com/auth/gmail.readonly',
    prompt: 'consent',
  });

  res.status(200).json({ url });
});

// GET oauth2 callback
router.get('/', async function (req, res, next) {
  const code = req.query.code;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    const { sub, name, email, picture } = jwtDecode(tokens.id_token);

    let user = await User.findOne({ userid: sub });
    if (!user) {
      user = new User({
        userid: sub,
        name,
        email,
        picture,
        introduction: 'new user.',
      });
      await user.save();
    }

    const token = jwt.sign(tokens, process.env.JWT_SECRET);

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    const redirectUrl = `http://localhost:5173?user=${encodeURIComponent(
      JSON.stringify(user.toJSON())
    )}`;
    res.redirect(302, redirectUrl);
  } catch (error) {
    console.log('fail to sign in with google', error);
  }
});

// GET signed in check
router.get('/check', function (req, res, next) {
  const jwtToken = req.cookies.token;
  if (!jwtToken) {
    return res.status(200).json({ signin: false });
  }

  const token = jwt.verify(jwtToken, process.env.JWT_SECRET);
  if (token) {
    return res.status(200).json({ signin: true });
  } else {
    return res.status(200).json({ signin: false });
  }
});

// GET sign out
router.get('/signout', function (req, res, next) {
  res.cookie('token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  res.status(200).json({ message: 'Signed out' });
});

module.exports = router;
