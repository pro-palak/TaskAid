// TaskManager.js
// import "../../dashboard/get_tasks.php"
/**
 * Represents a single task with all its properties and metadata
 */
class Task {
    constructor(data) {
        // Map database fields to object properties
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

    // Format the due date for display
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

class TaskManager {
    constructor() {
        this.currentTask = null;
        this.tasks = [];
        this.userId = document.body.dataset.userId;
        this.init();
    }

    init() {
        // Initialize DOM elements
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
        // Add a top margin to the side panel to move it down
        this.sidePanel.style.marginTop = '900px'; // Adjust this value as needed
        
        // Add smooth transition for panel toggle
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
                this.showNotification('Task added successfully', 'success');
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
                    // Include any necessary authentication headers
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include' // This ensures cookies are sent with the request
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const tasks = await response.json();
            // Filter tasks for current user
            this.tasks = tasks
                .filter(task => task.user_id === this.userId)
                .map(task => new Task(task));
                
            this.renderTasks();
            
            // Select first incomplete task if none selected
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
        formData.append('user_id', this.userId); // Include user ID in the request

        try {
            const response = await fetch('/taskaid/dashboard/update_task.php', {
                method: 'POST',
                body: formData,
                credentials: 'include' // Ensure cookies are sent
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
                    this.updateProgress();
                }
            }
        } catch (error) {
            console.error('Error:', error);
            this.showNotification('Failed to update task', 'error');
        }
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
            // Create and show modal for adding new task
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
            
            // Select first incomplete task if none selected
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
        
        // Update main task card
        const dueDate = task.formatDueDate();
        this.mainTaskCard.querySelector('.task-deadline').textContent = `Due: ${dueDate}`;
        
        // Highlight selected task in list
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
        
        // Create sections
        const incompleteTasks = this.tasks.filter(task => !task.completed);
        const completedTasks = this.tasks.filter(task => task.completed);

        // Render incomplete tasks
        if (incompleteTasks.length > 0) {
            const section = document.createElement('div');
            section.innerHTML = '<h4>In Progress</h4>';
            incompleteTasks.forEach(task => {
                section.appendChild(this.createTaskElement(task));
            });
            this.taskList.appendChild(section);
        }

        // Render completed tasks
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
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }
}

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});