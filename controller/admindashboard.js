const User = require('../models/user');
const Product = require('../models/products');
const Order = require('../models/orders');
const Category = require('../models/category');
// const Offer = require('../models/offers');
const Address = require('../models/address');

const getUserStats = require('../utils/userstate');



  
const adminIndex = async (req, res) => {
    if(req.session.aid){
        const product = Product.find();
        const totalProducts = await Product.countDocuments();
        const totalRevenue = await Order.aggregate([{ $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }]).then(result => result[0].totalRevenue); //then is usgin to handle async operations 
        const totalSales = await Order.countDocuments();
    
        const totalUsersCount = await User.countDocuments({});
        const userStats = await getUserStats();

        res.render('admin/index',{
            totalProducts,
            totalRevenue,
            totalSales,
            ...userStats
        },(err, html) => {
            if (err) {
                console.error(err);
            } else {
                res.send(html);
            }
        }); 
    }
    else{
        res.redirect('/admin/login');
    }
};
  
const userStats = async(req,res)=>{
    const timeframe = req.body.filter;
    let startDate;
    switch (timeframe) {
      case 'weekly':
        const userStats2 = await getUserStats();
        res.status(200).json({ data: userStats2, choice: "week" });
        break;

      case 'monthly':
        // startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const userStats = await getUserStats('monthly');
        res.status(200).json({ data: userStats, choice: "monthy" });
        break;
      case 'yearly':
        const userStats3 = await getUserStats('yearly');
        console.log("yearly",userStats3)
        res.status(200).json({ data: userStats3, choice: "yearly" });
        break;
      default:
        startDate = new Date(0);  // Get all users if no valid timeframe is provided
    }
}


module.exports={
    adminIndex,
    userStats,
}