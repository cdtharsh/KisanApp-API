import TokenModel from "../models/tokenModel.js";

export async function cleanUpExpiredTokens() {
    try {
        await TokenModel.deleteMany({ expiresAt: { $lt: new Date() } });
    } catch (error) {
        console.error("Token Cleanup Error:", error);
    }
}
