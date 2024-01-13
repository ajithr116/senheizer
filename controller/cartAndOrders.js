const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();
const User = require('../models/user'); 
const Product = require('../models/products');
const Address = require('../models/address'); 
const Category = require("../models/category");
const userController = require('../userFunctions/usersFun');
const Order = require('../models/orders');


// const addToCart = async (req, res) => {
//     try {
//       const userId = req.session.uid;
//       const productId = req.query.productId;
  
//       const user = await User.findById(userId);
//       const product = await Product.findById(productId);
  
//       if (!user || !product) {
//         console.log('User or product not found');
//         return res.status(404).send('User or product not found');
//       }
  
//       const existingCartItem = user.cart.find((item) => item.productID === productId);
  
//       if (existingCartItem) {
//         console.log('Item already in cart');
//         existingCartItem.quantity++;
//         await user.save(); // Save the user document

//         return res.redirect('/cart');
//       } 
//       else {
//         user.cart.push({
//           productID: productId,
//           quantity: 1,
//           price: product.price,
//         });
  
//         await user.save(); // Save the user document
  
//         console.log('Item added to cart');
//         return res.redirect('/cart');
//       }
//     } catch (error) {
//       console.error(error);
//       return res.status(500).send('An error occurred');
//     }  
//     // console.log("--",existingCartItem);
//     // console.log("reached",userId,"--",productId);
// }

const addToCart = async (req, res) => {
    try {
      const userId = req.session.uid;
      const productId = req.query.productId;
  
      const user = await User.findById(userId);
      const product = await Product.findById(productId);
  
      if (!user || !product) {
        console.log('User or product not found');
        return res.status(404).send('User or product not found');
      }
  
      const existingCartItem = user.cart.find((item) => item.productID.toString() === productId);
  
      if (existingCartItem) {
        // console.log('Quantity of the item in the user\'s cart:', existingCartItem.quantity);
        existingCartItem.quantity++;
        await user.save(); // Save the user document after the update
        return res.redirect('/cart');
      } else {
        user.cart.push({
          productID: productId,
          quantity: 1,
          price: product.price,
        });
        product.quantity -= 1; // Decrease product quantity
        await product.save(); // Save the updated product
        await user.save(); // Save the user document
  
        console.log('Item added to cart');
        return res.redirect('/cart');
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send('An error occurred');
    }
  };
  
  


  const userCartDetails = async (req, res) => {
    if (req.session.uid) {
      const userId = req.session.uid;
      const user = await User.findById(userId);
  
      // Fetch product details for each cart item
      const cartItems = user.cart.map(async item => {
        const product = await Product.findById(item.productID);
        return {
          productID: item.productID,
          quantity: item.quantity,
          price: item.price,
          product: product
        };
      });
  
      try {
        const populatedCartItems = await Promise.all(cartItems);

        const subtotal = populatedCartItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
        const tax = subtotal * 0.1;
        const total = subtotal + tax;
        req.session.total = total;
        res.render('user/cart', { cartItems: populatedCartItems, subtotal, tax, total });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching cart details');
      }
    } else {
      res.redirect('/login');
    }
  };
  

// const userRemoveProductFromCart = async (req, res) => {
//     try {
//       const userId = req.session.uid;
//       const productID = req.query.cartProductId;
  
//       const user = await User.findByIdAndUpdate(userId, {
//         $pull: { cart: { productID } }
//       }, { new: true }); 
  
//       res.redirect('/cart'); 
//     } catch (error) {
//       console.error(error);
//       res.status(500).send('Error removing item from cart');
//     }
// };
  
const userRemoveProductFromCart = async (req, res) => {
  try {
    const userId = req.session.uid;
    const productID = req.query.cartProductId;
    const user = await User.findById(userId);

    // Find the item in the user's cart
    const cartItemIndex = user.cart.findIndex(item => item.productID.toString() === productID);

    if (cartItemIndex === -1) {
      // Handle product not found
      console.log('Product not found in cart');
      return res.status(404).send('Product not found in cart');
    }

    // Remove the item from the cart
    const removedCartItem = user.cart.splice(cartItemIndex, 1)[0];
    await user.save();

    // Fetch the product details
    const product = await Product.findById(productID);

    if (!product) {
      console.log('Product not found');
      return res.status(404).send('Product not found');
    }

    // Increase the product quantity
    product.quantity += removedCartItem.quantity;
    await product.save();

    res.redirect('/cart');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error removing item from cart');
  }
};


const userUpdateCart = async (req, res) => {
  console.log("reached");
  const productID = req.body.productID;
  const quantity = req.body.quantity;

  console.log("--",productID,"--",quantity);
  try {
    // Perform cart update logic (replace with your implementation)
    // const updatedCart = updateCart(productID, quantity);

    const subtotal = calculateSubtotal(updatedCart);
    const tax = calculateTax(subtotal);
    const total = subtotal + tax;

    // console.log("--",subtotal,"--",tax,"--",total);
    res.json({
      success: true,
      subtotal: subtotal,
      tax: tax,
      total: total
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const userCheckout = async(req,res)=>{
  if (req.session.uid) {
    const userId = req.session.uid;
    const user = await User.findById(userId);
    req.session.passPayment = 1;

    // Fetch product details for each cart item
    const cartItems = user.cart.map(async item => {
      const product = await Product.findById(item.productID);
      return {
        productID: item.productID,
        quantity: item.quantity,
        price: item.price,
        product: product
      };
    });
    try{
      const populatedCartItems = await Promise.all(cartItems);

      const subtotal = populatedCartItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
      const tax = subtotal * 0.1;
      const total = subtotal + tax;
  
      const userAddress = await User.findById(req.session.uid).populate('address');

      // console.log("--",userAddress,"--",total,"--")
      
      res.render('user/checkout', { cartItems: populatedCartItems, subtotal, tax, total, userAddress});
    }
    catch(err){
      res.status(500).json({ success: false, error: err.message });
    }
  } 
  else {
    res.redirect('/login');
  }
}


const userPaymentPage = async(req,res)=>{
  if(req.session.uid){
    if(req.session.passPayment==1){
      if(req.session.total!=0){
        const addressId = req.query.addressid;
        const userId = req.session.uid;
        const user = await User.findById(userId);
    
        // Fetch product details for each cart item
        const cartItems = user.cart.map(async item => {
          const product = await Product.findById(item.productID);
          return {
            productID: item.productID,
            quantity: item.quantity,
            price: item.price,
            product: product
          };
        });
        try{
          const populatedCartItems = await Promise.all(cartItems);
    
          const subtotal = populatedCartItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
          const tax = subtotal * 0.1;
          const total = subtotal + tax;
      
          const userAddress = await User.findById(req.session.uid).populate('address');
          console.log("--",addressId);
          // console.log("--",userAddress,"--",total,"--")
          res.render("user/paymentPage",{subtotal, tax, total,addressId});
        }
        catch(err){
          console.log("error " , err);
        }
      }
      else{
        console.log("total or cart is empty");
        res.redirect('/products');
      }
    }
  }
  else{
    res.redirect('/login');
  }
}


// const userPayment = async(req,res)=>{
//   if(req.session.uid){
//     const addressId = req.query.addressid;
//     const paymentMethod = req.query.paymentMethod;
//     const userId = req.session.uid;
//     const user = await User.findById(userId);

//     try{
//         const cartItems = user.cart.map(async item => {
//         const product = await Product.findById(item.productID);
//         return {
//           productID: item.productID,
//           quantity: item.quantity,
//           price: item.price,
//           product: product
//         };
//       });

//       const populatedCartItems = await Promise.all(cartItems);

//       const subtotal = populatedCartItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
//       const tax = subtotal * 0.1;
//       const total = subtotal + tax;
//       console.log("reached");

//       populatedCartItems.forEach(item => {
//         console.log("Quantity of item with productID", item.productID, "is", item.quantity,"##",item.price);
//       });
      


//       console.log("{{",addressId,"}}{{",userId,"}}{{",total,"}}{{",paymentMethod,"}}");
//       res.render('user/ordersuccess');
      
//     }
//     catch(err){
//       console.log(err,"error happen");
//     }
//   }
//   else{
//     res.redirect('/login');
//   }
// }

const userPayment = async(req,res)=>{
  if(req.session.uid){
    const addressId = req.query.addressid;
    const paymentMethod = req.query.paymentMethod;
    const userId = req.session.uid;
    req.session.passPayment='';
    const user = await User.findById(userId);

    try{
        const cartItems = user.cart.map(async item => {
        const product = await Product.findById(item.productID);
        return {
          productID: item.productID,
          quantity: item.quantity,
          price: item.price,
          product: product
        };
      });

      const populatedCartItems = await Promise.all(cartItems);

      const subtotal = populatedCartItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
      const tax = subtotal * 0.1;
      const total = subtotal + tax;

      const order = new Order({
        userID: userId,
        items: populatedCartItems.map(item => ({
          productID: item.productID,
          quantity: item.quantity,
          price: item.price
        })),
        totalPrice: total,
        shippingAddressID: addressId,
        paymentMethod: paymentMethod,
      });

      await order.save();       // Save the Order to the database
      user.cart = [];       // Clear the user's cart
      await user.save();
      const orderId = order.orderID;
      res.render('user/ordersuccess',{orderId});
    }
    catch(err){
      console.log(err,"error happen");    //when order is empty it gets error so go back to product page . this error is getting because not passwing addressId
      res.redirect('/products');
    }
  }
  else{
    res.redirect('/login');
  }
}

const userOrders = async(req,res)=>{
  if(req.session.uid){
    // Fetch the orders for the current user and populate the product and address details
    const orders = await Order.find({ userID: req.session.uid }).populate('items.productID').populate('shippingAddressID');

    // Pass the orders to the view
    res.render('user/orders', { orders: orders });
  }
  else{
    res.redirect('/login');
  }
}

const userDeleteOrder = async(req,res)=>{
  const orderId = req.query.orderId;
  
  try {
    await Order.findByIdAndDelete(orderId);

    // res.send('Order deleted successfully');
    res.redirect('/orders')
  } catch(err) {
    console.log(err);
    res.status(500).send('Server Error');
  }
}


module.exports = {
    addToCart,
    userCartDetails,
    userRemoveProductFromCart,
    userUpdateCart,
    userCheckout,
    userPayment,
    userPaymentPage,
    userOrders,
    userDeleteOrder,
}