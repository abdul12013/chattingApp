
const mongoose=require("mongoose")



const userSchema=mongoose.Schema({
    username:{
        type: String,
        trim:true,
        required:true
    },
    email:{
        type: String,
        trim:true,
        required:true
    },
    password:{
        type: String,
        trim:true,
        required:true
    },
    image:{
        type:String,
        required:true
     },
     is_online:{
        type:String,
        default:'0'
     },

    otp:{
        type:String
    },


    otpexpire:{
        type:Date
    },
    otpVerifiy:{
        type:Boolean,
        default:false
    }
    
 

  

},
{timestamps:true}
)

module.exports=mongoose.model("usermodel",userSchema)