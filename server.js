// =============================================
// TERANGA IMMO - Backend Server (Node.js/Express)
// server.js
// =============================================

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'teranga_immo_secret_2025';

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('.'));
app.use('/uploads', express.static('uploads'));

// ===== FILE UPLOAD SETUP =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/' + (req.uploadDir || 'listings');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// ===== IN-MEMORY DB (replace with MongoDB/PostgreSQL in production) =====
let users = [];
let listings = [];
let notifications = [];
let conversations = {};

// ===== EMAIL TRANSPORTER =====
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'admin@teranga-immo.sn',
    pass: process.env.EMAIL_PASS || 'your_app_password'
  }
});

// ===== AUTH MIDDLEWARE =====
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
}

// ===== AUTH ROUTES =====

// Register
app.post('/api/auth/register', upload.single('idCard'), async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, whatsapp, address } = req.body;
    
    // Validate
    if (!firstName || !lastName || !email || !password || !phone || !whatsapp) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
    }
    if (users.find(u => u.email === email)) {
      return res.status(409).json({ error: 'Email déjà utilisé' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Mot de passe trop court (min. 8 caractères)' });
    }

    // AI ID Verification (simulation - integrate with real OCR service)
    const idVerified = req.file ? await verifyIdCard(req.file.path, { firstName, lastName }) : false;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = {
      id: Date.now().toString(),
      firstName, lastName, email,
      password: hashedPassword,
      phone, whatsapp, address,
      idCardPath: req.file?.path || null,
      idVerified,
      createdAt: new Date().toISOString(),
      followers: [], following: [],
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName+' '+lastName)}&background=C8973A&color=fff`
    };
    users.push(user);

    // Send admin email notification
    await sendAdminEmail(user);

    // Generate token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      success: true,
      token,
      user: { id: user.id, firstName, lastName, email, phone, whatsapp, avatar: user.avatar, idVerified }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...userSafe } = user;
    res.json({ success: true, token, user: userSafe });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Get current user
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
  const { password, ...userSafe } = user;
  res.json(userSafe);
});

// ===== LISTINGS ROUTES =====

// Get all listings (with filters)
app.get('/api/listings', (req, res) => {
  const { type, transaction, location, minPrice, maxPrice, page = 1, limit = 20 } = req.query;
  let filtered = listings;
  if (type) filtered = filtered.filter(l => l.type === type);
  if (transaction) filtered = filtered.filter(l => l.transaction === transaction);
  if (location) {
    const loc = location.toLowerCase();
    filtered = filtered.filter(l => l.location.toLowerCase().includes(loc) || l.zone?.toLowerCase().includes(loc));
  }
  if (minPrice) filtered = filtered.filter(l => l.price >= parseInt(minPrice));
  if (maxPrice) filtered = filtered.filter(l => l.price <= parseInt(maxPrice));
  
  // Pagination
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + parseInt(limit));
  
  res.json({ listings: paginated, total: filtered.length, page: parseInt(page), pages: Math.ceil(filtered.length / limit) });
});

// Get single listing
app.get('/api/listings/:id', (req, res) => {
  const listing = listings.find(l => l.id === req.params.id);
  if (!listing) return res.status(404).json({ error: 'Annonce non trouvée' });
  // Increment views
  listing.views = (listing.views || 0) + 1;
  res.json(listing);
});

// Create listing
app.post('/api/listings', authMiddleware, upload.array('media', 20), (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const { title, type, transaction, price, surface, chambres, bains, location, zone, description, equip, phone, whatsapp } = req.body;
    
    if (!title || !type || !transaction || !price || !location) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    const mediaFiles = req.files?.map(f => '/uploads/listings/' + f.filename) || [];

    const listing = {
      id: Date.now().toString(),
      title, type, transaction,
      price: parseInt(price), surface: parseInt(surface) || 0,
      chambres: parseInt(chambres) || 0, bains: parseInt(bains) || 0,
      location, zone: zone || location.toLowerCase(),
      description, equip: JSON.parse(equip || '[]'),
      images: mediaFiles.length > 0 ? mediaFiles : [],
      owner: { id: user.id, name: `${user.firstName} ${user.lastName}`, avatar: user.avatar, phone: phone || user.phone, whatsapp: whatsapp || user.whatsapp },
      likes: 0, comments: 0, views: 0,
      verified: user.idVerified || false,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    listings.unshift(listing);

    // Notify followers
    notifyFollowers(user, listing);

    res.status(201).json({ success: true, listing });
  } catch (err) {
    console.error('Create listing error:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Like listing
app.post('/api/listings/:id/like', authMiddleware, (req, res) => {
  const listing = listings.find(l => l.id === req.params.id);
  if (!listing) return res.status(404).json({ error: 'Annonce non trouvée' });
  if (!listing.likedBy) listing.likedBy = [];
  const idx = listing.likedBy.indexOf(req.user.id);
  if (idx > -1) { listing.likedBy.splice(idx, 1); listing.likes--; }
  else { listing.likedBy.push(req.user.id); listing.likes++; }
  res.json({ likes: listing.likes, liked: idx === -1 });
});

// Comment on listing
app.post('/api/listings/:id/comment', authMiddleware, (req, res) => {
  const listing = listings.find(l => l.id === req.params.id);
  if (!listing) return res.status(404).json({ error: 'Annonce non trouvée' });
  const user = users.find(u => u.id === req.user.id);
  if (!listing.commentsList) listing.commentsList = [];
  const comment = {
    id: Date.now().toString(),
    text: req.body.text,
    author: { id: user.id, name: `${user.firstName} ${user.lastName}`, avatar: user.avatar },
    createdAt: new Date().toISOString()
  };
  listing.commentsList.push(comment);
  listing.comments++;
  res.status(201).json(comment);
});

// Search with AI
app.post('/api/search', async (req, res) => {
  try {
    const { query, location, type, transaction, minPrice, maxPrice } = req.body;
    
    let results = listings;
    if (location) {
      const loc = location.toLowerCase();
      results = results.filter(l => l.location.toLowerCase().includes(loc) || (l.description && l.description.toLowerCase().includes(loc)));
    }
    if (type) results = results.filter(l => l.type === type);
    if (transaction) results = results.filter(l => l.transaction === transaction);
    if (minPrice) results = results.filter(l => l.price >= minPrice);
    if (maxPrice) results = results.filter(l => l.price <= maxPrice);

    let nearbyResults = [];
    if (results.length === 0 && location) {
      // Find nearby listings
      nearbyResults = listings.slice(0, 6);
    }

    res.json({ results, nearby: nearbyResults, total: results.length });
  } catch (err) {
    res.status(500).json({ error: 'Erreur de recherche' });
  }
});

// ===== USER ROUTES =====

// Follow / Unfollow
app.post('/api/users/:id/follow', authMiddleware, (req, res) => {
  const targetUser = users.find(u => u.id === req.params.id);
  if (!targetUser) return res.status(404).json({ error: 'Utilisateur non trouvé' });
  const currentUser = users.find(u => u.id === req.user.id);
  
  if (!targetUser.followers) targetUser.followers = [];
  if (!currentUser.following) currentUser.following = [];

  const idx = targetUser.followers.indexOf(req.user.id);
  if (idx > -1) {
    targetUser.followers.splice(idx, 1);
    currentUser.following = currentUser.following.filter(id => id !== req.params.id);
  } else {
    targetUser.followers.push(req.user.id);
    currentUser.following.push(req.params.id);
    // Create notification
    notifications.push({
      userId: req.params.id,
      type: 'follow',
      fromUser: { id: currentUser.id, name: `${currentUser.firstName} ${currentUser.lastName}` },
      message: `${currentUser.firstName} ${currentUser.lastName} s'est abonné à votre profil`,
      createdAt: new Date().toISOString()
    });
  }
  res.json({ followers: targetUser.followers.length, following: idx === -1 });
});

// Get user profile
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
  const { password, ...userSafe } = user;
  const userListings = listings.filter(l => l.owner.id === req.params.id);
  res.json({ ...userSafe, listingsCount: userListings.length });
});

// ===== NOTIFICATIONS =====
app.get('/api/notifications', authMiddleware, (req, res) => {
  const userNotifs = notifications.filter(n => n.userId === req.user.id);
  res.json(userNotifs.reverse());
});

// ===== HELPER FUNCTIONS =====
async function verifyIdCard(imagePath, userData) {
  // In production: use an OCR API (like Google Vision, AWS Textract, or Tesseract)
  // to extract text from the ID card and compare with userData
  // This is a simplified simulation
  console.log('🤖 AI ID Verification for:', userData.firstName, userData.lastName);
  return true; // Simulated verification
}

async function sendAdminEmail(user) {
  try {
    await transporter.sendMail({
      from: '"Teranga Immo" <admin@teranga-immo.sn>',
      to: process.env.ADMIN_EMAIL || 'admin@teranga-immo.sn',
      subject: '🏠 Nouvel inscrit – Teranga Immo',
      html: `
        <h2>Nouvel utilisateur inscrit</h2>
        <table>
          <tr><td><strong>Nom:</strong></td><td>${user.firstName} ${user.lastName}</td></tr>
          <tr><td><strong>Email:</strong></td><td>${user.email}</td></tr>
          <tr><td><strong>Téléphone:</strong></td><td>${user.phone}</td></tr>
          <tr><td><strong>WhatsApp:</strong></td><td>${user.whatsapp}</td></tr>
          <tr><td><strong>Adresse:</strong></td><td>${user.address}</td></tr>
          <tr><td><strong>ID Vérifié:</strong></td><td>${user.idVerified ? '✅ Oui' : '⚠️ Non'}</td></tr>
          <tr><td><strong>Date:</strong></td><td>${new Date().toLocaleString('fr-FR')}</td></tr>
        </table>
      `
    });
    console.log('📧 Admin email sent for:', user.email);
  } catch (err) {
    console.error('Email error:', err.message);
  }
}

function notifyFollowers(user, listing) {
  const followers = users.filter(u => u.following?.includes(user.id));
  followers.forEach(follower => {
    notifications.push({
      userId: follower.id,
      type: 'new_listing',
      fromUser: { id: user.id, name: `${user.firstName} ${user.lastName}` },
      listing: { id: listing.id, title: listing.title },
      message: `${user.firstName} a publié un nouveau bien: ${listing.title}`,
      createdAt: new Date().toISOString()
    });
  });
}

// ===== SERVE FRONTEND =====
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`🏠 Teranga Immo Backend running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});

module.exports = app;
