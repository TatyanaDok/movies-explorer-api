const router = require('express').Router();
const userRouter = require('./users');
const movieRouter = require('./movies');
const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/notFoundErr');
const {
  loginValidator,
  createUserValidator,
} = require('../middlewares/celebrate');

const { createProfile, login, logout } = require('../controllers/users');

router.post('/signup', createUserValidator, createProfile);
router.post('/signin', loginValidator, login);
router.use(auth);
router.use('/', userRouter);
router.use('/', movieRouter);
router.post('/signout', logout);
router.use(() => {
  throw new NotFoundError('Страница не найдена');
});

module.exports = router;
