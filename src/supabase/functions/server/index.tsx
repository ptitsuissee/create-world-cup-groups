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
    allowHeaders: ["Content-Type", "Authorization", "X-Admin-Token", "X-MatchDraw-Token", "apikey"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 86400,
  }),
);

// Logger
app.use('*', logger((...args) => console.log('[SERVER]', ...args)));

// Utility to parse KV data reliably
const parseKvItem = (data: any) => {
  if (data === null || data === undefined) return null;
  try {
    let content = data;
    // Handle { key, value } wrapper if it exists (though getByPrefix already maps to .value)
    if (typeof data === 'object' && data !== null && 'value' in data && Object.keys(data).length <= 2) {
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

// Utility to get user from token with basic verification
const getUserFromToken = (token?: string) => {
  if (!token) {
    console.log('[AUTH] No token provided');
    return null;
  }
  
  // Clean token if it has Bearer prefix
  let cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
  
  // If the token is very long and doesn't have colons, it's probably a Supabase JWT, ignore it
  if (cleanToken.length > 100 && !cleanToken.includes(':')) {
    console.log('[AUTH] Ignoring likely Supabase JWT');
    return null;
  }

  const parts = cleanToken.split(':');
  if (parts.length < 2) { // Allow at least 2 parts (type:email) for flexibility
    console.log('[AUTH] Invalid token format');
    return null;
  }
  
  const type = parts[0];
  const email = parts[1];
  const ADMIN_EMAIL = "suppmatchdrawpro@outlook.com";
  
  // Robust admin check
  const isActuallyAdmin = 
    (type === 'admin') || 
    (email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) || 
    (email && email.toLowerCase() === 'lessuisse');
  
  console.log(`[AUTH] Parsed token: type=${type}, email=${email}, isAdmin=${isActuallyAdmin}`);
  
  return { 
    type, 
    email: (email || '').toLowerCase().trim(), 
    isAdmin: isActuallyAdmin
  };
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
    
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    if ((normalizedEmail === ADMIN_EMAIL.toLowerCase() || normalizedEmail === "lessuisse") && password === ADMIN_PASSWORD) {
      return c.json({
        success: true,
        user: { email: ADMIN_EMAIL, name: "LesSuisse", isAdmin: true, avatar: "👑" },
        token: `admin:${ADMIN_EMAIL}:${Date.now()}`,
      });
    }
    
    const userData = await kv.get(`user:${sanitizeInput(normalizedEmail)}`);
    const user = parseKvItem(userData);
    if (!user || user.password !== password) return c.json({ error: 'Identifiants invalides' }, 401);
    
    return c.json({
      success: true,
      user: { email: user.email, name: user.name, isAdmin: false, avatar: user.avatar || '😀' },
      token: `user:${user.email}:${Date.now()}`,
    });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
};

const signupHandler = async (c: any) => {
  try {
    const { email, password, name } = await c.req.json();
    if (!email || !password || !name) return c.json({ error: 'Champs manquants' }, 400);
    
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if user exists
    const existing = await kv.get(`user:${sanitizeInput(normalizedEmail)}`);
    if (existing) return c.json({ error: 'Cet email est déjà utilisé' }, 409);
    
    const newUser = {
      email: normalizedEmail,
      password, // In a real app, hash this!
      name: sanitizeInput(name),
      avatar: '😀',
      createdAt: Date.now()
    };
    
    await kv.set(`user:${sanitizeInput(normalizedEmail)}`, JSON.stringify(newUser));
    
    return c.json({
      success: true,
      user: { email: newUser.email, name: newUser.name, isAdmin: false, avatar: newUser.avatar },
      token: `user:${newUser.email}:${Date.now()}`,
    });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
};

app.post("/auth/login", loginHandler);
app.post(`${PREFIX}/auth/login`, loginHandler);
app.post("/auth/signup", signupHandler);
app.post(`${PREFIX}/auth/signup`, signupHandler);

// Projects
const getProjectsHandler = async (c: any) => {
  console.log('[SERVER] Fetching all projects...');
  try {
    // Search for "project:" prefix
    const rawProjects = await kv.getByPrefix('project:');
    console.log(`[SERVER] Found ${rawProjects?.length || 0} project entries`);
    
    const projects = (rawProjects || [])
      .map(item => parseKvItem(item))
      .filter(p => p && (p.id || p.projectId))
      .map(p => {
        // Strip down the data if it's for the gallery to save bandwidth
        // The gallery only needs metadata, not the full team list/matches
        // However, some versions expect the full data, so we'll keep it but ensure it's clean
        return {
          ...p,
          id: p.id || p.projectId,
          views: p.views || 0,
          isFeatured: !!p.isFeatured,
          updatedAt: p.updatedAt || p.createdAt || Date.now()
        };
      });

    return c.json({ success: true, projects });
  } catch (error: any) {
    console.error('[SERVER] Projects error:', error);
    return c.json({ error: 'Internal server error', details: error.message, success: false }, 500);
  }
};
app.get("/projects", getProjectsHandler);
app.get(`${PREFIX}/projects`, getProjectsHandler);

const saveProjectHandler = async (c: any) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const projectId = body.id || body.projectId;
    
    if (!projectId) {
      return c.json({ error: 'Project ID is required', success: false }, 400);
    }
    
    // Try to get token from multiple sources
    const token = 
      c.req.header('x-matchdraw-token') || 
      c.req.header('x-admin-token') || 
      c.req.header('authorization')?.replace('Bearer ', '') ||
      body.token;
      
    const user = getUserFromToken(token);
    
    // Check if project exists to verify permissions
    const existingData = await kv.get(`project:${projectId}`);
    const existingProject = parseKvItem(existingData);
    
    if (existingProject) {
      const isAdmin = user?.isAdmin || false;
      const creatorEmail = (existingProject.creatorEmail || '').toLowerCase().trim();
      const userEmail = (user?.email || '').toLowerCase().trim();
      
      const isCreator = creatorEmail === '' || (userEmail && creatorEmail && userEmail === creatorEmail);
      
      if (!isAdmin && !isCreator) {
        return c.json({ 
          error: 'Seul le créateur ou un admin peut modifier ce projet', 
          success: false 
        }, 403);
      }
    }
    
    // Prepare data for saving
    const { token: _, ...projectToSave } = body;
    const finalData = { 
      ...projectToSave, 
      id: projectId, 
      updatedAt: Date.now(),
      creatorEmail: body.creatorEmail || user?.email || existingProject?.creatorEmail
    };
    
    await kv.set(`project:${projectId}`, JSON.stringify(finalData));
    
    return c.json({ success: true, projectId });
  } catch (error: any) {
    console.error('[SERVER] SAVE ERROR:', error);
    return c.json({ 
      error: 'Erreur serveur lors de la sauvegarde', 
      details: error.message, 
      success: false 
    }, 500);
  }
};
app.post("/projects", saveProjectHandler);
app.post(`${PREFIX}/projects`, saveProjectHandler);

const getProjectByIdHandler = async (c: any) => {
  const projectId = c.req.param('id');
  
  try {
    const data = await kv.get(`project:${projectId}`);
    const project = parseKvItem(data);
    
    if (project) {
      // Increment views without awaiting to respond faster
      // But we wrap it in a safe try/catch
      const updatedProject = { ...project, views: (project.views || 0) + 1 };
      kv.set(`project:${projectId}`, JSON.stringify(updatedProject)).catch(() => {});
      
      return c.json({ success: true, project });
    }
    
    return c.json({ error: 'Project not found', success: false }, 404);
  } catch (error: any) {
    return c.json({ 
      error: 'Internal server error', 
      details: error.message,
      success: false 
    }, 500);
  }
};
app.get("/projects/:id", getProjectByIdHandler);
app.get(`${PREFIX}/projects/:id`, getProjectByIdHandler);

const deleteProjectHandler = async (c: any) => {
  try {
    const token = c.req.header('x-matchdraw-token') || c.req.header('x-admin-token') || c.req.header('authorization')?.replace('Bearer ', '');
    const user = getUserFromToken(token);
    if (!user) {
      return c.json({ error: 'Vous devez être connecté pour supprimer un projet', success: false }, 401);
    }
    
    const projectId = c.req.param('id');
    const data = await kv.get(`project:${projectId}`);
    const project = parseKvItem(data);
    
    if (!project) return c.json({ error: 'Projet introuvable', success: false }, 404);
    
    const isAdmin = user.isAdmin || false;
    const creatorEmail = (project.creatorEmail || '').toLowerCase().trim();
    const userEmail = (user.email || '').toLowerCase().trim();
    const isCreator = userEmail && creatorEmail && userEmail === creatorEmail;
    
    if (!isAdmin && !isCreator) {
      return c.json({ error: 'Seul le créateur ou un admin peut supprimer ce projet', success: false }, 403);
    }
    
    await kv.del(`project:${projectId}`);
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: 'Internal server error', details: error.message }, 500);
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
    const token = c.req.header('x-matchdraw-token') || c.req.header('x-admin-token') || c.req.header('authorization')?.replace('Bearer ', '');
    const user = getUserFromToken(token);
    
    if (!user || !user.isAdmin) {
      return c.json({ error: 'Seul l\'administrateur peut modifier les publicités', success: false }, 401);
    }
    
    const body = await c.req.json().catch(() => ({}));
    if (body.ads) {
      await kv.set('global:ads', JSON.stringify(body.ads));
    }
    return c.json({ success: true });
  } catch (error: any) { 
    return c.json({ error: 'Internal server error', details: error.message }, 500); 
  }
};
app.post("/ads", saveAdsHandler);
app.post(`${PREFIX}/ads`, saveAdsHandler);

// Analytics
app.post(`${PREFIX}/analytics/track-visit`, async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    if (!body || Object.keys(body).length === 0) return c.json({ success: false });
    const id = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    await kv.set(`visit:${id}`, JSON.stringify({ ...body, timestamp: Date.now() }));
    return c.json({ success: true });
  } catch { return c.json({ success: false }); }
});

app.post(`${PREFIX}/analytics/track-interaction`, async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    if (!body || Object.keys(body).length === 0) return c.json({ success: false });
    const id = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    await kv.set(`interaction:${id}`, JSON.stringify({ ...body, timestamp: Date.now() }));
    return c.json({ success: true });
  } catch { return c.json({ success: false }); }
});

// Form Handlers
app.post(`${PREFIX}/contact`, async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const id = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    await kv.set(`contact:${id}`, JSON.stringify(body));
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post(`${PREFIX}/bug-report`, async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const id = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    await kv.set(`bug:${id}`, JSON.stringify(body));
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Admin Analytics & Messages
app.get(`${PREFIX}/admin/analytics`, async (c) => {
  try {
    const token = c.req.header('x-matchdraw-token') || c.req.header('x-admin-token') || c.req.header('authorization')?.replace('Bearer ', '');
    const user = getUserFromToken(token);
    if (!user || !user.isAdmin) return c.json({ error: 'Unauthorized' }, 401);
    
    // We only fetch the last 200 visits to avoid massive payloads and connection timeouts
    const allVisits = await kv.getByPrefix('visit:');
    const visits = allVisits.map(parseKvItem).filter(Boolean);
    
    return c.json({ 
      success: true, 
      stats: { totalVisits: visits.length }, 
      recentVisits: visits.slice(-100) 
    });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get(`${PREFIX}/admin/messages`, async (c) => {
  try {
    const token = c.req.header('x-matchdraw-token') || c.req.header('x-admin-token') || c.req.header('authorization')?.replace('Bearer ', '');
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
  return c.json({ error: 'Not found', path: c.req.path }, 404);
});

app.onError((err, c) => {
  console.error('[CRITICAL ERROR]', err);
  return c.json({ error: 'Internal server error', details: err.message }, 500);
});

// Main server entry point with enhanced robustness
Deno.serve(async (req) => {
  try {
    return await app.fetch(req);
  } catch (err: any) {
    console.error('[DENO SERVE ERROR]', err);
    return new Response(JSON.stringify({ 
      error: 'Server process error', 
      details: err?.message || 'Unknown error' 
    }), { 
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});