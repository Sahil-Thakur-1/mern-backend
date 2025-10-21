
import { Category } from "../model/category.model.js";
import { Product } from "../model/product.model.js";
import { User } from "../model/user.model.js";

class CommonController {
    async getCategories(req, res) {
        try {
            const user = req.user;
            const verified = await User.findById(user.userId);
            if (!verified) {
                return res.status(404).json({ success: false, message: "user not found" });
            }
            const categories = await Category.find();
            if (!categories) {
                return res.status(404).json({ success: false, messag: "No Categories found" });
            }
            return res.status(200).json({ sucess: true, categories: categories });
        }
        catch (e) {
            return res.status(500).json({ sucess: false, message: e.message });
        }
    }


    async getProducts(req, res) {
        try {
            const user = req.user;
            const verified = await User.findById(user.userId);
            if (!verified) {
                return res.status(404).json({ success: false, message: "user not found" });
            }
            const products = await Product.find();
            if (!products) {
                return res.status(404).json({ success: false, messag: "No Product found" });
            }
            return res.status(200).json({ sucess: true, products: products });
        }
        catch (e) {
            return res.status(500).json({ sucess: false, message: e.message });
        }
    }
}


export const commonController = new CommonController();