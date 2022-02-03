const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorizedErr');

const { JWT_SECRET = 'dev-secret' } = process.env;

const auth = (req, res, next) => {
  if (!req.cookies.jwt) {
    throw new UnauthorizedError(
      'Токен не передан или передан не в том формате'
    );
  }

  const token = req.cookies.jwt;

  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new UnauthorizedError('Передан некорректный токен');
  }

  req.user = payload;

  return next();
};

export default auth;
