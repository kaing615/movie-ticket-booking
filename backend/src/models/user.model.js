import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    userName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['customer', 'admin', 'theater-manager'],
        default: 'customer',
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },  
    verifyKey: {
        type: String,
        default: null,
    },
    verifyKeyExpires: {
        type: Date,
        default: null,
    },
    resetToken: {
        type: String,
        default: null,
    },
    resetTokenExpires: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

export default mongoose.model('User', userSchema);