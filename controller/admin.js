
const User = require('../models/user'); 
const Product = require('../models/products'); 
const Category = require('../models/category');
const multer  = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'C:\\Users\\ASUS\\OneDrive\\Desktop\\week 8.1\\public\\uploads\\');
    },
    filename: function (req, file, cb) {
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
                res.status(404).render('user/404page');
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
        }); 
    }
    else{
        res.redirect('/admin/login');
    }
};


const adminSubmit = async (req, res) => {

    const {aEmail: email,aPassword: password} = req.body;
      

    const reEmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    var rePassword = /^(?=.*[A-Z])(?=.*\W).{8,}$/;

    if(req.session.aid){
        res.redirect('/admin/index');
    }
    else{
        try {
            if (!reEmail.test(email)) {
                req.session.error = 1; // Email format error
                res.redirect('/admin/login');
            } else if (!rePassword.test(password)) {
                req.session.error = 3; // Password format error
                res.redirect('/admin/login');
            } 
            else {
                const user = await User.findOne({email});
                if(user && user.isAdmin){
                    if(user && user.password==password){
                        const user1 = await User.findOne({email});
                        req.session.aid = user._id;
                        req.session.name = user.name;
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
            res.status(500).render('admin/404page');
        }
    }
};

const adminViewProducts = async (req, res) => {
    try {
        if (req.session.aid) {
            const products2 = await Product.find({}).populate('category')
            res.render('admin/viewProduct', { products: products2 });
        } 
        else {
            res.redirect('/admin/login');
        }
    } catch (err) {
        console.error(err); 
        res.status(500).render('admin/404page');
    }
};
  
const adminAddProduct = async (req, res) => {
    try {
    if (req.session.aid) {
        const categories = await Category.find(); 
        res.render('admin/addProduct',{categories},(err, html) => {
        if (err) {
            console.error(err);
            res.status(404).render('user/404page');
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

const adminUsermanage = async (req, res, next) => {
    try {
    if (req.session.aid) {
        const usersdata = await User.find({});
        res.render('admin/userManagement', { users: usersdata });
    } else {
        res.redirect('/admin/login');
    }
    } catch (err) {
        next(err);
    }
};

const adminSubmitProduct = async (req, res) => {

    try{
        let categories = await Category.find();
        upload.array('pImages')
        (req,res,(err)=>{
            if(err){
                return res.status(400).send("error uploading images" + err);
            }

            if (!req.files || req.files.length === 0) {
                return res.render('admin/addProduct', {categories,error: 1});
            }

            for (let file of req.files) {
                const extension = file.originalname.split('.').pop().toLowerCase();
                if (extension !== 'jpg' && extension !== 'png') {
                    return res.render('admin/addProduct', {categories,error: 2});
                }
            }

            
            const {pName: productName,pCategory: productCategory,pBrand: productBrand,pPrice: productPrice,pQuantity: productQuantity,pColors: productTags,pDesc: productDesc} = req.body;
            const images = req.files.map((file) => file.filename);
            
            if (productName.trim() === '') {
                return res.render('admin/addProduct', {categories, error: 3});
            }
            

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
            res.redirect('/admin/viewProduct');
        });
    }
    catch(err){
        console.log(err);
        res.status(500).render('admin/404page');
    }
}

//------------------------------------SENSITIVE || SENSITIVE ||  SENSITIVE with croping images -------------------------------------------
// const adminSubmitProduct = async (req, res) => {
//     try{
//         upload.array('pImages')(req,res,async (err)=>{
//             if(err){
//                 return res.status(400).send("error uploading images" + err);
//             }

//             const {pName: productName,pCategory: productCategory,pBrand: productBrand,pPrice: productPrice,pQuantity: productQuantity,pColors: productTags,pDesc: productDesc} = req.body;
//             let images = req.files.map((file) => file.filename);

//             // Crop images using sharp
//             for (let i = 0; i < images.length; i++) {
//                 const outputPath = `C:\\Users\\ASUS\\OneDrive\\Desktop\\week 8.1\\public\\uploads\\cropped-${images[i]}`;
//                 await sharp(`C:\\Users\\ASUS\\OneDrive\\Desktop\\week 8.1\\public\\uploads\\${images[i]}`)
//                     .resize(500, 300) // adjust the width and height to your needs
//                     .toFile(outputPath);
//                 images[i] = `cropped-${images[i]}`; // update the image path with the new cropped image path
//             }

//             const newProduct = new Product({
//                 name: productName, 
//                 category: productCategory,
//                 brand: productBrand,
//                 price: productPrice,
//                 quantity: productQuantity,
//                 images: images,
//                 tags: productTags,
//                 description: productDesc
//             });
          
//             const savedProduct =  newProduct.save();
//             res.redirect('/admin/viewProduct');
//         });
//     }
//     catch(err){
//         console.log(err);
//         res.status(500).send('internal server error');
//     }
// }

//------------------------------------SENSITIVE || SENSITIVE ||  SENSITIVE-------------------------------------------

const adminDeleteProduct = async (req,res)=>{
    try{
        if(req.session.aid){
            const productID = req.query.product;
            const product = await Product.findByIdAndUpdate(productID, { $set: { isDeleted: true } }, { new: true });

            await res.redirect('/admin/viewProduct');
        }
        else {
            res.redirect('/admin/login');
        }
    }
    catch(err){
        console.log(err);
        res.status(500).render('admin/404page');
    }
}
const adminBlockUser = async (req,res)=>{
    try{
        if(req.session.aid){
            const userID = req.query.user;
            console.log("--block",userID);
            const user = await User.updateOne({_id:userID}, { $set: { isDeleted: true } }, { new: true });
            await res.redirect('/admin/userManagement');
        }
        else {
            res.redirect('/admin/login');
        }
    }
    catch(err){
        console.log(err);
        res.status(500).render('admin/404page');
    }
}


const adminUnblockUser = async (req,res)=>{
   try{
        if(req.session.aid){
            const userID = req.query.user;
            console.log("--unblock",userID);
            const user = await User.updateOne({_id:userID}, { $set: { isDeleted: false } }, { new: true });
            await res.redirect('/admin/userManagement');
        }
        else {
            res.redirect('/admin/login');
            res.status(404).render('admin/404page');
        }
    }
    catch(err){
        console.log(err);
        res.status(500).render('admin/404page');
    }
}


const adminDetailProduct = async (req,res)=>{
    try{
        if(req.session.aid){
            const productID = req.query.product;
            const product = await Product.findById({_id:productID})
            const product2 = await Product.findById({_id:productID}).populate('category');
            const categories = await Category.find(); // Fetch all categories
            res.render('admin/productDetails', { product ,proID:productID,product2,categories});
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
        req.session.aid='';
        res.redirect('/admin/login');
    }
    catch(err){
        next(err);
    }
};

const adminUpdateProduct = async (req,res)=>{
    try {
        let productID = req.query.product;
        let product = await Product.findById({_id:productID})
        let product2 = await Product.findById({_id:productID}).populate('category');
        let categories = await Category.find(); // Fetch all categories
        upload.array('pImages')
        (req,res,(err)=>{
            if(err){
                return res.status(400).send("error uploading images" + err);
            }
            const productID = req.query.product; 
            const {uProductName: productName, pCategory: productCategory,uProductBrand: productBrand,uProductPrice: productPrice,uProductQuantity: productQuantity,uProductTags: productTags,uProductDesc: productDesc} = req.body;
            // const images = req.files;

            // const uploadedImages = [];
            // for (const image of req.files) {
            //   uploadedImages.push(image.filename);
            // }
            
            if(productName=='' || productName.trim()===''){
                return res.render('admin/productDetails', { product ,proID:productID,product2,categories,error:1});
            }

            for (let file of req.files) {
                const extension = file.originalname.split('.').pop().toLowerCase();
                if (extension !== 'jpg' && extension !== 'png') {
                    return res.render('admin/productDetails', { product ,proID:productID,product2,categories,error:2});
                }
            }

            if(productBrand=='' || productBrand.trim()===''){
                return res.render('admin/productDetails', { product ,proID:productID,product2,categories,error:3});
            }

            if(productPrice=='' || productPrice.trim()===''){
                return res.render('admin/productDetails', { product ,proID:productID,product2,categories,error:4});
            }

            if(productQuantity=='' || productQuantity.trim()===''){
                return res.render('admin/productDetails', { product ,proID:productID,product2,categories,error:5});
            }
            
            if(productDesc=='' || productDesc.trim()===''){
                return res.render('admin/productDetails', { product ,proID:productID,product2,categories,error:6});
            }

            const uploadedImages = req.files.map((file) => file.filename); 

            const selectedImages = req.body.pppimages || []; 
            const combinedImages = [...selectedImages, ...uploadedImages];
    
            Product.findByIdAndUpdate(productID, {
                name: productName,
                brand: productBrand,
                category: productCategory,
                price: productPrice,
                description: productDesc,
                quantity: productQuantity,
                tags: productTags,
                images: combinedImages,
                updatedAt: Date.now(), 
            })
            .then(updatedProduct => {
                console.log('Product updated successfully:');
            })
            .catch(error => {
                console.error('Error updating product:', error);
            });
            res.redirect('/admin/viewProduct');
          });
      } catch (err) {
        console.log(err);
        res.status(500).render('admin/404page');
    }
}

const adminUserDetails = async (req, res) => {
    if (req.session.aid) {
        const searchInput = req.query.searchInput;
        if (searchInput) {
            const user2 = await User.find({
                $or: [
                    { firstName: { $regex: searchInput, $options: 'i' } },
                    { lastName: { $regex: searchInput, $options: 'i' } },
                    { email: { $regex: searchInput, $options: 'i' } },
                ],
            });
            if (user2.length === 0) {
                // Render 404 Page with header number
                res.status(404).render('admin/404Page', { status: 404 });
            } else {
                const user = await User.findById(user2[0]._id).populate('address');
                res.render('admin/userdetails', { user });
            }
        } else {
            const userId = req.query.userid;
            const user = await User.findById(userId).populate('address');
            if (!user) {
                // Render 404 Page with header number
                res.status(404).render('404Page', { headerNumber: 404 });
            } else {
                res.render('admin/userdetails', { user });
            }
        }
    } else {
        res.redirect('/admin/login');
    }
};


const adminDefault = async (req,res)=>{
    res.redirect('/admin/login');
}

module.exports = {
    adminLogin,adminSubmit,
    adminIndex,adminLogout,
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
    adminUserDetails,
};

