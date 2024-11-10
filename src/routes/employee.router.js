import express from 'express';
import {
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getAllEmployees
} from '../controllers/employee.controller.js';
import { upload } from '../middleware/multer.middleware.js';

const router = express.Router();

router.post('/create',upload.single("avatar") , createEmployee);
router.put('/update/:id', updateEmployee);
router.delete('/delete/:id', deleteEmployee);
router.get('/all', getAllEmployees);

export default router;
