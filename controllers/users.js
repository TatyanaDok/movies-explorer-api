const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;
const User = require('../models/user');

const NotFoundError = require('../errors/notFoundErr');
const UnauthorizedError = require('../errors/unauthorizedErr');
const ConflictError = require('../errors/conflictError');

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
  const { name, email } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    {
      new: true,
      runValidators: true,
    }
  )
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Переданы некорректные данные');
      }

      res.send(user);
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
  const { name, about, avatar, email, password } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) =>
      User.create({
        name,
        about,
        avatar,
        email,
        password: hash,
      })
    )
    .catch((err) => {
      if (err.name === 'MongoError' || err.code === 11000) {
        throw new ConflictError(
          'Пользователь с таким email уже зарегистрирован'
        );
      } else next(err);
    })
    .then((user) =>
      res.send({
        email: user.email,
        about: user.about,
        name: user.name,
        avatar: user.avatar,
        _id: user._id,
      })
    )
    .catch(next);
};

module.exports.signout = (req, res) => {
  res
    .clearCookie('jwt', { httpOnly: true, sameSite: true })
    .send({ message: 'Signed Out' });
};
