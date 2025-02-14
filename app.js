if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
const mpGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const maptoken=process.env.MAP_TOKEN;
const Geocodingclient = mpGeocoding({ accessToken: maptoken });
const express=require("express");
const app=express();
const ejs=require("ejs");
const mongoose=require("mongoose");
const path=require("path");
const listing=require("./models/listing.js");
const Wrapasync=require("./utils/wrapasync.js");
const ExpressError=require("./utils/ExpressError.js");
const methodOverride = require('method-override');
const ejsMate=require("ejs-mate");
const {listingSchema}=require("./schema.js");
const reviews=require("./routes/reviews.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const {loggedIn,isOwner} = require("./middleware.js");
const listingcontroller=require("./controller/listing.js");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const user=require("./models/user.js");
const wrapasync = require("./utils/wrapasync.js");
const {Redirecturl}=require("./middleware.js");
const multer  = require('multer');
const {storage}=require("./cloudconfig.js");
const upload = multer({ storage });

const store=MongoStore.create({
    mongoUrl: process.env.ATLASDB_URL,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter:24*3600
})
store.on("error",()=>{
    console.log("Error occured at Mongo SesionDB",err);
})
const sessionObject={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()*7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
}

app.use(session(sessionObject));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,"/public")));
app.engine("ejs",ejsMate);
main().then(()=>{
    console.log("connected to db");
}).catch(err=>{
    console.log(err);
})

async function main(){
   await mongoose.connect(process.env.ATLASDB_URL);
}
app.set("veiw engine","ejs");
app.set("veiws",path.join(__dirname+"/veiws"));
const validatelisting=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
        if(error){
            throw new ExpressError(400,error);
        }else{
            next();
        }
}
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
})
// app.get("/demouser",async(req,res)=>{
//     let fakeuser=new user({
//         email:"student@gmail.com",
//         username:"delta-student"
//     });
//     let result=await user.register(fakeuser,"helloworld");
//     console.log(result);
// })
app.get("/listings",Wrapasync(async(req,res)=>{
    const allListings=await listing.find({});
    res.render(__dirname+"/veiws/listings/show.ejs",{allListings});
}));

app.get("/listings/:id",Wrapasync(async(req,res)=>{
    let {id}=req.params;
    const result=await listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
    if(!result){
        req.flash("error","Listing you are trying to get does not exist!");
        res.redirect("/listings");
    }
    res.render(__dirname+"/veiws/listings/pshow.ejs",{result});
}));

app.post("/listings",
     loggedIn,upload.single('listing[image]'),validatelisting,
     Wrapasync(async(req,res,next)=>{
         let response=await Geocodingclient.forwardGeocode({
             query: req.body.listing.location,
             limit: 1
          })
             .send();
         let url=req.file.path;
         let filename=req.file.filename;
           const newListing= new listing(req.body.listing);
           newListing.owner=req.user._id;
           newListing.image={url,filename};
           newListing.geometry=response.body.features[0].geometry;
           let result=await newListing.save();
          req.flash("success","New listing is created!");
          res.redirect("/listings")}));

app.get("/list/new",loggedIn,(req,res)=>{
    res.render(__dirname+"/veiws/listings/new.ejs");
})

app.get("/listings/:id/edit",loggedIn,isOwner,Wrapasync(async (req,res)=>{
    let {id}=req.params;
    const result=await listing.findById(id);
    if(!result){
        req.flash("error","Listing you are trying to get does not exist!");
        res.redirect("/listings");
    }
    const originalimage=result.image.url;
    originalimage.replace("/upload","upload/w_200");
    res.render(__dirname+"/veiws/listings/edit.ejs",{result,originalimage});
}));

app.put("/listings/:id/edit",loggedIn,isOwner,upload.single('listing[image]'),validatelisting,Wrapasync(async(req,res)=>{
    let {id}=req.params;
    let listinga = await listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file!=="undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        listinga.image={url,filename};
        await listinga.save();
    }
    req.flash("success","Listing updated succesfully!");
    res.redirect(`/listings/${id}`);
}));
app.delete("/delete/:id",loggedIn,isOwner,Wrapasync(async(req,res)=>{
    let {id}=req.params;
    await listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted succesfully!");
    res.redirect("/listings");
}));

app.use("/listings/:id/reviews",reviews);

app.get("/signUp",(req,res)=>{
    res.render(__dirname+"/veiws/signup/register.ejs");
})
app.post("/signup",wrapasync(async(req,res)=>{
    try{
        let{username,email,password}=req.body;
        const newUser=new user({username,email});
        const result=await user.register(newUser,password);
        req.login(result,(err)=>{
            if(err){
                next(err);
            }else{
                req.flash("success","Welcome to WanderLust!");
                res.redirect("/listings");
            }
        })
    }catch(e){
        req.flash("error",e.message);
       res.redirect("/signup");
    }
}));
app.get("/login",(req,res)=>{
    res.render(__dirname+"/veiws/signup/login.ejs");
})
app.post("/login",Redirecturl,passport.authenticate('local', 
    { failureRedirect: '/login' ,
        failureFlash:true})
    ,(req,res)=>{
        req.flash("success","Welocme back to WanderLust!");
        if(!res.locals.redirectUrl) res.redirect("/listings");
        res.redirect(res.locals.redirectUrl);
})
app.get("/logout",(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }else{
            req.flash("success","you are logged out!");
            res.redirect("/listings");
        }
    })
})
// app.get("/",(req,res)=>{
//     res.send("root");
// })
app.all("*",(req,res)=>{
    throw new ExpressError(404,"Page Not Found!");
})
app.use((err,req,res,next)=>{
    let{StatusCode=500,message}=err;
    res.status(StatusCode).render(__dirname+"/veiws/Error.ejs",{message});
})
app.listen(8080,()=>{
    console.log("listening to server");
})