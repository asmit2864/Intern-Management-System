const User = require('./user.model');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    role: z.enum(['admin', 'manager']).optional(),
});

exports.register = async (req, res) => {
    try {
        const validation = registerSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validation.error.issues.map(e => e.message)
            });
        }

        const { email, password, role } = validation.data;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const user = new User({
            email,
            password,
            role: role || 'manager'
        });

        await user.save();

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                _id: user._id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        // 1. Validation with Zod
        const validation = loginSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validation.error.issues.map(e => e.message)
            });
        }

        const { email, password } = validation.data;

        // 2. Find User
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // 3. Compare Password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // 4. Generate Token
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('JWT_SECRET is not defined in environment variables');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            secret,
            { expiresIn: '24h' }
        );

        // 5. Set Cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // true in prod
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // 6. Response
        res.status(200).json({
            message: 'Login successful',
            user: {
                _id: user._id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error full:', error);
        res.status(500).json({ error: 'Server error', message: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        // req.user is already populated by the protect middleware
        res.status(200).json({
            user: {
                _id: req.user._id,
                email: req.user.email,
                role: req.user.role
            }
        });
    } catch (error) {
        console.error('getMe error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

const resetPasswordSchema = z.object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
});

exports.resetPassword = async (req, res) => {
    try {
        const { id } = req.params;

        // Validation
        const validation = resetPasswordSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validation.error.issues.map(e => e.message)
            });
        }

        const { newPassword } = validation.data;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update password (pre-save hook will handle hashing)
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
