# Chez Loman - Restaurant Website PRD

## Project Overview
Site web moderne et responsive pour le restaurant africain "Chez Loman" spécialisé en cuisine ivoirienne et africaine haut de gamme, situé à Yopougon, Abidjan.

## Original Problem Statement
Créer un site web attractif pour présenter le restaurant, attirer des clients, faciliter les réservations et commandes via WhatsApp, avec une image premium de cuisine traditionnelle.

## User Personas
1. **Clients locaux** - Habitants d'Abidjan cherchant cuisine ivoirienne de qualité
2. **Familles** - Groupes cherchant un lieu convivial pour manger ensemble
3. **Admin/Propriétaire** - Personne gérant le menu du jour, photos, comptabilité et dashboard

## Core Requirements (Static)
- Site multipage: Accueil, Menu, À propos, Galerie, Contact, Admin, Dashboard
- Menu du jour dynamique (mise à jour quotidienne)
- Galerie photos gérée par admin
- Bouton WhatsApp flottant
- Liens réseaux sociaux (Facebook, TikTok)
- Responsive mobile-first
- SEO optimisé pour Abidjan/Yopougon

## Tech Stack
- **Frontend**: React 19, TailwindCSS, Shadcn/UI, Framer Motion
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **AI Integration**: DeepSeek API (pour prévisions et insights)
- **Fonts**: Syne (headings), Plus Jakarta Sans (body)
- **Colors**: Vert foncé #1A4D3E, Or #D4AF37, Fond sombre #0F2E24

## What's Been Implemented ✅
*Date: 15 Février 2025 - Dernière mise à jour*

### Pages
- [x] **Accueil** - Hero dynamique, menu du jour, plats vedettes, vidéos, promotions
- [x] **Menu** - Tous les plats avec filtres par catégorie
- [x] **À Propos** - Histoire, valeurs, équipe
- [x] **Galerie** - Photos avec filtres par catégorie
- [x] **Contact** - Horaires, adresse, WhatsApp, avis
- [x] **Admin** - Gestion complète du contenu + accès au Dashboard
- [x] **Dashboard Pro** - Comptabilité, KPIs, Stock, Commandes, Assistant IA

### Dashboard Pro (NOUVEAU) ✅
- [x] **Vue d'ensemble** - KPIs (revenus, bénéfices, commandes, alertes), graphiques 7 jours
- [x] **Comptabilité** - Revenus/dépenses, transactions, ajout de transactions
- [x] **Commandes** - Suivi des commandes avec statuts
- [x] **Stock** - Gestion des stocks avec alertes niveau bas
- [x] **Réservations** - Liste des réservations
- [x] **Assistant IA** - Insights business, prévisions, chat assistant (DeepSeek)

### Fonctionnalités
- [x] Navigation responsive avec menu mobile
- [x] Bouton WhatsApp flottant sur toutes les pages
- [x] Liens Facebook et TikTok dans Hero et Footer
- [x] Menu du jour dynamique (CRUD complet)
- [x] Galerie photos dynamique (upload URL ou fichier)
- [x] Vidéos et Promotions gérables depuis admin
- [x] Message d'accueil modifiable (Hero section)
- [x] Authentification admin sécurisée
- [x] Seed data automatique

### API Endpoints
#### Site public
- GET/POST /api/menu - Gestion des plats
- GET/POST/PUT/DELETE /api/daily-menu - Menu du jour
- GET/POST/DELETE /api/gallery - Photos galerie
- GET/POST /api/reviews - Avis clients
- GET/PUT /api/hero-content - Message d'accueil
- GET/POST /api/videos - Vidéos
- GET/POST /api/promotions - Promotions

#### Dashboard
- GET /api/dashboard/stats - Statistiques KPIs
- GET /api/dashboard/chart-data - Données graphiques
- GET/POST/DELETE /api/transactions - Comptabilité
- GET/POST/PUT /api/orders - Commandes
- GET/PUT/DELETE /api/notifications - Notifications
- GET/POST/PUT/DELETE /api/stock - Gestion stock
- GET/POST/PUT/DELETE /api/reservations - Réservations

#### IA (DeepSeek)
- POST /api/ai/insights - Génération insights business
- POST /api/ai/forecast - Prévisions de ventes
- POST /api/ai/chat - Chat avec l'assistant IA
- GET /api/ai/status - Statut configuration API

## Prioritized Backlog

### P0 (Critique) - DONE ✅
- ✅ Site fonctionnel avec toutes les pages
- ✅ Admin complet avec authentification
- ✅ Dashboard pro avec comptabilité

### P1 (Important) - À faire
- [ ] Configurer clé API DeepSeek pour IA complète
- [ ] Sécuriser identifiants admin (changer mot de passe par défaut)
- [ ] Ajouter lien Google Maps réel du restaurant

### P2 (Nice to have)
- [ ] Système de réservation par calendrier intégré
- [ ] Notifications push WhatsApp pour nouvelles commandes
- [ ] Export comptabilité en PDF/Excel
- [ ] Multi-langue (français/anglais)

## Credentials
- **Admin Username**: admin
- **Admin Password**: chezloman2024
- **DeepSeek API**: Non configurée (mode démo actif)

## Réseaux sociaux
- **Facebook**: https://www.facebook.com/profile.php?id=61574715038273
- **TikTok**: https://www.tiktok.com/@lomanschadrac?lang=fr

## Contact Info
- **Téléphone**: +225 07 09 508 819
- **WhatsApp**: 2250709508819
- **Adresse**: Yopougon Abobo Doumé — Basile Boli, Abidjan
- **Horaires**: Mar-Sam 11h-22h, Dim 13h-22h, Lun Fermé

## Credits
Powered by AI'vory / Armando Anzan
