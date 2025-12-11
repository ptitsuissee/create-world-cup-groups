import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import {
  rateLimiter,
  securityHeaders,
  bodySizeLimit,
  csrfProtection,
  ipBlocker,
  ddosProtection,
  sanitizeInput,
  validateEmail,
  validateInput,
  detectSuspiciousActivity,
} from "./security.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Security headers
app.use('*', securityHeaders());

// DDoS protection
app.use('*', ddosProtection(15));

// IP blocking
app.use('*', ipBlocker());

// Default rate limiting
app.use('*', rateLimiter('default'));

// Body size limit
app.use('*', bodySizeLimit(200000)); // 200KB max

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length", "X-RateLimit-Limit", "X-RateLimit-Remaining"],
    maxAge: 600,
  }),
);

// CSRF protection for state-changing requests
app.use('*', csrfProtection());

// Health check endpoint
app.get("/make-server-92e03882/health", (c) => {
  return c.json({ status: "ok", timestamp: Date.now() });
});

// Contact form endpoint with strict rate limiting
app.post("/make-server-92e03882/contact", rateLimiter('contact'), async (c) => {
  try {
    const body = await c.req.json();
    const { email, subject, message, _honeypot } = body;
    
    // Honeypot check
    if (_honeypot) {
      const ip = c.req.header('x-forwarded-for') || 'unknown';
      console.warn(`Honeypot triggered from IP ${ip}`);
      await detectSuspiciousActivity(ip, 'honeypot');
      return c.json({ error: 'Invalid request' }, 400);
    }
    
    // Validate inputs
    if (!email || !validateEmail(email)) {
      return c.json({ error: 'Invalid email address' }, 400);
    }
    
    if (!subject || !validateInput(subject, 200)) {
      return c.json({ error: 'Invalid subject' }, 400);
    }
    
    if (!message || !validateInput(message, 5000)) {
      return c.json({ error: 'Invalid message' }, 400);
    }
    
    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedSubject = sanitizeInput(subject);
    const sanitizedMessage = sanitizeInput(message);
    
    // Store contact message
    const contactId = `contact-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await kv.set(`contact:${contactId}`, JSON.stringify({
      email: sanitizedEmail,
      subject: sanitizedSubject,
      message: sanitizedMessage,
      timestamp: Date.now(),
      ip: c.req.header('x-forwarded-for') || 'unknown',
    }));
    
    console.log(`Contact form submitted: ${contactId} from ${sanitizedEmail}`);
    
    return c.json({ 
      success: true,
      message: 'Contact form submitted successfully',
      id: contactId 
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Bug report endpoint with strict rate limiting
app.post("/make-server-92e03882/bug-report", rateLimiter('contact'), async (c) => {
  try {
    const body = await c.req.json();
    const { description, userEmail, _honeypot } = body;
    
    // Honeypot check
    if (_honeypot) {
      const ip = c.req.header('x-forwarded-for') || 'unknown';
      console.warn(`Honeypot triggered from IP ${ip}`);
      await detectSuspiciousActivity(ip, 'honeypot');
      return c.json({ error: 'Invalid request' }, 400);
    }
    
    // Validate inputs
    if (!description || !validateInput(description, 5000)) {
      return c.json({ error: 'Invalid bug description' }, 400);
    }
    
    if (userEmail && !validateEmail(userEmail)) {
      return c.json({ error: 'Invalid email address' }, 400);
    }
    
    // Sanitize inputs
    const sanitizedDescription = sanitizeInput(description);
    const sanitizedEmail = userEmail ? sanitizeInput(userEmail) : '';
    
    // Store bug report
    const bugId = `bug-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await kv.set(`bug:${bugId}`, JSON.stringify({
      description: sanitizedDescription,
      email: sanitizedEmail,
      timestamp: Date.now(),
      ip: c.req.header('x-forwarded-for') || 'unknown',
      userAgent: c.req.header('user-agent') || 'unknown',
    }));
    
    console.log(`Bug report submitted: ${bugId}`);
    
    return c.json({ 
      success: true,
      message: 'Bug report submitted successfully',
      id: bugId 
    });
  } catch (error) {
    console.error('Bug report error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Authentication endpoints with strict rate limiting
app.post("/make-server-92e03882/auth/login", rateLimiter('auth'), async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, _honeypot } = body;
    
    // Honeypot check
    if (_honeypot) {
      const ip = c.req.header('x-forwarded-for') || 'unknown';
      await detectSuspiciousActivity(ip, 'honeypot');
      return c.json({ error: 'Invalid request' }, 400);
    }
    
    // Validate inputs
    if (!email || !validateEmail(email)) {
      const ip = c.req.header('x-forwarded-for') || 'unknown';
      await detectSuspiciousActivity(ip, 'login-failed');
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    if (!password || password.length < 6 || password.length > 100) {
      const ip = c.req.header('x-forwarded-for') || 'unknown';
      await detectSuspiciousActivity(ip, 'login-failed');
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    // Admin check (hardcoded for security - not in KV store)
    const ADMIN_EMAIL = "LesSuisse@matchdraw.pro";
    const ADMIN_PASSWORD = "MatchDrawPro2024!"; // Should be hashed in production
    
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      return c.json({
        success: true,
        user: {
          email: ADMIN_EMAIL,
          name: "LesSuisse",
          isAdmin: true,
          avatar: "👑",
        },
        token: `admin-${Date.now()}`,
      });
    }
    
    // Check regular users
    const userKey = `user:${sanitizeInput(email)}`;
    const userData = await kv.get(userKey);
    
    if (!userData) {
      const ip = c.req.header('x-forwarded-for') || 'unknown';
      await detectSuspiciousActivity(ip, 'login-failed');
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    const user = JSON.parse(userData);
    
    // In production, use bcrypt or similar
    if (user.password !== password) {
      const ip = c.req.header('x-forwarded-for') || 'unknown';
      await detectSuspiciousActivity(ip, 'login-failed');
      return c.json({ error: 'Invalid credentials' }, 401);
    }
    
    return c.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        isAdmin: false,
        avatar: user.avatar || '😀',
      },
      token: `user-${Date.now()}`,
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post("/make-server-92e03882/auth/signup", rateLimiter('auth'), async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, _honeypot } = body;
    
    // Honeypot check
    if (_honeypot) {
      const ip = c.req.header('x-forwarded-for') || 'unknown';
      await detectSuspiciousActivity(ip, 'honeypot');
      return c.json({ error: 'Invalid request' }, 400);
    }
    
    // Validate inputs
    if (!email || !validateEmail(email)) {
      return c.json({ error: 'Invalid email address' }, 400);
    }
    
    if (!password || password.length < 6 || password.length > 100) {
      return c.json({ error: 'Password must be between 6 and 100 characters' }, 400);
    }
    
    if (!name || !validateInput(name, 100)) {
      return c.json({ error: 'Invalid name' }, 400);
    }
    
    // Check if user already exists
    const userKey = `user:${sanitizeInput(email)}`;
    const existingUser = await kv.get(userKey);
    
    if (existingUser) {
      return c.json({ error: 'User already exists' }, 409);
    }
    
    // Create user
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedName = sanitizeInput(name);
    
    await kv.set(userKey, JSON.stringify({
      email: sanitizedEmail,
      password, // Should be hashed in production
      name: sanitizedName,
      avatar: '😀',
      createdAt: Date.now(),
    }));
    
    console.log(`User registered: ${sanitizedEmail}`);
    
    return c.json({
      success: true,
      user: {
        email: sanitizedEmail,
        name: sanitizedName,
        isAdmin: false,
        avatar: '😀',
      },
      token: `user-${Date.now()}`,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Projects API with rate limiting
app.post("/make-server-92e03882/projects", rateLimiter('api'), async (c) => {
  try {
    const body = await c.req.json();
    const { name, data, token } = body;
    
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    if (!name || !validateInput(name, 200)) {
      return c.json({ error: 'Invalid project name' }, 400);
    }
    
    if (!data || typeof data !== 'object') {
      return c.json({ error: 'Invalid project data' }, 400);
    }
    
    const projectId = `project-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const sanitizedName = sanitizeInput(name);
    
    await kv.set(`project:${projectId}`, JSON.stringify({
      name: sanitizedName,
      data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));
    
    return c.json({
      success: true,
      projectId,
      message: 'Project saved successfully',
    });
  } catch (error) {
    console.error('Save project error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get("/make-server-92e03882/projects/:id", rateLimiter('api'), async (c) => {
  try {
    const projectId = c.req.param('id');
    
    if (!projectId || !validateInput(projectId, 100)) {
      return c.json({ error: 'Invalid project ID' }, 400);
    }
    
    const projectData = await kv.get(`project:${sanitizeInput(projectId)}`);
    
    if (!projectData) {
      return c.json({ error: 'Project not found' }, 404);
    }
    
    return c.json({
      success: true,
      project: JSON.parse(projectData),
    });
  } catch (error) {
    console.error('Load project error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Admin endpoint to view blocked IPs (admin only)
app.get("/make-server-92e03882/admin/blocked-ips", async (c) => {
  try {
    const token = c.req.header('authorization')?.replace('Bearer ', '');
    
    if (!token || !token.startsWith('admin-')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const blockedIPs = await kv.getByPrefix('blocked:ip:');
    
    return c.json({
      success: true,
      blockedIPs: blockedIPs.map(ip => ({
        ip: ip.replace('blocked:ip:', ''),
        data: JSON.parse(ip),
      })),
    });
  } catch (error) {
    console.error('Admin blocked IPs error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Catch-all for undefined routes
app.all('*', (c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

Deno.serve(app.fetch);
