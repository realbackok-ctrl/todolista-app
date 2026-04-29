'use strict';

const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authenticate');
const validate = require('../middlewares/validate');

const authRouter = express.Router();

authRouter.post('/register', validate.register, authController.register);
authRouter.post('/login', validate.login, authController.login);
authRouter.post('/logout', authenticate, authController.logout);
authRouter.delete('/account', authenticate, authController.deleteAccount);
authRouter.patch('/password', authenticate, validate.changePassword, authController.changePassword);

module.exports = authRouter;
