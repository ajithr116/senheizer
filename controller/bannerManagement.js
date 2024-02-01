const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/banners'));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });


const Products = require('../models/products');
const Category = require('../models/category');
const Banner = require('../models/banner');


const adminBanner = async(req,res)=>{
    if(req.session.aid){

        const banner = await Banner.find({});

        res.render('admin/banner',{banner})
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
    res.redirect('/admin/login');
  }
}

const adminUploadBanner = async (req, res) => {
    upload.single('image')(req, res, async (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error uploading image');
        return;
      }
      const {description, linkType, product, category, startDate, endDate, discountAmt} = req.body;
      let link;
      if (linkType === 'product') {
        link = product; 
      } else if (linkType === 'category') {
        link = category; 
      }
  
    const imagePath = req.file.path;
    const imageName = req.file.originalname;
    // console.log("--",image,"--",imagePath,"--",description,"--",linkType,"--",product,"--",category,"--",startDate,"--",endDate)
    // console.log("image",imagePath);
    const newbanner = new Banner({
      imageName,
      description,
      link,
      linkType,
      startDate,
      endDate,
      discountAmt
    })
    try{
      const banner = await newbanner.save();
    }
    catch(err){
        console.error(err);
    }
    res.redirect('/admin/banner');
  });
};

const adminBannerDelete = async(req,res)=>{
  const bannerId = req.query.bannerId;
  const banner = await Banner.findByIdAndUpdate(bannerId, {isDeleted: true,}, { new: true });
  res.redirect('/admin/banner');
}

const adminBlockbanner = async(req,res)=>{
  const bannerId = req.query.bannerId;
  const banner = await Banner.findByIdAndUpdate(bannerId, {isBlocked: true,}, { new: true });
  res.redirect('/admin/banner');
}

const adminUnblockBanner = async(req,res)=>{
  const bannerId = req.query.bannerId;
  const banner = await Banner.findByIdAndUpdate(bannerId, {isBlocked: false,}, { new: true });
  res.redirect('/admin/banner');
}

module.exports={
  adminBanner,
  adminAddBanner,
  adminUploadBanner,
  adminBannerDelete,
  adminUnblockBanner,
  adminBlockbanner,
}

