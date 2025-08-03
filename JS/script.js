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

        // Add animation on scroll for timeline items
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

        // Blog functionality
        const blogSearch = document.getElementById('blogSearch');
        const tagFilters = document.querySelectorAll('.tag-filter');
        const blogCards = document.querySelectorAll('.blog-card');
        const loadMoreBtn = document.getElementById('loadMore');
        
        let currentFilter = 'all';
        let visibleCards = 6; // Initially show 6 cards
        
        // Initialize blog display
        function initializeBlog() {
            showCards();
            updateLoadMoreButton();
        }
        
        // Show/hide cards based on current filter and search
        function showCards() {
            const searchTerm = blogSearch.value.toLowerCase();
            let visibleCount = 0;
            
            blogCards.forEach((card, index) => {
                const cardTags = card.dataset.tags;
                const cardTitle = card.querySelector('.blog-title').textContent.toLowerCase();
                const cardExcerpt = card.querySelector('.blog-excerpt').textContent.toLowerCase();
                
                // Check if card matches filter
                const matchesFilter = currentFilter === 'all' || cardTags.includes(currentFilter);
                
                // Check if card matches search
                const matchesSearch = searchTerm === '' || 
                    cardTitle.includes(searchTerm) || 
                    cardExcerpt.includes(searchTerm) ||
                    cardTags.includes(searchTerm);
                
                if (matchesFilter && matchesSearch) {
                    if (visibleCount < visibleCards) {
                        card.classList.remove('hidden');
                        card.style.display = 'block';
                        visibleCount++;
                    } else {
                        card.classList.add('hidden');
                        card.style.display = 'none';
                    }
                } else {
                    card.classList.add('hidden');
                    card.style.display = 'none';
                }
            });
        }
        
        // Update load more button visibility
        function updateLoadMoreButton() {
            const searchTerm = blogSearch.value.toLowerCase();
            let totalMatchingCards = 0;
            
            blogCards.forEach(card => {
                const cardTags = card.dataset.tags;
                const cardTitle = card.querySelector('.blog-title').textContent.toLowerCase();
                const cardExcerpt = card.querySelector('.blog-excerpt').textContent.toLowerCase();
                
                const matchesFilter = currentFilter === 'all' || cardTags.includes(currentFilter);
                const matchesSearch = searchTerm === '' || 
                    cardTitle.includes(searchTerm) || 
                    cardExcerpt.includes(searchTerm) ||
                    cardTags.includes(searchTerm);
                
                if (matchesFilter && matchesSearch) {
                    totalMatchingCards++;
                }
            });
            
            if (totalMatchingCards > visibleCards) {
                loadMoreBtn.style.display = 'inline-block';
            } else {
                loadMoreBtn.style.display = 'none';
            }
        }
        
        // Search functionality
        blogSearch.addEventListener('input', () => {
            visibleCards = 6; // Reset visible cards when searching
            showCards();
            updateLoadMoreButton();
        });
        
        // Tag filter functionality
        tagFilters.forEach(filter => {
            filter.addEventListener('click', () => {
                // Remove active class from all filters
                tagFilters.forEach(f => f.classList.remove('active'));
                
                // Add active class to clicked filter
                filter.classList.add('active');
                
                // Update current filter
                currentFilter = filter.dataset.tag;
                
                // Reset visible cards and update display
                visibleCards = 6;
                showCards();
                updateLoadMoreButton();
            });
        });
        
        // Load more functionality
        loadMoreBtn.addEventListener('click', () => {
            visibleCards += 3; // Show 3 more cards
            showCards();
            updateLoadMoreButton();
            
            // Smooth scroll to show new cards
            setTimeout(() => {
                const newCards = Array.from(blogCards)
                    .filter(card => !card.classList.contains('hidden'))
                    .slice(-3);
                
                if (newCards.length > 0) {
                    newCards[0].scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }
            }, 100);
        });
        
        // Initialize blog when page loads
        initializeBlog();
    