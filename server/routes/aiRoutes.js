import express from 'express'
import multer from 'multer'
import path from 'path'
import { auth } from '../middleware/auth.js'
import { 
    generateArticle, 
    generateBlog,
    generateTitles, 
    generateImage, 
    uploadCreation,
    getCreations,
    getCommunity,
    togglePublish,
    toggleLike,
    deleteCreation
} from '../controllers/aiController.js'

const router = express.Router()

// Multer Disk Storage for local file saving
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
})
const fileUpload = multer({ storage: diskStorage })

// Test endpoint
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'AI API is working',
        availableEndpoints: [
            'GET /api/ai/creations - Fetch user creations',
            'GET /api/ai/community - Fetch public creations',
            'POST /api/ai/generate-blog - Generate full blog post',
            'POST /api/ai/generate-article - Generate an article',
            'POST /api/ai/generate-titles - Generate blog titles',
            'POST /api/ai/generate-image - Generate image via Pollinations',
            'POST /api/ai/upload-creation - Upload processed image',
            'POST /api/ai/creations/:id/publish - Toggle publish creation',
            'POST /api/ai/creations/:id/like - Toggle like on creation',
            'DELETE /api/ai/creations/:id - Delete a creation'
        ]
    })
})

// Database / Creations Routes
router.get('/creations', auth, getCreations)
router.get('/community', auth, getCommunity)
router.post('/creations/:id/publish', auth, togglePublish)
router.post('/creations/:id/like', auth, toggleLike)
router.delete('/creations/:id', auth, deleteCreation)

// AI Content Generation Routes
router.post('/generate-blog', auth, generateBlog)
router.post('/generate-article', auth, generateArticle)
router.post('/generate-titles', auth, generateTitles)
router.post('/generate-image', auth, generateImage)

// File/Image Processing Upload Routes
router.post('/upload-creation', auth, fileUpload.single('image'), uploadCreation)

export default router