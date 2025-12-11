# 🔐 Système d'Authentification MatchDraw Pro

## 📅 Date d'implémentation
**Décembre 2024 - v3.0.0**

---

## 🎯 Vue d'ensemble

Système d'authentification complet permettant aux utilisateurs de créer un compte et de se connecter pour sauvegarder leurs projets de tournois.

---

## ✨ Fonctionnalités

### 1. **Création de Compte (Sign Up)**
- ✅ Formulaire avec nom, email, mot de passe
- ✅ Confirmation du mot de passe
- ✅ Validation des champs
- ✅ Vérification de la longueur du mot de passe (min 6 caractères)
- ✅ Messages d'erreur personnalisés

### 2. **Connexion (Login)**
- ✅ Formulaire avec email et mot de passe
- ✅ Validation des champs
- ✅ Stockage du token d'authentification
- ✅ Mémorisation de l'utilisateur

### 3. **Menu Utilisateur**
- ✅ Avatar avec initiales
- ✅ Affichage nom et email
- ✅ Menu déroulant avec options
- ✅ Bouton de déconnexion
- ✅ Liens vers projets et paramètres (à implémenter)

### 4. **Interface Principale**
- ✅ Boutons "Connexion" et "Créer un compte" dans le header
- ✅ Affichage conditionnel selon l'état d'authentification
- ✅ Menu utilisateur pour les connectés
- ✅ Design cohérent avec le reste de l'app

---

## 📁 Fichiers Créés

### 1. `/components/AuthModal.tsx`
Modal d'authentification avec deux modes :
- **Login** : Connexion utilisateur existant
- **Signup** : Création de nouveau compte

**Fonctionnalités :**
```typescript
- Formulaire dynamique selon le mode
- Validation côté client
- Messages d'erreur contextuels
- Animations et transitions fluides
- Design glassmorphisme
- Responsive
```

### 2. `/components/UserMenu.tsx`
Menu utilisateur pour les personnes connectées

**Fonctionnalités :**
```typescript
- Avatar avec initiales automatiques
- Dropdown menu avec options
- Liens vers "Mes projets"
- Liens vers "Paramètres"
- Bouton de déconnexion
- Fermeture au clic extérieur
```

---

## 🔧 Modifications de Fichiers Existants

### `/App.tsx`

#### Nouveaux imports
```typescript
import { AuthModal } from './components/AuthModal';
import { UserMenu } from './components/UserMenu';
```

#### Nouveaux états
```typescript
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [showAuthModal, setShowAuthModal] = useState(false);
const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
const [userName, setUserName] = useState('');
const [userEmail, setUserEmail] = useState('');
```

#### Nouveaux effets
```typescript
// Vérification de l'authentification au chargement
useEffect(() => {
  const token = localStorage.getItem('auth_token');
  const email = localStorage.getItem('user_email');
  const name = localStorage.getItem('user_name');
  
  if (token && email) {
    setIsAuthenticated(true);
    setUserEmail(email);
    setUserName(name || email.split('@')[0]);
  }
}, []);
```

#### Nouvelle fonction
```typescript
const handleLogout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_email');
  localStorage.removeItem('user_name');
  setIsAuthenticated(false);
  setUserName('');
  setUserEmail('');
};
```

#### Modifications du header
```typescript
{/* Boutons d'authentification ou menu utilisateur */}
{!isAuthenticated ? (
  <>
    <button onClick={() => { /* Login */ }}>Connexion</button>
    <button onClick={() => { /* Signup */ }}>Créer un compte</button>
  </>
) : (
  <UserMenu {...} />
)}
```

### `/translations.ts`

#### Nouvelles traductions (10 langues)
```typescript
interface Translations {
  // ... existing fields
  // Authentication
  login: string;
  signup: string;
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  enterName: string;
  enterEmail: string;
  enterPassword: string;
  loginSubtitle: string;
  signupSubtitle: string;
  fillAllFields: string;
  passwordsDontMatch: string;
  passwordTooShort: string;
  noAccount: string;
  hasAccount: string;
  myProjects: string;
  viewAllProjects: string;
  accountSettings: string;
  logout: string;
  loading: string;
}
```

**Langues supportées :**
- 🇫🇷 Français
- 🇬🇧 English
- 🇪🇸 Español
- 🇩🇪 Deutsch
- 🇮🇹 Italiano
- 🇵🇹 Português
- 🇸🇦 العربية
- 🇨🇳 中文
- 🇯🇵 日本語
- 🇷🇺 Русский

---

## 💾 Stockage Local (Temporaire)

### LocalStorage Keys
```typescript
'auth_token'   // Token d'authentification
'user_email'   // Email de l'utilisateur
'user_name'    // Nom de l'utilisateur
```

### Structure
```javascript
{
  auth_token: "demo-token-1234567890",
  user_email: "user@example.com",
  user_name: "John Doe"
}
```

**Note :** Cette implémentation est temporaire. Elle sera remplacée par une authentification Supabase dans une version ultérieure.

---

## 🎨 Design

### AuthModal

#### Layout
```
┌──────────────────────────────────┐
│          🔐 / ✨                 │  ← Icône (login/signup)
│                                  │
│    Connexion / Créer un compte   │  ← Titre
│    Sous-titre explicatif         │
│                                  │
│  📧 Email                        │
│  [input email]                   │
│                                  │
│  🔒 Mot de passe                 │
│  [input password]                │
│                                  │
│  [Confirmer] (signup uniquement) │
│                                  │
│  [Bouton principal]              │
│                                  │
│  Pas de compte ? Créer          │  ← Switch mode
└──────────────────────────────────┘
```

#### Couleurs
```css
/* Background */
bg-white/10 backdrop-blur-xl

/* Bordures */
border border-white/20

/* Inputs */
bg-white/5 border-white/20
focus:ring-blue-500/50

/* Bouton principal */
bg-gradient-to-r from-blue-500 to-purple-600
hover:from-blue-600 hover:to-purple-700

/* Erreur */
bg-red-500/20 border-red-400/30
text-red-200
```

### UserMenu

#### Avatar
```typescript
// Génération automatique des initiales
const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Exemple: "John Doe" → "JD"
```

#### Dropdown
```
┌─────────────────────────┐
│  JD  John Doe           │  ← Header avec avatar
│      john@doe.com       │
├─────────────────────────┤
│  📁 Mes projets         │  ← Option 1
│     Voir tous...        │
│                         │
│  ⚙️ Paramètres          │  ← Option 2
│     Paramètres du...    │
├─────────────────────────┤
│  🚪 Déconnexion         │  ← Logout (rouge)
└─────────────────────────┘
```

---

## 🔒 Sécurité

### Validation Côté Client

#### Email
```typescript
type="email"  // Validation HTML5 native
```

#### Mot de passe
```typescript
// Minimum 6 caractères
if (password.length < 6) {
  setError(t.passwordTooShort);
  return;
}
```

#### Confirmation mot de passe
```typescript
if (password !== confirmPassword) {
  setError(t.passwordsDontMatch);
  return;
}
```

### Limitations Actuelles

⚠️ **Important** : L'implémentation actuelle est une **simulation** pour l'interface utilisateur.

```typescript
// TODO: Implémenter l'authentification avec Supabase
await new Promise(resolve => setTimeout(resolve, 1000));

// Stocker un token factice
localStorage.setItem('auth_token', 'demo-token-' + Date.now());
```

**À faire :**
- [ ] Intégration Supabase Auth
- [ ] Hash des mots de passe
- [ ] Tokens JWT réels
- [ ] Refresh tokens
- [ ] Validation serveur
- [ ] Protection CSRF
- [ ] Rate limiting

---

## 🚀 Flux d'Authentification

### Création de Compte

```
1. Utilisateur clique "Créer un compte"
   ↓
2. Modal s'ouvre en mode "signup"
   ↓
3. Utilisateur remplit le formulaire
   - Nom
   - Email
   - Mot de passe
   - Confirmation mot de passe
   ↓
4. Validation côté client
   - Tous les champs remplis ?
   - Mots de passe identiques ?
   - Longueur suffisante ?
   ↓
5. Soumission (simulation actuellement)
   ↓
6. Stockage dans localStorage
   - auth_token
   - user_email
   - user_name
   ↓
7. Fermeture du modal
   ↓
8. Rechargement de la page
   ↓
9. Affichage du UserMenu
```

### Connexion

```
1. Utilisateur clique "Connexion"
   ↓
2. Modal s'ouvre en mode "login"
   ↓
3. Utilisateur remplit le formulaire
   - Email
   - Mot de passe
   ↓
4. Validation côté client
   - Tous les champs remplis ?
   ↓
5. Soumission (simulation actuellement)
   ↓
6. Stockage dans localStorage
   ↓
7. Fermeture du modal
   ↓
8. Rechargement de la page
   ↓
9. Affichage du UserMenu
```

### Déconnexion

```
1. Utilisateur clique sur UserMenu
   ↓
2. Dropdown s'ouvre
   ↓
3. Utilisateur clique "Déconnexion"
   ↓
4. Suppression du localStorage
   - auth_token
   - user_email
   - user_name
   ↓
5. Mise à jour des états
   - isAuthenticated = false
   - userName = ''
   - userEmail = ''
   ↓
6. Affichage des boutons Login/Signup
```

---

## 📱 Responsive Design

### Desktop (> 768px)
```
Header:
┌──────────────────────────────────────────────┐
│  Logo  MatchDraw Pro                         │
│                                              │
│                  [Login] [Signup] [🌐 Lang] │
└──────────────────────────────────────────────┘
```

### Mobile (< 768px)
```
Header:
┌────────────────────────┐
│  Logo  MatchDraw Pro   │
│                        │
│    [Login] [Signup]    │
│        [🌐 Lang]       │
└────────────────────────┘
```

### UserMenu Responsive
```typescript
{/* Nom/email cachés sur mobile */}
<div className="hidden sm:block text-left">
  <div className="text-sm">{userName}</div>
  <div className="text-xs">{userEmail}</div>
</div>
```

---

## 🎯 Prochaines Étapes

### 1. **Intégration Supabase** (Priorité Haute)
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Sign up
const { data, error } = await supabase.auth.signUp({
  email,
  password,
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// Sign out
await supabase.auth.signOut();
```

### 2. **Sauvegarde des Projets** (Priorité Haute)
```typescript
// Sauvegarder un projet dans Supabase
const saveProject = async (projectData) => {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name: projectData.name,
      groups: projectData.groups,
      matches: projectData.matches,
      // ...
    });
};

// Charger les projets de l'utilisateur
const loadProjects = async () => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id);
};
```

### 3. **Page Mes Projets**
- Liste de tous les projets sauvegardés
- Prévisualisation
- Options de gestion (renommer, dupliquer, supprimer)
- Recherche et filtres

### 4. **Page Paramètres**
- Modifier le nom
- Changer l'email
- Changer le mot de passe
- Supprimer le compte
- Préférences (langue par défaut, thème, etc.)

### 5. **Fonctionnalités Avancées**
- [ ] OAuth (Google, Facebook, etc.)
- [ ] Email de vérification
- [ ] Réinitialisation mot de passe
- [ ] Avatar personnalisé
- [ ] Partage de projets
- [ ] Collaboration en temps réel

---

## 🧪 Tests

### Tests Manuels Effectués
- [x] Affichage des boutons Login/Signup
- [x] Ouverture du modal en mode Login
- [x] Ouverture du modal en mode Signup
- [x] Switch entre Login et Signup
- [x] Validation des champs vides
- [x] Validation mot de passe trop court
- [x] Validation mots de passe différents
- [x] Soumission réussie
- [x] Stockage dans localStorage
- [x] Affichage du UserMenu après connexion
- [x] Menu déroulant fonctionnel
- [x] Déconnexion fonctionnelle
- [x] Persistance de la session (refresh page)
- [x] Multilingue (10 langues)
- [x] Responsive (desktop, tablette, mobile)

---

## 📚 Documentation API (Future)

### Endpoints Supabase

#### Authentication
```typescript
POST /auth/v1/signup
POST /auth/v1/token (login)
POST /auth/v1/logout
POST /auth/v1/recover (reset password)
```

#### Projects
```typescript
GET    /rest/v1/projects
POST   /rest/v1/projects
PATCH  /rest/v1/projects/:id
DELETE /rest/v1/projects/:id
```

#### User Profile
```typescript
GET    /rest/v1/profiles/:user_id
PATCH  /rest/v1/profiles/:user_id
```

---

## ✨ Conclusion

Le système d'authentification est maintenant **fonctionnel au niveau de l'interface utilisateur** avec :

✅ Modal d'authentification complet (Login/Signup)  
✅ Menu utilisateur avec avatar et options  
✅ Gestion de session (localStorage temporaire)  
✅ Support multilingue (10 langues)  
✅ Design glassmorphisme cohérent  
✅ Responsive sur tous les écrans  
✅ Validation des formulaires  
✅ Messages d'erreur contextuels  

**Prochaine étape** : Intégration avec Supabase pour une authentification réelle et la sauvegarde des projets en base de données.

---

**Version** : 3.0.0  
**Date** : Décembre 2024  
**Statut** : ✅ Interface complète - Backend à implémenter
