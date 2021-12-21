require('dotenv').config();

const express = require('express');

const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const corsConfig = require('./middlewares/cors');
const users = require('./routes/users');
const movies = require('./routes/movies');
const auth = require('./middlewares/auth');
const { createUser, login, signout } = require('./controllers/users');
const {
  loginValidator,
  createUserValidator,
} = require('./middlewares/celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const NotFoundError = require('./errors/notFoundErr');

const { PORT = 3000 } = process.env;
const app = express();
app.use(corsConfig);
app.use(cookieParser());
mongoose.connect('mongodb://localhost:27017/bitfilmsdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});
app.post('/signin', loginValidator, login);
app.post('/signup', createUserValidator, createUser);

app.use('/', auth, users);
app.use('/', auth, movies);

app.get('/signout', signout);

app.use('*', (req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
});
app.use(errorLogger);
app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode, message } = err;

  if (statusCode) {
    return res.status(statusCode).send({ message });
  }

  return next();
});

app.use((req, res) => {
  res.status(500).send({ message: 'На сервере произошла ошибка' });
});
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
