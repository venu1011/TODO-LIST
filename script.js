// Task class to manage task data
class Task {
    constructor(title, category, priority, dueDate) {
        this.id = Date.now().toString();
        this.title = title;
        this.category = category;
        this.priority = priority;
        this.dueDate = dueDate;
        this.completed = false;
        this.createdAt = new Date();
    }
}

// TodoList class to manage the application
class TodoList {
    constructor() {
        this.tasks = [];
        this.loadTasks();
        this.initializeEventListeners();
        this.initializeDragAndDrop();
        this.updateProgress();
    }

    // Load tasks from localStorage
    loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks).map(task => {
                const newTask = new Task(task.title, task.category, task.priority, task.dueDate);
                newTask.id = task.id;
                newTask.completed = task.completed;
                newTask.createdAt = new Date(task.createdAt);
                return newTask;
            });
            this.renderTasks();
        }
    }

    // Save tasks to localStorage
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
        this.updateProgress();
    }

    // Add a new task
    addTask(title, category, priority, dueDate) {
        const task = new Task(title, category, priority, dueDate);
        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
    }

    // Delete a task
    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.renderTasks();
    }

    // Toggle task completion status
    toggleTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    // Edit a task
    editTask(taskId, newData) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            Object.assign(task, newData);
            this.saveTasks();
            this.renderTasks();
        }
    }

    // Filter tasks based on search and filters
    filterTasks(searchTerm, category, priority) {
        return this.tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = !category || task.category === category;
            const matchesPriority = !priority || task.priority === priority;
            return matchesSearch && matchesCategory && matchesPriority;
        });
    }

    // Update progress bar
    updateProgress() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        document.getElementById('progressBar').style.width = `${progress}%`;
        document.getElementById('progressBar').setAttribute('aria-valuenow', progress);
    }

    // Render tasks to the DOM
    renderTasks(filteredTasks = null) {
        const taskList = document.getElementById('taskList');
        const tasksToRender = filteredTasks || this.tasks;
        
        taskList.innerHTML = tasksToRender.map(task => `
            <div class="task-card ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-2">
                        <input type="checkbox" class="form-check-input" ${task.completed ? 'checked' : ''}>
                        <h5 class="mb-0">${task.title}</h5>
                    </div>
                    <div class="d-flex gap-2">
                        <span class="category-badge">${task.category}</span>
                        <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                        <span class="due-date ${new Date(task.dueDate) < new Date() ? 'overdue' : ''}">
                            ${new Date(task.dueDate).toLocaleDateString()}
                        </span>
                        <button class="btn btn-sm btn-outline-danger delete-task">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-primary edit-task">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners to the newly rendered tasks
        this.initializeTaskEventListeners();
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const icon = document.querySelector('#themeToggle i');
            if (document.body.classList.contains('dark-mode')) {
                icon.classList.replace('fa-moon', 'fa-sun');
                document.querySelector('#themeToggle').textContent = ' Light Mode';
                document.querySelector('#themeToggle').prepend(icon);
            } else {
                icon.classList.replace('fa-sun', 'fa-moon');
                document.querySelector('#themeToggle').textContent = ' Dark Mode';
                document.querySelector('#themeToggle').prepend(icon);
            }
        });

        // Save task button
        document.getElementById('saveTask').addEventListener('click', () => {
            const title = document.getElementById('taskTitle').value;
            const category = document.getElementById('taskCategory').value;
            const priority = document.getElementById('taskPriority').value;
            const dueDate = document.getElementById('taskDueDate').value;

            if (title && category && priority && dueDate) {
                this.addTask(title, category, priority, dueDate);
                bootstrap.Modal.getInstance(document.getElementById('addTaskModal')).hide();
                document.getElementById('taskForm').reset();
            }
        });

        // Search and filter inputs
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        const priorityFilter = document.getElementById('priorityFilter');

        const updateFilteredTasks = () => {
            const searchTerm = searchInput.value;
            const category = categoryFilter.value;
            const priority = priorityFilter.value;
            const filteredTasks = this.filterTasks(searchTerm, category, priority);
            this.renderTasks(filteredTasks);
        };

        searchInput.addEventListener('input', updateFilteredTasks);
        categoryFilter.addEventListener('change', updateFilteredTasks);
        priorityFilter.addEventListener('change', updateFilteredTasks);
    }

    // Initialize task-specific event listeners
    initializeTaskEventListeners() {
        document.querySelectorAll('.task-card').forEach(card => {
            const taskId = card.dataset.id;
            
            // Checkbox toggle
            const checkbox = card.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', () => this.toggleTask(taskId));

            // Delete button
            const deleteBtn = card.querySelector('.delete-task');
            deleteBtn.addEventListener('click', () => this.deleteTask(taskId));

            // Edit button
            const editBtn = card.querySelector('.edit-task');
            editBtn.addEventListener('click', () => {
                const task = this.tasks.find(t => t.id === taskId);
                if (task) {
                    document.getElementById('taskTitle').value = task.title;
                    document.getElementById('taskCategory').value = task.category;
                    document.getElementById('taskPriority').value = task.priority;
                    document.getElementById('taskDueDate').value = task.dueDate;
                    
                    const modal = new bootstrap.Modal(document.getElementById('addTaskModal'));
                    modal.show();

                    // Update save button to edit instead of add
                    const saveBtn = document.getElementById('saveTask');
                    saveBtn.textContent = 'Update Task';
                    saveBtn.onclick = () => {
                        const newData = {
                            title: document.getElementById('taskTitle').value,
                            category: document.getElementById('taskCategory').value,
                            priority: document.getElementById('taskPriority').value,
                            dueDate: document.getElementById('taskDueDate').value
                        };
                        this.editTask(taskId, newData);
                        modal.hide();
                        document.getElementById('taskForm').reset();
                        saveBtn.textContent = 'Save Task';
                        saveBtn.onclick = null;
                    };
                }
            });
        });
    }

    // Initialize drag and drop functionality
    initializeDragAndDrop() {
        const taskList = document.getElementById('taskList');
        new Sortable(taskList, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            onEnd: (evt) => {
                const taskId = evt.item.dataset.id;
                const newIndex = evt.newIndex;
                const task = this.tasks.find(t => t.id === taskId);
                this.tasks = this.tasks.filter(t => t.id !== taskId);
                this.tasks.splice(newIndex, 0, task);
                this.saveTasks();
            }
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.todoList = new TodoList();
}); 