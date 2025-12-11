// Client-side security utilities

// Sanitize user input to prevent XSS
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 10000); // Limit length
}

// Validate email format
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Validate input for suspicious patterns
export function validateInput(input: string, maxLength: number = 1000): boolean {
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

// Rate limiting on client side (localStorage based)
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  contact: { maxRequests: 5, windowMs: 3600000 }, // 5 per hour
  bugReport: { maxRequests: 10, windowMs: 3600000 }, // 10 per hour
  auth: { maxRequests: 5, windowMs: 300000 }, // 5 per 5 minutes
};

export function checkRateLimit(action: keyof typeof RATE_LIMITS): { allowed: boolean; retryAfter?: number } {
  const config = RATE_LIMITS[action];
  if (!config) return { allowed: true };
  
  const key = `ratelimit_${action}`;
  const data = localStorage.getItem(key);
  
  let rateLimitData: { count: number; resetAt: number };
  
  if (data) {
    rateLimitData = JSON.parse(data);
    
    // Check if window has expired
    if (Date.now() > rateLimitData.resetAt) {
      rateLimitData = { count: 0, resetAt: Date.now() + config.windowMs };
    }
  } else {
    rateLimitData = { count: 0, resetAt: Date.now() + config.windowMs };
  }
  
  // Check if limit exceeded
  if (rateLimitData.count >= config.maxRequests) {
    const retryAfter = Math.ceil((rateLimitData.resetAt - Date.now()) / 1000);
    return { allowed: false, retryAfter };
  }
  
  // Increment counter
  rateLimitData.count++;
  localStorage.setItem(key, JSON.stringify(rateLimitData));
  
  return { allowed: true };
}

// Generate CSRF token
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Store and validate CSRF token
export function getCSRFToken(): string {
  let token = sessionStorage.getItem('csrf_token');
  if (!token) {
    token = generateCSRFToken();
    sessionStorage.setItem('csrf_token', token);
  }
  return token;
}

// Secure API request wrapper
export async function secureApiRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Add security headers
  const headers = new Headers(options.headers || {});
  
  // Add CSRF token for state-changing requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method || 'GET')) {
    headers.set('X-CSRF-Token', getCSRFToken());
  }
  
  // Add timestamp to prevent replay attacks
  headers.set('X-Timestamp', Date.now().toString());
  
  // Add origin header
  if (typeof window !== 'undefined') {
    headers.set('Origin', window.location.origin);
  }
  
  const secureOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'omit', // Don't send cookies to prevent CSRF
  };
  
  try {
    const response = await fetch(url, secureOptions);
    
    // Check rate limit headers
    const rateLimit = response.headers.get('X-RateLimit-Limit');
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    
    if (rateLimit && rateLimitRemaining) {
      console.debug(`Rate limit: ${rateLimitRemaining}/${rateLimit} remaining`);
    }
    
    return response;
  } catch (error) {
    console.error('Secure API request failed:', error);
    throw error;
  }
}

// Detect bot-like behavior
export function detectBotBehavior(): boolean {
  // Check if running in a headless browser
  if (navigator.webdriver) {
    console.warn('Headless browser detected');
    return true;
  }
  
  // Check for missing browser features
  if (!window.navigator.plugins || window.navigator.plugins.length === 0) {
    console.warn('No browser plugins detected');
    return true;
  }
  
  return false;
}

// Honeypot field generator
export function createHoneypotField(): string {
  const fieldNames = ['website', 'url', 'homepage', 'company', 'phone_number'];
  return fieldNames[Math.floor(Math.random() * fieldNames.length)];
}

// Client-side request throttling
const requestTimestamps = new Map<string, number[]>();

export function throttleRequest(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const timestamps = requestTimestamps.get(key) || [];
  
  // Remove old timestamps outside the window
  const recentTimestamps = timestamps.filter(t => now - t < windowMs);
  
  if (recentTimestamps.length >= maxRequests) {
    console.warn(`Request throttled: ${key}`);
    return false;
  }
  
  recentTimestamps.push(now);
  requestTimestamps.set(key, recentTimestamps);
  
  return true;
}

// Clean up old throttle data periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of requestTimestamps.entries()) {
    const recentTimestamps = timestamps.filter(t => now - t < 60000);
    if (recentTimestamps.length === 0) {
      requestTimestamps.delete(key);
    } else {
      requestTimestamps.set(key, recentTimestamps);
    }
  }
}, 60000);

// Escape HTML to prevent XSS
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Generate secure random ID
export function generateSecureId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
