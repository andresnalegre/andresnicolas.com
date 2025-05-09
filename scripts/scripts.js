document.addEventListener('DOMContentLoaded', function() {
    // Add critical CSS inline for above-the-fold content
    const addCriticalStyles = () => {
        const criticalStyles = `
            .intro-header {
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: #f5f5f5; /* Fallback before image loads */
            }
            .profile-pic {
                width: 150px;
                height: 150px;
                border-radius: 50%;
                margin: 0 auto 20px;
                background-color: #eee; /* Placeholder color */
            }
            .download-cv {
                width: 150px; 
                height: 40px;
            }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.textContent = criticalStyles;
        document.head.appendChild(styleElement);
    };
    
    // Execute critical styles immediately
    addCriticalStyles();

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
        },
        
        // Cache configuration
        cache: {
            version: '1.0',
            expiration: 60 * 60 * 24 * 7, // 7 days in seconds
            prefix: 'portfolio_'
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
        lazyImages: document.querySelectorAll('img[loading="lazy"], img[data-src]'),
        certContainer: document.querySelector('.certifications-container'),
        certItems: document.querySelectorAll('.certification-item')
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
        },
        
        // Cache utilities
        cache: {
            set: function(key, value, expirationInSeconds = CONFIG.cache.expiration) {
                const now = new Date();
                const item = {
                    value: value,
                    expiry: now.getTime() + (expirationInSeconds * 1000)
                };
                try {
                    localStorage.setItem(CONFIG.cache.prefix + key, JSON.stringify(item));
                    return true;
                } catch (e) {
                    console.warn('Cache set failed:', e);
                    return false;
                }
            },
            
            get: function(key) {
                const itemStr = localStorage.getItem(CONFIG.cache.prefix + key);
                
                if (!itemStr) return null;
                
                try {
                    const item = JSON.parse(itemStr);
                    const now = new Date();
                    
                    if (now.getTime() > item.expiry) {
                        localStorage.removeItem(CONFIG.cache.prefix + key);
                        return null;
                    }
                    
                    return item.value;
                } catch (e) {
                    console.warn('Cache get failed:', e);
                    return null;
                }
            },
            
            clear: function(keyStartsWith = '') {
                const prefix = CONFIG.cache.prefix + keyStartsWith;
                
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith(prefix)) {
                        localStorage.removeItem(key);
                    }
                }
            },
            
            clearExpired: function() {
                const now = new Date().getTime();
                
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    
                    if (key && key.startsWith(CONFIG.cache.prefix)) {
                        const itemStr = localStorage.getItem(key);
                        
                        try {
                            const item = JSON.parse(itemStr);
                            if (now > item.expiry) {
                                localStorage.removeItem(key);
                            }
                        } catch (e) {
                            // Invalid item, remove it
                            localStorage.removeItem(key);
                        }
                    }
                }
            }
        },
        
        debounce: function(func, wait, immediate) {
            let timeout;
            return function() {
                const context = this, args = arguments;
                const later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
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
            
            // Check if skills data is in cache
            const cachedSkillsData = Util.cache.get('skills_data');
            if (cachedSkillsData) {
                this.skillRows = cachedSkillsData;
            } else {
                this.initializeSkills();
                // Cache skills data
                Util.cache.set('skills_data', this.skillRows);
            }
            
            this.setupFilterButtons();
            this.setupSkillBars();
            
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
            
            this.addAccessibilityStyles();
            
            // Optimize certifications display
            this.initializeCertifications();
        },
        
        initializeCertifications: function() {
            if (!DOM.certContainer || !DOM.certItems.length) return;
            
            // Show only first 6 initially
            const itemsToShow = 6;
            let hiddenItems = 0;
            
            DOM.certItems.forEach((item, index) => {
                if (index >= itemsToShow) {
                    item.style.display = 'none';
                    item.classList.add('lazy-cert');
                    hiddenItems++;
                }
            });
            
            // Add "Load More" button if needed
            if (hiddenItems > 0) {
                const buttonStyle = `${CONFIG.buttonStyles.common} ${CONFIG.buttonStyles.primary} ${CONFIG.buttonStyles.marginTop}`;
                
                const loadMoreBtn = Util.createElement('button', {
                    className: 'more-btn certs-more-btn',
                    text: 'Mostrar mais certificações',
                    cssText: buttonStyle,
                    attributes: {
                        'role': 'button',
                        'aria-expanded': 'false',
                        'aria-controls': 'lazy-certs'
                    },
                    events: {
                        click: () => {
                            document.querySelectorAll('.lazy-cert').forEach(item => {
                                item.style.display = 'flex';
                            });
                            loadMoreBtn.style.display = 'none';
                            loadMoreBtn.setAttribute('aria-expanded', 'true');
                        },
                        keydown: (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                document.querySelectorAll('.lazy-cert').forEach(item => {
                                    item.style.display = 'flex';
                                });
                                loadMoreBtn.style.display = 'none';
                                loadMoreBtn.setAttribute('aria-expanded', 'true');
                            }
                        }
                    }
                });
                
                DOM.certContainer.after(loadMoreBtn);
            }
        },
        
        addAccessibilityStyles: function() {
            const styleEl = document.createElement('style');
            styleEl.textContent = `
                .skill-row .year-label {
                    color: #000000 !important;
                    font-weight: bold !important;
                    background-color: rgba(255, 255, 255, 0.8);
                    padding: 1px 3px;
                    border-radius: 2px;
                }
                
                .skill-bar-container:hover .year-label,
                .skill-bar-container:focus-within .year-label {
                    opacity: 1 !important;
                    visibility: visible !important;
                }
                
                .filter-btn:focus, .more-btn:focus, .less-btn:focus {
                    outline: 2px solid #4a148c;
                    outline-offset: 2px;
                }
                
                .sr-only {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    white-space: nowrap;
                    border-width: 0;
                }
                
                .skill-xp {
                    color: #000000 !important;
                    font-weight: bold;
                }
                
                .skill-name {
                    color: #000000 !important;
                    font-weight: bold;
                }
            `;
            document.head.appendChild(styleEl);
        },
        
        initializeSkills: function() {
            if (!DOM.skillsTable) return;
            
            try {
                const allSkillRows = DOM.skillsTable.querySelectorAll('.skill-row');
                this.skillRows = [];
                
                // Salvar referências originais para evitar problemas no DOM
                const rowsData = [];
                
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
                    
                    const skillName = row.querySelector('.skill-name')?.textContent || '';
                    bar.setAttribute('title', `${skillName} skill active in years ${dataYears.join(', ')}`);
                    
                    // Não adicionar mais um span se já existir
                    if (!row.querySelector('.sr-only')) {
                        const srText = document.createElement('span');
                        srText.className = 'sr-only';
                        srText.textContent = `${skillName} skill active in years ${dataYears.join(', ')}`;
                        row.appendChild(srText);
                    }
                    
                    rowsData.push({ 
                        element: row, 
                        xp: totalXP,
                        skillName: skillName,
                        years: dataYears.join(', ')
                    });
                });
                
                // Ordenar por XP e guardar os dados
                rowsData.sort((a, b) => b.xp - a.xp);
                this.skillRows = rowsData;
                
                console.log('Skills inicializadas com sucesso:', this.skillRows.length);
            } catch (error) {
                console.error('Erro ao inicializar skills:', error);
                this.skillRows = [];
            }
        },
        
        displayTopSkills: function() {
            if (!this.skillRows.length || !DOM.skillsTable) return;
            
            const topSkills = this.skillRows.slice(0, 3);
            const remainingSkills = this.skillRows.slice(3);
            
            const fragment = document.createDocumentFragment();
            
            // Verificar se cada elemento existe antes de manipulá-lo
            topSkills.forEach(row => {
                if (row && row.element) {
                    row.element.style.display = 'flex';
                    fragment.appendChild(row.element.cloneNode(true));
                }
            });
            
            if (DOM.moreBtn) {
                DOM.moreBtn.style.display = 'block';
                fragment.appendChild(DOM.moreBtn.cloneNode(true));
            }
            
            // Verificar se cada elemento existe antes de manipulá-lo
            remainingSkills.forEach(row => {
                if (row && row.element) {
                    row.element.style.display = 'none';
                    fragment.appendChild(row.element.cloneNode(true));
                }
            });
            
            this.removeLessButton();
            
            Util.clearChildren(DOM.skillsTable);
            DOM.skillsTable.appendChild(fragment);
        },
        
        showAllSkills: function() {
            if (!DOM.skillsTable) return;
            
            try {
                const allSkillRows = DOM.skillsTable.querySelectorAll('.skill-row');
                if (allSkillRows && allSkillRows.length) {
                    allSkillRows.forEach(row => {
                        if (row) {
                            row.style.display = 'flex';
                        }
                    });
                }
                
                if (DOM.moreBtn) {
                    DOM.moreBtn.style.display = 'none';
                    DOM.moreBtn.setAttribute('aria-expanded', 'true');
                }
                
                this.addLessButton();
            } catch (error) {
                console.error('Erro ao mostrar todas as skills:', error);
            }
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
        
        setupSkillBars: function() {
            if (!DOM.skillBars.length) return;
            
            DOM.skillBars.forEach(bar => {
                if (!bar.dataset.years) return;
                
                const dataYears = bar.dataset.years.split(',').map(Number);
                const container = bar.closest('.skill-bar-container');
                if (!container) return;
                
                const fragment = document.createDocumentFragment();
                const scaleContainer = Util.createElement('div', {
                    cssText: 'position: absolute; height: 100%; width: 100%; top: 0; left: 0; display: flex; justify-content: space-between;'
                });
                
                bar.setAttribute('title', `Active years: ${dataYears.join(', ')}`);
                
                // Create a simplified and optimized skill bar
                // Instead of creating elements for each year, just set the width based on years
                const yearCount = dataYears.length;
                const maxWidth = Math.min(yearCount * 10, 100); // Cap at 100%
                
                // Immediately set the width for better performance
                requestAnimationFrame(() => {
                    bar.style.width = `${maxWidth}%`;
                });
                
                // Update skill XP text
                const skillRow = bar.closest('.skill-row');
                if (skillRow) {
                    const xpElement = skillRow.querySelector('.skill-xp');
                    if (xpElement) {
                        const totalXP = yearCount * CONFIG.xpPerYear;
                        xpElement.textContent = `${totalXP} XP`;
                    }
                }
            });
        }
    };
    
    // Projects
    const ProjectsModule = {
        projects: [
            {
                id: "storify",
                title: "Storify",
                description: "Storify is a React project to easily store and download files.",
                github: "https://github.com/andresnalegre/Storify",
                demo: "#",
                category: "React"
            },
            {
                id: "safepass",
                title: "SafePass",
                description: "SafePass is a password manager built with React that lets you generate strong passwords, check their strength, and store them securely.",
                github: "https://github.com/andresnalegre/SafePass",
                demo: "#",
                category: "React"
            },
            {
                id: "jamlite",
                title: "JamLite",
                description: "JamLite is a React project connected to the Spotify API that lets you create or edit playlists by adding songs.",
                github: "https://github.com/andresnalegre/JamLite",
                demo: "#",
                category: "React"
            },
            {
                id: "dailyblessing",
                title: "Daily Blessing",
                description: "Daily Blessing is a Node.js project that generates random blessings to make your day more blessed.",
                github: "https://github.com/andresnalegre/DailyBlessing",
                demo: "#",
                category: "Node.js"
            },
            {
                id: "redcatch",
                title: "RedCatch",
                description: "RedCatch is a React project connected to the Reddit API to fetch and display posts.",
                github: "https://github.com/andresnalegre/RedCatch",
                demo: "#",
                category: "React"
            },
            {
                id: "datascrape",
                title: "DataScrape",
                description: "DataScrape is a Python project where I collect data from a given URL and save it into a chosen folder.",
                github: "https://github.com/andresnalegre/DataScrape",
                demo: "#",
                category: "Python"
            },
            {
                id: "firecat",
                title: "Firecat",
                description: "Firecat is a Python project where I built a simple browser app that lets users perform searches.",
                github: "https://github.com/andresnalegre/Firecat",
                demo: "#",
                category: "Python"
            },
            {
                id: "piggybank",
                title: "Piggy Bank",
                description: "Piggy Bank is a React project where I built a simple piggy bank that lets you add and withdraw money, and view your transaction history by date.",
                github: "https://github.com/andresnalegre/PiggyBank",
                demo: "#",
                category: "React"
            },
            {
                id: "astrocalc",
                title: "AstroCalc",
                description: "AstroCalc is a calculator project where I show design and logic in a simple and interactive way.",
                github: "https://github.com/andresnalegre/AstroCalc",
                demo: "https://andresnalegre.github.io/AstroCalc",
                category: "Web Development"
            },
            {
                id: "cipherflow",
                title: "Cipher Flow",
                description: "CipherFlow is a web dev project inspired by The Matrix where I recreated the iconic code rain, used the soundtrack from the first movie, and added interactions that feel like the film, building something immersive and nostalgic.",
                github: "https://github.com/andresnalegre/CipherFlow",
                demo: "https://andresnalegre.github.io/CipherFlow",
                category: "Web Development"
            }
        ],

        init: function() {
            this.projectElements = document.querySelectorAll('.project');
            this.filterSelect = document.getElementById('category-filter');
            
            if (!this.projectElements.length || !this.filterSelect) return;
            
            // Initialize lazily to improve initial page load
            this.initWithDelay();
        },
        
        initWithDelay: function() {
            // Create modal after initial page load to improve performance
            setTimeout(() => {
                this.modal = this.createModal();
                
                this.projectTitleMap = {};
                this.projectElements.forEach(element => {
                    const title = element.querySelector('h3')?.textContent;
                    if (title) {
                        this.projectTitleMap[title] = element;
                    }
                });
                
                this.projectMap = {};
                this.projects.forEach(project => {
                    this.projectMap[project.id] = project;
                });
                
                this.setupProjectFilter();
                this.setupProjectsAccessibility();
                this.setupProjectModals();
            }, 500); // Delay initialization for better initial loading
        },
        
        createModal: function() {
            // Check cache first
            const cachedModalHtml = Util.cache.get('modal_element');
            if (cachedModalHtml) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = cachedModalHtml;
                const modal = tempDiv.firstChild;
                document.body.appendChild(modal);
                return modal;
            }
            
            let modal = document.getElementById('project-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.className = 'project-modal';
                modal.id = 'project-modal';
                document.body.appendChild(modal);
                
                // Cache modal HTML
                Util.cache.set('modal_element', modal.outerHTML);
            }
            return modal;
        },
        
        createModalHTML: function(project) {
            const demoButtonHTML = project.demo === "#" ?
                `<button class="modal-btn demo-btn" data-project-id="${project.id}">Demo</button>` :
                `<a href="${project.demo}" target="_blank" class="modal-btn demo-btn">Demo</a>`;
                
            return `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>${project.title}</h2>
                    <p>${project.description}</p>
                    <div class="modal-buttons">
                        <a href="${project.github}" target="_blank" class="modal-btn github-btn">Code</a>
                        ${demoButtonHTML}
                    </div>
                </div>
            `;
        },
        
        showNotification: function(message) {
            const notification = document.createElement('div');
            notification.className = 'message-popup info';
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        },
        
        setupProjectFilter: function() {
            const categoryCount = {};
            
            // Check cache first
            const cachedCategoryCount = Util.cache.get('project_categories');
            if (cachedCategoryCount) {
                Object.assign(categoryCount, cachedCategoryCount);
            } else {
                this.projectElements.forEach(project => {
                    if (!project.dataset.category) return;
                    
                    const category = project.dataset.category;
                    categoryCount[category] = (categoryCount[category] || 0) + 1;
                });
                
                // Cache category count
                Util.cache.set('project_categories', categoryCount);
            }
            
            if (!this.filterSelect.querySelector('option[value="all"]')) {
                const allOption = document.createElement('option');
                allOption.value = 'all';
                allOption.textContent = 'All Projects';
                this.filterSelect.appendChild(allOption);
            }
            
            Object.entries(categoryCount).forEach(([category, count]) => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = `${category} (${count})`;
                this.filterSelect.appendChild(option);
            });
            
            this.filterSelect.setAttribute('aria-label', 'Filter projects by category');
            
            const projectsContainer = this.projectElements[0]?.parentElement;
            
            // Use debounce to improve performance
            const debouncedFilterHandler = Util.debounce(() => {
                const selectedCategory = this.filterSelect.value;
                let visibleCount = 0;
                
                this.projectElements.forEach(project => {
                    const projectCategory = project.dataset.category;
                    const shouldShow = selectedCategory === 'all' || projectCategory === selectedCategory;
                    
                    if (shouldShow) {
                        project.style.display = '';
                        project.setAttribute('aria-hidden', 'false');
                        visibleCount++;
                    } else {
                        project.style.display = 'none';
                        project.setAttribute('aria-hidden', 'true');
                    }
                });
                
                if (projectsContainer) {
                    if (visibleCount <= 2) {
                        projectsContainer.classList.add('few-items');
                    } else {
                        projectsContainer.classList.remove('few-items');
                    }
                    
                    projectsContainer.dataset.visibleItems = visibleCount;
                }
            }, 100);
            
            this.filterSelect.addEventListener('change', debouncedFilterHandler);
        },
        
        setupProjectsAccessibility: function() {
            this.projectElements.forEach(project => {
                if (!project.getAttribute('role')) {
                    project.setAttribute('role', 'button');
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
                
                project.setAttribute('title', `${title} - ${category}`);
                
                if (project.getAttribute('role') === 'button') {
                    project.setAttribute('aria-label', `${title} - ${description} - Category: ${category}`);
                }
            });
        },
        
        setupProjectModals: function() {
            // Use event delegation for better performance
            const projectsContainer = this.projectElements[0]?.parentElement;
            if (projectsContainer) {
                projectsContainer.addEventListener('click', (e) => {
                    const projectElement = e.target.closest('.project');
                    if (projectElement) {
                        e.preventDefault();
                        this.handleProjectClick(projectElement);
                    }
                });
            }
        },
        
        handleProjectClick: function(element) {
            let projectId = element.getAttribute('data-id');
            let project = null;
            
            // Check cache first
            const cachedProject = Util.cache.get(`project_${projectId}`);
            if (cachedProject) {
                project = cachedProject;
            } else {
                if (projectId) {
                    project = this.projectMap[projectId];
                }
                
                if (!project) {
                    const title = element.querySelector('h3')?.textContent;
                    if (title) {
                        project = this.projects.find(p => p.title === title);
                    }
                }
                
                // Cache the project data
                if (project) {
                    Util.cache.set(`project_${projectId}`, project);
                }
            }
            
            if (project) {
                this.modal.innerHTML = this.createModalHTML(project);
                this.modal.style.display = 'flex';
                
                const closeBtn = this.modal.querySelector('.close-modal');
                closeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.modal.style.display = 'none';
                });
                
                const demoBtn = this.modal.querySelector('.demo-btn');
                if (demoBtn && !demoBtn.getAttribute('href')) {
                    demoBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.showNotification("New updates soon");
                    });
                }
                
                window.onclick = (e) => {
                    if (e.target === this.modal) {
                        this.modal.style.display = 'none';
                    }
                };
                
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && this.modal.style.display === 'flex') {
                        this.modal.style.display = 'none';
                    }
                });
                
                this.setupModalKeyboardNavigation();
            }
        },
        
        setupModalKeyboardNavigation: function() {
            const focusableElements = this.modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (!focusableElements.length) return;
            
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            setTimeout(() => {
                firstElement.focus();
            }, 100);
            
            const handleKeyDown = (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey && document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    } else if (!e.shiftKey && document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            };
            
            this.modal.removeEventListener('keydown', handleKeyDown);
            
            this.modal.addEventListener('keydown', handleKeyDown);
        }
    };
    
    // Lazy Loading
    const LazyLoadModule = {
        init: function() {
            this.lazyImages = document.querySelectorAll('img[loading="lazy"], img[data-src]');
            
            if (!this.lazyImages.length) return;
            
            // Set proper src for missing image in about section
            const aboutImage = document.querySelector('.about-image img');
            if (aboutImage && !aboutImage.src) {
                aboutImage.src = './assets/Images/Andres.webp';
                aboutImage.setAttribute('loading', 'lazy');
                aboutImage.setAttribute('decoding', 'async');
            }
            
            this.setupLazyLoading();
            this.prefetchCriticalImages();
            
            // Add cache headers meta tag
            this.addCacheControlMeta();
        },
        
        addCacheControlMeta: function() {
            const meta = document.createElement('meta');
            meta.httpEquiv = 'Cache-Control';
            meta.content = 'max-age=604800'; // 1 week
            document.head.appendChild(meta);
        },
        
        prefetchCriticalImages: function() {
            // Prefetch critical images for better performance
            const criticalImages = [
                './assets/Images/profile.webp',
                './assets/Images/geometric.webp'
            ];
            
            criticalImages.forEach(imgSrc => {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = imgSrc;
                link.as = 'image';
                document.head.appendChild(link);
            });
        },
        
        setupLazyLoading: function() {
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            const src = img.getAttribute('data-src') || img.getAttribute('src');
                            
                            if (src) {
                                img.src = src;
                                
                                // Remove data-src to avoid re-processing
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
                }, {
                    rootMargin: '200px' // Load images 200px before they come into view
                });
                
                this.lazyImages.forEach(img => {
                    imageObserver.observe(img);
                });
            } else {
                // Fallback for browsers without IntersectionObserver
                this.loadImagesInBatches();
            }
        },
        
        loadImagesInBatches: function() {
            const batchSize = 5;
            let loadedCount = 0;
            const totalImages = this.lazyImages.length;
            
            const loadNextBatch = () => {
                const end = Math.min(loadedCount + batchSize, totalImages);
                
                for (let i = loadedCount; i < end; i++) {
                    const img = this.lazyImages[i];
                    const src = img.getAttribute('data-src') || img.getAttribute('src');
                    
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
                    requestIdleCallback 
                        ? requestIdleCallback(() => loadNextBatch())
                        : setTimeout(loadNextBatch, 100);
                }
            };
            
            loadNextBatch();
        }
    };
    
    // Service Worker Registration for caching
    const ServiceWorkerModule = {
        init: function() {
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                    navigator.serviceWorker.register('./service-worker.js')
                        .then(registration => {
                            console.log('ServiceWorker registration successful with scope: ', registration.scope);
                        })
                        .catch(err => {
                            console.log('ServiceWorker registration failed: ', err);
                        });
                });
            }
        }
    };
    
    // Performance optimizer
    const PerformanceModule = {
        init: function() {
            // Clear expired cache items
            Util.cache.clearExpired();
            
            // Add cache control headers
            this.addCacheHeaders();
            
            // Optimize resource loading
            this.optimizeResourceLoading();
            
            // Optimize animations
            this.optimizeAnimations();
        },
        
        addCacheHeaders: function() {
            // Add cache control meta tag if not already present
            if (!document.querySelector('meta[http-equiv="Cache-Control"]')) {
                const meta = document.createElement('meta');
                meta.setAttribute('http-equiv', 'Cache-Control');
                meta.setAttribute('content', 'max-age=86400'); // 1 day cache
                document.head.appendChild(meta);
            }
        },
        
        optimizeResourceLoading: function() {
            // Prefetch links for better performance
            const links = document.querySelectorAll('a');
            const visitedUrls = new Set();
            
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('/') && !visitedUrls.has(href)) {
                    visitedUrls.add(href);
                    
                    // Create prefetch link
                    const prefetchLink = document.createElement('link');
                    prefetchLink.rel = 'prefetch';
                    prefetchLink.href = href;
                    document.head.appendChild(prefetchLink);
                }
            });
        },
        
        optimizeAnimations: function() {
            // Use requestAnimationFrame for animations
            const animateElements = document.querySelectorAll('.skill-bar, .timeline-item');
            
            if (animateElements.length) {
                requestAnimationFrame(() => {
                    animateElements.forEach(el => {
                        el.style.opacity = '1';
                        el.style.transform = 'translateY(0)';
                    });
                });
            }
        }
    };
    
    // Initialize modules in order of importance
    NavbarModule.init();
    LazyLoadModule.init();
    
    // Verificar e corrigir elementos críticos
    const fixCriticalElements = () => {
        // Verificar imagem no about
        const aboutImage = document.querySelector('.about-image img');
        if (aboutImage && !aboutImage.src) {
            aboutImage.src = './assets/Images/Andres.webp';
            aboutImage.setAttribute('loading', 'lazy');
            aboutImage.setAttribute('decoding', 'async');
        }
        
        // Verificar dimensões do botão de download
        const downloadBtn = document.querySelector('.download-cv');
        if (downloadBtn) {
            downloadBtn.style.width = '150px';
            downloadBtn.style.height = '40px';
        }
    };
    
    fixCriticalElements();
    
    // Usar requestAnimationFrame para o primeiro carregamento importante
    requestAnimationFrame(() => {
        // Carregamento seguro de módulos com tratamento de erro
        try {
            SkillsModule.init();
        } catch (error) {
            console.error('Erro ao inicializar SkillsModule:', error);
        }
    });
    
    // Defer non-critical modules
    setTimeout(() => {
        try {
            PerformanceModule.init();
        } catch (error) {
            console.error('Erro ao inicializar PerformanceModule:', error);
        }
    }, 200);
    
    // Initialize modules after initial load
    setTimeout(() => {
        try {
            ProjectsModule.init();
        } catch (error) {
            console.error('Erro ao inicializar ProjectsModule:', error);
        }
        
        // Only initialize service worker if browser supports it
        if ('serviceWorker' in navigator) {
            try {
                ServiceWorkerModule.init();
            } catch (error) {
                console.error('Erro ao inicializar ServiceWorkerModule:', error);
            }
        }
    }, 500);
});