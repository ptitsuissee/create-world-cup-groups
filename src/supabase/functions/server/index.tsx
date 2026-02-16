import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Security Utility Functions (Self-contained)
const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input.replace(/[<>]/g, '').trim().slice(0, 10000);
};

// CORS - Must be first and handle everything
app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-Admin-Token", "apikey"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 86400,
  }),
);

// Logger
app.use('*', logger(console.log));

// Utility to parse KV data reliably
const parseKvItem = (data: any) => {
  if (!data) return null;
  try {
    // Handle both direct values and { key, value } objects from getByPrefix
    let content = data;
    if (typeof data === 'object' && data !== null && 'value' in data) {
      content = data.value;
    }
    
    if (typeof content === 'string') {
      try {
        return JSON.parse(content);
      } catch {
        return content;
      }
    }
    return content;
  } catch (err) {
    console.error('Error parsing KV item:', err);
    return null;
  }
};

// Utility to get user from token
const getUserFromToken = (token?: string) => {
  if (!token) return null;
  const [type, email, timestamp] = token.split(':');
  if (!type || !email) return null;
  return { type, email, isAdmin: type === 'admin' };
};

// Routes - Mandatory prefix as per instructions
const PREFIX = "/make-server-92e03882";

// Health check
const healthHandler = (c: any) => c.json({ status: "ok", timestamp: Date.now() });
app.get("/", healthHandler);
app.get("/health", healthHandler);
app.get(`${PREFIX}/health`, healthHandler);

// Auth
const loginHandler = async (c: any) => {
  try {
    const { email, password } = await c.req.json();
    const ADMIN_EMAIL = "suppmatchdrawpro@outlook.com";
    const ADMIN_PASSWORD = "MatchDraw2024Admin!";
    
    if ((email.toLowerCase() === ADMIN_EMAIL.toLowerCase() || email.toLowerCase() === "lessuisse") && password === ADMIN_PASSWORD) {
      return c.json({
        success: true,
        user: { email: ADMIN_EMAIL, name: "LesSuisse", isAdmin: true, avatar: "👑" },
        token: `admin:${ADMIN_EMAIL}:${Date.now()}`,
      });
    }
    
    const userData = await kv.get(`user:${sanitizeInput(email)}`);
    const user = parseKvItem(userData);
    if (!user || user.password !== password) return c.json({ error: 'Invalid credentials' }, 401);
    
    return c.json({
      success: true,
      user: { email: user.email, name: user.name, isAdmin: false, avatar: user.avatar || '😀' },
      token: `user:${user.email}:${Date.now()}`,
    });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
};
app.post("/auth/login", loginHandler);
app.post(`${PREFIX}/auth/login`, loginHandler);

// Projects
const getProjectsHandler = async (c: any) => {
  try {
    const rawProjects = await kv.getByPrefix('project:');
    const projects = (rawProjects || [])
      .map(item => parseKvItem(item))
      .filter(p => p && p.id);
    return c.json({ success: true, projects });
  } catch (error) {
    console.error('[SERVER] Projects error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};
app.get("/projects", getProjectsHandler);
app.get(`${PREFIX}/projects`, getProjectsHandler);

const saveProjectHandler = async (c: any) => {
  try {
    const body = await c.req.json();
    const projectId = body.id || `project-${Date.now()}`;
    const token = c.req.header('x-admin-token') || c.req.header('authorization')?.replace('Bearer ', '');
    const user = getUserFromToken(token);
    
    const existingData = await kv.get(`project:${projectId}`);
    const existingProject = parseKvItem(existingData);
    
    if (existingProject) {
      const isAdmin = user?.isAdmin || false;
      const isCreator = user && user.email === existingProject.creatorEmail;
      if (!isAdmin && !isCreator) return c.json({ error: 'Unauthorized' }, 403);
    }
    
    await kv.set(`project:${projectId}`, JSON.stringify({ ...body, id: projectId, updatedAt: Date.now() }));
    return c.json({ success: true, projectId });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
};
app.post("/projects", saveProjectHandler);
app.post(`${PREFIX}/projects`, saveProjectHandler);

const getProjectByIdHandler = async (c: any) => {
  try {
    const data = await kv.get(`project:${c.req.param('id')}`);
    const project = parseKvItem(data);
    if (project) {
      project.views = (project.views || 0) + 1;
      await kv.set(`project:${project.id}`, JSON.stringify(project));
      return c.json({ success: true, project });
    }
    return c.json({ error: 'Not found' }, 404);
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
};
app.get("/projects/:id", getProjectByIdHandler);
app.get(`${PREFIX}/projects/:id`, getProjectByIdHandler);

const deleteProjectHandler = async (c: any) => {
  try {
    const token = c.req.header('x-admin-token') || c.req.header('authorization')?.replace('Bearer ', '');
    const user = getUserFromToken(token);
    if (!user) return c.json({ error: 'Unauthorized' }, 401);
    
    const data = await kv.get(`project:${c.req.param('id')}`);
    const project = parseKvItem(data);
    if (!project) return c.json({ error: 'Project not found' }, 404);
    
    const isAdmin = user.isAdmin || false;
    const isCreator = user.email === project.creatorEmail;
    if (!isAdmin && !isCreator) return c.json({ error: 'Unauthorized' }, 403);
    
    await kv.del(`project:${c.req.param('id')}`);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
};
app.delete("/projects/:id", deleteProjectHandler);
app.delete(`${PREFIX}/projects/:id`, deleteProjectHandler);

// Ads
const getAdsHandler = async (c: any) => {
  try {
    const data = await kv.get('global:ads');
    return c.json({ success: true, ads: parseKvItem(data) || [] });
  } catch (error) { return c.json({ error: 'Internal server error' }, 500); }
};
app.get("/ads", getAdsHandler);
app.get(`${PREFIX}/ads`, getAdsHandler);

const saveAdsHandler = async (c: any) => {
  try {
    const token = c.req.header('x-admin-token') || c.req.header('authorization')?.replace('Bearer ', '');
    const user = getUserFromToken(token);
    if (!user || !user.isAdmin) return c.json({ error: 'Unauthorized' }, 401);
    const body = await c.req.json();
    await kv.set('global:ads', JSON.stringify(body.ads));
    return c.json({ success: true });
  } catch (error) { return c.json({ error: 'Internal server error' }, 500); }
};
app.post("/ads", saveAdsHandler);
app.post(`${PREFIX}/ads`, saveAdsHandler);

// Analytics
app.post(`${PREFIX}/analytics/track-visit`, async (c) => {
  try {
    const body = await c.req.json();
    await kv.set(`visit:${Date.now()}`, JSON.stringify(body));
    return c.json({ success: true });
  } catch { return c.json({ success: false }); }
});

// Form Handlers
app.post(`${PREFIX}/contact`, async (c) => {
  try {
    const body = await c.req.json();
    await kv.set(`contact:${Date.now()}`, JSON.stringify(body));
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post(`${PREFIX}/bug-report`, async (c) => {
  try {
    const body = await c.req.json();
    await kv.set(`bug:${Date.now()}`, JSON.stringify(body));
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Admin Analytics & Messages
app.get(`${PREFIX}/admin/analytics`, async (c) => {
  try {
    const token = c.req.header('x-admin-token') || c.req.header('authorization')?.replace('Bearer ', '');
    const user = getUserFromToken(token);
    if (!user || !user.isAdmin) return c.json({ error: 'Unauthorized' }, 401);
    const visits = (await kv.getByPrefix('visit:')).map(parseKvItem).filter(Boolean);
    return c.json({ success: true, stats: { totalVisits: visits.length }, recentVisits: visits.slice(-50) });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get(`${PREFIX}/admin/messages`, async (c) => {
  try {
    const token = c.req.header('x-admin-token') || c.req.header('authorization')?.replace('Bearer ', '');
    const user = getUserFromToken(token);
    if (!user || !user.isAdmin) return c.json({ error: 'Unauthorized' }, 401);
    const contacts = (await kv.getByPrefix('contact:')).map(parseKvItem).filter(Boolean);
    const bugs = (await kv.getByPrefix('bug:')).map(parseKvItem).filter(Boolean);
    return c.json({ success: true, contacts, bugs });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Error handling
app.all('*', (c) => {
  console.log(`404: ${c.req.method} ${c.req.path}`);
  return c.json({ error: 'Not found', path: c.req.path }, 404);
});

app.onError((err, c) => {
  console.error('Hono Error:', err);
  return c.json({ error: 'Internal server error', details: err.message }, 500);
});

Deno.serve(app.fetch);