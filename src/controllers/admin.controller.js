import { User } from "../model/user.model.js";
import { Product } from "../model/product.model.js";
import { Category } from "../model/category.model.js";
import { deleteLocalFile, uploadImage } from "../config/cloudinary.js";

class AdminController {

    async addCategory(req, res) {
        try {
            const user = req.user;
            const { categoryData } = req.body;
            const verified = await User.findById(user.userId);
            if (!verified) {
                return res.status(404).json({ success: false, message: "user not found" });
            }
            if (verified.role !== 'admin') {
                return res.status(403).json({ success: false, message: "Acess Denied" });
            }
            const category = await Category.create(categoryData);
            if (!category) {
                return res.status(500).json({ success: false, message: "Unable to add the Category" });
            }
            return res.status(201).json({ success: true, message: "Category added successfully", category: category });
        }
        catch (e) {
            return res.status(500).json({ success: false, message: e.message });
        }
    }


    async addProduct(req, res) {
        try {
            const user = req.user;
            const { productData } = req.body;
            const createProduct = JSON.parse(productData);
            const image = req.file;
            const verified = await User.findById(user.userId);
            if (!verified) {
                return res.status(404).json({ success: false, message: "user not found" });
            }
            if (verified.role !== 'admin') {
                return res.status(403).json({ success: false, message: "Acess Denied" });
            }

            if (image) {
                const imageUrl = await uploadImage(image.path);
                if (imageUrl) {
                    createProduct.image = imageUrl;
                }
                deleteLocalFile(image.path);
            }

            const product = await Product.create(createProduct);
            if (!product) {
                return res.status(500).json({ success: false, message: "Unable to add the product" });
            }

            return res.status(201).json({ success: true, message: "Product added successfully", product: product });

        }
        catch (e) {
            console.log(e);
            return res.status(500).json({ success: false, message: e.message });
        }
    }


    async deleteProduct(req, res) {
        try {
            const user = req.user;
            const { productId } = req.body;
            const verified = await User.findById(user.userId);
            if (!verified) {
                return res.status(404).json({ success: false, message: "user not found" });
            }
            if (verified.role !== 'admin') {
                return res.status(403).json({ success: false, message: "Acess Denied" });
            }

            const result = await Product.deleteOne({ _id: productId });
            if (result.deletedCount === 0) {
                return res.status(500).json({ success: false, message: "Unable to delete the product" });
            }

            return res.status(201).json({ success: true, message: "Product deleted successfully" });

        }
        catch (e) {
            return res.status(500).json({ success: false, message: e.message });
        }
    }


    async editProduct(req, res) {
        try {
            const user = req.user;
            const { productId, productData } = req.body;
            const createProduct = JSON.parse(productData);
            const image = req.file;
            const verified = await User.findById(user.userId);
            if (!verified) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
            if (verified.role !== 'admin') {
                return res.status(403).json({ success: false, message: "Access Denied" });
            }

            if (image) {
                const imageUrl = await uploadImage(image.path);
                console.log(imageUrl);
                if (imageUrl) {
                    createProduct.image = imageUrl;
                }
                deleteLocalFile(image.path);
            }

            const result = await Product.updateOne(
                { _id: productId },
                { $set: createProduct },
                { new: true }
            );

            if (!result) {
                return res.status(404).json({ success: false, message: "Product not found" });
            }
            // if (result.modifiedCount === 0) {
            //     return res.status(200).json({ success: true, message: "No changes made to the product" });
            // }

            return res.status(200).json({ success: true, message: "Product updated successfully", product: result });

        } catch (e) {
            console.log(e);
            return res.status(500).json({ success: false, message: e.message });
        }
    }
}


const adminController = new AdminController();


export default adminController;