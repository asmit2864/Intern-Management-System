require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./modules/auth/user.model');

const MONGO_URI = process.env.MONGO_URI;

const seedAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        const adminEmail = 'adminextra@intern.com';
        const adminPassword = 'admin123extra';

        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('Admin user already exists. Skipping...');
        } else {
            const admin = new User({
                email: adminEmail,
                password: adminPassword,
                role: 'admin'
            });

            await admin.save();
            console.log('Admin user created successfully!');
            console.log('Email:', adminEmail);
            console.log('Password:', adminPassword);
        }

        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedAdmin();
