const express=require("express");
const app=express();
const session=require("express-session");
const flash = require('connect-flash');
app.use(flash());
const ejs=require("ejs");
const ejsMate=require("ejs-mate");
const path=require("path");

app.use(session({secret:"secretcode" , resave:false , saveUninitialized:true}));

app.get("/register",(req,res)=>{
    let {name = "random"} = req.query;
    req.session.name=name;
    if(name==="random"){
        req.flash("error","some error ocuured");
    }else{
        req.flash("success","user registered succesfully");
    }
    res.redirect("/hello");
})
app.get("/hello",(req,res)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.render(__dirname+"/views/hello.ejs",{name:req.session.name});
}
)

app.get("/",(req,res)=>{
    res.send("hii this is root");
})

app.listen(3000,(req,res)=>{
    console.log("server is listening");
})