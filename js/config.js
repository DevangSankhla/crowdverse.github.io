const firebaseConfig = {
  apiKey:            "AIzaSyBYvs8igzksZpwYmelVcF-puObUUwY-SCc",
  authDomain:        "crowdverse-dev1.firebaseapp.com",
  projectId:         "crowdverse-dev1",
  storageBucket:     "crowdverse-dev1.firebasestorage.app",
  messagingSenderId: "34458761872",
  appId:             "1:34458761872:web:2cf86244229023dbb3b615"
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
