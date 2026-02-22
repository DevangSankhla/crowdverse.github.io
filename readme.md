# CrowdVerse — India's First Prediction Market
(Full adherence to Indian Laws, no betting and gambling)

---

## 🎨 Admin Panel

A hidden admin panel is available at `/admin.html` for managing the platform.

### 🔐 Admin Access

**URL:** `https://crowdverse.in/admin.html`

**Login Credentials:**
- **Email:** `founder@crowdverse.in`
- **Password:** `Admin@1234`

> ⚠️ **Security Note:** The admin panel is protected by both the hardcoded credentials above and session-based authentication. The session expires after 24 hours.

### 📊 Admin Panel Features

#### 1. **Overview Dashboard**
- Total registered users
- Total tokens in circulation
- Live markets count
- Pending markets awaiting review (with badge notification)
- Recent activity feed

#### 2. **Tokens in Flow**
- Total tokens created (signup + weekly bonuses)
- Tokens currently in user wallets
- Tokens locked in active markets
- Tokens refunded (from rejected markets)
- Recent token transactions history

#### 3. **User Accounts**
- Complete list of all registered users
- Search by email or display name
- View user details: tokens, predictions, join date
- User statistics at a glance

#### 4. **Markets Review** ⭐
The most important feature for moderating user-created markets:

**Pending Markets:**
- View all markets awaiting approval
- See market details: question, options, category, creator
- **Approve:** Market goes live on the Markets page
- **Reject:** Market is rejected with an apology message

**Rejection Process:**
1. Click "Reject" on a pending market
2. Select a rejection reason:
   - Inappropriate content
   - Unclear/ambiguous question
   - Outcome cannot be verified
   - Duplicate of existing market
   - Spam or low-quality
   - Other (custom reason)
3. The creator automatically receives:
   - **100 tokens refunded** to their account
   - An apology notification explaining why

**Filter Options:**
- ⏳ Pending (awaiting review)
- ✅ Approved (live on platform)
- ❌ Rejected (refunded creator)
- 📋 All Markets

### 🔧 Firebase Setup (Recommended for Production)

To enable full admin functionality with real-time data, set up the following Firebase collections:

#### Firestore Database Structure:

```
users/{userId}
  ├── tokens: number
  ├── displayName: string
  ├── email: string
  ├── predictions: array
  ├── createdAt: timestamp
  └── updatedAt: timestamp

markets/{marketId}
  ├── question: string
  ├── description: string
  ├── cat: string
  ├── category: string
  ├── optA: string
  ├── optB: string
  ├── pctA: number
  ├── tokens: number
  ├── ends: string
  ├── endDate: string
  ├── status: "pending" | "live" | "rejected"
  ├── createdBy: string (userId)
  ├── createdByName: string
  ├── createdByEmail: string
  ├── createdAt: timestamp
  ├── approvedAt: timestamp (if approved)
  ├── approvedBy: string (if approved)
  ├── rejectedAt: timestamp (if rejected)
  ├── rejectedBy: string (if rejected)
  └── rejectionReason: string (if rejected)
```

#### Firebase Security Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Markets are readable by all, but only admins can update status
    match /markets/{marketId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.token.email == 'founder@crowdverse.in';
    }
  }
}
```

### 📝 Admin User Setup

To ensure the admin email is recognized by Firebase:

1. Go to Firebase Console → Authentication
2. Click "Add user"
3. Enter:
   - Email: `founder@crowdverse.in`
   - Password: `Admin@1234`
4. Click "Add user"

Alternatively, you can sign up with this email on the main site first, then use the same credentials to log into the admin panel.

---

## 🚀 Local Development

Simply open `index.html` in a browser or serve with any static server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (npx)
npx serve .

# Using PHP
php -S localhost:8000
```

Then visit:
- Main site: `http://localhost:8000`
- Admin panel: `http://localhost:8000/admin.html`

---

## 🛠️ Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Backend/Database:** Firebase (Firestore + Authentication)
- **Hosting:** GitHub Pages / Firebase Hosting

---

## ⚖️ Legal Compliance

CrowdVerse operates exclusively with virtual game tokens — no real money is ever deposited, wagered, or withdrawn. We comply fully with Indian law by offering a skill-based opinion and prediction platform. This is **NOT betting or gambling.**

---

© 2026 CrowdVerse. All Rights Reserved.
