import userModel from "../models/userModel.js";

//add items to user cart 
const addToCart = async (req,res) => {
    try{
        let userData = await userModel.findById(req.userId);
        let cartData =  userData.cartData;
        if(!cartData[req.body.itemId])
            {
                cartData[req.body.itemId] = 1;
            }
        else{
            cartData[req.body.itemId] += 1;
        }
        await userModel.findByIdAndUpdate(req.userId,{cartData});
        res.json({success:true,message:"Item added to cart"})

    }catch(error){
        console.log(error);
        res.json({success:false,message:"Error in adding to cart"})
    }

}

//remove items from user cart
const removeFromCart = async (req,res) => {
    try{
        let userData = await userModel.findById(req.userId);
        let cartData = userData.cartData;

        if (cartData[req.body.itemId] && cartData[req.body.itemId] > 0) {
    cartData[req.body.itemId] -= 1;
     }

if (cartData[req.body.itemId] === 0) {
    delete cartData[req.body.itemId];
}

await userModel.findByIdAndUpdate(req.userId, { cartData });

res.json({ success: true, message: "Removed From Cart" });
    }catch(error){
        console.log(error);
        res.json({success:false,message:"Error in removing from cart"})
    }

}

//fetch user cart data 
const getCart = async (req,res) =>{
    try{
        let userData = await userModel.findById(req.userId);
        let cartData = userData.cartData;
        res.json({success:true, cartData})
    }catch(error){
        console.log(error);
        res.json({success:false,message:"Error in fetching cart data"})

    }
}

export {addToCart, removeFromCart, getCart}