import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function connect() {
    try {
        mongoose.set('strictQuery', true);

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Database Connected');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
}

async function close() {
    try {
        await mongoose.disconnect();
        console.log('Database Disconnected');
    } catch (error) {
        console.error('Error disconnecting the database:', error);
    }
}

export default connect;
export { close };
