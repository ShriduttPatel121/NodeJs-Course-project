const express = require('express');
const adminRoutes = require('./routes/admin');
 const shopRouts = require('./routes/shop');
const bodyParser = require('body-parser');
const notFoundPage = require('./controllers/404');
const mongoose = require('mongoose');
const path = require('path');
const User = require('./models/user');
const app = express();

app.set('view engine','ejs');
app.set('views','views');

app.use(bodyParser.urlencoded({extended : false}));
app.use(express.static(path.join(__dirname, 'public')));

 app.use((req, res, next) => {
    User.findById("5ef9f78f6babb05d52acc55e")
    .then(user => {
        req.user = user
        next(); 
    })
    .catch(error => {
        console.log(error);
    });
})

app.use('/admin',adminRoutes);
app.use(shopRouts);



app.use(notFoundPage.getError404Page);

mongoose.connect('mongodb+srv://ShriduttPatel:RYBxFXmrhLJxNDYG@node-shop-pgh1l.mongodb.net/shop?retryWrites=true&w=majority')
.then(result => {

    User.findOne()
    .then(user => {
        if(!user){
            const user = new User({
                name : 'Shridutt',
                email : 'shridutt270@gmail.com',
                cart : {
                    items : []
                }
            });
            user.save();
        }
    });
    app.listen(3000);
})
.catch(error => {
    console.log(error);
})