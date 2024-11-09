import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.model.js"; // Make sure this path is correct

// Helper function to validate required fields
const validateFields = (requiredFields, body) => {
  for (const field of requiredFields) {
    if (!body[field]) {
      return `Field '${field}' is required.`;
    }
  }
  return null;
};


//   Register Controller
//   Allows a new admin to register
//   Public route
export const register = async (req, res) => {
  const requiredFields = ["name", "username", "password"];
  const validationError = validateFields(requiredFields, req.body);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const { name, username, password } = req.body;

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    const newAdmin = new Admin({ name, username, password });
    await newAdmin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering admin", error: error.message });
  }
};


/**
 * Login Controller
 * Logs in an admin and sets access and refresh tokens in HTTP-only cookies
 * Public route
 */
export const login = async (req, res) => {
  const requiredFields = ["username", "password"];
  const validationError = validateFields(requiredFields, req.body);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isPasswordCorrect = await admin.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Generate tokens
    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();

    // Set cookies with tokens
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes for access token
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for refresh token
    });

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

/**
 * Logout Controller
 * Logs out an admin by clearing the access and refresh tokens in cookies
 * Protected route (requires authMiddleware)
 */
export const logout = async (req, res) => {
  try {
    res.cookie("accessToken", "", { maxAge: 0, httpOnly: true });
    res.cookie("refreshToken", "", { maxAge: 0, httpOnly: true });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging out", error: error.message });
  }
};

/**
 * Update Controller
 * Updates the admin's information (name or password)
 * Protected route (requires authMiddleware)
 */
export const update = async (req, res) => {
  const updatableFields = ["name", "password"];
  const hasUpdatableField = updatableFields.some((field) => req.body[field]);

  if (!hasUpdatableField) {
    return res
      .status(400)
      .json({
        message:
          "At least one field ('name' or 'password') is required to update",
      });
  }

  try {
    const { name, password } = req.body;

    const admin = await Admin.findById(req.adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (name) admin.name = name;
    if (password) admin.password = await bcrypt.hash(password, 10);

    await admin.save();
    res.status(200).json({ message: "Admin updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating admin", error: error.message });
  }
};


//   Delete Controller
//   Deletes the admin account
//   Protected route (requires authMiddleware)
 
export const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting admin", error: error.message });
  }
};
