import { verifyUser } from "../../../CLIENT/src/features/auth/authSlice.js";
import { Address } from "../model/address.model.js";
import { User } from "../model/user.model.js";

class ShopController {

    async addAddress(req, res) {
        try {
            const {
                name,
                phone,
                street,
                landmark,
                city,
                state,
                postalCode,
                country
            } = req.body;
            const user = req.user;

            if (!name || !phone || !street || !city || !state || !postalCode) {
                return res.status(400).json({ success: false, message: "All fields are required" });
            }
            const verified = await User.findById(user.userId);
            if (!verified) {
                return res.status(404).json({ success: false, message: "user not found" });

            }
            const isDefault = await Address.findOne({ userId: verified._id });
            const addressData = {
                fullName: name,
                phoneNumber: phone,
                streetAddress: street,
                landmark: landmark,
                city: city,
                state: state,
                postalCode: postalCode,
                country: country,
                userId: verified._id,
                isDefault: !isDefault ? true : false
            };
            const address = new Address(addressData);
            await address.save();
            return res.status(201).json({ success: true, address: address, message: "Address added succesfully" });
        }
        catch (e) {
            return res.status(500).json({ success: false, message: e.message });
        }
    }


    async editAddress(req, res) {
        try {
            const {
                name,
                phone,
                street,
                landmark,
                city,
                state,
                postalCode,
                country,
                addressId
            } = req.body;
            const user = req.user;
            if (addressId == null) {
                return res.status(400).json({ success: false, message: "Address Id are required" });
            }
            const verified = await User.findById(user.userId);
            if (!verified) {
                return res.status(404).json({ success: false, message: "user not found" });

            }
            const addressData = {
                fullName: name,
                phoneNumber: phone,
                streetAddress: street,
                landmark: landmark,
                city: city,
                state: state,
                postalCode: postalCode,
                country: country
            }
            const address = await Address.findOneAndUpdate(
                { _id: addressId, userId: verified._id },
                addressData,
                { new: true }
            );
            return res.status(200).json({ success: true, address: address, message: "Address updated succesfully" });
        }
        catch (e) {
            return res.status(500).json({ success: false, message: e.message });
        }
    }


    async deleteAddress(req, res) {
        try {
            const { addressId } = req.body;
            const user = req.user;
            if (addressId == null) {
                return res.status(400).json({ success: false, message: "Address Id are required" });
            }
            const verified = await User.findById(user.userId);
            if (!verified) {
                return res.status(404).json({ success: false, message: "user not found" });

            }
            const address = await Address.deleteOne({ _id: addressId });
            return res.status(200).json({ success: true, address: address, message: "Address deleted succesfully" });
        }
        catch (e) {
            return res.status(500).json({ success: false, message: e.message });
        }
    }

    async getAddresses(req, res) {
        try {
            const user = req.user;
            const verified = await User.findById(user.userId);
            if (!verified) {
                return res.status(404).json({ success: false, message: "user not found" });

            }
            const address = await Address.find({ userId: verified._id });
            res.status(200).json({ success: true, address: address, message: "address fetched successfully" });
        }
        catch (e) {
            return res.status(500).json({ success: false, message: e.message });
        }
    }
}

export const shopController = new ShopController();