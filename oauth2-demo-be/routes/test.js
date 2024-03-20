const router = require('express').Router();

router.get('/check-cookies', function (req, res, next) {
  res.status(200).json(req.cookies);
});

module.exports = router;
