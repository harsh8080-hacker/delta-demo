const express=require("express");
const router = express.Router({mergeParams:true});
const Wrapasync=require("../utils/wrapasync.js");
const ExpressError=require("../utils/ExpressError.js");
const listing=require("../models/listing.js");
const {listingSchema}=require("../schema.js");
const {reviewSchema}=require("../schema.js");
const review=require("../models/reviews.js");
const {loggedIn,isAuthor} = require("../middleware.js");
const reviewcontroller=require("../controller/reviews.js");
const validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        throw new ExpressError(400,error);
    }else{
        next();
    }
}
router.post("/", loggedIn,validateReview ,Wrapasync(reviewcontroller.createReview));

router.delete("/:reviewId",loggedIn,isAuthor,reviewcontroller.destroyReview);

module.exports=router;