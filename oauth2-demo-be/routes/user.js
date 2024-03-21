const router = require('express').Router();

const User = require('../models/user');

// GET userinfo
router.get('/', async function (req, res, next) {
  const tokens = req.tokens;
  const sub = req.userid;

  try {
    const user = await User.findOne({ userid: sub });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: user.toJSON(),
    });
  } catch {
    res.status(404).json({ message: 'User not found (error)' });
  }
});

router.patch('/update-intro', async function (req, res, next) {
  const tokens = req.tokens;
  const sub = req.userid;
  const introduction = req.body.introduction;

  try {
    await User.updateOne({ userid: sub }, { introduction });
    res
      .status(200)
      .json({ status: 'ok', message: 'update user introduction successfully' });
  } catch (error) {
    console.log("fail to update user's introduction", error);
    res.status(500).json({ message: "fail to update user's introduction" });
  }
});

module.exports = router;
