// ─────────────────────────────────────────────────────────────────────
// infinite-scroll.js — Infinite scroll for markets list
// ─────────────────────────────────────────────────────────────────────

const InfiniteScroll = {
  itemsPerPage: 10,
  currentPage: 1,
  isLoading: false,
  hasMore: true,
  container: null,
  sentinel: null,

  init(containerId = 'markets-list') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.setupIntersectionObserver();
    this.injectStyles();
  },

  setupIntersectionObserver() {
    // Create sentinel element
    this.sentinel = document.createElement('div');
    this.sentinel.id = 'infinite-scroll-sentinel';
    this.sentinel.style.cssText = 'height: 20px; margin: 1rem 0;';
    this.container.appendChild(this.sentinel);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isLoading && this.hasMore) {
          this.loadMore();
        }
      });
    }, { rootMargin: '100px' });

    observer.observe(this.sentinel);
  },

  async loadMore() {
    if (this.isLoading || !this.hasMore) return;
    
    this.isLoading = true;
    this.showLoader();

    // Simulate loading delay
    await new Promise(r => setTimeout(r, 500));

    // Get next batch of markets
    const allMarkets = this.getFilteredMarkets();
    const start = this.currentPage * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    const newMarkets = allMarkets.slice(start, end);

    if (newMarkets.length > 0) {
      // Render new markets
      newMarkets.forEach(m => {
        if (typeof _renderMarketCard === 'function') {
          _renderMarketCard(m, this.container);
        }
      });
      
      this.currentPage++;
      
      // Move sentinel to end
      this.container.appendChild(this.sentinel);
    } else {
      this.hasMore = false;
      this.showEndMessage();
    }

    this.isLoading = false;
    this.hideLoader();
  },

  getFilteredMarkets() {
    let all = [
      ...(State.firestoreMarkets || []),
      ...(State.userCreatedMarkets || [])
    ].filter(m => m.status !== 'rejected');

    // Apply search filter
    if (_marketSearchQuery) {
      const q = _marketSearchQuery.toLowerCase();
      all = all.filter(m => 
        m.question.toLowerCase().includes(q) ||
        (m.cat || '').toLowerCase().includes(q)
      );
    }

    // Apply category filter
    if (_currentMarketFilter && _currentMarketFilter !== 'all') {
      all = all.filter(m => 
        (m.cat || '').toLowerCase().includes(_currentMarketFilter.toLowerCase())
      );
    }

    // Apply sort
    const getTime = m => {
      if (m.approvedAt?.seconds) return m.approvedAt.seconds * 1000;
      if (m.createdAt?.seconds) return m.createdAt.seconds * 1000;
      return new Date(m.createdAt || 0).getTime();
    };

    if (_marketSortBy === 'volume') {
      all.sort((a, b) => (b.totalTokens || b.tokens || 0) - (a.totalTokens || a.tokens || 0));
    } else if (_marketSortBy === 'closing') {
      all.sort((a, b) => new Date(a.ends || '9999') - new Date(b.ends || '9999'));
    } else {
      all.sort((a, b) => getTime(b) - getTime(a));
    }

    return all;
  },

  showLoader() {
    if (!this.sentinel) return;
    this.sentinel.innerHTML = `
      <div style="display: flex; justify-content: center; padding: 1rem;">
        <div class="infinite-scroll-loader"></div>
      </div>
    `;
  },

  hideLoader() {
    if (!this.sentinel) return;
    this.sentinel.innerHTML = '';
  },

  showEndMessage() {
    if (!this.sentinel) return;
    this.sentinel.innerHTML = `
      <div style="text-align: center; padding: 1rem; color: var(--white3); font-family: var(--font-mono); font-size: 0.75rem;">
        — End of markets —
      </div>
    `;
  },

  reset() {
    this.currentPage = 1;
    this.hasMore = true;
    this.isLoading = false;
  },

  injectStyles() {
    if (document.getElementById('infinite-scroll-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'infinite-scroll-styles';
    style.textContent = `
      .infinite-scroll-loader {
        width: 24px;
        height: 24px;
        border: 2px solid var(--border2);
        border-top-color: var(--green);
        border-radius: 50%;
        animation: infinite-scroll-spin 0.8s linear infinite;
      }
      
      @keyframes infinite-scroll-spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
};

// Hook into existing render functions
const originalRenderMarkets = window.renderMarkets;
window.renderMarkets = function(filter) {
  InfiniteScroll.reset();
  if (originalRenderMarkets) {
    originalRenderMarkets(filter);
  }
  setTimeout(() => InfiniteScroll.init(), 100);
};
