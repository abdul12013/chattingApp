
const dotenv=require("dotenv").config()
const jwt=require("jsonwebtoken")
const express=require("express")
const app=express()
const cookieParse=require("cookie-parser")


let islogged=(req,res,next)=>{
    
    if(!req.cookies.token)
    {
        res.redirect("/")
    }
    else{
       let data= jwt.verify(req.cookies.token,process.env.JWT_PRIVATE)
       req.user=data
       next()
    }
}
module.exports=islogged