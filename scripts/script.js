const navLinks = document.querySelectorAll('.navbar a[href^="#"]');
const offsets = {
    "#Home": 50,
    "#about": -30,
    "#experience": 90,
    "#education": 150,
    "#skills-modal": 100,
    "#certifications": 80,
    "#projects": 120
};

const getOffsetForLink = (href) => offsets[href] || 90;

navLinks.forEach(link => {
    link.addEventListener('click', event => {
        event.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            const offset = getOffsetForLink(targetId);
            const targetPosition = targetSection.getBoundingClientRect().top + window.scrollY - offset;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

const educationSection = document.querySelector('#education');
let positionX = 0;

function animateBackground() {
    positionX -= 0.2;

    if (positionX <= -100) {
        positionX = 0;
    }

    educationSection.style.backgroundPosition = `${positionX}% 0`;
    requestAnimationFrame(animateBackground);
}

animateBackground();

document.addEventListener("DOMContentLoaded", () => {
    const moreBtn = document.querySelector(".more-btn");
    const skillsTable = document.querySelector(".skills-table");
    const languageSkills = document.querySelector(".language-skills");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const skillBars = document.querySelectorAll(".skill-bar");
    const skillsSection = document.getElementById("skills-modal");
    const startYear = 2014;
    const currentYear = 2024;
    const XP_PER_YEAR = 1000;
    const skillRows = [];
    let lessBtn;

    const initializeSkills = () => {
        const allSkillRows = document.querySelectorAll(".skills-table .skill-row");

        allSkillRows.forEach((row) => {
            const bar = row.querySelector(".skill-bar");
            const dataYears = bar.dataset.years.split(",").map(Number);
            const totalYears = dataYears.length;
            const totalXP = totalYears * XP_PER_YEAR;
            const skillXP = row.querySelector(".skill-xp");
            skillXP.textContent = `${totalXP} XP`;
            skillRows.push({ element: row, xp: totalXP });
        });

        skillRows.sort((a, b) => b.xp - a.xp);
    };

    const toggleCategory = (category) => {
        if (category === "languages") {
            skillsTable.style.display = "none";
            languageSkills.style.display = "block";
            moreBtn.style.display = "none";
        } else if (category === "most-progress") {
            skillsTable.style.display = "block";
            languageSkills.style.display = "none";
            displayTopSkills(); 
        }
    };

    filterButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            filterButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            const category = btn.dataset.category;
            toggleCategory(category);
        });
    });

    const displayTopSkills = () => {
        const topSkills = skillRows.slice(0, 3);
        const remainingSkills = skillRows.slice(3);
        skillsTable.innerHTML = "";

        topSkills.forEach((row) => {
            row.element.style.display = "flex";
            skillsTable.appendChild(row.element);
        });

        moreBtn.style.display = "block";
        skillsTable.appendChild(moreBtn);

        remainingSkills.forEach((row) => {
            row.element.style.display = "none";
            skillsTable.appendChild(row.element);
        });
    };

    const showAllSkills = () => {
        const allSkillRows = document.querySelectorAll(".skills-table .skill-row");
        allSkillRows.forEach((row) => {
            row.style.display = "flex";
        });

        moreBtn.style.display = "none";
        addLessButton();
    };

    const addLessButton = () => {
        if (!lessBtn) {
            lessBtn = document.createElement("button");
            lessBtn.textContent = "Show Less Skills";
            lessBtn.className = "less-btn";
            lessBtn.style.marginTop = "15px";
            lessBtn.style.width = "100%";
            lessBtn.style.padding = "12px";
            lessBtn.style.borderRadius = "30px";
            lessBtn.style.fontWeight = "bold";
            lessBtn.style.fontSize = "1rem";
            lessBtn.style.backgroundColor = "#002040";
            lessBtn.style.color = "white";
            lessBtn.style.border = "none";
            lessBtn.style.cursor = "pointer";

            lessBtn.addEventListener("click", () => {
                displayTopSkills();
                lessBtn.remove();
                scrollToSkills();
            });
        }

        skillsTable.appendChild(lessBtn);
    };

    const scrollToSkills = () => {
        const offset = 90;
        const skillsTop = skillsSection.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({
            top: skillsTop,
            behavior: "smooth",
        });
    };

    skillBars.forEach((bar) => {
        const dataYears = bar.dataset.years.split(",").map(Number);
        const container = bar.closest(".skill-bar-container");
        const scaleContainer = document.createElement("div");
        scaleContainer.style.position = "absolute";
        scaleContainer.style.height = "100%";
        scaleContainer.style.width = "100%";
        scaleContainer.style.top = "0";
        scaleContainer.style.left = "0";
        scaleContainer.style.display = "flex";
        scaleContainer.style.justifyContent = "space-between";

        for (let year = startYear; year <= currentYear; year++) {
            const yearElement = document.createElement("div");
            yearElement.style.flex = "1";
            yearElement.style.position = "relative";
            yearElement.style.height = "100%";

            const dashedLine = document.createElement("div");
            dashedLine.style.borderLeft = "1px dashed black";
            dashedLine.style.position = "absolute";
            dashedLine.style.height = "100%";
            dashedLine.style.top = "0";
            dashedLine.style.left = "0";

            yearElement.appendChild(dashedLine);
            if (dataYears.includes(year) && dataYears.includes(year + 1)) {
                yearElement.style.background = "#28a745";
            }

            const yearLabel = document.createElement("span");
            yearLabel.style.position = "absolute";
            yearLabel.style.top = "-20px";
            yearLabel.style.left = "50%";
            yearLabel.style.transform = "translateX(-50%)";
            yearLabel.style.fontSize = "0.8rem";
            yearLabel.style.color = "#868e96";
            yearLabel.textContent = year;

            yearElement.appendChild(yearLabel);
            scaleContainer.appendChild(yearElement);
        }

        container.appendChild(scaleContainer);
    });

    initializeSkills();
    displayTopSkills();
    moreBtn.addEventListener("click", () => {
        showAllSkills();
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const projects = document.querySelectorAll(".project");
    const filterSelect = document.getElementById("category-filter");

    const categoryCount = {};
    projects.forEach(project => {
        const category = project.dataset.category;
        categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    Object.entries(categoryCount).forEach(([category, count]) => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = `${category} (${count})`;
        filterSelect.appendChild(option);
    });

    filterSelect.addEventListener("change", () => {
        const selectedCategory = filterSelect.value;
        projects.forEach(project => {
            const projectCategory = project.dataset.category;
            if (selectedCategory === "all" || projectCategory === selectedCategory) {
                project.style.display = "block";
            } else {
                project.style.display = "none";
            }
        });
    });
});