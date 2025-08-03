// Enhanced blog functionality with dynamic loading
class BlogManager {
    constructor() {
        this.articles = [];
        this.filteredArticles = [];
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.articlesPerPage = 6;
        this.currentPage = 1;
        
        this.initializeElements();
        this.loadBlogData();
    }
    
    initializeElements() {
        this.blogGrid = document.getElementById('blogGrid');
        this.searchInput = document.getElementById('blogSearch');
        this.tagFilters = document.querySelectorAll('.tag-filter');
        this.loadMoreBtn = document.getElementById('loadMore');
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value.toLowerCase();
                this.currentPage = 1;
                this.filterAndDisplayArticles();
            });
        }
        
        // Tag filter functionality
        if (this.tagFilters) {
            this.tagFilters.forEach(filter => {
                filter.addEventListener('click', (e) => {
                    this.updateActiveFilter(e.target);
                    this.currentFilter = e.target.dataset.tag;
                    this.currentPage = 1;
                    this.filterAndDisplayArticles();
                });
            });
        }
        
        // Load more functionality
        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => {
                this.currentPage++;
                this.displayArticles();
            });
        }
    }
    
    async loadBlogData() {
        try {
            const response = await fetch('blog-data.json');
            const data = await response.json();
            this.articles = data.articles;
            this.filteredArticles = [...this.articles];
            this.displayArticles();
        } catch (error) {
            console.warn('Could not load blog data from JSON, using static content');
            this.initializeWithStaticContent();
        }
    }
    
    initializeWithStaticContent() {
        // Fallback to static content if JSON loading fails
        const existingCards = document.querySelectorAll('.blog-card');
        this.setupStaticCardEvents(existingCards);
        this.updateLoadMoreButton();
    }
    
    setupStaticCardEvents(cards) {
        let visibleCards = 6;
        
        const showCards = () => {
            const searchTerm = this.searchInput ? this.searchInput.value.toLowerCase() : '';
            let visibleCount = 0;
            
            cards.forEach((card) => {
                const cardTags = card.dataset.tags || '';
                const cardTitle = card.querySelector('.blog-title')?.textContent.toLowerCase() || '';
                const cardExcerpt = card.querySelector('.blog-excerpt')?.textContent.toLowerCase() || '';
                
                const matchesFilter = this.currentFilter === 'all' || cardTags.includes(this.currentFilter);
                const matchesSearch = searchTerm === '' || 
                    cardTitle.includes(searchTerm) || 
                    cardExcerpt.includes(searchTerm) ||
                    cardTags.includes(searchTerm);
                
                if (matchesFilter && matchesSearch) {
                    if (visibleCount < visibleCards) {
                        card.style.display = 'block';
                        card.classList.remove('hidden');
                        visibleCount++;
                    } else {
                        card.style.display = 'none';
                        card.classList.add('hidden');
                    }
                } else {
                    card.style.display = 'none';
                    card.classList.add('hidden');
                }
            });
        };
        
        if (this.searchInput) {
            this.searchInput.addEventListener('input', showCards);
        }
        
        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => {
                visibleCards += 3;
                showCards();
                this.updateLoadMoreButton();
            });
        }
        
        showCards();
    }
    
    filterAndDisplayArticles() {
        this.filteredArticles = this.articles.filter(article => {
            const matchesFilter = this.currentFilter === 'all' || 
                article.tags.includes(this.currentFilter);
            
            const matchesSearch = this.currentSearch === '' ||
                article.title.toLowerCase().includes(this.currentSearch) ||
                article.excerpt.toLowerCase().includes(this.currentSearch) ||
                article.tags.some(tag => tag.includes(this.currentSearch));
            
            return matchesFilter && matchesSearch;
        });
        
        this.displayArticles();
    }
    
    displayArticles() {
        if (!this.blogGrid) return;
        
        const articlesToShow = this.filteredArticles.slice(0, this.currentPage * this.articlesPerPage);
        
        this.blogGrid.innerHTML = '';
        
        articlesToShow.forEach((article, index) => {
            const articleElement = this.createArticleElement(article);
            this.blogGrid.appendChild(articleElement);
            
            // Add staggered animation
            setTimeout(() => {
                articleElement.style.opacity = '1';
                articleElement.style.transform = 'translateY(0)';
            }, index * 100);
        });
        
        this.updateLoadMoreButton();
    }
    
    createArticleElement(article) {
        const articleDiv = document.createElement('article');
        articleDiv.className = 'blog-card';
        articleDiv.dataset.tags = article.tags.join(' ');
        articleDiv.style.opacity = '0';
        articleDiv.style.transform = 'translateY(30px)';
        articleDiv.style.transition = 'all 0.6s ease';
        
        const tagsHtml = article.tags.map(tag => 
            `<span class="tag">${this.formatTagName(tag)}</span>`
        ).join('');
        
        articleDiv.innerHTML = `
            <div class="blog-image">
                <div class="placeholder-image">${article.icon}</div>
            </div>
            <div class="blog-content">
                <div class="blog-tags">
                    ${tagsHtml}
                </div>
                <h3 class="blog-title">${article.title}</h3>
                <p class="blog-excerpt">${article.excerpt}</p>
                <div class="blog-meta">
                    <span class="blog-date">${this.formatDate(article.date)}</span>
                    <span class="read-time">${article.readTime}</span>
                </div>
                <a href="${this.getArticleUrl(article)}" class="read-more">Read More →</a>
            </div>
        `;
        
        return articleDiv;
    }
    
    formatTagName(tag) {
        const tagMap = {
            'cybersecurity': 'Cybersecurity',
            'it-support': 'IT Support',
            'cloud': 'Cloud',
            'networking': 'Networking',
            'career': 'Career'
        };
        return tagMap[tag] || tag.charAt(0).toUpperCase() + tag.slice(1);
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    getArticleUrl(article) {
        // In a real implementation, this would link to individual article pages
        return `#article-${article.slug}`;
    }
    
    updateActiveFilter(activeFilter) {
        this.tagFilters.forEach(filter => filter.classList.remove('active'));
        activeFilter.classList.add('active');
    }
    
    updateLoadMoreButton() {
        if (!this.loadMoreBtn) return;
        
        const totalArticles = this.filteredArticles.length;
        const shownArticles = this.currentPage * this.articlesPerPage;
        
        if (shownArticles >= totalArticles) {
            this.loadMoreBtn.style.display = 'none';
        } else {
            this.loadMoreBtn.style.display = 'inline-block';
        }
    }
}

// Enhanced main script functionality
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.timeline-item, .skill-item, .blog-card').forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'all 0.6s ease';
        observer.observe(item);
    });

    // Initialize blog manager
    if (document.getElementById('blogGrid')) {
        new BlogManager();
    }
});

// Export for use in other files if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlogManager;
}
