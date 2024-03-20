const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const db = process.env.MONGO_URI + '/oauth2-demo';
mongoose
  .connect(db)
  .then(() => console.log('MongoDB connected!'))
  .catch((err) => console.log('MongoDB error', err));

const oAuthRouter = require('./routes/oauth');
const mailsRouter = require('./routes/mails');
const userRouter = require('./routes/user');

const testRouter = require('./routes/test');

const app = express();
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/oauth', oAuthRouter);
app.use('/mails', mailsRouter);
app.use('/user', userRouter);
app.use('/test', testRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

module.exports = app;
