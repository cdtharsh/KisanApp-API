import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true }
});

const TokenModel = mongoose.model('Token', tokenSchema);

export default TokenModel;