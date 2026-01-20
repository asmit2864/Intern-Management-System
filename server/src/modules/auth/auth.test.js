const request = require('supertest');
const app = require('../../../app'); // We need to export app from server.js or app.js
const mongoose = require('mongoose');
const User = require('./user.model');

// MOCKING: Since we had issues with MongoMemoryServer environment, 
// AND this is an integration test involving Express + DB, 
// we have a choice: 
// 1. Mock Mongoose (Unit integration) 
// 2. Mock 'bcrypt' + 'User.findOne' (Controller unit test)
// 3. Try MongoMemoryServer again (might fail)
//
// Given previous failure, let's write a "Controller Integration Test" 
// that mocks the DB layer but tests the Express->Controller->Response flow.
// This ensures routes and middleware work without needing a heavy DB instance.

jest.mock('./user.model');
jest.mock('bcryptjs');
const bcrypt = require('bcryptjs');

describe('Auth API Integration Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/login', () => {

        it('should return 200 and set cookie for valid credentials', async () => {
            // Mock DB finding user
            const mockUser = {
                _id: 'userid123',
                email: 'test@example.com',
                password: 'hashedpassword',
                role: 'manager',
                comparePassword: jest.fn().mockResolvedValue(true)
            };
            User.findOne.mockResolvedValue(mockUser);

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('user');
            expect(res.body.user.email).toBe('test@example.com');
            // Check cookie
            const cookies = res.headers['set-cookie'];
            expect(cookies).toBeDefined();
            expect(cookies[0]).toMatch(/token=/);
            expect(cookies[0]).toMatch(/HttpOnly/);
        });

        it('should return 401 for non-existent user', async () => {
            User.findOne.mockResolvedValue(null);

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'wrong@example.com', password: 'password123' });

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error', 'Invalid credentials');
        });

        it('should return 401 for invalid password', async () => {
            const mockUser = {
                email: 'test@example.com',
                password: 'hashedpassword',
                comparePassword: jest.fn().mockResolvedValue(false)
            };
            User.findOne.mockResolvedValue(mockUser);

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'wrongpassword' });

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('error', 'Invalid credentials');
        });

        it('should return 400 if email or password missing', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com' }); // Missing password

            expect(res.statusCode).toBe(400);
        });
    });
});
