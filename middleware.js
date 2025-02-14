const listing=require("./models/listing.js");
const review=require("./models/reviews.js");
module.exports.loggedIn=(req,res,next)=>{
    if(!(req.isAuthenticated())){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","you must be logged in!");
        res.redirect("/login");
    }
    next();
}
module.exports.Redirecturl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner=async(req,res,next)=>{
    let {id}=req.params;
    let listingF=await listing.findById(id);
    if(res.locals.currUser &&  !res.locals.currUser._id.equals(listingF.owner)){
        req.flash("error","you are not  owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
}
module.exports.isAuthor=async(req,res,next)=>{
    let{id ,reviewId}=req.params;
    let reviewF=await review.findById(reviewId);
    if(res.locals.currUser && !reviewF.author.equals(res.locals.currUser._id)){
        req.flash("error","you are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}