// ─────────────────────────────────────────────────────────────────────
// state.js — Global application state
// ─────────────────────────────────────────────────────────────────────

const State = {
  currentUser:       null,   // Firebase user object (or demo object)
  userTokens:        0,
  userPredictions:   [],     // Array of { marketId, question, option, amount, status }
  userCreatedMarkets: [],    // Markets created by this user (pending review)

  // Auth tab
  authMode: 'signup',        // 'signup' | 'login'

  // Vote modal
  activeMarketId:     null,
  selectedVoteOption: null,  // 'a' | 'b'
};

// ── Sample / seed markets shown on load ───────────────────────────────
const SAMPLE_MARKETS = [
  {
    id: 1,
    question:  "Will Nifty 50 exceed 25,000 by June 2026?",
    cat:       "📊 Economy",
    optA:      "Yes",
    optB:      "No",
    pctA:      68,
    tokens:    12400,
    ends:      "Jun 30, 2026",
    status:    "live"
  },
  {
    id: 2,
    question:  "Will India win IPL 2026 (Mumbai Indians)?",
    cat:       "🏏 Sports",
    optA:      "Yes",
    optB:      "No",
    pctA:      44,
    tokens:    28900,
    ends:      "May 25, 2026",
    status:    "live"
  },
  {
    id: 3,
    question:  "Will a Bollywood film gross ₹1000 crore in 2026?",
    cat:       "🎬 Entertainment",
    optA:      "Yes",
    optB:      "No",
    pctA:      55,
    tokens:    8200,
    ends:      "Dec 31, 2026",
    status:    "live"
  },
  {
    id: 4,
    question:  "Will an Indian startup become a unicorn by Q3 2026?",
    cat:       "💻 Technology",
    optA:      "Yes",
    optB:      "No",
    pctA:      72,
    tokens:    5600,
    ends:      "Sep 30, 2026",
    status:    "live"
  },
  {
    id: 5,
    question:  "Will Delhi AQI average under 100 in winter 2026?",
    cat:       "🌿 Climate",
    optA:      "Yes",
    optB:      "No",
    pctA:      18,
    tokens:    3400,
    ends:      "Mar 1, 2027",
    status:    "live"
  }
];

// ── Leaderboard seed data ─────────────────────────────────────────────
const LEADERBOARD_SEED = [
  { rank: 1,  name: "CrowdKing_Arjun",  score: 4820, rankClass: "gold"   },
  { rank: 2,  name: "PredictorPriya",   score: 3940, rankClass: "silver" },
  { rank: 3,  name: "WisdomWave_Dev",   score: 3120, rankClass: "bronze" },
  { rank: 4,  name: "JaipurOracle",     score: 2800, rankClass: ""       },
  { rank: 5,  name: "CrowdSense_Neha",  score: 2450, rankClass: ""       },
];

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
