require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const limiter = require('./middlewares/ratelimit');
const errorHandler = require('./middlewares/error-handler');
const { corsConfig } = require('./middlewares/cors');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const routes = require('./routes/index');
const celebrateError = require('./errors/celebrateErr');

const { PORT = 3000, MONGO_URL = 'mongodb://localhost:27017/bitfilmsdb' } =
  process.env;
const app = express();

mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.use(requestLogger);
app.use('*', cors(corsConfig));
app.use(limiter);
app.use(helmet());

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(routes);
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);
app.use(celebrateError);

app.listen(PORT);
