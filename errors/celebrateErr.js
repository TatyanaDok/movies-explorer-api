const { isCelebrateError } = require('celebrate');
const BadRequestError = require('./badRequestErr');

const celebrateError = (err, req, res, next) => {
  if (isCelebrateError(err)) {
    throw new BadRequestError(err.details.get('body').message);
  }
  next(err);
};

module.exports = celebrateError;
