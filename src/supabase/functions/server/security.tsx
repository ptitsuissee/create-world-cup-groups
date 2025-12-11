import type { Context, Next } from "npm:hono";
import * as kv from "./kv_store.tsx";

// Rate limiting configuration
const RATE_LIMITS = {
  default: { windowMs: 60000, maxRequests: 100 }, // 100 requests per minute
  auth: { windowMs: 300000, maxRequests: 5 }, // 5 requests per 5 minutes
  contact: { windowMs: 3600000, maxRequests: 10 }, // 10 requests per hour
  api: { windowMs: 60000, maxRequests: 30 }, // 30 requests per minute
};

// IP-based rate limiting
export async function rateLimiter(type: keyof typeof RATE_LIMITS = 'default') {
  return async (c: Context, next: Next) => {
    try {
      const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
      const key = `ratelimit:${type}:${ip}`;
      const config = RATE_LIMITS[type];
      
      // Get current count
      const data = await kv.get(key);
      const current = data ? JSON.parse(data) : { count: 0, resetAt: Date.now() + config.windowMs };
      
      // Check if window has expired
      if (Date.now() > current.resetAt) {
        current.count = 0;
        current.resetAt = Date.now() + config.windowMs;
      }
      
      // Check if limit exceeded
      if (current.count >= config.maxRequests) {
        const retryAfter = Math.ceil((current.resetAt - Date.now()) / 1000);
        return c.json(
          { 
            error: 'Rate limit exceeded. Too many requests.',
            retryAfter 
          },
          429,
          {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': current.resetAt.toString(),
          }
        );
      }
      
      // Increment counter
      current.count++;
      await kv.set(key, JSON.stringify(current));
      
      // Add rate limit headers
      c.header('X-RateLimit-Limit', config.maxRequests.toString());
      c.header('X-RateLimit-Remaining', (config.maxRequests - current.count).toString());
      c.header('X-RateLimit-Reset', current.resetAt.toString());
      
      await next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      // If rate limiter fails, allow request to proceed (fail open)
      await next();
    }
  };
}

// Security headers middleware
export function securityHeaders() {
  return async (c: Context, next: Next) => {
    await next();
    
    // Add security headers
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'DENY');
    c.header('X-XSS-Protection', '1; mode=block');
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    c.header(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
    );
  };
}

// Input validation and sanitization
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 10000); // Limit length to prevent memory attacks
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

export function validateInput(input: unknown, maxLength: number = 1000): boolean {
  if (typeof input !== 'string') return false;
  if (input.length === 0 || input.length > maxLength) return false;
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /eval\(/i,
    /expression\(/i,
    /\.\.\//, // Path traversal
    /union.*select/i, // SQL injection
    /insert.*into/i,
    /drop.*table/i,
    /delete.*from/i,
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(input));
}

// Request body size limiter
export function bodySizeLimit(maxSize: number = 100000) { // 100KB default
  return async (c: Context, next: Next) => {
    try {
      const contentLength = c.req.header('content-length');
      if (contentLength && parseInt(contentLength) > maxSize) {
        return c.json({ error: 'Request body too large' }, 413);
      }
      await next();
    } catch (error) {
      console.error('Body size limit error:', error);
      await next();
    }
  };
}

// CSRF protection - verify origin header
export function csrfProtection() {
  return async (c: Context, next: Next) => {
    const method = c.req.method;
    
    // Only check state-changing methods
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const origin = c.req.header('origin');
      const referer = c.req.header('referer');
      
      // In production, you should check against your domain
      // For now, we just verify that origin/referer is present
      if (!origin && !referer) {
        return c.json({ error: 'Missing origin header' }, 403);
      }
    }
    
    await next();
  };
}

// IP blocking for malicious IPs
const BLOCKED_IPS = new Set<string>();

export async function blockIP(ip: string, durationMs: number = 3600000) {
  const key = `blocked:ip:${ip}`;
  await kv.set(key, JSON.stringify({ blockedAt: Date.now(), expiresAt: Date.now() + durationMs }));
  BLOCKED_IPS.add(ip);
}

export async function isIPBlocked(ip: string): Promise<boolean> {
  if (BLOCKED_IPS.has(ip)) return true;
  
  const key = `blocked:ip:${ip}`;
  const data = await kv.get(key);
  
  if (!data) return false;
  
  const blockInfo = JSON.parse(data);
  if (Date.now() > blockInfo.expiresAt) {
    await kv.del(key);
    BLOCKED_IPS.delete(ip);
    return false;
  }
  
  BLOCKED_IPS.add(ip);
  return true;
}

export function ipBlocker() {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    
    if (await isIPBlocked(ip)) {
      return c.json({ error: 'Access denied' }, 403);
    }
    
    await next();
  };
}

// Detect and block suspicious activity
export async function detectSuspiciousActivity(ip: string, action: string) {
  const key = `suspicious:${ip}:${action}`;
  const data = await kv.get(key);
  const count = data ? parseInt(data) : 0;
  
  if (count > 20) { // More than 20 failed attempts
    await blockIP(ip, 3600000); // Block for 1 hour
    console.warn(`Suspicious activity detected from IP ${ip}: ${action}. IP blocked.`);
    return true;
  }
  
  await kv.set(key, (count + 1).toString());
  return false;
}

// Request signature verification (for API calls)
export function verifyRequestSignature(secret: string) {
  return async (c: Context, next: Next) => {
    const signature = c.req.header('x-signature');
    const timestamp = c.req.header('x-timestamp');
    
    if (!signature || !timestamp) {
      return c.json({ error: 'Missing signature headers' }, 401);
    }
    
    // Check timestamp to prevent replay attacks (5 minutes window)
    const now = Date.now();
    const requestTime = parseInt(timestamp);
    if (Math.abs(now - requestTime) > 300000) {
      return c.json({ error: 'Request timestamp expired' }, 401);
    }
    
    // In a real implementation, you would verify the HMAC signature here
    // For now, we just check that the signature exists
    
    await next();
  };
}

// Honeypot field detection (for forms)
export function detectHoneypot(honeypotField: string) {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      
      // If honeypot field is filled, it's likely a bot
      if (body[honeypotField]) {
        const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
        console.warn(`Honeypot triggered from IP ${ip}`);
        await detectSuspiciousActivity(ip, 'honeypot');
        return c.json({ error: 'Invalid request' }, 400);
      }
      
      await next();
    } catch (error) {
      console.error('Honeypot detection error:', error);
      await next();
    }
  };
}

// DDoS protection - connection limiting per IP
const CONNECTION_COUNTS = new Map<string, number>();

export function ddosProtection(maxConnections: number = 10) {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    
    const currentConnections = CONNECTION_COUNTS.get(ip) || 0;
    
    if (currentConnections >= maxConnections) {
      console.warn(`DDoS protection triggered for IP ${ip}: ${currentConnections} concurrent connections`);
      return c.json({ error: 'Too many concurrent connections' }, 429);
    }
    
    CONNECTION_COUNTS.set(ip, currentConnections + 1);
    
    try {
      await next();
    } finally {
      CONNECTION_COUNTS.set(ip, Math.max(0, (CONNECTION_COUNTS.get(ip) || 1) - 1));
    }
  };
}

// Clean up old connection counts periodically
setInterval(() => {
  const threshold = 5;
  for (const [ip, count] of CONNECTION_COUNTS.entries()) {
    if (count < threshold) {
      CONNECTION_COUNTS.delete(ip);
    }
  }
}, 60000); // Every minute
