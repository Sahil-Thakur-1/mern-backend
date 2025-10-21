import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        products: [
            {
                productId: {
                    type: mongoose.Types.ObjectId,
                    ref: 'Product',
                },
                name: { type: String, required: true },
                price: { type: Number, required: true },
                image: { type: String },
                quantity: { type: Number, default: 1 },
            },
        ],
        totalAmount: { type: Number, required: true },

        paymentMethod: {
            type: String,
            enum: ['cod', 'PayPal'],
            required: true,
        },

        paypalOrderId: {
            type: String,
            default: null,
        },

        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending',
        },
        orderStatus: {
            type: String,
            enum: ['processing', 'shipped', 'delivered', 'cancelled'],
            default: 'processing',
        },
        shippingAddress: {
            fullName: String,
            streetAddress: String,
            city: String,
            state: String,
            postalCode: String,
            country: String,
            phoneNumber: String,
        },
    },
    { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
