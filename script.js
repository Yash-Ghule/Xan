// This function runs as soon as the HTML page is loaded
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. GET ALL OUR HTML ELEMENTS ---
    // ...(unchanged)...
    const pages = document.querySelectorAll('.page');
    const navButtons = document.querySelectorAll('.nav-btn');
    const preloader = document.getElementById('preloader');
    const root = document.documentElement; 
    const homeTitle = document.getElementById('home-title'); 
    const homeTaskList = document.getElementById('home-task-list');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const scoreCircle = document.getElementById('score-circle'); 
    const scorePercent = document.getElementById('score-percent'); 
    const scoreNote = document.getElementById('score-note');     
    const addTaskBtnMain = document.getElementById('add-task-btn-main');
    const taskListPage = document.getElementById('task-list-page');
    const clearDataBtn = document.getElementById('clear-data-btn'); 
    const notificationsBtn = document.getElementById('notifications-btn'); 
    const historyList = document.getElementById('history-list');
    const addTaskModal = document.getElementById('add-task-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const modalSaveBtn = document.getElementById('modal-save-btn');
    const taskNameInput = document.getElementById('task-name-input');
    const taskDateInput = document.getElementById('task-date-input');
    const taskTimeInput = document.getElementById('task-time-input');


    // --- 2. THE "BRAIN" - APP'S DATA ---
    // ...(unchanged)...
    const STORAGE_KEY = 'myAccountabilityAppDB';
    let currentlyEditingTaskId = null; 
    let showingYesterdayReport = false; 
    let swRegistration = null; 
    let db = { tasks: [], history: [], lastReportDate: null };


    // --- 3. CORE FUNCTIONS ---

    // ===== DATA FUNCTIONS =====
    // ...(unchanged)...
    function getTodayString() {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    function getYesterdayString() {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const year = yesterday.getFullYear();
        const month = (yesterday.getMonth() + 1).toString().padStart(2, '0');
        const day = yesterday.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
        console.log("Data saved:", db);
    }
    function loadData() {
        const data = localStorage.getItem(STORAGE_KEY);
        let defaultDb = { tasks: [], history: [], lastReportDate: null };
        if (data) {
            const loadedDb = JSON.parse(data);
            db = { ...defaultDb, ...loadedDb };
            console.log("Data loaded:", db);
        } else {
            db = defaultDb;
            console.log("No saved data found. Starting fresh.");
        }
    }


    // ===== UI (RENDERING) FUNCTIONS =====
    // ...(unchanged)...
     function renderAll() {
        console.log("--- Rendering All ---");
        renderTaskPage();
        renderTrackPage(); 
        if (!showingYesterdayReport) {
            renderHomePage();
        }
        feather.replace();
        addDeleteListeners();
        addEditListeners();
        addCheckboxListeners(); 
    }
     function renderTaskPage() {
        taskListPage.innerHTML = '';
        const todayString = getTodayString();
        const tasksByDate = {};
        db.tasks.sort((a, b) => {
            if (a.date < b.date) return -1; if (a.date > b.date) return 1;
            if (a.time < b.time) return -1; if (a.time > b.time) return 1;
            return 0;
        });
        db.tasks.forEach(task => {
            if (!tasksByDate[task.date]) tasksByDate[task.date] = [];
            tasksByDate[task.date].push(task);
        });
        // const sortedDates = Object.keys(tasksByDate);
        const sortedDates = Object.keys(tasksByDate).sort((a, b) => b.localeCompare(a)); // Sort newest date first
        if (sortedDates.length === 0) taskListPage.innerHTML = '<p style="text-align:center; opacity: 0.5;">No tasks planned yet.</p>';
        sortedDates.forEach(date => {
            const dateHeader = document.createElement('h3');
            const [y, m, d] = date.split('-');
            dateHeader.textContent = `${d}/${m}/${y.slice(2)}`;
            if (date === todayString) dateHeader.textContent += " (Today)";
            taskListPage.appendChild(dateHeader);
            const divider = document.createElement('hr');
            taskListPage.appendChild(divider);
            tasksByDate[date].forEach(task => {
                taskListPage.appendChild(createTaskElement(task, 'task'));
            });
        });
    }
     function renderTrackPage() {
        historyList.innerHTML = '';
        if (db.history.length === 0) {
            historyList.innerHTML = '<p style="text-align:center; opacity: 0.5;">No history... yet.</p>'; return;
        }
        db.history.sort((a, b) => b.date.localeCompare(a.date));
        db.history.forEach(report => {
            const item = document.createElement('div');
            item.className = 'history-item'; item.setAttribute('data-date', report.date); 
            const [y, m, d] = report.date.split('-'); const displayDate = `${d}/${m}/${y.slice(2)}`;
            item.innerHTML = `<span>${report.score}%</span> <span>${displayDate}</span>`;
            historyList.appendChild(item);
        });
        addHistoryListeners();
    }
     function renderHomePage() {
        homeTitle.textContent = 'Today'; homeTaskList.innerHTML = ''; 
        const todayString = getTodayString();
        const todayTasks = db.tasks.filter(task => task.date === todayString);
        if (todayTasks.length > 0) {
            todayTasks.forEach(task => { homeTaskList.appendChild(createTaskElement(task, 'home')); });
        }
        updateScore(); showingYesterdayReport = false;
    }
     function displayReportOnHome(report) {
        console.log("Displaying Report on Home Screen");
        const [y, m, d] = report.date.split('-'); homeTitle.textContent = `Report: ${d}/${m}/${y.slice(2)}`;
        renderScore(report.score, false); 
        homeTaskList.innerHTML = ''; 
        if (report.incompleteTasks.length > 0) {
            const list = document.createElement('ul'); list.className = 'incomplete-task-list';
            report.incompleteTasks.forEach(taskName => {
                const item = document.createElement('li'); item.textContent = taskName; list.appendChild(item);
            });
            homeTaskList.appendChild(list);
        } else {
            homeTaskList.innerHTML = '<p style="text-align:center; opacity: 0.5;">You completed everything!</p>';
        }
        showingYesterdayReport = true;
    }
     function createTaskElement(task, page) {
        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskItem.setAttribute('data-task-id', task.id);
        let deadlineTime = '';
        if (task.time) {
            const [hour, minute] = task.time.split(':'); const h = parseInt(hour); const ampm = h >= 12 ? 'pm' : 'am';
            const displayHour = h % 12 === 0 ? 12 : h % 12; deadlineTime = `${displayHour}${minute !== '00' ? `:${minute}` : ''}${ampm}`;
        }
        let actionButtonsHTML = '';
        if (page === 'task') {
            actionButtonsHTML = `<div class="task-item-actions"><i class="edit-btn" data-feather="edit-2"></i><i class="delete-btn" data-feather="trash-2"></i></div>`;
        }
        taskItem.innerHTML = `<div class="task-details"><label class="checkbox-container"><input type="checkbox" ${task.completed ? 'checked' : ''}><span class="checkmark"></span><span class="task-name">${task.name}</span></label></div><span class="task-deadline">${deadlineTime}</span>${actionButtonsHTML}`;
        return taskItem;
    }

    // ===== SCORE & CHECKBOX FUNCTIONS =====
    // ...(unchanged)...
     function updateScore() {
        if (showingYesterdayReport) return; 
        const todayString = getTodayString(); const todayTasks = db.tasks.filter(task => task.date === todayString);
        if (todayTasks.length === 0) { renderScore(0, true); return; }
        const completedTasks = todayTasks.filter(task => task.completed);
        const percentage = Math.round((completedTasks.length / todayTasks.length) * 100); renderScore(percentage, false);
    }
     function renderScore(percentage, noTasks) {
        let note = ''; let color = 'var(--red)'; 
        if (noTasks) { percentage = 0; note = 'No tasks yet. Plan your battle!'; color = 'var(--grey-color)'; } 
        else if (percentage === 100) { note = 'All Done!'; color = 'var(--green)'; } 
        else if (percentage >= 80) { note = 'Great work'; color = 'var(--green)'; } 
        else if (percentage >= 60) { note = 'Keep working'; color = 'var(--yellow)'; } 
        else if (percentage >= 40) { note = 'Barely Average'; color = 'var(--red)'; } 
        else if (percentage >= 10) { note = 'Disappointing Idiot'; color = 'var(--red)'; } 
        else { note = 'Wasted'; color = 'var(--red)'; }
        scorePercent.textContent = percentage; scoreNote.textContent = note; root.style.setProperty('--score-color', color);
    }

    // ===== Other Core Functions =====
    // ...(unchanged)...
    function showPage(pageId) {
        pages.forEach(page => page.classList.remove('active'));
        const pageToShow = document.getElementById(pageId); if (pageToShow) pageToShow.classList.add('active');
        navButtons.forEach(btn => {
            btn.classList.remove('active'); if (btn.dataset.page === pageId) btn.classList.add('active');
        });
    }
    function toggleAddTaskModal(show, taskToEdit = null) {
        if (show) {
            if (taskToEdit) {
                modalTitle.textContent = 'Edit Task'; currentlyEditingTaskId = taskToEdit.id;
                taskNameInput.value = taskToEdit.name; taskDateInput.value = taskToEdit.date; taskTimeInput.value = taskToEdit.time || '';
            } else {
                modalTitle.textContent = 'Add New Task'; currentlyEditingTaskId = null;
                taskNameInput.value = ''; taskDateInput.value = getTodayString(); taskTimeInput.value = '';
            }
            addTaskModal.classList.add('active');
        } else {
            addTaskModal.classList.remove('active'); currentlyEditingTaskId = null;
        }
    }


    // --- 4. EVENT LISTENERS (Making buttons work) ---
    // ...(mostly unchanged)...
    navButtons.forEach(btn => { btn.addEventListener('click', () => { showPage(btn.dataset.page); }); });
    addTaskBtnMain.addEventListener('click', () => { toggleAddTaskModal(true, null); });
    clearDataBtn.addEventListener('click', () => { if (confirm('ARE YOU SURE?\nThis will delete all tasks and history permanently.')) { localStorage.removeItem(STORAGE_KEY); location.reload(); } });
    modalCancelBtn.addEventListener('click', () => { toggleAddTaskModal(false); });
    modalSaveBtn.addEventListener('click', () => {
        const taskName = taskNameInput.value; const taskDate = taskDateInput.value; const taskTime = taskTimeInput.value;
        if (taskName.trim() === '' || taskDate.trim() === '') { alert('Please enter at least a task name and a date.'); return; }
        if (showingYesterdayReport) { renderHomePage(); }
        let taskToUpdate = null; 
        if (currentlyEditingTaskId !== null) {
            taskToUpdate = db.tasks.find(t => t.id === currentlyEditingTaskId);
            if (taskToUpdate) {
                cancelNotifications(taskToUpdate.id); 
                taskToUpdate.name = taskName; taskToUpdate.date = taskDate; taskToUpdate.time = taskTime || null;
            }
        } else {
            taskToUpdate = { id: Date.now(), name: taskName, date: taskDate, time: taskTime || null, completed: false };
            db.tasks.push(taskToUpdate);
        }
        saveData(); renderAll(); updateScore(); toggleAddTaskModal(false);
        if (taskToUpdate.time) { scheduleNotifications(taskToUpdate); }
    });
    themeToggleBtn.addEventListener('click', () => { document.body.classList.toggle('dark-mode'); });
    notificationsBtn.addEventListener('click', () => {
        Notification.requestPermission().then(permission => {
            updateNotificationButton(); 
            if (permission === 'granted') { console.log("Notification permission granted."); } 
            else { console.log("Notification permission denied."); }
        });
    });

    // ===== Listeners for Edit, Delete, Checkbox =====
    // ...(unchanged)...
    function addDeleteListeners() { document.querySelectorAll('.delete-btn').forEach(btn => { btn.onclick = (e) => { const taskItem = e.target.closest('.task-item'); const taskId = parseInt(taskItem.dataset.taskId); if (confirm('Are you sure you want to delete this task?')) { db.tasks = db.tasks.filter(task => task.id !== taskId); saveData(); renderAll(); updateScore(); cancelNotifications(taskId); } }; }); }
    function addEditListeners() { document.querySelectorAll('.edit-btn').forEach(btn => { btn.onclick = (e) => { const taskItem = e.target.closest('.task-item'); const taskId = parseInt(taskItem.dataset.taskId); const taskToEdit = db.tasks.find(task => task.id === taskId); if (taskToEdit) { toggleAddTaskModal(true, taskToEdit); } }; }); }
    function addCheckboxListeners() { document.querySelectorAll('.checkbox-container input[type="checkbox"]').forEach(box => { box.onchange = (e) => { if (showingYesterdayReport) { renderHomePage(); } const taskItem = e.target.closest('.task-item'); const taskId = parseInt(taskItem.dataset.taskId); const isChecked = e.target.checked; const task = db.tasks.find(t => t.id === taskId); if (task) { task.completed = isChecked; } saveData(); renderAll(); updateScore(); if (isChecked) { cancelNotifications(taskId); } }; }); }
    function addHistoryListeners() { document.querySelectorAll('.history-item').forEach(item => { item.onclick = (e) => { const item = e.target.closest('.history-item'); const date = item.dataset.date; const report = db.history.find(r => r.date === date); if (report) { displayReportOnHome(report); showPage('page-home'); } }; }); }
    
    // --- 5. NOTIFICATION FUNCTIONS ---

    /**
     * UPDATED: scheduleNotifications
     * Now waits briefly if SW is not immediately active.
     */
    async function scheduleNotifications(task) {
        // Check 1: Permission
        if (Notification.permission !== 'granted') {
            console.log("Cannot schedule: Permission not granted.");
            updateNotificationButton(); // Make sure button is correct color
            return;
        }
        
        // Check 2: Service Worker Registration
        if (!swRegistration) {
             console.log("Cannot schedule: SW Registration not found.");
             return;
        }

        // Check 3: Is the Service Worker *active*?
        if (swRegistration.active) {
            // SW is active, send the message immediately
            console.log("SW active. Sending 'schedule' message now for task:", task.name);
            swRegistration.active.postMessage({ type: 'schedule', task: task });
        } else {
            // SW might still be activating, wait a moment and try again
            console.warn("SW not active yet. Waiting 1 second...");
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

            if (swRegistration.active) {
                 console.log("SW is now active after delay. Sending 'schedule' message for task:", task.name);
                 swRegistration.active.postMessage({ type: 'schedule', task: task });
            } else {
                 console.error("SW failed to activate after delay. Cannot schedule notification.");
            }
        }
    }

    /**
     * UPDATED: cancelNotifications
     * Also checks if SW is active.
     */
    function cancelNotifications(taskId) {
        if (swRegistration && swRegistration.active) {
            console.log("Sending 'cancel' message to SW for task:", taskId);
            swRegistration.active.postMessage({ type: 'cancel', taskId: taskId });
        } else {
            console.warn("Cannot cancel notification: SW not active.");
        }
    }

    function updateNotificationButton() {
        if (Notification.permission === 'granted') {
            notificationsBtn.classList.add('active');
        } else {
            notificationsBtn.classList.remove('active');
        }
    }


    // --- 6. APP INITIALIZATION (What happens on start) ---
    // ...(unchanged)...
     function runDailyCheck() {
        const yesterdayString = getYesterdayString(); 
        const alreadyProcessed = db.history.find(report => report.date === yesterdayString); if (alreadyProcessed) { console.log("Yesterday's report already exists."); return false; }
        const yesterdayTasks = db.tasks.filter(task => task.date === yesterdayString); if (yesterdayTasks.length === 0) { console.log("No tasks found for yesterday, nothing to report."); return false; }
        console.log(`Found ${yesterdayTasks.length} tasks for yesterday. Generating report...`);
        const completed = yesterdayTasks.filter(task => task.completed); const incomplete = yesterdayTasks.filter(task => !task.completed); const score = Math.round((completed.length / yesterdayTasks.length) * 100);
        const report = { date: yesterdayString, score: score, incompleteTasks: incomplete.map(task => task.name) };
        db.history.unshift(report); saveData(); 
        console.log("Generated new report for yesterday:", report); return report; 
    }
     async function initializeApp() {
        console.log("App is starting...");
        if ('serviceWorker' in navigator) {
            try {
                swRegistration = await navigator.serviceWorker.register('sw.js');
                console.log('Service Worker registered with scope:', swRegistration.scope);
                 // NEW: Ensure the SW is ready before proceeding too quickly
                 await navigator.serviceWorker.ready; 
                 console.log('Service Worker ready.');
            } catch (error) { console.error('Service Worker registration failed:', error); }
        }
        loadData(); 
        const newReportToShow = runDailyCheck();
        setTimeout(() => { preloader.classList.add('hidden'); }, 500);
        showPage('page-home');
        renderAll(); 
        if (newReportToShow) { displayReportOnHome(newReportToShow); } 
        else { renderHomePage(); }
        addCheckboxListeners(); updateNotificationButton(); 
    }

    initializeApp();
});