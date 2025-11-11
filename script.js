document.addEventListener('DOMContentLoaded', () => {
    const skillTreeRoot = document.getElementById('skill-tree-root');
    let skillData = {};

    // Load progress from localStorage
    const loadProgress = () => {
        const progress = localStorage.getItem('peerPathProgress');
        return progress ? JSON.parse(progress) : {};
    };

    // Save progress to localStorage
    const saveProgress = () => {
        localStorage.setItem('peerPathProgress', JSON.stringify(skillData));
    };

    const createNode = (data, type) => {
        const node = document.createElement('div');
        node.classList.add('tree-node');

        const content = document.createElement('div');
        content.classList.add('node-content');
        content.textContent = data.name || data.category || data.task;
        node.appendChild(content);

        if (type === 'task') {
            content.innerHTML = ''; // Clear text, we'll build custom content
            content.classList.add('task-node');

            const uniqueId = `task-${data.id.replace(/\s|&/g, '-')}`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = uniqueId;
            checkbox.checked = data.completed;
            
            const customCheckbox = document.createElement('span');
            customCheckbox.classList.add('custom-checkbox');

            const label = document.createElement('label');
            label.htmlFor = uniqueId;
            label.textContent = `Lvl ${data.level}: ${data.task}`;
            
            content.appendChild(checkbox);
            content.appendChild(customCheckbox);
            content.appendChild(label);
            
            if(data.completed) {
                 content.classList.add('completed');
            }

            checkbox.addEventListener('change', () => {
                data.completed = checkbox.checked;
                content.classList.toggle('completed', checkbox.checked);
                saveProgress();
            });
            
            content.addEventListener('click', (e) => {
                // Allow clicking the whole area to toggle the checkbox
                if(e.target.tagName !== 'INPUT') {
                    checkbox.checked = !checkbox.checked;
                    // Manually trigger change event
                    checkbox.dispatchEvent(new Event('change'));
                }
            });

        } else {
            const childrenContainer = document.createElement('div');
            childrenContainer.classList.add('children-container');
            node.appendChild(childrenContainer);

            content.addEventListener('click', () => {
                node.classList.toggle('expanded');
            });
        }
        
        return node;
    };

    const buildTree = (data, parentElement) => {
        data.forEach(item => {
            if (item.category) { // Category level
                const categoryNode = createNode(item, 'category');
                parentElement.appendChild(categoryNode);
                buildTree(item.subcategories, categoryNode.querySelector('.children-container'));
            } else if (item.name) { // Subcategory level
                const subcategoryNode = createNode(item, 'subcategory');
                parentElement.appendChild(subcategoryNode);
                buildTree(item.tasks, subcategoryNode.querySelector('.children-container'));
            } else { // Task level
                const taskNode = createNode(item, 'task');
                parentElement.appendChild(taskNode);
            }
        });
    };

    fetch('skills.json')
        .then(response => response.json())
        .then(data => {
            const progress = loadProgress();
            // Simple merge of progress into data
            data.forEach(cat => {
                cat.subcategories.forEach(sub => {
                    sub.tasks.forEach(task => {
                        const taskId = `${cat.category}-${sub.name}-${task.level}`;
                        task.id = taskId; // Assign a unique ID
                        if (progress[taskId]) {
                            task.completed = true;
                        } else {
                            task.completed = false;
                        }
                    });
                });
            });
            // Store a reference to the data with progress for saving later
            const flatData = {};
            data.forEach(cat => cat.subcategories.forEach(sub => sub.tasks.forEach(task => flatData[task.id] = task)));
            
            // This is a simplified progress saving mechanism.
            // For a real app, you'd want a more robust way to map progress to tasks.
            const progressSaver = new Proxy(flatData, {
                set(target, property, value) {
                    target[property] = value;
                    const completedTasks = {};
                    for (const id in target) {
                        if (target[id].completed) {
                            completedTasks[id] = true;
                        }
                    }
                    localStorage.setItem('peerPathProgress', JSON.stringify(completedTasks));
                    return true;
                }
            });
            // Re-assign skillData to be the proxy
            skillData = progressSaver;
            
            buildTree(data, skillTreeRoot);
        })
        .catch(error => console.error('Error loading skill tree data:', error));
});
