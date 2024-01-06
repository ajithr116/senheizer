const express = require("express");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const adminDB = require('../models/adminDB'); // Import the user database module
const multer  = require('multer')
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
    const email = req.body.aEmail;
    const password = req.body.aPassword;

    const reEmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    var rePassword = /^(?=.*[A-Z])(?=.*\W).{8,}$/;

    if(req.session.aid){
        res.redirect('/admin/index');
    }
    else{
        try {

            // password = await bcrypt.hash(password, saltRounds);

            if (!reEmail.test(email)) {
                req.session.error = 1; // Email format error
                res.redirect('/admin/login');
            } else if (!rePassword.test(password)) {
                req.session.error = 3; // Password format error
                res.redirect('/admin/login');
            } 
            else {

                    const user = await adminDB.checkEmailExist(email);

                    if(user){

                        const user = await adminDB.authenticateUser(email, password);

                        if(user){

                            req.session.aid = user.aid;
                            req.session.name = user.name;
                            console.log("email and password match");
                            res.redirect('/admin/loginSuccess'); // Redirect to success page
                        }
                        else{
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


// const adminViewProducts = async (req, res) => {
//     try {
//       if (req.session.aid) {
//         res.render('admin/viewProduct', (err, html) => {
//           if (err) {
//             console.error(err);
//             res.status(500).send('Internal Server Error');
//           } else {
//             res.send(html);
//           }
//         });
//       } else {
//         res.redirect('/admin/login');
//       }
//     } catch (err) {
//       next(err);
//     }
//   };

const adminViewProducts = async (req, res) => {
    try {
      if (req.session.aid) {
        const productData = await adminDB.getAllProduct();
        res.render('admin/viewProduct', { products: productData });
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
        res.render('admin/addProduct', (err, html) => {
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

        const usersdata = await adminDB.getAllUser();

        // console.log(usersdata);
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
            const productName = req.body.pName;
            const productCategory = req.body.pCategory;
            const productBrand = req.body.pBrand;
            const productPrice = req.body.pPrice;
            const productQuantity = req.body.pQuantity;
            const images = req.files;
            const productTags = req.body.pColors;
            const productDesc = req.body.pDesc;

            const fileNames = [];
            for (const image of images) {
                fileNames.push(image.filename);
            }
            const joinedFileNames = fileNames.join(';');

            // console.log('tags ', productTags);
            // console.log(productName,'-',productBrand,'-',productCategory,'-',productPrice,'-',productDesc,'-',productQuantity , productTags);
            adminDB.addProduct(productName,productCategory,productBrand,productPrice,productQuantity,joinedFileNames,productTags,productDesc);
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
            await adminDB.deleteProduct(productID);
            await res.render('admin/index');
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
            console.log("block",userID);
            await adminDB.blockUser(userID);
            await res.render('admin/index');
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
            console.log("unblock",userID);
            await adminDB.unBlockUser(userID);
            await res.render('admin/index');
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
            const product = await adminDB.getProductDetails(productID);

            // Render the template with product details
            res.render('admin/productDetails', { product ,proID:productID});
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
        req.session.destroy((err) => {
        if (err) {
            console.error('Session destruction error:', err);
        }
        res.clearCookie('connect.sid');
        
        // res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
        res.redirect('/admin/login');
    });
    }
    catch(err){
        next(err);
    }
};

const adminUpdateProduct = async (req,res)=>{
    console.log("asd");
    try {
        console.log("asd");

        upload.array('pImages')
        (req,res,(err)=>{
            if(err){
                return res.status(400).send("error uploading images" + err);
            }
            const productID = req.query.product; 
            const productName = req.body.uProductName;
            const productCategory = req.body.uProductCategory;
            const productBrand = req.body.uProductBrand;
            const productPrice = req.body.uProductPrice;
            const productQuantity = req.body.uProductQuantity;
            const images = req.files;
            const productTags = req.body.uProductTags;
            const productDesc = req.body.uProductDesc;
    

            const fileNames = [];
            for (const image of images) {
                fileNames.push(image.filename);
            }
            const joinedFileNames = fileNames.join(';');
    
            // console.log(productName,'-',productBrand,'-',productCategory,'-',productPrice,'-',productDesc,'-',productQuantity,"-" , productTags,"-",images);

            // console.log('ironman');
            adminDB.updateProduct(productID, productName, productCategory, productBrand, productPrice, productQuantity, joinedFileNames, productTags, productDesc);
            res.redirect('/admin/viewProduct');
          });
      } catch (err) {
        console.log(err);
        res.status(500).send('Internal server error');
      }
}




const adminCategoryManage = async (req,res)=>{
    try{
        if(req.session.aid){

            const uniqueCategories = await adminDB.getUniqueCategories();

            await res.render('admin/categoryManage', { categories: uniqueCategories });
        }
        else {
            res.redirect('/admin/login');
        }
    }
    catch(err){
        console.log(err);
    }
}




const adminCategory = async (req,res)=>{
    try{
        if(req.session.aid){

            // const n = await adminDB.getUniqueCategories();

            await res.render('admin/addCategory');
        }
        else {
            res.redirect('/admin/login');
        }
    }
    catch(err){
        console.log(err);
    }
}

const adminSubmitCategory = async (req,res)=>{
    try{
        if(req.session.aid){

            // const n = await adminDB.getUniqueCategories();
            const newCategory = req.body.aCategory;
            // console.log("cateogry new " , newCategory);

            await adminDB.addCategory(newCategory);

            await res.render('admin/index');
        }
        else {
            res.redirect('/admin/login');
        }
    }
    catch(err){
        console.log(err);
    }
}



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
    adminCategoryManage,
    adminDetailProduct,
    adminUpdateProduct,
    adminUsermanage,
    adminBlockUser,
    adminUnblockUser,
    adminCategory,
    adminSubmitCategory,
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

