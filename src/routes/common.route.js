import express from 'express';
import { commonController } from '../controllers/common.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';


const commonRoute = express.Router();


commonRoute.get('/categories', authMiddleware, (req, res) => commonController.getCategories(req, res));
commonRoute.get('/products', authMiddleware, (req, res) => commonController.getProducts(req, res));


export default commonRoute;