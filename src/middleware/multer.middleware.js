import multer from "multer";
import path from "path";

// Configure multer storage to save files in ./public/temp with unique filenames
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp"); // Save files in the public/temp directory
    },
    filename: function (req, file, cb) {
        // Append a timestamp to the original file name to ensure uniqueness
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Create the multer upload middleware
export const upload = multer({ storage });
