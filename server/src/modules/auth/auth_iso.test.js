const request = require('supertest');
const app = require('../../app');
const User = require('./user.model');

jest.mock('./user.model');
jest.mock('bcryptjs');

describe('Auth API Integration Tests (Isolated)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('smoke test - should pass', () => {
        expect(true).toBe(true);
    });

    // Uncommenting this one to see if request(app) crashes
    it('should return 400 if email or password missing', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com' });
        expect(res.statusCode).toBe(400);
    });

    describe('GET /api/auth/me', () => {
        it('should return 401 if no token cookie is provided', async () => {
            const res = await request(app).get('/api/auth/me');
            expect(res.statusCode).toBe(401);
            expect(res.body.error).toBeDefined();
        });
    });
    describe('PATCH /api/auth/users/:id/reset-password', () => {
        it('should return 401 if not authenticated', async () => {
            const res = await request(app)
                .patch('/api/auth/users/someid/reset-password')
                .send({ newPassword: 'newPassword123' });
            expect(res.statusCode).toBe(401);
        });
    });
});
