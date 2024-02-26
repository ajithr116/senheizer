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
            let category;
            if (req.query.categoryId) {
                category = await Category.findById(req.query.categoryId);
                res.render('admin/addCategory',{category});
            }
            else {
                res.render('admin/addCategory');
            }
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
            const { aCategory: newCategory, aCategoryDesc: newCategoryDesc, categoryId } = req.body;


            if (categoryId) {
                let category = await Category.findById(categoryId);
                if (category) {
                    category.name = newCategory;
                    category.description = newCategoryDesc;
                    await category.save();
                    await res.redirect('/admin/categoryManage'); 
                } 
            }
 
            if (newCategory=="" || newCategory.trim()=="") {
                await res.render('admin/addCategory',{error:2});
            }
 
            if(!isNaN(newCategory)){
                await res.render('admin/addCategory',{error:3});
            }

            const upperCaseCategory = newCategory.toUpperCase();
            const categoryExists = await Category.findOne({ name: { $regex: new RegExp('^' + upperCaseCategory + '$', 'i') } });
            if (categoryExists) {
                await res.render('admin/addCategory',{error:1});
            } else {
                const newUploadCategory = new Category({
                    name: newCategory,
                    description: newCategoryDesc
                });
        
                const savedCategory = await newUploadCategory.save();
                await res.redirect('/admin/categoryManage'); 
            }
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
