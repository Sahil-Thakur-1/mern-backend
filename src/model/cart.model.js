import mongoose, { Schema } from "mongoose";

const cartSchema = new Schema(
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
                    required: true,
                },
                quantity: {
                    type: Number,
                    default: 1,
                },
            },
        ],
        status: {
            type: String,
            enum: ['active', 'ordered'],
            default: 'active',
        },
    },
    { timestamps: true }
);




const Cart = mongoose.model('Cart', cartSchema);

export default Cart;