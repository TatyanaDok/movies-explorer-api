// разрешенные адреса отправки запросов
const CORS_WHITELIST = [
  'http://localhost:3001',
  'http://localhost:3000',
  'https://shev.movies.students.nomoredomains.icu',
  'http://shev.movies.students.nomoredomains.icu',
];

// статусы ошибок
const ERROR_CODE_VALIDATION = 400;
const ERROR_CODE_AUTH = 401;
const ERROR_CODE_NO_RIGHTS = 403;
const ERROR_CODE_NOT_FOUND = 404;
const ERROR_CODE_IT_EXIST = 409;
const ERROR_CODE_SERVER = 500;

module.exports = {
  CORS_WHITELIST,
  ERROR_CODE_VALIDATION,
  ERROR_CODE_NOT_FOUND,
  ERROR_CODE_SERVER,
  ERROR_CODE_AUTH,
  ERROR_CODE_IT_EXIST,
  ERROR_CODE_NO_RIGHTS,
};
