const Product = require("../models/product");
const Order = require("../models/order");
const fs = require('fs');
const PDFDocument = require('pdfkit');
const path = require('path');

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Shridutt's Shop",
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
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shridutt's Shop",
        path: "/",
      });
    })
    .catch((error) => {
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

exports.postOrders = (req, res, next) => {
  let fetchCart;
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      console.log("name " + req.user.name);
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
      console.log(orders);
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
      console.log(order.user.userId.toString())
      console.log(req.user._id);
      return next(new Error('Unauthorized'));
    }

    fileName = 'invoice -' + orderId + '.pdf';
    const invoPath = path.join('data', 'invoices', fileName);
    const pdfDoc = new PDFDocument();
    

    pdfDoc.fontSize(26).text('Invoice', { underline : true});
    pdfDoc.text('--------------------------------------');
    const ru = '\u20b9';
    console.log(ru);
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