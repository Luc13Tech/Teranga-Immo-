// =============================================
// TERANGA IMMO - Application JavaScript
// =============================================

// ===== STATE =====
let currentUser = null;
let currentPage = 'home';
let searchType = 'vendre';
let uploadedMedia = [];
let favorites = new Set();
let likes = {};
let follows = new Set();
let comments = {};
let allListings = [];
let conversations = [];

// ===== MOCK DATA =====
const MOCK_LISTINGS = [
  {
    id: 1, type: 'villa', transaction: 'vendre',
    title: 'Magnifique Villa avec Piscine aux Almadies',
    price: 250000000, surface: 400, chambres: 5, bains: 4,
    location: 'Almadies, Dakar', zone: 'dakar',
    description: 'Somptueuse villa contemporaine avec piscine, jardin tropical, garage 3 voitures. Vue mer exceptionnelle. Titre foncier disponible.',
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
             'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&q=80',
             'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=400&q=80'],
    owner: { name: 'Mamadou Diallo', avatar: 'https://ui-avatars.com/api/?name=Mamadou+Diallo&background=C8973A&color=fff', phone: '+221 77 123 45 67', whatsapp: '+221 77 123 45 67' },
    equip: ['piscine','parking','gardien','climatisation','titre'],
    likes: 142, comments: 23, views: 1820, verified: true
  },
  {
    id: 2, type: 'appartement', transaction: 'louer',
    title: 'Appartement Moderne F3 à Plateau',
    price: 350000, surface: 95, chambres: 3, bains: 2,
    location: 'Plateau, Dakar', zone: 'dakar',
    description: 'Bel appartement meublé au 4e étage avec ascenseur. Cuisine équipée, deux terrasses avec vue sur mer. Proche de toutes commodités.',
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
             'https://images.unsplash.com/photo-1560185008-a33f5b8c6a31?w=400&q=80'],
    owner: { name: 'Fatou Sow', avatar: 'https://ui-avatars.com/api/?name=Fatou+Sow&background=E5B96A&color=333', phone: '+221 76 234 56 78', whatsapp: '+221 76 234 56 78' },
    equip: ['climatisation','parking','cuisine'],
    likes: 89, comments: 14, views: 950, verified: true
  },
  {
    id: 3, type: 'terrain', transaction: 'vendre',
    title: 'Terrain Titré – Keur Massar, Grande Voie',
    price: 18000000, surface: 300, chambres: 0, bains: 0,
    location: 'Keur Massar, Dakar', zone: 'keur massar',
    description: 'Terrain plat et viabilisé à 200m de la grande voie de Keur Massar. Titre foncier, eau, électricité disponibles. Idéal pour construction.',
    images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80',
             'https://images.unsplash.com/photo-1592982537447-6f2a6a0a5b1a?w=400&q=80'],
    owner: { name: 'Ibrahima Kane', avatar: 'https://ui-avatars.com/api/?name=Ibrahima+Kane&background=2ECC71&color=fff', phone: '+221 77 345 67 89', whatsapp: '+221 77 345 67 89' },
    equip: ['titre'],
    likes: 204, comments: 41, views: 3200, verified: true
  },
  {
    id: 4, type: 'maison', transaction: 'vendre',
    title: 'Belle Maison R+1 à Pikine Technopole',
    price: 45000000, surface: 180, chambres: 4, bains: 3,
    location: 'Pikine, Dakar', zone: 'pikine',
    description: 'Maison de maître avec salon spacieux, cuisine américaine, 4 chambres dont 1 suite parentale avec dressing. Quartier résidentiel calme.',
    images: ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80',
             'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&q=80'],
    owner: { name: 'Aïssatou Ndiaye', avatar: 'https://ui-avatars.com/api/?name=Aissatou+Ndiaye&background=3498DB&color=fff', phone: '+221 78 456 78 90', whatsapp: '+221 78 456 78 90' },
    equip: ['parking','groupe','climatisation'],
    likes: 67, comments: 9, views: 780, verified: false
  },
  {
    id: 5, type: 'villa', transaction: 'louer',
    title: 'Villa Meublée Standing – Sacré-Cœur 3',
    price: 1500000, surface: 250, chambres: 4, bains: 3,
    location: 'Sacré-Cœur 3, Dakar', zone: 'dakar',
    description: 'Villa entièrement meublée avec goût, piscine chauffée, salle de sport, jardin. Idéale pour expatriés. Disponible dès maintenant.',
    images: ['https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&q=80',
             'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=400&q=80'],
    owner: { name: 'Jean-Baptiste Moreau', avatar: 'https://ui-avatars.com/api/?name=Jean+Moreau&background=9B59B6&color=fff', phone: '+221 77 567 89 01', whatsapp: '+221 77 567 89 01' },
    equip: ['piscine','parking','gardien','climatisation','cuisine','groupe'],
    likes: 311, comments: 52, views: 4100, verified: true
  },
  {
    id: 6, type: 'terrain', transaction: 'vendre',
    title: 'Grand Terrain à Thiès Centre – Titre Foncier',
    price: 25000000, surface: 600, chambres: 0, bains: 0,
    location: 'Thiès Centre, Thiès', zone: 'thies',
    description: 'Vaste terrain de 600m² en plein centre de Thiès avec titre foncier. Accès facile, viabilisé. Parfait pour immeuble ou villa de standing.',
    images: ['https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80'],
    owner: { name: 'Ousmane Ba', avatar: 'https://ui-avatars.com/api/?name=Ousmane+Ba&background=E74C3C&color=fff', phone: '+221 76 678 90 12', whatsapp: '+221 76 678 90 12' },
    equip: ['titre'],
    likes: 45, comments: 7, views: 520, verified: true
  }
];

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'like', icon: '❤️', text: '<strong>Mamadou Diallo</strong> a aimé votre publication', time: 'Il y a 5 min', unread: true },
  { id: 2, type: 'comment', icon: '💬', text: '<strong>Fatou Sow</strong> a commenté: "Très beau bien, est-il encore disponible ?"', time: 'Il y a 22 min', unread: true },
  { id: 3, type: 'follow', icon: '👤', text: '<strong>Ibrahima Kane</strong> s\'est abonné à votre profil', time: 'Il y a 1h', unread: true },
  { id: 4, type: 'system', icon: '🏠', text: 'Votre annonce "Terrain Keur Massar" est en ligne et visible par tous', time: 'Il y a 2h', unread: false },
  { id: 5, type: 'like', icon: '❤️', text: '<strong>Aïssatou Ndiaye</strong> a aimé votre publication', time: 'Il y a 3h', unread: false },
  { id: 6, type: 'system', icon: '✅', text: 'Votre identité a été vérifiée avec succès !', time: 'Hier', unread: false }
];

const MOCK_CONVERSATIONS = [
  { id: 1, name: 'Mamadou Diallo', avatar: 'https://ui-avatars.com/api/?name=Mamadou+Diallo&background=C8973A&color=fff', last: 'Le terrain est encore disponible ?', time: '09:42', property: MOCK_LISTINGS[2] },
  { id: 2, name: 'Fatou Sow', avatar: 'https://ui-avatars.com/api/?name=Fatou+Sow&background=E5B96A&color=333', last: 'Je suis intéressée par votre villa', time: 'Hier', property: MOCK_LISTINGS[0] },
];

// ===== INIT =====
window.addEventListener('load', () => {
  // Initialize data
  allListings = MOCK_LISTINGS;
  MOCK_LISTINGS.forEach(l => { likes[l.id] = l.likes; });

  // Splash screen
  setTimeout(() => {
    const splash = document.getElementById('splash');
    splash.classList.add('fade-out');
    setTimeout(() => {
      splash.style.display = 'none';
      initApp();
    }, 800);
  }, 2000);
});

function initApp() {
  const savedUser = localStorage.getItem('ti_user');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showApp();
  } else {
    showAuthOverlay();
    showModal('login');
  }
}

function showApp() {
  document.getElementById('app').classList.remove('hidden');
  updateNavAvatar();
  renderHomeFeed();
  renderExploreFeed();
  renderNotifications();
  renderConversations();
  showPage('home');
}

function updateNavAvatar() {
  if (!currentUser) return;
  const name = `${currentUser.firstName} ${currentUser.lastName}`;
  document.getElementById('navAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=C8973A&color=fff`;
  document.getElementById('profileName').textContent = name;
  document.getElementById('profileBio').textContent = currentUser.address || 'Utilisateur Teranga Immo';
  document.getElementById('profileAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=C8973A&color=fff&size=100`;
}

// ===== PAGES =====
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`page-${page}`);
  if (target) {
    target.classList.add('active');
    currentPage = page;
    window.scrollTo(0, 0);
  }
  if (page === 'home') renderHomeFeed();
  if (page === 'explore') renderExploreFeed();
  if (page === 'profile') renderProfile();
  if (page === 'my-listings') renderMyListings();
  if (page === 'favorites') renderFavorites();
  if (page === 'publish') resetPublish();
}

// ===== AUTH =====
function showAuthOverlay() {
  document.getElementById('authOverlay').style.display = 'flex';
}
function hideAuthOverlay() {
  document.getElementById('authOverlay').style.display = 'none';
}
function showModal(name) {
  document.querySelectorAll('.auth-modal').forEach(m => m.classList.add('hidden'));
  document.getElementById(`${name}Modal`).classList.remove('hidden');
}

function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) { showToast('Veuillez remplir tous les champs', 'error'); return; }
  showLoading('Connexion en cours…');
  setTimeout(() => {
    hideLoading();
    const savedUser = localStorage.getItem('ti_user');
    if (savedUser) {
      currentUser = JSON.parse(savedUser);
    } else {
      currentUser = { firstName: 'Demo', lastName: 'User', email, address: 'Dakar, Sénégal' };
      localStorage.setItem('ti_user', JSON.stringify(currentUser));
    }
    hideAuthOverlay();
    showApp();
    showToast('Bienvenue sur Teranga Immo ! 🏠', 'success');
  }, 1500);
}

function doRegister() {
  const firstName = document.getElementById('regFirstName').value.trim();
  const lastName = document.getElementById('regLastName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const phone = document.getElementById('regPhone').value.trim();
  const whatsapp = document.getElementById('regWhatsapp').value.trim();
  const address = document.getElementById('regAddress').value.trim();
  const terms = document.getElementById('regTerms').checked;

  if (!firstName || !lastName || !email || !password || !phone || !whatsapp || !address) {
    showToast('Veuillez remplir tous les champs obligatoires', 'error'); return;
  }
  if (!terms) { showToast('Veuillez accepter les conditions d\'utilisation', 'error'); return; }
  if (password.length < 8) { showToast('Le mot de passe doit faire au moins 8 caractères', 'error'); return; }

  showLoading('Vérification de votre identité par IA…');
  setTimeout(() => {
    showLoadingText('Analyse de votre pièce d\'identité…');
    setTimeout(() => {
      showLoadingText('Comparaison des données…');
      setTimeout(() => {
        hideLoading();
        currentUser = { firstName, lastName, email, phone, whatsapp, address };
        localStorage.setItem('ti_user', JSON.stringify(currentUser));
        hideAuthOverlay();
        showApp();
        showToast(`Bienvenue ${firstName} ! Compte créé avec succès ✅`, 'success');
        // Simulate admin email notification
        console.log('📧 Email admin envoyé:', { firstName, lastName, email, phone, whatsapp, address });
      }, 1500);
    }, 1500);
  }, 1500);
}

function doForgot() {
  const email = document.getElementById('forgotEmail').value.trim();
  if (!email) { showToast('Entrez votre email', 'error'); return; }
  showToast('Lien de réinitialisation envoyé à ' + email, 'success');
  setTimeout(() => showModal('login'), 2000);
}

function logout() {
  localStorage.removeItem('ti_user');
  currentUser = null;
  document.getElementById('app').classList.add('hidden');
  showAuthOverlay();
  showModal('login');
  showToast('Vous avez été déconnecté', 'info');
}

function togglePwd(id) {
  const inp = document.getElementById(id);
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

// ===== RENDER HOME FEED =====
function renderHomeFeed() {
  const container = document.getElementById('homeFeed');
  if (!container) return;
  container.innerHTML = '';
  allListings.slice(0, 6).forEach(listing => {
    container.appendChild(createPropertyCard(listing));
  });

  const featured = document.getElementById('featuredListings');
  if (featured) {
    featured.innerHTML = '';
    allListings.filter(l => l.likes > 100).forEach(l => {
      featured.appendChild(createPropertyCard(l));
    });
  }
}

function createPropertyCard(listing) {
  const card = document.createElement('div');
  card.className = 'property-card';
  const isFav = favorites.has(listing.id);
  const likesCount = likes[listing.id] || listing.likes;
  card.innerHTML = `
    <div class="pc-img">
      <img src="${listing.images[0]}" alt="${listing.title}" loading="lazy"/>
      <span class="pc-badge ${listing.transaction === 'louer' ? 'louer' : ''}">
        ${listing.transaction === 'vendre' ? 'À Vendre' : 'À Louer'}
      </span>
      <button class="pc-save ${isFav ? 'active' : ''}" onclick="toggleFavorite(${listing.id},this)">
        <i class="fas fa-heart"></i>
      </button>
    </div>
    <div class="pc-body">
      <div class="pc-price">${formatPrice(listing.price, listing.transaction)}</div>
      <div class="pc-title">${listing.title}</div>
      <div class="pc-location"><i class="fas fa-map-marker-alt"></i>${listing.location}</div>
      <div class="pc-stats">
        ${listing.surface ? `<span><i class="fas fa-expand-arrows-alt"></i> ${listing.surface}m²</span>` : ''}
        ${listing.chambres ? `<span><i class="fas fa-bed"></i> ${listing.chambres}</span>` : ''}
        ${listing.bains ? `<span><i class="fas fa-bath"></i> ${listing.bains}</span>` : ''}
      </div>
    </div>
    <div class="pc-owner">
      <img src="${listing.owner.avatar}" alt="${listing.owner.name}"/>
      <span class="pc-owner-name">${listing.owner.name}${listing.verified ? ' ✅' : ''}</span>
    </div>
    <div class="pc-actions">
      <button class="pc-action-btn btn-interested" onclick="contactOwner(${listing.id})">
        <i class="fas fa-star"></i> Intéressé
      </button>
      <button class="pc-action-btn btn-call" onclick="callOwner('${listing.owner.phone}')">
        <i class="fas fa-phone"></i>
      </button>
      <button class="pc-action-btn btn-whatsapp" onclick="whatsappOwner('${listing.owner.whatsapp}',${listing.id})">
        <i class="fab fa-whatsapp"></i>
      </button>
    </div>
  `;
  card.querySelector('.pc-img img').addEventListener('click', () => showPropertyDetail(listing.id));
  card.querySelector('.pc-body').addEventListener('click', () => showPropertyDetail(listing.id));
  return card;
}

// ===== EXPLORE FEED (TikTok style) =====
function renderExploreFeed(filter = 'all') {
  const container = document.getElementById('exploreFeed');
  if (!container) return;
  container.innerHTML = '';
  let filtered = allListings;
  if (filter !== 'all') {
    if (filter === 'vendre' || filter === 'louer') {
      filtered = allListings.filter(l => l.transaction === filter);
    } else {
      filtered = allListings.filter(l => l.type === filter);
    }
  }
  filtered.forEach(listing => {
    container.appendChild(createTikTokCard(listing));
  });
}

function createTikTokCard(listing) {
  const card = document.createElement('div');
  card.className = 'tiktok-card';
  const likesCount = likes[listing.id] || listing.likes;
  const isLiked = likes[`liked_${listing.id}`] || false;
  const isFollowed = follows.has(listing.owner.name);
  card.innerHTML = `
    <div class="tc-bg">
      <img src="${listing.images[0]}" alt="${listing.title}" loading="lazy"/>
    </div>
    <div class="tc-sidebar">
      <button class="tc-side-btn ${isLiked ? 'liked' : ''}" onclick="likeProperty(${listing.id},this)">
        <i class="fas fa-heart"></i>
        <span>${formatCount(likesCount)}</span>
      </button>
      <button class="tc-side-btn" onclick="showPropertyDetail(${listing.id})">
        <i class="fas fa-comment"></i>
        <span>${formatCount(listing.comments)}</span>
      </button>
      <button class="tc-side-btn" onclick="shareProperty(${listing.id})">
        <i class="fas fa-share"></i>
        <span>Partager</span>
      </button>
      <button class="tc-side-btn" onclick="toggleFavoriteBtn(${listing.id},this)">
        <i class="fas fa-bookmark"></i>
        <span>Sauver</span>
      </button>
    </div>
    <div class="tc-content">
      <div class="tc-user">
        <img src="${listing.owner.avatar}" alt="${listing.owner.name}"/>
        <span class="tc-user-name">${listing.owner.name}${listing.verified ? ' ✅' : ''}</span>
        <button class="tc-follow-btn" onclick="followUser('${listing.owner.name}',this)">
          ${isFollowed ? 'Suivi ✓' : 'Suivre'}
        </button>
      </div>
      <div class="tc-title">${listing.title}</div>
      <div class="tc-price">${formatPrice(listing.price, listing.transaction)}</div>
      <div class="tc-desc">${listing.description}</div>
      <div class="tc-tags">
        <span class="tc-tag">${listing.type}</span>
        <span class="tc-tag">${listing.transaction === 'vendre' ? 'À Vendre' : 'À Louer'}</span>
        ${listing.surface ? `<span class="tc-tag">${listing.surface}m²</span>` : ''}
        ${listing.chambres ? `<span class="tc-tag">${listing.chambres} chambres</span>` : ''}
        <span class="tc-tag"><i class="fas fa-map-marker-alt"></i> ${listing.location}</span>
      </div>
      <div class="tc-action-row">
        <button class="tc-btn btn-interested" onclick="contactOwner(${listing.id})" style="background:var(--gold);color:var(--dark);">
          <i class="fas fa-star"></i> Je suis intéressé(e)
        </button>
        <button class="tc-btn btn-whatsapp" onclick="whatsappOwner('${listing.owner.whatsapp}',${listing.id})" style="background:#25D366;color:#fff;">
          <i class="fab fa-whatsapp"></i> WhatsApp
        </button>
      </div>
    </div>
  `;
  return card;
}

// ===== SEARCH =====
function setSearchType(type, btn) {
  searchType = type;
  document.querySelectorAll('.stab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function doHeroSearch() {
  const location = document.getElementById('heroLocation').value;
  const type = document.getElementById('heroType').value;
  document.getElementById('asLocation').value = location;
  document.getElementById('asType').value = type;
  document.getElementById('asTransaction').value = searchType;
  showPage('search');
  doAdvancedSearch();
}

function quickSearch() {
  const query = document.getElementById('navSearchInput').value;
  document.getElementById('asLocation').value = query;
  showPage('search');
  doAdvancedSearch();
}

async function doAdvancedSearch() {
  const location = document.getElementById('asLocation').value.toLowerCase();
  const transaction = document.getElementById('asTransaction').value;
  const type = document.getElementById('asType').value;
  const budgetMin = parseInt(document.getElementById('asBudgetMin').value) || 0;
  const budgetMax = parseInt(document.getElementById('asBudgetMax').value) || Infinity;

  const resultsDiv = document.getElementById('searchResults');
  const aiPanel = document.getElementById('aiSearchPanel');

  resultsDiv.innerHTML = '';
  aiPanel.classList.remove('hidden');

  // Simulate AI search
  await delay(2000);
  aiPanel.classList.add('hidden');

  let results = allListings.filter(l => {
    const matchLoc = !location || l.location.toLowerCase().includes(location) || l.zone.includes(location) || location.split(' ').some(w => l.location.toLowerCase().includes(w));
    const matchTrans = !transaction || l.transaction === transaction;
    const matchType = !type || l.type === type;
    const matchBudget = l.price >= budgetMin && l.price <= budgetMax;
    return matchLoc && matchTrans && matchType && matchBudget;
  });

  if (results.length === 0) {
    // No results - search web + show nearby
    resultsDiv.innerHTML = `
      <div class="no-results-card">
        <div class="nr-icon">🔍</div>
        <h3>Aucun bien trouvé dans cette zone</h3>
        <p>Notre IA n'a pas trouvé de bien correspondant exactement à "${location || 'votre recherche'}".</p>
      </div>
      <div class="proximity-section">
        <h4>📍 Biens disponibles à proximité</h4>
        <div class="feed-grid" id="proximityGrid"></div>
      </div>
    `;
    // Show all listings as proximity
    const proximityGrid = document.getElementById('proximityGrid');
    allListings.slice(0, 4).forEach(l => proximityGrid.appendChild(createPropertyCard(l)));
    // Also trigger AI web search
    await searchOnlineListings(location, type, transaction, resultsDiv);
  } else {
    showToast(`✅ ${results.length} bien(s) trouvé(s)`, 'success');
    results.forEach(l => {
      const card = document.createElement('div');
      card.className = 'search-result-card';
      card.innerHTML = `
        <img class="src-img" src="${l.images[0]}" alt="${l.title}"/>
        <div class="src-body">
          <div class="src-price">${formatPrice(l.price, l.transaction)}</div>
          <div class="src-title">${l.title}</div>
          <div class="src-location"><i class="fas fa-map-marker-alt" style="color:var(--gold)"></i> ${l.location}</div>
          <div class="src-tags">
            <span class="src-tag">${l.type}</span>
            ${l.surface ? `<span class="src-tag">${l.surface}m²</span>` : ''}
            ${l.chambres ? `<span class="src-tag">${l.chambres} ch.</span>` : ''}
            ${l.verified ? '<span class="src-tag" style="color:var(--green)">✅ Vérifié</span>' : ''}
          </div>
        </div>
      `;
      card.addEventListener('click', () => showPropertyDetail(l.id));
      resultsDiv.appendChild(card);
    });
  }
}

async function searchOnlineListings(location, type, transaction, container) {
  // Simulate fetching from Claude AI for external search
  try {
    showLoading('Recherche en ligne par IA…');
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `Tu es un assistant immobilier sénégalais. Un utilisateur recherche: Type=${type||'tout type'}, Transaction=${transaction||'vente ou location'}, Localisation="${location||'Sénégal'}". 
          Génère une réponse JSON avec 2 biens fictifs mais réalistes disponibles à proximité de cette zone au Sénégal. Format: {"biens":[{"titre":"...","prix":...,"localisation":"...","description":"...","surface":...,"type":"..."}]}
          Réponds UNIQUEMENT en JSON valide, sans markdown.`
        }]
      })
    });
    hideLoading();
    if (response.ok) {
      const data = await response.json();
      const text = data.content?.find(b => b.type === 'text')?.text || '';
      try {
        const parsed = JSON.parse(text.replace(/```json|```/g,'').trim());
        if (parsed.biens && container) {
          const aiSection = document.createElement('div');
          aiSection.className = 'proximity-section';
          aiSection.innerHTML = `<h4>🤖 Résultats trouvés en ligne par IA</h4><div class="feed-grid" id="aiResults"></div>`;
          container.appendChild(aiSection);
          const aiGrid = aiSection.querySelector('#aiResults');
          parsed.biens.forEach((bien, idx) => {
            const fakeCard = { ...MOCK_LISTINGS[idx % MOCK_LISTINGS.length], id: 100 + idx, title: bien.titre, price: bien.prix, location: bien.localisation, description: bien.description, surface: bien.surface || 0, type: bien.type || 'maison' };
            aiGrid.appendChild(createPropertyCard(fakeCard));
          });
        }
      } catch(e) { console.log('Parse error:', e); }
    }
  } catch(e) {
    hideLoading();
    console.log('AI search error:', e);
  }
}

// ===== PROPERTY DETAIL =====
function showPropertyDetail(id) {
  const listing = allListings.find(l => l.id === id) || MOCK_LISTINGS.find(l => l.id === id);
  if (!listing) return;
  const likesCount = likes[id] || listing.likes;
  const isLiked = likes[`liked_${id}`] || false;
  const listingComments = comments[id] || [];

  const detail = document.getElementById('propertyDetail');
  detail.innerHTML = `
    <button class="btn-secondary" onclick="history.back();" style="margin-bottom:16px"><i class="fas fa-arrow-left"></i> Retour</button>
    <div class="pd-gallery">
      ${listing.images.map((img,i) => `<img src="${img}" alt="Photo ${i+1}" loading="lazy"/>`).join('')}
    </div>
    <div class="pd-header">
      <div class="pd-price">${formatPrice(listing.price, listing.transaction)}</div>
      <h1 class="pd-title">${listing.title}</h1>
      <div class="pd-location"><i class="fas fa-map-marker-alt" style="color:var(--gold)"></i> ${listing.location}</div>
      <div class="pd-features">
        ${listing.surface ? `<div class="pd-feat"><i class="fas fa-expand-arrows-alt"></i> ${listing.surface} m²</div>` : ''}
        ${listing.chambres ? `<div class="pd-feat"><i class="fas fa-bed"></i> ${listing.chambres} chambres</div>` : ''}
        ${listing.bains ? `<div class="pd-feat"><i class="fas fa-bath"></i> ${listing.bains} salles de bain</div>` : ''}
        ${listing.verified ? `<div class="pd-feat" style="color:var(--green)"><i class="fas fa-check-circle"></i> Vérifié</div>` : ''}
      </div>
    </div>
    <div class="pd-section">
      <h3>Description</h3>
      <p style="line-height:1.8;color:rgba(255,255,255,0.85)">${listing.description}</p>
    </div>
    ${listing.equip?.length ? `
    <div class="pd-section">
      <h3>Équipements</h3>
      <div class="pd-equip-grid">
        ${listing.equip.map(e => `<span class="pd-equip">${getEquipLabel(e)}</span>`).join('')}
      </div>
    </div>` : ''}
    <div class="pd-section">
      <div class="pd-owner-card">
        <div class="pd-owner-info">
          <img src="${listing.owner.avatar}" alt="${listing.owner.name}"/>
          <div>
            <div class="pd-owner-name">${listing.owner.name} ${listing.verified ? '✅' : ''}</div>
            <div class="pd-owner-tag">Propriétaire vérifié</div>
          </div>
          <button class="btn-secondary" style="margin-left:auto;padding:8px 16px;font-size:0.85rem" onclick="followUser('${listing.owner.name}',this)">Suivre</button>
        </div>
        <div class="pd-contact-btns">
          <button class="btn-primary" onclick="contactOwner(${listing.id})">
            <i class="fas fa-star"></i> Je suis intéressé(e)
          </button>
          <button class="btn-secondary" onclick="callOwner('${listing.owner.phone}')">
            <i class="fas fa-phone"></i> Appeler
          </button>
          <button class="btn-secondary" style="border-color:#25D366;color:#25D366" onclick="whatsappOwner('${listing.owner.whatsapp}',${listing.id})">
            <i class="fab fa-whatsapp"></i> WhatsApp
          </button>
        </div>
      </div>
    </div>
    <div class="pd-engagement">
      <button class="pd-eng-btn ${isLiked ? 'liked' : ''}" id="likeBtn_${id}" onclick="likeProperty(${id},this)">
        <i class="fas fa-heart"></i> <span id="likeCount_${id}">${formatCount(likesCount)}</span> J'aime
      </button>
      <button class="pd-eng-btn"><i class="fas fa-comment"></i> ${formatCount(listing.comments)} Commentaires</button>
      <button class="pd-eng-btn" onclick="shareProperty(${id})"><i class="fas fa-share"></i> Partager</button>
      <button class="pd-eng-btn"><i class="fas fa-eye"></i> ${formatCount(listing.views)} Vues</button>
    </div>
    <div class="comments-section">
      <h3 style="font-family:var(--font-display);margin-bottom:16px">Commentaires</h3>
      <div class="comment-input-row">
        <img src="${currentUser ? `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.firstName+' '+currentUser.lastName)}&background=C8973A&color=fff` : 'https://ui-avatars.com/api/?name=User&background=C8973A&color=fff'}" alt="me"/>
        <input type="text" id="commentInput_${id}" placeholder="Ajouter un commentaire…" onkeydown="if(event.key==='Enter')addComment(${id})"/>
        <button onclick="addComment(${id})"><i class="fas fa-paper-plane"></i></button>
      </div>
      <div id="commentsList_${id}">
        <div class="comment-item">
          <img src="https://ui-avatars.com/api/?name=Fatou+Sow&background=E5B96A&color=333" alt=""/>
          <div class="comment-bubble">
            <div class="comment-author">Fatou Sow</div>
            <div class="comment-text">Très beau bien ! Est-il encore disponible ?</div>
            <div class="comment-date">Il y a 2 heures</div>
          </div>
        </div>
        <div class="comment-item">
          <img src="https://ui-avatars.com/api/?name=Ibrahima+Kane&background=2ECC71&color=fff" alt=""/>
          <div class="comment-bubble">
            <div class="comment-author">Ibrahima Kane</div>
            <div class="comment-text">Le titre foncier est inclus dans le prix ?</div>
            <div class="comment-date">Il y a 5 heures</div>
          </div>
        </div>
        ${listingComments.map(c => `
          <div class="comment-item">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(c.author)}&background=C8973A&color=fff" alt=""/>
            <div class="comment-bubble">
              <div class="comment-author">${c.author}</div>
              <div class="comment-text">${c.text}</div>
              <div class="comment-date">À l'instant</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  showPage('property');
}

function addComment(listingId) {
  const input = document.getElementById(`commentInput_${listingId}`);
  const text = input.value.trim();
  if (!text || !currentUser) { showToast('Connectez-vous pour commenter', 'info'); return; }
  if (!comments[listingId]) comments[listingId] = [];
  const author = `${currentUser.firstName} ${currentUser.lastName}`;
  comments[listingId].push({ author, text });
  const list = document.getElementById(`commentsList_${listingId}`);
  const item = document.createElement('div');
  item.className = 'comment-item';
  item.innerHTML = `
    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(author)}&background=C8973A&color=fff" alt=""/>
    <div class="comment-bubble">
      <div class="comment-author">${author}</div>
      <div class="comment-text">${text}</div>
      <div class="comment-date">À l'instant</div>
    </div>
  `;
  list.appendChild(item);
  input.value = '';
  showToast('Commentaire ajouté', 'success');
}

// ===== ENGAGEMENT =====
function likeProperty(id, btn) {
  const isLiked = likes[`liked_${id}`] || false;
  likes[`liked_${id}`] = !isLiked;
  likes[id] = (likes[id] || MOCK_LISTINGS.find(l=>l.id===id)?.likes || 0) + (isLiked ? -1 : 1);
  btn.classList.toggle('liked', !isLiked);
  const countEl = document.getElementById(`likeCount_${id}`);
  if (countEl) countEl.textContent = formatCount(likes[id]);
  showToast(isLiked ? 'J\'aime retiré' : '❤️ J\'aime ajouté', 'info');
}

function toggleFavorite(id, btn) {
  if (favorites.has(id)) { favorites.delete(id); btn.classList.remove('active'); showToast('Retiré des favoris', 'info'); }
  else { favorites.add(id); btn.classList.add('active'); showToast('❤️ Ajouté aux favoris', 'success'); }
}

function toggleFavoriteBtn(id, btn) {
  if (favorites.has(id)) { favorites.delete(id); showToast('Retiré des favoris', 'info'); }
  else { favorites.add(id); showToast('❤️ Sauvegardé', 'success'); }
}

function followUser(name, btn) {
  if (follows.has(name)) {
    follows.delete(name);
    btn.textContent = 'Suivre';
    showToast(`Vous ne suivez plus ${name}`, 'info');
  } else {
    follows.add(name);
    btn.textContent = 'Suivi ✓';
    showToast(`✅ Vous suivez maintenant ${name}`, 'success');
  }
}

function shareProperty(id) {
  const listing = allListings.find(l => l.id === id);
  if (navigator.share && listing) {
    navigator.share({ title: listing.title, text: `Découvrez ce bien sur Teranga Immo: ${listing.title}`, url: window.location.href });
  } else {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Lien copié dans le presse-papiers', 'success');
  }
}

// ===== CONTACT =====
function contactOwner(id) {
  const listing = allListings.find(l => l.id === id) || MOCK_LISTINGS.find(l => l.id === id);
  if (!listing) return;
  // Open messages with property context
  openConversation(listing);
}

function openConversation(listing) {
  const chatPanel = document.getElementById('chatPanel');
  const userName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Utilisateur';
  chatPanel.innerHTML = `
    <div class="property-context-card">
      <img src="${listing.images[0]}" alt="${listing.title}"/>
      <div class="pcc-info">
        <div class="pcc-title">${listing.title}</div>
        <div class="pcc-price">${formatPrice(listing.price, listing.transaction)}</div>
      </div>
    </div>
    <div class="chat-header">
      <img src="${listing.owner.avatar}" alt="${listing.owner.name}"/>
      <div>
        <div style="font-weight:600">${listing.owner.name}</div>
        <div style="font-size:0.8rem;color:var(--green)">● En ligne</div>
      </div>
      <button class="btn-secondary" style="margin-left:auto;padding:8px 14px;font-size:0.8rem" onclick="callOwner('${listing.owner.phone}')">
        <i class="fas fa-phone"></i>
      </button>
    </div>
    <div class="chat-messages" id="chatMessages">
      <div class="chat-msg received">Bonjour ! Je suis le propriétaire du bien "${listing.title}". Comment puis-je vous aider ?</div>
      <div class="chat-msg sent">Bonjour, je suis intéressé(e) par ce bien. Il est encore disponible ?</div>
    </div>
    <div class="chat-input-bar">
      <input type="text" id="chatInput" placeholder="Écrire un message…" onkeydown="if(event.key==='Enter')sendChatMessage()"/>
      <button onclick="sendChatMessage()"><i class="fas fa-paper-plane"></i></button>
    </div>
  `;
  showPage('messages');
}

function sendChatMessage() {
  const input = document.getElementById('chatInput');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  const msgs = document.getElementById('chatMessages');
  if (msgs) {
    const div = document.createElement('div');
    div.className = 'chat-msg sent';
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    input.value = '';
    // Auto reply after delay
    setTimeout(() => {
      const reply = document.createElement('div');
      reply.className = 'chat-msg received';
      reply.textContent = 'Merci pour votre message ! Je vous réponds dans les plus brefs délais.';
      msgs.appendChild(reply);
      msgs.scrollTop = msgs.scrollHeight;
    }, 1500);
  }
}

function callOwner(phone) {
  window.location.href = `tel:${phone}`;
}

function whatsappOwner(whatsapp, listingId) {
  const listing = allListings.find(l => l.id === listingId) || MOCK_LISTINGS.find(l => l.id === listingId);
  const msg = listing ? `Bonjour ! Je suis intéressé(e) par votre bien "${listing.title}" à ${listing.location} sur Teranga Immo. Il est encore disponible ?` : 'Bonjour !';
  const num = whatsapp.replace(/[^0-9+]/g, '');
  window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
}

// ===== PUBLISH =====
let currentStep = 1;

function resetPublish() {
  currentStep = 1;
  uploadedMedia = [];
  for (let i = 1; i <= 4; i++) {
    document.querySelectorAll('.pub-step').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active','done'));
  }
  document.getElementById('pub-step-1').classList.add('active');
  document.getElementById('step1-ind').classList.add('active');
}

function nextStep(step) {
  if (step > currentStep && !validateStep(currentStep)) return;
  document.querySelectorAll('.pub-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`pub-step-${step}`).classList.add('active');
  for (let i = 1; i <= 4; i++) {
    const ind = document.getElementById(`step${i}-ind`);
    if (i < step) ind.classList.add('done'), ind.classList.remove('active');
    else if (i === step) ind.classList.add('active'), ind.classList.remove('done');
    else ind.classList.remove('active','done');
  }
  currentStep = step;
  if (step === 4) buildPreview();
}

function validateStep(step) {
  if (step === 1) {
    if (!document.getElementById('pubTitle').value || !document.getElementById('pubType').value || !document.getElementById('pubTransaction').value || !document.getElementById('pubPrice').value || !document.getElementById('pubLocation').value) {
      showToast('Veuillez remplir tous les champs obligatoires', 'error');
      return false;
    }
  }
  if (step === 3) {
    if (!document.getElementById('pubPhone').value || !document.getElementById('pubWhatsapp').value) {
      showToast('Veuillez insérer vos numéros de contact', 'error');
      return false;
    }
  }
  return true;
}

function buildPreview() {
  const title = document.getElementById('pubTitle').value;
  const price = document.getElementById('pubPrice').value;
  const transaction = document.getElementById('pubTransaction').value;
  const type = document.getElementById('pubType').value;
  const location = document.getElementById('pubLocation').value;
  const desc = document.getElementById('pubDescription').value;
  const preview = document.getElementById('publishPreview');
  preview.innerHTML = `
    <div style="padding:20px">
      <h3 style="font-family:var(--font-display);font-size:1.3rem;margin-bottom:8px">${title}</h3>
      <div style="color:var(--gold);font-size:1.2rem;font-weight:700;margin-bottom:8px">${formatPrice(parseInt(price), transaction)}</div>
      <div style="color:var(--gray);font-size:0.9rem;margin-bottom:12px"><i class="fas fa-map-marker-alt"></i> ${location}</div>
      <div style="font-size:0.88rem;color:rgba(255,255,255,0.8);margin-bottom:16px">${desc}</div>
      <div style="display:flex;gap:8px">
        <span style="background:var(--gold);color:var(--dark);border-radius:50px;padding:4px 12px;font-size:0.8rem;font-weight:700">${transaction === 'vendre' ? 'À Vendre' : 'À Louer'}</span>
        <span style="background:var(--dark4);border-radius:50px;padding:4px 12px;font-size:0.8rem">${type}</span>
      </div>
      ${uploadedMedia.length > 0 ? `<div style="margin-top:16px;font-size:0.85rem;color:var(--green)">📸 ${uploadedMedia.length} média(s) prêt(s)</div>` : '<div style="margin-top:16px;font-size:0.85rem;color:var(--gray)">⚠️ Aucun média ajouté</div>'}
    </div>
  `;
}

function submitPublication() {
  if (!currentUser) { showToast('Connectez-vous pour publier', 'error'); return; }
  showLoading('Publication de votre annonce…');
  setTimeout(() => {
    // Add to local listings
    const newListing = {
      id: Date.now(),
      type: document.getElementById('pubType').value,
      transaction: document.getElementById('pubTransaction').value,
      title: document.getElementById('pubTitle').value,
      price: parseInt(document.getElementById('pubPrice').value),
      surface: parseInt(document.getElementById('pubSurface').value) || 0,
      chambres: parseInt(document.getElementById('pubChambre').value) || 0,
      bains: parseInt(document.getElementById('pubBain').value) || 0,
      location: document.getElementById('pubLocation').value,
      zone: document.getElementById('pubLocation').value.toLowerCase(),
      description: document.getElementById('pubDescription').value,
      images: uploadedMedia.length > 0 ? uploadedMedia : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80'],
      owner: {
        name: `${currentUser.firstName} ${currentUser.lastName}`,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.firstName+' '+currentUser.lastName)}&background=C8973A&color=fff`,
        phone: document.getElementById('pubPhone').value,
        whatsapp: document.getElementById('pubWhatsapp').value
      },
      equip: [], likes: 0, comments: 0, views: 0, verified: false
    };
    allListings.unshift(newListing);
    likes[newListing.id] = 0;
    hideLoading();
    showToast('🎉 Votre bien est maintenant publié !', 'success');
    setTimeout(() => showPage('home'), 1500);
  }, 2000);
}

function handleMediaUpload(event) {
  const files = Array.from(event.target.files);
  const preview = document.getElementById('mediaPreview');
  files.forEach(file => {
    const url = URL.createObjectURL(file);
    uploadedMedia.push(url);
    const thumb = document.createElement('div');
    thumb.className = 'media-thumb';
    if (file.type.startsWith('video/')) {
      thumb.innerHTML = `<video src="${url}" muted></video><button class="remove-media" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>`;
    } else {
      thumb.innerHTML = `<img src="${url}" alt=""/><button class="remove-media" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>`;
    }
    preview.appendChild(thumb);
  });
}

function handleIdUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  const preview = document.getElementById('idPreview');
  preview.classList.remove('hidden');
  preview.innerHTML = `<img src="${url}" alt="Pièce d'identité"/><div style="margin-top:8px;font-size:0.82rem;color:var(--gold)">🤖 IA en cours de vérification…</div>`;
  setTimeout(() => {
    preview.innerHTML += `<div style="margin-top:4px;font-size:0.82rem;color:var(--green)">✅ Pièce d'identité vérifiée avec succès</div>`;
  }, 2000);
}

// ===== PROFILE =====
function renderProfile() {
  if (!currentUser) return;
  document.getElementById('profilePosts').textContent = allListings.filter(l => l.owner?.name === `${currentUser.firstName} ${currentUser.lastName}`).length;
  document.getElementById('profileFollowers').textContent = Math.floor(Math.random() * 50) + 10;
  document.getElementById('profileFollowing').textContent = follows.size;
  renderProfileListings();
}

function renderProfileListings() {
  const grid = document.getElementById('profileListings');
  if (!grid) return;
  grid.innerHTML = '';
  const myListings = allListings.filter(l => l.owner?.name === `${currentUser?.firstName} ${currentUser?.lastName}`);
  const toShow = myListings.length > 0 ? myListings : allListings.slice(0, 3);
  toShow.forEach(l => grid.appendChild(createPropertyCard(l)));
}

function switchProfileTab(tab, btn) {
  document.querySelectorAll('.ptab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const grid = document.getElementById('profileListings');
  grid.innerHTML = '';
  if (tab === 'listings') {
    const myListings = allListings.filter(l => l.owner?.name === `${currentUser?.firstName} ${currentUser?.lastName}`);
    const toShow = myListings.length > 0 ? myListings : allListings.slice(0, 3);
    toShow.forEach(l => grid.appendChild(createPropertyCard(l)));
  } else if (tab === 'liked') {
    const liked = allListings.filter(l => likes[`liked_${l.id}`]);
    if (liked.length === 0) grid.innerHTML = '<p style="color:var(--gray);padding:20px">Vous n\'avez pas encore aimé de publications.</p>';
    else liked.forEach(l => grid.appendChild(createPropertyCard(l)));
  } else if (tab === 'saved') {
    const saved = allListings.filter(l => favorites.has(l.id));
    if (saved.length === 0) grid.innerHTML = '<p style="color:var(--gray);padding:20px">Aucun bien sauvegardé.</p>';
    else saved.forEach(l => grid.appendChild(createPropertyCard(l)));
  }
}

// ===== NOTIFICATIONS =====
function renderNotifications() {
  const list = document.getElementById('notifList');
  if (!list) return;
  list.innerHTML = '';
  MOCK_NOTIFICATIONS.forEach(n => {
    const item = document.createElement('div');
    item.className = `notif-item ${n.unread ? 'unread' : ''}`;
    const typeMap = { like: 'like', comment: 'comment', follow: 'follow', system: 'system' };
    item.innerHTML = `
      <div class="notif-icon ${typeMap[n.type]}">${n.icon}</div>
      <div class="notif-content">
        <div class="notif-text">${n.text}</div>
        <div class="notif-time">${n.time}</div>
      </div>
    `;
    item.addEventListener('click', () => { item.classList.remove('unread'); });
    list.appendChild(item);
  });
}

// ===== CONVERSATIONS =====
function renderConversations() {
  const list = document.getElementById('convList');
  if (!list) return;
  list.innerHTML = '';
  MOCK_CONVERSATIONS.forEach(conv => {
    const item = document.createElement('div');
    item.className = 'conv-item';
    item.innerHTML = `
      <img src="${conv.avatar}" alt="${conv.name}"/>
      <div class="conv-info">
        <div class="conv-name">${conv.name}</div>
        <div class="conv-last">${conv.last}</div>
      </div>
      <div class="conv-time">${conv.time}</div>
    `;
    item.addEventListener('click', () => openConversation(conv.property));
    list.appendChild(item);
  });
}

// ===== FAVORITES =====
function renderFavorites() {
  const list = document.getElementById('favoritesList');
  if (!list) return;
  list.innerHTML = '';
  const favListings = allListings.filter(l => favorites.has(l.id));
  if (favListings.length === 0) {
    list.innerHTML = '<p style="color:var(--gray);text-align:center;padding:40px">Vous n\'avez pas encore de favoris. Explorez des biens et cliquez sur ❤️ pour les sauvegarder !</p>';
  } else {
    favListings.forEach(l => list.appendChild(createPropertyCard(l)));
  }
}

function renderMyListings() {
  const grid = document.getElementById('myListingsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const myListings = allListings.filter(l => l.owner?.name === `${currentUser?.firstName} ${currentUser?.lastName}`);
  if (myListings.length === 0) {
    grid.innerHTML = '<p style="color:var(--gray);text-align:center;padding:40px">Vous n\'avez pas encore de publications. Publiez votre premier bien !</p>';
  } else {
    myListings.forEach(l => grid.appendChild(createPropertyCard(l)));
  }
}

// ===== FILTERS =====
function filterCategory(type) {
  document.getElementById('asType').value = type;
  showPage('search');
  doAdvancedSearch();
}

function filterExplore(filter, btn) {
  document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderExploreFeed(filter);
}

// ===== AI ASSISTANT =====
function toggleAI() {
  const win = document.getElementById('aiChatWindow');
  win.classList.toggle('hidden');
}

async function sendAIMessage() {
  const input = document.getElementById('aiInput');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  const msgs = document.getElementById('aiMessages');
  const userMsg = document.createElement('div');
  userMsg.className = 'ai-msg user';
  userMsg.textContent = text;
  msgs.appendChild(userMsg);
  const thinkingMsg = document.createElement('div');
  thinkingMsg.className = 'ai-msg bot';
  thinkingMsg.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  msgs.appendChild(thinkingMsg);
  msgs.scrollTop = msgs.scrollHeight;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: "Tu es l'assistant IA de Teranga Immo, une plateforme immobilière sénégalaise. Tu réponds en français, de manière concise et utile. Tu aides les utilisateurs à trouver des biens immobiliers au Sénégal, tu donnes des conseils sur l'immobilier sénégalais, les prix du marché, les quartiers, les procédures d'achat/location. Tu es chaleureux et professionnel.",
        messages: [{ role: "user", content: text }]
      })
    });
    const data = await response.json();
    const reply = data.content?.find(b => b.type === 'text')?.text || 'Je suis désolé, je n\'arrive pas à vous répondre pour l\'instant.';
    thinkingMsg.innerHTML = reply;
  } catch(e) {
    thinkingMsg.innerHTML = 'Je suis votre assistant Teranga Immo. Je peux vous aider à trouver des biens, comprendre le marché immobilier sénégalais, ou répondre à vos questions sur nos services !';
  }
  msgs.scrollTop = msgs.scrollHeight;
}

// ===== UI HELPERS =====
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.toggle('hidden');
  overlay.classList.toggle('hidden');
}

function toggleProfileMenu() {
  document.getElementById('profileMenu').classList.toggle('hidden');
}
document.addEventListener('click', (e) => {
  const menu = document.getElementById('profileMenu');
  if (menu && !e.target.closest('.nav-avatar')) menu.classList.add('hidden');
});

function showToast(msg, type = 'info', duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => { toast.className = 'toast hidden'; }, duration);
}

function showLoading(text = 'Chargement…') {
  document.getElementById('loadingOverlay').classList.remove('hidden');
  document.getElementById('loadingText').textContent = text;
}
function showLoadingText(text) {
  document.getElementById('loadingText').textContent = text;
}
function hideLoading() {
  document.getElementById('loadingOverlay').classList.add('hidden');
}

function formatPrice(price, transaction) {
  if (!price) return 'Prix à négocier';
  const formatted = new Intl.NumberFormat('fr-FR').format(price);
  if (transaction === 'louer') return `${formatted} FCFA/mois`;
  return `${formatted} FCFA`;
}

function formatCount(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n/1000).toFixed(1) + 'k';
  return n?.toString() || '0';
}

function getEquipLabel(key) {
  const labels = { piscine:'🏊 Piscine', parking:'🚗 Parking', gardien:'👮 Gardien', groupe:'⚡ Groupe électrogène', climatisation:'❄️ Climatisation', cuisine:'🍳 Cuisine équipée', terrasse:'🌿 Terrasse', titre:'📄 Titre foncier' };
  return labels[key] || key;
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
