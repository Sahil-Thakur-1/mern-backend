import mongoose from "mongoose";

export async function connectDb() {
    try {
        await mongoose.connect(process.env.Mongo_db_url);
        console.log("MongoDb connected")
    } catch (error) {
        console.log(error);
    }
}
