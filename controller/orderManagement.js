const Order = require('../models/orders');
const User = require('../models/user');
const Category = require('../models/category');
const Products = require('../models/products');
const razorpay = require('razorpay');

const adminOrders = async (req, res) => {
  if(req.session.aid){
    try {
      if(req.query.show=='old'){
        const orders = await Order.find().populate('userID').populate('items.productID').populate('shippingAddressID').sort({date:1});
        res.render('admin/ordermanagement',{orders});
      }

      if(req.query.show=='pending'){
        const orders = await Order.find({orderStatus:'pending'}).populate('userID').populate('items.productID').populate('shippingAddressID').sort({date:1});
        res.render('admin/ordermanagement',{orders});
      }

      if(req.query.show=='canceled'){
        const orders = await Order.find({orderStatus:'canceled'}).populate('userID').populate('items.productID').populate('shippingAddressID').sort({date:1});
        res.render('admin/ordermanagement',{orders});
      }

      if(req.query.show=='delivered'){
        const orders = await Order.find({orderStatus:'delivered'}).populate('userID').populate('items.productID').populate('shippingAddressID').sort({date:1});
        res.render('admin/ordermanagement',{orders});
      }

      if(req.query.show=='razorpay'){
        const orders = await Order.find({paymentMethod:'RAZORPAY'}).populate('userID').populate('items.productID').populate('shippingAddressID').sort({date:1});
        res.render('admin/ordermanagement',{orders});
      }

      if(req.query.show=='cashondelivery'){
        const orders = await Order.find({paymentMethod:'cashOnDelivery'}).populate('userID').populate('items.productID').populate('shippingAddressID').sort({date:1});
        res.render('admin/ordermanagement',{orders});
      }

      const orders = await Order.find().populate('userID').populate('items.productID').populate('shippingAddressID').sort({date:-1});
      res.render('admin/ordermanagement',{orders});
    } catch (err) {
      console.error(err);
      res.status(404).render('admin/404page');
    }
  } else {
    res.redirect('/admin/login');
  }
}
  
const adminOrderDetails = async (req, res) => {
  if (req.session.aid) {
    const orderId = req.query.orderId;
    try {
      const order = await Order.findById(orderId).populate('userID shippingAddressID items.productID');
      const grandTotalWithoutTax = order.items.reduce((total, item) => total + item.quantity * item.price, 0);
      
      const taxRate = 0.12; 
      const taxAmount = grandTotalWithoutTax * taxRate;
      const grandTotal = grandTotalWithoutTax + taxAmount;
      
      res.render("admin/orderDetails", { order, grandTotal,taxRate });
    
    } catch (err) {
      console.error('Error fetching order:', err);
      res.status(404).render('admin/404page');
    }
  } else {
    res.redirect('/admin/login');
  }
};
  
// const adminUpdateStatus = async(req,res)=>{
//   try {

//     const status = req.body.status;
//     const orderId = req.query.orderId;
//     const paymentId = req.query.paymentId;
    
//     if(paymentId){    
//       const refundableAmount = req.body.refundableAmount;
//       const userId = req.body.userID;
//       console.log("--",status,"--",orderId,"--",paymentId,"--",refundableAmount,"--",userId);
//       var instance = new razorpay({
//         key_id: process.env.KEY_ID,
//         key_secret: process.env.SECRET_KEY
//       });
//       // console.log("reached 3");
//       instance.payments.refund(paymentId)
//       .then(function(refund) {
//         console.log("Refund successful: ", refund);
//       })
//       .catch(function(err) {
//         console.error("Refund failed: ", err);
//       });
//       const updatedOrder = await Order.findByIdAndUpdate(orderId, {orderStatus: status}, { new: true });
//       const user = User.findByIdAndUpdate(userId,{wallet:refundableAmount},{new:true});
//       res.redirect('/admin/ordermanagement')

//     }
//     else{
//       const updatedOrder = await Order.findByIdAndUpdate(orderId, {orderStatus: status}, { new: true });
//       res.redirect('/admin/ordermanagement')
//     }

//   } 
//   catch (err) {
//     console.error('Error updating order status:', err);
//   }
// }
  
const adminUpdateStatus = async(req,res)=>{
  try {
    const status = req.body.status;
    const orderId = req.query.orderId;
    const paymentId = req.query.paymentId;
    const cancellationReason = req.body.cancellationReason;
    const additionalInfo = req.body.additionalInfo;

    // If the order is being canceled and the payment method is 'RAZORPAY', handle the refund
    if (status === 'canceled' && paymentId) {
      const refundableAmount = req.body.refundableAmount;
      const userId = req.body.userID;

      var instance = new razorpay({
        key_id: process.env.KEY_ID,
        key_secret: process.env.SECRET_KEY
      });

      await instance.payments.refund(paymentId)
        .then(async function(refund) {
          console.log("Refund successful: ", refund);

          const user = await User.findById(userId);

          const transaction = {
            amount: refundableAmount,
            type: 'refund'
          };

          const parsedAmount = parseFloat(refundableAmount);
          if (!isNaN(parsedAmount)) {
            user.wallet += parsedAmount;
          } else {
            console.error("Invalid refundable amount format:", refundableAmount);
          }

          user.walletHistory.push(transaction);
          await user.save();
        })
        .catch(function(err) {
          console.error("Refund failed: ", err);
        });
    }

    // Update the order with the new status, cancellation reason, and additional info
    const updatedOrder = await Order.findByIdAndUpdate(orderId, {
      orderStatus: status,
      cancellationReason: cancellationReason,
      additionalInfo: additionalInfo
    }, { new: true });

    res.redirect('/admin/ordermanagement');
  } 
  catch (err) {
    console.error('Error updating order status:', err);
    res.status(404).render('admin/404page');
  }
};


module.exports = {
  adminOrders,
  adminOrderDetails,
  adminUpdateStatus,
};
