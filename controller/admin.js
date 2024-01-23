const express = require("express");
const sharp = require('sharp');
const path = require('path'); // Import the path module
const os = require('os'); // Import the os module for temporary path
const fs = require('fs'); // Import the fs module for file operations

// ... rest of your code

const bcrypt = require('bcrypt');
const saltRounds = 10;

const adminDB = require('../models/adminDB'); // Import the user database module
const User = require('../models/user'); 
const Product = require('../models/products'); 
const Category = require('../models/category');

const multer  = require('multer');
const category = require("../models/category");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'C:\\Users\\ASUS\\OneDrive\\Desktop\\week 8.1\\public\\uploads\\');
    },
    filename: function (req, file, cb) {
        // Generate a unique filename with a descriptive extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop();
        cb(null, filename);
    }
});


const upload = multer({ storage: storage });


const adminLogin = async (req, res) => {
    if(req.session.aid){
        res.redirect('/admin/index');
    }
    else{
        const error = req.session.error;
        req.session.error = null;

        res.render('admin/login',{ error: error },(err, html) => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            } else {
                res.send(html);
            }
        });
    }
};

const adminIndex = async (req, res) => {
    if(req.session.aid){
        res.render('admin/index',{name:req.session.name},(err, html) => {
            if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            } else {
                res.send(html);
            }
        });  // Render the admin dashboard
    }
    else{
        res.redirect('/admin/login');
    }
};


const adminSubmit = async (req, res) => {
    // const email = req.body.aEmail;
    // const password = req.body.aPassword;

    const {aEmail: email,aPassword: password} = req.body;
      

    const reEmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    var rePassword = /^(?=.*[A-Z])(?=.*\W).{8,}$/;

    if(req.session.aid){
        res.redirect('/admin/index');
    }
    else{
        try {
            // console.log("--1")
            // password = await bcrypt.hash(password, saltRounds);

            if (!reEmail.test(email)) {
                // console.log("--2")

                req.session.error = 1; // Email format error
                res.redirect('/admin/login');
            } else if (!rePassword.test(password)) {

                // console.log("--3")

                req.session.error = 3; // Password format error
                res.redirect('/admin/login');
            } 
            else {
                // console.log("--4")

                    // const user = await adminDB.checkEmailExist(email);
                    const user = await User.findOne({email});
                    if(user && user.isAdmin){
                        // console.log("--5")

                        // const user = await adminDB.authenticateUser(email, password);

                        if(user && user.password==password){
                            
                            const user1 = await User.findOne({email});

                            // console.log("--6")


                            req.session.aid = user._id;
                            req.session.name = user.name;
                            console.log("email and password match");
                            res.redirect('/admin/loginSuccess'); // Redirect to success page
                        }
                        else{

                            //  console.log("--6")

                            req.session.error = 4; // Authentication failed
                            res.redirect('/admin/login');
                        }
                    }
                    else{
                        req.session.error = 2; // Authentication failed
                        res.redirect('/admin/login');
                    }
            }
        }
        catch(err){
            console.error(err);
            res.status(500).send('Internal Server Error');
        }
    }
};


const adminViewProducts = async (req, res) => {
    try {
      if (req.session.aid) {
        // const productData = await adminDB.getAllProduct();
        // const products = await Product.find({isDeleted:false}, { _id: 1, name: 1, category: 1, brand: 1, price: 1, quantity: 1, images: 1, tags: 1, description: 1, isDeleted: 1 } );
        // const products = await Product.find({}, { _id: 1, name: 1, category: 1, brand: 1, price: 1, quantity: 1, images: 1, tags: 1, description: 1, isDeleted: 1 } );
        const products2 = await Product.find({}).populate('category')
        // console.log("---",products2)
        res.render('admin/viewProduct', { products: products2 });
      } 
      else {
        res.redirect('/admin/login');
      }
    } catch (err) {
      console.log(err); // Pass the error to error-handling middleware
    }
  };
  

const adminAddProduct = async (req, res) => {
    try {
    if (req.session.aid) {
        const categories = await Category.find(); // Fetch all categories
        // console.log("--",categories)
        res.render('admin/addProduct',{categories},(err, html) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.send(html);
        }
        });
    } else {
        res.redirect('/admin/login');
    }
    } catch (err) {
    next(err);
    }
};


const adminUsermanage = async (req, res) => {
    try {
    if (req.session.aid) {

        // const usersdata = await adminDB.getAllUser();
        const usersdata = await User.find({});
        // console.log("---",usersdata);
        res.render('admin/userManagement', { users: usersdata });
    } else {
        res.redirect('/admin/login');
    }
    } catch (err) {
        next(err);
    }
};

// submit products 
const adminSubmitProduct = async (req, res) => {
    // const productName = req.body.pName;
    // console.log(productName);

    try{
        upload.array('pImages')
        (req,res,(err)=>{
            if(err){
                return res.status(400).send("error uploading images" + err);
            }


            const {pName: productName,pCategory: productCategory,pBrand: productBrand,pPrice: productPrice,pQuantity: productQuantity,pColors: productTags,pDesc: productDesc} = req.body;
            const images = req.files.map((file) => file.filename);
              
            // const fileNames = [];
            // for (const image of images) {
            //     fileNames.push(image.filename);
            // }
            // const joinedFileNames = fileNames.join(';');

            const newProduct = new Product({
                name: productName, 
                category: productCategory,
                brand: productBrand,
                price: productPrice,
                quantity: productQuantity,
                images: images,
                tags: productTags,
                description: productDesc
              });
          
              const savedProduct =  newProduct.save();
            //   console.log("--",images)
            // console.log(productName,'-',productBrand,'-',productCategory,'-',productPrice,'-',productDesc,'-',productQuantity,'-' , productTags,'-',images);
            // adminDB.addProduct(productName,productCategory,productBrand,productPrice,productQuantity,joinedFileNames,productTags,productDesc);
            res.redirect('/admin/viewProduct');
        });
    }
    catch(err){
        console.log(err);
        res.status(500).send('intername server error ');
    }
}

  
const adminDeleteProduct = async (req,res)=>{
    try{
        if(req.session.aid){
            const productID = req.query.product;
            // await adminDB.deleteProduct(productID);
            const product = await Product.findByIdAndUpdate(productID, { $set: { isDeleted: true } }, { new: true });

            await res.redirect('/admin/viewProduct');
        }
        else {
            res.redirect('/admin/login');
        }
    }
    catch(err){
        console.log(err);
    }
}
const adminBlockUser = async (req,res)=>{
    try{
        if(req.session.aid){
            const userID = req.query.user;
            console.log("--block",userID);
            // await adminDB.blockUser(userID);
            const user = await User.updateOne({_id:userID}, { $set: { isDeleted: true } }, { new: true });
            await res.redirect('/admin/userManagement');
        }
        else {
            res.redirect('/admin/login');
        }
    }
    catch(err){
        console.log(err);
    }
}


const adminUnblockUser = async (req,res)=>{
   try{
        if(req.session.aid){
            const userID = req.query.user;
            console.log("--unblock",userID);
            // await adminDB.unBlockUser(userID);
            const user = await User.updateOne({_id:userID}, { $set: { isDeleted: false } }, { new: true });
            await res.redirect('/admin/userManagement');
        }
        else {
            res.redirect('/admin/login');
        }
    }
    catch(err){
        console.log(err);
    }
}


const adminDetailProduct = async (req,res)=>{
    try{
        if(req.session.aid){

            const productID = req.query.product;
            // const product = await adminDB.getProductDetails(productID);

            const product = await Product.findById({_id:productID})
            const product2 = await Product.findById({_id:productID}).populate('category');
            const categories = await Category.find(); // Fetch all categories

            // console.log("---",product);
            res.render('admin/productDetails', { product ,proID:productID,product2,categories});
            // await res.render('admin/productDetails');
        }
        else {
            res.redirect('/admin/login');
        }
    }
    catch(err){
        console.log(err);
    }
}

const adminLogout  = async (req,res)=>{
    try{
    //     req.session.destroy((err) => {
    //     if (err) {
    //         console.error('Session destruction error:', err);
    //     }
    //     res.clearCookie('connect.sid');
        req.session.aid='';
    //     // res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
        res.redirect('/admin/login');
    // });
    }
    catch(err){
        next(err);
    }
};

const adminUpdateProduct = async (req,res)=>{
    try {
        upload.array('pImages')
        (req,res,(err)=>{
            if(err){
                return res.status(400).send("error uploading images" + err);
            }
            // const productID = req.query.product; 
            // const productName = req.body.uProductName;
            // const productCategory = req.body.pCategory;
            // const productBrand = req.body.uProductBrand;
            // const productPrice = req.body.uProductPrice;
            // const productQuantity = req.body.uProductQuantity;
            // const images = req.files;
            // if(images==""){
            //     console.log("if images")
            //     var images2=req.body.ppimages;

            // }
            // const productTags = req.body.uProductTags;
            // const productDesc = req.body.uProductDesc;

            const productID = req.query.product; 
            const {uProductName: productName, pCategory: productCategory,uProductBrand: productBrand,uProductPrice: productPrice,uProductQuantity: productQuantity,uProductTags: productTags,uProductDesc: productDesc} = req.body;
            // const images = req.files;

            // const uploadedImages = [];
            // for (const image of req.files) {
            //   uploadedImages.push(image.filename);
            // }
            const uploadedImages = req.files.map((file) => file.filename); // Extract filenames directly

            const selectedImages = req.body.pppimages || []; // Handle potential empty array
            const combinedImages = [...selectedImages, ...uploadedImages];
    
            // const updatedImagesString = combinedImages.join(';');

            console.log("--",combinedImages);   
            // console.log(productID,"}-{",productName,'}-{',productBrand,'}-{',productCategory,'}-{',productPrice,'}-{',productDesc,'}-{',productQuantity,"}-{" , productTags,"}-{",combinedImages);
            Product.findByIdAndUpdate(productID, {
                name: productName,
                brand: productBrand,
                category: productCategory,
                price: productPrice,
                description: productDesc,
                quantity: productQuantity,
                tags: productTags,
                images: combinedImages,
                updatedAt: Date.now(), // Update the updatedAt timestamp
            })
            .then(updatedProduct => {
                console.log('Product updated successfully:', updatedProduct);
            })
            .catch(error => {
                console.error('Error updating product:', error);
            });
            // adminDB.updateProduct(productID, productName, productCategory, productBrand, productPrice, productQuantity, joinedFileNames, productTags, productDesc);
            res.redirect('/admin/viewProduct');
          });
      } catch (err) {
        console.log(err);
        res.status(500).send('Internal server error');
    }
}


// const adminCategoryManage = async (req,res)=>{
//     try{
//         if(req.session.aid){

//             const uniqueCategories = await Category.find({});
//             // console.log("--",uniqueCategories);
//             await res.render('admin/categoryManage', { categories: uniqueCategories });
//         }
//         else {
//             res.redirect('/admin/login');
//         }
//     }
//     catch(err){
//         console.log(err);
//     }
// }

// const adminBlockCategory = async (req,res)=>{
//     try{
//         if(req.session.aid){
//             const categoryID = req.query.categoryId;
//             // console.log("--block",categoryID);
//             // await adminDB.blockUser(userID);
//             const user = await Category.updateOne({_id:categoryID}, { $set: { isDeleted: false } }, { new: true });
//             // const user = await User.findByIdAndUpdate(userID, { $set: { isDeleted: false } }, { new: true });

//             await res.render('admin/index');
//         }
//         else {
//             res.redirect('/admin/login');
//         }
//     }
//     catch(err){
//         console.log(err);
//     }
// }

// const adminUnBlockCategory = async (req,res)=>{
//     try{
//         if(req.session.aid){
//             const categoryID = req.query.categoryId;
//             // console.log("--unblock",categoryID);
//             // await adminDB.blockUser(userID);
//             const category = await Category.updateOne({_id:categoryID}, { $set: { isDeleted: true } }, { new: true });
//             await res.render('admin/index');
//         }
//         else {
//             res.redirect('/admin/login');
//         }
//     }
//     catch(err){
//         console.log(err);
//     }
// }


// const adminCategory = async (req,res)=>{
//     try{
//         if(req.session.aid){

//             // const n = await adminDB.getUniqueCategories();

//             await res.render('admin/addCategory');
//         }
//         else {
//             res.redirect('/admin/login');
//         }
//     }
//     catch(err){
//         console.log(err);
//     }
// }

// const adminSubmitCategory = async (req,res)=>{
//     try{
//         if(req.session.aid){

//             // const n = await adminDB.getUniqueCategories();
//             // const newCategory = req.body.aCategory;
//             // const newCategoryDesc = req.body.aCategoryDesc;

//             const{aCategory:newCategory,aCategoryDesc:newCategoryDesc}=req.body;

//             const newUploadCategory = new Category({
//                 name: newCategory,
//                 description: newCategoryDesc
//             });
    
//             const savedCategory = await newUploadCategory.save();
//             // await adminDB.addCategory(newCategory);

//             await res.render('admin/index');
//         }
//         else {
//             res.redirect('/admin/login');
//         }
//     }
//     catch(err){
//         console.log(err);
//     }
// }


const adminDefault = async (req,res)=>{
    res.redirect('/admin/login');
}
module.exports = {
    adminLogin,
    adminSubmit,
    adminIndex,
    adminLogout,
    adminViewProducts,
    adminAddProduct,
    adminSubmitProduct,
    adminDefault,
    adminDeleteProduct,
    adminDetailProduct,
    adminUpdateProduct,
    adminUsermanage,
    adminBlockUser,
    adminUnblockUser,
};


//-----------------------------------------------

// Check if email and password match records (implement your logic here)
/*if(reEmail.test(email) && rePassword.test(password)) {
    req.session.aid = "123";
    console.log("email and password match");
    res.redirect('/admin/loginSuccess'); // Redirect to success page
} else {
    req.session.error = 4; // Authentication failed
    res.redirect('/admin/login');
}*/

