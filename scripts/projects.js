// Logical system for dynamic project filtering and category handling

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