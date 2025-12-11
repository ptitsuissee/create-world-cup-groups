# Phase à Élimination Directe - Documentation

## Vue d'ensemble

La phase à élimination directe de MatchDraw Pro permet de créer des tableaux de tournoi professionnels avec **un layout en miroir classique** (moitié gauche + finale au centre + moitié droite) et toutes les fonctionnalités avancées déjà présentes dans la phase de groupes.

## Fonctionnalités Principales

### 1. **Création du Tableau**
- Choix du nombre d'équipes : 2, 4, 8, 16, 32 ou 64
- Génération automatique des tours en fonction du nombre d'équipes
- **Layout en miroir** : Moitié haute à gauche, finale au centre, moitié basse à droite
- Tours disponibles :
  - 1/32 de finale (Round of 64)
  - 1/16 de finale (Round of 32)
  - 1/8 de finale (Round of 16)
  - Quarts de finale
  - Demi-finales
  - Finale (au centre du tableau)

### 2. **Configuration des Matchs**

#### Sélection des Équipes
Deux modes de sélection :
- **Depuis les groupes** : Sélection basée sur le classement (1er, 2ème, 3ème, 4ème)
- **Saisie manuelle** : Entrée libre du nom de l'équipe

#### Gestion des Scores
- Saisie des scores pour chaque match
- Qualification automatique du vainqueur au tour suivant
- Mise à jour en temps réel des matchs suivants
- Modification des scores après validation
- Affichage visuel du vainqueur (fond vert)

### 3. **Liens et Médias sur les Matchs**

Chaque match peut avoir :
- **Nom du lien** : Ex: "Vidéo du match", "Résumé", "Highlights"
- **URL** : Lien vers une ressource externe
- **Logo personnalisé** : Import d'image type Canva
- Affichage du lien avec logo sur la carte du match
- Suppression du lien si nécessaire

### 4. **Messages d'Information**

Système de messages identique à la phase de groupes :
- **Titre** : Titre du message
- **Contenu** : Description détaillée
- **Lien optionnel** : URL externe
- **Logo optionnel** : Image personnalisée (import type Canva)
- Affichage en haut de la page, au-dessus du tableau
- Modification et suppression des messages

### 5. **Navigation**

- Bouton "Phase éliminatoire" dans la page Matchs et Classements
- Retour aux groupes depuis la phase éliminatoire
- Bouton paramètres pour reconfigurer le tableau
- Support multilingue complet

## Utilisation

### Étape 1 : Accéder à la Phase Éliminatoire
1. Créez vos groupes et équipes dans la phase de création
2. Générez les matchs de groupes
3. Complétez les matchs de groupes
4. Cliquez sur "Phase éliminatoire" dans la page Matchs et Classements

### Étape 2 : Configuration
1. Sélectionnez le nombre d'équipes (2, 4, 8, 16, 32 ou 64)
2. Cliquez sur "Générer le tableau"
3. Le système crée automatiquement tous les tours nécessaires

### Étape 3 : Configurer les Matchs du Premier Tour
1. Cliquez sur l'emplacement de l'équipe 1 ou 2
2. Choisissez le mode de sélection :
   - **Depuis le groupe** : Sélectionnez le groupe et la position (1er, 2ème, etc.)
   - **Saisie manuelle** : Entrez directement le nom de l'équipe
3. Répétez pour tous les matchs du premier tour

### Étape 4 : Ajouter des Liens aux Matchs
1. Cliquez sur "Ajouter un lien" sur un match
2. Renseignez :
   - Nom du lien
   - URL
   - Logo (optionnel, import d'image)
3. Le lien s'affiche sur la carte du match

### Étape 5 : Saisir les Résultats
1. Cliquez sur "Saisir le score" sur un match
2. Entrez les scores des deux équipes
3. Cliquez sur "Enregistrer"
4. Le vainqueur est automatiquement qualifié pour le tour suivant

### Étape 6 : Ajouter des Messages d'Information
1. Cliquez sur "Ajouter un message d'information"
2. Renseignez :
   - Titre du message
   - Contenu
   - Lien optionnel
   - Logo optionnel (import type Canva)
3. Le message s'affiche en haut de la page

## Fonctionnalités Avancées

### Qualification Automatique
- Quand un match est terminé, le vainqueur est automatiquement placé dans le match suivant
- Le système calcule automatiquement le bon emplacement (équipe 1 ou équipe 2)
- Source du vainqueur affichée (ex: "Vainqueur de Quarts de finale 1")

### Affichage du Vainqueur Final
- Colonne dédiée au vainqueur du tournoi
- Affichage du trophée 🏆 et du nom du champion
- Mise à jour automatique après la finale

### Layout en Miroir Professionnel
- **Structure en 3 parties** :
  - Gauche : Moitié haute du bracket (progression → vers le centre)
  - Centre : Finale et vainqueur (point focal)
  - Droite : Moitié basse du bracket (progression ← vers le centre)
- **Défilement horizontal** pour voir tous les tours
- **Design symétrique** inspiré des grands tournois (Coupe du Monde, Wimbledon)
- **Responsive** avec largeur minimale pour chaque colonne

## Compatibilité

- ✅ Desktop (affichage optimal)
- ✅ Tablette (défilement horizontal)
- ✅ Mobile (défilement horizontal, colonnes empilées)
- ✅ Support multilingue (10 langues)
- ✅ Sauvegarde automatique (localStorage)

## Technologies

- React + TypeScript
- Tailwind CSS pour le design
- Glassmorphisme et dégradés
- Import d'images local (FileReader API)
- Gestion d'état locale (useState, useEffect)