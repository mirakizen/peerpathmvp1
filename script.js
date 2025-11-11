document.addEventListener('DOMContentLoaded', () => {
    const skillTreeRoot = document.getElementById('skill-tree-root');
    const mainContent = document.getElementById('main-content');
    const taskDisplay = document.getElementById('task-display');
    const placeholder = mainContent.querySelector('.task-display-placeholder');
    let progressData = {};
    let fullSkillData = [];
    let activeTaskNode = null;

    // --- Fireworks Effect ---
    const canvas = document.getElementById('celebration-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function createParticle(x, y) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        return {
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            size: Math.random() * 3 + 1
        };
    }

    function launchFireworks(x, y) {
        for (let i = 0; i < 100; i++) {
            particles.push(createParticle(x, y));
        }
    }

    function animateFireworks() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach((p, index) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05; // Gravity
            p.alpha -= 0.02;

            if (p.alpha <= 0) {
                particles.splice(index, 1);
            } else {
                ctx.globalAlpha = p.alpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2, false);
                ctx.fillStyle = p.color;
                ctx.fill();
            }
        });
        requestAnimationFrame(animateFireworks);
    }
    animateFireworks();

    // --- Skill Tree Logic ---
    const loadProgress = () => {
        const progress = localStorage.getItem('peerPathProgress');
        return progress ? JSON.parse(progress) : {};
    };

    const saveProgress = () => {
        localStorage.setItem('peerPathProgress', JSON.stringify(progressData));
    };
    
    const updateTaskView = (task) => {
        placeholder.style.display = 'none';
        taskDisplay.style.display = 'block';

        document.getElementById('task-title').textContent = task.task;
        document.getElementById('task-tutorial').textContent = task.tutorial;

        const achievementText = encodeURIComponent(`I just completed 'Lvl ${task.level}: ${task.task}' on PeerPath! #PeerPath #SkillTree`);
        const appUrl = encodeURIComponent('https://peerpathmvp1.vercel.app/');

        document.getElementById('share-twitter').href = `https://twitter.com/intent/tweet?text=${achievementText}&url=${appUrl}`;
        document.getElementById('share-facebook').href = `https://www.facebook.com/sharer/sharer.php?u=${appUrl}&quote=${achievementText}`;
        document.getElementById('share-telegram').href = `https://t.me/share/url?url=${appUrl}&text=${achievementText}`;
    };

    const createNode = (item, type) => {
        const node = document.createElement('li');
        node.classList.add('tree-node');
        const content = document.createElement('div');
        content.classList.add('node-content');

        if (type === 'task') {
            content.classList.add('task-node');
            
            const customCheckbox = document.createElement('span');
            customCheckbox.classList.add('custom-checkbox');

            const label = document.createElement('label');
            label.textContent = `Lvl ${item.level}: ${item.task}`;

            content.appendChild(customCheckbox);
            content.appendChild(label);
            
            if (item.completed) content.classList.add('completed');

            content.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Toggle completion state
                const wasCompleted = item.completed;
                item.completed = !item.completed;
                progressData[item.id] = item.completed;
                content.classList.toggle('completed', item.completed);
                saveProgress();

                // Show tutorial
                updateTaskView(item);

                // Highlight active task
                if (activeTaskNode) activeTaskNode.classList.remove('active-task');
                content.classList.add('active-task');
                activeTaskNode = content;
                
                // Launch fireworks only when task is newly completed
                if (item.completed && !wasCompleted) {
                    const rect = customCheckbox.getBoundingClientRect();
                    launchFireworks(rect.left + rect.width / 2, rect.top + rect.height / 2);
                }
            });
        } else {
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
        
        node.prepend(content);
        return node;
    };

    const buildTree = (data, parentElement) => {
        data.forEach(item => {
            let node;
            if (item.category) {
                node = createNode(item, 'category');
                buildTree(item.subcategories, node.querySelector('.children-container'));
            } else if (item.name) {
                node = createNode(item, 'subcategory');
                buildTree(item.tasks, node.querySelector('.children-container'));
            } else {
                node = createNode(item, 'task');
            }
            parentElement.appendChild(node);
        });
    };

    fetch('skills.json')
        .then(response => response.json())
        .then(data => {
            fullSkillData = data;
            progressData = loadProgress();
            
            fullSkillData.forEach(cat => {
                cat.subcategories.forEach(sub => {
                    sub.tasks.forEach(task => {
                        const taskId = `${cat.category}-${sub.name}-${task.level}`.replace(/\s+/g, '-');
                        task.id = taskId;
                        task.completed = progressData[taskId] || false;
                    });
                });
            });
            
            skillTreeRoot.innerHTML = '';
            buildTree(fullSkillData, skillTreeRoot);
        })
        .catch(error => console.error('Error loading skill tree data:', error));
});
