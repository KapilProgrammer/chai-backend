import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDNERY_CLOUD_NAME, 
    api_key: process.env.CLOUDNERY_API_KEY, 
    api_secret: process.env.CLOUDNERY_API_SECRATE // Click 'View API Keys' above to copy your API secret
});

const uplodeFilePath = async(localFilePath) => {
    try {
        if(!localFilePath) return null;
        const responce = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        console.log("File has been uplodated successfully",responce.url);
        return responce;
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved tempry file as the uploded operation get failed
        return null;
    }
}

export {uplodeFilePath}

// const uploadResult = await cloudinary.uploader
//       .upload(
//           'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//               public_id: 'shoes',
//           }
//       )
//       .catch((error) => {
//           console.log(error);
//       });

