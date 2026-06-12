import foodModel from "../models/foodModel.js";
import fs from 'fs'

//add food item
const addFood = async (req,res)=>{
    let image_filename = `${req.file.filename}`;

    const food = new foodModel({
        name:req.body.name,
        description:req.body.description,
        price:req.body.price,
        category:req.body.category,
        image:image_filename
    })
    try{
        await food.save();
        res.json({success:true,message:"Food Added"})
    } catch (error) {
        console.log(error);  
        res.json({success:false,message:"Error Adding Food"})

    }
}

//all food list
const listFood = async(req , res)=>{
   try{
        const foods = await foodModel.find({});
        res.json({success:true,data:foods})
   }catch(error){
        console.log(error);
        res.json({success:false,message:"Error fetching food items"})
   }
}

//remove food item 
const removeFood = async(req,res)=>{
   try{
        const food = await foodModel.findById(req.body.id);
        fs.unlink(`uploads/${food.image}`,()=>{});
        await foodModel.findByIdAndDelete(req.body.id);
        res.json({success:true,message:"Food removed"})
   }catch(error){
        console.log(error);
        res.json({success:false,message:"Error removing food item"})
   }
}

// update food item
const updateFood = async (req, res) => {
    try {
        const id = req.params.id;
        const food = await foodModel.findById(id);
        if (!food) return res.status(404).json({ success: false, message: 'Food not found' });

        // if new image uploaded, remove old and set new filename
        if (req.file && req.file.filename) {
            try { fs.unlinkSync(`uploads/${food.image}`); } catch (e) {}
            food.image = req.file.filename;
        }

        // update fields if provided
        if (req.body.name !== undefined) food.name = req.body.name;
        if (req.body.description !== undefined) food.description = req.body.description;
        if (req.body.price !== undefined) food.price = req.body.price;
        if (req.body.category !== undefined) food.category = req.body.category;

        await food.save();
        res.json({ success: true, message: 'Food updated' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Error updating food item' });
    }
}
export { addFood, listFood, removeFood, updateFood }