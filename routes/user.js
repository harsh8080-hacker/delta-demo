const express=require("express");
const router = express.Router();
 const ejs=require("ejs");
 const path=require("path");
 const ejsMate=require("ejs-mate");
 const usercontroller=require("../controller/user.js");
router.get("/signup",usercontroller.signup);
module.exports=router;