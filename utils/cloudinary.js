import {v2 as cloudinary} from 'cloudinary';
import { configDotenv } from "dotenv";
import fs from 'fs'

configDotenv()

let {CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET} = process.env

cloudinary.config({ 
    cloud_name: CLOUDINARY_NAME, 
    api_key: CLOUDINARY_KEY, 
    api_secret: CLOUDINARY_SECRET
});   

const cloudUploadImage = async (file, folderName) => {
    try {
        const data = await cloudinary.uploader.upload(file, {
            resource_type: 'auto',
            folder: folderName,
        })
        return data
    } catch (error) {
        console.log(file);
        fs.unlinkSync(file)
        throw new Error('error from cloudinary')
    }
}

const cloudRemoveImage = async (id) => {
    try {
        const result = await cloudinary.uploader.destroy(id);
        return result
    } catch (error) {
        throw new Error('error from cloudinary')
    }
} 

export {cloudUploadImage, cloudRemoveImage}
