import express, { json } from "express";
import { User } from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'

class AuthController {

    async register(req, res) {
        try {
            const { email, password, userName } = req.body;

            const isExisting = await User.findOne({ email });
            if (isExisting) {
                return res.status(400).json({ success: false, message: "User is already registered" });
            }

            const newUser = new User({ userName, email, password, role: "user" });
            await newUser.save();

            return res.status(201).json({
                success: true, message: "user created successfully", user: {
                    role: newUser.role,
                    userName: newUser.userName,
                    email: newUser.email
                }
            });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async login(req, res) {
        try {
            const { loginCredential, password } = req.body;
            const isEmail = loginCredential.endsWith('@gmail.com');
            let isExisting;

            if (isEmail) {
                isExisting = await User.findOne({ email: loginCredential });
                if (!isExisting) {
                    return res.status(400).json({ success: false, message: "User is not registered" });
                }
            } else {
                isExisting = await User.findOne({ userName: loginCredential });
                if (!isExisting) {
                    return res.status(400).json({ success: false, message: "User is not registered" });
                }
            }
            const passwordCheck = await bcrypt.compare(password, isExisting.password);
            if (!passwordCheck) {
                return res.status(401).json({ success: false, message: "wrong Password" });
            }

            const { refreshToken, accessToken } = await this.generateToken(isExisting);

            await User.findByIdAndUpdate(isExisting._id, { refreshToken }, { new: true });

            res.clearCookie('refreshToken');
            return res.status(200).cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            }).json({
                success: true,
                message: "login successful",
                user: {
                    email: isExisting.email,
                    role: isExisting.role,
                    userName: isExisting.userName
                },
                accessToken: accessToken
            });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: error });
        }
    }


    async logout(req, res) {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            await User.updateOne({ email: user.email }, { $unset: { refreshToken: "" } });

            return res.status(200)
                .clearCookie('refreshToken', {
                    httpOnly: true,
                    secure: false,
                    sameSite: "strict",
                })
                .json({
                    success: true,
                    message: "User logged out successfully"
                });

        } catch (e) {
            return res.status(500).json({ success: false, message: e.message });
        }
    }


    async refresh(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;
            const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const user = await User.findOne({ _id: decode.userId });

            if (!user) {
                return res.status(400).json({ success: false, message: "user not found" });
            }

            console.log("old refresh Token", user.refreshToken);
            console.log("new refresh Token", refreshToken);

            if (user.refreshToken != refreshToken) {
                return res.status(400).json({ success: false, message: "Invalid Refresh Token" });
            }

            const { refreshToken: newRefreshToken, accessToken } = await this.generateToken(user);

            user.refreshToken = newRefreshToken;
            await user.save();

            console.log(user.role);

            res.clearCookie('refreshToken')
            return res.status(200).cookie('refreshToken', newRefreshToken,
                {
                    httpOnly: true,
                    secure: false,
                    sameSite: "strict",
                    maxAge: 7 * 24 * 60 * 60 * 1000
                }).json({
                    success: true,
                    message: "user verified",
                    user: {
                        userName: user.userName,
                        email: user.email,
                        role: user.role
                    },
                    accessToken: accessToken
                });
        }
        catch (e) {
            if (e.name === "TokenExpiredError") {
                return res.status(401).json({ success: false, message: "Access token expired" });
            } else if (e.name === "JsonWebTokenError") {
                return res.status(403).json({ success: false, message: `Token is invalid:${e}` });
            } else {
                return res.status(500).json({ success: false, message: e.message });
            }

        }
    }


    async generateToken(user) {
        try {
            const accessToken = jwt.sign(
                {
                    userId: user._id,
                    roles: user.role,
                    email: user.email
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
            );

            const refreshToken = jwt.sign(
                {
                    userId: user._id
                },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: process.env.REFRESH_TOKEN_EXPIRES }
            );

            return { accessToken, refreshToken };
        }
        catch (e) {
            console.log("error generating the token", e);
        }
    }


}



export const authController = new AuthController();