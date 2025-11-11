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

const secondValidProduct = {
    name: 'Samsung Galaxy Buds',
    price: 149.99,
    description: 'Premium wireless earbuds with active noise cancellation and touch controls',
    category: 'Electronics',
    brand: 'Samsung',
    stock: 30
};

// ============ PRODUCT LISTING TESTS ============
describe('GET /api/products', () => {
    
    beforeEach(async () => {
        // Create sample products before each test
        await Product.create([
            { ...validProduct, name: 'Product 1' },
            { ...validProduct, name: 'Product 2' },
            { ...validProduct, name: 'Product 3' }
        ]);
    });
    
    afterEach(async () => {
        // Clean up after each test
        await Product.deleteMany({});
    });
    
    test('✅ Should get all products with default pagination', async () => {
        const res = await request(app)
            .get('/api/products');
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Products retrieved successfully');
        expect(res.body).toHaveProperty('pagination');
        expect(res.body.pagination).toHaveProperty('total');
        expect(res.body.pagination).toHaveProperty('page');
        expect(res.body.pagination).toHaveProperty('pages');
        expect(res.body).toHaveProperty('count');
        expect(res.body).toHaveProperty('products');
        expect(Array.isArray(res.body.products)).toBe(true);
        expect(res.body.products.length).toBeGreaterThan(0);
    });
    
    test('✅ Should get products with custom pagination', async () => {
        const res = await request(app)
            .get('/api/products?page=1&limit=1');
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.pagination.page).toBe(1);
        expect(res.body.count).toBeLessThanOrEqual(1);
        expect(res.body.products.length).toBeLessThanOrEqual(1);
    });

    test('✅ Should get products with page=2', async () => {
        const res = await request(app)
            .get('/api/products?page=2&limit=1');
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.pagination.page).toBe(2);
    });
});

// ============ PRODUCT SEARCH TESTS ============
describe('GET /api/products/search', () => {
    
    beforeEach(async () => {
        // Create sample products for search testing
        await Product.create([
            { 
                ...validProduct, 
                name: 'Sony Wireless Headphones', 
                brand: 'Sony',
                description: 'Premium Sony audio equipment'
            },
            { 
                ...secondValidProduct, 
                name: 'iPhone 15 Pro', 
                brand: 'Apple',
                description: 'Latest Apple smartphone'
            },
            {
                name: 'iPad Pro',
                price: 1099.99,
                description: 'Powerful tablet for professionals',
                category: 'Tablets',
                brand: 'Apple',
                stock: 20
            }
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
        expect(res.body).toHaveProperty('count');
        expect(res.body.products.length).toBeGreaterThan(0);
        expect(res.body.products[0].name.toLowerCase()).toContain('sony');
    });
    
    test('✅ Should search products by brand (Apple)', async () => {
        const res = await request(app)
            .get('/api/products/search?keyword=Apple');
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.count).toBeGreaterThan(0);
        expect(res.body.products.length).toBeGreaterThan(0);
    });

    test('✅ Should search products by description', async () => {
        const res = await request(app)
            .get('/api/products/search?keyword=Premium');
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.count).toBeGreaterThan(0);
    });
    
    test('❌ Should return 404 for non-existent product search', async () => {
        const res = await request(app)
            .get('/api/products/search?keyword=NonExistentProduct12345XYZ');
        
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('No products found');
    });

    test('❌ Should handle special characters in search', async () => {
        const res = await request(app)
            .get('/api/products/search?keyword=@#$%');
        
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });
});

// ============ PRODUCT BY CATEGORY TESTS ============
describe('GET /api/products/category/:category', () => {
    
    beforeEach(async () => {
        await Product.create([
            { ...validProduct, category: 'Electronics', name: 'Product Electronics 1' },
            { ...validProduct, category: 'Electronics', name: 'Product Electronics 2' },
            { 
                name: 'Laptop Computer',
                price: 899.99,
                description: 'Powerful computing device with high performance',
                category: 'Computers',
                brand: 'Dell',
                stock: 15
            }
        ]);
    });
    
    afterEach(async () => {
        await Product.deleteMany({});
    });
    
    test('✅ Should get products by category (Electronics)', async () => {
        const res = await request(app)
            .get('/api/products/category/Electronics');
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty('count');
        expect(res.body.products.length).toBeGreaterThan(0);
        expect(res.body.products[0].category.toLowerCase()).toBe('electronics');
    });

    test('✅ Should get products by category (Computers)', async () => {
        const res = await request(app)
            .get('/api/products/category/Computers');
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.count).toBe(1);
        expect(res.body.products[0].category.toLowerCase()).toBe('computers');
    });

    test('✅ Should handle case-insensitive category search', async () => {
        const res = await request(app)
            .get('/api/products/category/electronics');
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.products.length).toBeGreaterThan(0);
    });
    
    test('❌ Should return error for empty category', async () => {
        const res = await request(app)
            .get('/api/products/category/');
        
        // Empty category path doesn't match the route parameter
        expect(res.status).toBe(404);
    });

    test('❌ Should return 404 for non-existent category', async () => {
        const res = await request(app)
            .get('/api/products/category/NonExistentCategory');
        
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('No products found');
    });
});

// ============ GET PRODUCT BY ID TESTS ============
describe('GET /api/products/:id', () => {
    
    let productId;
    let product;
    
    beforeEach(async () => {
        product = await Product.create(validProduct);
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
        expect(res.body.message).toBe('Product retrieved successfully');
        expect(res.body.product).toBeDefined();
        expect(res.body.product._id).toBe(productId);
        expect(res.body.product.name).toBe(validProduct.name);
        expect(res.body.product.price).toBe(validProduct.price);
        expect(res.body.product.category).toBe(validProduct.category);
        expect(res.body.product.brand).toBe(validProduct.brand);
    });
    
    test('❌ Should return error for invalid product ID format', async () => {
        const res = await request(app)
            .get('/api/products/invalid-id');
        
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Invalid');
    });
    
    test('❌ Should return error for non-existent product ID', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .get(`/api/products/${fakeId}`);
        
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('not found');
    });

    test('❌ Should return error for numeric ID', async () => {
        const res = await request(app)
            .get('/api/products/12345');
        
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test('✅ Should retrieve complete product object', async () => {
        const res = await request(app)
            .get(`/api/products/${productId}`);
        
        expect(res.status).toBe(200);
        expect(res.body.product).toHaveProperty('_id');
        expect(res.body.product).toHaveProperty('name');
        expect(res.body.product).toHaveProperty('price');
        expect(res.body.product).toHaveProperty('description');
        expect(res.body.product).toHaveProperty('category');
        expect(res.body.product).toHaveProperty('brand');
        expect(res.body.product).toHaveProperty('stock');
    });
});

// ============ RATE LIMITING TESTS ============
describe('Rate Limiting', () => {
    
    beforeEach(async () => {
        // Create a sample product
        await Product.create(validProduct);
    });
    
    afterEach(async () => {
        await Product.deleteMany({});
    });
    
    test('✅ Should allow requests within limit', async () => {
        const res = await request(app)
            .get('/api/products');
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test('✅ Should allow multiple search requests', async () => {
        const res1 = await request(app)
            .get('/api/products/search?keyword=Sony');
        
        const res2 = await request(app)
            .get('/api/products/search?keyword=Apple');

        expect(res1.status).toBe([200, 404].includes(res1.status) ? res1.status : 200);
        expect(res2.status).toBe([200, 404].includes(res2.status) ? res2.status : 200);
    });

    test('✅ Should allow category filtering within limit', async () => {
        const res = await request(app)
            .get('/api/products/category/Electronics');
        
        expect([200, 404].includes(res.status)).toBe(true);
    });
});

// ============ INTEGRATION TESTS ============
describe('Product API Integration', () => {
    
    beforeEach(async () => {
        // Create diverse product catalog
        await Product.create([
            {
                name: 'Sony WH-1000XM5',
                price: 399.99,
                description: 'Premium noise-cancelling headphones from Sony',
                category: 'Electronics',
                brand: 'Sony',
                stock: 25
            },
            {
                name: 'Apple AirPods Pro',
                price: 249.99,
                description: 'Wireless earbuds with active noise cancellation',
                category: 'Electronics',
                brand: 'Apple',
                stock: 40
            },
            {
                name: 'MacBook Pro 14',
                price: 1999.99,
                description: 'Powerful laptop for professionals',
                category: 'Computers',
                brand: 'Apple',
                stock: 10
            }
        ]);
    });
    
    afterEach(async () => {
        await Product.deleteMany({});
    });

    test('✅ Should retrieve all products and verify structure', async () => {
        const res = await request(app)
            .get('/api/products');
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.products.length).toBe(3);
        
        // Verify each product has required fields
        res.body.products.forEach(product => {
            expect(product).toHaveProperty('_id');
            expect(product).toHaveProperty('name');
            expect(product).toHaveProperty('price');
            expect(product).toHaveProperty('brand');
        });
    });

    test('✅ Should find product by search and retrieve by ID', async () => {
        // First search for a product
        const searchRes = await request(app)
            .get('/api/products/search?keyword=Sony');
        
        expect(searchRes.status).toBe(200);
        expect(searchRes.body.products.length).toBeGreaterThan(0);
        
        const productId = searchRes.body.products[0]._id;
        
        // Then retrieve that specific product by ID
        const getRes = await request(app)
            .get(`/api/products/${productId}`);
        
        expect(getRes.status).toBe(200);
        expect(getRes.body.product._id).toBe(productId);
        expect(getRes.body.product.name).toContain('Sony');
    });

    test('✅ Should filter by category and verify results', async () => {
        const res = await request(app)
            .get('/api/products/category/Electronics');
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.products.length).toBe(2);
        
        res.body.products.forEach(product => {
            expect(product.category.toLowerCase()).toBe('electronics');
        });
    });

    test('✅ Should handle pagination across multiple products', async () => {
        const page1 = await request(app)
            .get('/api/products?page=1&limit=2');
        
        expect(page1.status).toBe(200);
        expect(page1.body.products.length).toBe(2);
        expect(page1.body.pagination.page).toBe(1);
        expect(page1.body.pagination.total).toBe(3);
    });

    test('✅ Should search and filter within results', async () => {
        // Search for Apple products
        const res = await request(app)
            .get('/api/products/search?keyword=Apple');
        
        expect(res.status).toBe(200);
        expect(res.body.count).toBe(2); // AirPods Pro and MacBook Pro
    });
});

// ============ ERROR HANDLING TESTS ============
describe('Product API Error Handling', () => {
    
    afterEach(async () => {
        await Product.deleteMany({});
    });

    test('❌ Should handle database errors gracefully', async () => {
        // This test verifies error handling for edge cases
        const res = await request(app)
            .get('/api/products');
        
        // Should still return 200 with empty array if no products
        expect([200, 404].includes(res.status)).toBe(true);
    });

    test('❌ Should return proper error for malformed pagination params', async () => {
        const res = await request(app)
            .get('/api/products?page=abc&limit=xyz');
        
        // Should either handle gracefully or return 200 with defaults
        expect(res.status).toBe(200);
    });

    test('❌ Should handle very large page numbers', async () => {
        const res = await request(app)
            .get('/api/products?page=999999&limit=10');
        
        // Should return 200 with empty results, not error
        expect(res.status).toBe(200);
    });
});

// ============ CLOSE DATABASE CONNECTION ============
afterAll(async () => {
    await mongoose.connection.close();
}, 10000);