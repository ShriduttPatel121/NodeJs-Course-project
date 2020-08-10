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
const app = express();

const MONGODB_URI = 'mongodb+srv://ShriduttPatel:RYBxFXmrhLJxNDYG@node-shop-pgh1l.mongodb.net/shop'

const store = new MongoDBStore({
    uri : MONGODB_URI,
    collection : 'sessions'
});

const csrfProtection = csurf();

app.set('view engine','ejs');
app.set('views','views');

app.use(bodyParser.urlencoded({extended : false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:'my secret', resave : false, saveUninitialized: false, store : store}))

app.use(csrfProtection);
app.use(flash())

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
        throw new Error(error);
    });

})

app.use( (req, res, next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated;
    res.locals.csrfToken = req.csrfToken();
    next();
})

app.use('/admin',adminRoutes);
app.use(shopRouts);
app.use(authRouts);



app.use(notFoundPage.getError404Page);

mongoose.connect(MONGODB_URI)
.then(result => {
    app.listen(3000);
})
.catch(error => {
    console.log(error);
});