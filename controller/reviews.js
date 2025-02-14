const listing=require("../models/listing.js");
const review=require("../models/reviews.js");
module.exports.createReview=async(req,res)=>{
    let result=await listing.findById(req.params.id);
    let newReview=new review(req.body.review);
    newReview.author=req.user._id;
    await newReview.save();
    result.reviews.push(newReview);
    await result.save();
    req.flash("success","New Review Created!");
    res.redirect(`/listings/${req.params.id}`);
}
module.exports.destroyReview=async(req,res)=>{
    let{id ,reviewId}=req.params;
    await listing.findByIdAndUpdate(id,{$pull :{reviews: reviewId}});
    await review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted!");
    res.redirect(`/listings/${id}`);
}