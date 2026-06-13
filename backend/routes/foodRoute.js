import express from 'express'
import { addFood, listFood, removeFood, updateFood } from '../controllers/foodController.js'
import multer from 'multer'
import fs from 'fs'
import os from 'os'
import path from 'path'

const foodRouter = express.Router()

// upload directory can be configured via env (UPLOAD_DIR)
// On serverless platforms (Vercel) prefer the system temp directory (os.tmpdir())
const defaultUploadDir = process.env.UPLOAD_DIR || (process.env.VERCEL ? os.tmpdir() : 'uploads')

// Ensure upload dir exists at runtime (works for local and temporary dirs)
const ensureDir = (dir) => {
    try {
        fs.mkdirSync(dir, { recursive: true })
    } catch (err) {
        // ignore - if it fails, multer will surface an error
    }
}

// Multer storage: use a function destination so we can create the directory
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = process.env.UPLOAD_DIR || (process.env.VERCEL ? os.tmpdir() : 'uploads')
        ensureDir(uploadDir)
        cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
        const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`
        cb(null, safeName)
    }
})

const upload = multer({ storage })

foodRouter.post('/add', upload.single('image'), addFood)
foodRouter.get('/list', listFood)
foodRouter.post('/remove', removeFood)
// update route (keeps same verb-based naming as other routes)
foodRouter.put('/update/:id', upload.single('image'), updateFood)

export default foodRouter