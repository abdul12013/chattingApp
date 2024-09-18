require("dotenv").config()
const jwt=require("jsonwebtoken")


const jwtToken=(user)=>{
    return jwt.sign({email:user.email,userid: user._id},process.env.JWT_PRIVATE)
                        
                       
}
module.exports=jwtToken