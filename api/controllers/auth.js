import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
             return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email: String(email).trim() });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered' });
        }

         const newUser = await User.create({
            username: String(username).trim(),
            email: String(email).trim(),
            password: String(password).trim(),
        });


        const token = jwt.sign(
            { id: newUser._id, username: newUser.username, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            user: {
                id: newUser._id,
                name: newUser.username,
                email: newUser.email,
            },
            token: token,
        });
    } catch (error) {
         if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map((err) => err.message);
             return res.status(400).json({ message: errors });
        }
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

         if (!email || !password) {
             return res.status(400).json({ message: 'Email and password are required' });
         }

        const user = await User.findOne({ email: String(email).trim() });
        if (!user) {
             return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(String(password).trim());
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );


        res.status(200).json({
            user: {
                id: user._id,
                name: user.username,
                email: user.email,
            },
            token: token,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

const verify = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.id || !decoded.username || !decoded.email) {
             return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(200).json({ id: decoded.id, username: decoded.username, email: decoded.email });

    } catch (error) {
         if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        console.error('Token verification error:', error);
        res.status(500).json({ message: 'Server error during token verification' });
    }
};

const logout = async (req, res) => {
    try {
        // No server side logic for logout as it is handled on the client side
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Server error during logout' });
    }
};

export { register, login, verify, logout };