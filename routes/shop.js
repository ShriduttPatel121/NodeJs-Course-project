const express = require('express');
const path = require('path');
const rootDir = require('../util/path');
const adminData = require('./admin');
const router = express.Router();
const shopConstroller = require('../controllers/shop');

// router.get('/',shopConstroller.getIndex);

// router.get('/products',shopConstroller.getProducts);

// router.post('/cart', shopConstroller.postCart);

// router.get('/cart',shopConstroller.getCart);
// router.post('/cart-delete-item',shopConstroller.postCartDeletProduct)


// router.post('/create-order', shopConstroller.postOrders);

// router.get('/orders',shopConstroller.getOrderss);

// router.get('/products/:productId',shopConstroller.getProduct);


module.exports = router;