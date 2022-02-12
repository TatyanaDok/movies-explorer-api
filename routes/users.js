const router = require('express').Router();
const { updateUserValidator } = require('../middlewares/celebrate');
const { getCurrentUser, updateProfile } = require('../controllers/users');

router.get('/me', getCurrentUser);
router.patch('/me', updateUserValidator, updateProfile);

module.exports = router;
