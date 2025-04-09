document.addEventListener('DOMContentLoaded', function() {
    // Global
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
        },
        
        toggleMenu: function() {
            DOM.hamburger.classList.toggle('active');
            DOM.navLinks.classList.toggle('active');
            DOM.body.classList.toggle('menu-open');
        },
        
        closeMenu: function() {
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
                DOM.moreBtn.addEventListener('click', this.showAllSkills.bind(this));
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
            
            if (DOM.moreBtn) DOM.moreBtn.style.display = 'none';
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
                events: {
                    click: () => {
                        this.displayTopSkills();
                        this.scrollToSkills();
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
        },
        
        setupFilterButtons: function() {
            if (!DOM.filterButtons.length) return;
            
            const filterContainer = DOM.filterButtons[0].parentNode;
            if (!filterContainer) return;
            
            filterContainer.addEventListener('click', e => {
                const btn = e.target.closest('.filter-btn');
                if (!btn) return;
                
                DOM.filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const category = btn.dataset.category;
                this.toggleCategory(category);
            });
        },
        
        toggleCategory: function(category) {
            if (!DOM.skillsTable || !DOM.languageSkills) return;
            
            if (category === 'languages') {
                DOM.skillsTable.style.display = 'none';
                DOM.languageSkills.style.display = 'block';
                if (DOM.moreBtn) DOM.moreBtn.style.display = 'none';
                this.removeLessButton();
            } else if (category === 'most-progress') {
                DOM.skillsTable.style.display = 'block';
                DOM.languageSkills.style.display = 'none';
                
                if (this.skillRows.length > 0) {
                    this.displayTopSkills();
                }
            }
        },
        
        setupSkillBars: function() {
            if (!DOM.skillBars.length) return;
            
            DOM.skillBars.forEach(bar => {
                const dataYears = bar.dataset.years ? bar.dataset.years.split(',').map(Number) : [];
                const container = bar.closest('.skill-bar-container');
                if (!container) return;
                
                const fragment = document.createDocumentFragment();
                const scaleContainer = Util.createElement('div', {
                    cssText: 'position: absolute; height: 100%; width: 100%; top: 0; left: 0; display: flex; justify-content: space-between;'
                });
                
                for (let year = CONFIG.startYear; year <= CONFIG.currentYear; year++) {
                    const dashedLine = Util.createElement('div', {
                        cssText: 'border-left: 1px dashed black; position: absolute; height: 100%; top: 0; left: 0;'
                    });
                    
                    const yearLabel = Util.createElement('span', {
                        text: year,
                        cssText: 'position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 0.8rem; color: #868e96;'
                    });
                    
                    const yearElement = Util.createElement('div', {
                        cssText: `flex: 1; position: relative; height: 100%; ${dataYears.includes(year) ? 'background: #28a745;' : ''}`,
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
            
            DOM.filterSelect.addEventListener('change', () => {
                const selectedCategory = DOM.filterSelect.value;
                
                DOM.projects.forEach(project => {
                    const projectCategory = project.dataset.category;
                    project.style.display = selectedCategory === 'all' || projectCategory === selectedCategory ? 'block' : 'none';
                });
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