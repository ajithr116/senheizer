const Order = require('../models/orders');
const User = require('../models/user');
const Category = require('../models/category');
const Products = require('../models/products')

const adminOrders = async (req, res) => {
    if(req.session.aid){
      try {
        // // Use await to get the orders
        const orders = await Order.find().populate('userID').populate('items.productID').populate('shippingAddressID');
  
        // // Now orders is an array of orders with the userID, items.productID and shippingAddressID fields populated
        // // You can log them to the console to verify
        // console.log(orders);
  
        // // Render your template with the orders
        res.render('admin/ordermanagement',{orders});
      } catch (err) {
        console.error(err);
        // res.status(500).send('Failed to retrieve orders');
      }
    } else {
      res.redirect('/admin/login');
    }
  }
  
  const adminOrderDetails = async (req, res) => {
    if (req.session.aid) {
      const orderId = req.query.orderId;
  
      try {
        const order = await Order.findById(orderId)
          .populate('userID shippingAddressID items.productID');
          const grandTotalWithoutTax = order.items
          .reduce((total, item) => total + item.quantity * item.price, 0);
      
        const taxRate = 0.12; // Assuming a 12% tax rate (replace with your actual rate)
        const taxAmount = grandTotalWithoutTax * taxRate;
        const grandTotal = grandTotalWithoutTax + taxAmount;
      
        res.render("admin/orderDetails", { order, grandTotal,taxRate });
      
        // res.render("admin/orderDetails", { order }); // Pass the order object to the view
      } catch (err) {
        console.error('Error fetching order:', err);
        res.status(500).render('error', { error: 'Failed to retrieve order' });
      }
    } else {
      res.redirect('/admin/login');
    }
  };
  
const adminUpdateStatus = async(req,res)=>{
  const status = req.body.status;
  const orderId = req.query.orderId;

  // console.log("--",status,"--",orderId);
  try {
    const updatedOrder = await Order.findByIdAndUpdate(orderId, {orderStatus: status}, { new: true });
    res.redirect('/admin/ordermanagement')
  } 
  catch (err) {
    console.error('Error updating order status:', err);
  }

}
  
module.exports = {
    adminOrders,
    adminOrderDetails,
    adminUpdateStatus,
};
