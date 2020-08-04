const Product = require("../models/product");
const mongoDb = require('mongodb');
const product = require("../models/product");
exports.getAddProduct = (req, res, next) => {
  if(!req.session.isAuthenticated){
    res.redirect('/login');
  }
  res.render("admin/edit-product", {
    pageTitle: "Add product",
    path: "/admin/add-product",
    isAuthenticated: req.session.isAuthenticated,
    editing : false
  });
};

exports.postAddProduct = (req, res) => {
  const title = req.body.title;
  const imgUrl = req.body.imgUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product  = new Product({title :title,price: price,description: description,imgUrl: imgUrl, userId : req.user});
  product.save()
  .then((rest) => {
    console.log('product was created');
    res.redirect('/admin/products');
  })
  .catch((error) => {
    console.log(error);
  });
};

exports.getProducts = (req, res, next) => {
  Product.find({userId : req.user._id})//.populate('userId')
  .then( products => {
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin products",
      path: "/admin/products",
      isAuthenticated: req.session.isAuthenticated,
    });
  })
  .catch(error => {
    console.log(error);
  })
};

 exports.getEditProducts = (req, res, next) => {
  const editMode = req.query.edit;
  console.log(editMode);
  if (!editMode){
    res.redirect('/');
  }
 const prodId = req.params.productId;
 Product.findById(prodId)
  .then(product => {
     if (!product){ 
      return res.redirect('/');
     }
     res.render("admin/edit-product", {
       pageTitle: "Add product",
       path: "/admin/edit-product",
       editing : editMode,
       product : product,
       isAuthenticated: req.session.isAuthenticated
  })
  }).catch(error => {
    console.log(error);
  });
};

exports.postEditProduct = (req, res, next) =>{

  const prodId = req.body.productId;
  const UpdatedTitle = req.body.title;
  const UpdatedImgUrl = req.body.imgUrl;
  const UpdatedPrice = req.body.price;
  const UpdatedDescription = req.body.description;
  Product.findById(prodId)
  .then(product => {
    if (product.userId.toString() !== req.user._id.toString()) {
      return res.redirect('/');
    }
    product.title = UpdatedTitle,
    product.imgUrl = UpdatedImgUrl,
    product.price = UpdatedPrice;
    product.description = UpdatedDescription;
    return product.save()
    .then(result => {
      res.redirect("/admin/products");
      console.log('PRODUCT WAS UPDATED SUCCESSFULLY!');
    });
  })
  
  .catch(error => {
    console.log(error);
  });
}



exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  console.log(prodId);
  Product.deleteOne({_id : prodId, userId : req.user._id})
  .then(() =>{
    res.redirect('/admin/products');
    console.log('product was deleted successfully');
  })
  .catch(error => {
    console.log(error);
  });
}