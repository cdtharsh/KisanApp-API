import mongoose from 'mongoose';
import validator from 'validator';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required."],
        unique: true,
        minlength: [3, "Username must be at least 3 characters long."],
        maxlength: [30, "Username cannot be more than 30 characters long."],
        match: [/^[a-zA-Z0-9]+$/, "Username can only contain letters and numbers."]
    },
    password: {
        type: String,
        required: [true, "Password is required."],
        minlength: [8, "Password must be at least 8 characters long."]
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: "Invalid email format."
        }
    },
    mobile: {
        type: String,
        required: [true, "Mobile number is required."],
        unique: true,
        validate: {
            validator: function (v) {
                return validator.isMobilePhone(v, 'any', { strictMode: true });
            },
            message: "Invalid mobile number format."
        }
    },
    firstName: {
        type: String,
        required: [true, "First name is required."],
        minlength: [1, "First name cannot be empty."],
        maxlength: [50, "First name cannot be more than 50 characters long."]
    },
    lastName: {
        type: String,
        maxlength: [50, "Last name cannot be more than 50 characters long."]
    },
    address: {
        type: String,
        maxlength: [200, "Address cannot be more than 200 characters long."]
    },
    profileImg: {
        type: String,
        validate: {
            validator: function (v) {
                return v ? validator.isURL(v) : true;
            },
            message: "Invalid URL format."
        }
    },
    location: {
        type: String,
        maxlength: [100, "Location cannot be more than 100 characters long."]
    },
    emailVerified: {
        type: Boolean,
        default: false
    }
});

const UserModel = mongoose.model('User', UserSchema);
export default UserModel;
