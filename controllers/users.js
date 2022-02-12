const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const NotFoundError = require('../errors/notFoundErr');
const ConflictError = require('../errors/conflictError');
const BadRequestError = require('../errors/badRequestErr');

const { NODE_ENV, JWT_SECRET } = process.env;

function getCurrentUser(req, res, next) {
  User.findById(req.user._id)
    .orFail(new NotFoundError('Пользователь не найден'))
    .then((user) => res.send(user))
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
    .then((user) => res.send(user.toJSON()))
    .catch((err) => {
      if (err.name === 'MongoError' || err.code === 11000) {
        throw new ConflictError(
          'Пользователь с таким email уже зарегистрирован'
        );
      } else {
        next(err);
      }
    })

    .catch(next);
}

function login(req, res, next) {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((existedUser) => {
      const token = jwt.sign(
        { _id: existedUser._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' }
      );

      res
        .cookie('token', token, {
          httpOnly: true,
          sameSite: true,
          maxAge: 360000 * 24 * 7,
        })
        .send({ token });
    })

    .catch(next);
}
const logout = (req, res) =>
  res.clearCookie('token').send({ message: 'Выход выполнен' });

module.exports = {
  getCurrentUser,
  updateProfile,
  createProfile,
  login,
  logout,
};
