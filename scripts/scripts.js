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
                
                const skillName = row.querySelector('.skill-name')?.textContent || '';
                bar.setAttribute('title', `${skillName} skill active in years ${dataYears.join(', ')}`);
                
                const srText = document.createElement('span');
                srText.className = 'sr-only';
                srText.textContent = `${skillName} skill active in years ${dataYears.join(', ')}`;
                row.appendChild(srText);
                
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
                
                for (let year = CONFIG.startYear; year <= CONFIG.currentYear; year++) {
                    const dashedLine = Util.createElement('div', {
                        cssText: 'border-left: 1px dashed black; position: absolute; height: 100%; top: 0; left: 0;'
                    });
                    
                    const yearLabel = Util.createElement('span', {
                        text: year,
                        className: 'year-label',
                        attributes: {
                            'aria-hidden': 'true'
                        },
                        cssText: 'position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 0.8rem; color: #000000; font-weight: bold;'
                    });
                    
                    const yearElement = Util.createElement('div', {
                        cssText: `flex: 1; position: relative; height: 100%; ${dataYears.includes(year) && dataYears.includes(year + 1) ? 'background: #28a745;' : ''}`,
                        children: [dashedLine, yearLabel]
                    });
                    
                    scaleContainer.appendChild(yearElement);
                }
                
                fragment.appendChild(scaleContainer);
                container.appendChild(fragment);
            });
        }
    };
    
        // Projects
        const ProjectsModule = {
            projects: [
                {
                    id: "storify",
                    title: "Storify",
                    description: "A web application for creating and sharing interactive stories using React.",
                    github: "https://github.com/andresnalegre/Storify",
                    demo: "https://andresnalegre.github.io/Storify",
                    category: "React"
                },
                {
                    id: "safepass",
                    title: "SafePass",
                    description: "Secure password manager developed with React and cutting-edge encryption.",
                    github: "https://github.com/andresnalegre/SafePass",
                    demo: "https://andresnalegre.github.io/SafePass",
                    category: "React"
                },
                {
                    id: "jamlite",
                    title: "JamLite",
                    description: "Minimalist music creation app built with React and Web Audio API.",
                    github: "https://github.com/andresnalegre/JamLite",
                    demo: "https://andresnalegre.github.io/JamLite",
                    category: "React"
                },
                {
                    id: "dailyblessing",
                    title: "Daily Blessing",
                    description: "Node.js API that delivers daily inspirational messages through a RESTful endpoint.",
                    github: "https://github.com/andresnalegre/DailyBlessing",
                    demo: "https://daily-blessing.herokuapp.com",
                    category: "Node.js"
                },
                {
                    id: "redcatch",
                    title: "RedCatch",
                    description: "React app for monitoring and analyzing social media traffic.",
                    github: "https://github.com/andresnalegre/RedCatch",
                    demo: "https://andresnalegre.github.io/RedCatch",
                    category: "React"
                },
                {
                    id: "datascrape",
                    title: "DataScrape",
                    description: "Python web scraping tool for collecting and analyzing data from various sources.",
                    github: "https://github.com/andresnalegre/DataScrape",
                    demo: "https://datascrape.pythonanywhere.com",
                    category: "Python"
                },
                {
                    id: "firecat",
                    title: "Firecat",
                    description: "Python security tool for detecting and preventing network attacks.",
                    github: "https://github.com/andresnalegre/Firecat",
                    demo: "https://firecat-demo.pythonanywhere.com",
                    category: "Python"
                },
                {
                    id: "piggybank",
                    title: "Piggy Bank",
                    description: "Personal finance management app with data visualization using React.",
                    github: "https://github.com/andresnalegre/PiggyBank",
                    demo: "https://andresnalegre.github.io/PiggyBank",
                    category: "React"
                },
                {
                    id: "astrocalc",
                    title: "AstroCalc",
                    description: "Web-based astronomical calculator for celestial calculations and coordinate conversions.",
                    github: "https://github.com/andresnalegre/AstroCalc",
                    demo: "https://andresnalegre.github.io/AstroCalc",
                    category: "Web Development"
                },
                {
                    id: "cipherflow",
                    title: "Cipher Flow",
                    description: "Web tool for encrypting and decrypting messages using various algorithms.",
                    github: "https://github.com/andresnalegre/CipherFlow",
                    demo: "https://andresnalegre.github.io/CipherFlow",
                    category: "Web Development"
                }
            ],
        
            init: function() {
                // Get DOM elements
                this.projectElements = document.querySelectorAll('.project');
                this.filterSelect = document.getElementById('category-filter');
                
                if (!this.projectElements.length || !this.filterSelect) return;
                
                // Create modal container
                this.modal = this.createModal();
                
                // Create project map for quick lookup
                this.projectMap = {};
                this.projects.forEach(project => {
                    this.projectMap[project.id] = project;
                });
                
                // Initialize functionality
                this.setupProjectFilter();
                this.setupProjectsAccessibility();
                this.setupProjectModals();
            },
            
            createModal: function() {
                const modal = document.createElement('div');
                modal.className = 'project-modal';
                modal.id = 'project-modal';
                document.body.appendChild(modal);
                return modal;
            },
            
            createModalHTML: function(project) {
                return `
                    <div class="modal-content">
                        <span class="close-modal">&times;</span>
                        <h2>${project.title}</h2>
                        <p>${project.description}</p>
                        <div class="modal-buttons">
                            <a href="${project.github}" target="_blank" class="modal-btn github-btn">Code</a>
                            <button class="modal-btn demo-btn" data-project-id="${project.id}">Demo</button>
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
                // Populate filter with categories and counts
                const categoryCount = {};
                
                this.projectElements.forEach(project => {
                    if (!project.dataset.category) return;
                    
                    const category = project.dataset.category;
                    categoryCount[category] = (categoryCount[category] || 0) + 1;
                });
                
                // Add "All" option if not already present
                if (!this.filterSelect.querySelector('option[value="all"]')) {
                    const allOption = document.createElement('option');
                    allOption.value = 'all';
                    allOption.textContent = 'All Projects';
                    this.filterSelect.appendChild(allOption);
                }
                
                // Add category options from project data
                Object.entries(categoryCount).forEach(([category, count]) => {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = `${category} (${count})`;
                    this.filterSelect.appendChild(option);
                });
                
                // Set accessibility attributes
                this.filterSelect.setAttribute('aria-label', 'Filter projects by category');
                
                // Add change event listener
                this.filterSelect.addEventListener('change', () => {
                    const selectedCategory = this.filterSelect.value;
                    
                    this.projectElements.forEach(project => {
                        const projectCategory = project.dataset.category;
                        const display = selectedCategory === 'all' || projectCategory === selectedCategory ? 'flex' : 'none';
                        project.style.display = display;
                        
                        project.setAttribute('aria-hidden', display === 'none' ? 'true' : 'false');
                    });
                });
            },
            
            setupProjectsAccessibility: function() {
                this.projectElements.forEach(project => {
                    // Set appropriate ARIA attributes
                    if (!project.getAttribute('role')) {
                        project.setAttribute('role', 'link');
                    }
                    
                    if (!project.getAttribute('tabindex')) {
                        project.setAttribute('tabindex', '0');
                    }
                    
                    // Add keyboard navigation
                    project.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            project.click();
                        }
                    });
                    
                    // Set descriptive attributes
                    const title = project.querySelector('h3')?.textContent || '';
                    const description = project.querySelector('p')?.textContent || '';
                    const category = project.dataset.category || '';
                    
                    project.setAttribute('title', `${title} - ${category}`);
                    
                    if (project.getAttribute('role') === 'link') {
                        project.setAttribute('aria-label', `${title} - ${description} - Category: ${category}`);
                    }
                });
            },
            
            setupProjectModals: function() {
                this.projectElements.forEach(element => {
                    const projectId = element.getAttribute('data-id');
                    
                    element.addEventListener('click', (e) => {
                        e.preventDefault();
                        
                        const project = this.projectMap[projectId];
                        
                        if (project) {
                            this.modal.innerHTML = this.createModalHTML(project);
                            this.modal.style.display = 'flex';
                            
                            // Setup close button
                            const closeBtn = this.modal.querySelector('.close-modal');
                            closeBtn.addEventListener('click', (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                this.modal.style.display = 'none';
                            });
                            
                            // Close on outside click
                            window.onclick = (e) => {
                                if (e.target === this.modal) {
                                    this.modal.style.display = 'none';
                                }
                            };
        
                            // Setup demo button
                            const demoBtn = this.modal.querySelector('.demo-btn');
                            demoBtn.addEventListener('click', (e) => {
                                e.preventDefault();
                                this.showNotification("New updates Soon");
                            });
                            
                            // Add keyboard navigation for modal
                            this.modal.querySelector('.modal-content').focus();
                            this.setupModalKeyboardNavigation();
                        }
                    });
                });
            },
            
            setupModalKeyboardNavigation: function() {
                const focusableElements = this.modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                this.modal.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') {
                        this.modal.style.display = 'none';
                    }
                    
                    if (e.key === 'Tab') {
                        if (e.shiftKey && document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        } else if (!e.shiftKey && document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                });
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
    
    NavbarModule.init();
    SkillsModule.init();
    ProjectsModule.init();
    LazyLoadModule.init();
});