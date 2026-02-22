// ─────────────────────────────────────────────────────────────────────
// auth.js — Sign up, login, logout, Firebase persistence
// ─────────────────────────────────────────────────────────────────────

// ── Open / close auth modal ───────────────────────────────────────────
function openAuth() {
  document.getElementById('auth-modal').classList.add('active');
  document.getElementById('auth-error').style.display = 'none';
  document.getElementById('auth-form-wrap').classList.remove('hidden');
  document.getElementById('auth-success').classList.add('hidden');
}

function closeAuth() {
  document.getElementById('auth-modal').classList.remove('active');
}

// ── Switch between Sign Up / Log In tabs ─────────────────────────────
function switchTab(mode) {
  State.authMode = mode;

  document.getElementById('tab-signup').classList.toggle('active', mode === 'signup');
  document.getElementById('tab-login').classList.toggle('active',  mode === 'login');

  const isSignup = mode === 'signup';
  document.getElementById('signup-fields').style.display    = isSignup ? '' : 'none';
  document.getElementById('age-check-wrap').style.display   = isSignup ? '' : 'none';
  document.getElementById('auth-disclaimer').style.display  = isSignup ? '' : 'none';
  document.getElementById('auth-error').style.display       = 'none';

  document.getElementById('auth-submit-btn').textContent =
    isSignup ? 'Create Account & Get 1000 Tokens' : 'Log In';
  document.getElementById('auth-title').textContent =
    isSignup ? 'Create Account' : 'Welcome Back';
  document.getElementById('auth-subtitle').textContent =
    isSignup ? 'Join thousands predicting the future.' : 'Good to have you back.';
}

// ── Main auth handler (called by button) ─────────────────────────────
async function handleAuth() {
  const email    = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const btn      = document.getElementById('auth-submit-btn');

  // Basic validation
  if (!email || !password) { showAuthError('Please fill in all fields.'); return; }
  if (password.length < 6) { showAuthError('Password must be at least 6 characters.'); return; }

  if (State.authMode === 'signup') {
    const name     = document.getElementById('signup-name').value.trim();
    const dob      = document.getElementById('signup-dob').value;
    const ageCheck = document.getElementById('age-confirm').checked;

    if (!name) { showAuthError('Please enter a display name.'); return; }
    if (!dob)  { showAuthError('Please enter your date of birth.'); return; }

    const dobDate = new Date(dob);
    const age     = Math.floor((Date.now() - dobDate) / (365.25 * 24 * 3600 * 1000));
    if (age < 18) {
      showAuthError('You must be 18 or older to use CrowdVerse.');
      return;
    }
    if (!ageCheck) {
      showAuthError('Please confirm you are 18 or older.');
      return;
    }
  }

  // Show spinner
  btn.disabled    = true;
  btn.innerHTML   = '<span class="spinner"></span>';

  // ── Demo mode (Firebase not configured) ──────────────────────────
  if (demoMode) {
    await new Promise(r => setTimeout(r, 900)); // simulate network delay

    const name = State.authMode === 'signup'
      ? document.getElementById('signup-name').value.trim()
      : email.split('@')[0];

    State.currentUser = {
      uid:         'demo_' + Date.now(),
      email:       email,
      displayName: name
    };

    if (State.authMode === 'signup') State.userTokens = 1000;

    onAuthSuccess(State.authMode === 'signup');
    btn.disabled  = false;
    btn.textContent = State.authMode === 'signup'
      ? 'Create Account & Get 1000 Tokens'
      : 'Log In';
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
    showAuthError(msg);
  } finally {
    btn.disabled  = false;
    btn.textContent = State.authMode === 'signup'
      ? 'Create Account & Get 1000 Tokens'
      : 'Log In';
  }
}

// ── Called after successful auth ─────────────────────────────────────
function onAuthSuccess(isNew) {
  document.getElementById('auth-form-wrap').classList.add('hidden');
  if (isNew) {
    document.getElementById('auth-success').classList.remove('hidden');
  } else {
    closeAuth();
    showToast('Welcome back! 👋', 'green');
  }
  updateNavForAuth();
  updateTokenDisplay();
}

// ── Logout ────────────────────────────────────────────────────────────
async function handleLogout() {
  if (!demoMode && auth) {
    try { await auth.signOut(); } catch(e) { /* ignore */ }
  }
  State.currentUser     = null;
  State.userTokens      = 0;
  State.userPredictions = [];
  updateNavForAuth();
  showToast('Logged out. See you soon!', 'green');
  showPage('home');
}

// ── Firestore: save user data ─────────────────────────────────────────
async function saveUserData() {
  if (demoMode || !db || !State.currentUser) return;
  try {
    await db.collection('users').doc(State.currentUser.uid).set({
      tokens:        State.userTokens,
      predictions:   State.userPredictions,
      displayName:   State.currentUser.displayName || State.currentUser.email,
      email:         State.currentUser.email,
      updatedAt:     firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (e) {
    console.warn('Firestore save failed:', e);
  }
}

// ── Firestore: load user data ─────────────────────────────────────────
async function loadUserData() {
  if (demoMode || !db || !State.currentUser) return;
  try {
    const snap = await db.collection('users').doc(State.currentUser.uid).get();
    if (snap.exists) {
      const data = snap.data();
      State.userTokens    = data.tokens      || 1000;
      State.userPredictions = data.predictions || [];
    } else {
      State.userTokens = 1000;
      await saveUserData(); // create record for new user
    }
  } catch (e) {
    console.warn('Firestore load failed:', e);
  }
}

// ── Show error inside the modal ───────────────────────────────────────
function showAuthError(msg) {
  const el        = document.getElementById('auth-error');
  el.textContent  = msg;
  el.style.display = '';
}

// ── Firebase onAuthStateChanged (auto-restore session) ───────────────
if (!demoMode && typeof auth !== 'undefined') {
  auth.onAuthStateChanged(async user => {
    if (user) {
      State.currentUser = user;
      await loadUserData();
      updateNavForAuth();
      updateTokenDisplay();
    }
  });
}
