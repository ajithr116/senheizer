
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const Razorpay = require('razorpay');
const flash = require('connect-flash');
const shortid = require("shortid");
const bcrypt = require('bcrypt'); 


require('dotenv').config();


// const { MongoClient } = require('mongodb');

const userController = require('./controller/user');
const adminRouter = require('./routes/admin');
const userRoutes = require('./routes/user');
const userDB = require('./models/userDB'); 
const connectDB = require('./confiq/db');

const app = express();

app.use(express.static('public'));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.set('view engine', 'ejs');
app.use(flash());
app.use(cors());
app.use(express.json());



app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(404).render('user/404page');
});

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
})

app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});

connectDB();    //for database establishing 

//----------------------------------------------requirements over -------------------------------------------------------------

//---------------------------------admin routes-------------------------------------------
app.use('/admin', adminRouter);
//---------------------------------admin routes end--------------------------------------------

app.use('/', userRoutes);

app.get('*',(req,res)=>{
    if (req.session.uname) {
        res.redirect('/home'); 
    } 
    else {
        res.redirect('./login');
    }
});

app.use((req,res)=>{
    res.redirect('./login');
});

app.listen( process.env.PORT || 3000 , () => {
    console.log( "Server started successfully" );
}) 