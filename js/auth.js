// ─────────────────────────────────────────────────────────────────────
// auth.js — Sign up, login, logout, Firebase persistence
// ─────────────────────────────────────────────────────────────────────

function openAuth() {
  document.getElementById('auth-modal').classList.add('open');
  document.getElementById('auth-error').style.display = 'none';
  document.getElementById('auth-form-wrap').classList.remove('hidden');
  document.getElementById('auth-success').classList.add('hidden');
  
  // Reset forgot password state
  document.getElementById('forgot-password-wrap').classList.add('hidden');
  document.getElementById('forgot-success').style.display = 'none';
  document.getElementById('forgot-error').style.display = 'none';
  
  // Show/hide forgot password link based on current mode
  const forgotPasswordLink = document.getElementById('forgot-password-link');
  if (forgotPasswordLink) {
    forgotPasswordLink.style.display = State.authMode === 'login' ? '' : 'none';
  }
}

function closeAuth() {
  document.getElementById('auth-modal').classList.remove('open');
  
  // Reset forgot password state after a delay (so it's not visible when closing)
  setTimeout(() => {
    document.getElementById('forgot-password-wrap').classList.add('hidden');
    document.getElementById('forgot-success').style.display = 'none';
    document.getElementById('forgot-error').style.display = 'none';
    document.getElementById('forgot-email').value = '';
    document.getElementById('forgot-submit-btn').disabled = false;
    document.getElementById('forgot-submit-btn').textContent = 'Send Reset Link →';
    document.getElementById('auth-form-wrap').classList.remove('hidden');
  }, 300);
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
  
  // Show/hide forgot password link based on mode
  const forgotPasswordLink = document.getElementById('forgot-password-link');
  if (forgotPasswordLink) {
    forgotPasswordLink.style.display = isSignup ? 'none' : '';
  }

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
    // Show safety popup for new users
    setTimeout(() => {
      showSafetyPopup('signup');
    }, 500);
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
  if (typeof _leaderboardUnsubscribe === 'function') {
    _leaderboardUnsubscribe();
    _leaderboardUnsubscribe = null;
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
      State.userTokens      = data.tokens      || 1000;
      State.userPredictions = data.predictions || [];
    } else {
      State.userTokens = 1000;
      await saveUserData();
    }
  } catch (e) { console.warn('Firestore load failed:', e); }
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent   = msg;
  el.style.display = '';
}

// ── Forgot Password Functions ─────────────────────────────────────────

function showForgotPassword() {
  document.getElementById('auth-form-wrap').classList.add('hidden');
  document.getElementById('forgot-password-wrap').classList.remove('hidden');
  document.getElementById('auth-error').style.display = 'none';
  
  // Pre-fill email if already entered in auth form
  const authEmail = document.getElementById('auth-email').value;
  if (authEmail) {
    document.getElementById('forgot-email').value = authEmail;
  }
  
  // Focus on email field
  setTimeout(() => {
    document.getElementById('forgot-email').focus();
  }, 100);
}

function backToAuth() {
  document.getElementById('forgot-password-wrap').classList.add('hidden');
  document.getElementById('forgot-success').style.display = 'none';
  document.getElementById('forgot-error').style.display = 'none';
  document.getElementById('auth-form-wrap').classList.remove('hidden');
}

async function handleForgotPassword() {
  const email = document.getElementById('forgot-email').value.trim();
  const btn = document.getElementById('forgot-submit-btn');
  const errorEl = document.getElementById('forgot-error');
  const successEl = document.getElementById('forgot-success');
  
  if (!email) {
    errorEl.textContent = 'Please enter your email address.';
    errorEl.style.display = '';
    return;
  }
  
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Sending...';
  errorEl.style.display = 'none';
  
  // Demo mode - just show success
  if (demoMode) {
    await new Promise(r => setTimeout(r, 1000));
    successEl.style.display = '';
    btn.disabled = false;
    btn.textContent = 'Email Sent!';
    return;
  }
  
  try {
    // Configure action code settings with the current URL
    const actionCodeSettings = {
      url: window.location.origin + window.location.pathname,
      handleCodeInApp: false
    };
    
    await auth.sendPasswordResetEmail(email, actionCodeSettings);
    successEl.style.display = '';
    btn.textContent = 'Email Sent!';
    
    // Also show toast
    showToast('Password reset email sent! Check your inbox 📧', 'green');
  } catch (e) {
    console.error('Password reset error:', e);
    let msg = 'Failed to send reset email. Please try again.';
    if (e.code === 'auth/user-not-found') {
      // For security, don't reveal if email exists or not
      // But show success anyway to prevent email enumeration attacks
      successEl.style.display = '';
      btn.textContent = 'Email Sent!';
      showToast('If an account exists, a reset email was sent 📧', 'green');
      btn.disabled = false;
      return;
    }
    if (e.code === 'auth/invalid-email') msg = 'Please enter a valid email address.';
    if (e.code === 'auth/too-many-requests') msg = 'Too many attempts. Please try again later.';
    if (e.code === 'auth/network-request-failed') msg = 'Network error. Please check your connection.';
    
    errorEl.textContent = msg;
    errorEl.style.display = '';
    btn.disabled = false;
    btn.textContent = 'Send Reset Link →';
  }
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
      if (typeof renderLeaderboard === 'function') renderLeaderboard();
      if (typeof updateProfileRank === 'function') updateProfileRank();
      
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
      if (typeof startLeaderboardListener === 'function') startLeaderboardListener();
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
