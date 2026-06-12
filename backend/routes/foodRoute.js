import express from 'express'
import { addFood, listFood, removeFood, updateFood } from '../controllers/foodController.js'
import multer from 'multer'

const foodRouter = express.Router()

// Image storage engine
const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`)
    }
})
const upload = multer({ storage: storage })

foodRouter.post('/add', upload.single('image'), addFood)
foodRouter.get('/list', listFood)
foodRouter.post('/remove', removeFood)
// update route (keeps same verb-based naming as other routes)
foodRouter.put('/update/:id', upload.single('image'), updateFood)

export default foodRouter