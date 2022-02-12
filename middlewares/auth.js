const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorizedErr');

const { NODE_ENV, JWT_SECRET } = process.env;

const auth = (req, res, next) => {
  if (!req.cookies.jwt) {
    throw new UnauthorizedError(
      'Токен не передан или передан не в том формате'
    );
  }

  const token = req.cookies.jwt;

  let payload;

  try {
    payload = jwt.verify(
      token,
      NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret'
    );
  } catch (err) {
    next(
      new UnauthorizedError(
        'При авторизации произошла ошибка. Переданный токен некорректен'
      )
    );
  }
  req.user = payload;
  return next();
};

module.exports = auth;
