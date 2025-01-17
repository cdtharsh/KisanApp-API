import Poster from '../models/posterModel.js';
import { uploadPosters } from '../upload/uploadPoster.js';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import e from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


dotenv.config();

export const getAllPosters = async (req, res) => {
    try {
        const posters = await Poster.find({});
        res.status(200).send({ msg: "Posters retrieved successfully", data: posters });
    }
    catch (error) {
        console.error("Error retrieving posters:", error);
        res.status(500).send({ error: "An error occurred. Please try again later." });
    }
};

export const getPosterById = async (req, res) => {
    try {
        const posterID = req.params.id;
        const poster = await Poster.findById(posterID);

        if (!poster) {
            return res.status(404).send({ error: "Poster not found." });
        }
        res.status(200).send({ msg: "Poster retrieved successfully", data: poster });
    }
    catch (error) {
        res.status(500).send({ error: "An error occurred. Please try again later." });
    }
}

export const createPoster = async (req, res) => {
    try {
        uploadPosters.single('img')(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    err.message = 'File size is too large. Maximum filesize is 5MB.';
                }
                console.log(`Add poster: ${err}`);
                return res.json({ error: err });
            } else if (err) {
                console.log(`Add poster: ${err}`);
                return res.json({ error: err });
            }
            const { posterName, posterType } = req.body;
            let imageUrl = 'no_url';
            if (req.file) {
                imageUrl = `http://api.${process.env.ROOT}/image/posters/${req.file.filename}`;
            }

            if (!posterName) {
                return res.status(400).json({ error: "Name is required." });
            }

            try {
                const newPoster = new Poster({
                    posterType: posterType,
                    posterName: posterName,
                    imageUrl: imageUrl,
                });
                await newPoster.save();
                res.status(200).send({ msg: "Poster created successfully." });
            } catch (error) {
                console.error("Error creating Poster:", error);
                res.status(500).json({ error: error.message });
            }
        });
    } catch (err) {
        console.log(`Error creating Poster: ${err.message}`);
        return res.status(500).json({ error: err.message });
    }
};

export const updatePoster = async (req, res) => {
    try {
        const posterID = req.params.id;

        // Handle file upload with multer
        uploadPosters.single('img')(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    err.message = 'File size is too large. Maximum filesize is 5MB.';
                }
                console.log(`Update poster: ${err.message}`);
                return res.status(400).json({ error: err.message });
            } else if (err) {
                console.log(`Update poster: ${err.message}`);
                return res.status(400).json({ error: err.message });
            }

            // Extract poster name and image URL from the request body
            const { posterName, posterType } = req.body;
            let imageUrl = req.body.image;

            // If a new image was uploaded, update the imageUrl
            if (req.file) {
                imageUrl = `http://api.${process.env.ROOT}/image/posters/${req.file.filename}`;
            }

            // Ensure that both the name and image URL are provided
            if (!posterName || !imageUrl || posterType) {
                return res.status(400).json({ error: "Type, Name and image are required." });
            }


            try {
                // Find the poster to retrieve the old image URL
                const poster = await Poster.findById(posterID);

                if (!poster) {
                    return res.status(404).json({ error: "Poster not found." });
                }

                // If a new image is uploaded, delete the old image file
                if (req.file && poster.imageUrl) {
                    const oldImageFileName = poster.imageUrl.split('/').pop(); // Extract filename from the URL

                    // Check if the old image file name is 'no_url'
                    if (oldImageFileName === 'no_url') {
                        console.log("No old image to delete.");
                    } else {
                        const oldImagePath = path.resolve(__dirname, '..', 'public', 'posters', oldImageFileName); // Use resolve to get the absolute path

                        // Log the resolved path to verify
                        console.log("Attempting to delete file at path:", oldImagePath);

                        fs.unlink(oldImagePath, (err) => {
                            if (err) {
                                console.log(`Failed to delete old image: ${err.message}`);
                            } else {
                                console.log(`Old image deleted: ${oldImagePath}`);
                            }
                        });
                    }
                }

                // Update the poster in the database
                const updatedPoster = await Poster.findByIdAndUpdate(posterID, { posterName, imageUrl }, { new: true });

                if (!updatedPoster) {
                    return res.status(404).json({ error: "Poster not found." });
                }

                // Send success response
                res.status(200).json({ msg: "Poster updated successfully.", updatedPoster });
            } catch (error) {
                console.error(`Error updating Poster: ${error.message}`);
                res.status(500).json({ error: "An error occurred. Please try again later." });
            }
        });
    } catch (error) {
        console.error(`Error in updatePoster: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

export const deletePoster = async (req, res) => {
    try {
        const posterID = req.params.id;

        // Get the image URL from the request body
        const { imageUrl } = req.body;

        console.log("Image URL:", imageUrl);

        // If no image URL is provided, don't delete the poster
        if (!imageUrl || typeof imageUrl !== 'string') {
            return res.status(400).json({ error: "Image URL is required to delete the poster and must be a valid string." });
        }

        // Extract the filename from the image URL
        const fileName = imageUrl.split('/').pop(); // Get the file name from the URL

        const imagePath = path.join(__dirname, '../public/posters', fileName);

        // Check if the file exists before attempting to delete
        if (!fs.existsSync(imagePath)) {
            console.log(`File not found: ${imagePath}`);
            return res.status(404).json({ error: "Image file not found, deletion aborted." });
        }

        // Delete the image file if it exists
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error(`Error deleting image: ${err.message}`);
                return res.status(500).json({ error: "Error deleting image file." });
            } else {
                console.log(`Image deleted: ${imagePath}`);
            }
        });

        // Find and delete the poster from the database
        const deletedPoster = await Poster.findByIdAndDelete(posterID);

        if (!deletedPoster) {
            return res.status(404).json({ error: "Poster not found." });
        }

        // Send success response
        res.status(200).json({ msg: "Poster deleted successfully." });
    } catch (error) {
        console.error(`Error deleting Poster: ${error.message}`);
        res.status(500).json({ error: "An error occurred. Please try again later." });
    }
};

