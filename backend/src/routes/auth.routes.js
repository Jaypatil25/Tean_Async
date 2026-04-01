const express = require('express');
const router = express.Router();

const { signup, login, logout, me } = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const { signupSchema, loginSchema } = require('../validators/auth.validator');
const { verifyAccessToken } = require('../middlewares/auth.middleware');

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.get('/me', verifyAccessToken, me);
router.post('/logout', verifyAccessToken, logout);

module.exports = router;
