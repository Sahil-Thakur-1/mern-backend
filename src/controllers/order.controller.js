import axios from 'axios'
import Order from '../model/order.model.js';
import { Address } from '../model/address.model.js';
import Cart from '../model/cart.model.js';

const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com";

class OrderController {

    async createOrder(req, res) {
        try {

            const { amount, addressId, products, paymentMethod } = req.body;
            const user = req.user;

            if (!amount || !addressId || !products?.length || !paymentMethod) {
                return res.status(400).json({ success: false, message: "Missing required fields" });
            }

            const address = await Address.findById(addressId);
            if (!address) {
                return res.status(404).json({ success: false, message: "Address not found" });
            }

            let paypalOrderId = null;
            let approveUrl = null;
            let paymentStatus = 'pending';

            if (paymentMethod === 'PayPal') {
                const auth = Buffer.from(
                    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
                ).toString("base64");

                const paypalResponse = await axios.post(
                    `${PAYPAL_API_BASE}/v2/checkout/orders`,
                    {
                        "intent": "CAPTURE",
                        "purchase_units": [
                            {
                                "amount": {
                                    "currency_code": "USD",
                                    "value": amount
                                },
                                "shipping": {
                                    "address": {
                                        "admin_area_2": address.streetAddress,
                                        "admin_area_1": address.city,
                                        "postal_code": address.postalCode,
                                        "country_code": "IN"
                                    }
                                }
                            }
                        ],
                        "application_context": {
                            "brand_name": "UNICLUB",
                            "landing_page": "NO_PREFERENCE",
                            "user_action": "PAY_NOW",
                            "return_url": "http://localhost:5173/payment/success",
                            "cancel_url": "http://localhost:5173/payment/cancel"
                        }
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Basic ${auth}`,
                        },
                    }
                );

                paypalOrderId = paypalResponse.data.id;
                approveUrl = paypalResponse.data.links.find(link => link.rel === "approve")?.href;
            }

            const order = new Order({
                userId: user.userId,
                products: products,
                totalAmount: amount,
                paymentMethod,
                paypalOrderId,
                paymentStatus,
                shippingAddress: address,
            });

            await order.save();

            if (paymentMethod !== 'PayPal') {
                const cart = await Cart.findOne({ userId: user.userId, status: 'active' });
                if (cart) {
                    cart.status = 'ordered';
                    await cart.save();
                }
            }

            return res.status(200).json({
                success: true,
                message: "Order created successfully",
                order,
                approveUrl: approveUrl
            });
        } catch (e) {
            console.error("Order creation error:", e);
            res.status(500).json({ success: false, message: e.message });
        }
    }


    async verifyPayment(req, res) {
        const { token, payerId } = req.body;
        const user = req.user;

        try {
            const auth = await axios.post(
                `${PAYPAL_API_BASE}/v1/oauth2/token`,
                new URLSearchParams({ grant_type: "client_credentials" }),
                {
                    auth: {
                        username: process.env.PAYPAL_CLIENT_ID,
                        password: process.env.PAYPAL_CLIENT_SECRET,
                    },
                }
            );

            const accessToken = auth.data.access_token;

            console.log("access Token: ", accessToken);

            const capture = await axios.post(
                `${PAYPAL_API_BASE}/v2/checkout/orders/${token}/capture`,
                {},
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            const status = capture.data.status;

            if (status === "COMPLETED") {
                const order = await Order.findOne({ paypalOrderId: token });
                if (!order) {
                    return res.status(404).json({
                        success: false,
                        message: "Order not found",
                    });
                }
                order.paymentStatus = 'completed';
                await order.save();

                const cart = await Cart.findOne({ userId: user.userId, status: 'active' });
                if (cart) {
                    cart.status = 'ordered';
                    await cart.save();
                }

                return res.json({
                    success: true,
                    message: "Payment verified successfully",
                    order: capture.data,
                });
            } else {
                return res.json({
                    success: false,
                    message: `Payment not completed — current status: ${status}`,
                    order: capture.data,
                });
            }
        } catch (error) {
            console.error("PayPal verify error:", error.response?.data || error.message);
            return res.status(500).json({
                success: false,
                message: "Error verifying PayPal payment",
            });
        }
    };


    async fetchOrders(req, res) {
        try {
            const user = req.user;
            const orders = await Order.find({ userId: user.userId });
            return res.status(200).json({ success: true, orders: orders, message: "order fetched succesfully" })
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }


    async fetchAllOrders(req, res) {
        try {
            const user = req.user;
            if (user.roles !== 'admin') {
                res.status(404).json({ success: false, message: "Unauthorized" });
            }
            const orders = await Order.find();
            return res.status(200).json({ success: true, orders: orders, message: "order fetched succesfully" })
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

export const orderController = new OrderController();