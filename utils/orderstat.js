
const Order = require('../models/orders');

const weeklyOrderStat= async(req,res)=>{

    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 6, 23, 59, 59);
    
    // rest of your code...
    

    const result = await Order.aggregate([
        {
            $match: {
                date: {
                    $gte: new Date(startOfWeek),
                    $lte: new Date(endOfWeek)
                }
            }
        },
        {
            $unwind: "$items"
        },
        {
            $group: {
                _id: { $dayOfWeek: "$date" },
                totalSales: { $sum: { $multiply: [ "$items.price", "$items.quantity" ] } },
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                dayOfWeek: {
                    $let: {
                        vars: {
                            days: [ "", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ]
                        },
                        in: { $arrayElemAt: [ "$$days", "$_id" ] }
                    }
                },
                totalSales: 1,
                count: 1
            }
        },
        { $sort: { _id: 1 } }
    ]);
    // console.log("==",result);
    return result;
}

const monthlyOrderStat = async(req,res)=>{

    const result = await Order.aggregate([
    {
        $group: {
            _id: { $month: "$date" },
            count: { $sum: 1 }
        }
    },
    {
        $project: {
            month: '$_id',
            count: 1,
            _id: 0
        }
        }
    ]);
    return result;
}

const yearlyOrderStat = async(req,res)=>{
    const result = await Order.aggregate([
        {
          $group: {
              _id: { $year: "$date" },
              count: { $sum: 1 }
          }
        },
        {
          $project: {
              year: '$_id',
              count: 1,
              _id: 0
          }
        }
    ]);
    return result;
}

const orderStatus = async(req,res)=>{
    const result = await Order.aggregate([
        {
            $group: {
                _id: "$orderStatus",
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                status: '$_id',
                count: 1,
                _id: 0
            }
        }
    ]);
    return result;
}

const productPopularity = async(req,res)=>{
    const result = await Order.aggregate([
        {
          $unwind: '$items'
        },
        {
          $group: {
            _id: '$items.productID',
            count: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'productDetails'
          }
        },
        {
          $unwind: '$productDetails'
        },
        {
          $project: {
            _id: 0,  // Exclude _id
            productID: '$_id',  // Restore productID
            productName: '$productDetails.name',  // Get product name correctly
            brand:'$productDetails.brand',
            count: 1
          }
        },
        {
          $sort: { count: -1 }  // Sort by popularity
        }
      ]);
      return result;
}

const paymentMethodPreferences = async(req,res)=>{
    const result = await Order.aggregate([
        {
          $group: {
            _id: '$paymentMethod',  
            count: { $sum: 1 }  
          }
        },
        {
          $sort: { count: -1 }  
        }
      ]);
      return result;
}

const weeklySalesState = async(req,res)=>{
    const now = new Date();

    // Calculate the start and end dates of the current week
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1);
    const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 7);

    const report = await Order.aggregate([
        {
            $match: {
                date: {
                    $gte: startOfWeek,
                    $lte: endOfWeek
                }
            }
        },
        {
            $group: {
                _id: { $subtract: [{ $dayOfWeek: "$date" }, 1] },
                totalSales: { $sum: "$totalPrice" },
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                dayOfWeek: {
                    $let: {
                        vars: {
                            days: [ "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" ]
                        },
                        in: { $arrayElemAt: [ "$$days", "$_id" ] }
                    }
                },
                totalSales: 1,
                count: 1
            }
        },
        { $sort: { _id: 1 } }
    ]);

    return report;
};

const monthlySalesState = async(req,res)=>{
    const report = await Order.aggregate([
        {
            $group: {
                _id: { $month: "$date" },
                totalSales: { $sum: "$totalPrice" },
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                month: {
                    $let: {
                        vars: {
                            months: [ "", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]
                        },
                        in: { $arrayElemAt: [ "$$months", "$_id" ] }
                    }
                },
                totalSales: 1,
                count: 1
            }
        },
        { $sort: { _id: 1 } }
    ]);
    return report;
}

const yearlySalesState = async(req,res)=>{
    const report = await Order.aggregate([
        {
            $group: {
                _id: { $year: "$date" },
                totalSales: { $sum: "$totalPrice" },
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                year: "$_id",
                totalSales: 1,
                count: 1
            }
        },
        { $sort: { _id: 1 } }
    ]);
    return report;
}

module.exports={
    weeklyOrderStat,
    monthlyOrderStat,
    yearlyOrderStat,
    orderStatus,
    productPopularity,
    paymentMethodPreferences,
    weeklySalesState,
    monthlySalesState,
    yearlySalesState,
}