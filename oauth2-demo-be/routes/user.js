const router = require('express').Router();

const jwt = require('jsonwebtoken');
const { jwtDecode } = require('jwt-decode');

const User = require('../models/user');

// GET userinfo
router.get('/', async function (req, res, next) {
  const jwtToken = req.cookies.token;

  if (!jwtToken) {
    return res.status(401).json({ message: 'JWT Token not found' });
  }

  const { id_token } = jwt.verify(jwtToken, process.env.JWT_SECRET);
  if (!id_token) {
    return res.status(401).json({ message: 'Invalid id_token' });
  }

  const { sub } = jwtDecode(id_token);
  if (!sub) {
    return res.status(401).json({ message: 'Invalid userid' });
  }

  try {
    const user = await User.findOne({ userid: sub });
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: user.toJSON(),
    });
  } catch {
    res.status(401).json({ message: 'User not found (error)' });
  }
});

module.exports = router;
