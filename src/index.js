// require('dotenv').config({path : './env'})
import dotenv from 'dotenv'
import connectDB from "./db/index.js"

dotenv.config({
    path : './env'
})

connectDB()



// Approch 1st to connect database 
/* 
import express from "express"
const app = express()
(async () => {
    try {
        await mongoos.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)      
        app.on("error",(error) => {
            console.log("Error ",error);
            throw error
        })  
        app.listen(process.env.PORT,() => {
            console.log(`App is listning on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.log("Error: ",error);
        throw error
    }
})()

*/