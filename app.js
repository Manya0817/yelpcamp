if(process.env.NODE_ENV!="production"){
    require('dotenv').config();
}

const sanitizeV5 = require('./utils/mongoSanitizeV5.js');
const express=require('express');
const path=require('path');
const mongoose=require('mongoose');
const ejsMate=require('ejs-mate');
const catchAsync=require('./utils/catchAsync');
const ExpressError=require('./utils/ExpressError');
const methodOverride=require('method-override');
const Campground=require('./models/campground');
const Review=require('./models/review');
const campgroundRoutes=require('./routes/campgrounds');
const reviewRoutes=require('./routes/reviews');
const session=require('express-session');
const flash=require('connect-flash');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/user');
const userRoutes=require('./routes/users');
const helmet=require('helmet');
// const DB_URL=process.env.DB_URL;
const MongoDBStore=require("connect-mongo")(session);
const dbUrl=process.env.DB_URL;

// mongodb://127.0.0.1:27017/yelp-camp
mongoose.set('strictQuery', true);
// mongoose.connect(process.env.DB_URL)
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});



const db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database Connected");
})


const app=express();
app.set('query parser', 'extended');

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(helmet({contentSecurityPolicy:false}));
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')))
app.use(sanitizeV5({ replaceWith: '_' }));

const secret=process.env.SECRET|| 'thisshouldbeabettersecret!';

// Replace the store configuration:
const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24*60*60,
    mongooseConnection: mongoose.connection // Add this line
});

store.on("error",function(e){
    console.log("SESSION STORE ERROR",e)
})

const sessionConfig={
    store,
    name:'session',
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        // secure:true,  
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.tiles.mapbox.com/",
    // "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.mapbox.com/",
    // "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [
    // "https://api.mapbox.com/",
    // "https://a.tiles.mapbox.com/",
    // "https://b.tiles.mapbox.com/",
    // "https://events.mapbox.com/",
    "https://api.maptiler.com/", // add this
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dmjokf4os/",
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    console.log(req.query);
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})

// app.get('/fakeUser',async(req,res)=>{
//     const user=new User({email:"manya@gmail.com",username:'manya'});
//     const newUser=await User.register(user,'chicken');
//     res.send(newUser);
// })

app.use('/',userRoutes);
app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewRoutes)  

app.get('/',(req,res)=>{
    res.render('home');
})




app.use((req, res, next) => {
    console.log(`Requested URL: ${req.url}`);
    next();
});


app.all(/(.*)/, (req, res, next )=>{
    next(new ExpressError('Page Not Found',404))
})

// app.get('/makecampground',async(req,res)=>{
//     const camp=new Campground({title:'My Backyard',description:'cheap camping!'});
//     await camp.save();
//     res.send(camp);
// })

app.use((err,req,res,next)=>{
    const {statusCode=500}=err;
    if(!err.message)err.message='Oh No, Something Went Wrong!'
    res.status(statusCode).render('error',{err});
    // res.send('Oh boy , something went wrong!!');
})

app.listen(3000,()=>{
    console.log(`Serving on port ${3000}`);
}) 

// _id: {_id: false},

// npm install cloudinary@1.41.3

// npm install multer-storage-cloudinary@4.0.0

// npm install multer@1.4.5-lts.1

//delete app.use(mongoSanitize({ ... }));

// npm install connect-mongo@3.2.0