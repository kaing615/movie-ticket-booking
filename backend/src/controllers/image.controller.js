import cloudinary from "../configs/cloudinary.js";
import Image from "../models/image.model.js";
export const uploadImages = async (req, res) => {
    try {
        console.log('Files received:', req.files);
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const images = req.files.map(file => file.path );
        const uploadedImages = [];
        for (let image of images) {
            const result = await cloudinary.uploader.upload(image);
            console.log('Uploaded to Cloudinary:', result);
            const newImage = new Image({
                url: result.secure_url,
                public_id: result.public_id
            });
            await newImage.save();
            uploadedImages.push(newImage);
        }
        res.status(200).json({ 
            message: 'Images uploaded successfully',
            data: uploadedImages});
    } catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({ 
            name: error.name, 
            message: error.message,
            stack: error.stack
        });
    }
}

export const getImages = async (req, res) => {
    try {
        const images = await Image.find().sort({ createdAt: -1 });
        res.status(200).json(images);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};