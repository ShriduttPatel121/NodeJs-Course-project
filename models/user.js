// const getDb = require('../util/database').getDb;
// const mongoDb = require('mongodb');
// class User {
//     constructor(userName, email, cart, id) {
//         this.userName = userName;
//         this.email = email;
//         this.cart = cart // {items : []}
//         this._id = id;
//     }
//     save (){
//         const db = getDb();
//         return db.collection('users').insertOne(this);
//     }
//     static findById(userId) {
//         const db = getDb();
//         return db.collection('users').find({_id : new mongoDb.ObjectID(userId)}).next();
//     }
//     getCart() {
//         const db = getDb();
//         const productIds = this.cart.items.map(i => {
//             return i.productId;
//         })
//         return db.collection('products').find({_id : {$in : productIds}}).toArray()
//         .then((product) => {
//             return product.map(p => {
//                 return { ...p, quantity : this.cart.items.find(i => {
//                     return i.productId.toString() === p._id.toString();
//                 }).quantity} 
//             })               
//         }).catch((err) => {
//             console.log(err);     
//         });
//     }

//     deleteItemFromCart(id) {
//         const updatedCartItems = this.cart.items.filter( item => {
//             return item.productId.toString() !== id;
//         })
//         const db = getDb();
//         return db.collection('users').updateOne({_id : new mongoDb.ObjectID(this._id)}, { $set :{cart : {items : updatedCartItems}}});
//     }

//     addToCart(product) {
//         const cartProductIndex = this.cart.items.findIndex(cp => {
//             return cp.productId.toString() === product._id.toString();
//         });
//         let newQty = 1;
//         const updateCartItem = [...this.cart.items];
//         if( cartProductIndex >= 0){
//             newQty = this.cart.items[cartProductIndex].quantity +1;
//             updateCartItem[cartProductIndex].quantity = newQty;
//         } else {
//             updateCartItem.push({productId : new mongoDb.ObjectID(product._id) , quantity : newQty})
//         }
//         const updateCart = { items : updateCartItem};
//         const db = getDb();
//         return db.collection('users').updateOne({_id : new mongoDb.ObjectID(this._id)}, { $set :{cart : updateCart}});
//     }
    
//     addOrder (){
//         const db = getDb();
//         return this.getCart()
//         .then(products => {
//             const order = {
//                 items : products,
//                 user : {
//                     _id : mongoDb.ObjectID(this._id),
//                     userName : this.userName
//                 }
//             };
//             return db.collection('orders').insertOne(order);
//         }).then(result => {
//             this.cart = {items : []};
//             return db.collection('users').updateOne({_id : new mongoDb.ObjectID(this._id)}, { $set :{cart : {items : []}}});
//         })
//     }

//     getOrders () {
//         const db = getDb();
//         return db.collection('orders').find({'user._id': new mongoDb.ObjectID(this._id)}).toArray()
//     }
// }
    
// module.exports = User;