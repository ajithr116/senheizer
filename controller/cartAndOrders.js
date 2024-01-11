const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();
const User = require('../models/user'); 
const Product = require('../models/products');
const Address = require('../models/address'); 
const Category = require("../models/category");
const userController = require('../userFunctions/usersFun');


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

        res.render('user/cart', { cartItems: populatedCartItems, subtotal, tax, total });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching cart details');
      }
    } else {
      res.redirect('/login');
    }
  };
  

const userRemoveProductFromCart = async (req, res) => {
    try {
      const userId = req.session.uid;
      const productID = req.query.cartProductId;
  
      const user = await User.findByIdAndUpdate(userId, {
        $pull: { cart: { productID } }
      }, { new: true }); 
  
      res.redirect('/cart'); 
    } catch (error) {
      console.error(error);
      res.status(500).send('Error removing item from cart');
    }
};
  
const userUpdateCart = async (req,res)=>{
    try {
        const { productID, quantity } = req.body;
        // Update quantity in user's cart
        const user = await User.findById(req.session.uid);
        const cartItem = user.cart.find(item => item.productID === productID);
        cartItem.quantity = quantity;
        await user.save();
        res.json({ success: true });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error updating cart' });
      }
}

module.exports = {
    addToCart,
    userCartDetails,
    userRemoveProductFromCart,
    userUpdateCart,
}