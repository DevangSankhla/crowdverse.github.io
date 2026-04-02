// ─────────────────────────────────────────────────────────────────────
// search-suggestions.js — Search suggestions and recent searches
// ─────────────────────────────────────────────────────────────────────

const SearchSuggestions = {
  recentSearches: [],
  maxRecent: 5,
  STORAGE_KEY: 'crowdverse-search-history',

  init() {
    this.loadRecent();
    this.injectStyles();
    this.setupListeners();
  },

  loadRecent() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.recentSearches = JSON.parse(saved);
      }
    } catch {}
  },

  saveRecent() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.recentSearches));
    } catch {}
  },

  addSearch(query) {
    if (!query.trim()) return;
    
    // Remove if exists
    this.recentSearches = this.recentSearches.filter(s => s !== query);
    // Add to front
    this.recentSearches.unshift(query);
    // Trim
    if (this.recentSearches.length > this.maxRecent) {
      this.recentSearches.pop();
    }
    
    this.saveRecent();
  },

  getSuggestions(query) {
    if (!query) return this.recentSearches;
    
    // Get from market titles
    const suggestions = new Set();
    
    State.firestoreMarkets.forEach(m => {
      if (m.question.toLowerCase().includes(query.toLowerCase())) {
        // Extract matching phrase
        const idx = m.question.toLowerCase().indexOf(query.toLowerCase());
        const start = Math.max(0, idx - 10);
        const end = Math.min(m.question.length, idx + query.length + 20);
        const snippet = m.question.substring(start, end);
        suggestions.add(snippet.trim());
      }
    });
    
    // Add recent searches that match
    this.recentSearches.forEach(s => {
      if (s.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(s);
      }
    });
    
    return [...suggestions].slice(0, 5);
  },

  injectStyles() {
    if (document.getElementById('search-suggestions-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'search-suggestions-styles';
    style.textContent = `
      .search-suggestions {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--off-black);
        border: 1px solid var(--border);
        border-top: none;
        border-radius: 0 0 var(--radius-sm) var(--radius-sm);
        z-index: 100;
        max-height: 200px;
        overflow-y: auto;
      }
      
      .search-suggestion-item {
        padding: 0.75rem 1rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        color: var(--white);
      }
      
      .search-suggestion-item:hover {
        background: var(--dark);
      }
      
      .search-suggestion-item.recent::before {
        content: '🕐';
        font-size: 0.8rem;
      }
      
      .search-suggestion-highlight {
        color: var(--green);
        font-weight: 600;
      }
      
      .search-clear-recent {
        padding: 0.5rem 1rem;
        text-align: center;
        font-size: 0.75rem;
        color: var(--white3);
        border-top: 1px solid var(--border2);
        cursor: pointer;
      }
      
      .search-clear-recent:hover {
        color: var(--red);
      }
    `;
    document.head.appendChild(style);
  },

  setupListeners() {
    const searchInput = document.getElementById('markets-search');
    if (!searchInput) return;

    const container = searchInput.parentElement;
    container.style.position = 'relative';

    // Show suggestions on focus
    searchInput.addEventListener('focus', () => {
      this.showSuggestions(searchInput.value);
    });

    // Update on input
    searchInput.addEventListener('input', (e) => {
      this.showSuggestions(e.target.value);
    });

    // Hide on blur (delayed to allow click)
    searchInput.addEventListener('blur', () => {
      setTimeout(() => this.hideSuggestions(), 200);
    });

    // Handle keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
      this.handleKeydown(e);
    });
  },

  showSuggestions(query) {
    const searchInput = document.getElementById('markets-search');
    const suggestions = this.getSuggestions(query);
    
    let dropdown = document.getElementById('search-suggestions');
    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.id = 'search-suggestions';
      dropdown.className = 'search-suggestions';
      searchInput.parentElement.appendChild(dropdown);
    }

    if (suggestions.length === 0 && !query) {
      dropdown.innerHTML = '<div class="search-suggestion-item" style="color: var(--white3);">Start typing to search...</div>';
    } else if (suggestions.length === 0) {
      dropdown.innerHTML = '<div class="search-suggestion-item" style="color: var(--white3);">No suggestions</div>';
    } else {
      dropdown.innerHTML = suggestions.map((s, i) => `
        <div class="search-suggestion-item ${this.recentSearches.includes(s) ? 'recent' : ''}" 
             data-index="${i}" 
             onclick="SearchSuggestions.selectSuggestion('${s.replace(/'/g, "\\'")}')">
          ${this.highlightMatch(s, query)}
        </div>
      `).join('');
      
      // Add clear button if showing recents
      if (!query && this.recentSearches.length > 0) {
        dropdown.innerHTML += `
          <div class="search-clear-recent" onclick="SearchSuggestions.clearRecent(); event.stopPropagation();">
            Clear recent searches
          </div>
        `;
      }
    }

    dropdown.style.display = 'block';
  },

  hideSuggestions() {
    const dropdown = document.getElementById('search-suggestions');
    if (dropdown) {
      dropdown.style.display = 'none';
    }
  },

  highlightMatch(text, query) {
    if (!query) return escHtml(text);
    const regex = new RegExp(`(${query})`, 'gi');
    return escHtml(text).replace(regex, '<span class="search-suggestion-highlight">$1</span>');
  },

  selectSuggestion(value) {
    const searchInput = document.getElementById('markets-search');
    searchInput.value = value;
    this.addSearch(value);
    this.hideSuggestions();
    filterMarketsSearch();
  },

  clearRecent() {
    this.recentSearches = [];
    this.saveRecent();
    this.showSuggestions('');
  },

  handleKeydown(e) {
    const dropdown = document.getElementById('search-suggestions');
    if (!dropdown || dropdown.style.display === 'none') return;

    const items = dropdown.querySelectorAll('.search-suggestion-item');
    let activeIndex = Array.from(items).findIndex(item => item.classList.contains('active'));

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, items.length - 1);
        this.setActiveItem(items, activeIndex);
        break;
      case 'ArrowUp':
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, -1);
        this.setActiveItem(items, activeIndex);
        break;
      case 'Enter':
        if (activeIndex >= 0 && items[activeIndex]) {
          e.preventDefault();
          items[activeIndex].click();
        }
        break;
      case 'Escape':
        this.hideSuggestions();
        break;
    }
  },

  setActiveItem(items, index) {
    items.forEach((item, i) => {
      item.classList.toggle('active', i === index);
      if (i === index) {
        item.style.background = 'var(--dark)';
      } else {
        item.style.background = '';
      }
    });
  }
};

// Hook into existing search to save queries
const originalFilterSearch = window.filterMarketsSearch;
window.filterMarketsSearch = function() {
  const query = document.getElementById('markets-search')?.value.trim();
  if (query) {
    SearchSuggestions.addSearch(query);
  }
  if (originalFilterSearch) {
    originalFilterSearch();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  SearchSuggestions.init();
});
