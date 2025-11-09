import multer from "multer"
import path from "path"

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Save files to ./public/temp folder
        cb(null, "./public/temp")
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
        cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
    }
})

// Filter to allow only image files
const fileFilter = (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error("Only image files are allowed"), false)
    }
}

// Create multer instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024  // 5MB max file size
    }
})

export default upload