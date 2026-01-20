const mongoose = require('mongoose');
const User = require('./user.model');
// Note: We are using the REAL bcryptjs library implicitly via the model logic.

describe('User Model Integration Tests (Auth Logic)', () => {

    describe('Hashing Logic (Pre-save)', () => {
        it('should hash the password using actual bcryptjs', async () => {
            const schema = User.schema;
            const saveHooks = schema.s.hooks._pres.get('save');
            // Dynamically find the hook that uses bcrypt
            const myHook = saveHooks.find(h => h.fn.toString().includes('bcrypt'));
            if (!myHook) throw new Error("Could not find hashing hook in schema");

            const preSaveHook = myHook.fn;
            const mockNext = jest.fn();

            // Mock user instance
            const mockUser = {
                isModified: jest.fn().mockReturnValue(true),
                password: 'Password123!',
            };

            await preSaveHook.call(mockUser, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockUser.password).not.toBe('Password123!');
            // Verify it looks like a bcrypt hash ($2a$ or $2b$)
            expect(mockUser.password).toMatch(/^\$2[ayb]\$.{56}$/);
        });

        it('should NOT re-hash if password is not modified', async () => {
            const schema = User.schema;
            const saveHooks = schema.s.hooks._pres.get('save');
            const myHook = saveHooks.find(h => h.fn.toString().includes('bcrypt'));
            const preSaveHook = myHook.fn;

            const mockNext = jest.fn();
            const existingHash = '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklm';
            const mockUser = {
                isModified: jest.fn().mockReturnValue(false),
                password: existingHash
            };

            await preSaveHook.call(mockUser, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockUser.password).toBe(existingHash);
        });
    });

    describe('comparePassword Method', () => {
        it('should return true for valid password', async () => {
            // 1. Setup - Mock a user with a hashed password
            const schema = User.schema;
            const saveHooks = schema.s.hooks._pres.get('save');
            const myHook = saveHooks.find(h => h.fn.toString().includes('bcrypt'));
            const preSaveHook = myHook.fn;

            const user = new User({ email: 'test@example.com', password: 'Password123!' });

            // Hash it using the real hook
            user.isModified = jest.fn().mockReturnValue(true);
            const mockNext = jest.fn();
            await preSaveHook.call(user, mockNext);

            // 2. Execute
            const isMatch = await user.comparePassword('Password123!');

            // 3. Assert
            expect(isMatch).toBe(true);
        });

        it('should return false for invalid password', async () => {
            const schema = User.schema;
            const saveHooks = schema.s.hooks._pres.get('save');
            const myHook = saveHooks.find(h => h.fn.toString().includes('bcrypt'));
            const preSaveHook = myHook.fn;

            const user = new User({ email: 'test@example.com', password: 'Password123!' });

            user.isModified = jest.fn().mockReturnValue(true);
            const mockNext = jest.fn();
            await preSaveHook.call(user, mockNext);

            const isMatch = await user.comparePassword('WrongPassword');

            expect(isMatch).toBe(false);
        });
    });
});
