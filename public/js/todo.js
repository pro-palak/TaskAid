// TaskManager.js
// import "../../dashboard/get_tasks.php"

class Task {
    constructor(data) {
        this.id = data.id;
        this.userId = data.user_id;
        this.title = data.title;
        this.description = data.description || '';
        this.dueDate = new Date(data.due_date);
        this.estimatedTime = data.estimated_time;
        this.completed = data.completed === '1' || data.completed === 1;
        this.createdAt = new Date(data.created_at);
        this.updatedAt = new Date(data.updated_at);
    }

    formatDueDate() {
        return this.dueDate.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }
}

class WhiteNoisePlayer {
    constructor() {
        this.audio = document.getElementById('whiteNoiseAudio');
        this.toggleButton = document.getElementById('noiseToggle');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.isPlaying = false;
        
        if (!this.audio || !this.toggleButton || !this.volumeSlider) {
            console.error('White noise player elements not found!');
            return;
        }

        this.init();
    }

    init() {
        this.audio.volume = this.volumeSlider.value / 100;

        console.log('Audio element loaded:', this.audio.readyState);
        console.log('Audio source:', this.audio.currentSrc);

        this.toggleButton.addEventListener('click', () => {
            console.log('Toggle button clicked');
            if (this.isPlaying) {
                this.stop();
            } else {
                this.play();
            }
        });

        this.volumeSlider.addEventListener('input', (e) => {
            this.audio.volume = e.target.value / 100;
            console.log('Volume changed to:', this.audio.volume);
        });

        this.audio.addEventListener('error', (e) => {
            console.error('Audio loading error:', e);
        });

        this.audio.addEventListener('canplaythrough', () => {
            console.log('Audio can play through');
        });
    }

    async play() {
        try {
            console.log('Attempting to play audio...');
            await this.audio.play();
            this.isPlaying = true;
            this.toggleButton.classList.add('playing');
            this.toggleButton.querySelector('.noise-status').textContent = 'Stop';
            console.log('Audio playing successfully');
        } catch (error) {
            console.error('Error playing audio:', error);
            if (error.name === 'NotAllowedError') {
                alert('Please interact with the page first before playing audio.');
            }
        }
    }

    stop() {
        console.log('Stopping audio...');
        this.audio.pause();
        this.audio.currentTime = 0;
        this.isPlaying = false;
        this.toggleButton.classList.remove('playing');
        this.toggleButton.querySelector('.noise-status').textContent = 'Play';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const whiteNoisePlayer = new WhiteNoisePlayer();
    
});

class RewardSystem {
    constructor() {
        this.points = parseInt(localStorage.getItem('userPoints')) || 0;
        this.rewardLevels = [
            { points: 100, reward: "5% off at Walmart" },
            { points: 200, reward: "10% off at Target" },
            { points: 300, reward: "$5 Starbucks Gift Card" },
            { points: 500, reward: "15% off at Whole Foods" },
            { points: 1000, reward: "$20 Amazon Gift Card" }
        ];
        this.initializeRewardBox();
    }

    initializeRewardBox() {
        let rewardBox = document.querySelector('.reward-box');
        if (!rewardBox) {
            const mainTaskContainer = document.querySelector('.task-main');
            rewardBox = document.createElement('div');
            rewardBox.className = 'reward-box';
            mainTaskContainer.appendChild(rewardBox);
        }
        this.updateRewardDisplay();
    }

    calculateTaskPoints(task) {
        let points = 10;
        
        const now = new Date();
        if (now < task.dueDate) {
            points += 5;
        }
        
        if (task.estimatedTime >= 60) {
            points += 10;
        } else if (task.estimatedTime >= 30) {
            points += 5;
        }
        
        return points;
    }

    updateRewardDisplay() {
        const rewardBox = document.querySelector('.reward-box');
        const nextReward = this.getNextReward(this.points);
        const progress = this.calculateProgress();
        
        rewardBox.innerHTML = `
            <div class="reward-header">
                <h3>Reward Progress</h3>
                <div class="current-points">
                    <span class="points-icon">⭐</span>
                    <span class="points-value">${this.points} points</span>
                </div>
            </div>
            
            <div class="reward-progress">
                <div class="progress-info">
                    <span class="current-level">Current: ${this.points} points</span>
                    <span class="next-level">Next: ${nextReward.points} points</span>
                </div>
                <div class="reward-progress-bar">
                    <div class="reward-progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="next-reward-info">
                    <h4>Next Reward:</h4>
                    <p>${nextReward.reward}</p>
                    <p class="points-needed">${nextReward.points - this.points} points needed</p>
                </div>
            </div>

            <div class="available-rewards">
                <h4>Available Rewards:</h4>
                <div class="rewards-list">
                    ${this.getAvailableRewards().map(reward => `
                        <div class="reward-item">
                            <span class="reward-name">${reward.reward}</span>
                            <button class="claim-btn" data-points="${reward.points}">Claim</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        const claimButtons = rewardBox.querySelectorAll('.claim-btn');
        claimButtons.forEach(button => {
            button.addEventListener('click', () => this.claimReward(button.dataset.points));
        });
    }

    calculateProgress() {
        const nextReward = this.getNextReward(this.points);
        const previousThreshold = this.getPreviousThreshold(this.points);
        const total = nextReward.points - previousThreshold;
        const current = this.points - previousThreshold;
        return (current / total) * 100;
    }

    getPreviousThreshold(points) {
        const previousReward = [...this.rewardLevels]
            .reverse()
            .find(level => level.points <= points);
        return previousReward ? previousReward.points : 0;
    }

    getNextReward(points) {
        return this.rewardLevels.find(level => level.points > points) || this.rewardLevels[this.rewardLevels.length - 1];
    }

    getAvailableRewards() {
        return this.rewardLevels.filter(level => level.points <= this.points);
    }

    addPoints(points) {
        this.points += points;
        localStorage.setItem('userPoints', this.points.toString());
        this.updateRewardDisplay();
        
        const previousRewards = this.getAvailableRewards(this.points - points);
        const currentRewards = this.getAvailableRewards(this.points);
        
        if (currentRewards.length > previousRewards.length) {
            const newRewards = currentRewards.slice(previousRewards.length);
            newRewards.forEach(reward => {
                this.showNewRewardNotification(reward);
            });
        }
    }

    getPoints() {
        return this.points;
    }

    showNewRewardNotification(reward) {
        const notification = document.createElement('div');
        notification.className = 'notification reward-unlock';
        notification.innerHTML = `
            <div class="reward-message">
                <span class="reward-icon">🎁</span>
                <div>
                    <h4>New Reward Unlocked!</h4>
                    <p>${reward.reward}</p>
                </div>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    claimReward(points) {
        alert(`Reward claimed! -${points} points`);
        this.points -= points;
        this.updateRewardDisplay();
    }
}


class TaskManager {
    constructor() {
        this.currentTask = null;
        this.tasks = [];
        this.userId = document.body.dataset.userId;
        this.rewardSystem = new RewardSystem();
        this.lastProgress = 0;
        this.init();
    }

    init() {
        this.taskNotes = document.getElementById('taskNotes');
        this.taskList = document.querySelector('.task-list');
        this.taskTitle = document.getElementById('taskTitle');
        this.progressBar = document.querySelector('.progress');
        this.progressText = document.querySelector('.progress-text');
        this.mainTaskCard = document.querySelector('.task-card');
        this.quickAddBtn = document.querySelector('.quick-add-btn');
        this.panelToggle = document.getElementById('panelToggle');
        this.sidePanel = document.querySelector('.panel-content');

        this.setupPanelToggle();
        this.setupEventListeners();
        this.setupQuickAdd();
        this.loadTasks();
    }
    initializeSidePanel() {
        this.sidePanel.style.marginTop = '900px';
        
        this.sidePanel.style.transition = 'transform 0.3s ease-in-out';
    }

    setupPanelToggle() {
        console.log("Setup panel toggle fucntion loded")
        this.panelToggle.addEventListener('click', () => {
            console.log("panel toggle clicked");
            this.sidePanel.classList.toggle('active');
        });
    }

    async addNewTask(form) {
        const formData = new FormData();
        formData.append('action', 'add');
        formData.append('title', form.title.value);
        formData.append('description', form.description.value);
        formData.append('due_date', form.dueDate.value);
        formData.append('estimated_time', form.estimatedTime.value);
        formData.append('user_id', this.userId);

        try {
            const response = await fetch('update_task.php', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const result = await response.json();
            
            if (result.success) {
                const newTaskPoints = 5;
                this.rewardSystem.addPoints(newTaskPoints);
                
                const totalPoints = this.rewardSystem.getPoints();
                this.showNotification(`Task added successfully! +${newTaskPoints} points (Total: ${totalPoints})`, 'success');
                
                await this.loadTasks();
            } else {
                throw new Error(result.message || 'Failed to add task');
            }
        } catch (error) {
            console.error('Error adding task:', error);
            this.showNotification('Error adding task', 'error');
        }
    }


    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    async loadTasks() {
        try {
            const response = await fetch('get_tasks.php', {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const tasks = await response.json();
            this.tasks = tasks
                .filter(task => task.user_id === this.userId)
                .map(task => new Task(task));
                
            this.renderTasks();
            
            if (!this.currentTask && this.tasks.length > 0) {
                const firstIncomplete = this.tasks.find(task => !task.completed);
                if (firstIncomplete) {
                    this.selectTask(firstIncomplete.id);
                }
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.showNotification('Error loading tasks', 'error');
        }
    }

    async saveNotes(taskId, notes) {
        const formData = new FormData();
        formData.append('action', 'update');
        formData.append('task_id', taskId);
        formData.append('description', notes);
        formData.append('user_id', this.userId);

        try {
            const response = await fetch('/taskaid/dashboard/update_task.php', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            
            console.log(response.json)
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Notes saved', 'success');
            } else {
                throw new Error(result.message || 'Failed to save notes');
            }
        } catch (error) {
            console.error('Error saving notes:', error);
            this.showNotification('Error saving notes', 'error');
        }
    }

    async updateTaskCompletion(taskId, isChecked) {
        const formData = new FormData();
        formData.append('action', 'update');
        formData.append('task_id', taskId);
        formData.append('completed', isChecked ? '1' : '0');

        try {
            const response = await fetch('update_task.php', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            const result = await response.json();
            
            if (result.success) {
                const task = this.tasks.find(t => t.id === taskId);
                if (task) {
                    task.completed = isChecked;
                    
                    if (isChecked) {
                        const points = this.calculateTaskPoints(task);
                        this.rewardSystem.addPoints(points);
                        
                        this.showPointsNotification(points, task);
                    }
                    
                    this.updateProgress();
                }
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Failed to update task', 'error');
        }
    }

    showPointsNotification(points, task) {
        const totalPoints = this.rewardSystem.getPoints();
        let message = `✨ Task completed! +${points} points\n`;
        message += `• Base completion: +10 points\n`;
        
        if (new Date() < task.dueDate) {
            message += `• Early completion bonus: +5 points\n`;
        }
        
        if (task.estimatedTime >= 60) {
            message += `• Long task bonus: +10 points\n`;
        } else if (task.estimatedTime >= 30) {
            message += `• Medium task bonus: +5 points\n`;
        }
        
        message += `\nTotal points: ${totalPoints}`;
        this.showNotification(message, 'success');
    }


    setupEventListeners() {
        this.taskList.addEventListener('change', async (e) => {
            if (e.target.type === 'checkbox') {
                const taskItem = e.target.closest('.task-item');
                const taskId = taskItem.dataset.taskId;
                await this.updateTaskCompletion(taskId, e.target.checked);
            }
        });

        this.taskNotes.addEventListener('input', this.debounce(() => {
            if (this.currentTask) {
                this.saveNotes(this.currentTask.id, this.taskNotes.value);
            }
        }, 500));
    }

    setupQuickAdd() {
        this.quickAddBtn.addEventListener('click', () => {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <h3>Add New Task</h3>
                    <form id="addTaskForm">
                        <div class="form-group">
                            <label for="title">Task Title</label>
                            <input type="text" id="title" required>
                        </div>
                        <div class="form-group">
                            <label for="dueDate">Due Date</label>
                            <input type="datetime-local" id="dueDate" required>
                        </div>
                        <div class="form-group">
                            <label for="estimatedTime">Estimated Time (minutes)</label>
                            <input type="number" id="estimatedTime" min="1" value="30">
                        </div>
                        <div class="form-group">
                            <label for="description">Description</label>
                            <textarea id="description"></textarea>
                        </div>
                        <div class="modal-buttons">
                            <button type="submit" class="btn-primary">Add Task</button>
                            <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        </div>
                    </form>
                </div>
            `;
            document.body.appendChild(modal);

            // Handle form submission
            document.getElementById('addTaskForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.addNewTask(e.target);
                modal.remove();
            });
        });
    }

    async loadTasks() {
        try {
            const response = await fetch('/taskaid/dashboard/get_tasks.php');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const tasks = await response.json();
            this.tasks = tasks.map(task => new Task(task));
            this.renderTasks();
            
            if (!this.currentTask && this.tasks.length > 0) {
                const firstIncomplete = this.tasks.find(task => !task.completed);
                if (firstIncomplete) {
                    this.selectTask(firstIncomplete.id);
                }
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.showNotification('Error loading tasks', 'error');
        }
    }

    selectTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        this.currentTask = task;
        this.taskTitle.textContent = task.title;
        this.taskNotes.value = task.description || '';
        
        const dueDate = task.formatDueDate();
        this.mainTaskCard.querySelector('.task-deadline').textContent = `Due: ${dueDate}`;
        
        const taskItems = this.taskList.querySelectorAll('.task-item');
        taskItems.forEach(item => {
            item.classList.toggle('selected', item.dataset.taskId === taskId);
        });
    }

    createTaskElement(task) {
        const taskEl = document.createElement('div');
        taskEl.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskEl.dataset.taskId = task.id;
        
        taskEl.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-content">
                <span class="task-title">${task.title}</span>
                <span class="task-due">Due: ${task.formatDueDate()}</span>
                ${task.description ? '<span class="has-notes">📝</span>' : ''}
            </div>
        `;

        return taskEl;
    }

    renderTasks() {
        this.taskList.innerHTML = '';
        
        const incompleteTasks = this.tasks.filter(task => !task.completed);
        const completedTasks = this.tasks.filter(task => task.completed);

        if (incompleteTasks.length > 0) {
            const section = document.createElement('div');
            section.innerHTML = '<h4>In Progress</h4>';
            incompleteTasks.forEach(task => {
                section.appendChild(this.createTaskElement(task));
            });
            this.taskList.appendChild(section);
        }

        if (completedTasks.length > 0) {
            const section = document.createElement('div');
            section.innerHTML = '<h4>Completed</h4>';
            completedTasks.forEach(task => {
                section.appendChild(this.createTaskElement(task));
            });
            this.taskList.appendChild(section);
        }

        this.updateProgress();
    }

    updateProgress() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const percentage = total ? (completed / total) * 100 : 0;
        
        this.progressBar.style.width = `${percentage}%`;
        this.progressText.textContent = `${completed} of ${total} tasks completed`;

        this.checkProgressMilestones(percentage);
        
        this.lastProgress = percentage;
    }

    checkProgressMilestones(currentPercentage) {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        
        if (completed === total && total > 0) {
            const bonusPoints = 50;
            this.rewardSystem.addPoints(bonusPoints);
            const totalPoints = this.rewardSystem.getPoints();
            this.showNotification(`🎉 All tasks completed! +${bonusPoints} bonus points! (Total: ${totalPoints})`, 'success');
        }
        
        const currentMilestone = Math.floor(currentPercentage / 25);
        const previousMilestone = Math.floor(this.lastProgress / 25);
        
        if (currentMilestone > previousMilestone) {
            const milestonePoints = 20;
            this.rewardSystem.addPoints(milestonePoints);
            const totalPoints = this.rewardSystem.getPoints();
            this.showNotification(`🌟 ${currentMilestone * 25}% milestone reached! +${milestonePoints} points! (Total: ${totalPoints})`, 'success');
        }
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                ${message}
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    async updateTaskCompletion(taskId, isChecked) {
        const formData = new FormData();
        formData.append('action', 'update');
        formData.append('task_id', taskId);
        formData.append('completed', isChecked ? '1' : '0');

        try {
            const response = await fetch('update_task.php', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            const result = await response.json();
            
            if (result.success) {
                const task = this.tasks.find(t => t.id === taskId);
                if (task) {
                    task.completed = isChecked;
                    if (isChecked) {
                        const basePoints = 10;
                        
                        let timeBonus = 0;
                        const now = new Date();
                        if (now < task.dueDate) {
                            timeBonus = 5;
                        }
                        
                        const totalPoints = basePoints + timeBonus;
                        this.rewardSystem.addPoints(totalPoints);
                        
                        this.showNotification(`✨ Task completed! +${totalPoints} points!`, 'success');
                    }
                    this.updateProgress();
                }
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Failed to update task', 'error');
        }
    }

    showRewardNotification(points) {
        const notification = document.createElement('div');
        notification.className = 'notification reward';
        notification.innerHTML = `
            <div class="reward-message">
                <span class="reward-icon">🎉</span>
                <div>
                    <h4>Congratulations!</h4>
                    <p>You earned ${points} points!</p>
                </div>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    updateRewardDisplay() {
        const rewardBox = document.querySelector('.reward-box');
        const nextReward = this.rewardSystem.getNextReward(this.userPoints);
        const availableRewards = this.rewardSystem.getAvailableRewards(this.userPoints);
        
        rewardBox.innerHTML = `
            <h3>Your Rewards</h3>
            <div class="points-display">
                <span class="points-icon">⭐</span>
                <span class="points-value">${this.userPoints} points</span>
            </div>
            ${nextReward ? `
                <div class="next-reward">
                    <h4>Next Reward:</h4>
                    <p>${nextReward.reward}</p>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${(this.userPoints / nextReward.points) * 100}%"></div>
                    </div>
                    <p class="points-needed">${nextReward.points - this.userPoints} points needed</p>
                </div>
            ` : ''}
            ${availableRewards.length > 0 ? `
                <div class="available-rewards">
                    <h4>Available Rewards:</h4>
                    <ul>
                        ${availableRewards.map(reward => `
                            <li>
                                <span class="reward-name">${reward.reward}</span>
                                <button class="claim-btn" data-points="${reward.points}">Claim</button>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
        `;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});