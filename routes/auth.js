const express = require('express');
const adminConstroller = require('../controllers/admin');
const authController = require('../controllers/auth');
const { check, body } = require('express-validator/check')
const User = require('../models/user');
const router = express.Router();

router.get('/login',authController.getLogin);

router.get('/signup', authController.getSignup);

router.post(
    '/login', 
    [
        check('email')
        .isEmail()
        .withMessage('Invalid Email')
        .normalizeEmail()
        .custom((value, { req }) => {
            return User.findOne({ email: value })
            .then(user => {
                if (!user)  {
                    return Promise.reject('Email or password is invalid')
                } else {
                    req.user = user
                }
                
            })
        }),
        body('password', 'Email or password is invalid')
        .isLength({min : 5})
        .isAlphanumeric()
        .trim()
    ], authController.postLogin);

router.post(
    '/signup', 
    [
        check('email')
        .isEmail()
        .withMessage('Invalid Email address')
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then((userDoc) => {
                    return Promise.reject('Email-already exists')
            });
        })
        .normalizeEmail(),
        body('password',' please enter password which contains Numbers and has length of atleast 5 characters')
        .isLength({min : 5})
        .isAlphanumeric()
        .trim(),
        body('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords have to match');
            }
            return true;
        })
        .trim()
    ],authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getRestPassword);

router.post('/reset', authController.postRestPassword);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;