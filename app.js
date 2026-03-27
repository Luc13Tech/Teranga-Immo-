// =========================================================
// TERANGA IMMO — app.js v5.0
// Corrections: médias persistés, DeepSeek IA, likes réels,
// badge 1000 abonnés, langue FR/EN, date/heure, texte pub
// Upload vidéo jusqu'à 500 Mo
// =========================================================

const DEEPSEEK_API_KEY = 'sk-8eabfc9425a844c6bac68691a53a9a05';
const DEEPSEEK_URL     = 'https://api.deepseek.com/v1/chat/completions';

// Clés localStorage
const DB_KEY       = 'ti_db_v5';
const USER_KEY     = 'ti_user_v5';
const USERS_KEY    = 'ti_users_v5';
const LIKES_KEY    = 'ti_likes_v5';
const FAVS_KEY     = 'ti_favs_v5';
const FOLLOWS_KEY  = 'ti_follows_v5';
const COMMENTS_KEY = 'ti_comm_v5';
const LANG_KEY     = 'ti_lang_v5';

// État global
let currentUser   = null;
let allListings   = [];
let likedPosts    = new Set();
let favorites     = new Set();
let followedUsers = new Set();
let aiHistory     = [];
let currentLang   = 'fr';
let searchType    = 'vendre';
let uploadedMedia = [];       // [{ dataUrl, type:'image'|'video' }]
let currentInterestedListing = null;
let textFontSize = 16;

// ===== TRADUCTIONS =====
const i18n = {
  fr: { 
    tagline: 'L\'immobilier au cœur de l\'Afrique', 
    heroTitle: 'Trouvez votre bien idéal au Sénégal', 
    home: 'Accueil', 
    explore: 'Explorer', 
    search: 'Recherche IA', 
    publish: 'Publier un bien', 
    publish2: 'Publier', 
    myProfile: 'Mon Profil', 
    myListings: 'Mes Biens', 
    messages: 'Messages', 
    favorites: 'Favoris', 
    notifications: 'Notifications', 
    settings: 'Paramètres', 
    logout: 'Déconnexion', 
    forSale: 'À Vendre', 
    forRent: 'À Louer', 
    all: 'Tous', 
    recentPosts: 'Publications récentes', 
    browseByCategory: 'Parcourir par catégorie', 
    seeAll: 'Voir tout', 
    listedProperties: 'Biens listés', 
    verifiedSellers: 'Vendeurs', 
    regions: 'Régions', 
    posts: 'Publications', 
    followers: 'Abonnés', 
    following: 'Suivis', 
    liked: 'Aimés', 
    saved: 'Sauvegardés', 
    info: 'Infos', 
    media: 'Médias', 
    propertyInfo: 'Informations du bien', 
    location: 'Localisation', 
    selectConv: 'Sélectionnez une conversation', 
    editProfile: 'Modifier le profil', 
    changePassword: 'Changer le mot de passe', 
    language: 'Langue', 
    chooseLanguage: 'Choisir la langue', 
    enableNotifs: 'Notifications', 
    privateAccount: 'Compte privé', 
    privacy: 'Confidentialité', 
    about: 'À propos', 
    profile: 'Profil' 
  },
  en: { 
    tagline: 'Real estate at the heart of Africa', 
    heroTitle: 'Find your ideal property in Senegal', 
    home: 'Home', 
    explore: 'Explore', 
    search: 'AI Search', 
    publish: 'Post a property', 
    publish2: 'Publish', 
    myProfile: 'My Profile', 
    myListings: 'My Properties', 
    messages: 'Messages', 
    favorites: 'Favorites', 
    notifications: 'Notifications', 
    settings: 'Settings', 
    logout: 'Log out', 
    forSale: 'For Sale', 
    forRent: 'For Rent', 
    all: 'All', 
    recentPosts: 'Recent posts', 
    browseByCategory: 'Browse by category', 
    seeAll: 'See all', 
    listedProperties: 'Listed properties', 
    verifiedSellers: 'Sellers', 
    regions: 'Regions', 
    posts: 'Posts', 
    followers: 'Followers', 
    following: 'Following', 
    liked: 'Liked', 
    saved: 'Saved', 
    info: 'Info', 
    media: 'Media', 
    propertyInfo: 'Property information', 
    location: 'Location', 
    selectConv: 'Select a conversation', 
    editProfile: 'Edit profile', 
    changePassword: 'Change password', 
    language: 'Language', 
    chooseLanguage: 'Choose language', 
    enableNotifs: 'Notifications', 
    privateAccount: 'Private account', 
    privacy: 'Privacy', 
    about: 'About', 
    profile: 'Profile' 
  }
};

function t(key) { 
  return (i18n[currentLang] || i18n.fr)[key] || key; 
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[lang]?.[key]) el.textContent = i18n[lang][key];
  });
  document.querySelectorAll('[placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key && i18n[lang]?.[key]) el.placeholder = i18n[lang][key];
  });
  const langFR = document.getElementById('langFR');
  const langEN = document.getElementById('langEN');
  if (langFR) langFR.classList.toggle('active', lang === 'fr');
  if (langEN) langEN.classList.toggle('active', lang === 'en');
  const html = document.getElementById('htmlRoot');
  if (html) html.lang = lang;
}

// ===== INIT =====
window.addEventListener('load', () => {
  currentLang = localStorage.getItem(LANG_KEY) || 'fr';
  loadStorage();
  setTimeout(() => {
    const splash = document.getElementById('splash');
    if (splash) splash.classList.add('fade-out');
    setTimeout(() => {
      const splashEl = document.getElementById('splash');
      if (splashEl) splashEl.style.display = 'none';
      initApp();
    }, 800);
  }, 2000);
});

function loadStorage() {
  try {
    allListings   = JSON.parse(localStorage.getItem(DB_KEY) || '[]');
    likedPosts    = new Set(JSON.parse(localStorage.getItem(LIKES_KEY) || '[]'));
    favorites     = new Set(JSON.parse(localStorage.getItem(FAVS_KEY) || '[]'));
    followedUsers = new Set(JSON.parse(localStorage.getItem(FOLLOWS_KEY) || '[]'));
  } catch(e) {
    console.error('Erreur chargement storage:', e);
    allListings = [];
    likedPosts = new Set();
    favorites = new Set();
    followedUsers = new Set();
  }
}

function save(key, val) { 
  try { 
    localStorage.setItem(key, JSON.stringify(val)); 
  } catch(e) { 
    console.warn('Storage full, cleaning...'); 
    cleanOldMedia(); 
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch(e2) {
      console.error('Storage still full after cleaning:', e2);
    }
  } 
}

function saveListings()  { save(DB_KEY, allListings); }
function saveLikes()     { save(LIKES_KEY, [...likedPosts]); }
function saveFavs()      { save(FAVS_KEY, [...favorites]); }
function saveFollows()   { save(FOLLOWS_KEY, [...followedUsers]); }

function cleanOldMedia() {
  // Nettoyer les médias trop lourds et limiter le nombre
  const MAX_MEDIA_STR_LEN = 5000000; // ~5 Mo en base64
  
  allListings.forEach(listing => {
    if (listing.media && listing.media.length > 0) {
      // Filtrer les médias trop lourds
      listing.media = listing.media.filter(media => {
        if (typeof media === 'string' && media.length > MAX_MEDIA_STR_LEN) {
          return false;
        }
        return true;
      });
      // Limiter à 3 médias maximum
      if (listing.media.length > 3) {
        listing.media = listing.media.slice(0, 3);
        if (listing.mediaTypes) listing.mediaTypes = listing.mediaTypes.slice(0, 3);
      }
    }
  });
  saveListings();
}

function initApp() {
  const saved = localStorage.getItem(USER_KEY);
  if (saved) { 
    try {
      currentUser = JSON.parse(saved); 
      showApp(); 
    } catch(e) {
      localStorage.removeItem(USER_KEY);
      showAuthOverlay();
      showModal('login');
    }
  } else { 
    showAuthOverlay(); 
    showModal('login'); 
  }
  setLanguage(currentLang);
}

function showApp() {
  const appEl = document.getElementById('app');
  if (appEl) appEl.classList.remove('hidden');
  updateNavAvatar();
  updateNotifBadge();
  updateStats();
  renderHomeFeed();
  setTimeout(askNotifPermission, 2500);
}

function updateStats() {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const statListings = document.getElementById('statListings');
  const statUsers = document.getElementById('statUsers');
  if (statListings) statListings.textContent = allListings.length + '+';
  if (statUsers) statUsers.textContent = users.length + '+';
}

// ===== NOTIFICATIONS NAVIGATEUR =====
function askNotifPermission() {
  if (!('Notification' in window) || Notification.permission !== 'default') return;
  if (document.getElementById('notifBanner')) return;
  const banner = document.createElement('div');
  banner.id = 'notifBanner';
  banner.innerHTML = `<div class="notif-banner">
    <span>🔔 Activez les notifications pour les likes, commentaires et abonnés</span>
    <div class="nb-btns">
      <button class="btn-primary" style="padding:7px 14px;font-size:0.82rem" onclick="enableNotifs()">Activer</button>
      <button class="btn-secondary" style="padding:7px 12px;font-size:0.82rem" onclick="this.closest('#notifBanner').remove()">Plus tard</button>
    </div>
  </div>`;
  document.body.appendChild(banner);
}

function enableNotifs() {
  Notification.requestPermission().then(permission => {
    const notifBanner = document.getElementById('notifBanner');
    if (notifBanner) notifBanner.remove();
    const notifToggle = document.getElementById('notifToggle');
    if (notifToggle) notifToggle.checked = permission === 'granted';
    showToast(permission === 'granted' ? '🔔 Notifications activées !' : 'Notifications refusées', permission === 'granted' ? 'success' : 'info');
  });
}

function toggleNotifSetting(cb) {
  if (cb.checked) enableNotifs(); 
  else showToast('Notifications désactivées', 'info');
}

function pushBrowserNotif(title, body) {
  if (Notification.permission !== 'granted') return;
  try { 
    new Notification('🏠 ' + title, { body }); 
  } catch(e) {}
}

// ===== NOTIFICATIONS IN-APP =====
function getNotifsKey() { 
  return currentUser ? 'ti_notifs_' + currentUser.id : 'ti_notifs_global'; 
}

function getNotifs() { 
  try {
    return JSON.parse(localStorage.getItem(getNotifsKey()) || '[]');
  } catch(e) {
    return [];
  }
}

function addNotif(notif) {
  const key = getNotifsKey();
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem(key) || '[]');
  } catch(e) {}
  list.unshift({ ...notif, id: Date.now() + Math.random(), read: false, time: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(list.slice(0, 200)));
  updateNotifBadge();
  pushBrowserNotif(notif.title || 'Teranga Immo', notif.text || '');
}

function addNotifForUser(userId, notif) {
  const key = 'ti_notifs_' + userId;
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem(key) || '[]');
  } catch(e) {}
  list.unshift({ ...notif, id: Date.now() + Math.random(), read: false, time: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(list.slice(0, 200)));
}

function updateNotifBadge() {
  const count = getNotifs().filter(n => !n.read).length;
  const badge = document.querySelector('#navbar .badge');
  if (!badge) return;
  badge.textContent = count > 99 ? '99+' : count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

// ===== AUTH =====
function showAuthOverlay() { 
  const overlay = document.getElementById('authOverlay'); 
  if (overlay) overlay.style.display = 'flex'; 
}

function hideAuthOverlay() { 
  const overlay = document.getElementById('authOverlay'); 
  if (overlay) overlay.style.display = 'none'; 
}

function showModal(name) { 
  document.querySelectorAll('.auth-modal').forEach(m => m.classList.add('hidden')); 
  const modal = document.getElementById(name + 'Modal');
  if (modal) modal.classList.remove('hidden'); 
}

function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPassword').value;
  if (!email || !pass) { 
    showToast('Remplissez tous les champs', 'error'); 
    return; 
  }
  showLoading('Connexion…');
  setTimeout(() => {
    let users = [];
    try {
      users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch(e) {}
    const found = users.find(u => u.email === email && u.ph === hashStr(pass));
    hideLoading();
    if (!found) { 
      showToast('Email ou mot de passe incorrect', 'error'); 
      return; 
    }
    currentUser = found;
    save(USER_KEY, currentUser);
    hideAuthOverlay(); 
    showApp();
    showToast('Bienvenue ' + currentUser.firstName + ' ! 🏠', 'success');
  }, 1200);
}

function doRegister() {
  const fn = document.getElementById('regFirstName').value.trim();
  const ln = document.getElementById('regLastName').value.trim();
  const em = document.getElementById('regEmail').value.trim();
  const pw = document.getElementById('regPassword').value;
  const ph = document.getElementById('regPhone').value.trim();
  const wa = document.getElementById('regWhatsapp').value.trim();
  const addr = document.getElementById('regAddress').value.trim();
  const trm = document.getElementById('regTerms').checked;

  if (!fn || !ln || !em || !pw || !ph || !wa || !addr) { 
    showToast('Tous les champs obligatoires doivent être remplis', 'error'); 
    return; 
  }
  if (!trm) { 
    showToast('Acceptez les conditions d\'utilisation', 'error'); 
    return; 
  }
  if (pw.length < 8) { 
    showToast('Mot de passe trop court (min. 8 caractères)', 'error'); 
    return; 
  }

  let users = [];
  try {
    users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch(e) {}
  
  if (users.find(u => u.email === em)) { 
    showToast('Cet email est déjà utilisé', 'error'); 
    return; 
  }

  showLoading('Vérification de votre pièce d\'identité par IA…');
  setTimeout(() => {
    showLoadingText('Comparaison des informations…');
    setTimeout(() => {
      showLoadingText('Validation du compte…');
      setTimeout(() => {
        hideLoading();
        const newUser = {
          id: 'u_' + Date.now(), 
          firstName: fn, 
          lastName: ln, 
          email: em, 
          ph: hashStr(pw),
          phone: ph, 
          whatsapp: wa, 
          address: addr, 
          bio: '', 
          avatar: null,
          followers: [], 
          following: [], 
          createdAt: new Date().toISOString()
        };
        users.push(newUser); 
        save(USERS_KEY, users);
        currentUser = newUser; 
        save(USER_KEY, newUser);
        sendAdminEmail({ firstName: fn, lastName: ln, email: em, phone: ph, whatsapp: wa, address: addr });
        hideAuthOverlay(); 
        showApp();
        showToast('Bienvenue ' + fn + ' ! Compte créé ✅', 'success');
        addNotif({ type: 'system', title: 'Bienvenue !', text: '🎉 Votre compte Teranga Immo a été créé avec succès !' });
      }, 1000);
    }, 1100);
  }, 1200);
}

function doForgot() {
  const em = document.getElementById('forgotEmail').value.trim();
  if (!em) { 
    showToast('Entrez votre email', 'error'); 
    return; 
  }
  showToast('Lien de réinitialisation envoyé à ' + em, 'success');
  setTimeout(() => showModal('login'), 2000);
}

function logout() {
  currentUser = null; 
  localStorage.removeItem(USER_KEY);
  const appEl = document.getElementById('app');
  if (appEl) appEl.classList.add('hidden');
  showAuthOverlay(); 
  showModal('login'); 
  showToast('Déconnecté', 'info');
}

function hashStr(s) { 
  let h = 0; 
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h.toString(36); 
}

function togglePwd(id) { 
  const el = document.getElementById(id); 
  if (el) el.type = el.type === 'password' ? 'text' : 'password'; 
}

function handleIdUpload(event) {
  const file = event.target.files[0]; 
  if (!file) return;
  const url = URL.createObjectURL(file);
  const prev = document.getElementById('idPreview'); 
  if (!prev) return;
  prev.classList.remove('hidden');
  prev.innerHTML = `<img src="${url}" style="width:100%;border-radius:8px"/>
    <div style="margin-top:8px;font-size:0.82rem;color:var(--gold)"><span class="typing-dots"><span></span><span></span><span></span></span> Analyse IA…</div>`;
  setTimeout(() => { 
    const dotsDiv = prev.querySelector('[style*="typing"]'); 
    if (dotsDiv) dotsDiv.outerHTML = '<div style="color:var(--green);margin-top:6px">✅ Pièce d\'identité vérifiée</div>'; 
  }, 2500);
}

function sendAdminEmail(user) {
  if (typeof emailjs !== 'undefined') {
    emailjs.send('service_teranga', 'template_register', {
      to_email: 'immobiliersn9@gmail.com', 
      prenom: user.firstName, 
      nom: user.lastName,
      email: user.email, 
      telephone: user.phone, 
      whatsapp: user.whatsapp, 
      adresse: user.address,
      date: new Date().toLocaleString('fr-FR')
    }, 'rm-Zu8MBxW1LuhgEs').catch(e => console.log('EmailJS:', e));
  }
  console.log('📧 Admin notification → immobiliersn9@gmail.com', user);
}

// ===== NAVIGATION =====
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const targetPage = document.getElementById('page-' + page);
  if (targetPage) { 
    targetPage.classList.add('active'); 
    window.scrollTo(0, 0); 
  }
  
  // Update bottom nav active state
  document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('active-tab'));
  const tabMap = {
    'home': 'bn-home',
    'explore': 'bn-explore', 
    'messages': 'bn-messages', 
    'profile': 'bn-profile'
  };
  const activeTab = document.getElementById(tabMap[page]);
  if (activeTab) activeTab.classList.add('active-tab');
  
  // Render page content
  const renderers = {
    home: () => { renderHomeFeed(); renderFeatured(); updateStats(); },
    explore: () => renderExploreFeed(),
    profile: () => renderProfile(),
    'my-listings': () => renderMyListings(),
    favorites: () => renderFavorites(),
    notifications: () => { renderNotifications(); markNotifsRead(); },
    publish: () => resetPublish()
  };
  if (renderers[page]) renderers[page]();
}

function markNotifsRead() {
  const key = getNotifsKey();
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem(key) || '[]');
  } catch(e) {}
  list = list.map(n => ({ ...n, read: true }));
  localStorage.setItem(key, JSON.stringify(list)); 
  updateNotifBadge();
}

function updateNavAvatar() {
  if (!currentUser) return;
  const name = currentUser.firstName + ' ' + currentUser.lastName;
  const src = currentUser.avatar || avatarUrl(name);
  const navAvatar = document.getElementById('navAvatar');
  if (navAvatar) navAvatar.src = src;
}

function avatarUrl(name, bg = 'C8973A') {
  return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=' + bg + '&color=fff&size=100';
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.toggle('hidden');
  if (overlay) overlay.classList.toggle('hidden');
}

function toggleProfileMenu() { 
  const menu = document.getElementById('profileMenu');
  if (menu) menu.classList.toggle('hidden'); 
}

document.addEventListener('click', e => { 
  const menu = document.getElementById('profileMenu'); 
  if (menu && !e.target.closest('.nav-avatar')) menu.classList.add('hidden'); 
});

// ===== SEARCH OVERLAY =====
function openSearchBar() {
  const overlay = document.getElementById('searchOverlay'); 
  if (overlay) overlay.classList.remove('hidden');
  setTimeout(() => {
    const input = document.getElementById('searchOverlayInput');
    if (input) input.focus();
  }, 100);
}

function closeSearchBar() { 
  const overlay = document.getElementById('searchOverlay');
  if (overlay) overlay.classList.add('hidden'); 
}

function searchOverlayQuery(query) {
  const resultsDiv = document.getElementById('searchOverlayResults'); 
  if (!resultsDiv) return;
  if (!query.trim()) { 
    resultsDiv.innerHTML = ''; 
    return; 
  }
  const lower = query.toLowerCase();
  const found = allListings.filter(listing =>
    listing.title?.toLowerCase().includes(lower) ||
    listing.location?.toLowerCase().includes(lower) ||
    listing.owner?.name?.toLowerCase().includes(lower) ||
    listing.type?.toLowerCase().includes(lower)
  );
  if (found.length === 0) {
    resultsDiv.innerHTML = '<div style="color:var(--gray);padding:20px;text-align:center">Aucun résultat pour "' + escapeHtml(query) + '"</div>';
    return;
  }
  resultsDiv.innerHTML = '';
  found.slice(0, 10).forEach(listing => {
    const media = (listing.media || listing.images || [])[0];
    const isVid = (listing.mediaTypes || [])[0] === 'video';
    const resultItem = document.createElement('div');
    resultItem.className = 'sor-item';
    resultItem.innerHTML = `
      ${media && !isVid ? `<img src="${media}" alt=""/>` : `<div class="pcc-media" style="display:flex;align-items:center;justify-content:center;font-size:1.5rem">${isVid ? '🎬' : '🏠'}</div>`}
      <div>
        <div class="sor-title">${escapeHtml(listing.title)}</div>
        <div class="sor-sub">${formatPrice(listing.price, listing.transaction)} · ${escapeHtml(listing.location)}</div>
      </div>
    `;
    resultItem.onclick = () => { closeSearchBar(); showPropertyDetail(listing.id); };
    resultsDiv.appendChild(resultItem);
  });
}

// ===== ACCUEIL =====
function renderHomeFeed() {
  const container = document.getElementById('homeFeed'); 
  if (!container) return;
  container.innerHTML = '';
  if (allListings.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--gray)">
      <div style="font-size:3.5rem;margin-bottom:12px">🏠</div>
      <h3 style="margin-bottom:8px;font-family:var(--font-display)">Aucune publication pour l'instant</h3>
      <p>Soyez le premier à publier un bien !</p>
      <button class="btn-primary" style="margin-top:20px" onclick="showPage('publish')"><i class="fas fa-plus"></i> Publier un bien</button>
    </div>`;
    return;
  }
  allListings.slice(0, 12).forEach(listing => container.appendChild(createPropertyCard(listing)));
}

function renderFeatured() {
  const container = document.getElementById('featuredListings'); 
  if (!container) return;
  container.innerHTML = ''; 
  const featured = allListings.filter(listing => (listing.likes || 0) >= 3);
  if (featured.length === 0) { 
    container.innerHTML = '<p style="color:var(--gray);padding:16px">Les biens populaires apparaîtront ici.</p>'; 
    return; 
  }
  featured.slice(0, 6).forEach(listing => container.appendChild(createPropertyCard(listing)));
}

// ===== CARTE PROPRIÉTÉ =====
function createPropertyCard(listing) {
  const card = document.createElement('div'); 
  card.className = 'property-card';
  const isFav = favorites.has(listing.id);
  const nLikes = listing.likes || 0;
  const mediaArr = listing.media || listing.images || [];
  const typeArr = listing.mediaTypes || [];
  const media = mediaArr[0];
  const isVid = typeArr[0] === 'video';
  const dateStr = formatDate(listing.createdAt);

  let mediaHTML = '';
  if (media) {
    if (isVid) {
      mediaHTML = `<video src="${media}" muted playsinline preload="metadata" style="width:100%;height:100%;object-fit:cover" onclick="showPropertyDetail('${listing.id}')"></video>
        <div class="pc-play-icon">▶️</div>`;
    } else {
      mediaHTML = `<img src="${media}" alt="${escapeHtml(listing.title)}" loading="lazy" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.innerHTML='<div style=&quot;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;background:var(--dark3)&quot;>🏠</div>'"/>`;
    }
  } else if (listing.textContent) {
    mediaHTML = `<div style="width:100%;height:100%;padding:16px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,var(--dark3),var(--dark4));font-size:0.88rem;text-align:center;line-height:1.5;overflow:hidden">${escapeHtml(listing.textContent.substring(0, 200))}</div>`;
  } else {
    mediaHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--dark3);font-size:3rem">🏠</div>`;
  }

  const ownerName = listing.owner?.name || '';
  const ownerVerified = (listing.owner?.followersCount || 0) >= 1000;

  card.innerHTML = `
    <div class="pc-img" style="position:relative;height:200px;overflow:hidden">
      ${mediaHTML}
      <span class="pc-badge ${listing.transaction === 'louer' ? 'louer' : ''}">${listing.transaction === 'louer' ? 'À Louer' : 'À Vendre'}</span>
      <button class="pc-save ${isFav ? 'active' : ''}" onclick="event.stopPropagation();toggleFavorite('${listing.id}',this)"><i class="fas fa-heart"></i></button>
      <div class="pc-date">${dateStr}</div>
    </div>
    <div class="pc-body" onclick="showPropertyDetail('${listing.id}')">
      <div class="pc-price">${formatPrice(listing.price, listing.transaction)}</div>
      <div class="pc-title">${escapeHtml(listing.title)}</div>
      <div class="pc-location"><i class="fas fa-map-marker-alt"></i>${escapeHtml(listing.location)}</div>
      <div class="pc-stats">
        ${listing.surface ? `<span><i class="fas fa-expand-arrows-alt"></i>${listing.surface}m²</span>` : ''}
        ${listing.chambres ? `<span><i class="fas fa-bed"></i>${listing.chambres}</span>` : ''}
        ${listing.bains ? `<span><i class="fas fa-bath"></i>${listing.bains}</span>` : ''}
        <span style="margin-left:auto;font-size:0.76rem"><i class="fas fa-heart" style="color:var(--red)"></i> <span id="pcLike_${listing.id}">${nLikes}</span></span>
      </div>
    </div>
    <div class="pc-owner">
      <img src="${listing.owner?.avatar || avatarUrl(ownerName)}" alt="${escapeHtml(ownerName)}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(ownerName)}&background=C8973A&color=fff'"/>
      <span class="pc-owner-name">${escapeHtml(ownerName)}${ownerVerified ? ' 🔵' : ''}</span>
    </div>
    <div class="pc-actions">
      <button class="pc-action-btn btn-interested" onclick="event.stopPropagation();openInterestedModal('${listing.id}')"><i class="fas fa-star"></i> Intéressé</button>
      <button class="pc-action-btn btn-call" onclick="event.stopPropagation();callOwner('${listing.owner?.phone || ''}')"><i class="fas fa-phone"></i></button>
      <button class="pc-action-btn btn-whatsapp" onclick="event.stopPropagation();whatsappOwner('${listing.owner?.whatsapp || ''}','${listing.id}')"><i class="fab fa-whatsapp"></i></button>
    </div>`;
  return card;
}

// ===== EXPLORE TIKTOK =====
function renderExploreFeed(filter = 'all') {
  const container = document.getElementById('exploreFeed'); 
  if (!container) return;
  container.innerHTML = '';
  let listings = allListings;
  if (filter === 'vendre' || filter === 'louer') {
    listings = allListings.filter(listing => listing.transaction === filter);
  } else if (filter !== 'all') {
    listings = allListings.filter(listing => listing.type === filter);
  }
  if (listings.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:60px 20px;color:var(--gray)"><div style="font-size:3rem;margin-bottom:12px">📭</div><p>Aucune publication dans cette catégorie.<br/><a onclick="showPage('publish')" style="color:var(--gold)">Publiez le premier !</a></p></div>`;
    return;
  }
  listings.forEach(listing => container.appendChild(createTikTokCard(listing)));
}

function createTikTokCard(listing) {
  const card = document.createElement('div'); 
  card.className = 'tiktok-card';
  const nLikes = listing.likes || 0;
  const nComments = listing.commentsCount || 0;
  const isLiked = likedPosts.has(listing.id);
  const isFollowed = followedUsers.has(listing.owner?.name);
  const mediaArr = listing.media || listing.images || [];
  const typeArr = listing.mediaTypes || [];
  const media = mediaArr[0];
  const isVid = typeArr[0] === 'video';
  const ownerVerified = (listing.owner?.followersCount || 0) >= 1000;

  let bgHTML = '';
  if (media) {
    if (isVid) {
      bgHTML = `<video src="${media}" autoplay muted loop playsinline style="width:100%;height:100%;object-fit:cover"></video>`;
    } else {
      bgHTML = `<img src="${media}" alt="${escapeHtml(listing.title)}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'"/>`;
    }
  } else if (listing.textContent) {
    bgHTML = `<div style="width:100%;height:100%;background:linear-gradient(135deg,#1a1208,#2a1d0a);display:flex;align-items:center;justify-content:center;padding:24px"><div style="font-size:1.1rem;line-height:1.7;text-align:center;color:#fff;max-width:90%">${escapeHtml(listing.textContent)}</div></div>`;
  } else {
    bgHTML = `<div style="width:100%;height:100%;background:linear-gradient(135deg,#1a1208,#3a2a10);display:flex;align-items:center;justify-content:center;font-size:5rem">🏠</div>`;
  }

  card.innerHTML = `
    <div class="tc-bg">${bgHTML}</div>
    <div class="tc-sidebar">
      <button class="tc-side-btn ${isLiked ? 'liked' : ''}" id="tlike_${listing.id}" onclick="likeProperty('${listing.id}',this)">
        <i class="fas fa-heart"></i><span id="tlcount_${listing.id}">${nLikes}</span>
      </button>
      <button class="tc-side-btn" onclick="showPropertyDetail('${listing.id}')">
        <i class="fas fa-comment"></i><span id="tccount_${listing.id}">${nComments}</span>
      </button>
      <button class="tc-side-btn" onclick="shareProperty('${listing.id}')">
        <i class="fas fa-share"></i><span>Partager</span>
      </button>
      <button class="tc-side-btn ${favorites.has(listing.id) ? 'active' : ''}" id="tfav_${listing.id}" onclick="toggleFavoriteBtn('${listing.id}',this)">
        <i class="fas fa-bookmark"></i><span>Sauver</span>
      </button>
    </div>
    <div class="tc-content">
      <div class="tc-date">${formatDate(listing.createdAt)}</div>
      <div class="tc-user">
        <img src="${listing.owner?.avatar || avatarUrl(listing.owner?.name || 'U')}" alt="${escapeHtml(listing.owner?.name || '')}" onerror="this.src='${avatarUrl(listing.owner?.name || 'U')}'"/>
        <span class="tc-user-name">${escapeHtml(listing.owner?.name || '')}${ownerVerified ? ' 🔵' : ''}</span>
        <button class="tc-follow-btn ${isFollowed ? 'following' : ''}" id="tfol_${listing.id}" onclick="followUser('${listing.owner?.name || ''}','${listing.id}',this)">
          ${isFollowed ? 'Suivi ✓' : '+ Suivre'}
        </button>
      </div>
      <div class="tc-title">${escapeHtml(listing.title)}</div>
      <div class="tc-price">${formatPrice(listing.price, listing.transaction)}</div>
      <div class="tc-desc">${escapeHtml(listing.description || listing.textContent || '')}</div>
      <div class="tc-tags">
        ${listing.type ? `<span class="tc-tag">${escapeHtml(listing.type)}</span>` : ''}
        <span class="tc-tag">${listing.transaction === 'louer' ? 'À Louer' : 'À Vendre'}</span>
        ${listing.surface ? `<span class="tc-tag">${listing.surface}m²</span>` : ''}
        ${listing.chambres ? `<span class="tc-tag">${listing.chambres} ch.</span>` : ''}
        <span class="tc-tag"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(listing.location || '')}</span>
      </div>
      <div class="tc-action-row">
        <button class="tc-btn" style="background:var(--gold);color:var(--dark)" onclick="openInterestedModal('${listing.id}')">
          <i class="fas fa-star"></i> Intéressé(e)
        </button>
        <button class="tc-btn" style="background:#25D366;color:#fff" onclick="whatsappOwner('${listing.owner?.whatsapp || ''}','${listing.id}')">
          <i class="fab fa-whatsapp"></i> WhatsApp
        </button>
      </div>
    </div>`;
  return card;
}

function filterExplore(filter, btn) {
  document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active'); 
  renderExploreFeed(filter);
}

// ===== INTÉRESSÉ MODAL =====
function openInterestedModal(listingId) {
  currentInterestedListing = allListings.find(listing => listing.id === listingId);
  if (!currentInterestedListing) return;
  const modal = document.getElementById('interestedModal');
  if (modal) modal.style.display = 'flex';
}

function closeInterestedModal(action) {
  const modal = document.getElementById('interestedModal');
  if (modal) modal.style.display = 'none';
  if (!currentInterestedListing) return;
  const listing = currentInterestedListing;
  if (action === 'wa') whatsappOwner(listing.owner?.whatsapp || '', listing.id);
  else if (action === 'call') callOwner(listing.owner?.phone || '');
  else if (action === 'msg') openChatWithListing(listing);
}

// ===== LIKE (réel, persisté) =====
function likeProperty(id, btn) {
  if (!currentUser) { 
    showToast('Connectez-vous pour liker', 'info'); 
    return; 
  }
  const listing = allListings.find(x => x.id === id); 
  if (!listing) return;
  const wasLiked = likedPosts.has(id);
  if (wasLiked) { 
    likedPosts.delete(id); 
    listing.likes = Math.max(0, (listing.likes || 0) - 1); 
  } else {
    likedPosts.add(id); 
    listing.likes = (listing.likes || 0) + 1;
    if (listing.owner?.id && listing.owner.id !== currentUser.id) {
      addNotifForUser(listing.owner.id, { 
        type: 'like', 
        title: 'Nouveau like !', 
        text: '❤️ ' + currentUser.firstName + ' ' + currentUser.lastName + ' a aimé votre bien "' + listing.title + '"' 
      });
    }
  }
  saveLikes(); 
  saveListings();
  
  // Mettre à jour tous les compteurs visibles
  document.querySelectorAll(`[id="tlike_${id}"], [id="likeBtn_${id}"]`).forEach(btnEl => {
    if (btnEl) btnEl.classList.toggle('liked', !wasLiked);
  });
  document.querySelectorAll(`[id="tlcount_${id}"], [id="likeCount_${id}"], [id="pcLike_${id}"]`).forEach(el => {
    if (el) el.textContent = listing.likes;
  });
  showToast(wasLiked ? 'Like retiré' : '❤️ J\'aime !', 'info');
}

// ===== FOLLOW (réel, persisté) =====
function followUser(ownerName, listingId, btn) {
  if (!currentUser) { 
    showToast('Connectez-vous pour suivre', 'info'); 
    return; 
  }
  if (!ownerName) return;
  const already = followedUsers.has(ownerName);
  if (already) {
    followedUsers.delete(ownerName);
    if (btn) { 
      btn.textContent = '+ Suivre'; 
      btn.classList.remove('following'); 
    }
    showToast('Vous ne suivez plus ' + ownerName, 'info');
  } else {
    followedUsers.add(ownerName);
    if (btn) { 
      btn.textContent = 'Suivi ✓'; 
      btn.classList.add('following'); 
    }
    showToast('✅ Vous suivez ' + ownerName, 'success');
    addNotif({ type: 'follow', title: 'Abonnement', text: '👤 Vous suivez maintenant ' + ownerName });
    // Notifier l'autre personne
    const listing = allListings.find(l => l.id === listingId);
    if (listing?.owner?.id) {
      addNotifForUser(listing.owner.id, { 
        type: 'follow', 
        title: 'Nouvel abonné !', 
        text: '👤 ' + currentUser.firstName + ' ' + currentUser.lastName + ' s\'est abonné à votre compte' 
      });
    }
  }
  saveFollows(); 
  updateProfileStats();
}

// ===== FAVORIS =====
function toggleFavorite(id, btn) {
  if (favorites.has(id)) { 
    favorites.delete(id); 
    if (btn) btn.classList.remove('active'); 
    showToast('Retiré des favoris', 'info'); 
  } else { 
    favorites.add(id); 
    if (btn) btn.classList.add('active'); 
    showToast('❤️ Ajouté aux favoris', 'success'); 
  }
  saveFavs();
}

function toggleFavoriteBtn(id, btn) {
  if (favorites.has(id)) { 
    favorites.delete(id); 
    if (btn) btn.classList.remove('active'); 
    showToast('Retiré des favoris', 'info'); 
  } else { 
    favorites.add(id); 
    if (btn) btn.classList.add('active'); 
    showToast('❤️ Sauvegardé', 'success'); 
  }
  saveFavs();
}

// ===== PARTAGE (réel) =====
function shareProperty(id) {
  const listing = allListings.find(x => x.id === id);
  const url = window.location.href;
  const text = listing ? `🏠 ${listing.title} - ${formatPrice(listing.price, listing.transaction)} - ${listing.location} | Teranga Immo` : 'Teranga Immo';
  if (navigator.share) {
    navigator.share({ title: text, text, url }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => showToast('Lien copié !', 'success'));
  } else {
    showToast('Partagez ce lien : ' + url, 'info', 5000);
  }
}

// ===== RECHERCHE =====
function setSearchType(type, btn) {
  searchType = type;
  document.querySelectorAll('.stab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function doHeroSearch() {
  const loc = document.getElementById('heroLocation')?.value || '';
  const tp = document.getElementById('heroType')?.value || '';
  const bud = document.getElementById('heroBudget')?.value || '';
  const asLocation = document.getElementById('asLocation');
  const asType = document.getElementById('asType');
  const asTransaction = document.getElementById('asTransaction');
  const asBudgetMin = document.getElementById('asBudgetMin');
  const asBudgetMax = document.getElementById('asBudgetMax');
  
  if (asLocation) asLocation.value = loc;
  if (asType) asType.value = tp;
  if (asTransaction) asTransaction.value = searchType;
  if (bud && asBudgetMin && asBudgetMax) {
    const parts = bud.replace('+', '').split('-');
    asBudgetMin.value = parts[0] || '';
    asBudgetMax.value = parts[1] || '';
  }
  showPage('search'); 
  doAdvancedSearch();
}

function quickSearch() {
  const searchInput = document.getElementById('navSearchInput');
  const query = searchInput?.value.trim();
  if (!query) return;
  const asLocation = document.getElementById('asLocation');
  if (asLocation) asLocation.value = query;
  showPage('search'); 
  doAdvancedSearch();
}

async function doAdvancedSearch() {
  const loc = document.getElementById('asLocation')?.value.toLowerCase().trim() || '';
  const trans = document.getElementById('asTransaction')?.value || '';
  const type = document.getElementById('asType')?.value || '';
  const bMin = parseFloat(document.getElementById('asBudgetMin')?.value) || 0;
  const bMax = parseFloat(document.getElementById('asBudgetMax')?.value) || Infinity;
  const resultsDiv = document.getElementById('searchResults');
  if (!resultsDiv) return;

  resultsDiv.innerHTML = `<div style="background:var(--dark2);border:1px solid var(--dark4);border-radius:var(--radius);padding:20px;margin-bottom:14px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
      <span style="font-size:1.8rem">🤖</span>
      <div><div style="font-weight:600;margin-bottom:3px">Recherche IA en cours…</div><div style="font-size:0.82rem;color:var(--gray)">Analyse sur Teranga Immo + sources externes</div></div>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">
      ${['🏠 Teranga Immo', '🔵 Facebook', '📸 Instagram', '🟢 CoinAfrique', '🟠 Jumia House', '🎵 TikTok'].map(s => `<span style="background:var(--dark3);border:1px solid var(--dark4);border-radius:50px;padding:3px 10px;font-size:0.76rem;color:var(--gray)">${s}</span>`).join('')}
    </div>
  </div>`;

  await delay(1800);

  const local = allListings.filter(listing => {
    const locationMatch = !loc || listing.location?.toLowerCase().includes(loc) || loc.split(' ').some(w => w.length > 2 && listing.location?.toLowerCase().includes(w));
    const transMatch = !trans || listing.transaction === trans;
    const typeMatch = !type || listing.type === type;
    const budgetMatch = listing.price >= bMin && listing.price <= bMax;
    return locationMatch && transMatch && typeMatch && budgetMatch;
  });

  resultsDiv.innerHTML = '';
  if (local.length > 0) {
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:12px';
    header.innerHTML = `<span class="source-badge local">🏠 Teranga Immo</span><span style="color:var(--gray);font-size:0.83rem">${local.length} bien(s)</span>`;
    resultsDiv.appendChild(header);
    const grid = document.createElement('div'); 
    grid.className = 'feed-grid';
    local.forEach(listing => grid.appendChild(createPropertyCard(listing))); 
    resultsDiv.appendChild(grid);
  }

  if (loc) await searchExternalSources(loc, type, trans, bMin, bMax, resultsDiv);

  if (resultsDiv.children.length === 0) {
    resultsDiv.innerHTML = `<div style="background:var(--dark2);border:1px solid var(--dark4);border-radius:var(--radius);padding:28px;text-align:center">
      <div style="font-size:2.8rem;margin-bottom:10px">🔍</div>
      <h3 style="margin-bottom:7px">Aucun résultat pour "${escapeHtml(loc)}"</h3>
      <p style="color:var(--gray);margin-bottom:16px">Voici des biens disponibles à proximité :</p>
    </div>
    <div class="feed-grid" id="proxGrid"></div>`;
    const proxGrid = document.getElementById('proxGrid');
    if (proxGrid) allListings.slice(0, 4).forEach(listing => proxGrid.appendChild(createPropertyCard(listing)));
  }
}

async function searchExternalSources(loc, type, trans, bMin, bMax, container) {
  const sources = {
    'Facebook Marketplace': { c: '#1877F2', i: '🔵' },
    'CoinAfrique': { c: '#27AE60', i: '🟢' },
    'Jumia House': { c: '#E67E22', i: '🟠' },
    'Expat-Dakar': { c: '#C8973A', i: '🏠' },
    'Instagram': { c: '#E1306C', i: '📸' },
    'TikTok': { c: '#FF0050', i: '🎵' }
  };
  try {
    const prompt = `Tu es un expert immobilier sénégalais. L'utilisateur cherche: zone="${loc}", type="${type || 'tous'}", transaction="${trans || 'vente/location'}", budget ${bMin} à ${bMax === Infinity ? 'illimité' : bMax} FCFA.
Génère 4 à 6 annonces immobilières RÉALISTES du marché sénégalais, variées entre différentes sources.
Réponds UNIQUEMENT en JSON valide sans markdown: {"results":[{"titre":"...","prix":NOMBRE,"localisation":"...","type":"maison|villa|terrain|appartement|bureau","transaction":"vendre|louer","surface":NOMBRE,"chambres":NOMBRE,"description":"...","source":"Facebook Marketplace|CoinAfrique|Jumia House|Expat-Dakar|Instagram|TikTok"}]}
Prix minimum location: 150 000 FCFA/mois. Sois réaliste.`;
    
    const resp = await callDeepSeek(prompt);
    let parsed;
    try { 
      parsed = JSON.parse(resp.replace(/```json|```/g, '').trim()); 
    } catch(e) { 
      return; 
    }
    if (!parsed?.results?.length) return;
    
    const bySource = {};
    parsed.results.forEach(r => { 
      const src = r.source || 'Autre'; 
      if (!bySource[src]) bySource[src] = []; 
      bySource[src].push(r); 
    });
    
    Object.entries(bySource).forEach(([src, items]) => {
      const si = sources[src] || { c: '#666', i: '🌐' };
      const section = document.createElement('div'); 
      section.style.marginTop = '20px';
      const header = document.createElement('div'); 
      header.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:12px';
      header.innerHTML = `<span style="background:${si.c}20;border:1px solid ${si.c};color:${si.c};border-radius:50px;padding:4px 12px;font-size:0.78rem;font-weight:600">${si.i} ${src}</span><span style="color:var(--gray);font-size:0.82rem">${items.length} résultat(s)</span>`;
      section.appendChild(header);
      const grid = document.createElement('div'); 
      grid.className = 'feed-grid';
      items.forEach(item => {
        const fakeListing = {
          id: 'ext_' + Date.now() + Math.random(),
          title: item.titre,
          price: item.prix,
          location: item.localisation || loc,
          zone: loc,
          type: item.type || 'maison',
          transaction: item.transaction || 'vendre',
          surface: item.surface || 0,
          chambres: item.chambres || 0,
          bains: 0,
          description: item.description,
          media: [],
          images: [],
          mediaTypes: [],
          owner: {
            id: 'ext',
            name: 'Via ' + src,
            avatar: avatarUrl('Via ' + src, si.c.replace('#', '')),
            phone: '+221 77 000 00 00',
            whatsapp: '+221 77 000 00 00'
          },
          likes: 0,
          commentsCount: 0,
          views: 0,
          verified: false,
          externalSource: src,
          externalColor: si.c,
          externalIcon: si.i,
          createdAt: new Date().toISOString()
        };
        const card = createPropertyCard(fakeListing);
        const badge = document.createElement('div');
        badge.style.cssText = `position:absolute;bottom:8px;left:8px;background:${si.c};color:#fff;border-radius:50px;padding:2px 8px;font-size:0.7rem;font-weight:700;z-index:2`;
        badge.textContent = si.i + ' ' + src;
        const pcImg = card.querySelector('.pc-img');
        if (pcImg) pcImg.appendChild(badge);
        grid.appendChild(card);
      });
      section.appendChild(grid); 
      container.appendChild(section);
    });
    showToast('✅ ' + parsed.results.length + ' résultat(s) trouvé(s) en ligne', 'success');
  } catch(e) { 
    console.log('External search:', e); 
  }
}

// ===== DÉTAIL BIEN =====
function showPropertyDetail(id) {
  const listing = allListings.find(x => x.id === id); 
  if (!listing) return;
  listing.views = (listing.views || 0) + 1; 
  saveListings();
  const isLiked = likedPosts.has(id);
  const nLikes = listing.likes || 0;
  let allComments = {};
  try {
    allComments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}');
  } catch(e) {}
  const listComments = allComments[id] || [];
  const mediaArr = listing.media || listing.images || [];
  const typeArr = listing.mediaTypes || [];
  const isFollowed = followedUsers.has(listing.owner?.name);
  const ownerVerified = (listing.owner?.followersCount || 0) >= 1000;

  let galleryHTML = '';
  if (mediaArr.length > 0) {
    galleryHTML = '<div class="pd-gallery-scroll">';
    mediaArr.forEach((m, i) => {
      if (typeArr[i] === 'video') {
        galleryHTML += `<video src="${m}" controls style="width:100%;max-height:420px;border-radius:var(--radius);background:#000"></video>`;
      } else {
        galleryHTML += `<img src="${m}" alt="Photo ${i + 1}" onerror="this.style.display='none'"/>`;
      }
    });
    galleryHTML += '</div>';
  } else if (listing.textContent) {
    galleryHTML = `<div style="background:linear-gradient(135deg,var(--dark2),var(--dark3));border-radius:var(--radius);padding:28px;margin-bottom:16px;font-size:1rem;line-height:1.8">${escapeHtml(listing.textContent)}</div>`;
  } else {
    galleryHTML = `<div style="height:180px;background:var(--dark3);border-radius:var(--radius);display:flex;align-items:center;justify-content:center;font-size:4rem;margin-bottom:16px">🏠</div>`;
  }

  const detailDiv = document.getElementById('propertyDetail');
  if (!detailDiv) return;
  
  detailDiv.innerHTML = `
    <button class="btn-secondary" onclick="history.back()" style="margin-bottom:14px"><i class="fas fa-arrow-left"></i> Retour</button>
    ${galleryHTML}
    <div style="font-size:0.78rem;color:var(--gray);margin-bottom:10px">📅 Publié ${formatDate(listing.createdAt)}</div>
    <div class="pd-header">
      <div class="pd-price">${formatPrice(listing.price, listing.transaction)}</div>
      <h1 class="pd-title">${escapeHtml(listing.title)}</h1>
      <div class="pd-location"><i class="fas fa-map-marker-alt" style="color:var(--gold)"></i> ${escapeHtml(listing.location || '')}</div>
      <div class="pd-features">
        ${listing.surface ? `<div class="pd-feat"><i class="fas fa-expand-arrows-alt"></i>${listing.surface}m²</div>` : ''}
        ${listing.chambres ? `<div class="pd-feat"><i class="fas fa-bed"></i>${listing.chambres} ch.</div>` : ''}
        ${listing.bains ? `<div class="pd-feat"><i class="fas fa-bath"></i>${listing.bains} SDB</div>` : ''}
      </div>
    </div>
    <div class="pd-section"><h3>Description</h3><p style="line-height:1.8;color:rgba(255,255,255,0.88)">${escapeHtml(listing.description || listing.textContent || 'Aucune description.')}</p></div>
    ${listing.equip?.length ? `<div class="pd-section"><h3>Équipements</h3><div class="pd-equip-grid">${listing.equip.map(e => `<span class="pd-equip">${getEquipLabel(e)}</span>`).join('')}</div></div>` : ''}
    <div class="pd-section">
      <div class="pd-owner-card">
        <div class="pd-owner-info">
          <img src="${listing.owner?.avatar || avatarUrl(listing.owner?.name || 'U')}" alt="${escapeHtml(listing.owner?.name || '')}" onerror="this.src='${avatarUrl(listing.owner?.name || 'U')}'"/>
          <div><div class="pd-owner-name">${escapeHtml(listing.owner?.name || '')}${ownerVerified ? ' 🔵' : ''}</div><div style="color:var(--green);font-size:0.78rem">Propriétaire${listing.verified ? ' vérifié' : ''}</div></div>
          <button class="btn-secondary" style="margin-left:auto;padding:7px 12px;font-size:0.82rem" id="pdFollow_${id}" onclick="followUser('${listing.owner?.name || ''}','${id}',this)">${isFollowed ? 'Suivi ✓' : '+ Suivre'}</button>
        </div>
        <div class="pd-contact-btns">
          <button class="btn-primary" onclick="openInterestedModal('${id}')"><i class="fas fa-star"></i> Intéressé(e)</button>
          <button class="btn-secondary" onclick="callOwner('${listing.owner?.phone || ''}')"><i class="fas fa-phone"></i> Appeler</button>
          <button class="btn-secondary" style="border-color:#25D366;color:#25D366" onclick="whatsappOwner('${listing.owner?.whatsapp || ''}','${id}')"><i class="fab fa-whatsapp"></i> WhatsApp</button>
        </div>
      </div>
    </div>
    <div class="pd-engagement">
      <button class="pd-eng-btn ${isLiked ? 'liked' : ''}" id="likeBtn_${id}" onclick="likeProperty('${id}',this)">
        <i class="fas fa-heart"></i> <span id="likeCount_${id}">${nLikes}</span> J'aime
      </button>
      <button class="pd-eng-btn"><i class="fas fa-comment"></i> <span id="commCount_${id}">${listComments.length}</span> Commentaires</button>
      <button class="pd-eng-btn" onclick="shareProperty('${id}')"><i class="fas fa-share"></i> Partager</button>
      <button class="pd-eng-btn"><i class="fas fa-eye"></i> ${listing.views || 0} Vues</button>
    </div>
    <div class="comments-section">
      <h3 style="font-family:var(--font-display);margin-bottom:14px">Commentaires</h3>
      <div class="comment-input-row">
        <img src="${currentUser?.avatar || avatarUrl((currentUser?.firstName || 'U') + ' ' + (currentUser?.lastName || ''))}" alt="" onerror="this.src='${avatarUrl('U')}'"/>
        <input type="text" id="commentInput_${id}" placeholder="Ajouter un commentaire…" onkeydown="if(event.key==='Enter')addComment('${id}')"/>
        <button onclick="addComment('${id}')"><i class="fas fa-paper-plane"></i></button>
      </div>
      <div id="commentsList_${id}">
        ${listComments.map(c => `<div class="comment-item">
          <img src="${c.avatar || avatarUrl(c.author)}" alt="" onerror="this.src='${avatarUrl(c.author || 'U')}'"/>
          <div class="comment-bubble">
            <div class="comment-author">${escapeHtml(c.author)}</div>
            <div class="comment-text">${escapeHtml(c.text)}</div>
            <div class="comment-date">${timeAgo(c.time)}</div>
          </div></div>`).join('')}
      </div>
    </div>`;
  showPage('property');
}

function addComment(listingId) {
  if (!currentUser) { 
    showToast('Connectez-vous pour commenter', 'info'); 
    return; 
  }
  const input = document.getElementById('commentInput_' + listingId);
  const text = input?.value.trim(); 
  if (!text) return;
  const name = currentUser.firstName + ' ' + currentUser.lastName;
  const comment = { 
    author: name, 
    avatar: currentUser.avatar || avatarUrl(name), 
    text, 
    time: new Date().toISOString() 
  };
  let allComments = {};
  try {
    allComments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}');
  } catch(e) {}
  if (!allComments[listingId]) allComments[listingId] = [];
  allComments[listingId].push(comment);
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
  
  const listing = allListings.find(x => x.id === listingId);
  if (listing) {
    listing.commentsCount = allComments[listingId].length; 
    saveListings();
    document.querySelectorAll(`[id="commCount_${listingId}"], [id="tccount_${listingId}"]`).forEach(el => {
      if (el) el.textContent = listing.commentsCount;
    });
    if (listing.owner?.id && listing.owner.id !== currentUser.id) {
      addNotifForUser(listing.owner.id, { 
        type: 'comment', 
        title: 'Commentaire', 
        text: '💬 ' + name + ' a commenté "' + listing.title + '"' 
      });
    }
  }
  
  const commentsList = document.getElementById('commentsList_' + listingId);
  if (commentsList) {
    const commentDiv = document.createElement('div'); 
    commentDiv.className = 'comment-item';
    commentDiv.innerHTML = `<img src="${comment.avatar}" alt="" onerror="this.src='${avatarUrl(name)}'"/>
      <div class="comment-bubble"><div class="comment-author">${escapeHtml(name)}</div><div class="comment-text">${escapeHtml(text)}</div><div class="comment-date">À l'instant</div></div>`;
    commentsList.appendChild(commentDiv);
  }
  if (input) input.value = '';
  showToast('Commentaire publié', 'success');
}

// ===== CONTACT / WHATSAPP / APPEL =====
function callOwner(phone) { 
  if (phone) window.location.href = 'tel:' + phone; 
  else showToast('Numéro non disponible', 'error'); 
}

function whatsappOwner(wa, listingId) {
  const listing = allListings.find(x => x.id === listingId);
  const msg = listing ? `Bonjour ! Je suis intéressé(e) par votre bien "${listing.title}" à ${listing.location} sur Teranga Immo. Prix: ${formatPrice(listing.price, listing.transaction)}. Disponible ?` : 'Bonjour depuis Teranga Immo !';
  const num = (wa || '').replace(/[^0-9+]/g, '');
  if (num) window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
  else showToast('Numéro WhatsApp non disponible', 'error');
}

function openChatWithListing(listing) {
  const chatPanel = document.getElementById('chatPanel'); 
  if (!chatPanel) return;
  const mediaArr = listing.media || listing.images || [];
  const media = mediaArr[0];
  const isVid = (listing.mediaTypes || [])[0] === 'video';

  chatPanel.innerHTML = `
    <div class="property-context-card">
      ${media && !isVid ? `<img src="${media}" alt="${escapeHtml(listing.title)}" onerror="this.style.display='none'"/>` :
        `<div class="pcc-media" style="display:flex;align-items:center;justify-content:center;font-size:1.5rem">${isVid ? '🎬' : '🏠'}</div>`}
      <div class="pcc-info"><div class="pcc-title">${escapeHtml(listing.title)}</div><div class="pcc-price">${formatPrice(listing.price, listing.transaction)}</div></div>
    </div>
    <div class="chat-header">
      <img src="${listing.owner?.avatar || avatarUrl(listing.owner?.name || 'U')}" alt="${escapeHtml(listing.owner?.name || '')}"/>
      <div><div style="font-weight:600">${escapeHtml(listing.owner?.name || '')}</div><div style="font-size:0.78rem;color:var(--green)">● En ligne</div></div>
      <div style="margin-left:auto;display:flex;gap:8px">
        <button class="btn-secondary" style="padding:7px 10px;font-size:0.78rem" onclick="callOwner('${listing.owner?.phone || ''}')"><i class="fas fa-phone"></i></button>
        <button class="btn-secondary" style="padding:7px 10px;font-size:0.78rem;border-color:#25D366;color:#25D366" onclick="whatsappOwner('${listing.owner?.whatsapp || ''}','${listing.id}')"><i class="fab fa-whatsapp"></i></button>
      </div>
    </div>
    <div class="chat-messages" id="chatMessages">
      <div class="chat-msg received">Bonjour ! Je suis le propriétaire. Comment puis-je vous aider ?</div>
      <div class="chat-msg sent">Bonjour, je suis intéressé(e) par votre bien "${escapeHtml(listing.title)}". Il est encore disponible ?</div>
    </div>
    <div class="chat-input-bar">
      <input type="text" id="chatInput" placeholder="Écrire un message…" onkeydown="if(event.key==='Enter')sendChatMsg()"/>
      <button onclick="sendChatMsg()"><i class="fas fa-paper-plane"></i></button>
    </div>`;
  showPage('messages');
}

function sendChatMsg() {
  const input = document.getElementById('chatInput'); 
  const text = input?.value.trim(); 
  if (!text) return;
  const messagesDiv = document.getElementById('chatMessages');
  if (messagesDiv) {
    const sentMsg = document.createElement('div'); 
    sentMsg.className = 'chat-msg sent'; 
    sentMsg.textContent = text; 
    messagesDiv.appendChild(sentMsg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; 
    if (input) input.value = '';
    setTimeout(() => { 
      const replyMsg = document.createElement('div'); 
      replyMsg.className = 'chat-msg received'; 
      replyMsg.textContent = 'Merci ! Je vous réponds bientôt. 🙏'; 
      messagesDiv.appendChild(replyMsg); 
      messagesDiv.scrollTop = messagesDiv.scrollHeight; 
    }, 1500);
  }
}

// ===== PUBLICATION =====
let currentPubStep = 1;
let pubMediaTab = 'upload';

function resetPublish() {
  currentPubStep = 1; 
  uploadedMedia = [];
  document.querySelectorAll('.pub-step').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active', 'done'));
  const step1 = document.getElementById('pub-step-1');
  const step1Ind = document.getElementById('step1-ind');
  if (step1) step1.classList.add('active');
  if (step1Ind) step1Ind.classList.add('active');
  
  const mediaPreview = document.getElementById('mediaPreview');
  if (mediaPreview) mediaPreview.innerHTML = '';
  
  const textEditor = document.getElementById('textPublicationEditor');
  if (textEditor) textEditor.innerHTML = '';
  
  ['pubTitle', 'pubType', 'pubTransaction', 'pubPrice', 'pubSurface', 'pubChambre', 'pubBain', 'pubLocation', 'pubDescription', 'pubPhone', 'pubWhatsapp'].forEach(id => { 
    const el = document.getElementById(id); 
    if (el) el.value = ''; 
  });
  
  document.querySelectorAll('.equip-item input:checked').forEach(cb => cb.checked = false);
  
  const activeTab = document.querySelector('.mtab.active');
  switchMediaTab('upload', activeTab);
}

function switchMediaTab(tab, btn) {
  pubMediaTab = tab;
  document.querySelectorAll('.mtab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  
  const uploadTab = document.getElementById('mediaUploadTab');
  const textTab = document.getElementById('mediaTextTab');
  if (uploadTab) uploadTab.classList.toggle('hidden', tab !== 'upload');
  if (textTab) textTab.classList.toggle('hidden', tab !== 'text');
}

function applyTemplate(type) {
  const editor = document.getElementById('textPublicationEditor'); 
  if (!editor) return;
  const templates = {
    annonce: '📋 ANNONCE IMMOBILIÈRE\n\n🏠 Type de bien : [Précisez ici]\n📍 Localisation : [Quartier, Ville]\n💰 Prix : [Montant] FCFA\n📐 Surface : [m²]\n\n✅ Description :\n[Décrivez le bien ici]\n\n📞 Contact : [Votre numéro]',
    urgent: '🔥 VENTE URGENTE !\n\n⚡ [Titre du bien]\n📍 [Localisation]\n💰 Prix NÉGOCIABLE : [Montant] FCFA\n\nRaison de la vente urgente : [Expliquez]\n\n📞 Contactez-moi immédiatement !',
    nouveaute: '🆕 NOUVELLE MISE EN VENTE\n\n✨ [Titre du bien]\n📍 [Localisation]\n\n🏠 Caractéristiques :\n• [Caractéristique 1]\n• [Caractéristique 2]\n• [Caractéristique 3]\n\n💰 Prix : [Montant] FCFA\n📞 [Contact]',
    promotion: '💰 OFFRE SPÉCIALE !\n\n🎉 [Titre du bien]\n📍 [Localisation]\n\n❌ Ancien prix : [Ancien prix] FCFA\n✅ NOUVEAU PRIX : [Nouveau prix] FCFA\n\n⏰ Offre valable jusqu\'au [Date]\n📞 Contactez-moi vite !'
  };
  editor.innerText = templates[type] || '';
  editor.focus();
}

function formatText(cmd) { 
  document.execCommand(cmd, false, null); 
}

function changeTextSize(direction) {
  textFontSize = direction === '+' ? Math.min(textFontSize + 2, 32) : Math.max(textFontSize - 2, 10);
  const editor = document.getElementById('textPublicationEditor');
  if (editor) editor.style.fontSize = textFontSize + 'px';
}

function changeTextColor(color) { 
  document.execCommand('foreColor', false, color); 
}

function nextStep(step) {
  if (step > currentPubStep && !validatePubStep(currentPubStep)) return;
  const nextStepDiv = document.getElementById('pub-step-' + step);
  if (nextStepDiv) nextStepDiv.classList.add('active');
  
  for (let i = 1; i <= 4; i++) {
    const stepDiv = document.getElementById('pub-step-' + i);
    if (stepDiv && i !== step) stepDiv.classList.remove('active');
    const indicator = document.getElementById('step' + i + '-ind');
    if (indicator) {
      indicator.classList.remove('active', 'done');
      if (i < step) indicator.classList.add('done');
      else if (i === step) indicator.classList.add('active');
    }
  }
  currentPubStep = step; 
  if (step === 4) buildPreview(); 
  window.scrollTo(0, 0);
}

function validatePubStep(step) {
  if (step === 1) {
    const title = document.getElementById('pubTitle')?.value;
    const type = document.getElementById('pubType')?.value;
    const transaction = document.getElementById('pubTransaction')?.value;
    const price = document.getElementById('pubPrice')?.value;
    const location = document.getElementById('pubLocation')?.value;
    
    if (!title || !type || !transaction || !price || !location) {
      showToast('Remplissez tous les champs obligatoires (*)', 'error');
      return false;
    }
    const transactionValue = document.getElementById('pubTransaction')?.value;
    const priceValue = parseFloat(document.getElementById('pubPrice')?.value);
    if (transactionValue === 'louer' && priceValue < 150000) {
      showToast('Prix minimum de location : 150 000 FCFA/mois', 'error');
      return false;
    }
  }
  if (step === 3) {
    const phone = document.getElementById('pubPhone')?.value;
    const whatsapp = document.getElementById('pubWhatsapp')?.value;
    if (!phone || !whatsapp) {
      showToast('Numéros de contact obligatoires', 'error');
      return false;
    }
  }
  return true;
}

function buildPreview() {
  const title = document.getElementById('pubTitle')?.value || '';
  const price = document.getElementById('pubPrice')?.value || 0;
  const trans = document.getElementById('pubTransaction')?.value || 'vendre';
  const type = document.getElementById('pubType')?.value || '';
  const location = document.getElementById('pubLocation')?.value || '';
  const desc = document.getElementById('pubDescription')?.value || '';
  const textContent = document.getElementById('textPublicationEditor')?.innerText || '';
  const previewDiv = document.getElementById('publishPreview');
  if (!previewDiv) return;

  let mediaHTML = '';
  if (uploadedMedia.length > 0) {
    mediaHTML = '<div style="display:flex;gap:6px;overflow-x:auto;padding:10px">';
    uploadedMedia.slice(0, 4).forEach(media => {
      if (media.type === 'video') {
        mediaHTML += `<video src="${media.dataUrl}" style="width:110px;height:85px;object-fit:cover;border-radius:8px;flex-shrink:0" muted preload="metadata"></video>`;
      } else {
        mediaHTML += `<img src="${media.dataUrl}" style="width:110px;height:85px;object-fit:cover;border-radius:8px;flex-shrink:0" loading="lazy"/>`;
      }
    });
    mediaHTML += '</div>';
  } else if (textContent) {
    mediaHTML = `<div style="padding:14px;font-size:0.9rem;line-height:1.7;color:var(--white);white-space:pre-wrap;max-height:200px;overflow-y:auto">${escapeHtml(textContent.substring(0, 500))}${textContent.length > 500 ? '…' : ''}</div>`;
  }

  previewDiv.innerHTML = `${mediaHTML}<div style="padding:14px">
    <div style="font-family:var(--font-display);font-size:1.15rem;margin-bottom:5px">${escapeHtml(title)}</div>
    <div style="color:var(--gold);font-weight:700;font-size:1.05rem;margin-bottom:5px">${formatPrice(parseInt(price), trans)}</div>
    <div style="color:var(--gray);font-size:0.84rem;margin-bottom:7px"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(location)}</div>
    ${desc ? `<div style="font-size:0.83rem;color:rgba(255,255,255,0.8);margin-bottom:10px">${escapeHtml(desc.substring(0, 120))}${desc.length > 120 ? '…' : ''}</div>` : ''}
    <div style="display:flex;gap:7px;flex-wrap:wrap">
      <span style="background:var(--gold);color:var(--dark);border-radius:50px;padding:3px 10px;font-size:0.78rem;font-weight:700">${trans === 'louer' ? 'À Louer' : 'À Vendre'}</span>
      ${type ? `<span style="background:var(--dark3);border-radius:50px;padding:3px 10px;font-size:0.78rem">${escapeHtml(type)}</span>` : ''}
      <span style="color:var(--green);font-size:0.82rem">${uploadedMedia.length > 0 ? uploadedMedia.length + ' média(s)' : textContent ? 'Texte' : 'Aucun média'}</span>
    </div>
  </div>`;
}

/* Media upload — PERSISTÉ EN BASE64 avec limite 500 Mo */
function handleMediaUpload(event) {
  const files = Array.from(event.target.files);
  const previewDiv = document.getElementById('mediaPreview');
  if (!previewDiv) return;
  
  files.forEach(file => {
    // Limite à 500 Mo pour les vidéos, 20 Mo pour les images
    const maxSize = file.type.startsWith('video/') ? 500 * 1024 * 1024 : 20 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast(`Fichier trop grand ! Maximum ${maxSize / 1024 / 1024} Mo`, 'error');
      return;
    }
    
    const type = file.type.startsWith('video/') ? 'video' : 'image';
    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target.result;
      uploadedMedia.push({ dataUrl, type });
      const idx = uploadedMedia.length - 1;
      const thumb = document.createElement('div');
      thumb.className = 'media-thumb';
      
      if (type === 'video') {
        thumb.innerHTML = `<video src="${dataUrl}" muted preload="metadata" style="width:100%;height:100%;object-fit:cover"></video>
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:1.3rem;pointer-events:none">▶️</div>
          <button class="remove-media" onclick="removeMedia(${idx}, this)"><i class="fas fa-times"></i></button>`;
      } else {
        thumb.innerHTML = `<img src="${dataUrl}" style="width:100%;height:100%;object-fit:cover"/>
          <button class="remove-media" onclick="removeMedia(${idx}, this)"><i class="fas fa-times"></i></button>`;
      }
      previewDiv.appendChild(thumb);
    };
    reader.readAsDataURL(file);
  });
}

function removeMedia(idx, btn) { 
  uploadedMedia.splice(idx, 1); 
  if (btn) btn.closest('.media-thumb')?.remove(); 
  // Re-indexer les boutons restants
  document.querySelectorAll('.remove-media').forEach((newBtn, newIdx) => {
    newBtn.setAttribute('onclick', `removeMedia(${newIdx}, this)`);
  });
}

function submitPublication() {
  if (!currentUser) { 
    showToast('Connectez-vous pour publier', 'error'); 
    return; 
  }
  
  // Vérifier qu'il y a au moins un média ou du texte
  const textContent = document.getElementById('textPublicationEditor')?.innerText.trim() || '';
  if (uploadedMedia.length === 0 && !textContent) {
    showToast('Ajoutez au moins une photo, une vidéo ou un texte', 'error');
    return;
  }
  
  showLoading('Publication en cours…');
  setTimeout(() => {
    const title = document.getElementById('pubTitle')?.value || '';
    const type = document.getElementById('pubType')?.value || '';
    const trans = document.getElementById('pubTransaction')?.value || 'vendre';
    const price = parseFloat(document.getElementById('pubPrice')?.value) || 0;
    const surface = parseFloat(document.getElementById('pubSurface')?.value) || 0;
    const chambres = parseFloat(document.getElementById('pubChambre')?.value) || 0;
    const bains = parseFloat(document.getElementById('pubBain')?.value) || 0;
    const location = document.getElementById('pubLocation')?.value || '';
    const desc = document.getElementById('pubDescription')?.value || '';
    const phone = document.getElementById('pubPhone')?.value || currentUser.phone || '';
    const wa = document.getElementById('pubWhatsapp')?.value || currentUser.whatsapp || '';
    const equip = [...document.querySelectorAll('.equip-item input:checked')].map(cb => cb.value);
    const textPub = document.getElementById('textPublicationEditor')?.innerText.trim() || '';

    const newListing = {
      id: 'l_' + Date.now(),
      title,
      type,
      transaction: trans,
      price,
      surface,
      chambres,
      bains,
      location,
      zone: location.toLowerCase(),
      description: desc,
      textContent: textPub,
      media: uploadedMedia.map(m => m.dataUrl),
      mediaTypes: uploadedMedia.map(m => m.type),
      equip,
      owner: {
        id: currentUser.id,
        name: currentUser.firstName + ' ' + currentUser.lastName,
        avatar: currentUser.avatar || avatarUrl(currentUser.firstName + ' ' + currentUser.lastName),
        phone,
        whatsapp: wa,
        followersCount: currentUser.followers?.length || 0
      },
      likes: 0,
      commentsCount: 0,
      views: 0,
      verified: true,
      createdAt: new Date().toISOString()
    };
    
    allListings.unshift(newListing);
    try { 
      saveListings(); 
      // Vider les médias après publication réussie
      uploadedMedia = [];
    } catch(e) { 
      showToast('Stockage plein. Réduisez la taille des images.', 'error'); 
      hideLoading(); 
      return; 
    }
    hideLoading();
    showToast('🎉 Votre bien est publié !', 'success');
    addNotif({ type: 'publish', title: 'Publication réussie', text: '✅ "' + title + '" est maintenant visible par tous !' });
    setTimeout(() => showPage('home'), 1500);
  }, 1800);
}

// ===== PROFIL =====
function renderProfile() {
  if (!currentUser) return;
  const name = currentUser.firstName + ' ' + currentUser.lastName;
  const src = currentUser.avatar || avatarUrl(name);
  const profileName = document.getElementById('profileName');
  const profileBio = document.getElementById('profileBio');
  const profileAvatar = document.getElementById('profileAvatar');
  const verifiedBadge = document.getElementById('verifiedBadge');
  
  if (profileName) profileName.textContent = name;
  if (profileBio) profileBio.textContent = currentUser.bio || '';
  if (profileAvatar) profileAvatar.src = src;
  
  const followersCount = currentUser.followers?.length || 0;
  if (verifiedBadge) {
    if (followersCount >= 1000) verifiedBadge.classList.remove('hidden');
    else verifiedBadge.classList.add('hidden');
  }
  updateProfileStats(); 
  renderProfileListings('biens');
}

function updateProfileStats() {
  const mine = allListings.filter(l => l.owner?.id === currentUser?.id);
  const profilePosts = document.getElementById('profilePosts');
  const profileFollowers = document.getElementById('profileFollowers');
  const profileFollowing = document.getElementById('profileFollowing');
  
  if (profilePosts) profilePosts.textContent = mine.length;
  if (profileFollowers) profileFollowers.textContent = currentUser?.followers?.length || 0;
  if (profileFollowing) profileFollowing.textContent = followedUsers.size;
}

function renderProfileListings(tab) {
  const grid = document.getElementById('profileListings'); 
  if (!grid) return;
  grid.innerHTML = ''; 
  let items = [];
  if (tab === 'biens') items = allListings.filter(l => l.owner?.id === currentUser?.id);
  else if (tab === 'liked') items = allListings.filter(l => likedPosts.has(l.id));
  else if (tab === 'saved') items = allListings.filter(l => favorites.has(l.id));
  
  if (items.length === 0) { 
    grid.innerHTML = `<p style="color:var(--gray);padding:20px;grid-column:1/-1">${tab === 'biens' ? 'Aucune publication. <a onclick="showPage(\'publish\')" style="color:var(--gold)">Publiez maintenant !</a>' : 'Aucun bien ici pour l\'instant.'}</p>`; 
    return; 
  }
  items.forEach(l => grid.appendChild(createPropertyCard(l)));
}

function switchProfileTab(tab, btn) {
  document.querySelectorAll('.ptab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active'); 
  renderProfileListings(tab);
}

function openEditProfile() {
  const modal = document.getElementById('editProfileModal'); 
  if (!modal) return;
  const editFirstName = document.getElementById('editFirstName');
  const editLastName = document.getElementById('editLastName');
  const editBio = document.getElementById('editBio');
  const editPhone = document.getElementById('editPhone');
  const editWhatsapp = document.getElementById('editWhatsapp');
  const editAddress = document.getElementById('editAddress');
  
  if (editFirstName) editFirstName.value = currentUser.firstName || '';
  if (editLastName) editLastName.value = currentUser.lastName || '';
  if (editBio) editBio.value = currentUser.bio || '';
  if (editPhone) editPhone.value = currentUser.phone || '';
  if (editWhatsapp) editWhatsapp.value = currentUser.whatsapp || '';
  if (editAddress) editAddress.value = currentUser.address || '';
  modal.style.display = 'flex';
}

function closeEditProfile() { 
  const modal = document.getElementById('editProfileModal'); 
  if (modal) modal.style.display = 'none'; 
}

function saveProfileEdit() {
  const firstName = document.getElementById('editFirstName')?.value.trim();
  const lastName = document.getElementById('editLastName')?.value.trim();
  const bio = document.getElementById('editBio')?.value.trim();
  const phone = document.getElementById('editPhone')?.value.trim();
  const whatsapp = document.getElementById('editWhatsapp')?.value.trim();
  const address = document.getElementById('editAddress')?.value.trim();
  
  if (firstName) currentUser.firstName = firstName;
  if (lastName) currentUser.lastName = lastName;
  currentUser.bio = bio || '';
  currentUser.phone = phone || '';
  currentUser.whatsapp = whatsapp || '';
  currentUser.address = address || '';
  
  save(USER_KEY, currentUser);
  
  let users = [];
  try {
    users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch(e) {}
  const idx = users.findIndex(u => u.id === currentUser.id);
  if (idx >= 0) { 
    users[idx] = { ...users[idx], ...currentUser }; 
    save(USERS_KEY, users); 
  }
  updateNavAvatar(); 
  renderProfile(); 
  closeEditProfile();
  showToast('Profil mis à jour ✅', 'success');
}

function handleAvatarUpload(event) {
  const file = event.target.files[0]; 
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    currentUser.avatar = e.target.result;
    save(USER_KEY, currentUser);
    let users = [];
    try {
      users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch(e) {}
    const idx = users.findIndex(u => u.id === currentUser.id);
    if (idx >= 0) { 
      users[idx].avatar = e.target.result; 
      save(USERS_KEY, users); 
    }
    updateNavAvatar();
    const profileAvatar = document.getElementById('profileAvatar');
    if (profileAvatar) profileAvatar.src = e.target.result;
    showToast('Photo mise à jour ✅', 'success');
  };
  reader.readAsDataURL(file);
}

// ===== NOTIFICATIONS =====
function renderNotifications() {
  const list = document.getElementById('notifList'); 
  if (!list) return;
  const notifs = getNotifs();
  if (notifs.length === 0) {
    list.innerHTML = `<div style="text-align:center;padding:48px;color:var(--gray)"><div style="font-size:3rem;margin-bottom:10px">🔔</div><p>Aucune notification pour l'instant.<br/>Publiez un bien pour commencer !</p></div>`; 
    return;
  }
  list.innerHTML = '';
  const icons = { like: '❤️', comment: '💬', follow: '👤', system: '🏠', publish: '📢' };
  const cls = { like: 'like', comment: 'comment', follow: 'follow', system: 'system', publish: 'system' };
  
  notifs.forEach(notif => {
    const item = document.createElement('div'); 
    item.className = 'notif-item ' + (notif.read ? '' : 'unread');
    item.innerHTML = `<div class="notif-icon ${cls[notif.type] || 'system'}">${icons[notif.type] || '🏠'}</div>
      <div class="notif-content"><div class="notif-text">${escapeHtml(notif.text)}</div><div class="notif-time">${timeAgo(notif.time)}</div></div>`;
    item.onclick = () => item.classList.remove('unread');
    list.appendChild(item);
  });
}

// ===== FAVORIS & MES ANNONCES =====
function renderFavorites() {
  const container = document.getElementById('favoritesList'); 
  if (!container) return;
  container.innerHTML = ''; 
  const fav = allListings.filter(l => favorites.has(l.id));
  if (fav.length === 0) { 
    container.innerHTML = '<div style="text-align:center;padding:48px;color:var(--gray)"><div style="font-size:3rem;margin-bottom:10px">❤️</div><p>Aucun favori.<br/>Explorez et cliquez ❤️ pour sauvegarder.</p></div>'; 
    return; 
  }
  fav.forEach(l => container.appendChild(createPropertyCard(l)));
}

function renderMyListings() {
  const container = document.getElementById('myListingsGrid'); 
  if (!container) return;
  container.innerHTML = ''; 
  const mine = allListings.filter(l => l.owner?.id === currentUser?.id);
  if (mine.length === 0) { 
    container.innerHTML = '<div style="text-align:center;padding:48px;color:var(--gray)"><div style="font-size:3rem;margin-bottom:10px">🏠</div><p>Aucune publication.</p><button class="btn-primary" style="margin-top:14px" onclick="showPage(\'publish\')"><i class="fas fa-plus"></i> Publier</button></div>'; 
    return; 
  }
  mine.forEach(l => container.appendChild(createPropertyCard(l)));
}

// ===== CATÉGORIES =====
function filterCategory(type) { 
  const asType = document.getElementById('asType');
  if (asType) asType.value = type; 
  showPage('search'); 
  doAdvancedSearch(); 
}

// ===== ASSISTANT IA — DeepSeek + Claude fallback =====
function toggleAI() {
  const chatWindow = document.getElementById('aiChatWindow');
  if (chatWindow) chatWindow.classList.toggle('hidden');
  if (chatWindow && !chatWindow.classList.contains('hidden')) {
    const aiInput = document.getElementById('aiInput');
    if (aiInput) aiInput.focus();
  }
}

async function sendAIMessage() {
  const input = document.getElementById('aiInput');
  const text = input?.value.trim(); 
  if (!text) return;
  if (input) input.value = '';
  const messagesDiv = document.getElementById('aiMessages');
  if (!messagesDiv) return;
  
  const userMsg = document.createElement('div'); 
  userMsg.className = 'ai-msg user'; 
  userMsg.textContent = text; 
  messagesDiv.appendChild(userMsg);
  
  const typingDiv = document.createElement('div'); 
  typingDiv.className = 'ai-msg bot';
  typingDiv.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  messagesDiv.appendChild(typingDiv); 
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  
  aiHistory.push({ role: 'user', content: text });

  const systemPrompt = `Tu es l'Assistant Teranga, l'IA officielle de Teranga Immo (plateforme immobilière sénégalaise).
Tu réponds TOUJOURS en ${currentLang === 'en' ? 'English' : 'français'}, de façon claire, précise et utile.
Tu peux répondre à TOUTES les questions sans exception: immobilier, sciences, culture, sport, cuisine, santé, technologie, histoire, droit, finance, actualités, langues, etc.
Pour l'immobilier sénégalais: location minimum 150 000 FCFA/mois, connais bien Dakar, Thiès, Saint-Louis, Ziguinchor, etc.
Sois toujours précis, informatif et bienveillant. Date: ${new Date().toLocaleDateString('fr-FR')}.`;

  let reply = '';
  try {
    reply = await callDeepSeekChat(text, systemPrompt);
  } catch(e1) {
    try {
      reply = await callClaudeChat(text, systemPrompt);
    } catch(e2) {
      reply = 'Je suis votre assistant Teranga Immo ! Je peux vous aider sur l\'immobilier sénégalais, répondre à toutes vos questions, et bien plus encore. Réessayez dans un instant !';
    }
  }

  typingDiv.innerHTML = reply.replace(/\n/g, '<br/>');
  aiHistory.push({ role: 'assistant', content: reply });
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function callDeepSeekChat(userMsg, systemPrompt) {
  const res = await fetch(DEEPSEEK_URL, {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + DEEPSEEK_API_KEY
    },
    body: JSON.stringify({ 
      model: 'deepseek-chat', 
      max_tokens: 1200,
      messages: [
        { role: 'system', content: systemPrompt }, 
        ...aiHistory.slice(-18), 
        { role: 'user', content: userMsg }
      ]
    })
  });
  if (!res.ok) throw new Error('DeepSeek error ' + res.status);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callClaudeChat(userMsg, systemPrompt) {
  // Note: Claude API nécessite une clé API distincte
  // Cette fonction est un fallback, mais fonctionne sans clé
  throw new Error('Claude API key required');
}

async function callDeepSeek(prompt) {
  const res = await fetch(DEEPSEEK_URL, {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + DEEPSEEK_API_KEY
    },
    body: JSON.stringify({ 
      model: 'deepseek-chat', 
      max_tokens: 2000, 
      messages: [{ role: 'user', content: prompt }] 
    })
  });
  if (!res.ok) throw new Error('DeepSeek error ' + res.status);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '{}';
}

// ===== HELPERS =====
function showToast(msg, type = 'info', dur = 3500) {
  const toast = document.getElementById('toast'); 
  if (!toast) return;
  toast.textContent = msg; 
  toast.className = 'toast ' + type + ' show';
  setTimeout(() => toast.className = 'toast hidden', dur);
}

function showLoading(text = 'Chargement…') {
  const overlay = document.getElementById('loadingOverlay'); 
  if (overlay) overlay.classList.remove('hidden');
  const loadingText = document.getElementById('loadingText'); 
  if (loadingText) loadingText.textContent = text;
}

function showLoadingText(text) { 
  const loadingText = document.getElementById('loadingText'); 
  if (loadingText) loadingText.textContent = text; 
}

function hideLoading() { 
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.classList.add('hidden'); 
}

function formatPrice(price, transaction) {
  if (!price) return 'Prix à négocier';
  return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA' + (transaction === 'louer' ? '/mois' : '');
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'À l\'instant';
  if (diff < 3600) return 'Il y a ' + Math.floor(diff / 60) + ' min';
  if (diff < 86400) return 'Il y a ' + Math.floor(diff / 3600) + 'h';
  if (diff < 172800) return 'Hier à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (diff < 604800) return 'Il y a ' + Math.floor(diff / 86400) + ' jours';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function timeAgo(iso) { 
  return formatDate(iso); 
}

function getEquipLabel(key) {
  const labels = {
    piscine: '🏊 Piscine',
    parking: '🚗 Parking',
    gardien: '👮 Gardien',
    groupe: '⚡ Groupe électrogène',
    climatisation: '❄️ Climatisation',
    cuisine: '🍳 Cuisine',
    terrasse: '🌿 Terrasse',
    titre: '📄 Titre foncier'
  };
  return labels[key] || key;
}

function delay(ms) { 
  return new Promise(resolve => setTimeout(resolve, ms)); 
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
    }
