const Product = require("../models/product");
const Order = require("../models/order");
const fs = require('fs');
const PDFDocument = require('pdfkit');
const path = require('path');
const session = require("express-session");
const stripe = require('stripe')('sk_test_51HJ0x3AKYIM5CgkDQ4Ma2lDsKNyOFTSKbfcXz5GFSqgEMusep2Eqv20lcUzL60fbfd79dpZ5ZyBwop4fT9aB6Jig00WSDBzuQN')

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  const ITEMS_PER_PAGE = 2;
  let totalItems;
  Product.find()
  .countDocuments()
  .then(numOfPro => {
    totalItems = numOfPro;
    return Product.find()
    .skip(((page - 1) * ITEMS_PER_PAGE))
    .limit(ITEMS_PER_PAGE)
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shridutt's Shop",
        path: "/products",
        currentPage : page,
        hasNextPage :ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage : page > 1,
        nextPage : page + 1,
        previousPage : page - 1,
        lastPage : Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch((error) => {
      const er = new Error(error);
      er.httpStatusCode = 500;
      return next(er);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: "Product details",
        path: "/products",
        isAuthenticated: req.session.isAuthenticated,
      });
    })
    .catch((error) => {
      const er = new Error(error);
      er.httpStatusCode = 500;
      return next(er);
    });
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  const ITEMS_PER_PAGE = 2;
  let totalItems;
  Product.find()
  .countDocuments()
  .then(numOfPro => {
    totalItems = numOfPro;
    return Product.find()
    .skip(((page - 1) * ITEMS_PER_PAGE))
    .limit(ITEMS_PER_PAGE)
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shridutt's Shop",
        path: "/",
        currentPage : page,
        hasNextPage :ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage : page > 1,
        nextPage : page + 1,
        previousPage : page - 1,
        lastPage : Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch((error) => {
      console.log(error);
      const er = new Error(error);
      er.httpStatusCode = 500;
      return next(er);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "your cart",
        products: products,
        isAuthenticated: req.session.isAuthenticated,
      });
    })
    .catch((error) => {
      const er = new Error(error);
      er.httpStatusCode = 500;
      return next(er);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      req.user.addToCart(product);
    })
    .then((result) => {
      return res.redirect("/cart");
    })
    .catch((error) => {
      const er = new Error(error);
      er.httpStatusCode = 500;
      return next(er);
    });
};

exports.getCheckout = (req, res, next) => {
  let products;
  let total = 0;
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      products = user.cart.items;
      total = 0;
      products.forEach(p => {
        total += p.quantity * p.productId.price;
      });

      return stripe.checkout.sessions.create({
        payment_method_types : ['card'],
        line_items : products.map(p => {
          return {
            name : p.productId.title,
            description : p.productId.description,
            amount : p.productId.price * 100,
            currency : 'inr',
            quantity : p.quantity
          };
        }),
        success_url : req.protocol + '://' + req.get('host') + '/checkout/success',
        cancel_url : req.protocol + '://' + req.get('host') + '/checkout/cancel'
      })
      .then(session => {
        res.render('shop/checkout', {
          path: '/checkout',
          pageTitle: 'Checkout',
          products: products,
          totalSum: total,
          sessionId : session.id
        });
      })
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
exports.postOrders = (req, res, next) => {
  let fetchCart;
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
      });
      order
        .save()
        .then((result) => {
          return req.user.clearCart();
        })
        .then(() => {
          res.redirect("/orders");
        })
        .catch((error) => {
          const er = new Error(error);
          er.httpStatusCode = 500;
          return next(er);
        });
    });
};

exports.getOrderss = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Orders",
        orders: orders,
        isAuthenticated: req.session.isAuthenticated,
      });
    })
    .catch((e) => {
      const er = new Error(e);
      er.httpStatusCode = 500;
      return next(er);
    });
};

exports.postCartDeletProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((error) => {
      const er = new Error(error);
      er.httpStatusCode = 500;
      return next(er);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  


  Order.findById(orderId)
  .then(order => {
    if (!order) {
      return next(new Error('No order found with this order id'));
    }
    if (order.user.userId.toString() !== req.user._id.toString()) {
      return next(new Error('Unauthorized'));
    }

    fileName = 'invoice -' + orderId + '.pdf';
    const invoPath = path.join('data', 'invoices', fileName);
    const pdfDoc = new PDFDocument();
    

    pdfDoc.fontSize(26).text('Invoice', { underline : true});
    pdfDoc.text('--------------------------------------');
    const ru = '\u20b9';
    let totalPrice = 0;
    pdfDoc.pipe(fs.createWriteStream(invoPath));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; fileName="' + fileName + '"');
    order.products.forEach(prod => {
      totalPrice = totalPrice + (prod.product.price * prod.quantity)
      pdfDoc.font('/Users/patelshridutt/Downloads/Roboto/Roboto-Black.ttf'/* path for roboto font*/).text(prod.product.title + ' - ' + prod.quantity + ' x ' + ru + prod.product.price);
    });

    pdfDoc.text('Total price : ' + ru + totalPrice);
    
    
    pdfDoc.pipe(res);
    pdfDoc.end();
  })
  .catch(err => {
    console.log(err)
    return next(err)
  })

  /* fs.readFile(invoPath, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; fileName="' + fileName + '"')
      res.send(data);
    }
  }); */
}

