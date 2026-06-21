// =====================================================
// ACADEMIC PLANNER - JAVASCRIPT FUNCTIONALITY
// =====================================================

// Detailed comment block explaining the planner functionality
/*
 * This script handles all interactive features for the academic planner:
 * 1. Add new tasks with title, description, due date, and priority
 * 2. Mark tasks as completed with checkbox toggle
 * 3. Delete individual tasks
 * 4. Filter tasks (all, active, completed)
 * 5. Clear all tasks at once
 * 6. Update statistics (total, completed, pending)
 * 7. Store tasks in browser's local storage for persistence
 */

// =====================================================
// GLOBAL VARIABLES
// =====================================================

// Array to store all tasks in memory
let tasks = [];

// DOM element references for efficiency
const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const taskDesc = document.getElementById('taskDesc');
const taskDue = document.getElementById('taskDue');
const taskPriority = document.getElementById('taskPriority');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const clearAllBtn = document.getElementById('clearAllBtn');
const filterButtons = document.querySelectorAll('.filter-btn');
const dueSoonTasks = document.getElementById('dueSoonTasks');
let currentFilter = 'all'; // Default filter state

// =====================================================
// INITIALIZATION FUNCTION
// =====================================================

// Function that runs when the page loads
function init() {
    // Load tasks from browser storage (if any exist)
    loadTasksFromStorage();
    
    // Display all tasks on page load
    renderTasks();
    
    // Update statistics display
    updateStats();
    
    // Attach event listeners to form and buttons
    attachEventListeners();
}

// =====================================================
// EVENT LISTENER ATTACHMENT
// =====================================================

// Function to attach all event listeners to DOM elements
function attachEventListeners() {
    // Listen for form submission
    taskForm.addEventListener('submit', function(event) {
        // Prevent default form behavior (page reload)
        event.preventDefault();
        
        // Add new task when form is submitted
        addTask();
    });
    
    // Listen for clear all button click
    clearAllBtn.addEventListener('click', function() {
        // Ask user for confirmation before clearing
        if (confirm('Are you sure you want to delete all tasks?')) {
            // Clear all tasks array
            tasks = [];
            
            // Save empty array to storage
            saveTasksToStorage();
            
            // Refresh display
            renderTasks();
            updateStats();
        }
    });
    
    // Loop through all filter buttons
    filterButtons.forEach(button => {
        // Attach click listener to each filter button
        button.addEventListener('click', function() {
            // Get the filter type from button's data attribute
            currentFilter = this.dataset.filter;
            
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Re-render tasks with new filter
            renderTasks();
        });
    });
}

// =====================================================
// ADD TASK FUNCTION
// =====================================================

// Function to add a new task to the array
function addTask() {
    // Get values from form fields
    const title = taskTitle.value.trim();
    const description = taskDesc.value.trim();
    const dueDate = taskDue.value;
    const priority = taskPriority.value;
    
    // Validate that at least title is provided
    if (title === '') {
        // Alert user if title is empty
        alert('Please enter a task title');
        return;
    }
    
    // Create task object with unique ID (timestamp)
    const task = {
        id: Date.now(),                    // Unique identifier
        title: title,                      // Task title
        description: description,          // Task description
        dueDate: dueDate,                  // Due date
        priority: priority,                // Priority level
        completed: false                   // Completion status
    };
    
    // Add task to tasks array
    tasks.push(task);
    
    // Save tasks to browser storage
    saveTasksToStorage();
    
    // Clear form fields for next input
    taskForm.reset();
    
    // Re-render all tasks
    renderTasks();
    
    // Update statistics
    updateStats();
}

// =====================================================
// COMPLETE TASK FUNCTION
// =====================================================

// Function to mark a task as completed or uncompleted
function toggleCompleteTask(taskId) {
    // Find the task with matching ID
    const task = tasks.find(t => t.id === taskId);
    
    // If task exists, toggle its completed status
    if (task) {
        task.completed = !task.completed;
    }
    
    // Save updated tasks to storage
    saveTasksToStorage();
    
    // Re-render tasks
    renderTasks();
    
    // Update statistics
    updateStats();
}

// =====================================================
// DELETE TASK FUNCTION
// =====================================================

// Function to remove a task from the array
function deleteTask(taskId) {
    // Ask user for confirmation before deleting
    if (confirm('Are you sure you want to delete this task?')) {
        // Filter out the task with matching ID, keeping all others
        tasks = tasks.filter(t => t.id !== taskId);
        
        // Save updated tasks to storage
        saveTasksToStorage();
        
        // Re-render tasks
        renderTasks();
        
        // Update statistics
        updateStats();
    }
}

// =====================================================
// RENDER TASKS FUNCTION
// =====================================================

// Function to display tasks on the page based on current filter
function renderTasks() {
    // Clear the task list container
    taskList.innerHTML = '';
    
    // Filter tasks based on current filter setting
    let filteredTasks = tasks;
    
    if (currentFilter === 'active') {
        // Show only incomplete tasks
        filteredTasks = tasks.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        // Show only complete tasks
        filteredTasks = tasks.filter(t => t.completed);
    }
    
    // Check if there are any tasks to display
    if (filteredTasks.length === 0) {
        // Show empty state message
        emptyState.style.display = 'block';
        return;
    } else {
        // Hide empty state message
        emptyState.style.display = 'none';
    }
    
    // Loop through each filtered task
    filteredTasks.forEach(task => {
        // Create list item element
        const li = document.createElement('li');
        
        // Add task-item class for styling
        li.className = 'task-item';
        
        // Add completed class if task is done
        if (task.completed) {
            li.classList.add('completed');
        }
        
        // Format due date for display (if exists)
        const dueDateText = task.dueDate ? 
            new Date(task.dueDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }) : 'No date';

        const deadlineMeta = getDeadlineMeta(task);
        
        // Build HTML content for task item
        li.innerHTML = `
            <div class="task-item-content">
                <div class="task-item-title">${escapeHTML(task.title)}</div>
                ${task.description ? `<p style="color: var(--dark-text); font-size: 0.9rem; margin: 5px 0;">${escapeHTML(task.description)}</p>` : ''}
                <div class="task-item-due">📅 Deadline: ${dueDateText}</div>
                ${deadlineMeta.label ? `<span class="task-status ${deadlineMeta.className}">${deadlineMeta.label}</span>` : ''}
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <span class="task-priority ${task.priority}">${task.priority.toUpperCase()}</span>
                <div class="task-buttons">
                    <button class="task-btn complete-btn" onclick="toggleCompleteTask(${task.id})">
                        ${task.completed ? '✓ Undo' : '✓ Complete'}
                    </button>
                    <button class="task-btn delete-btn" onclick="deleteTask(${task.id})">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
        
        // Add task item to task list
        taskList.appendChild(li);
    });
}

// =====================================================
// UPDATE STATISTICS FUNCTION
// =====================================================

// Function to update the task statistics display
function updateStats() {
    // Count total tasks
    const totalTasks = tasks.length;
    
    // Count completed tasks
    const completedTasks = tasks.filter(t => t.completed).length;
    
    // Calculate pending tasks (total - completed)
    const pendingTasks = totalTasks - completedTasks;
    
    // Update HTML elements with calculated values
    const upcomingTasks = tasks.filter(t => {
        if (!t.dueDate || t.completed) {
            return false;
        }

        const dueDate = new Date(t.dueDate);
        const now = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(now.getDate() + 7);

        return dueDate >= now && dueDate <= sevenDaysFromNow;
    }).length;

    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('pendingTasks').textContent = pendingTasks;
    if (dueSoonTasks) {
        dueSoonTasks.textContent = upcomingTasks;
    }
}

// =====================================================
// LOCAL STORAGE FUNCTIONS
// =====================================================

// Function to save tasks to browser's local storage
function saveTasksToStorage() {
    // Convert tasks array to JSON string
    const tasksJSON = JSON.stringify(tasks);
    
    // Store in browser's local storage with key 'tasks'
    localStorage.setItem('tasks', tasksJSON);
}

// Function to load tasks from browser's local storage
function loadTasksFromStorage() {
    // Get tasks from local storage
    const storedTasks = localStorage.getItem('tasks');
    
    // If tasks exist in storage, parse them back into array
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    } else {
        // If no stored tasks, start with empty array
        tasks = [];
    }
}

// =====================================================
// UTILITY FUNCTION
// =====================================================

// Function to escape HTML special characters for security
// This prevents XSS (cross-site scripting) attacks
function escapeHTML(text) {
    // Create a temporary div element
    const div = document.createElement('div');
    
    // Set text content (automatically escapes HTML)
    div.textContent = text;
    
    // Return the escaped HTML
    return div.innerHTML;
}

function getDeadlineMeta(task) {
    if (!task.dueDate || task.completed) {
        return { label: '', className: '' };
    }

    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const differenceInDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    if (differenceInDays < 0) {
        return { label: 'Overdue', className: 'overdue' };
    }

    if (differenceInDays === 0) {
        return { label: 'Due today', className: 'today' };
    }

    if (differenceInDays <= 7) {
        return { label: 'Due soon', className: 'soon' };
    }

    return { label: '', className: '' };
}

// =====================================================
// RUN INITIALIZATION
// =====================================================

// Call initialization function when page loads
// This event fires when all HTML and CSS are fully loaded
document.addEventListener('DOMContentLoaded', init);
