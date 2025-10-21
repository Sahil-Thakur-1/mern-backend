import express from 'express';
import adminController from '../controllers/admin.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import upload from '../middleware/multer.middleware.js';

const adminRoute = express.Router();

adminRoute.post('/addCategory', authMiddleware, (req, res) => adminController.addCategory(req, res));
adminRoute.post('/addProduct', authMiddleware, upload.single('image'), (req, res) => adminController.addProduct(req, res));
adminRoute.delete('/deleteProduct', authMiddleware, (req, res) => adminController.deleteProduct(req, res));
adminRoute.put('/editProduct', authMiddleware, upload.single('image'), (req, res) => adminController.editProduct(req, res));



export default adminRoute;