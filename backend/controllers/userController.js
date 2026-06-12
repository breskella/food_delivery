import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";

// register user
const registerUser = async (req, res) => {
   const {name, email, password} = req.body;
   try{
        // checking is user already exists
        const exists = await userModel.findOne({email});
          if(exists){
            return res.json({success:false, message:"User already exists"})
          }

        // validating email format & strong password
          if(!validator.isEmail(email)){
            return res.json({success:false, message:"Invalid email format"})
            }

            if(!validator.isLength(password, {min:6})){
               return res.json({success:false, message:"Password must be at least 6 characters long"})
            }

            //hashing user password
            const slat = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, slat);

            // creating new user
             const newUser = new userModel({
                name:name,
                email:email,
                password:hashedPassword
        })

        const user = await newUser.save();
        const token = createToken(user._id);
        res.json({success:true, message:"User registered successfully", token});
   }catch(error){
        console.log(error);
        res.json({success:false, message:"Error in registering user"})
   }
}

// login user
const loginUser = async (req, res) => {
    const {email, password} = req.body;
    try{
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success:false, message:"User not found"})
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.json({success:false, message:"Invalid credentials"})
        }

        const token = createToken(user._id);
        res.json({success:true, message:"User logged in successfully", token});
        
    }catch(error){
        console.log(error);
        res.json({success:false, message:"Error in logging in user"})
    }
}

const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET)
}

export {registerUser, loginUser}