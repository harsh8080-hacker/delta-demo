const mongoose=require("mongoose");
const schema=mongoose.Schema;

const reviewSchema=new schema({
    comment:String,
    rating:Number,
    createdAt:{
        type:Date,
        default:Date.now()
    },
    author:{
        type:schema.Types.ObjectId,
        ref:"User",
    }
})

module.exports=mongoose.model("review",reviewSchema);