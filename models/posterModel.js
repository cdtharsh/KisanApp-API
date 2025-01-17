import mongoose from 'mongoose';

const posterSchema = new mongoose.Schema(
    {
        posterType: {
            type: String,
            required: true,
        },
        posterName: {
            type: String,
            required: true,
        },
        imageUrl: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

const Poster = mongoose.model('Poster', posterSchema);

export default Poster;
