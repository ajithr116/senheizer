const mongoose = require('mongoose');

const UserPreferenceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    os: {
        type: String,
        required: true
    },
    theme: {
        type: String,
        enum: ['dark', 'light', 'default'],
        required: true
    },
    language: {
        type: String,
        required: true
    },
    browser:{
        type:String,
    },  
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('UserPreference', UserPreferenceSchema);
