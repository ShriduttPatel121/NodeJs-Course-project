const Product = require("../models/product");
const Order = require("../models/order");

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Shridutt's Shop",
        path: "/products",
      });
    })
    .catch((error) => {
      console.log(error);
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
      });
    })
    .catch((error) => {
      console.log(error);
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
      console.log(error);
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
      });
    })
    .catch();
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
      console.log(error);
    });
};

exports.postOrders = (req, res, next) => {
  let fetchCart;
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      console.log('name '+req.user.name);
      const products = user.cart.items.map(i => {
        return {quantity : i.quantity, product : {...i.productId._doc}};
      });
      const order = new Order({
        user : {
          name : req.user.name,
          userId : req.user
        },
        products : products
      });
      order.save()
      .then((result) => {
        return req.user.clearCart();
        
      })
      .then(() => {
        res.redirect("/orders");
      })
      .catch((error) => {
        console.log(error);
      });
    })
};

exports.getOrderss = (req, res, next) => {
  Order.find({'user.userId': req.user._id})
    .then((orders) => {
      console.log(orders);
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Orders",
        orders: orders,
      });
    })
    .catch((e) => {
      console.log(e);
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
      console.log(error);
    });
};
