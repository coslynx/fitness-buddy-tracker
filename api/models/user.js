import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        validate: {
           validator: (username) => username.trim().length > 0,
           message: 'Username cannot be empty',
        }
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: (email) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email),
            message: 'Invalid email address',
        },
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
         validate: {
           validator: (password) => password.length >= 6,
            message: 'Password must be at least 6 characters long',
        },
    },
}, { timestamps: true });


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});


userSchema.index({ email: 1 });


userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
       throw new Error(`Password comparison failed: ${error.message}`);
    }
};



const User = mongoose.model('User', userSchema);

export default User;