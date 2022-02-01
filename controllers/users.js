const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;
const User = require('../models/user');

const NotFoundError = require('../errors/notFoundErr');
const ConflictError = require('../errors/conflictError');
const BadRequestError = require('../errors/badRequestErr');

module.exports.getUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      res.send(user);
    })
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  const { email, name } = req.body;
  return User.findOne({ email })
    .then((userChecked) => {
      if (userChecked) {
        throw new ConflictError(
          'Пользователь с таким email уже зарегистрирован'
        );
      } else {
        return User.findByIdAndUpdate(
          req.user._id,
          { email, name },
          { new: true, runValidators: true }
        ).then((user) => {
          if (!user) {
            throw new NotFoundError('Пользователь не найден');
          }
          res.send(user);
        });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError(
          'Переданы некорректные данные для обновления профиля'
        );
      }
      if (err.name === 'CastError') {
        throw new BadRequestError(
          'Переданы некорректные данные для обновления профиля'
        );
      }
      throw err;
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((existedUser) => {
      const token = jwt.sign(
        { _id: existedUser._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' }
      );

      User.findOne({ email }).then((user) => {
        res
          .cookie('jwt', token, {
            httpOnly: true,
            sameSite: true,
            maxAge: 360000 * 24 * 7,
          })
          .send(user);
      });
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const { name, email, password } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) =>
      User.create({
        name,
        email,
        password: hash,
      })
        .then((user) =>
          res.send({
            email: user.email,
            name: user.name,
            _id: user._id,
          })
        )
        .catch((err) => {
          if (err.name === 'ValidationError') {
            throw new BadRequestError('Переданы некорректные данные ');
          }
          if (err.name === 'MongoError' && err.code === 11000) {
            throw new ConflictError(
              'Пользователь с таким email уже зарегистрирован'
            );
          }
          throw err;
        })
    )
    .catch(next);
};

module.exports.signout = (req, res) => {
  res
    .clearCookie('token', { httpOnly: true, sameSite: true })
    .send({ message: 'Выход выполнен' });
};
