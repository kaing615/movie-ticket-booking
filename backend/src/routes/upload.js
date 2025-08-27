import {Router} from 'express';
import { uploadImages } from '../controllers/image.controller.js';
import cloudinary from '../configs/cloudinary.js';
import { CloudinaryStorage } from '@fluidjs/multer-cloudinary';
import multer from 'multer';
const routerImages = Router();

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads',
        format: 'jpg', // supports promises as well
    }
})

const upload = multer({storage: storage});

routerImages.post('/upload', upload.array("images", 10), uploadImages);

export default routerImages;