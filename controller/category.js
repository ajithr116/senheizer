const Category = require('../models/category');

const adminCategoryManage = async (req,res)=>{
    try{
        if(req.session.aid){

            const uniqueCategories = await Category.find({});
            // console.log("--",uniqueCategories);
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

const adminBlockCategory = async (req,res)=>{
    try{
        if(req.session.aid){
            const categoryID = req.query.categoryId;
            // console.log("--block",categoryID);
            // await adminDB.blockUser(userID);
            const user = await Category.updateOne({_id:categoryID}, { $set: { isDeleted: false } }, { new: true });
            // const user = await User.findByIdAndUpdate(userID, { $set: { isDeleted: false } }, { new: true });

            await res.redirect('/admin/categoryManage');
        }
        else {
            res.redirect('/admin/login');
        }
    }
    catch(err){
        console.log(err);
    }
}

const adminUnBlockCategory = async (req,res)=>{
    try{
        if(req.session.aid){
            const categoryID = req.query.categoryId;
            // console.log("--unblock",categoryID);
            // await adminDB.blockUser(userID);
            const category = await Category.updateOne({_id:categoryID}, { $set: { isDeleted: true } }, { new: true });
            await res.redirect('/admin/categoryManage');
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
            // const newCategory = req.body.aCategory;
            // const newCategoryDesc = req.body.aCategoryDesc;

            const{aCategory:newCategory,aCategoryDesc:newCategoryDesc}=req.body;

            const newUploadCategory = new Category({
                name: newCategory,
                description: newCategoryDesc
            });
    
            const savedCategory = await newUploadCategory.save();
            // await adminDB.addCategory(newCategory);

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

module.exports = {
    adminCategoryManage,
    adminCategory,
    adminSubmitCategory,
    adminBlockCategory,
    adminUnBlockCategory,
};
