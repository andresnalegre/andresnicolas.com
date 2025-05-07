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
                
                project.setAttribute('title', `${title} - ${category}`);
                
                if (project.getAttribute('role') === 'link') {
                    project.setAttribute('aria-label', `${title} - ${description} - Category: ${category}`);
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
    
    const ScrollModule = {
        init: function() {
            window.addEventListener('beforeunload', function() {
                sessionStorage.setItem('scrollPosition', window.scrollY);
            });
            
            window.addEventListener('load', function() {
                const scrollPosition = sessionStorage.getItem('scrollPosition') || 0;
                
                window.scrollTo(0, scrollPosition);
                
                setTimeout(function() {
                    window.scrollTo({
                        top: scrollPosition,
                        left: 0,
                        behavior: 'smooth'
                    });
                }, 10);
            });
            
            if ('scrollRestoration' in history) {
                history.scrollRestoration = 'auto';
            }
        }
    };
    
    // Contact Module (from paste-2.txt)
    const ContactModule = {
        contactButton: null,
        modalOverlay: null,
        contactModal: null,
        contactForm: null,
        formStatus: null,
        
        init: function() {
            this.createContactButton();
            this.createContactModal();
            this.setupEventListeners();
            this.loadEmailJS().catch(error => console.warn('Failed to load EmailJS:', error));
        },
        
        createContactButton: function() {
            this.contactButton = document.createElement('div');
            this.contactButton.classList.add('floating-contact-btn');
            this.contactButton.innerHTML = `<svg height="30px" width="30px" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <style type="text/css"> .st0{fill:#ffffff;} </style> <g> <path class="st0" d="M510.678,112.275c-2.308-11.626-7.463-22.265-14.662-31.054c-1.518-1.915-3.104-3.63-4.823-5.345 c-12.755-12.818-30.657-20.814-50.214-20.814H71.021c-19.557,0-37.395,7.996-50.21,20.814c-1.715,1.715-3.301,3.43-4.823,5.345 C8.785,90.009,3.63,100.649,1.386,112.275C0.464,116.762,0,121.399,0,126.087V385.92c0,9.968,2.114,19.55,5.884,28.203 c3.497,8.26,8.653,15.734,14.926,22.001c1.59,1.586,3.169,3.044,4.892,4.494c12.286,10.175,28.145,16.32,45.319,16.32h369.958 c17.18,0,33.108-6.145,45.323-16.384c1.718-1.386,3.305-2.844,4.891-4.43c6.27-6.267,11.425-13.741,14.994-22.001v-0.064 c3.769-8.653,5.812-18.171,5.812-28.138V126.087C512,121.399,511.543,116.762,510.678,112.275z M46.509,101.571 c6.345-6.338,14.866-10.175,24.512-10.175h369.958c9.646,0,18.242,3.837,24.512,10.175c1.122,1.129,2.179,2.387,3.112,3.637 L274.696,274.203c-5.348,4.687-11.954,7.002-18.696,7.002c-6.674,0-13.276-2.315-18.695-7.002L43.472,105.136 C44.33,103.886,45.387,102.7,46.509,101.571z M36.334,385.92V142.735L176.658,265.15L36.405,387.435 C36.334,386.971,36.334,386.449,36.334,385.92z M440.979,420.597H71.021c-6.281,0-12.158-1.651-17.174-4.552l147.978-128.959 l13.815,12.018c11.561,10.046,26.028,15.134,40.36,15.134c14.406,0,28.872-5.088,40.432-15.134l13.808-12.018l147.92,128.959 C453.137,418.946,447.26,420.597,440.979,420.597z M475.666,385.92c0,0.529,0,1.051-0.068,1.515L335.346,265.221L475.666,142.8 V385.92z"></path> </g> </g></svg>`;
            document.body.appendChild(this.contactButton);
        },
        
        createContactModal: function() {
            this.modalOverlay = document.createElement('div');
            this.modalOverlay.classList.add('modal-overlay');
            this.modalOverlay.id = 'contact-modal-overlay';
            this.modalOverlay.style.display = 'none';
            document.body.appendChild(this.modalOverlay);
            
            this.contactModal = document.createElement('div');
            this.contactModal.classList.add('contact-modal');
            this.contactModal.innerHTML = `
                <div class="modal-header">
                    <h3>Get in Touch</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="contact-form">
                        <div class="form-group">
                            <label for="name">Name <span class="required">*</span></label>
                            <input type="text" id="name" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email <span class="required">*</span></label>
                            <input type="email" id="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="message">Message <span class="required">*</span></label>
                            <textarea id="message" name="message" rows="5" required></textarea>
                        </div>
                        <div id="form-status"></div>
                        <div class="form-group">
                            <button type="submit" class="submit-btn">Send Message</button>
                        </div>
                    </form>
                </div>
            `;
            this.modalOverlay.appendChild(this.contactModal);
        },
        
        setupEventListeners: function() {
            // Contact button click event
            this.contactButton.addEventListener('click', () => {
                this.modalOverlay.style.display = 'flex';
                setTimeout(() => {
                    this.modalOverlay.classList.add('active');
                }, 10);
                document.body.style.overflow = 'hidden';
            });
            
            // Close button click event
            const closeBtn = this.contactModal.querySelector('.close-modal');
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeContactModal();
            });
            
            // Close when clicking outside modal
            this.modalOverlay.addEventListener('click', (event) => {
                if (event.target === this.modalOverlay) {
                    this.closeContactModal();
                }
            });
            
            // Setup form submission
            this.contactForm = document.getElementById('contact-form');
            this.formStatus = document.getElementById('form-status');
            
            if (this.contactForm) {
                this.contactForm.addEventListener('submit', this.handleFormSubmit.bind(this));
            }
        },
        
        closeContactModal: function() {
            this.modalOverlay.classList.remove('active');
            setTimeout(() => {
                this.modalOverlay.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        },
        
        loadEmailJS: function() {
            return new Promise((resolve, reject) => {
                if (document.querySelector('script[src*="emailjs"]')) {
                    const oldScripts = document.querySelectorAll('script[src*="emailjs"]');
                    oldScripts.forEach(script => script.remove());
                }
                
                const script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
                
                script.onload = () => {
                    emailjs.init({
                        publicKey: "snWDTS8oEMk_09bNP"
                    });
                    resolve();
                };
                
                script.onerror = (error) => {
                    reject(error);
                };
                
                document.head.appendChild(script);
            });
        },
        
        showMessagePopup: function(message, type) {
            const popup = document.createElement('div');
            popup.classList.add('message-popup', type);
            popup.textContent = message;
            document.body.appendChild(popup);
            
            setTimeout(() => {
                popup.remove();
            }, 3000);
        },
        
        handleFormSubmit: async function(event) {
            event.preventDefault();
            
            const nameField = document.getElementById('name');
            const emailField = document.getElementById('email');
            const messageField = document.getElementById('message');
            
            if (!nameField.value.trim()) {
                this.formStatus.textContent = 'Please enter your name.';
                this.formStatus.style.color = 'red';
                nameField.focus();
                return;
            }
            
            if (!emailField.value.trim()) {
                this.formStatus.textContent = 'Please enter your email.';
                this.formStatus.style.color = 'red';
                emailField.focus();
                return;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailField.value.trim())) {
                this.formStatus.textContent = 'Please enter a valid email address.';
                this.formStatus.style.color = 'red';
                emailField.focus();
                return;
            }
            
            if (!messageField.value.trim()) {
                this.formStatus.textContent = 'Please enter your message.';
                this.formStatus.style.color = 'red';
                messageField.focus();
                return;
            }
            
            const submitBtn = this.contactForm.querySelector('.submit-btn');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            this.formStatus.textContent = '';
            
            try {
                if (typeof emailjs === 'undefined') {
                    await this.loadEmailJS();
                }
                
                const name = nameField.value.trim();
                const email = emailField.value.trim();
                const message = messageField.value.trim();
                const currentDate = new Date().toLocaleString();
                
                const templateParams = {
                    name: name,
                    email: email,
                    message: message,
                    time: currentDate,
                    reply_to: email
                };
                
                await emailjs.send(
                    'service_b1cceuk',
                    'template_o7f6pwp',
                    templateParams
                );
                
                this.showMessagePopup('Message sent successfully!', 'success');
                this.contactForm.reset();
                
                setTimeout(() => {
                    this.closeContactModal();
                }, 2000);
            } catch (error) {
                this.showMessagePopup('Failed to send message. Please try again.', 'error');
            } finally {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
        }
    };
    
    // Initialize all modules
    NavbarModule.init();
    SkillsModule.init();
    ProjectsModule.init();
    LazyLoadModule.init();
    ScrollModule.init();
    ContactModule.init();
});