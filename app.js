const express = require('express');
const adminRoutes = require('./routes/admin');
const shopRouts = require('./routes/shop');
const authRouts = require('./routes/auth');
const bodyParser = require('body-parser');
const notFoundPage = require('./controllers/404');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const path = require('path');
const csurf = require('csurf');
const User = require('./models/user');
const multer = require('multer');
const app = express();

const MONGODB_URI = 'mongodb+srv://ShriduttPatel:RYBxFXmrhLJxNDYG@node-shop-pgh1l.mongodb.net/shop'

const store = new MongoDBStore({
    uri : MONGODB_URI,
    collection : 'sessions'
});

const csrfProtection = csurf();

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype ==='image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false)
    }
}
const fileStorage = multer.diskStorage({ // for multer config
    destination : (req, file, cb) => {
        cb(null, 'images')
    },
    filename : (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
})

app.set('view engine','ejs');
app.set('views','views');

app.use(bodyParser.urlencoded({extended : false}));
app.use(multer({storage : fileStorage, fileFilter : fileFilter}).single('image'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(session({secret:'my secret', resave : false, saveUninitialized: false, store : store}))

app.use(csrfProtection);
app.use(flash())

app.use( (req, res, next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated;
    res.locals.csrfToken = req.csrfToken();
    next();
});
app.use((req, res, next) => {
    if(!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
    .then(user => {
        req.user = user
        next();
    })
    .catch(error => {
        next(new Error(error));
    });

})



app.use('/admin',adminRoutes);
app.use(shopRouts);
app.use(authRouts);


app.use((error, req, res, next) => {
    console.log(error);
    res
      .status(500)
      .render("500", {
        pageTitle: "Page not found",
        path: "/notfound",
        isAuthenticated: req.session.isAuthenticated,
      });
});
app.use('/500', notFoundPage.getError500Page);
app.use(notFoundPage.getError404Page);

//  spacial error handling middleware.

mongoose.connect(MONGODB_URI)
.then(result => {
    app.listen(3000);
})
.catch(error => {
    console.log(error);
}); // dummy card 4000056655665556