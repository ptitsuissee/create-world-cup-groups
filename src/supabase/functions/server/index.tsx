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

// Body size limit
app.use('*', bodySizeLimit(200000)); // 200KB max

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-Admin-Token"],
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

// Contact form endpoint
app.post("/make-server-92e03882/contact", async (c) => {
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
      id: contactId,
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

// Bug report endpoint
app.post("/make-server-92e03882/bug-report", async (c) => {
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
      id: bugId,
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

// Authentication endpoints
app.post("/make-server-92e03882/auth/login", async (c) => {
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
    const ADMIN_EMAIL = "suppmatchdrawpro@outlook.com";
    const ADMIN_PASSWORD = "MatchDraw2024Admin!"; // Should be hashed in production
    
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

app.post("/make-server-92e03882/auth/signup", async (c) => {
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
    
    // Check if username is already taken
    const allUsers = await kv.getByPrefix('user:');
    const nameTaken = allUsers.some(userData => {
      try {
        const user = JSON.parse(userData);
        return user.name && user.name.toLowerCase() === sanitizedName.toLowerCase();
      } catch {
        return false;
      }
    });
    
    if (nameTaken) {
      return c.json({ error: 'Username already taken. Please choose another name.' }, 409);
    }
    
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

// Projects API
app.post("/make-server-92e03882/projects", async (c) => {
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

app.get("/make-server-92e03882/projects/:id", async (c) => {
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

// Admin endpoint to view all contact messages (admin only)
app.get("/make-server-92e03882/admin/messages", async (c) => {
  try {
    const token = c.req.header('authorization')?.replace('Bearer ', '');
    
    if (!token || !token.startsWith('admin-')) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }
    
    // Get all contact messages
    const contacts = await kv.getByPrefix('contact:');
    const contactMessages = contacts.map(data => {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }).filter(Boolean);
    
    // Get all bug reports
    const bugs = await kv.getByPrefix('bug:');
    const bugReports = bugs.map(data => {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }).filter(Boolean);
    
    // Sort by timestamp (most recent first)
    contactMessages.sort((a, b) => b.timestamp - a.timestamp);
    bugReports.sort((a, b) => b.timestamp - a.timestamp);
    
    console.log(`Admin retrieved ${contactMessages.length} contact messages and ${bugReports.length} bug reports`);
    
    return c.json({
      success: true,
      contacts: contactMessages,
      bugs: bugReports,
    });
  } catch (error) {
    console.error('Admin messages error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Admin endpoint to delete a contact message or bug report (admin only)
app.delete("/make-server-92e03882/admin/message/:type/:id", async (c) => {
  try {
    const token = c.req.header('authorization')?.replace('Bearer ', '');
    
    if (!token || !token.startsWith('admin-')) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }
    
    const type = c.req.param('type'); // 'contact' or 'bug'
    const id = c.req.param('id');
    
    if (!['contact', 'bug'].includes(type)) {
      return c.json({ error: 'Invalid message type' }, 400);
    }
    
    if (!id || !validateInput(id, 100)) {
      return c.json({ error: 'Invalid message ID' }, 400);
    }
    
    const key = `${type}:${sanitizeInput(id)}`;
    await kv.del(key);
    
    console.log(`Admin deleted ${type} message: ${id}`);
    
    return c.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Admin delete message error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Check username availability
app.post("/make-server-92e03882/auth/check-username", async (c) => {
  try {
    const body = await c.req.json();
    const { username, currentEmail } = body;
    
    if (!username || !validateInput(username, 100)) {
      return c.json({ error: 'Invalid username' }, 400);
    }
    
    const sanitizedUsername = sanitizeInput(username);
    
    // Get all users
    const allUsers = await kv.getByPrefix('user:');
    
    // Check if username is taken by another user
    const nameTaken = allUsers.some(userData => {
      try {
        const user = JSON.parse(userData);
        // Ignore current user's email when checking
        if (currentEmail && user.email === currentEmail) {
          return false;
        }
        return user.name && user.name.toLowerCase() === sanitizedUsername.toLowerCase();
      } catch {
        return false;
      }
    });
    
    return c.json({
      success: true,
      available: !nameTaken,
    });
  } catch (error) {
    console.error('Check username error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update user settings
app.post("/make-server-92e03882/auth/update-settings", async (c) => {
  try {
    const body = await c.req.json();
    const { email, name, password, token } = body;
    
    // Verify token
    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Validate inputs
    if (!email || !validateEmail(email)) {
      return c.json({ error: 'Invalid email address' }, 400);
    }
    
    if (!name || !validateInput(name, 100)) {
      return c.json({ error: 'Invalid name' }, 400);
    }
    
    if (password && (password.length < 6 || password.length > 100)) {
      return c.json({ error: 'Password must be between 6 and 100 characters' }, 400);
    }
    
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedName = sanitizeInput(name);
    
    // Get current user data
    const userKey = `user:${sanitizedEmail}`;
    const userData = await kv.get(userKey);
    
    if (!userData) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    const currentUser = JSON.parse(userData);
    
    // Check if new username is already taken by another user
    if (currentUser.name.toLowerCase() !== sanitizedName.toLowerCase()) {
      const allUsers = await kv.getByPrefix('user:');
      const nameTaken = allUsers.some(otherUserData => {
        try {
          const otherUser = JSON.parse(otherUserData);
          // Don't compare with current user
          if (otherUser.email === sanitizedEmail) {
            return false;
          }
          return otherUser.name && otherUser.name.toLowerCase() === sanitizedName.toLowerCase();
        } catch {
          return false;
        }
      });
      
      if (nameTaken) {
        return c.json({ error: 'Username already taken. Please choose another name.' }, 409);
      }
    }
    
    // Update user data
    const updatedUser = {
      ...currentUser,
      name: sanitizedName,
      password: password || currentUser.password,
      updatedAt: Date.now(),
    };
    
    await kv.set(userKey, JSON.stringify(updatedUser));
    
    console.log(`User settings updated: ${sanitizedEmail}`);
    
    return c.json({
      success: true,
      user: {
        email: updatedUser.email,
        name: updatedUser.name,
        avatar: updatedUser.avatar || '😀',
        isAdmin: false,
      },
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Analytics endpoints
app.post("/make-server-92e03882/analytics/track-visit", async (c) => {
  try {
    const body = await c.req.json();
    const { page, userEmail, userName } = body;
    
    const visitId = `analytics:visit:${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await kv.set(visitId, JSON.stringify({
      page: sanitizeInput(page || 'unknown'),
      userEmail: userEmail ? sanitizeInput(userEmail) : 'anonymous',
      userName: userName ? sanitizeInput(userName) : 'anonymous',
      timestamp: Date.now(),
      ip: c.req.header('x-forwarded-for') || 'unknown',
      userAgent: c.req.header('user-agent') || 'unknown',
    }));
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Track visit error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post("/make-server-92e03882/analytics/track-interaction", async (c) => {
  try {
    const body = await c.req.json();
    const { action, data, userEmail, userName } = body;
    
    if (!action || !validateInput(action, 100)) {
      return c.json({ error: 'Invalid action' }, 400);
    }
    
    const interactionId = `analytics:interaction:${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await kv.set(interactionId, JSON.stringify({
      action: sanitizeInput(action),
      data: data || {},
      userEmail: userEmail ? sanitizeInput(userEmail) : 'anonymous',
      userName: userName ? sanitizeInput(userName) : 'anonymous',
      timestamp: Date.now(),
      ip: c.req.header('x-forwarded-for') || 'unknown',
    }));
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Track interaction error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Admin analytics endpoint
app.get("/make-server-92e03882/admin/analytics", async (c) => {
  try {
    // Check for admin token in custom header or in authorization
    const authHeader = c.req.header('authorization')?.replace('Bearer ', '');
    const adminToken = c.req.header('x-admin-token') || authHeader;
    
    if (!adminToken || !adminToken.startsWith('admin-')) {
      console.log('Unauthorized analytics access attempt. Token:', adminToken?.substring(0, 10));
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    console.log('Analytics access authorized for admin');
    
    // Get visits and interactions
    const visits = await kv.getByPrefix('analytics:visit:');
    const interactions = await kv.getByPrefix('analytics:interaction:');
    
    // Parse data
    const parsedVisits = visits.map(v => {
      try {
        return JSON.parse(v);
      } catch {
        return null;
      }
    }).filter(Boolean);
    
    const parsedInteractions = interactions.map(i => {
      try {
        return JSON.parse(i);
      } catch {
        return null;
      }
    }).filter(Boolean);
    
    // Calculate statistics
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
    
    const stats = {
      totalVisits: parsedVisits.length,
      visitsLast24h: parsedVisits.filter(v => v.timestamp > oneDayAgo).length,
      visitsLastWeek: parsedVisits.filter(v => v.timestamp > oneWeekAgo).length,
      visitsLastMonth: parsedVisits.filter(v => v.timestamp > oneMonthAgo).length,
      
      uniqueVisitors: new Set(parsedVisits.map(v => v.userEmail)).size,
      uniqueVisitorsLast24h: new Set(parsedVisits.filter(v => v.timestamp > oneDayAgo).map(v => v.userEmail)).size,
      
      totalInteractions: parsedInteractions.length,
      interactionsLast24h: parsedInteractions.filter(i => i.timestamp > oneDayAgo).length,
      interactionsLastWeek: parsedInteractions.filter(i => i.timestamp > oneWeekAgo).length,
      interactionsLastMonth: parsedInteractions.filter(i => i.timestamp > oneMonthAgo).length,
      
      // Top pages
      pageViews: parsedVisits.reduce((acc, v) => {
        acc[v.page] = (acc[v.page] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      
      // Top actions
      actionCounts: parsedInteractions.reduce((acc, i) => {
        acc[i.action] = (acc[i.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      
      // Active users (users with interactions)
      activeUsers: parsedInteractions
        .filter(i => i.userEmail !== 'anonymous')
        .reduce((acc, i) => {
          if (!acc[i.userEmail]) {
            acc[i.userEmail] = {
              email: i.userEmail,
              name: i.userName,
              interactions: 0,
            };
          }
          acc[i.userEmail].interactions++;
          return acc;
        }, {} as Record<string, { email: string; name: string; interactions: number }>),
    };
    
    return c.json({
      success: true,
      stats,
      recentVisits: parsedVisits.slice(-50).reverse(),
      recentInteractions: parsedInteractions.slice(-50).reverse(),
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
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