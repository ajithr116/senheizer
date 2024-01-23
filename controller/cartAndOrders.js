const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
require('dotenv').config();
const User = require('../models/user'); 
const Product = require('../models/products');
const Address = require('../models/address'); 
const Category = require("../models/category");
const userController = require('../userFunctions/usersFun');
const Order = require('../models/orders');
const Coupon = require('../models/coupon');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const addToCart = async (req, res) => {
  try {
    const userId = req.session.uid;
    const productId = req.query.productId;

    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    if (!user || !product) {
      console.log('User or product not found');
      // return res.status(404).send('User or product not found');
    }

    const existingCartItem = user.cart.find((item) => item.productID.toString() === productId);

    if (existingCartItem) {
      existingCartItem.quantity++;
      product.quantity--; // Decrease product quantity
      await product.save(); 
      await user.save();
      return res.redirect('/cart');
    } else {
      user.cart.push({
        productID: productId,
        quantity: 1,
        price: product.price,
      });
      product.quantity--; // Decrease product quantity
      await product.save(); 
      await user.save(); 

      console.log('Item added to cart');
      return res.redirect('/cart');
    }
  } catch (error) {
    console.error(error);
    // return res.status(500).send('An error occurred');
  }
};

  const userCartDetails = async (req, res) => {
    if (req.session.uid) {
      const userId = req.session.uid;
      req.session.step=1;
      const user = await User.findById(userId);
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
  

const userRemoveProductFromCart = async (req, res) => {
  try {
    const userId = req.session.uid;
    const productID = req.query.cartProductId;
    const user = await User.findById(userId);

    // Find the item in the user's cart
    const cartItemIndex = user.cart.findIndex(item => item.productID.toString() === productID);

    if (cartItemIndex === -1) {
      console.log('Product not found in cart');
      return res.status(404).send('Product not found in cart');
    }

    const removedCartItem = user.cart.splice(cartItemIndex, 1)[0];
    await user.save();

    const product = await Product.findById(productID);

    if (!product) {
      console.log('Product not found');
      return res.status(404).send('Product not found');
    }

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
  const userId = req.session.uid; 
  const { productID, quantity } = req.body;

  try {
    // Find the user
    const user = await User.findById(userId);
    const item = user.cart.find(item => item.productID.toString() === productID);

    if (!item) {
      throw new Error('Item not found in cart');
    }

    const product = await Product.findById(productID);
    
    const oldQuantity = item.quantity; // Get the old quantity
    item.quantity = quantity;  // Updating the quantity

    // Adjust the product quantity
    product.quantity = product.quantity + oldQuantity - quantity;
    await product.save(); // Save the updated product

    const newUpdatedQuantity = await user.save();

    const subtotal = user.cart.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const tax = subtotal * 0.1; 
    const total = subtotal + tax;

    res.json({
      success: true,
      subtotal: subtotal,
      tax: tax,
      total: total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};


const userCheckout = async(req,res)=>{
  if (req.session.uid) {
    if(req.session.step==1){
      const userId = req.session.uid;
      const user = await User.findById(userId);
      req.session.passPayment = 1;

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
          req.session.step=2;
          res.render('user/checkout', { cartItems: populatedCartItems, subtotal, tax, total, userAddress});
        }
        catch(err){
          res.status(500).json({ success: false, error: err.message });
        }
      }else{
        res.redirect("/cart");
      }
    }else {
    res.redirect('/login');
  }
}


const userPaymentPage = async(req,res)=>{
  if(req.session.uid){
    if(req.session.step==2){
      if(req.session.total!=0){
        const addressId = req.query.addressid;
        const couponId = req.query.couponId;
        
        const userId = req.session.uid;
        let reducingAmount = 0 ;
        const user = await User.findById(userId);
        
        if(couponId){
          // console.log("working",couponId);
          const coupon = await Coupon.findById(couponId);
          reducingAmount = coupon.reducingAmount
        }
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
          if(reducingAmount>0){
            const total = subtotal + tax-reducingAmount;
            req.session.step=3;
            req.session.discountAmt = reducingAmount;
            req.session.couponId = couponId;
            res.render("user/paymentPage",{subtotal, tax, total,addressId});
          }
          else{
            const total = subtotal + tax;
            req.session.step=3;
            res.render("user/paymentPage",{subtotal, tax, total,addressId});
          }
          const userAddress = await User.findById(req.session.uid).populate('address');

          // console.log("--",addressId);
        }
        catch(err){
          console.log("error " , err);
        }
      }
      else{
        console.log("total or cart is empty");
        res.redirect('/products');
      }
    }else{
      res.redirect('/cart');
    }
  }
  else{
    res.redirect('/login');
  }
}

const userPayment = async(req,res)=>{       //for cash on delivery 
  if(req.session.uid){
    if(req.session.step==3){
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
      let total=0;
      if(req.session.discountAmt){
        total = subtotal + tax-req.session.discountAmt;
        await Coupon.findByIdAndUpdate(req.session.couponId, { $push: { user: userId } });
        // Coupon.save();
      }
      else{
        total = subtotal + tax;
      } 

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
      req.session.step='';
      res.render('user/ordersuccess',{orderId});
    }
    catch(err){
      console.log(err,"error happen");   
      res.redirect('/products');
    }
  }
    else{
      res.redirect("/cart");
    }
  }
  else{
    res.redirect('/login');
  }
}

const orderSuccessPage = async(req,res)=>{
  if(req.session.uid){
    if(req.session.step==3){
      req.session.step='';
      res.render('user/ordersuccess');
    }
    else{
      res.redirect("/cart");
    }
  }
  else{
    res.redirect("/login")
  }
}

const userOrders = async(req,res)=>{
  if(req.session.uid){
    const orders = await Order.find({ userID: req.session.uid }).populate('items.productID').populate('shippingAddressID').sort({ date: -1 });
    // console.log("orders=",orders);  
    res.render('user/orders', { orders: orders });
  }
  else{
    res.redirect('/login');
  }
}

const userDeleteOrder = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const order = await Order.findById(orderId);

    await Promise.all(
      order.items.map(async (item) => {
        const product = await Product.findById(item.productID);
        product.quantity += item.quantity; // Add back to stock
        await product.save();
      })
    );

    if (order.paymentMethod === 'RAZORPAY') {
      var instance = new Razorpay({
        key_id: process.env.KEY_ID,
        key_secret: process.env.SECRET_KEY,
      });

      await instance.payments.refund(order.paymentId)
        .then(async (refund) => {
          console.log("user canceled product refunded", refund);
          const user = await User.findById(req.session.uid);

          const transaction = {
            amount: order.totalPrice,
            type: 'refund',
          };

          const parsedAmount = parseFloat(order.totalPrice);
          if (!isNaN(parsedAmount)) {
            user.wallet += parsedAmount;
          } else {
            console.error("Error parsing order total price:", order.totalPrice);
            // Handle invalid amount appropriately
          }

          user.walletHistory.push(transaction);
          await user.save();
        })
        .catch((err) => {
          console.error("Refund failed:", err);
          // Handle refund failure gracefully, e.g., notify user or retry
        });
    }

    order.orderStatus = 'canceled'; // Mark the order as canceled
    await order.save();

    res.redirect('/orders'); // Redirect to orders page to show the canceled order
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error'); // Handle general errors
  }
};


const userVerifyCoupon = async(req,res)=>{
  const { couponCode } = req.body;
  try {
    const coupon = await Coupon.findOne({ couponCode: couponCode });

    if (!coupon) {
        return res.status(400).json({ success: false, message: 'Invalid coupon code' });
    }

    if (coupon.expireDate < Date.now()) {
        return res.status(400).json({ success: false, message: "expire" });
    }
    // if (cartTotal >= coupon.minimumPrice) {
    //   const discount = coupon.reducingAmount;
    //   // console.log("discounts ",discount);
    //   return res.json({ success: true, message: 'Coupon code is valid', discount: coupon.reducingAmount, couponId:coupon._id });
      
    // } else {
    //   return res.status(400).json({success: false,message:"less"});
    // }

    if(coupon.isDeleted==true){
      return res.status(400).json({success:false,message:"deleted"})
    }

    if(coupon.minimumPrice)

    // const discount = coupon.reducingAmount;
    // console.log("discounts ",discount);
    return res.json({ success: true, message: 'Coupon code is valid', discount: coupon.reducingAmount, couponId:coupon._id });
  } catch (err) {
      return res.status(500).json({ success: false, message: 'An error occurred while verifying the coupon code' });
  }
}

const userPaymentR =async (req, res) => {
  try {
    const { addressId, amount } = req.body;
    const userId = req.session.uid;

    const user = await User.findById(userId);

    const razorpay = new Razorpay({
      key_id: process.env.KEY_ID,
      key_secret: process.env.SECRET_KEY,
    });

    const name =  user.firstName + " " + user.lastName;
    const email =  user.email;
    const contact =  user.phoneNumber
    
    // const notesData = {
    //   address: (await Address.findById(addressId)).address,
    //   order_id: `order_rcptid_${Date.now()}`
    // };

    const options = {
      amount: amount * 100, 
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    console.log("orders ",order)

    res.json({ orderId: order.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};


const userPaymentVerifiyR = async(req,res)=>{
  try{
    const {razorpay_payment_id,razorpay_order_id,razorpay_signature,amount,addressId} = req.body;
    const userId = req.session.uid;

    
    // console.log("order Id ", razorpay_order_id,"--",addressId,"--",amount,"--");

    const generatedSignature = crypto.createHmac('sha256',process.env.SECRET_KEY)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

    if(generatedSignature === razorpay_signature){
      req.session.passpayment='';
      const user = await User.findById(userId);

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
      let total=0;
      if(req.session.discountAmt){
        total = subtotal + tax-req.session.discountAmt;
        await Coupon.findByIdAndUpdate(req.session.couponId, { $push: { user: userId } });
        // Coupon.save();
      }
      else{
        total = subtotal + tax;
      } 
      
      const order = new Order({
        userID:userId,
        items: populatedCartItems.map(item => ({
          productID: item.productID,
          quantity: item.quantity,
          price: item.price
        })),
        totalPrice:total,
        shippingAddressID:addressId,
        paymentMethod: "RAZORPAY",
        paymentId:razorpay_payment_id,
      });
      await order.save();       // Save the Order to the database
      user.cart = [];       // Clear the user's cart
      await user.save();   
      res.json({success:true,message:"payment verifies"});
    }
    else{
      // console.log("reached 3");
      res.json({success:false,error:"ivalid payment signerature "});
    }
  }
  catch(err){
    console.error(err);
  }
}

const userOrderDetails = async(req,res)=>{
  if(req.session.uid){
    const orders = await Order.find({ userID: req.session.uid }).populate('items.productID').populate('shippingAddressID').sort({ date: -1 });;
    // console.log("orders=",orders);  
    res.render('user/orderhistory', { orders: orders });
  }
  else{
    res.redirect('/login');
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
    userVerifyCoupon,
    userPaymentR,
    userPaymentVerifiyR,
    orderSuccessPage,
    userOrderDetails,
}