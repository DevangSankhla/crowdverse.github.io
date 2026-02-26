// ─────────────────────────────────────────────────────────────────────
// state.js — Global application state
// ─────────────────────────────────────────────────────────────────────

const State = {
  currentUser:       null,   // Firebase user object (or demo object)
  userTokens:        0,
  userPredictions:   [],     // Array of { marketId, question, option, amount, status }
  userCreatedMarkets: [],    // Markets created by this user (pending review, in-memory)

  // Firestore-fetched live markets (approved by admin)
  firestoreMarkets:  [],

  // Auth tab
  authMode: 'signup',        // 'signup' | 'login'

  // Vote modal
  activeMarketId:     null,
  selectedVoteOption: null,  // 'a' | 'b'
  
  // Gamification - Streaks & Badges
  userStreak:        { current: 0, best: 0 },
  userBadges:        {},     // { badgeId: unlockedAt }
  userChallenges:    {},     // { challengeId: { current, completed, completedAt } }
  userShares:        0,
  lastPredictionDate: null,
};

// ── No sample markets - all data comes from Firestore ─────────────────
const SAMPLE_MARKETS = [];

// ── No leaderboard seed - will be populated from real user data ────────
const LEADERBOARD_SEED = [];

// ── Reward partners (aliases only) ───────────────────────────────────
const REWARDS = [
  { emoji: "🍕", name: "Xomato",     desc: "Food delivery discounts up to 30% off.",       tokens: "500 tokens = 20% off"   },
  { emoji: "🛵", name: "Twiggy",     desc: "Quick commerce — groceries in 10 min.",         tokens: "400 tokens = ₹100 off"  },
  { emoji: "🌀", name: "BlueOrange", desc: "OTT streaming subscription discounts.",          tokens: "800 tokens = 1 month"   },
  { emoji: "🛍️", name: "Flitkart",   desc: "E-commerce vouchers for electronics & fashion.", tokens: "1000 tokens = ₹250"    },
  { emoji: "☕", name: "CafePerk",   desc: "Coffee chain offers and free beverages.",        tokens: "300 tokens = 1 coffee"  },
  { emoji: "✈️", name: "SkyHop",     desc: "Travel booking discounts and lounge passes.",    tokens: "2000 tokens = ₹500 off" },
  { emoji: "🎮", name: "PlayNation", desc: "Gaming credits and in-app purchase vouchers.",   tokens: "600 tokens = ₹150"      },
  { emoji: "💊", name: "MedSwift",   desc: "Online pharmacy and health supplement discounts.", tokens: "350 tokens = 15% off" },
];
