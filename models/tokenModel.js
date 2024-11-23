import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    token: { type: String, required: true },
    tokenType: { type: String, enum: ['emailVerification', 'passwordReset', 'login'], required: true },
    expiresAt: { type: Date, required: true },
    attemptCount: { type: Number, default: 0 }, // Track the number of attempts
    lastAttempt: { type: Date } // Timestamp of the last attempt
}, { timestamps: true });

const TokenModel = mongoose.model('Token', tokenSchema);
export default TokenModel;
