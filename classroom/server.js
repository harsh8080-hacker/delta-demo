const express=require("express");
const app=express();
const session=require("express-session");

app.use(session({secret:"secretcode"}));

app.get("/tests",(req,res)=>{
    res.send("test success!");
})

app.listen(3000,(req,res)=>{
    res.send("server is listening!");
})
