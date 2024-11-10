import { Employee } from '../models/employee.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import ApiError from '../utils/ApiError.js';
import AsyncHandler from '../utils/AsyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Create a New Employee
 */
export const createEmployee = AsyncHandler(async (req, res, next) => {
    const { name, email, mobile, designation, gender, course } = req.body;
    const localFilePath = req.file ? req.file.path : null;

    if (!name || !email || !mobile || !designation || !gender || !course || !localFilePath) {
        return next(new ApiError(400, "All fields are required, including avatar"));
    }

    const uploadResult = await uploadOnCloudinary(localFilePath);
    if (!uploadResult) {
        return next(new ApiError(500, "Failed to upload avatar"));
    }

    const newEmployee = new Employee({
        name,
        email,
        mobile,
        designation,
        gender,
        course,
        avatar: uploadResult.url
    });

    await newEmployee.save();
    res.status(201).json(new ApiResponse(201, "Employee created successfully", newEmployee));
});

/**
 * Update an Employee by ID
 */
export const updateEmployee = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name, email, mobile, designation, gender, course } = req.body;
    const localFilePath = req.file ? req.file.path : null;

    if (!name && !email && !mobile && !designation && !gender && !course && !localFilePath) {
        return next(new ApiError(400, "At least one field or avatar is required to update"));
    }

    const updateData = { name, email, mobile, designation, gender, course };

    if (localFilePath) {
        const uploadResult = await uploadOnCloudinary(localFilePath);
        if (!uploadResult) {
            return next(new ApiError(500, "Failed to upload new avatar"));
        }
        updateData.avatar = uploadResult.url;
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!updatedEmployee) {
        return next(new ApiError(404, "Employee not found"));
    }

    res.status(200).json(new ApiResponse(200, "Employee updated successfully", updatedEmployee));
});

/**
 * Delete an Employee by ID
 */
export const deleteEmployee = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const deletedEmployee = await Employee.findByIdAndDelete(id);
    if (!deletedEmployee) {
        return next(new ApiError(404, "Employee not found"));
    }

    res.status(200).json(new ApiResponse(200, "Employee deleted successfully"));
});

/**
 * Get All Employees
 */
export const getAllEmployees = AsyncHandler(async (req, res, next) => {
    const employees = await Employee.find();
    res.status(200).json(new ApiResponse(200, "Employees retrieved successfully", employees));
});
