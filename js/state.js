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
    question: "Will India win the ICC Champions Trophy 2025?",
    cat: "🏏 Sports",
    optA: "Yes",
    optB: "No",
    pctA: 58,
    tokens: 45000,
    ends: "Mar 15, 2025",
    status: "live"
  },
  {
    id: 2,
    question: "Will Nifty 50 cross 28,000 by December 2025?",
    cat: "📊 Economy",
    optA: "Yes",
    optB: "No",
    pctA: 35,
    tokens: 38000,
    ends: "Dec 31, 2025",
    status: "live"
  },
  {
    id: 3,
    question: "Will a Bollywood movie cross 1000 crores in 2025?",
    cat: "🎬 Entertainment",
    optA: "Yes",
    optB: "No",
    pctA: 22,
    tokens: 32000,
    ends: "Dec 31, 2025",
    status: "live"
  },
  {
    id: 4,
    question: "Will Bitcoin reach 150,000 USD in 2025?",
    cat: "₿ Crypto",
    optA: "Yes",
    optB: "No",
    pctA: 18,
    tokens: 52000,
    ends: "Dec 31, 2025",
    status: "live"
  },
  {
    id: 5,
    question: "Will CSK win IPL 2026?",
    cat: "🏏 Sports",
    optA: "Yes",
    optB: "No",
    pctA: 25,
    tokens: 28000,
    ends: "May 30, 2026",
    status: "live"
  },
  {
    id: 6,
    question: "Will an Indian startup become a unicorn in 2025?",
    cat: "💻 Technology",
    optA: "Yes",
    optB: "No",
    pctA: 45,
    tokens: 24000,
    ends: "Dec 31, 2025",
    status: "live"
  },
  {
    id: 7,
    question: "Will Delhi AQI average below 150 in winter 2025?",
    cat: "🌿 Climate",
    optA: "Yes",
    optB: "No",
    pctA: 12,
    tokens: 18000,
    ends: "Feb 28, 2025",
    status: "live"
  },
  {
    id: 8,
    question: "Will Messi win the Ballon d'Or 2025?",
    cat: "🏏 Sports",
    optA: "Yes",
    optB: "No",
    pctA: 30,
    tokens: 35000,
    ends: "Oct 31, 2025",
    status: "live"
  },
  {
    id: 9,
    question: "Will Ethereum flip Bitcoin in market cap by 2026?",
    cat: "₿ Crypto",
    optA: "Yes",
    optB: "No",
    pctA: 10,
    tokens: 42000,
    ends: "Dec 31, 2026",
    status: "live"
  },
  {
    id: 10,
    question: "Will AI replace 10 million jobs globally by 2026?",
    cat: "💻 Technology",
    optA: "Yes",
    optB: "No",
    pctA: 52,
    tokens: 31000,
    ends: "Dec 31, 2026",
    status: "live"
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
