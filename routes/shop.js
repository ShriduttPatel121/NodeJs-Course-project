const express = require('express');
const path = require('path');
const rootDir = require('../util/path');
const adminData = require('./admin');
const isAuth = require('../middleWare/is-auth');
const shopConstroller = require('../controllers/shop');
const router = express.Router();

router.get('/',shopConstroller.getIndex);

router.get('/products',shopConstroller.getProducts);

router.post('/cart', isAuth, shopConstroller.postCart);

router.get('/cart', isAuth, shopConstroller.getCart);

router.post('/cart-delete-item', isAuth, shopConstroller.postCartDeletProduct)

router.get('/checkout/success', isAuth, shopConstroller.postOrders);// postOrder controller was used before checkout fun. was made but it is same so it will be used

router.get('/checkout/cancel', shopConstroller.getCheckout);

router.get('/orders', isAuth, shopConstroller.getOrderss);

router.get('/products/:productId',shopConstroller.getProduct);

router.get('/checkout', isAuth, shopConstroller.getCheckout)

router.get('/orders/:orderId', isAuth, shopConstroller.getInvoice);

module.exports = router;