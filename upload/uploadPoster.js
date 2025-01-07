import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define storage settings for poster uploads
const storagePoster = multer.diskStorage({
    destination: function (req, file, cb) {
        // Use an adaptive path for the destination
        const destinationPath = path.join(__dirname, '../public/posters');
        cb(null, destinationPath); // Dynamically resolve the destination directory
    },
    filename: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/; // Allowed file extensions
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (extname) {
            cb(null, Date.now() + "_" + file.originalname); // Set a unique filename
        } else {
            cb(new Error("Only .jpeg, .jpg, and .png files are allowed!"));
        }
    }
});

// Create the multer instance with storage and file size limit
const uploadPosters = multer({
    storage: storagePoster,
    limits: {
        fileSize: 1024 * 1024 * 5 // Limit filesize to 5MB
    }
});

// Export the configured multer instance
export { uploadPosters };
