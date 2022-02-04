const router = require('express').Router();
const { updateUserValidator } = require('../middlewares/celebrate');
const { getCurrentUser, updateProfile } = require('../controllers/users');

router.get('/users/me', getCurrentUser);
router.patch('/users/me', updateUserValidator, updateProfile);

module.exports = router;
