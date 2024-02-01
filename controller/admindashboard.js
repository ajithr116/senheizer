const PDFDocument = require('pdfkit-table');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

const User = require('../models/user');
const Product = require('../models/products');
const Order = require('../models/orders');
const Category = require('../models/category');
const Address = require('../models/address');
const getUserStats = require('../utils/userstate');
const getOrderStats = require('../utils/orderstat');
const add = require('moments/lib/add');

  
const adminIndex = async (req, res) => {
    if(req.session.aid){
      const product = Product.find();
      const totalProducts = await Product.countDocuments();
      const totalRevenue = await Order.aggregate([{ $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }]).then(result => result[0].totalRevenue); //then is usgin to handle async operations 
      const totalSales = await Order.countDocuments();

      //WEeekly stats
      const totalUsersCount = await User.countDocuments({});
      const userStats = await getUserStats();

      const districtWiseOrderCounts = await Order.aggregate([
        {
          $lookup:{
            from:'addresses',
            localField:'shippingAddressID',
            foreignField:'_id',
            as:'address'
          }
        },
          {
            $unwind:'$address'
          },
          {
            $group:{
              _id:'$address.state',
              totalDistrictOrder:{$sum:1}
            }
          }
        ]).sort({totalDistrictOrder:-1})
        var totalOrders = districtWiseOrderCounts.reduce((total, item) => total + item.totalDistrictOrder, 0);
        res.render('admin/index',{
          totalProducts,
          totalRevenue,
          totalSales,
          ...userStats,
          districtWiseOrderCounts,
          totalOrders
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
      const userStats = await getUserStats('monthly');
      res.status(200).json({ data: userStats, choice: "monthy" });
      break;
    case 'yearly':
      const userStats3 = await getUserStats('yearly');
      res.status(200).json({ data: userStats3, choice: "yearly" });
      break;
    default:
    startDate = new Date(0);  
  }
}

const adminSalesReports = async(req,res)=>{
  if(req.session.aid){
    res.render('admin/salesreport');
  }   
  else{
    res.redirect('/admin/login');
  }    
}

const salesReport2 = async (req, res) => {
  try {
    const timeframe = req.body.filter;
    if (timeframe === 'weekly') {
      const result1 = await getOrderStats.weeklyOrderStat();
      res.status(200).json({ choice: 'week', data: result1 });
    } 
    else if(timeframe=='monthly'){
      const result2 = await getOrderStats.monthlyOrderStat();
      res.status(200).json({ choice: 'monthly', data: result2 });
    }
    else if (timeframe === 'yearly') {
      const result3 = await getOrderStats.yearlyOrderStat();
      res.status(200).json({ choice: 'yearly', data: result3 });
    }
  }
  catch(err){
    console.error(err);
    res.status(404).render('admin/404page');
  }
}

const orderStatus = async(req,res)=>{
  const result = await getOrderStats.orderStatus();
  res.json(result);
}

const productPopularity = async (req, res) => {
  const result = await getOrderStats.productPopularity();
  res.json(result);
};

const paymentMethodPreferences = async (req, res) => {
  const result = await getOrderStats.paymentMethodPreferences();
  res.json(result);
};

const salesRavenue = async(req,res)=>{
  try {
    const timeframe = req.body.filter;
    if (timeframe === "weekly") {
      const report = await getOrderStats.weeklySalesState();
      res.status(200).json({report, choice: "weekly" });
    } 
    else if(timeframe=="monthly"){
      const report = await getOrderStats.monthlySalesState();
      res.status(200).json({report, choice: "monthly" });
    }
    else if (timeframe === "yearly") {
      const report = await getOrderStats.yearlySalesState();
      res.status(200).json({report, choice: "yearly" });
    }
  }
  catch(err){
    console.error(err);
    res.status(404).render('admin/404page');
  }
}


const downloadSalesReport = async(req,res)=>{
  const userStats2 = await getUserStats();
  const userStats = await getUserStats('monthly');
  if (typeof userStats === 'string') {
    userStats = JSON.parse(userStats);
  }
  const userStats3 = await getUserStats('yearly');
  const result1 = await getOrderStats.weeklyOrderStat();
  const result2 = await getOrderStats.monthlyOrderStat();
  const result3 = await getOrderStats.yearlyOrderStat();
  //---
  const result4 = await getOrderStats.orderStatus();
  const result5 = await getOrderStats.productPopularity();
  const result6 = await getOrderStats.paymentMethodPreferences();
  //--
  const report1 = await getOrderStats.weeklySalesState();
  const report2 = await getOrderStats.monthlySalesState();
  const report3 = await getOrderStats.yearlySalesState();
  //--

  let doc = new PDFDocument;
  let pdfPath = 'sales_report.pdf';
  let writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);

  doc.fontSize(18)
    .text(`Total Users Count: ${userStats2.totalUsersCount}`, { underline: true });

  doc.moveDown();
  const table = {
    headers: ['Month', 'Users'],
    rows: []
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  userStats.monthlyUsers.forEach((count, index) => {
    table.rows.push([months[index], count]);
  });

  doc.table(table, {
    prepareHeader: () => doc.font('Helvetica-Bold'),
    prepareRow: (row, i) => doc.font('Helvetica').fontSize(12)
  });

  doc.moveDown();
  doc.fontSize(14)
    .text('User Statistics Summary:', { underline: true });
  doc.text(`Total Users: ${userStats2.totalUsersCount}`);
  
  //-----------------------------------------
  doc.moveDown();
  doc.fontSize(14)
     .text('Weekly Sales Data:', { underline: true });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const salesTable = {
    headers: ['Day of Week', 'Total Sales', 'Count'],
    rows: []
  };

  result1.forEach((data) => {
    salesTable.rows.push([days[data._id - 1], data.totalSales, data.count]);
  });

  doc.table(salesTable, {
    prepareHeader: () => doc.font('Helvetica-Bold'),
    prepareRow: (row, i) => doc.font('Helvetica').fontSize(12)
  });
  //-----------------------------------------------
  
  const orderStatsTable = {
    headers: ['Month', 'Count'],
    rows: []
  };

  result2.forEach((data) => {
    orderStatsTable.rows.push([months[data.month - 1], data.count]);
  });

  doc.table(orderStatsTable, {
    prepareHeader: () => doc.font('Helvetica-Bold'),
    prepareRow: (row, i) => doc.font('Helvetica').fontSize(12)
  });

  //-----------------------------------------------
  const yearlyOrderCount = result3[0].count;  
  const year = result3[0].year;

  doc.moveDown();
  doc.fontSize(14)
    .text('Yearly Orders:', { underline: true });
  doc.text(`Count: ${yearlyOrderCount}`);
  doc.text(`Year: ${year}`);
  //-------------------------------------------------  
  doc.moveDown();
  doc.text('Order Status Summary:', { underline: true });
  result4.forEach(item => {
    doc.text(`- ${item.status}: ${item.count}`);
  });
  //------------------------
  doc.moveDown();
  doc.fontSize(14)
    .text(`Most Popular Products: \n`, { underline: true });
  
  result5.forEach(product => {
    doc.text(`- ${product.productName} \n(Brand: ${product.brand}) \n ${product.count} orders \n\n`);
  });
  
  //--------------------  
  doc.moveDown();
  doc.fontSize(14)
    .text('Payment Method Preferences:', { underline: true });

  result6.forEach(item => {
    doc.text(`- ${item._id}: ${item.count} orders`);
  });

  //-------------------
  const weeklyTotalSales = report1.reduce((total, item) => total + item.totalSales, 0);
  const weeklyOrderCount = report1.reduce((total, item) => total + item.count, 0);
  
  doc.moveDown();
  doc.fontSize(14)
    .text('Weekly Sales Summary:', { underline: true });
  doc.text(`Total Sales: ${weeklyTotalSales}`);
  doc.text(`Order Count: ${weeklyOrderCount}`);
    
  //----------------
  const monthlyTotalSales = report2[0].totalSales;  
  const monthlyOrderCount = report2[0].count;

  doc.moveDown();
  doc.fontSize(14)
    .text('Monthly Sales Summary:', { underline: true });
  doc.text(`Month: ${report2[0].month}`);
  doc.text(`Total Sales: ${monthlyTotalSales}`);
  doc.text(`Order Count: ${monthlyOrderCount}`);
  //-----
  doc.moveDown();
  doc.fontSize(14)
    .text('Yearly Sales Summary:', { underline: true });
  doc.text(`Year: ${report3[0].year}`);
  doc.text(`Total Sales: $${report3[0].totalSales}`);
  doc.text(`Order Count: ${report3[0].count}`);
  //----

  writeStream.on('finish', function() {
    res.download(pdfPath);
  });

  doc.end();
}

const excelDownload = async(req, res) => {
  const userStats3 = await getUserStats('yearly');
  const result1 = await getOrderStats.weeklyOrderStat();
  const result2 = await getOrderStats.monthlyOrderStat();
  const result3 = await getOrderStats.yearlyOrderStat();
  //----
  const result4 = await getOrderStats.orderStatus();
  const result5 = await getOrderStats.productPopularity();
  const result6 = await getOrderStats.paymentMethodPreferences();
  //----
  const report1 = await getOrderStats.weeklySalesState();
  const report2 = await getOrderStats.monthlySalesState();
  const report3 = await getOrderStats.yearlySalesState();

  console.log(report2);

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('User Statistics');
  
  //----------------
  worksheet.addRow(['Total Users', userStats3.totalUsersCount]);
  worksheet.addRow(['Monthly Users']);
  userStats3.yearlyUsers.forEach(count => {
    worksheet.addRow([count]); 
  });
  //-------------------------------
  const weeklyOrdersSheet = workbook.addWorksheet('Orders');

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  weeklyOrdersSheet.addRow(['Weekly Order Summary']);
  weeklyOrdersSheet.addRow(['Day of Week', 'Total Sales', 'Count']);

  days.forEach(day => {
    const matchingItem = result1.find(item => item.dayOfWeek === day);
    weeklyOrdersSheet.addRow([day, matchingItem ? matchingItem.totalSales : 0, matchingItem ? matchingItem.count : 0]);
  });
  //---------------------
  weeklyOrdersSheet.addRow([]); 
  weeklyOrdersSheet.addRow([]); 

  weeklyOrdersSheet.addRow(['Monthly Order Summary']);
  weeklyOrdersSheet.addRow(['Month', 'Count']);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  for (let monthNumber = 1; monthNumber <= 12; monthNumber++) {
    const monthName = months[monthNumber - 1]; 
    const matchingItem = result2.find(item => item.month === monthNumber);
    weeklyOrdersSheet.addRow([monthName, matchingItem ? matchingItem.count : 0]);
  }

  //---
  weeklyOrdersSheet.addRow([]); 
  weeklyOrdersSheet.addRow([]); 

  weeklyOrdersSheet.addRow(['Yearly Order Summary']);
  weeklyOrdersSheet.addRow(['Year', 'Count']);

  result3.forEach(item => {
    weeklyOrdersSheet.addRow([item.year, item.count]);
  });
  //---
  worksheet.addRow([]); 
  worksheet.addRow([]); 

  worksheet.addRow(['Order Status Summary']);
  worksheet.addRow(['Status', 'Count']);

  result4.forEach(item => {
    worksheet.addRow([item.status, item.count]);
  });
  //---
  const productPopularitySheet = workbook.addWorksheet('Product Popularity');

  productPopularitySheet.addRow(['Product Popularity Summary']);
  productPopularitySheet.addRow(['Product Name', 'Brand', 'Count']);

  result5.forEach(item => {
    productPopularitySheet.addRow([item.productName, item.brand, item.count]);
  });
  //------------------------------
  worksheet.addRow([]); 
  worksheet.addRow([]); 

  worksheet.addRow(['Payment Method Preferences']);
  worksheet.addRow(['Method', 'Count']);

  result6.forEach(item => {
    worksheet.addRow([item._id, item.count]);
  });

  //----
  const weeklySalesStateSheet = workbook.addWorksheet('Sales State');

  weeklySalesStateSheet.addRow(['Weekly Sales Summary']);
  weeklySalesStateSheet.addRow(['Day of Week', 'Total Sales', 'Count']);

  days.forEach(day => {
    const matchingItem = report1.find(item => item.dayOfWeek === day);
    weeklySalesStateSheet.addRow([day, matchingItem ? matchingItem.totalSales : 0, matchingItem ? matchingItem.count : 0]);
  });
  
  //---
  weeklySalesStateSheet.addRow([]); 
  weeklySalesStateSheet.addRow([]); 

  weeklySalesStateSheet.addRow(['Monthly Sales Summary']);
  weeklySalesStateSheet.addRow(['Month', 'Total Sales', 'Count']);

  months.forEach(month => {
    const matchingItem = report2.find(item => item.month === month);
    weeklySalesStateSheet.addRow([month, matchingItem ? matchingItem.totalSales : 0, matchingItem ? matchingItem.count : 0]);
  });
  //----------
  weeklySalesStateSheet.addRow([]); 
  weeklySalesStateSheet.addRow([]); 

  weeklySalesStateSheet.addRow(['Yearly Sales Summary']);
  weeklySalesStateSheet.addRow(['Year', 'Total Sales', 'Count']);

  report3.forEach(item => {
    weeklySalesStateSheet.addRow([item.year, item.totalSales, item.count]);
  });

  const fileName = 'output.xlsx';
  await workbook.xlsx.writeFile(fileName);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);

  res.download(path.resolve(fileName), (err) => {
    if (err) {
      console.log(err);
    }
  });
}

module.exports={
    adminIndex,
    userStats,
    adminSalesReports,
    salesReport2,
    orderStatus,
    productPopularity,
    paymentMethodPreferences,
    salesRavenue,
    downloadSalesReport,
    excelDownload,
}