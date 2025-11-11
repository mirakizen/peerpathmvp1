document.addEventListener('DOMContentLoaded', () => {
    const skillTreeRoot = document.getElementById('skill-tree-root');
    let progressData = {};

    const loadProgress = () => {
        const progress = localStorage.getItem('peerPathProgress');
        return progress ? JSON.parse(progress) : {};
    };

    const saveProgress = () => {
        localStorage.setItem('peerPathProgress', JSON.stringify(progressData));
    };

    const createNode = (item, type) => {
        const node = document.createElement('li');
        node.classList.add('tree-node');

        const content = document.createElement('div');
        content.classList.add('node-content');

        if (type === 'task') {
            node.classList.add('task-node-li');
            content.classList.add('task-node');

            const uniqueId = `task-${item.id.replace(/\s|&/g, '-')}`;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.style.display = 'none'; // Hide checkbox
            
            const customCheckbox = document.createElement('span');
            customCheckbox.classList.add('custom-checkbox');

            const label = document.createElement('label');
            label.textContent = `Lvl ${item.level}: ${item.task}`;

            content.appendChild(customCheckbox);
            content.appendChild(label);
            node.appendChild(checkbox); // Keep it for state but don't show it
            
            if (item.completed) {
                content.classList.add('completed');
            }

            content.addEventListener('click', () => {
                item.completed = !item.completed;
                progressData[item.id] = item.completed;
                content.classList.toggle('completed', item.completed);
                saveProgress();
            });

        } else {
            // Category or Subcategory
            const arrow = document.createElement('span');
            arrow.classList.add('arrow');
            arrow.textContent = '▶';

            const name = document.createElement('span');
            name.textContent = item.name || item.category;

            content.appendChild(arrow);
            content.appendChild(name);
            
            const childrenContainer = document.createElement('ul');
            childrenContainer.classList.add('children-container');
            node.appendChild(childrenContainer);
            
            content.addEventListener('click', () => {
                node.classList.toggle('expanded');
            });
        }
        
        node.prepend(content); // Add content to the top of the li
        return node;
    };

    const buildTree = (data, parentElement) => {
        data.forEach(item => {
            let node;
            if (item.category) { // Category level
                node = createNode(item, 'category');
                buildTree(item.subcategories, node.querySelector('.children-container'));
            } else if (item.name) { // Subcategory level
                node = createNode(item, 'subcategory');
                buildTree(item.tasks, node.querySelector('.children-container'));
            } else { // Task level
                node = createNode(item, 'task');
            }
            parentElement.appendChild(node);
        });
    };

    fetch('skills.json')
        .then(response => response.json())
        .then(data => {
            progressData = loadProgress();
            
            // Integrate progress into the initial data
            data.forEach(cat => {
                cat.subcategories.forEach(sub => {
                    sub.tasks.forEach(task => {
                        const taskId = `${cat.category}-${sub.name}-${task.level}`;
                        task.id = taskId; // Assign a unique ID for saving progress
                        task.completed = progressData[taskId] || false;
                    });
                });
            });
            
            skillTreeRoot.innerHTML = ''; // Clear previous tree if any
            buildTree(data, skillTreeRoot);
        })
        .catch(error => console.error('Error loading skill tree data:', error));
});
