require('dotenv').config();
const cloudinary = require('cloudinary').v2

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key:  process.env.CLOUDINARY_KEY, 
    api_secret:process.env.CLOUDINARY_SECRATE // Click 'View Credentials' below to copy your API secret
});

module.exports=cloudinary;