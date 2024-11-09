// adminRoutes.js
import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { register, login, logout, update, deleteAdmin } from '../controllers/admin.controller.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require authentication)
router.post('/logout', authMiddleware, logout);
router.put('/update', authMiddleware, update);
router.delete('/delete', authMiddleware, deleteAdmin);

export default router;
