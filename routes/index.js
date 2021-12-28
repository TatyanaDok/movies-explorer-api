const router = require('express').Router();
const userRouter = require('./users');
const movieRouter = require('./movies');
const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/notFoundErr');
const {
  loginValidator,
  createUserValidator,
} = require('../middlewares/celebrate');

const { createUser, login, signout } = require('../controllers/users');

router.post('/signin', loginValidator, login);
router.post('/signup', createUserValidator, createUser);

router.use('/', auth, userRouter);
router.use('/', auth, movieRouter);
router.delete('/signout', signout);
router.use(() => {
  throw new NotFoundError('Страница не найдена');
});

module.exports = router;
