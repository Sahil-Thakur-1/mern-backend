import mongoose from "mongoose";
const { Schema } = mongoose;
import bcrypt from 'bcryptjs'

const userSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        requied: true,
        trim: true
    },
    refreshToken: {
        type: String,
        trim: true
    }
}, { timestamps: true })

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }
    catch (e) {
        console.log("saving error", e);
        next(error);
    }
})

export const User = mongoose.model('User', userSchema);