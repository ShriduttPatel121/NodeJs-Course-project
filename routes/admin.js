const express = require('express');
const adminConstroller = require('../controllers/admin');
const router = express.Router();

 //admin/add-product -> GET
// router.get('/add-product',adminConstroller.getAddProduct);
 //admin/add-product -> POST
// router.post('/add-product',adminConstroller.postAddProduct);
//admin/products -> GET
//  router.get('/products', adminConstroller.getProducts);

//  router.get('/edit-product/:productId',adminConstroller.getEditProducts);
// router.post('/edit-product', adminConstroller.postEditProduct);

// router.post('/delete-product', adminConstroller.postDeleteProduct);

module.exports = router;