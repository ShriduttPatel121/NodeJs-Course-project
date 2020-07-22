const express = require('express');
const adminConstroller = require('../controllers/admin');
const isAuth = require('../middleWare/is-auth');
const router = express.Router();

 //admin/add-product -> GET
router.get('/add-product', isAuth, adminConstroller.getAddProduct);
 //admin/add-product -> POST
 router.post('/add-product', isAuth, adminConstroller.postAddProduct);
//admin/products -> GET
  router.get('/products', isAuth, adminConstroller.getProducts);

router.get('/edit-product/:productId', isAuth, adminConstroller.getEditProducts);
router.post('/edit-product', isAuth, adminConstroller.postEditProduct);

 router.post('/delete-product', isAuth, adminConstroller.postDeleteProduct);

module.exports = router;