// adminRoutes.js
import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { registerAdmin, loginAdmin, logoutAdmin, updateAdmin, deleteAdmin } from '../controllers/admin.controller.js';

const router = express.Router();

// Public routes
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// Protected routes (require authentication)
router.post('/logout', authMiddleware, logoutAdmin);
router.put('/update', authMiddleware, updateAdmin);
router.delete('/delete', authMiddleware, deleteAdmin);

export default router;
