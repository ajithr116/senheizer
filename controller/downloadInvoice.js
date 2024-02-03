const easyinvoice = require('easyinvoice')

const User = require('../models/user'); 
const Product = require('../models/products');
const Address = require('../models/address'); 
const Category = require("../models/category");
const Order = require('../models/orders');


const userDownloadInvoice = async (req, res) => {
    try {
        const orderId = req.query.orderId;
        const taxRate = 0.1; 
        const order = await Order.findById(orderId).populate('userID shippingAddressID items.productID');
    
        if (!order) {
            return res.status(404).send({ message: 'Order not found' });
        }
 
        const invoiceData = {
            "currency": "INR", 
            "taxNotation": "vat", 
            "marginTop": 25,
            "marginRight": 25,
            "marginLeft": 25,
            "marginBottom": 25,
            "logo": "https://public.easyinvoice.cloud/img/logo_en_original.png", //or base64
            "background": "https://public.easyinvoice.cloud/img/watermark-draft.jpg", //or base64 //img or pdf
            "sender": {
                "company": "SENHEIZER",
                "address": "Bangalore torque city",
                "zip": "223123",
                "city": "Torque",
                "country": "INDIA"
            },
            "client": {
               "company": `${order.userID.firstName} ${order.userID.lastName}`,
               "address": `${order.shippingAddressID.address}, ${order.shippingAddressID.district}, ${order.shippingAddressID.state}, ${order.shippingAddressID.pincode}`,
               "zip": `${order.shippingAddressID.pincode}`,
               "city": `${order.shippingAddressID.state}`,
               "country": "India" 
            },
            "information": {
                "number": order.orderID,
                "date": order.orderDate
            },
            "invoiceNumber": order.orderID,
            "invoiceDate": order.date,
            "products": order.items.map(item => {
                const taxAmount = item.price * taxRate;
                return {
                    "quantity": item.quantity,
                    "description": item.productID.name,
                    "tax": 0, 
                    "price": item.price + taxAmount
                };
            }),
            
            "bottomNotice": "Kindly pay your invoice within 15 days."
        };
        const result = await easyinvoice.createInvoice(invoiceData); 
        const pdfData = Buffer.from(result.pdf, 'base64');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');
        res.send(pdfData);

      } catch (error) {
        console.error("error ",error );
    }
};


module.exports={
    userDownloadInvoice,
}