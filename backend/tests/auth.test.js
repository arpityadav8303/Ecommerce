import request from 'supertest';
import app from '../index.js';
import { User } from '../modals/user.modal.js';
import mongoose from 'mongoose';

// ============ TEST DATA ============
const validUser = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'Password123',
    phone: '1234567890',
    address: '123 Main Street, City, State 12345'
};

const invalidUser = {
    name: 'J', // Too short
    email: 'invalid-email', // Invalid format
    password: '123', // Too weak
    phone: 'invalid', // Invalid format
    address: 'St' // Too short
};

// ============ REGISTRATION TESTS ============
describe('POST /api/auth/register', () => {
    
    afterEach(async () => {
        // Clean up after each test
        await User.deleteMany({});
    });
    
    test('✅ Should register user with valid data', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(validUser);
        
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('User registered successfully');
        expect(res.body.data).toHaveProperty('token');
        expect(res.body.data).toHaveProperty('userId');
        expect(res.body.data.token).toBeTruthy();
    });
    
    test('❌ Should reject registration with invalid name (too short)', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                ...validUser,
                name: 'J'
            });
        
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThan(0);
    });
    
    test('❌ Should reject registration with invalid email format', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                ...validUser,
                email: 'invalid-email'
            });
        
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
    
    test('❌ Should reject registration with weak password', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                ...validUser,
                password: 'weak'
            });
        
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
    
    test('❌ Should reject registration with invalid phone', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                ...validUser,
                phone: '123'
            });
        
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
    
    test('❌ Should reject duplicate email registration', async () => {
        // First registration
        await request(app)
            .post('/api/auth/register')
            .send(validUser);
        
        // Second registration with same email
        const res = await request(app)
            .post('/api/auth/register')
            .send(validUser);
        
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('already exists');
    });
    
    test('❌ Should reject registration with missing required fields', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'John Doe'
                // Missing email, password, phone, address
            });
        
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.errors.length).toBeGreaterThan(0);
    });
});

// ============ LOGIN TESTS ============
describe('POST /api/auth/login', () => {
    
    beforeEach(async () => {
        // Create a user before each login test
        await request(app)
            .post('/api/auth/register')
            .send(validUser);
    });
    
    afterEach(async () => {
        // Clean up after each test
        await User.deleteMany({});
    });
    
    test('✅ Should login with valid credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: validUser.email,
                password: validUser.password
            });
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Login successful');
        expect(res.body.data).toHaveProperty('token');
        expect(res.body.data).toHaveProperty('userId');
    });
    
    test('❌ Should reject login with wrong password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: validUser.email,
                password: 'WrongPassword123'
            });
        
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Invalid credentials');
    });
    
    test('❌ Should reject login with non-existent email', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'nonexistent@example.com',
                password: validUser.password
            });
        
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('not found');
    });
    
    test('❌ Should reject login with missing email', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                password: validUser.password
            });
        
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
    
    test('❌ Should reject login with missing password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: validUser.email
            });
        
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

// Close database connection
afterAll(async () => {
    await mongoose.connection.close();
}, 10000);