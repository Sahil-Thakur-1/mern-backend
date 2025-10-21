import mongoose, { Schema } from "mongoose";

const categoySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        trim: true
    }
}, { timestamps: true });


export const Category = mongoose.model('Category', categoySchema);