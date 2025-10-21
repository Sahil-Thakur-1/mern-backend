import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({
    path: './.env',
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD,
    api_key: process.env.CLOUDINARY_API,
    api_secret: process.env.CLOUDINARY_API_SCERET
});

export async function uploadImage(filePathOrBuffer) {
    try {
        const result = await cloudinary.v2.uploader.upload(filePathOrBuffer, {
            folder: 'products',
        });

        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
}


export function deleteLocalFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log("Deleted local file:", filePath);
        } else {
            console.log("File not found:", filePath);
        }
    } catch (err) {
        console.error("Error deleting local file:", err.message);
    }
}