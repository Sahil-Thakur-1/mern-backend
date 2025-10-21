import express from 'express';
import { cartController } from '../controllers/cart.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const cartRoute = express.Router();

cartRoute.post('/addToCart', authMiddleware, (req, res) => cartController.addToCart(req, res));
cartRoute.post('/deleteFromCart', authMiddleware, (req, res) => cartController.deleteFromCart(req, res));
cartRoute.get('/fetchCart', authMiddleware, (req, res) => cartController.fetchCart(req, res));


export default cartRoute;