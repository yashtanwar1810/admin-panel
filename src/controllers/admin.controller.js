import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/admin.model.js';
import ApiError from '../utils/ApiError.js';
import AsyncHandler from '../utils/AsyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

export const registerAdmin = AsyncHandler(async (req, res, next) => {
    const { name, username, password } = req.body;

    // Validate required fields
    if (!name || !username || !password) {
        return next(new ApiError(400, "All fields are required"));
    }

    // Check if the username is already taken
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
        return next(new ApiError(409, "Username already taken"));
    }

    // Hash the password and create the new admin
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ name, username, password: hashedPassword });
    await newAdmin.save();

    res.status(201).json(new ApiResponse(201, "Admin registered successfully", newAdmin));
});

export const loginAdmin = AsyncHandler(async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return next(new ApiError(400, "Username and password are required"));
    }

    // Find the admin by username
    const admin = await Admin.findOne({ username });
    if (!admin) {
        return next(new ApiError(401, "Invalid credentials"));
    }

    // Check if the password is correct
    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
        return next(new ApiError(401, "Invalid credentials"));
    }

    // Generate JWT tokens
    const accessToken = jwt.sign({ _id: admin._id, username: admin.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign({ _id: admin._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });

    // Set access token in cookies
    res.cookie("accessToken", accessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production" });

    res.status(200).json(new ApiResponse(200, "Admin logged in successfully", { accessToken, refreshToken }));
});

export const logoutAdmin = AsyncHandler(async (req, res) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json(new ApiResponse(200, "Admin logged out successfully"));
});

export const updateAdmin = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name, username, password } = req.body;

    // Validate at least one field is provided
    if (!name && !username && !password) {
        return next(new ApiError(400, "At least one field is required to update"));
    }

    const updateData = {};

    if (name) updateData.name = name;
    if (username) updateData.username = username;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const updatedAdmin = await Admin.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updatedAdmin) {
        return next(new ApiError(404, "Admin not found"));
    }

    res.status(200).json(new ApiResponse(200, "Admin updated successfully", updatedAdmin));
});

export const deleteAdmin = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const deletedAdmin = await Admin.findByIdAndDelete(id);
    if (!deletedAdmin) {
        return next(new ApiError(404, "Admin not found"));
    }

    res.status(200).json(new ApiResponse(200, "Admin deleted successfully"));
});
