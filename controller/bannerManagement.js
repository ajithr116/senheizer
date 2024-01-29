const Products = require('../models/products');
const Category = require('../models/category');



const adminBanner = async(req,res)=>{
    if(req.session.aid){
        res.render('admin/banner')
    }
    else{
        res.redirect('/login');
    }
}

const adminAddBanner = async(req,res)=>{
    if(req.session.aid){

        const product = await Products.find({});
        const category = await Category.find({});

        res.render('admin/addBanner',{category,product})
    }
    else{
        res.redirect('/login');
    }
}

const adminUploadBanner = async(req,res)=>{
    const {image,description,linkType,product,category,startDate,endDate} = req.body;
    console.log("--",image,"--",description,"--",linkType,"--",product,"--",category,"--",startDate,"--",endDate)
    console.log("reached");
    res.redirect('/banner');

}

module.exports={
    adminBanner,
    adminAddBanner,
    adminUploadBanner,
}

