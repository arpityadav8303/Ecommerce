import helmet from 'helmet';

// ============ SECURITY HEADERS ============
const securityMiddleware = helmet({
    // XSS Protection
    xssFilter: true,
    
    // Prevent MIME type sniffing
    noSniff: true,
    
    // Clickjacking protection
    frameguard: {
        action: 'deny'
    },
    
    // HSTS - Force HTTPS
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    },
    
    // Content Security Policy
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://cdnjs.cloudflare.com"]
        }
    },
    
    // Hide X-Powered-By header
    hidePoweredBy: true
});

export { securityMiddleware };