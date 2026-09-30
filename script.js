// State variables
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'today';

// DOM Elements
const todoInput = document.getElementById('todo-input');
const todoDate = document.getElementById('todo-date');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const yearlyGrid = document.getElementById('yearly-grid');

// Set default date to today
const today = new Date().toISOString().split('T')[0];
todoDate.value = today;

// Event Listeners
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Update active class
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        // Update filter state and re-render
        currentFilter = e.target.getAttribute('data-filter');
        renderTodos();
    });
});

// Functions
function addTodo() {
    const text = todoInput.value.trim();
    const date = todoDate.value;

    if (!text || !date) return alert('Please enter a task and select a date.');

    const newTodo = {
        id: Date.now().toString(),
        text: text,
        date: date,
        completed: false
    };

    todos.push(newTodo);
    todoInput.value = '';
    
    saveAndRender();
}

function toggleTodo(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    saveAndRender();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveAndRender();
}

function getFilteredTodos() {
    const currentDate = new Date();
    const todayString = currentDate.toISOString().split('T')[0];
    const currentMonthString = todayString.slice(0, 7); // "YYYY-MM"

    return todos.filter(todo => {
        if (currentFilter === 'today') {
            return todo.date === todayString;
        } else if (currentFilter === 'month') {
            return todo.date.startsWith(currentMonthString);
        } else {
            return true; // 'all' filter
        }
    });
}

function renderTodos() {
    todoList.innerHTML = '';
    const filteredTodos = getFilteredTodos();

    if (filteredTodos.length === 0) {
        todoList.innerHTML = `<p style="text-align:center; color:#6b7280; padding: 1rem 0;">No tasks for this view.</p>`;
        return;
    }

    // Sort: uncompleted first, then by date
    filteredTodos.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo('${todo.id}')">
            <div class="todo-content">
                <span class="todo-text">${todo.text}</span>
                <span class="todo-date-badge">📅 ${todo.date}</span>
            </div>
            <button class="delete-btn" onclick="deleteTodo('${todo.id}')">Delete</button>
        `;
        
        todoList.appendChild(li);
    });
}

function renderYearlyActivity() {
    yearlyGrid.innerHTML = '';
    const currentYear = new Date().getFullYear();
    document.getElementById('current-year').innerText = currentYear;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyCounts = new Array(12).fill(0);

    // Calculate completed tasks per month for the current year
    todos.forEach(todo => {
        if (todo.completed && todo.date.startsWith(currentYear.toString())) {
            const monthIndex = parseInt(todo.date.split('-')[1]) - 1;
            monthlyCounts[monthIndex]++;
        }
    });

    // Generate grid blocks
    months.forEach((month, index) => {
        const count = monthlyCounts[index];
        const block = document.createElement('div');
        block.className = 'month-block';
        block.title = `${count} tasks completed in ${month}`;
        
        // Determine color level based on completed tasks
        if (count > 0 && count <= 5) block.classList.add('level-1');
        else if (count > 5 && count <= 10) block.classList.add('level-2');
        else if (count > 10 && count <= 20) block.classList.add('level-3');
        else if (count > 20) block.classList.add('level-4');

        block.innerHTML = `
            <span class="month-name">${month}</span>
            <span class="month-count">${count > 0 ? count : '-'}</span>
        `;
        
        yearlyGrid.appendChild(block);
    });
}

function saveAndRender() {
    localStorage.setItem('todos', JSON.stringify(todos));
    renderTodos();
    renderYearlyActivity();
}

// Initial Render
renderTodos();
renderYearlyActivity();