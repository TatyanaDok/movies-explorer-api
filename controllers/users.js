const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const NotFoundError = require('../errors/notFoundErr');
const ConflictError = require('../errors/conflictError');
const BadRequestError = require('../errors/badRequestErr');

const { NODE_ENV, JWT_SECRET } = process.env;

function getCurrentUser(req, res, next) {
  return User.findById(req.user._id)
    .orFail()
    .then((user) => {
      if (user) {
        res.send(user);
      } else throw new NotFoundError('Пользователь не найден');
    })
    .catch(next);
}

function updateProfile(req, res, next) {
  const { name, email } = req.body;
  return User.findByIdAndUpdate(
    req.user._id,
    {
      name,
      email,
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .orFail(() => new NotFoundError('Нет пользователя с таким id'))
    .catch((err) => {
      if (err instanceof NotFoundError) {
        throw err;
      }
      throw new BadRequestError('Переданы некорректные данные');
    })
    .then((user) => res.send(user))
    .catch(next);
}

function createProfile(req, res, next) {
  const { name, email, password } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) =>
      User.create({
        name,
        email,
        password: hash,
      })
    )
    .catch((err) => {
      if (err.name === 'MongoError' || err.code === 11000) {
        throw new ConflictError(
          'Пользователь с таким email уже зарегистрирован'
        );
      } else {
        next(err);
      }
    })
    .then((user) => {
      res.status(201).send({
        name: user.name,
        email: user.email,
      });
    })
    .catch(next);
}

function login(req, res, next) {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' }
      );
      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: true,
        })
        .send({ message: 'Успешная авторизация' });
    })
    .catch(next);
}

function logout(req, res) {
  res.clearCookie('jwt').send({ message: 'Вы вышли из аккаунта' });
}

module.exports = {
  getCurrentUser,
  updateProfile,
  createProfile,
  login,
  logout,
};
