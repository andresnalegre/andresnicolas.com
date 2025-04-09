document.addEventListener('DOMContentLoaded', function() {

    const CONFIG = {
        startYear: 2014,
        currentYear: 2024,
        xpPerYear: 1000,
        
        scrollOffsets: {
            '#Home': 0,
            '#about': 60,
            '#experience': 90,
            '#education': 135,
            '#skills-modal': 150,
            '#certifications': 110,
            '#projects': 110
        },
        
        buttonStyles: {
            common: 'width: 100%; padding: 12px; border-radius: 30px; font-weight: bold; font-size: 1rem; border: none; cursor: pointer;',
            primary: 'background-color: #4a148c; color: white;',
            marginTop: 'margin-top: 15px;'
        }
    };
    
    const DOM = {
        body: document.body,
        hamburger: document.querySelector('.hamburger'),
        navLinks: document.querySelector('.nav-links-container'),
        menuLinks: document.querySelectorAll('.nav-links-container a'),
        skillsSection: document.getElementById('skills-modal'),
        skillsTable: document.querySelector('.skills-table'),
        languageSkills: document.querySelector('.language-skills'),
        filterButtons: document.querySelectorAll('.filter-btn'),
        skillBars: document.querySelectorAll('.skill-bar'),
        moreBtn: document.querySelector('.more-btn'),
        projects: document.querySelectorAll('.project'),
        filterSelect: document.getElementById('category-filter'),
        lazyImages: document.querySelectorAll('img[data-src]')
    };
    
    const Util = {
        createElement: function(tag, options = {}) {
            const element = document.createElement(tag);
            
            if (options.className) {
                element.className = options.className;
            }
            
            if (options.cssText) {
                element.style.cssText = options.cssText;
            }
            
            if (options.text) {
                element.textContent = options.text;
            }
            
            if (options.attributes) {
                for (const [key, value] of Object.entries(options.attributes)) {
                    element.setAttribute(key, value);
                }
            }
            
            if (options.children) {
                options.children.forEach(child => {
                    element.appendChild(child);
                });
            }
            
            if (options.events) {
                for (const [event, handler] of Object.entries(options.events)) {
                    element.addEventListener(event, handler);
                }
            }
            
            return element;
        },
        
        clearChildren: function(element) {
            if (!element) return;
            element.innerHTML = '';
        }
    };
    
    // Navbar
    const NavbarModule = {
        init: function() {
            if (!DOM.hamburger || !DOM.navLinks) return;
            
            DOM.hamburger.addEventListener('click', this.toggleMenu.bind(this));
            
            this.setupSmoothScroll();
            
            if (window.location.hash) {
                setTimeout(() => {
                    this.smoothScroll(window.location.hash);
                }, 100);
            }
            
            if (DOM.hamburger) {
                DOM.hamburger.setAttribute('role', 'button');
                DOM.hamburger.setAttribute('aria-label', 'Toggle navigation menu');
                DOM.hamburger.setAttribute('aria-expanded', 'false');
                DOM.hamburger.setAttribute('tabindex', '0');
                
                DOM.hamburger.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggleMenu();
                    }
                });
            }
        },
        
        toggleMenu: function() {
            const isExpanded = DOM.hamburger.getAttribute('aria-expanded') === 'true';
            DOM.hamburger.setAttribute('aria-expanded', (!isExpanded).toString());
            
            DOM.hamburger.classList.toggle('active');
            DOM.navLinks.classList.toggle('active');
            DOM.body.classList.toggle('menu-open');
        },
        
        closeMenu: function() {
            DOM.hamburger.setAttribute('aria-expanded', 'false');
            DOM.hamburger.classList.remove('active');
            DOM.navLinks.classList.remove('active');
            DOM.body.classList.remove('menu-open');
        },
        
        setupSmoothScroll: function() {
            if (!DOM.menuLinks.length) return;
            
            DOM.menuLinks.forEach(link => {
                link.addEventListener('click', e => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href');
                    this.smoothScroll(targetId);
                });
            });
        },
        
        smoothScroll: function(targetId) {
            const targetSection = document.querySelector(targetId);
            if (!targetSection) return;
            
            const offset = CONFIG.scrollOffsets[targetId] || 60;
            const targetPosition = targetSection.offsetTop - offset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            this.closeMenu();
            
            targetSection.setAttribute('tabindex', '-1');
            targetSection.focus({ preventScroll: true });
        }
    };
    
    // Skills
    const SkillsModule = {
        skillRows: [],
        lessBtn: null,
        
        init: function() {
            if (!DOM.skillsTable) return;
            
            this.initializeSkills();
            this.setupFilterButtons();
            this.setupSkillBarsAccessibility();
            
            if (DOM.moreBtn) {
                DOM.moreBtn.setAttribute('role', 'button');
                DOM.moreBtn.setAttribute('aria-expanded', 'false');
                DOM.moreBtn.setAttribute('aria-controls', 'hidden-skills');
                
                DOM.moreBtn.addEventListener('click', this.showAllSkills.bind(this));
                
                DOM.moreBtn.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.showAllSkills();
                    }
                });
            }
            
            const activeFilterBtn = document.querySelector('.filter-btn.active');
            if (activeFilterBtn && activeFilterBtn.dataset.category === 'most-progress') {
                this.displayTopSkills();
            }
        },
        
        initializeSkills: function() {
            if (!DOM.skillsTable) return;
            
            const allSkillRows = DOM.skillsTable.querySelectorAll('.skill-row');
            this.skillRows = [];
            
            allSkillRows.forEach(row => {
                const bar = row.querySelector('.skill-bar');
                if (!bar || !bar.dataset.years) return;
                
                const dataYears = bar.dataset.years.split(',').map(Number);
                const totalYears = dataYears.length;
                const totalXP = totalYears * CONFIG.xpPerYear;
                const skillXP = row.querySelector('.skill-xp');
                
                if (skillXP) {
                    skillXP.textContent = `${totalXP} XP`;
                    skillXP.setAttribute('data-years', bar.dataset.years);
                }
                
                this.skillRows.push({ element: row, xp: totalXP });
            });
            
            this.skillRows.sort((a, b) => b.xp - a.xp);
        },
        
        displayTopSkills: function() {
            if (!this.skillRows.length || !DOM.skillsTable) return;
            
            const topSkills = this.skillRows.slice(0, 3);
            const remainingSkills = this.skillRows.slice(3);
            
            const fragment = document.createDocumentFragment();
            
            topSkills.forEach(row => {
                row.element.style.display = 'flex';
                fragment.appendChild(row.element);
            });
            
            if (DOM.moreBtn) {
                DOM.moreBtn.style.display = 'block';
                fragment.appendChild(DOM.moreBtn);
            }
            
            remainingSkills.forEach(row => {
                row.element.style.display = 'none';
                fragment.appendChild(row.element);
            });
            
            this.removeLessButton();
            
            Util.clearChildren(DOM.skillsTable);
            DOM.skillsTable.appendChild(fragment);
        },
        
        showAllSkills: function() {
            if (!DOM.skillsTable) return;
            
            const allSkillRows = DOM.skillsTable.querySelectorAll('.skill-row');
            allSkillRows.forEach(row => {
                row.style.display = 'flex';
            });
            
            if (DOM.moreBtn) {
                DOM.moreBtn.style.display = 'none';
                DOM.moreBtn.setAttribute('aria-expanded', 'true');
            }
            
            this.addLessButton();
        },
        
        addLessButton: function() {
            if (!DOM.skillsTable) return;
            
            this.removeLessButton();
            
            const buttonStyle = `${CONFIG.buttonStyles.common} ${CONFIG.buttonStyles.primary} ${CONFIG.buttonStyles.marginTop}`;
            
            this.lessBtn = Util.createElement('button', {
                className: 'less-btn',
                text: 'Show Less Skills',
                cssText: buttonStyle,
                attributes: {
                    'role': 'button',
                    'aria-expanded': 'true',
                    'aria-controls': 'hidden-skills'
                },
                events: {
                    click: () => {
                        this.displayTopSkills();
                        this.scrollToSkills();
                    },
                    keydown: (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            this.displayTopSkills();
                            this.scrollToSkills();
                        }
                    }
                }
            });
            
            DOM.skillsTable.appendChild(this.lessBtn);
        },
        
        removeLessButton: function() {
            if (this.lessBtn && this.lessBtn.parentNode) {
                this.lessBtn.remove();
            }
        },
        
        scrollToSkills: function() {
            if (!DOM.skillsSection) return;
            
            const offset = 90;
            const skillsTop = DOM.skillsSection.getBoundingClientRect().top + window.scrollY - offset;
            
            window.scrollTo({
                top: skillsTop,
                behavior: 'smooth'
            });
            
            DOM.skillsSection.setAttribute('tabindex', '-1');
            DOM.skillsSection.focus({ preventScroll: true });
        },
        
        setupFilterButtons: function() {
            if (!DOM.filterButtons.length) return;
            
            DOM.filterButtons.forEach(btn => {
                btn.setAttribute('role', 'button');
                btn.setAttribute('aria-pressed', btn.classList.contains('active').toString());
                
                btn.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.handleFilterClick(btn);
                    }
                });
            });
            
            const filterContainer = DOM.filterButtons[0].parentNode;
            if (!filterContainer) return;
            
            filterContainer.addEventListener('click', e => {
                const btn = e.target.closest('.filter-btn');
                if (!btn) return;
                
                this.handleFilterClick(btn);
            });
        },
        
        handleFilterClick: function(btn) {
            DOM.filterButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            
            const category = btn.dataset.category;
            this.toggleCategory(category);
        },
        
        toggleCategory: function(category) {
            if (!DOM.skillsTable || !DOM.languageSkills) return;
            
            if (category === 'languages') {
                DOM.skillsTable.style.display = 'none';
                DOM.languageSkills.style.display = 'block';
                
                DOM.languageSkills.setAttribute('aria-hidden', 'false');
                DOM.skillsTable.setAttribute('aria-hidden', 'true');
                
                if (DOM.moreBtn) DOM.moreBtn.style.display = 'none';
                this.removeLessButton();
            } else if (category === 'most-progress') {
                DOM.skillsTable.style.display = 'block';
                DOM.languageSkills.style.display = 'none';
                
                DOM.languageSkills.setAttribute('aria-hidden', 'true');
                DOM.skillsTable.setAttribute('aria-hidden', 'false');
                
                if (this.skillRows.length > 0) {
                    this.displayTopSkills();
                }
            }
        },
        
        setupSkillBarsAccessibility: function() {
            if (!DOM.skillBars.length) return;
            
            DOM.skillBars.forEach(bar => {
                if (!bar.dataset.years) return;
                
                const dataYears = bar.dataset.years.split(',').map(Number);
                const skillName = bar.closest('.skill-row')?.querySelector('.skill-name')?.textContent || 'Skill';
                
                let yearsDescription = dataYears.join(', ');
                const ariaLabel = `${skillName} active in years ${yearsDescription}`;
                bar.setAttribute('aria-label', ariaLabel);
                
                bar.setAttribute('title', `Active years: ${yearsDescription}`);
                
                this.createYearMarkers(bar, dataYears);
            });
        },
        
        createYearMarkers: function(bar, activeYears) {
            const container = bar.closest('.skill-bar-container');
            if (!container) return;
            
            const existingMarkers = container.querySelectorAll('.year-marker');
            existingMarkers.forEach(marker => marker.remove());
            
            const startYear = CONFIG.startYear;
            const endYear = CONFIG.currentYear;
            const totalYears = endYear - startYear + 1;
            
            activeYears.forEach(year => {
                if (year < startYear || year > endYear) return;
                
                const position = ((year - startYear) / totalYears) * 100;
                const width = (1 / totalYears) * 100;
                
                const yearMarker = Util.createElement('div', {
                    className: 'year-marker',
                    attributes: {
                        'data-year': year.toString(),
                        'title': `Year: ${year}`
                    },
                    cssText: `
                        position: absolute;
                        left: ${position}%;
                        width: ${width}%;
                        height: 100%;
                        background-color: #28a745;
                        z-index: 1;
                    `
                });
                
                bar.appendChild(yearMarker);
            });
            
            if (window.innerWidth > 768) {
                for (let year = startYear; year <= endYear; year++) {
                    const position = ((year - startYear) / totalYears) * 100;
                    
                    const yearLabel = Util.createElement('div', {
                        className: 'year-label',
                        text: year.toString(),
                        attributes: {
                            'aria-hidden': 'true'
                        },
                        cssText: `
                            position: absolute;
                            left: ${position}%;
                            top: -25px;
                            transform: translateX(-50%);
                            font-size: 10px;
                            color: #000000;
                            font-weight: bold;
                            z-index: 2;
                        `
                    });
                    
                    container.appendChild(yearLabel);
                }
            }
        }
    };
    
    // Projects
    const ProjectsModule = {
        init: function() {
            if (!DOM.projects.length || !DOM.filterSelect) return;
            
            this.setupProjectFilter();
            this.setupProjectsAccessibility();
        },
        
        setupProjectFilter: function() {
            const categoryCount = {};
            
            DOM.projects.forEach(project => {
                if (!project.dataset.category) return;
                
                const category = project.dataset.category;
                categoryCount[category] = (categoryCount[category] || 0) + 1;
            });
            
            const fragment = document.createDocumentFragment();
            
            Object.entries(categoryCount).forEach(([category, count]) => {
                const option = Util.createElement('option', {
                    text: `${category} (${count})`,
                    attributes: { value: category }
                });
                
                fragment.appendChild(option);
            });
            
            DOM.filterSelect.appendChild(fragment);
            
            DOM.filterSelect.setAttribute('aria-label', 'Filter projects by category');
            
            DOM.filterSelect.addEventListener('change', () => {
                const selectedCategory = DOM.filterSelect.value;
                
                DOM.projects.forEach(project => {
                    const projectCategory = project.dataset.category;
                    const display = selectedCategory === 'all' || projectCategory === selectedCategory ? 'block' : 'none';
                    project.style.display = display;
                    
                    project.setAttribute('aria-hidden', display === 'none' ? 'true' : 'false');
                });
                
                const visibleProjects = Array.from(DOM.projects).filter(p => p.style.display !== 'none').length;
                const announcement = `Showing ${visibleProjects} ${selectedCategory === 'all' ? 'projects' : selectedCategory + ' projects'}`;
                this.announceToScreenReaders(announcement);
            });
        },
        
        setupProjectsAccessibility: function() {
            DOM.projects.forEach(project => {
                if (!project.getAttribute('role')) {
                    project.setAttribute('role', 'link');
                }
                
                if (!project.getAttribute('tabindex')) {
                    project.setAttribute('tabindex', '0');
                }
                
                project.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        project.click();
                    }
                });
                
                const title = project.querySelector('h3')?.textContent || '';
                const description = project.querySelector('p')?.textContent || '';
                const category = project.dataset.category || '';
                
                const ariaLabel = `${title} - ${description} - Category: ${category}`;
                project.setAttribute('aria-label', ariaLabel);
            });
        },
        
        announceToScreenReaders: function(message) {
            let announcer = document.getElementById('sr-announcer');
            
            if (!announcer) {
                announcer = Util.createElement('div', {
                    attributes: {
                        'id': 'sr-announcer',
                        'aria-live': 'polite',
                        'aria-atomic': 'true',
                        'class': 'sr-only'
                    },
                    cssText: 'position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;'
                });
                
                document.body.appendChild(announcer);
            }
            
            announcer.textContent = message;
        }
    };
    
    // Lazy Loading
    const LazyLoadModule = {
        init: function() {
            if (!DOM.lazyImages.length) return;
            
            this.setupLazyLoading();
        },
        
        setupLazyLoading: function() {
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            const src = img.getAttribute('data-src');
                            
                            if (src) {
                                img.src = src;
                                img.removeAttribute('data-src');
                                
                                if (!img.hasAttribute('alt')) {
                                    const altText = img.getAttribute('data-alt') || 
                                                    img.parentElement.textContent.trim() || 
                                                    'Image';
                                    img.setAttribute('alt', altText);
                                }
                            }
                            
                            imageObserver.unobserve(img);
                        }
                    });
                });
                
                DOM.lazyImages.forEach(img => {
                    imageObserver.observe(img);
                });
            } else {
                this.loadImagesInBatches();
            }
        },
        
        loadImagesInBatches: function() {
            const batchSize = 5;
            let loadedCount = 0;
            const totalImages = DOM.lazyImages.length;
            
            const loadNextBatch = () => {
                const end = Math.min(loadedCount + batchSize, totalImages);
                
                for (let i = loadedCount; i < end; i++) {
                    const img = DOM.lazyImages[i];
                    const src = img.getAttribute('data-src');
                    
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                        
                        if (!img.hasAttribute('alt')) {
                            const altText = img.getAttribute('data-alt') || 
                                            img.parentElement.textContent.trim() || 
                                            'Image';
                            img.setAttribute('alt', altText);
                        }
                    }
                }
                
                loadedCount = end;
                
                if (loadedCount < totalImages) {
                    setTimeout(loadNextBatch, 100);
                }
            };
            
            loadNextBatch();
        }
    };
    
    const addAccessibilityStyles = function() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                margin: -1px;
                padding: 0;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                border: 0;
            }
            
            a:focus, button:focus, [role="button"]:focus, input:focus, select:focus, textarea:focus, [tabindex]:focus {
                outline: 3px solid #4a148c;
                outline-offset: 2px;
            }
            
            .filter-btn, .more-btn, .less-btn {
                color: #000000;
                font-weight: bold;
            }
            
            .skill-xp {
                color: #000000;
                font-weight: bold;
            }
        `;
        
        document.head.appendChild(styleElement);
    };
    
    addAccessibilityStyles();
    NavbarModule.init();
    SkillsModule.init();
    ProjectsModule.init();
    LazyLoadModule.init();
});