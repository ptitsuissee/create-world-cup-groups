# 🔗 Lignes de Connexion du Bracket

## 📐 Système de Connexion Visuelle

Les lignes de connexion permettent de visualiser clairement le flux des équipes gagnantes d'un tour à l'autre.

---

## 🎯 Principe de Base

### Règle Fondamentale
**2 matchs adjacents → 1 match au tour suivant**

```
Match 1 ───┐
           ├──► Match du tour suivant
Match 2 ───┘
```

---

## 📊 Exemple Complet : Tournoi 8 Équipes

### Vue d'Ensemble
```
GAUCHE (Quarts)          DEMI-FINALES          CENTRE          DEMI-FINALES          DROITE (Quarts)

Match 1 ─────┐                                                              ┌───── Match 5
             ├───► Demi 1 ────┐                                        ┌──── Demi 3 ────┤
Match 2 ─────┘                │                                        │                └───── Match 6
                              │                                        │
                              └─────► FINALE ──► 🏆 VAINQUEUR ◄───────┘
                                                                       │
Match 3 ─────┐                │                                        │                ┌───── Match 7
             ├───► Demi 2 ────┘                                        └──── Demi 4 ────┤
Match 4 ─────┘                                                                          └───── Match 8
```

---

## 🔍 Anatomie d'un Connecteur (Côté Gauche)

### Structure Visuelle
```
     Match 1
        │
        ├─────────► (vers tour suivant)
        │
     Match 2
```

### Code SVG
```svg
<svg viewBox="0 0 48 128" width="48" height="128">
  <!-- Ligne horizontale depuis Match 1 -->
  <line 
    x1="0" y1="32"      <!-- Départ : bord gauche, 1/4 hauteur -->
    x2="24" y2="32"     <!-- Arrivée : milieu horizontal -->
    stroke="rgba(255,255,255,0.2)" 
    strokeWidth="2" 
  />
  
  <!-- Connecteur vertical (joint les 2 matchs) -->
  <line 
    x1="24" y1="32"     <!-- Départ : depuis ligne Match 1 -->
    x2="24" y2="96"     <!-- Arrivée : jusqu'à ligne Match 2 -->
    stroke="rgba(255,255,255,0.2)" 
    strokeWidth="2" 
  />
  
  <!-- Ligne horizontale depuis Match 2 -->
  <line 
    x1="0" y1="96"      <!-- Départ : bord gauche, 3/4 hauteur -->
    x2="24" y2="96"     <!-- Arrivée : milieu horizontal -->
    stroke="rgba(255,255,255,0.2)" 
    strokeWidth="2" 
  />
  
  <!-- Flèche vers le tour suivant -->
  <line 
    x1="24" y1="64"     <!-- Départ : milieu de la ligne verticale -->
    x2="48" y2="64"     <!-- Arrivée : bord droit -->
    stroke="rgba(255,255,255,0.3)" 
    strokeWidth="2" 
  />
  
  <!-- Triangle de la flèche -->
  <polygon 
    points="42,60 48,64 42,68"
    fill="rgba(255,255,255,0.3)" 
  />
</svg>
```

### Dimensions et Calculs
```typescript
// ViewBox : 48 (largeur) x 128 (hauteur)

// Positions Y :
const match1_y = 32;      // 25% de 128 = Position Match 1
const match2_y = 96;      // 75% de 128 = Position Match 2
const center_y = 64;      // 50% de 128 = Milieu (flèche)

// Positions X :
const left_x = 0;         // Bord gauche (depuis les matchs)
const middle_x = 24;      // Milieu (point de jonction)
const right_x = 48;       // Bord droit (vers tour suivant)

// Formule générale :
// match1_y = height * 0.25
// match2_y = height * 0.75
// center_y = height * 0.5
```

---

## 🔄 Anatomie d'un Connecteur (Côté Droit)

### Structure Visuelle
```
     Match 5
        │
   ◄────┤
        │
     Match 6
```

### Code SVG
```svg
<svg viewBox="0 0 48 128" width="48" height="128">
  <!-- Flèche depuis le tour précédent (INVERSÉE) -->
  <polygon 
    points="6,60 0,64 6,68"    <!-- Flèche pointant vers la gauche -->
    fill="rgba(255,255,255,0.3)" 
  />
  <line 
    x1="0" y1="64"              <!-- Départ : bord gauche -->
    x2="24" y2="64"             <!-- Arrivée : milieu -->
    stroke="rgba(255,255,255,0.3)" 
    strokeWidth="2" 
  />
  
  <!-- Ligne vers Match 5 -->
  <line 
    x1="24" y1="32"             <!-- Départ : milieu -->
    x2="48" y2="32"             <!-- Arrivée : bord droit (vers match) -->
    stroke="rgba(255,255,255,0.2)" 
    strokeWidth="2" 
  />
  
  <!-- Connecteur vertical -->
  <line 
    x1="24" y1="32" 
    x2="24" y2="96" 
    stroke="rgba(255,255,255,0.2)" 
    strokeWidth="2" 
  />
  
  <!-- Ligne vers Match 6 -->
  <line 
    x1="24" y1="96" 
    x2="48" y2="96" 
    stroke="rgba(255,255,255,0.2)" 
    strokeWidth="2" 
  />
</svg>
```

---

## 🎨 Exemple Concret : 4 Matchs → 2 Matchs

### Quarts de Finale → Demi-Finales

```
QUARTS              CONNECTEURS            DEMI-FINALES

Match 1 (Q1)                                   
    │                    ╔════╗                
    ├──────────────────► ║    ║              Match 1 (D1)
    │                    ║ C1 ║ ◄─────────   (Gagnant Q1 vs Q2)
Match 2 (Q2)             ╚════╝
    │
    
(64px de gap pour espace connecteur)

Match 3 (Q3)
    │                    ╔════╗
    ├──────────────────► ║    ║              Match 2 (D2)
    │                    ║ C2 ║ ◄─────────   (Gagnant Q3 vs Q4)
Match 4 (Q4)             ╚════╝
```

### Code de Génération
```typescript
const quarterMatches = [Q1, Q2, Q3, Q4];  // 4 matchs

quarterMatches.map((match, idx) => {
  if (idx % 2 === 0) {
    // idx = 0 : Connecteur pour Q1 + Q2
    // idx = 2 : Connecteur pour Q3 + Q4
    return <ConnectorSVG />;
  }
  return null;
});

// Résultat : 2 connecteurs (C1, C2)
```

---

## 📐 Espacement et Alignement

### Gap Entre Matchs : 64px (gap-16)

```
Match 1
  ▼
  │  ← 64px de hauteur pour le connecteur SVG (h-32)
  ▼
Match 2
  ▼
  │  ← 64px de gap jusqu'au prochain connecteur
  ▼
Match 3
  ▼
  │  ← 64px de hauteur pour le connecteur SVG (h-32)
  ▼
Match 4
```

### Padding Vertical : 48px (py-12)

```
┌─────────────────┐
│  Header         │
├─────────────────┤
│                 │ ← 48px padding top
│  ╔════════╗     │
│  ║ Match 1║     │
│  ╚════════╝     │
│      │          │
│      │ SVG      │ ← Connecteur aligné
│      │          │
│  ╔════════╗     │
│  ║ Match 2║     │
│  ╚════════╝     │
│                 │ ← 48px padding bottom
└─────────────────┘
```

---

## 🔢 Calcul Automatique des Connecteurs

### Algorithme
```typescript
function renderConnectors(matches) {
  const connectors = [];
  
  for (let i = 0; i < matches.length; i += 2) {
    if (i + 1 < matches.length) {
      // Créer un connecteur pour matches[i] et matches[i+1]
      connectors.push(
        <Connector 
          key={i}
          match1={matches[i]}
          match2={matches[i+1]}
        />
      );
    }
  }
  
  return connectors;
}
```

### Exemple avec 8 Matchs
```typescript
Matches: [M1, M2, M3, M4, M5, M6, M7, M8]

Itération 1 (i=0): Connecteur C1 pour M1 + M2
Itération 2 (i=2): Connecteur C2 pour M3 + M4
Itération 3 (i=4): Connecteur C3 pour M5 + M6
Itération 4 (i=6): Connecteur C4 pour M7 + M8

Résultat: 4 connecteurs
```

---

## 🎯 Direction des Flèches

### Côté Gauche (→)
```svg
<!-- Flèche pointant vers la droite -->
<line x1="24" y1="64" x2="48" y2="64" />
<polygon points="42,60 48,64 42,68" />
<!--              ↑   ↑   ↑
           base gauche, pointe, base droite
-->
```

### Côté Droit (←)
```svg
<!-- Flèche pointant vers la gauche -->
<line x1="0" y1="64" x2="24" y2="64" />
<polygon points="6,60 0,64 6,68" />
<!--              ↑   ↑   ↑
           base droite, pointe, base gauche
-->
```

---

## 🌈 Couleurs et Opacité

### Stratégie Visuelle
```typescript
// Lignes de structure : Plus subtiles
stroke: "rgba(255,255,255,0.2)"  // 20% blanc
// Raison : Ne doivent pas dominer l'interface

// Flèches : Plus visibles
stroke: "rgba(255,255,255,0.3)"  // 30% blanc
fill: "rgba(255,255,255,0.3)"
// Raison : Indiquent la direction du flux
```

### Rendu Visuel
```
Lignes ──────────  (subtiles, blanc 20%)
           ├─────► (flèche plus visible, blanc 30%)
           │
Lignes ──────────
```

---

## 🔧 Conditions de Rendu

### Côté Gauche
```typescript
{roundIndex < roundsBeforeFinal.length - 1 && (
  <Connectors />
)}
```
**Condition** : Ne pas afficher de connecteurs après le dernier tour (avant la finale)

### Côté Droit
```typescript
{roundIndex > 0 && (
  <Connectors />
)}
```
**Condition** : Ne pas afficher de connecteurs pour le premier tour (celui le plus proche de la finale)

### Logique
```
GAUCHE:
1/8 [Connecteurs] → 1/4 [Connecteurs] → 1/2 [PAS de connecteurs] → FINALE

DROITE:
FINALE ← [PAS de connecteurs] 1/2 ← [Connecteurs] 1/4 ← [Connecteurs] 1/8
```

---

## 📱 Responsive Behavior

### Desktop
```css
.connector {
  width: 48px;      /* w-12 */
  height: 128px;    /* h-32 */
}
```

### Tablette/Mobile
Les connecteurs s'adaptent automatiquement grâce au `viewBox` SVG qui est relatif.

```svg
<!-- ViewBox reste le même -->
<svg viewBox="0 0 48 128">
  <!-- Le contenu se scale automatiquement -->
</svg>
```

---

## ✨ Avantages du Système

### 1. **Clarté Visuelle**
- ✅ Direction du flux immédiatement compréhensible
- ✅ Connexion entre matchs évidente
- ✅ Flèches guident l'œil

### 2. **Professionnalisme**
- ✅ Design standard des brackets sportifs
- ✅ Aspect soigné et moderne
- ✅ Alignement parfait

### 3. **Technique**
- ✅ SVG responsive et scalable
- ✅ Performance optimale (rendu GPU)
- ✅ Pas de JavaScript complexe

### 4. **Maintenabilité**
- ✅ Code réutilisable
- ✅ Facile à modifier (couleurs, épaisseur)
- ✅ Logique simple (modulo 2)

---

## 🚀 Évolutions Possibles

### Animations
```typescript
// Animation CSS pour les lignes
<line className="animate-draw" />

@keyframes draw {
  from { stroke-dashoffset: 100; }
  to { stroke-dashoffset: 0; }
}
```

### Interactions
```typescript
// Hover sur match → Highlight du chemin complet
const [hoveredPath, setHoveredPath] = useState(null);

<line 
  stroke={isInPath ? "yellow" : "white"} 
  strokeWidth={isInPath ? 3 : 2}
/>
```

### Couleurs par Équipe
```typescript
// Ligne colorée selon l'équipe gagnante
const teamColor = getTeamColor(match.winner);

<line stroke={teamColor} strokeWidth="3" />
```

---

## 📊 Performance

### Nombre de SVG Rendus

```typescript
// Pour N matchs dans un tour
const numberOfSVGs = Math.floor(N / 2);

// Exemples :
// 2 matchs  → 1 SVG
// 4 matchs  → 2 SVG
// 8 matchs  → 4 SVG
// 16 matchs → 8 SVG
```

### Impact
- ✅ SVG très léger (quelques lignes/polygones)
- ✅ Rendu GPU (accélération matérielle)
- ✅ Aucun impact notable sur la performance

---

## 🎨 Personnalisation Future

### Variables CSS
```css
:root {
  --connector-color: rgba(255,255,255,0.2);
  --arrow-color: rgba(255,255,255,0.3);
  --connector-width: 2px;
}
```

### Props de Configuration
```typescript
interface ConnectorProps {
  lineColor?: string;
  arrowColor?: string;
  strokeWidth?: number;
  animated?: boolean;
}
```

---

## 📖 Conclusion

Le système de lignes de connexion utilise **SVG natif** pour créer des **connecteurs visuels clairs** entre les matchs. L'approche est **simple, performante et scalable**, offrant une excellente expérience utilisateur tout en maintenant un code propre et maintenable.

**Les lignes guident parfaitement l'œil de l'utilisateur à travers le bracket ! 🎯**

---

**Document** : Guide Technique des Connecteurs  
**Version** : 2.0.2  
**Date** : Décembre 2024
