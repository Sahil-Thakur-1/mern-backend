import Cart from "../model/cart.model.js";
import { User } from "../model/user.model.js";

class CartController {
    async addToCart(req, res) {
        try {
            const user = req.user;
            const { productId, quantity } = req.body;

            if (!productId || !quantity) {
                return res.status(400).json({ success: false, message: "Invalid request" });
            }

            const verified = await User.findById(user.userId);
            if (!verified) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            // Find active cart or create one
            let cart = await Cart.findOne({ userId: verified._id, status: "active" });

            if (!cart) {
                cart = new Cart({
                    userId: verified._id,
                    products: [{ productId, quantity }],
                });
            } else {
                const productIndex = cart.products.findIndex(
                    (item) => item.productId.toString() === productId
                );

                if (productIndex > -1) {
                    cart.products[productIndex].quantity += quantity;
                } else {
                    cart.products.push({ productId, quantity });
                }
            }

            await cart.save();

            // Populate product details just like in fetchCart
            await cart.populate({
                path: "products.productId",
                select: "name price image",
            });

            // Format cart like fetchCart
            let newCart = { products: [], totalAmount: null };

            cart.products.forEach((item) => {
                newCart.products.push({
                    productId: String(item.productId._id),
                    name: item.productId.name,
                    image: item.productId.image,
                    price: item.productId.price,
                    quantity: item.quantity,
                });
            });

            const totalAmount = cart.products.reduce((acc, item) => {
                const price = item.productId?.price || 0;
                return acc + price * item.quantity;
            }, 0);

            newCart.totalAmount = totalAmount;

            return res.status(200).json({
                success: true,
                message: "Product added to cart successfully",
                cart: newCart,
            });

        } catch (e) {
            return res.status(500).json({ success: false, message: e.message });
        }
    }



    async deleteFromCart(req, res) {
        try {
            const user = req.user;
            const { productId, quantity } = req.body;

            if (!productId) {
                return res.status(400).json({ success: false, message: "Product ID is required" });
            }

            const verified = await User.findById(user.userId);
            if (!verified) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            const cart = await Cart.findOne({ userId: verified._id, status: 'active' });

            if (!cart) {
                return res.status(404).json({ success: false, message: "Cart not found" });
            }

            const productIndex = cart.products.findIndex(
                (item) => item.productId.toString() === productId
            );

            if (productIndex === -1) {
                return res.status(404).json({ success: false, message: "Product not found in cart" });
            }

            if (quantity && cart.products[productIndex].quantity > quantity) {
                cart.products[productIndex].quantity -= quantity;
            } else {
                cart.products.splice(productIndex, 1);
            }

            await cart.save();

            return res.status(200).json({
                success: true,
                message: "Product removed successfully",
            });

        } catch (e) {
            return res.status(500).json({ success: false, message: e.message });
        }
    }


    async fetchCart(req, res) {
        try {
            const user = req.user;

            const verified = await User.findById(user.userId);
            if (!verified) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            const cart = await Cart.findOne({ userId: verified._id, status: 'active' })
                .populate({
                    path: "products.productId",
                    select: "name price image",
                });

            let newCart = { products: [], totalAmount: null };

            if (cart && cart.products.length > 0) {
                cart.products.forEach((item) => {
                    newCart.products.push({
                        productId: String(item.productId._id),
                        name: item.productId.name,
                        image: item.productId.image,
                        price: item.productId.price,
                        quantity: item.quantity,
                    });
                });
            }


            if (!cart || cart.products.length === 0) {
                return res.status(200).json({ success: true, message: "Cart is empty", cart: { products: [], totalAmount: 0 } });
            }

            const totalAmount = cart.products.reduce((acc, item) => {
                const price = item.productId?.price || 0;
                return acc + price * item.quantity;
            }, 0);

            newCart.totalAmount = totalAmount;

            return res.status(200).json({
                success: true,
                message: "Active cart fetched successfully",
                cart: newCart
            });

        } catch (e) {
            return res.status(500).json({ success: false, message: e.message });
        }
    }


}


export const cartController = new CartController();