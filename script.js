document.addEventListener('DOMContentLoaded', () => {
    const skillTreeContainer = document.getElementById('skill-tree-container');

    const createSkillTree = (data) => {
        data.forEach(categoryData => {
            const category = document.createElement('div');
            category.classList.add('category');

            const categoryHeader = document.createElement('div');
            categoryHeader.classList.add('category-header');
            categoryHeader.innerHTML = `<span>${categoryData.category}</span><span class="arrow">▼</span>`;
            category.appendChild(categoryHeader);

            const categoryContent = document.createElement('div');
            categoryContent.classList.add('category-content');
            category.appendChild(categoryContent);

            categoryData.subcategories.forEach(subcategoryData => {
                const subcategory = document.createElement('div');
                subcategory.classList.add('subcategory');

                const subcategoryHeader = document.createElement('div');
                subcategoryHeader.classList.add('subcategory-header');
                subcategoryHeader.innerHTML = `<span>${subcategoryData.name}</span><span class="arrow">▶</span>`;
                subcategory.appendChild(subcategoryHeader);

                const tasksContainer = document.createElement('div');
                tasksContainer.classList.add('tasks');
                subcategory.appendChild(tasksContainer);

                subcategoryData.tasks.forEach(taskData => {
                    const task = document.createElement('div');
                    task.classList.add('task');

                    const checkboxId = `${categoryData.category}-${subcategoryData.name}-${taskData.level}`.replace(/\s+/g, '-');
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = checkboxId;
                    task.appendChild(checkbox);

                    const label = document.createElement('label');
                    label.htmlFor = checkboxId;
                    label.textContent = `Lvl ${taskData.level}: ${taskData.task}`;
                    task.appendChild(label);

                    tasksContainer.appendChild(task);
                });

                categoryContent.appendChild(subcategory);

                subcategoryHeader.addEventListener('click', () => {
                    const tasks = subcategory.querySelector('.tasks');
                    const arrow = subcategoryHeader.querySelector('.arrow');
                    if (tasks.style.maxHeight) {
                        tasks.style.maxHeight = null;
                        arrow.style.transform = 'rotate(0deg)';
                    } else {
                        tasks.style.maxHeight = tasks.scrollHeight + "px";
                        arrow.style.transform = 'rotate(90deg)';
                    }
                });
            });

            skillTreeContainer.appendChild(category);

            categoryHeader.addEventListener('click', () => {
                const content = category.querySelector('.category-content');
                const arrow = categoryHeader.querySelector('.arrow');
                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                    arrow.style.transform = 'rotate(0deg)';
                } else {
                    content.style.maxHeight = content.scrollHeight + "px";
                    arrow.style.transform = 'rotate(180deg)';
                }
            });
        });
    };

    fetch('skills.json')
        .then(response => response.json())
        .then(data => createSkillTree(data))
        .catch(error => console.error('Error loading skill tree data:', error));
});
