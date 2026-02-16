# Guide de Déploiement - Chez Loman Restaurant

## 1. Export vers GitHub

### Étapes :
1. Dans l'interface Emergent, cliquez sur **"Save to GitHub"**
2. Connectez votre compte GitHub si ce n'est pas déjà fait
3. Choisissez votre repository ou créez-en un nouveau
4. Cliquez sur **"PUSH TO GITHUB"**

---

## 2. Configuration de la Base de Données MongoDB Atlas (GRATUIT)

### Étape 1 : Créer un compte MongoDB Atlas
1. Allez sur https://www.mongodb.com/atlas
2. Créez un compte gratuit (plan M0 gratuit pour toujours)
3. Cliquez sur "Build a Database"

### Étape 2 : Créer un Cluster
1. Choisissez **"FREE" (Shared)**
2. Sélectionnez une région proche (ex: Paris, Frankfurt)
3. Nommez votre cluster (ex: "chez-loman-cluster")
4. Cliquez sur "Create Cluster"

### Étape 3 : Configurer l'accès
1. **Database Access** → Add New Database User
   - Username: `chezloman_admin`
   - Password: (générez un mot de passe sécurisé)
   - Role: "Read and write to any database"

2. **Network Access** → Add IP Address
   - Cliquez sur "Allow Access from Anywhere" (0.0.0.0/0)
   - Ou ajoutez les IPs spécifiques de votre hébergeur

### Étape 4 : Obtenir la chaîne de connexion
1. Cliquez sur "Connect" sur votre cluster
2. Choisissez "Connect your application"
3. Copiez la chaîne de connexion :
   ```
   mongodb+srv://chezloman_admin:<password>@chez-loman-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Remplacez `<password>` par votre mot de passe

---

## 3. Configuration des Variables d'Environnement

### Pour le Backend (Render, Railway, etc.)
```env
MONGO_URL=mongodb+srv://chezloman_admin:VOTRE_MOT_DE_PASSE@chez-loman-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=chez_loman_db
CORS_ORIGINS=https://votre-frontend.vercel.app
DEEPSEEK_API_KEY=votre_cle_deepseek  # Optionnel pour l'IA
```

### Pour le Frontend (Vercel)
```env
REACT_APP_BACKEND_URL=https://votre-backend.onrender.com
```

---

## 4. Déploiement sur Vercel (Frontend uniquement)

### Étapes :
1. Connectez votre GitHub à Vercel (https://vercel.com)
2. Importez votre repository
3. Configuration :
   - Framework Preset: Create React App
   - Root Directory: `frontend`
   - Build Command: `yarn build`
   - Output Directory: `build`
4. Ajoutez la variable d'environnement `REACT_APP_BACKEND_URL`
5. Déployez

---

## 5. Déploiement du Backend sur Render (Gratuit)

### Étapes :
1. Créez un compte sur https://render.com
2. Nouveau → Web Service
3. Connectez votre repository GitHub
4. Configuration :
   - Name: `chez-loman-api`
   - Root Directory: `backend`
   - Runtime: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
5. Ajoutez les variables d'environnement (MONGO_URL, DB_NAME, CORS_ORIGINS)
6. Déployez

---

## 6. Initialisation de la Base de Données

Une fois déployé, appelez ces endpoints pour initialiser les données :

```bash
# Initialiser les données du site
curl -X POST https://votre-backend.onrender.com/api/seed

# Initialiser les données du dashboard
curl -X POST https://votre-backend.onrender.com/api/seed-dashboard
```

---

## Résumé des URLs après déploiement

| Service | URL |
|---------|-----|
| Frontend | https://chez-loman.vercel.app |
| Backend | https://chez-loman-api.onrender.com |
| MongoDB | mongodb+srv://...@chez-loman-cluster.mongodb.net |

---

## Identifiants Admin

- **Username**: admin
- **Password**: chezloman2024

⚠️ **IMPORTANT**: Changez le mot de passe admin en production !

---

## Support

Pour toute question, contactez : AI'vory / Armando Anzan
