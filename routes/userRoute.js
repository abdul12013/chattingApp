require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const usersModel = require("../models/usermodel");
const router = express.Router();
const session = require("express-session");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const jwtTocken = require("../Handler/token");
const joi = require("joi");
const cloudinary = require("../Handler/cloud");
const islogging = require("../middlewere/user_isloggin");
const upload = require("../middlewere/fileupload");
const usermodel = require("../models/usermodel");
const cron = require('node-cron');

const chat=require("../models/messageModel")
// Ensure EXPIRE is a valid number
const expireTime = parseInt(process.env.EXPIRE) || 30; // Default to 30 if not set


// Scheduler setup
cron.schedule('*/25 * * * *', async () => {
    try {
      console.log("Cron job running...");
      const users = await usermodel.find({ otpexpire: { $lt: Date.now() }, otpVerifiy: false });
      console.log("Users found to be deleted:", users);
      const result = await usermodel.deleteMany({ otpexpire: { $lt: Date.now() }, otpVerifiy: false });
      console.log(`${result.deletedCount} unverified users deleted.`);
    } catch (error) {
      console.error('Error deleting users:', error);
    }
  });
  

// Your other routes and middleware...





router.get("/registerPage",(req,res)=>{
    res.render("register")
  })
  router.get("/otp",(req,res)=>{
    res.render("otp")
  })

  router.get("/chat",islogging, async(req,res)=>{
   user=await usermodel.findOne({email:req.user.email})
  alluser=await usermodel.find({email:{$nin:[req.user.email]}})
  console.log(alluser)   
    res.render("chat",{user:user,alluser:alluser})
})
router.post("/Registor", upload.single("file"), async (req, res) => {
try{
    console.log()
    if (!req.file) {
        return res.json({
            error: true,
            message: "not found",
            status: 500
        })
    }
else{
    const schema = joi.object({
        username: joi.string().required().min(4),
        email: joi.string().email().required(),
        password: joi.string().required().min(4).max(7)

            .pattern(new RegExp('[A-Z]'))
            .pattern(new RegExp('[a-z]'))
            .pattern(new RegExp('[0-9]'))
            .pattern(new RegExp('[!@#$%^&*(),.?":{}|<>]')),
            image: joi.string().required(),
    })
    const picon = req.file.path;
    cloudinary.uploader.upload(picon, async (err, result) => {
        if (err) {
            return res.json({
                error: true,
                message: err.message,
                status: 500
            })
        }
        else {
            let value = {
                username: req.body.username,
                email: req.body.email,
                password:req.body.password,
                image: result.secure_url,
                
            }
           
    const trans= nodemailer.createTransport({      
        host: "smtp.gmail.com",
        service:"gmail",
        auth: {
          type: "login", // default
          user: process.env.EMAIL, 
          pass: process.env.PASSWORD
        }
      });
    const results = schema.validate(value)
    console.log(results.value.image)
    let otp=crypto.randomInt(1000,10000)
    ; // Expires in 10 minutes

    const otpexpire = new Date(Date.now() +process.env.EXPIRE  * 60000);

    if (results.error) {
        res.status(505).send(results.error.details[0].message)
    }
    else {

        const user = await usersModel.findOne({ email: results.value.email })




        if (user) {
            res.send("this user is already exits")
        }
        else {

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(results.value.password, salt, async (err, hash) => {
                    try {
                        const createdUser = await usersModel.create({
                            username: results.value.username,
                            email: results.value.email,
                            password: hash,
                            image:results.value.image,
                            otp:otp,
                            otpexpire:otpexpire
                        })


                        // let token = jwtTocken(createdUser)

                        // res.cookie("token", token)
                        const mailOptions = {
                            from: process.env.EMAIL,
                            to: createdUser.email,
                            subject: 'Email Verification OTP',
                            html: `<p>Your OTP for verification is <strong>${otp}</strong>. It expires in 30 minutes.</p>`,
                          };
                      
                          await trans.sendMail(mailOptions);
                          res.redirect("/user/verifyotp")

                    }
                    catch (err) {
                        res.send(err.message)
                    }
                })
            })

        }


    }}})}
}
    catch(err){
        res.json(err.message)
    }
}
)

router.post("/verifyotp", async(req,res)=>{
    const { otp1, otp2, otp3, otp4 } = req.body;
  const otp = otp1 + otp2 + otp3 + otp4;
    console.log( otp)
    const user= await usersModel.findOne({otp})
    if(user){
        if(user.otpexpire<Date.now()){
            await user.deleteOne({ _id: user._id });
            return res.status(400).json({ message: 'OTP has expired. User account deleted.' });
        }
        else{
            res.redirect("/")
        }
        user.otpVerifiy=true
        user.otpexpire=null
        user.otp=null
       await  user.save()
    }
    else{
        res.json("invalid otp")
    }
})




router.post("/login", async (req, res) => {
    try{
    let { email, password } = req.body
    const user = await usersModel.findOne({ email: email })
    if (!user) { return res.status(500).send("something is wrong") }
    if(user.otpVerifiy){
        console.log(user)
    bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
            let token = jwtTocken(user)
            res.cookie("token", token)
          
           res.redirect("/user/chat")
        }
        else {
            res.json("wrong password")
        }
    })}
    else{
        res.json("email is not verified")
    }
}
    catch(err){
        res.json(err.message)
    }
})


            
           
            
       
   
    
   



router.get("/logout", (req, res) => {
    res.clearCookie("token")
    res.redirect("/")
})

// router.post("/savechat", async (req, res) => {
//     try {
//       const { sender_id, receiver_id, message } = req.body;
      
//       const newChat = await chat.create({
//         sender_id: sender_id,
//         receiver_id: receiver_id,
//         message: message
//       });
  
//       console.log(newChat);
  
//       res.status(200).json({success: true, msg: "Chat inserted", data: newChat});
//     } catch (err) {
//       res.status(400).json({success: false, msg: err.message});
//     }
//   });


  




module.exports = router

// 
