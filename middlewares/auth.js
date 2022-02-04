const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const UnauthorizedError = require('../errors/unauthorizedErr');

const auth = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(
      new UnauthorizedError(
        'При авторизации произошла ошибка. Токен не передан или передан не в том формате'
      )
    );
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
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
