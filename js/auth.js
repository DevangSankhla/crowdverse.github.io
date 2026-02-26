// ─────────────────────────────────────────────────────────────────────
// auth.js — Sign up, login, logout, Firebase persistence
// ─────────────────────────────────────────────────────────────────────

function openAuth() {
  document.getElementById('auth-modal').classList.add('open');
  document.getElementById('auth-error').style.display = 'none';
  document.getElementById('auth-form-wrap').classList.remove('hidden');
  document.getElementById('auth-success').classList.add('hidden');
}

function closeAuth() {
  document.getElementById('auth-modal').classList.remove('open');
}

function switchTab(mode) {
  State.authMode = mode;
  document.getElementById('tab-signup').classList.toggle('active', mode === 'signup');
  document.getElementById('tab-login').classList.toggle('active',  mode === 'login');

  const isSignup = mode === 'signup';
  document.getElementById('signup-fields').style.display   = isSignup ? '' : 'none';
  document.getElementById('age-check-wrap').style.display  = isSignup ? '' : 'none';
  document.getElementById('auth-disclaimer').style.display = isSignup ? '' : 'none';
  document.getElementById('auth-error').style.display      = 'none';

  document.getElementById('auth-submit-btn').textContent =
    isSignup ? 'Create Account & Get 1000 Tokens' : 'Log In';
  document.getElementById('auth-title').textContent    = isSignup ? 'Create Account' : 'Welcome Back';
  document.getElementById('auth-subtitle').textContent = isSignup ? 'Join thousands predicting the future.' : 'Good to have you back.';
}

async function handleAuth() {
  const email    = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const btn      = document.getElementById('auth-submit-btn');

  if (!email || !password)  { showAuthError('Please fill in all fields.'); return; }
  if (password.length < 6) { showAuthError('Password must be at least 6 characters.'); return; }

  if (State.authMode === 'signup') {
    const name     = document.getElementById('signup-name').value.trim();
    const dob      = document.getElementById('signup-dob').value;
    const ageCheck = document.getElementById('age-confirm').checked;

    if (!name)     { showAuthError('Please enter a display name.'); return; }
    if (!dob)      { showAuthError('Please enter your date of birth.'); return; }

    const age = Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 3600 * 1000));
    if (age < 18) { showAuthError('You must be 18 or older to use CrowdVerse.'); return; }
    if (!ageCheck) { showAuthError('Please confirm you are 18 or older.'); return; }
  }

  btn.disabled  = true;
  btn.innerHTML = '<span class="spinner"></span>';

  // ── Demo mode ─────────────────────────────────────────────────────
  if (demoMode) {
    await new Promise(r => setTimeout(r, 800));
    const name = State.authMode === 'signup'
      ? document.getElementById('signup-name').value.trim()
      : email.split('@')[0];
    State.currentUser = { uid: 'demo_' + Date.now(), email, displayName: name };
    if (State.authMode === 'signup') State.userTokens = 1000;

    onAuthSuccess(State.authMode === 'signup');
    btn.disabled    = false;
    btn.textContent = State.authMode === 'signup' ? 'Create Account & Get 1000 Tokens' : 'Log In';
    return;
  }

  // ── Real Firebase auth ────────────────────────────────────────────
  try {
    if (State.authMode === 'signup') {
      const result = await auth.createUserWithEmailAndPassword(email, password);
      const name   = document.getElementById('signup-name').value.trim();
      await result.user.updateProfile({ displayName: name });
      State.currentUser = result.user;
      State.userTokens  = 1000;
      await saveUserData();
      onAuthSuccess(true);
    } else {
      const result = await auth.signInWithEmailAndPassword(email, password);
      State.currentUser = result.user;
      await loadUserData();
      onAuthSuccess(false);
    }
  } catch (e) {
    let msg = 'Something went wrong. Please try again.';
    if (e.code === 'auth/email-already-in-use') msg = 'This email is already registered. Try logging in.';
    if (e.code === 'auth/user-not-found')        msg = 'No account found with this email.';
    if (e.code === 'auth/wrong-password')         msg = 'Incorrect password.';
    if (e.code === 'auth/invalid-email')          msg = 'Invalid email address.';
    if (e.code === 'auth/too-many-requests')      msg = 'Too many attempts. Please try again later.';
    if (e.code === 'auth/invalid-credential')     msg = 'Incorrect email or password.';
    showAuthError(msg);
  } finally {
    btn.disabled    = false;
    btn.textContent = State.authMode === 'signup' ? 'Create Account & Get 1000 Tokens' : 'Log In';
  }
}

function onAuthSuccess(isNew) {
  document.getElementById('auth-form-wrap').classList.add('hidden');
  if (isNew) {
    document.getElementById('auth-success').classList.remove('hidden');
    // Auto-close after 3 seconds
    setTimeout(() => {
      closeAuth();
      // Reset form for next time
      setTimeout(() => {
        document.getElementById('auth-success').classList.add('hidden');
        document.getElementById('auth-form-wrap').classList.remove('hidden');
      }, 300);
    }, 3000);
  } else {
    closeAuth();
    showToast('Welcome back! 👋', 'green');
  }
  
  // Update all UI state
  updateNavForAuth();
  updateTokenDisplay();
  updateHeroCta();
  
  // Refresh admin link visibility immediately
  const adminLink = document.getElementById('admin-nav-link');
  if (adminLink && typeof isAdmin === 'function') {
    adminLink.style.display = (isAdmin()) ? '' : 'none';
  }

  if (typeof checkUserNotifications === 'function') checkUserNotifications();
}

async function handleLogout() {
  if (!demoMode && auth) {
    try { await auth.signOut(); } catch (_) {}
  }
  
  // Clean up Firestore listeners
  if (typeof _marketsUnsubscribe === 'function') {
    _marketsUnsubscribe();
    _marketsUnsubscribe = null;
  }
  if (typeof _marketVotesUnsubscribe === 'object') {
    Object.values(_marketVotesUnsubscribe).forEach(unsub => {
      if (typeof unsub === 'function') unsub();
    });
    _marketVotesUnsubscribe = {};
  }
  
  State.currentUser     = null;
  State.userTokens      = 0;
  State.userPredictions = [];
  State.userCreatedMarkets = [];
  State.firestoreMarkets = [];
  updateNavForAuth();
  updateHeroCta(); // ← Restore "Get 1000 tokens" CTA
  showToast('Logged out. See you soon!', 'green');
  showPage('home');
}

async function saveUserData() {
  if (demoMode || !db || !State.currentUser) return;
  try {
    await db.collection('users').doc(State.currentUser.uid).set({
      tokens:      State.userTokens,
      predictions: State.userPredictions,
      displayName: State.currentUser.displayName || State.currentUser.email,
      email:       State.currentUser.email,
      updatedAt:   firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (e) { console.warn('Firestore save failed:', e); }
}

async function loadUserData() {
  if (demoMode || !db || !State.currentUser) return;
  try {
    const snap = await db.collection('users').doc(State.currentUser.uid).get();
    if (snap.exists) {
      const data = snap.data();
      State.userTokens      = typeof data.tokens === 'number' ? data.tokens : 1000;
      State.userPredictions = data.predictions || [];
    } else {
      State.userTokens = 1000;  // New user gets 1000 tokens
      await saveUserData();
    }
  } catch (e) { console.warn('Firestore load failed:', e); }
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent   = msg;
  el.style.display = '';
}

// ── Weekly bonus check ────────────────────────────────────────────────
async function checkWeeklyBonus() {
  if (!State.currentUser || demoMode || !db) return;
  
  try {
    const userRef = db.collection('users').doc(State.currentUser.uid);
    const snap = await userRef.get();
    if (!snap.exists) return;
    
    const data = snap.data();
    const lastBonus = data.lastWeeklyBonus?.toDate?.() || new Date(0);
    const now = new Date();
    
    // Check if it's been at least 7 days
    const daysSinceBonus = (now - lastBonus) / (1000 * 60 * 60 * 24);
    
    if (daysSinceBonus >= 7) {
      // Award 200 tokens
      await userRef.update({
        tokens: firebase.firestore.FieldValue.increment(200),
        lastWeeklyBonus: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      State.userTokens += 200;
      updateTokenDisplay();
      showToast('🎁 Weekly bonus: +200 tokens!', 'green');
    }
  } catch (e) {
    console.warn('Weekly bonus check failed:', e);
  }
}

// ── Restore session on page load ──────────────────────────────────────
if (!demoMode && typeof auth !== 'undefined') {
  auth.onAuthStateChanged(async user => {
    if (user) {
      console.log('Auth state: User logged in', user.email);
      State.currentUser = user;
      await loadUserData();
      updateNavForAuth();
      updateTokenDisplay();
      updateHeroCta();
      
      // Update admin link visibility
      const adminLink = document.getElementById('admin-nav-link');
      if (adminLink && typeof isAdmin === 'function') {
        adminLink.style.display = (isAdmin()) ? '' : 'none';
        if (isAdmin()) {
          console.log('Admin user detected:', user.email);
        }
      }
      
      if (typeof checkUserNotifications === 'function') checkUserNotifications();
      if (typeof checkWeeklyBonus       === 'function') checkWeeklyBonus();
      // Start markets listener immediately on auth so markets are ready
      if (typeof startMarketsListener   === 'function') startMarketsListener();
    } else {
      console.log('Auth state: User logged out');
      State.currentUser = null;
      updateNavForAuth();
      
      // Hide admin link on logout
      const adminLink = document.getElementById('admin-nav-link');
      if (adminLink) adminLink.style.display = 'none';
    }
  });
}
