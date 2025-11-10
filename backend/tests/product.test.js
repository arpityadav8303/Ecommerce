import request from 'supertest';
import app from '../index.js';
import { Product } from '../modals/product.modal.js';
import mongoose from 'mongoose';

// ============ TEST DATA ============
const validProduct = {
    name: 'Wireless Headphones',
    price: 99.99,
    description: 'High quality wireless headphones with noise cancellation and long battery life',
    category: 'Electronics',
    brand: 'Sony',
    stock: 50
};

// ============ PRODUCT LISTING TESTS ============
describe('GET /api/products', () => {
    
    beforeEach(async () => {
        // Create sample products
        await Product.create([
            { ...validProduct, name: 'Product 1' },
            { ...validProduct, name: 'Product 2' }
        ]);
    });
    
    afterEach(async () => {
        await Product.deleteMany({});
    });
    
    test('✅ Should get all products with default pagination', async () => {
        const res = await request(app)
            .get('/api/products');
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty('pagination');
        expect(res.body.pagination).toHaveProperty('total');
        expect(res.body.pagination).toHaveProperty('page');
        expect(res.body.pagination).toHaveProperty('pages');
        expect(res.body).toHaveProperty('products');
        expect(Array.isArray(res.body.products)).toBe(true);
    });
    
    test('✅ Should get products with custom pagination', async () => {
        const res = await request(app)
            .get('/api/products?page=1&limit=1');
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.pagination.page).toBe(1);
        expect(res.body.count).toBeLessThanOrEqual(1);
    });
});

// ============ PRODUCT SEARCH TESTS ============
describe('GET /api/products/search', () => {
    
    beforeEach(async () => {
        await Product.create([
            { ...validProduct, name: 'Sony Headphones', brand: 'Sony' },
            { ...validProduct, name: 'iPhone 15', brand: 'Apple' }
        ]);
    });
    
    afterEach(async () => {
        await Product.deleteMany({});
    });
    
    test('❌ Should return error without search keyword', async () => {
        const res = await request(app)
            .get('/api/products/search');
        
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('keyword');
    });
    
    test('✅ Should search products by name', async () => {
        const res = await request(app)
            .get('/api/products/search?keyword=Sony');
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.products.length).toBeGreaterThan(0);
    });
    
    test('✅ Should search products by brand', async () => {
        const res = await request(app)
            .get('/api/products/search?keyword=Apple');
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.count).toBeGreaterThan(0);
    });
    
    test('❌ Should return empty results for non-existent product', async () => {
        const res = await request(app)
            .get('/api/products/search?keyword=nonexistent');
        
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });
});

// ============ PRODUCT BY CATEGORY TESTS ============
describe('GET /api/products/category/:category', () => {
    
    beforeEach(async () => {
        await Product.create([
            { ...validProduct, category: 'Electronics' },
            { ...validProduct, name: 'Laptop', category: 'Computers' }
        ]);
    });
    
    afterEach(async () => {
        await Product.deleteMany({});
    });
    
    test('✅ Should get products by category', async () => {
        const res = await request(app)
            .get('/api/products/category/Electronics');
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.products.length).toBeGreaterThan(0);
    });
    
    test('❌ Should return error for empty category', async () => {
        const res = await request(app)
            .get('/api/products/category/');
        
        expect(res.status).toBe(404); // Route not found
    });
});

// ============ GET PRODUCT BY ID TESTS ============
describe('GET /api/products/:id', () => {
    
    let productId;
    
    beforeEach(async () => {
        const product = await Product.create(validProduct);
        productId = product._id.toString();
    });
    
    afterEach(async () => {
        await Product.deleteMany({});
    });
    
    test('✅ Should get product by valid ID', async () => {
        const res = await request(app)
            .get(`/api/products/${productId}`);
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.product).toBeDefined();
        expect(res.body.product._id).toBe(productId);
        expect(res.body.product.name).toBe(validProduct.name);
    });
    
    test('❌ Should return error for invalid product ID format', async () => {
        const res = await request(app)
            .get('/api/products/invalid-id');
        
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
    
    test('❌ Should return error for non-existent product ID', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .get(`/api/products/${fakeId}`);
        
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });
});

// ============ RATE LIMITING TESTS ============
describe('Rate Limiting', () => {
    
    test('✅ Should allow requests within limit', async () => {
        const res = await request(app)
            .get('/api/products');
        
        expect(res.status).toBe(200);
    });
});

// Close database connection
afterAll(async () => {
    await mongoose.connection.close();
}, 10000);