// Task management
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// DOM Elements
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const themeToggle = document.getElementById('themeToggle');
const filterButtons = document.querySelectorAll('.filter-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    updateTaskCount();
    setupEventListeners();
    loadTheme();
});

// Event Listeners
function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('change', toggleTheme);
    
    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.dataset.filter;
            loadTasks();
        });
    });

    // Enter key for adding tasks
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
}

// Task Functions
function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === '') return;

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false
    };

    tasks.push(task);
    saveTasks();
    loadTasks();
    taskInput.value = '';
    updateTaskCount();
}

function deleteTask(id) {
    const taskElement = document.querySelector(`[data-id="${id}"]`);
    taskElement.classList.add('deleting');
    
    setTimeout(() => {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        loadTasks();
        updateTaskCount();
    }, 300);
}

function toggleComplete(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveTasks();
    loadTasks();
    updateTaskCount();
}

function editTask(id, newText) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, text: newText };
        }
        return task;
    });
    saveTasks();
    loadTasks();
}

function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    loadTasks();
    updateTaskCount();
}

// UI Functions
function loadTasks() {
    taskList.innerHTML = '';
    
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.draggable = true;
        li.dataset.id = task.id;
        
        li.innerHTML = `
            <div class="task-content" ondblclick="startEditing(${task.id})">
                <span class="${task.completed ? 'completed' : ''}">${task.text}</span>
            </div>
            <div class="task-actions">
                <button class="edit-btn" onclick="startEditing(${task.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteTask(${task.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        taskList.appendChild(li);
    });

    setupDragAndDrop();
}

function startEditing(id) {
    const task = tasks.find(t => t.id === id);
    const taskElement = document.querySelector(`[data-id="${id}"] .task-content`);
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = task.text;
    input.className = 'edit-input';
    
    taskElement.innerHTML = '';
    taskElement.appendChild(input);
    input.focus();
    
    const saveEdit = () => {
        const newText = input.value.trim();
        if (newText) {
            editTask(id, newText);
        }
    };
    
    input.addEventListener('blur', saveEdit);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        }
    });
}

function updateTaskCount() {
    const activeTasks = tasks.filter(task => !task.completed).length;
    taskCount.textContent = `${activeTasks} ${activeTasks === 1 ? 'task' : 'tasks'} remaining`;
}

// Drag and Drop
function setupDragAndDrop() {
    const taskItems = document.querySelectorAll('.task-item');
    
    taskItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);
    });
}

function handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
}

function handleDragOver(e) {
    e.preventDefault();
    const draggingItem = document.querySelector('.dragging');
    const siblings = [...document.querySelectorAll('.task-item:not(.dragging)')];
    
    const nextSibling = siblings.find(sibling => {
        const box = sibling.getBoundingClientRect();
        return e.clientY < box.top + box.height / 2;
    });
    
    taskList.insertBefore(draggingItem, nextSibling);
}

function handleDrop(e) {
    e.preventDefault();
    const draggedId = parseInt(e.dataTransfer.getData('text/plain'));
    const newIndex = Array.from(taskList.children).indexOf(document.querySelector('.dragging'));
    
    const draggedTask = tasks.find(task => task.id === draggedId);
    tasks = tasks.filter(task => task.id !== draggedId);
    tasks.splice(newIndex, 0, draggedTask);
    
    saveTasks();
    loadTasks();
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

// Theme Functions
function toggleTheme() {
    const isDark = themeToggle.checked;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    themeToggle.checked = savedTheme === 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// Storage Functions
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
} 