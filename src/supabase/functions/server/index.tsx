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
    // Search for both "project:" and "project-" prefixes to be safe with older versions
    const rawProjects = await kv.getByPrefix('project');
    console.log(`[SERVER] Found ${rawProjects?.length || 0} raw project entries`);
    
    const projects = (rawProjects || [])
      .map(item => parseKvItem(item))
      .filter(p => {
        const isValid = p && (p.id || p.projectId);
        if (p && !p.id && p.projectId) p.id = p.projectId; // Alias for compatibility
        return isValid;
      })
      .map(p => ({
        ...p,
        views: p.views || 0,
        isFeatured: !!p.isFeatured,
        updatedAt: p.updatedAt || p.createdAt || Date.now()
      }));

    console.log(`[SERVER] Returning ${projects.length} valid projects`);
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
    const body = await c.req.json();
    const projectId = body.id || body.projectId || `project-${Date.now()}`;
    
    // Try to get token from multiple sources
    const token = 
      c.req.header('x-matchdraw-token') || 
      c.req.header('x-admin-token') || 
      c.req.header('authorization')?.replace('Bearer ', '') ||
      body.token;
      
    const user = getUserFromToken(token);
    
    console.log(`[SERVER] SAVE project: ${projectId}`);
    console.log(`[SERVER] Auth source: ${token ? 'provided' : 'none'}, user: ${user?.email || 'anon'}, admin: ${user?.isAdmin}`);
    
    // Check if project exists to verify permissions
    const existingData = await kv.get(`project:${projectId}`);
    const existingProject = parseKvItem(existingData);
    
    if (existingProject) {
      const isAdmin = user?.isAdmin || false;
      const creatorEmail = (existingProject.creatorEmail || '').toLowerCase().trim();
      const userEmail = (user?.email || '').toLowerCase().trim();
      
      // If project has no owner, let the first authenticated person claim it
      // Otherwise, check if user is creator or admin
      const isCreator = creatorEmail === '' || (userEmail && creatorEmail && userEmail === creatorEmail);
      
      console.log(`[SERVER] Permission Check - isAdmin: ${isAdmin}, isCreator: ${isCreator} (User:${userEmail} vs Creator:${creatorEmail || 'none'})`);
      
      if (!isAdmin && !isCreator) {
        console.warn(`[SERVER] Permission DENIED for ${projectId}`);
        return c.json({ 
          error: 'Seul le créateur ou un admin peut modifier ce projet', 
          details: `User: ${userEmail || 'anon'}, Project: ${projectId}`,
          success: false 
        }, 403);
      }
      console.log(`[SERVER] Permission GRANTED`);
    } else {
      console.log(`[SERVER] Creating NEW project: ${projectId}`);
    }
    
    // Prepare data for saving
    const { token: _, ...projectToSave } = body;
    const finalData = { 
      ...projectToSave, 
      id: projectId, 
      updatedAt: Date.now(),
      creatorEmail: body.creatorEmail || user?.email || existingProject?.creatorEmail
    };
    
    // Save to KV store
    await kv.set(`project:${projectId}`, JSON.stringify(finalData));
    
    console.log(`[SERVER] Save SUCCESS: ${projectId}`);
    return c.json({ success: true, projectId });
  } catch (error: any) {
    console.error('[SERVER] CRITICAL SAVE ERROR:', error);
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
  console.log(`[SERVER] Fetching project: ${projectId}`);
  
  try {
    const data = await kv.get(`project:${projectId}`);
    const project = parseKvItem(data);
    
    if (project) {
      // Robustness: ensure project has the expected structure
      // Increment views asynchronously - don't block the response
      try {
        project.views = (project.views || 0) + 1;
        kv.set(`project:${projectId}`, JSON.stringify(project)).catch(err => 
          console.error(`[SERVER] Error updating views for ${projectId}:`, err)
        );
      } catch (e) {
        console.warn(`[SERVER] Could not update views for ${projectId}`, e);
      }
      
      return c.json({ success: true, project });
    }
    
    console.log(`[SERVER] Project not found: ${projectId}`);
    return c.json({ error: 'Project not found', success: false }, 404);
  } catch (error: any) {
    console.error(`[SERVER] Error fetching project ${projectId}:`, error);
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
      console.log('[SERVER] Delete project DENIED: No user found from token');
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
    
    console.log(`[SERVER] Deleting project ${projectId}. isAdmin: ${isAdmin}, isCreator: ${isCreator}`);
    
    if (!isAdmin && !isCreator) {
      return c.json({ error: 'Seul le créateur ou un admin peut supprimer ce projet', success: false }, 403);
    }
    
    await kv.del(`project:${projectId}`);
    return c.json({ success: true });
  } catch (error: any) {
    console.error('[SERVER] Delete project error:', error);
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
    
    console.log(`[SERVER] Save ADS attempt by ${user?.email || 'unknown'}. isAdmin: ${user?.isAdmin}`);
    
    if (!user || !user.isAdmin) {
      return c.json({ error: 'Seul l\'administrateur peut modifier les publicités', success: false }, 401);
    }
    
    const body = await c.req.json();
    await kv.set('global:ads', JSON.stringify(body.ads));
    return c.json({ success: true });
  } catch (error: any) { 
    console.error('[SERVER] Save ADS error:', error);
    return c.json({ error: 'Internal server error', details: error.message }, 500); 
  }
};
app.post("/ads", saveAdsHandler);
app.post(`${PREFIX}/ads`, saveAdsHandler);

// Analytics
app.post(`${PREFIX}/analytics/track-visit`, async (c) => {
  try {
    const body = await c.req.json();
    const id = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    await kv.set(`visit:${id}`, JSON.stringify({ ...body, timestamp: Date.now() }));
    return c.json({ success: true });
  } catch { return c.json({ success: false }); }
});

app.post(`${PREFIX}/analytics/track-interaction`, async (c) => {
  try {
    const body = await c.req.json();
    const id = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    await kv.set(`interaction:${id}`, JSON.stringify({ ...body, timestamp: Date.now() }));
    return c.json({ success: true });
  } catch { return c.json({ success: false }); }
});

// Form Handlers
app.post(`${PREFIX}/contact`, async (c) => {
  try {
    const body = await c.req.json();
    const id = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    await kv.set(`contact:${id}`, JSON.stringify(body));
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post(`${PREFIX}/bug-report`, async (c) => {
  try {
    const body = await c.req.json();
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
    const visits = (await kv.getByPrefix('visit:')).map(parseKvItem).filter(Boolean);
    return c.json({ success: true, stats: { totalVisits: visits.length }, recentVisits: visits.slice(-50) });
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
  console.log(`404: ${c.req.method} ${c.req.path}`);
  return c.json({ error: 'Not found', path: c.req.path }, 404);
});

app.onError((err, c) => {
  console.error('Hono Error:', err);
  return c.json({ error: 'Internal server error', details: err.message }, 500);
});

Deno.serve(app.fetch);