import mongoose, {Schema} from "mongoose";

const subscriptionScema = new Schema({
    subsctiber : {
        type : Schema.Types.ObjectId, // One who is Subscribing
        ref : "User"
    },
    channel : {
        type : Schema.Types.ObjectId,
        ref : "User"
    }
},{timestamps:true})

export const Subscribe = mongoose.Model("Subscription",subscriptionScema)