const express = require('express');
const adminRoutes = require('./routes/admin');
 const shopRouts = require('./routes/shop');
const bodyParser = require('body-parser');
const notFoundPage = require('./controllers/404');
const path = require('path');
const mongoConnect = require('./util/database').MongoConnect;
const User = require('./models/user');
const app = express();

app.set('view engine','ejs');
app.set('views','views');

app.use(bodyParser.urlencoded({extended : false}));
app.use(express.static(path.join(__dirname, 'public')));

 app.use((req, res, next) => {
    User.findById("5eeefa253cde74cb33a14861")
    .then(user => {
        req.user = new User(user.userName, user.email, user.cart,user._id);
        next(); 
    })
    .catch(error => {
        console.log(error);
    });
})

app.use('/admin',adminRoutes);
app.use(shopRouts);



app.use(notFoundPage.getError404Page);

mongoConnect(() => {
    app.listen(3000);
})