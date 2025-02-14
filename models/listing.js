const mongoose=require("mongoose");
const schema=mongoose.Schema;
const review = require("./reviews.js");
const newListing=new schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    image:{
        url:String,
        filename:String,
    },
    price:{
        type:Number,
    },
    location:{
        type:String,
    },
    country:{
        type:String,
    },
    reviews:[
        {
            type:schema.Types.ObjectId,
            ref:"review",
        }
    ],
    owner:{
        type:schema.Types.ObjectId,
        ref:"User",
    },
    geometry:{
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
      category:{
        type:String,
        enum:["Trending","Rooms","Iconic cities","Mountains","Castles","Snow Veiws","Farms","Camping","Sports area","Safari","knowledge"]
      }
})
let listing=mongoose.model("listing",newListing);
module.exports=listing;
// not working 
newListing.post("findOneAndDelete",async(listing)=>{
    if(listing){
        await review.deleteMany({ _id: { $in: listing.reviews }});
    }
})