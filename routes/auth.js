const express = require('express');
const adminConstroller = require('../controllers/admin');
const authController = require('../controllers/auth');
const { route } = require('./admin');
const router = express.Router();

router.get('/login',authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login',authController.postLogin);

router.post('/signup', authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getRestPassword);

router.post('/reset', authController.postRestPassword);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);
module.exports = router;