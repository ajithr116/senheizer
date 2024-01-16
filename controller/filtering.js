const User = require('../models/user'); 
const Product = require('../models/products');
const Address = require('../models/address'); 
const Category = require("../models/category");
const userController = require('../userFunctions/usersFun');

const userFiltering = async(req,res)=>{
    console.log("reacherd");
    const brand = req.query.brand;

    let product = await userController.getAllProductPage();
    const category = await Category.find({isDeleted:false});


    console.log("brand " ,brand);
    res.render('user/products',{products:product,category});

}

module.exports={
    userFiltering,
}