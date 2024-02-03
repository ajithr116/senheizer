const Category = require('../models/category');

const adminCategoryManage = async (req,res,next)=>{
    try{
        if(req.session.aid){
            const uniqueCategories = await Category.find({});
            await res.render('admin/categoryManage', { categories: uniqueCategories });
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

const adminBlockCategory = async (req,res)=>{
    try{
        if(req.session.aid){
            const categoryID = req.query.categoryId;
            const user = await Category.updateOne({_id:categoryID}, { $set: { isDeleted: false } }, { new: true });
            await res.redirect('/admin/categoryManage');
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

const adminUnBlockCategory = async (req,res)=>{
    try{
        if(req.session.aid){
            const categoryID = req.query.categoryId;
            const category = await Category.updateOne({_id:categoryID}, { $set: { isDeleted: true } }, { new: true });
            await res.redirect('/admin/categoryManage');
        }
        else {
            res.redirect('/admin/login');
        }
    }
    catch(err){
        console.log(err);
        res.status(404).render('admin/404page');
    }
}


const adminCategory = async (req,res)=>{
    try{
        if(req.session.aid){
            await res.render('admin/addCategory');
        }
        else {
            res.redirect('/admin/login');
        }
    }
    catch(err){
        console.log(err);
        res.status(404).render('admin/404page');
    }
}

const adminSubmitCategory = async (req,res)=>{
    try{
        if(req.session.aid){
            const{aCategory:newCategory,aCategoryDesc:newCategoryDesc}=req.body;
            const newUploadCategory = new Category({
                name: newCategory,
                description: newCategoryDesc
            });
    
            const savedCategory = await newUploadCategory.save();
            await res.redirect('/admin/categoryManage'); 
        }
        else {
            res.redirect('/admin/login');
        }
    }
    catch(err){
        console.log(err);
        res.status(404).render('admin/404page');
    }
}

module.exports = {
    adminCategoryManage,
    adminCategory,
    adminSubmitCategory,
    adminBlockCategory,
    adminUnBlockCategory,
};
