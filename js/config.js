// ─────────────────────────────────────────────────────────────────────
// config.js — Firebase configuration
//
// HOW TO SET UP FIREBASE (step by step):
// 1. Go to https://firebase.google.com and sign in with Google
// 2. Click "Add Project" → give it a name (e.g. "crowdverse")
// 3. Once created, click the </> (Web) icon to register a web app
// 4. Copy the firebaseConfig object Firebase shows you
// 5. Paste your values below, replacing each "YOUR_..." placeholder
// 6. In Firebase console → Authentication → Sign-in method → Enable "Email/Password"
// 7. In Firebase console → Firestore Database → Create database (start in test mode)
// That's it! Auth and user data will work automatically.
// ─────────────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

// ── Init Firebase ──────────────────────────────────────────────────────
let db, auth;

// demoMode = true means Firebase is not yet configured — app still works!
const demoMode = (firebaseConfig.apiKey === "YOUR_API_KEY");

try {
  firebase.initializeApp(firebaseConfig);
  db   = firebase.firestore();
  auth = firebase.auth();
  if (!demoMode) {
    console.log("✅ Firebase connected");
  } else {
    console.warn("⚠️  Firebase not configured — running in Demo Mode. See config.js.");
  }
} catch (e) {
  console.error("Firebase init error:", e);
}
