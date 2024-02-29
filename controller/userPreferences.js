const UserPreference = require('../models/userPreference'); // Path to your UserPreference model


const userPreference = async(req,res)=>{
    if(req.session.aid){
        if(req.session.uaid){
            // Fetch the data from the database
            const totalUsers = await UserPreference.countDocuments();
            const browserUsageCounts = await UserPreference.aggregate([
                { $group: { _id: "$browser", totalUsers: { $sum: 1 } } }
            ]);

            const osUsageCounts = await UserPreference.aggregate([
                { $group: { _id: "$os", totalUsers: { $sum: 1 } } }
            ]);

            const languageUsageCounts = await UserPreference.aggregate([
                { $group: { _id: "$language", totalUsers: { $sum: 1 } } }
            ]);
            const themeUsageCounts = await UserPreference.aggregate([
                { $group: { _id: "$theme", totalUsers: { $sum: 1 } } }
            ]);

            // Pass the data to the view
            return res.render('admin/userPreferencesData', {
                totalUsers,
                browserUsageCounts,
                osUsageCounts,
                languageUsageCounts,
                themeUsageCounts
            });
        }
        return res.render('admin/userPreference');
    }   
    else{
        return res.redirect('/admin/login');
    }    
}   

const preferenceLogin = async(req,res)=>{
    const { pEmail, pPassword } = req.body;
    if (pEmail === process.env.DEFAULT_EMAIL && pPassword === process.env.DEFAULT_PASSWORD) {
        req.session.uaid=true;
        // Fetch the data from the database
        const totalUsers = await UserPreference.countDocuments();
        const browserUsageCounts = await UserPreference.aggregate([
            { $group: { _id: "$browser", totalUsers: { $sum: 1 } } }
        ]);

        const osUsageCounts = await UserPreference.aggregate([
            { $group: { _id: "$os", totalUsers: { $sum: 1 } } }
        ]);

        const languageUsageCounts = await UserPreference.aggregate([
            { $group: { _id: "$language", totalUsers: { $sum: 1 } } }
        ]);
        const themeUsageCounts = await UserPreference.aggregate([
            { $group: { _id: "$theme", totalUsers: { $sum: 1 } } }
        ]);

        // Pass the data to the view
        return res.render('admin/userPreferencesData', {
            totalUsers,
            browserUsageCounts,
            osUsageCounts,
            languageUsageCounts,
            themeUsageCounts
        });
    } else {
        return res.redirect('/admin/preference');
    }
}

const userPreferenceGetter = async(req, res) => {
    try {
        const existingRecord = await UserPreference.findOne({ userId: req.session.uid });
        if (existingRecord) {
            res.status(400).json({ message: 'Data for this user has already been sent.' });
        } else {
            const userPreference = new UserPreference({
                userId: req.session.uid,
                os: req.body.os,
                theme: req.body.theme,
                language: req.body.language,
                browser:req.body.browser
            });
            const savedUserPreference = await userPreference.save();
            res.json(savedUserPreference);
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports={
    userPreference,
    preferenceLogin,
    userPreferenceGetter,
}
