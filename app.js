/************************************************************
  SIMPLE LOCAL JSON DASHBOARD LOGIC (NO FIREBASE)
  ----------------------------------------------------------
  Loads users + tasks from database-import.json
  Supports:
   - Login
   - Create Task
   - Edit Task
   - Delete Task
   - Assign Task
   - Dashboard stats
************************************************************/

// Global Data
let localDB = {};       // Loaded from database-import.json
let currentUser = null; // Logged-in user

/************************************************************
  1️⃣ LOAD LOCAL JSON DATA
************************************************************/
window.addEventListener("DOMContentLoaded", () => {
    const jsonEl = document.getElementById("localJson");
    if (jsonEl) {
        localDB = JSON.parse(jsonEl.textContent);
        if (!localDB.tasks) localDB.tasks = {}; // ensure tasks exists
        console.log("DB Loaded:", localDB);
    }
});

/************************************************************
  2️⃣ LOGIN SYSTEM
************************************************************/
function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById("emailInput").value.trim();
    const password = document.getElementById("passwordInput").value.trim();
    const errorBox = document.getElementById("loginErrorMessage");

    errorBox.textContent = "";

    let matchedUser = null;

    for (const uid in localDB.users) {
        const user = localDB.users[uid];
        if (user.email.toLowerCase() === email.toLowerCase() &&
            user.password === password) {

            matchedUser = { uid, ...user };
            break;
        }
    }

    if (!matchedUser) {
        errorBox.textContent = "Invalid email or password.";
        errorBox.classList.add("show");
        return;
    }

    // Success
    currentUser = matchedUser;
    console.log("Logged in:", currentUser);

    // Show dashboard
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("dashboardPage").style.display = "block";

    // Set UI text
    document.getElementById("welcomeName").textContent = currentUser.name;
    document.getElementById("sidebarUserName").textContent = currentUser.name;
    document.getElementById("sidebarUserRole").textContent = currentUser.role;

    refreshDashboard();
}

/************************************************************
  3️⃣ MODAL: OPEN TASK FORM
************************************************************/
function openTaskModal(task = null) {
    const html = `
        <div class="modal-overlay">
            <div class="modal">
                <h3>${task ? "Edit Task" : "Create Task"}</h3>

                <form id="taskForm">
                    <label>Task Title</label>
                    <input type="text" id="taskTitle" value="${task ? task.title : ""}" required>

                    <label>Description</label>
                    <textarea id="taskDescription">${task ? task.description : ""}</textarea>

                    <label>Assignee</label>
                    <select id="taskAssignee">
                        ${Object.entries(localDB.users).map(([uid, user]) => `
                            <option value="${uid}" ${task && task.assigneeId === uid ? "selected" : ""}>
                                ${user.name}
                            </option>
                        `).join("")}
                    </select>

                    <label>Due Date</label>
                    <input type="date" id="taskDueDate" value="${task ? task.dueDate : ""}" required>

                    <label>Priority</label>
                    <select id="taskPriority">
                        <option value="Low" ${task?.priority === "Low" ? "selected" : ""}>Low</option>
                        <option value="Medium" ${task?.priority === "Medium" ? "selected" : ""}>Medium</option>
                        <option value="High" ${task?.priority === "High" ? "selected" : ""}>High</option>
                    </select>

                    <button type="submit" class="btn btn--primary" style="margin-top:15px;">
                        ${task ? "Save Changes" : "Add Task"}
                    </button>
                </form>

                <button class="btn btn--ghost" style="margin-top:10px" onclick="closeModal()">Cancel</button>

                ${task ? `<button class="btn btn--ghost" style="margin-top:10px;color:red;" onclick="deleteTask('${task.id}')">Delete Task</button>` : ""}
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", html);

    document.getElementById("taskForm").onsubmit = (e) => handleSaveTask(e, task);
}

function closeModal() {
    const el = document.querySelector(".modal-overlay");
    if (el) el.remove();
}

/************************************************************
  4️⃣ SAVE / UPDATE TASK
************************************************************/
function handleSaveTask(event, existingTask = null) {
    event.preventDefault();

    const title = document.getElementById("taskTitle").value.trim();
    const desc = document.getElementById("taskDescription").value.trim();
    const assigneeId = document.getElementById("taskAssignee").value;
    const due = document.getElementById("taskDueDate").value;
    const priority = document.getElementById("taskPriority").value;

    const taskId = existingTask ? existingTask.id : "task_" + Date.now();

    const taskData = {
        id: taskId,
        title: title,
        description: desc,
        assigneeId: assigneeId,
        dueDate: due,
        priority: priority,
        status: existingTask ? existingTask.status : "To Do",
        createdAt: existingTask ? existingTask.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    localDB.tasks[taskId] = taskData;

    closeModal();
    refreshDashboard();
}

/************************************************************
  5️⃣ DELETE TASK
************************************************************/
function deleteTask(taskId) {
    if (confirm("Are you sure you want to delete this task?")) {
        delete localDB.tasks[taskId];
        closeModal();
        refreshDashboard();
    }
}

/************************************************************
  6️⃣ RENDER TASK LIST (Dashboard)
************************************************************/
function refreshDashboard() {
    const list = document.getElementById("taskListContainer");
    if (!list) return;

    const tasks = Object.values(localDB.tasks);

    list.innerHTML = tasks.length === 0
        ? "<div class='small' style='margin-top:10px;'>No tasks yet.</div>"
        : tasks.map(task => `
            <div class="kanban-card">
                <div class="title">${task.title}</div>
                <div class="small">Due: ${task.dueDate}</div>
                <div class="small">Assigned: ${localDB.users[task.assigneeId]?.name}</div>
                <button class="btn btn--ghost" style="margin-top:6px;" onclick="openTaskModal(${JSON.stringify(task).replace(/"/g, '&quot;')})">
                    Edit
                </button>
            </div>
        `).join("");
}

/************************************************************
  7️⃣ LOGOUT
************************************************************/
function logout() {
    currentUser = null;
    document.getElementById("dashboardPage").style.display = "none";
    document.getElementById("loginPage").style.display = "block";
}
