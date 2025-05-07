const projects = [
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
];

function createModalHTML(project) {
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
}

function createModal() {
    const modal = document.createElement('div');
    modal.className = 'project-modal';
    modal.id = 'project-modal';
    document.body.appendChild(modal);
    return modal;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'message-popup info';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function populateFilter() {
    const filterSelect = document.getElementById('category-filter');
    const categories = new Set();
    
    projects.forEach(project => {
        categories.add(project.category);
    });
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filterSelect.appendChild(option);
    });
}

function filterProjects() {
    const filterSelect = document.getElementById('category-filter');
    const selectedCategory = filterSelect.value;
    const projectElements = document.querySelectorAll('.project');
    
    projectElements.forEach(project => {
        const category = project.getAttribute('data-category');
        
        if (selectedCategory === 'all' || category === selectedCategory) {
            project.style.display = 'flex';
        } else {
            project.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const modal = createModal();
    const projectElements = document.querySelectorAll('.project');
    
    const projectMap = {};
    projects.forEach(project => {
        projectMap[project.id] = project;
    });
    
    projectElements.forEach(element => {
        const projectId = element.getAttribute('data-id');
        
        element.addEventListener('click', (e) => {
            e.preventDefault();
            
            const project = projectMap[projectId];
            
            if (project) {
                modal.innerHTML = createModalHTML(project);
                modal.style.display = 'flex';
                
                const closeBtn = modal.querySelector('.close-modal');
                closeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    modal.style.display = 'none';
                });
                
                window.onclick = function(e) {
                    if (e.target === modal) {
                        modal.style.display = 'none';
                    }
                };

                const demoBtn = modal.querySelector('.demo-btn');
                demoBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    showNotification("New updates Soon");
                });
            }
        });
    });
    
    populateFilter();
    
    const filterSelect = document.getElementById('category-filter');
    filterSelect.addEventListener('change', filterProjects);
});