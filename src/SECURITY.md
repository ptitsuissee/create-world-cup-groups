# Sécurité - MatchDraw Pro

Ce document décrit toutes les mesures de sécurité implémentées pour protéger l'application contre les attaques DDoS, le hacking et autres menaces.

## 🛡️ Mesures de Sécurité Implémentées

### 1. Protection DDoS

#### Rate Limiting Multi-niveaux
- **Par défaut**: 100 requêtes par minute par IP
- **Authentification**: 5 requêtes par 5 minutes
- **Contact/Bug Report**: 10 requêtes par heure
- **API**: 30 requêtes par minute

#### Limitation de connexions concurrentes
- Maximum 15 connexions simultanées par IP
- Nettoyage automatique des compteurs toutes les minutes

#### Headers de rate limiting
- `X-RateLimit-Limit`: Limite maximale
- `X-RateLimit-Remaining`: Requêtes restantes
- `X-RateLimit-Reset`: Timestamp de réinitialisation

### 2. Protection contre les Injections

#### Validation des entrées
- Validation stricte de tous les inputs utilisateur
- Longueur maximale imposée (200-5000 caractères selon le champ)
- Détection de patterns suspects :
  - Scripts JavaScript (`<script`, `javascript:`)
  - Event handlers (`on\w+=`)
  - SQL injection (`union select`, `drop table`, etc.)
  - Path traversal (`../`)
  - Code malveillant (`eval(`, `expression(`)

#### Sanitization
- Suppression des balises HTML dangereuses
- Échappement des caractères spéciaux
- Limitation de la longueur (max 10KB)

### 3. Protection XSS (Cross-Site Scripting)

#### Headers de sécurité
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; ...
```

#### Sanitization côté client et serveur
- Double validation (client + serveur)
- Échappement HTML automatique
- Suppression des protocoles dangereux

### 4. Protection CSRF (Cross-Site Request Forgery)

#### Vérification d'origine
- Vérification des headers `Origin` et `Referer`
- Tokens CSRF générés aléatoirement
- Validation des timestamps (fenêtre de 5 minutes)

#### Headers de sécurité
- Vérification obligatoire pour POST, PUT, DELETE, PATCH

### 5. Détection de Bots

#### Système Honeypot
- Champs cachés générés aléatoirement
- Double honeypot (`_honeypot` + champ dynamique)
- Position absolue hors écran (-9999px)
- Tabindex -1 pour éviter la sélection

#### Détection de comportement suspect
- Vérification de `navigator.webdriver`
- Détection de navigateurs headless
- Blocage automatique après 20 tentatives échouées

### 6. CAPTCHA de Sécurité

#### Vérification mathématique
- Questions mathématiques simples
- 3 niveaux de difficulté (easy, medium, hard)
- 3 tentatives maximum avant nouveau challenge
- Régénération automatique

### 7. Blocage d'IP

#### Blocage automatique
- Détection d'activité suspecte
- Blocage temporaire (1 heure par défaut)
- Stockage dans KV store
- Cache en mémoire pour performances

#### Critères de blocage
- Plus de 20 tentatives d'auth échouées
- Honeypot déclenché
- Patterns d'attaque détectés

### 8. Limitation de Taille

#### Body size limit
- 200KB maximum par requête
- Protection contre memory exhaustion
- Réponse HTTP 413 si dépassement

### 9. Sécurité des Données

#### Stockage sécurisé
- Mots de passe : **À hasher avec bcrypt en production**
- Données sensibles isolées
- Admin credentials en dur (pas en base)

#### Audit trail
- Logging de toutes les actions sensibles
- IP tracking pour investigation
- User-Agent logging

### 10. Headers de Sécurité Avancés

```typescript
Permissions-Policy: geolocation=(), microphone=(), camera=()
Content-Security-Policy: Politique stricte
X-Timestamp: Prévention replay attacks
```

## 🔐 Recommandations de Production

### Urgent - Avant mise en production

1. **Mots de passe**
   ```typescript
   // MAUVAIS (actuel)
   if (user.password !== password)
   
   // BON (à implémenter)
   if (!await bcrypt.compare(password, user.passwordHash))
   ```

2. **HTTPS obligatoire**
   - Certificat SSL/TLS
   - Redirection HTTP → HTTPS
   - HSTS headers

3. **Variables d'environnement**
   ```typescript
   const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL');
   const ADMIN_PASSWORD_HASH = Deno.env.get('ADMIN_PASSWORD_HASH');
   ```

4. **WAF (Web Application Firewall)**
   - Cloudflare
   - AWS WAF
   - Azure Front Door

5. **CDN avec protection DDoS**
   - Cloudflare (recommandé)
   - Akamai
   - Fastly

6. **Rate limiting distribué**
   - Redis pour le rate limiting
   - Synchronisation multi-instances

7. **Monitoring et alertes**
   - Sentry pour les erreurs
   - Datadog/New Relic pour les métriques
   - Alertes en temps réel

## 📊 Endpoints Sécurisés

| Endpoint | Rate Limit | Protections |
|----------|------------|-------------|
| `/health` | 100/min | Aucune (public) |
| `/contact` | 10/hour | Captcha, Honeypot, Validation |
| `/bug-report` | 10/hour | Captcha, Honeypot, Validation |
| `/auth/login` | 5/5min | Brute-force protection, IP blocking |
| `/auth/signup` | 5/5min | Validation, Honeypot |
| `/projects` | 30/min | Auth required, Validation |

## 🚨 Détection d'Attaques

### Patterns surveillés

1. **Brute Force**
   - 5+ tentatives de login échouées
   - Blocage IP 1 heure

2. **SQL Injection**
   - Patterns détectés dans les inputs
   - Requête bloquée + IP suspecte

3. **XSS Attempts**
   - Scripts détectés
   - Sanitization automatique

4. **Path Traversal**
   - `../` dans les paramètres
   - Requête rejetée

5. **DDoS**
   - Plus de 15 connexions simultanées
   - HTTP 429 Too Many Requests

## 🔄 Maintenance

### Nettoyage automatique
- Compteurs de rate limit: Toutes les minutes
- IPs bloquées expirées: Automatique (vérification à la requête)
- Timestamps de throttling: Toutes les minutes

### Logs à surveiller
```bash
# Honeypot triggers
grep "Honeypot triggered" logs.txt

# IP blocks
grep "IP blocked" logs.txt

# DDoS protection
grep "DDoS protection triggered" logs.txt

# Failed auth attempts
grep "login-failed" logs.txt
```

## 🛠️ Test de Sécurité

### Outils recommandés
- **OWASP ZAP**: Scanner de vulnérabilités
- **Burp Suite**: Test d'intrusion
- **SQLMap**: Test SQL injection
- **Nikto**: Scanner web
- **Artillery**: Test de charge

### Tests à effectuer

```bash
# Test rate limiting
artillery quick --count 200 --num 1 http://your-api.com/endpoint

# Test SQL injection
sqlmap -u "http://your-api.com/endpoint?param=value"

# Test XSS
# Tester avec: <script>alert('XSS')</script>

# Test CSRF
# Tenter requête depuis domaine différent sans headers
```

## 📞 Signalement de Vulnérabilités

Si vous découvrez une faille de sécurité:

1. **NE PAS** divulguer publiquement
2. Envoyer un email à: **suppmatchdrawpro@outlook.com**
3. Inclure:
   - Description détaillée
   - Étapes de reproduction
   - Impact potentiel
   - Suggestions de correction

## 📝 Changelog Sécurité

### Version 1.0 - 2024
- ✅ Rate limiting multi-niveaux
- ✅ Headers de sécurité
- ✅ Protection CSRF
- ✅ Système de captcha
- ✅ Honeypot anti-bot
- ✅ Validation et sanitization
- ✅ Blocage IP automatique
- ✅ Protection DDoS
- ✅ Détection d'activité suspecte

### À venir
- [ ] Hashing bcrypt des mots de passe
- [ ] 2FA (Two-Factor Authentication)
- [ ] Intégration WAF
- [ ] Rate limiting distribué (Redis)
- [ ] IP reputation scoring
- [ ] Machine learning pour détection d'anomalies

---

**Dernière mise à jour**: Décembre 2024  
**Niveau de sécurité**: Production-ready avec recommandations à appliquer
