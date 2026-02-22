

let todoList = JSON.parse(localStorage.getItem('todos')) || [];
let searchText = '';
let activeCategory = 'All';
let editIndex = null;

renderTodoList();

/* EVENT LISTENERS */
const nameInput = document.querySelector('.js-name-input');
const dateInput = document.querySelector('.js-dueDate-input');

document.querySelector('.add-todo-button').addEventListener('click', addTodo);
document.querySelector('.search-input').addEventListener('input', e => {
    searchText = e.target.value.toLowerCase();
    renderTodoList();
});

document.querySelectorAll('.category-filters button').forEach(button => {
    button.addEventListener('click', function() {
        activeCategory = this.dataset.filter;
        document.querySelectorAll('.category-filters button').forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        renderTodoList();
    });
});

document.querySelector('[data-filter="All"]').classList.add('active');

const toggleBtn = document.querySelector('.dark-mode-toggle');
applyTheme(localStorage.getItem('theme') || 'light');
toggleBtn.addEventListener('click', () => {
    const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(newTheme);
    toggleBtn.classList.add('rotate');
    setTimeout(() => toggleBtn.classList.remove('rotate'), 400);
});

/* ENTER KEY SUPPORT */
[nameInput, dateInput].forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
});

/* FUNCTIONS */
function applyTheme(theme) {
    document.body.classList.toggle('dark', theme === 'dark');
    toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', theme);
}

function saveToStorage() { localStorage.setItem('todos', JSON.stringify(todoList)); }

function renderTodoList() {
    todoList.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    const today = new Date().toISOString().split('T')[0];

    let filtered = todoList.filter(todo => todo.name.toLowerCase().includes(searchText));
    if (activeCategory !== 'All') filtered = filtered.filter(todo => todo.category === activeCategory);

    let html = '';
    filtered.forEach((todo, index) => {
        const isOverdue = todo.dueDate < today && !todo.completed;
        html += `
            <div class="todo-row ${isOverdue ? 'overdue' : ''}">
                <div class="todo-name ${todo.completed ? 'completed' : ''}">
                    ${todo.name}
                    <div class="todo-category">${todo.category}</div>
                </div>
                <div class="todo-date">${todo.dueDate}</div>
                <div class="todo-actions">
                    <button class="complete-button" data-index="${index}">✓</button>
                    <button class="edit-todo-button" data-index="${index}">✎</button>
                    <button class="delete-todo-button" data-index="${index}">Delete</button>
                </div>
            </div>
        `;
    });

    document.querySelector('.js-todo-list').innerHTML = html;
    updateDashboard(filtered);
    attachEvents(filtered);
}

function attachEvents(filtered) {
    document.querySelectorAll('.delete-todo-button').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.dataset.index;
            const realIndex = todoList.indexOf(filtered[index]);
            todoList.splice(realIndex, 1);
            saveToStorage();
            renderTodoList();
        });
    });

    document.querySelectorAll('.complete-button').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.dataset.index;
            const realIndex = todoList.indexOf(filtered[index]);
            todoList[realIndex].completed = !todoList[realIndex].completed;
            saveToStorage();
            renderTodoList();
        });
    });

    document.querySelectorAll('.edit-todo-button').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.dataset.index;
            const realIndex = todoList.indexOf(filtered[index]);
            const todo = todoList[realIndex];

            nameInput.value = todo.name;
            dateInput.value = todo.dueDate;
            document.querySelector('.js-category-select').value = todo.category;

            editIndex = realIndex;
            document.querySelector('.add-todo-button').textContent = 'Update';
            nameInput.focus();
        });
    });
}

function updateDashboard() {
    const total = todoList.length;
    const completed = todoList.filter(t => t.completed).length;
    const overdue = todoList.filter(t => t.dueDate < new Date().toISOString().split('T')[0] && !t.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    const categoryCounts = { Work: 0, Study: 0, Personal: 0 };
    todoList.forEach(t => categoryCounts[t.category]++);

    document.querySelector('.dashboard').innerHTML = `
        <div class="dash-card">
            <div class="dash-row"><span>📊 Total</span><span class="dash-number">${total}</span></div>
            <div class="dash-row"><span>✅ Completed</span><span class="dash-number success">${completed}</span></div>
            <div class="dash-row"><span>⏰ Overdue</span><span class="dash-number danger">${overdue}</span></div>
            <div class="progress-container"><div class="progress-bar" style="width:${percentage}%"></div></div>
            <div class="percentage-text">${percentage}% Completed</div>
            <div class="dash-divider"></div>
            <div class="dash-row"><span>💼 Work</span><span class="dash-number">${categoryCounts.Work}</span></div>
            <div class="dash-row"><span>📖 Study</span><span class="dash-number">${categoryCounts.Study}</span></div>
            <div class="dash-row"><span>🔒 Personal</span><span class="dash-number">${categoryCounts.Personal}</span></div>
        </div>
    `;

    animateNumbers();
}

function animateNumbers() {
    document.querySelectorAll('.dash-number').forEach(el => {
        const finalValue = parseInt(el.textContent);
        let current = 0;
        const increment = Math.ceil(finalValue / 15);
        const counter = setInterval(() => {
            current += increment;
            if (current >= finalValue) {
                el.textContent = finalValue;
                clearInterval(counter);
            } else { el.textContent = current; }
        }, 20);
    });
}

function addTodo() {
    const dateInput = document.querySelector('.js-dueDate-input');
    const categorySelect = document.querySelector('.js-category-select');

    const name = nameInput.value.trim();
    const date = dateInput.value;
    const category = categorySelect.value;

    if (!name || !date) { alert('Please fill all fields'); return; }

    if (editIndex !== null) {
        todoList[editIndex] = { ...todoList[editIndex], name, dueDate: date, category };
        editIndex = null;
        document.querySelector('.add-todo-button').textContent = 'Add';
    } else {
        todoList.push({ name, dueDate: date, category, completed: false });
    }

    nameInput.value = '';
    dateInput.value = '';
    saveToStorage();
    renderTodoList();
}