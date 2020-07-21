const User = require('../models/user');
exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path : '/login',
        pageTitle : 'Login',
        isAuthenticated: false
    });
};

exports.postLogin = (req, res, next) => {
    User.findById("5ef9f78f6babb05d52acc55e")
    .then(user => {
        req.session.user = user
        req.session.isAuthenticated = true
        req.session.save((err) => {
            console.log(err);
            res.redirect('/');
        })
    })
    .catch(error => {
        console.log(error);
    });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    })
}