const mongoose=require("mongoose");
const initdata=require("./data.js");
const listing=require("../models/listing.js");

main().then(()=>{
    console.log("connected to db");
}).catch(err=>{
    console.log(err);
})
async function main(){
   await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust2');
}
const initDb = async function(){
    await listing.deleteMany({});
    initdata.data=initdata.data.map((obj)=>({
        ...obj,
        owner:"675e5cda908cf58f9d143048"}));
   await  listing.insertMany(initdata.data);
   console.log("data initialized");
}
initDb();