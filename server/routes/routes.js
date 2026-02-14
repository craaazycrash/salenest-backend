// const express = require("express");
// const routes = express.Router();
// const modelfile = require("../model/model");

// routes.get("/", (req,res)=>{
//     res.json("Welcome to MERN")
// })

// routes.post("/pushing", async (req,res) => {
//    try {
//         console.log("BODY RECEIVED:", req.body);

//         const pushingdata = new modelfile(req.body);
//         const saved = await pushingdata.save();

//         console.log("SAVED DATA:", saved);

//         res.json(saved)
//     } catch (error) {
//         console.log("ERROR:", error);    
//     }
// })

// routes.get("/getting", async (req,res) => {
//     try {
//         const gettingfromdb = await modelfile.find();
//         res.json(gettingfromdb)
//     } catch (error) {
//         console.log(error);
//     }
// })


// routes.put("/updating/:id", async (req,res) => {
//     try {
//         await modelfile.findByIdAndUpdate(req.params.id,req.body,{new:true});
//         res.json("Data updated")
//     } catch (error) {
//         console.log(error);       
//     }
// })

// routes.delete("/deleting/:id", async (req,res) => {
//     try {
//         await modelfile.findByIdAndDelete(req.params.id);
//         res.json("Data deleted")
//     } catch (error) {
//         console.log(error);       
//     }
// })


// module.exports = routes;