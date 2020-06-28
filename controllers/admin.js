const Product = require("../models/product");
const mongoDb = require('mongodb');
exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add product",
    path: "/admin/add-product",
    editing : false
  });
};

exports.postAddProduct = (req, res) => {
  const title = req.body.title;
  const imgUrl = req.body.imgUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product  = new Product(title, price, description, imgUrl, null, req.user._id)
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
  Product.fetchAll()
  .then( products => {
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin products",
      path: "/admin/products",
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
  //Product.findByPk(prodId)
  .then(product => {
     if (!product){ 
      return res.redirect('/');
     }
     res.render("admin/edit-product", {
       pageTitle: "Add product",
       path: "/admin/edit-product",
       editing : editMode,
       product : product
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
  const pro = new Product(UpdatedTitle, UpdatedPrice, UpdatedDescription, UpdatedImgUrl, prodId);
  pro.save()
  .then(result => {
    res.redirect("/admin/products");
    console.log('PRODUCT WAS UPDATED SUCCESSFULLY!');
  })
  .catch(error => {
    console.log(error);
  });
}



exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  console.log(prodId);
  Product.deleteById(prodId)
  .then(() =>{
    res.redirect('/admin/products');
    console.log('product was deleted successfully');
  })
  .catch(error => {
    console.log(error);
  });
}