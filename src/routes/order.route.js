import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js';
import { orderController } from '../controllers/order.controller.js';


const orderRoute = express.Router();

orderRoute.post('/create', authMiddleware, (req, res) => orderController.createOrder(req, res));
orderRoute.post('/verfiyPayment', authMiddleware, (req, res) => orderController.verifyPayment(req, res));
orderRoute.get('/get', authMiddleware, (req, res) => orderController.fetchOrders(req, res));
orderRoute.get('/getAll', authMiddleware, (req, res) => orderController.fetchAllOrders(req, res));


export default orderRoute;