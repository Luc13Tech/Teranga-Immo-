# 🏠 TERANGA IMMO
### La plateforme immobilière intelligente du Sénégal

---

## 📁 STRUCTURE DES FICHIERS

```
teranga-immo/
├── index.html      ← Page principale (Frontend)
├── style.css       ← Tous les styles CSS
├── app.js          ← Logique frontend (JavaScript)
├── server.js       ← Serveur backend (Node.js)
├── package.json    ← Dépendances Node.js
└── README.md       ← Ce fichier
```

---

## 🚀 COMMENT METTRE LA PLATEFORME EN LIGNE

### OPTION 1 : Hébergement Simple (Frontend seulement) — GRATUIT

Si vous voulez juste tester rapidement sans base de données :

1. Créez un compte gratuit sur **Netlify** (https://netlify.com)
2. Glissez le dossier `teranga-immo` dans Netlify Drop
3. Votre site est en ligne en 30 secondes !

> ⚠️ Avec cette option, les données ne sont pas persistées entre sessions.

---

### OPTION 2 : Hébergement Complet (Frontend + Backend) — RECOMMANDÉ

#### ÉTAPE 1 : Préparer votre serveur

**Sur Railway (recommandé, gratuit pour démarrer) :**
1. Créez un compte sur https://railway.app
2. Cliquez "New Project" → "Deploy from GitHub"
3. Uploadez votre code sur GitHub d'abord
4. Railway détecte automatiquement Node.js et déploie

**Sur Render :**
1. Créez un compte sur https://render.com
2. "New Web Service" → connectez votre repo GitHub
3. Build Command: `npm install`
4. Start Command: `npm start`

**Sur un VPS (DigitalOcean, OVH, Contabo) :**
```bash
# 1. Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Cloner votre projet
git clone https://github.com/votre-user/teranga-immo.git
cd teranga-immo

# 3. Installer les dépendances
npm install

# 4. Configurer les variables d'environnement
cp .env.example .env
nano .env  # Modifier avec vos vraies valeurs

# 5. Lancer avec PM2 (maintient le serveur actif)
npm install -g pm2
pm2 start server.js --name "teranga-immo"
pm2 save
pm2 startup
```

#### ÉTAPE 2 : Base de Données (Production)

Remplacez l'array en mémoire par **MongoDB** :

```bash
npm install mongoose
```

Dans server.js, ajoutez :
```javascript
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/teranga-immo');
```

**Hébergement MongoDB gratuit :** https://mongodb.com/atlas

#### ÉTAPE 3 : Variables d'environnement

Créez un fichier `.env` :
```env
PORT=3000
JWT_SECRET=votre_secret_jwt_tres_long_et_securise
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/teranga-immo
EMAIL_USER=votre@gmail.com
EMAIL_PASS=votre_mot_de_passe_application_gmail
ADMIN_EMAIL=admin@teranga-immo.sn
```

#### ÉTAPE 4 : Nom de domaine

1. Achetez un domaine sur **OVH.sn**, **Nic.sn** ou **GoDaddy**
2. Pointez le domaine vers votre serveur (IP ou URL Railway/Render)
3. Activez HTTPS gratuit avec **Let's Encrypt** :
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d teranga-immo.sn -d www.teranga-immo.sn
```

---

## ⚙️ FONCTIONNALITÉS INCLUSES

### Frontend
- ✅ Page d'accueil avec hero + recherche avancée
- ✅ Explorer (style TikTok/scroll infini)
- ✅ Recherche IA intelligente
- ✅ Publication de biens (4 étapes)
- ✅ Upload photos et vidéos
- ✅ Détail d'un bien avec galerie
- ✅ Système de likes, commentaires, favoris
- ✅ Follow/Abonnement
- ✅ Messagerie intégrée
- ✅ Profil utilisateur
- ✅ Notifications
- ✅ Bouton WhatsApp direct
- ✅ Bouton appel téléphonique
- ✅ Assistant IA (Claude intégré)
- ✅ Authentification (login/inscription)
- ✅ Upload pièce d'identité + vérification IA simulée
- ✅ Design responsive mobile/desktop
- ✅ Sidebar + bottom navigation mobile

### Backend
- ✅ API REST complète
- ✅ Authentification JWT sécurisée
- ✅ Hash des mots de passe (bcrypt)
- ✅ Upload fichiers (Multer)
- ✅ Notification email admin (Nodemailer)
- ✅ Système follow/followers
- ✅ Likes et commentaires
- ✅ Recherche avec filtres
- ✅ Pagination

---

## 🔧 AMÉLIORATIONS RECOMMANDÉES (Production)

1. **Base de données** : Migrer vers MongoDB Atlas ou PostgreSQL
2. **Stockage fichiers** : Utiliser Cloudinary ou AWS S3 pour les images
3. **Vérification ID réelle** : Intégrer Google Vision API ou AWS Textract
4. **Paiements** : Intégrer Wave Money, Orange Money ou Stripe
5. **Notifications push** : Firebase Cloud Messaging
6. **Carte interactive** : Google Maps ou Mapbox
7. **CDN** : Cloudflare pour la performance
8. **Analytics** : Google Analytics ou Plausible

---

## 📞 CONTACT & SUPPORT

Pour toute question sur le déploiement :
- Consultez la documentation Node.js : https://nodejs.org/docs
- Documentation Express : https://expressjs.com/fr
- Support Railway : https://docs.railway.app

---

*Teranga Immo — L'immobilier au cœur de l'Afrique* 🏠
