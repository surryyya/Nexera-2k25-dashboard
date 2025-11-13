// --- Configuration ---
const SYMPOSIUM_DATE = new Date('2025-11-27T10:00:00');

// --- Application State ---
let currentUser = null; // Will hold { uid, name, email, role, teamId }
let currentPage = 'dashboard';
let notifications = []; // Mock notifications

// --- Real-Time Data Cache ---
// This object will be kept in sync with Firebase automatically
let dbData = {
  users: {},
  teams: {},
  tasks: {},
  events: {},
  sponsors: {},
  logistics: {}
};

// --- 1. Authentication & Role Loading ---

// This is the main entry point for the app
auth.onAuthStateChanged(async (user) => {
  if (user) {
    // 1. User is logged in, fetch their profile from the DB
    try {
      const snapshot = await db.ref(`/users/${user.uid}`).once('value');
      if (snapshot.exists()) {
        // 2. Store user profile (with role) in `currentUser`
        currentUser = { uid: user.uid, ...snapshot.val() };
        console.log(`Role loaded: ${currentUser.role}`);
        
        // 3. Start real-time listeners for all data
        initializeRealTimeListeners();
        
        // 4. Show the main app
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('mainDashboard').style.display = 'flex';
        updateUserProfileUI();
        startCountdown();
        
        // 5. Navigate to the default page
        navigateToPage('dashboard');
      } else {
        // User exists in Auth, but not in DB (error state)
        console.error("User profile not found in database.");
        alert("Your user profile is not configured. Please contact an admin.");
        auth.signOut();
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      auth.signOut();
    }
  } else {
    // 0. User is logged out, show the login page
    currentUser = null;
    document.getElementById('mainDashboard').style.display = 'none';
    document.getElementById('loginPage').style.display = 'flex';
    
    // Detach all listeners when logged out
    db.ref().off();
  }
});

// Handles the login form submission
function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('emailInput').value.trim();
  const password = document.getElementById('passwordInput').value;
  const loginButton = document.getElementById('loginButton');
  const loginErrorMsg = document.getElementById('loginErrorMessage');
  
  loginErrorMsg.textContent = '';
  loginErrorMsg.classList.remove('show');
  loginButton.textContent = 'Signing In...';
  loginButton.disabled = true;

  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      // Login successful. onAuthStateChanged listener will handle the rest.
      console.log("Login successful");
    })
    .catch(error => {
      loginErrorMsg.textContent = error.message;
      loginErrorMsg.classList.add('show');
      loginButton.textContent = 'Sign In';
      loginButton.disabled = false;
    });
}

// Handles the logout button
function handleLogout() {
  auth.signOut();
}

// --- 2. Real-Time Data Sync ---
// (As described in "Real-Time Features Using Firebase")

/**
 * Attaches real-time listeners to all main data nodes.
 * When data changes, it updates the `dbData` cache and re-renders the UI.
 */
function initializeRealTimeListeners() {
  const nodes = ['users', 'teams', 'tasks', 'events', 'sponsors', 'logistics'];
  
  nodes.forEach(node => {
    db.ref(node).on('value', (snapshot) => {
      console.log(`Real-time data updated for: /${node}`);
      dbData[node] = snapshot.val() || {};
      
      // When data changes, refresh the current page
      // We check for `currentUser` to prevent errors during logout
      if (currentUser) {
        refreshCurrentPage();
      }
    });
  });
}

/**
 * Re-renders the content of the currently active page.
 */
function refreshCurrentPage() {
  navigateToPage(currentPage, true); // `true` signals this is a refresh
}

// --- 3. Role-Based Access Control (RBAC) ---
// (As described in "Access Control in Code")

/**
 * A helper object to check permissions based on the current user's role.
 */
const Permissions = {
  // Can create, edit details, assign, or delete a task
  canManageTask: (task) => {
    if (currentUser.role === 'admin') return true;
    // `task` is null when checking "Create" permission
    if (!task && currentUser.role === 'team_lead') return true; 
    // `task` exists when checking "Edit/Delete"
    if (task && currentUser.role === 'team_lead' && task.teamId === currentUser.teamId) return true;
    return false;
  },

  // Can only update the 'status' or 'comments'
  canUpdateTaskStatus: (task) => {
    if (Permissions.canManageTask(task)) return true; // Admins/Leads can also update status
    if (currentUser.role === 'volunteer' && task.assigneeId === currentUser.uid) return true;
    return false;
  },

  canManageTeams: () => currentUser.role === 'admin',
  
  canManageSponsors: () => {
    // Example: Only Admin or Sponsorship team lead
    if (currentUser.role === 'admin') return true;
    const team = dbData.teams[currentUser.teamId] || {};
    if (currentUser.role === 'team_lead' && team.name === 'Sponsorship') return true;
    return false;
  },
  
  canManageLogistics: () => {
    if (currentUser.role === 'admin') return true;
    const team = dbData.teams[currentUser.teamId] || {};
    if (currentUser.role === 'team_lead' && team.name === 'Logistics') return true;
    return false;
  },

  canCreateEvent: () => currentUser.role === 'admin',
  
  canViewPage: (page) => {
    // Example: Volunteers cannot see 'Analytics'
    if (page === 'analytics' && currentUser.role === 'volunteer') return false;
    
    // Example: Only Admin/Sponsor team can see 'Sponsors'
    if (page === 'sponsors' && !Permissions.canManageSponsors()) {
      // We'll allow viewing for this demo, but hide editing.
      // To block the page entirely:
      // if (page === 'sponsors' && currentUser.role === 'volunteer' && !Permissions.canManageSponsors()) return false;
    }
    return true; // Default allow
  }
};

// --- 4. Data Filtering ---

/**
 * Gets the list of tasks visible to the current user based on their role.
 * Admin: Sees all tasks.
 * Team Lead: Sees all tasks for their team.
 * Volunteer: Sees ONLY tasks assigned directly to them.
 */
function getVisibleTasks() {
  const allTasks = Object.values(dbData.tasks);
  
  if (currentUser.role === 'admin') {
    return allTasks;
  }
  
  if (currentUser.role === 'team_lead') {
    return allTasks.filter(task => task.teamId === currentUser.teamId);
  }
  
  if (currentUser.role === 'volunteer') {
    return allTasks.filter(task => task.assigneeId === currentUser.uid);
  }
  
  return []; // Should not happen
}

// --- 5. Page Navigation & Rendering ---

function navigateToPage(page, isRefresh = false) {
  // Check if user is allowed to see this page
  if (!isRefresh && !Permissions.canViewPage(page)) {
    alert("You do not have permission to view this page.");
    return;
  }
  
  if (!isRefresh) {
    currentPage = page;
  }
  
  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
  
  // Render page content
  const pageContent = document.getElementById('pageContent');
  
  // Show loading spinner during re-renders
  if (isRefresh) {
    pageContent.style.opacity = '0.5';
  } else {
    pageContent.innerHTML = `<p>Loading ${page}...</p>`;
  }

  // A slight delay to allow the DOM to update and data to be ready
  // This makes the real-time updates feel smoother
  setTimeout(() => {
    switch(page) {
      case 'dashboard':
        renderDashboard(pageContent);
        break;
      case 'teams':
        renderTeams(pageContent);
        break;
      case 'events':
        renderEvents(pageContent);
        break;
      case 'tasks':
        renderTasks(pageContent);
        break;
      case 'sponsors':
        renderSponsors(pageContent);
        break;
      case 'logistics':
        renderLogistics(pageContent);
        break;
      case 'communication':
        renderCommunication(pageContent);
        break;
      case 'analytics':
        renderAnalytics(pageContent);
        break;
      default:
        pageContent.innerHTML = `<h2>Page not found: ${page}</h2>`;
    }
    pageContent.style.opacity = '1';
  }, 50); // 50ms throttle
}

// --- Page Render Functions (Now Role-Aware) ---

// Dashboard Page
function renderDashboard(container) {
  // Get tasks *visible* to this user
  const tasks = getVisibleTasks();
  const progress = calculateProgress(tasks);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const activeEvents = Object.keys(dbData.events).length;
  const totalMembers = Object.keys(dbData.users).length;
  
  const urgentTasks = tasks
    .filter(t => t.status !== 'Done' && isUrgent(t.dueDate))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);
  
  container.innerHTML = `
    <div class="welcome-banner">
      <div class="welcome-content">
        <h1 class="welcome-title">Welcome back, ${currentUser.name}!</h1>
        <span class="role-badge">${currentUser.role.replace('_', ' ')}</span>
        <p>Your tasks are waiting. Let's make it amazing!</p>
        <div class="quick-actions">
          ${Permissions.canManageTask(null) ? `<button class="btn" onclick="openTaskModal()">+ Create Task</button>` : ''}
          ${Permissions.canCreateEvent() ? `<button class="btn" onclick="openCreateEventModal()">+ Add Event</button>` : ''}
          <button class="btn" onclick="navigateToPage('tasks')">View All My Tasks</button>
        </div>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon bg-1">✓</div>
        <div class="stat-info">
          <div class="stat-label">Your/Team Tasks</div>
          <div class="stat-value">${totalTasks}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-2">📊</div>
        <div class="stat-info">
          <div class="stat-label">Completed</div>
          <div class="stat-value">${completedTasks}</div>
          <div class="stat-change">${progress}% complete</div>
        </div>
      </div>
      ${currentUser.role !== 'volunteer' ? `
      <div class="stat-card">
        <div class="stat-icon bg-3">📅</div>
        <div class="stat-info">
          <div class="stat-label">Active Events</div>
          <div class="stat-value">${activeEvents}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-4">👥</div>
        <div class="stat-info">
          <div class="stat-label">Team Members</div>
          <div class="stat-value">${totalMembers}</div>
        </div>
      </div>
      ` : ''}
    </div>
    
    <div class="grid-2">
      <div class="tasks-section">
        <div class="section-header">
          <h3 class="section-title">Your Urgent Tasks</h3>
          <button class="btn btn--sm" onclick="navigateToPage('tasks')">View All</button>
        </div>
        <div class="task-list">
          ${urgentTasks.length === 0 ? '<p style="text-align: center; color: var(--color-text-secondary); padding: var(--space-24);">No urgent tasks</p>' : urgentTasks.map(task => `
              <div class="task-item" onclick="openTaskDetailModal('${task.id}')">
                <div class="task-priority ${task.priority.toLowerCase()}"></div>
                <div class="task-details">
                  <div class="task-title">${task.title}</div>
                  <div class="task-meta">
                    <span class="task-assignee">👤 ${getUserById(task.assigneeId).name}</span>
                    <span class="status status--info">⚡ ${getTeamById(task.teamId).icon} ${getTeamById(task.teamId).name}</span>
                    <span class="task-due-date ${isUrgent(task.dueDate) ? 'urgent' : ''}">📅 ${formatDate(task.dueDate)}</span>
                  </div>
                </div>
              </div>
            `).join('')}
        </div>
      </div>
      
      ${currentUser.role !== 'volunteer' ? `
      <div class="progress-section">
        <div class="section-header">
          <h3 class="section-title">Team Progress</h3>
        </div>
        <div class="team-progress-list">
          ${getObjectValues(dbData.teams).map((team, index) => {
            const teamProgress = calculateTeamProgress(team.id);
            return `
              <div class="team-progress-item">
                <div class="team-info">
                  <span class="team-icon">${team.icon}</span>
                  <span class="team-name">${team.name}</span>
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar color-${(index % 5) + 1}" style="width: ${teamProgress}%"></div>
                </div>
                <div class="progress-percentage-text">${teamProgress}%</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      ` : `
      <div class="progress-section">
        <h3 class="section-title">Symphony '25</h3>
        <p>Welcome to the team! Your assigned tasks will appear here and on the 'Tasks' page.</p>
        <p>Thank you for volunteering!</p>
      </div>
      `}
    </div>
  `;
}

// Tasks Page (Kanban View)
function renderTasks(container) {
  const tasks = getVisibleTasks(); // Get ONLY the tasks user is allowed to see
  
  const todoTasks = tasks.filter(t => t.status === 'To Do');
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
  const doneTasks = tasks.filter(t => t.status === 'Done');

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-24);">
      <h2>Tasks</h2>
      ${Permissions.canManageTask(null) ? `<button class="btn btn--primary" onclick="openTaskModal()">+ Create Task</button>` : ''}
    </div>
    
    <div class="kanban-board">
      <div class="kanban-column">
        <div class="kanban-header todo">
          <span class="kanban-title">To Do</span>
          <span class="kanban-count">${todoTasks.length}</span>
        </div>
        <div class="kanban-cards">
          ${todoTasks.map(task => renderKanbanCard(task)).join('')}
        </div>
      </div>
      
      <div class="kanban-column">
        <div class="kanban-header inprogress">
          <span class="kanban-title">In Progress</span>
          <span class="kanban-count">${inProgressTasks.length}</span>
        </div>
        <div class="kanban-cards">
          ${inProgressTasks.map(task => renderKanbanCard(task)).join('')}
        </div>
      </div>
      
      <div class="kanban-column">
        <div class="kanban-header done">
          <span class="kanban-title">Done</span>
          <span class="kanban-count">${doneTasks.length}</span>
        </div>
        <div class="kanban-cards">
          ${doneTasks.map(task => renderKanbanCard(task)).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderKanbanCard(task) {
  const assignee = getUserById(task.assigneeId);
  // When a card is clicked, open the detail/edit modal
  return `
    <div class="kanban-card" onclick="openTaskDetailModal('${task.id}')">
      <div class="kanban-card-title">${task.title}</div>
      <div class="kanban-card-description">${task.description}</div>
      <div class="kanban-card-footer">
        <span class="status status--${task.priority.toLowerCase()}">${task.priority}</span>
        <span style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">👤 ${assignee.name.split(' ')[0]}</span>
      </div>
      <div style="margin-top: var(--space-8); font-size: var(--font-size-xs); color: var(--color-text-secondary);">📅 ${formatDate(task.dueDate)}</div>
    </div>
  `;
}

// Teams Page
function renderTeams(container) {
  // Volunteers do not need to see the team management page
  if (currentUser.role === 'volunteer') {
    container.innerHTML = '<h2>My Team</h2><p>Page not applicable for this role.</p>';
    return;
  }

  container.innerHTML = `
    <h2 style="margin-bottom: var(--space-24);">Teams</h2>
    <div class="grid-3">
      ${getObjectValues(dbData.teams).map(team => {
        const lead = getUserById(team.leadId);
        const teamTasks = getObjectValues(dbData.tasks).filter(t => t.teamId === team.id);
        const teamProgress = calculateTeamProgress(team.id);
        const todoCount = teamTasks.filter(t => t.status === 'To Do').length;
        const doneCount = teamTasks.filter(t => t.status === 'Done').length;
        
        return `
          <div class="card">
            <div class="card__body">
              <div style="font-size: 48px; text-align: center;">${team.icon}</div>
              <h3 style="text-align: center;">${team.name}</h3>
              <p style="text-align: center; color: var(--color-text-secondary);">Lead: ${lead.name}</p>
              <div class="progress-bar-container" style="margin: 16px 0;">
                <div class="progress-bar color-1" style="width: ${teamProgress}%"></div>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span class="status status--todo">${todoCount} To Do</span>
                <span class="status status--done">${doneCount} Done</span>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// Other Render Functions (Events, Sponsors, etc.) - Stubbed for brevity
// These would follow the same pattern of reading from `dbData`
function renderEvents(container) { container.innerHTML = '<h2>Events</h2><p>Render function to be built.</p>'; }
function renderSponsors(container) { container.innerHTML = '<h2>Sponsors</h2><p>Render function to be built.</sponsors>'; }
function renderLogistics(container) { container.innerHTML = '<h2>Logistics</h2><p>Render function to be built.</p>'; }
function renderCommunication(container) { container.innerHTML = '<h2>Communication</h2><p>Render function to be built.</p>'; }
function renderAnalytics(container) { container.innerHTML = '<h2>Analytics</h2><p>Render function to be built.</p>'; }


// --- 6. Modal & Action Handlers (Writing to DB) ---

/**
 * Opens the task detail modal.
 * This modal allows EITHER full editing (Admins/Leads) OR only status updates (Volunteers).
 */
function openTaskDetailModal(taskId) {
  const task = dbData.tasks[taskId];
  if (!task) {
    console.error("Task not found!");
    return;
  }
  
  // Check permissions
  const canManage = Permissions.canManageTask(task);
  const canUpdateStatus = Permissions.canUpdateTaskStatus(task);
  
  if (!canUpdateStatus) {
    // User has no permissions, show a read-only view
    alert("You do not have permission to edit this task.");
    // (A read-only modal could be shown here)
    return;
  }
  
  if (canManage) {
    // If user is Admin or Team Lead, show the full edit modal
    openTaskModal(taskId);
  } else {
    // If user is a Volunteer, show the simple status-update modal
    openStatusUpdateModal(taskId);
  }
}

/**
 * Opens the FULL task editor (for Admins and Team Leads).
 */
function openTaskModal(taskId = null) {
  const task = taskId ? dbData.tasks[taskId] : null;
  const isEditing = !!task;

  // Get users for the dropdown
  // If Admin, show all users. If Lead, show only their team members.
  let assignableUsers = getObjectValues(dbData.users);
  if (currentUser.role === 'team_lead') {
    assignableUsers = assignableUsers.filter(u => u.teamId === currentUser.teamId);
  }
  
  // Get teams for the dropdown (Admin only)
  let teamOptions = '';
  if (currentUser.role === 'admin') {
    teamOptions = `
      <div class="form-group">
        <label class="form-label">Team</label>
        <select class="form-control" id="taskTeam" required>
          ${getObjectValues(dbData.teams).map(t => `<option value="${t.id}" ${task && task.teamId === t.id ? 'selected' : ''}>${t.icon} ${t.name}</option>`).join('')}
        </select>
      </div>
    `;
  }

  showModal(isEditing ? 'Edit Task' : 'Create New Task', `
    <form id="taskForm" data-id="${taskId || ''}">
      <div class="form-group">
        <label class="form-label">Task Title</label>
        <input type="text" class="form-control" id="taskTitle" value="${task ? task.title : ''}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea class="form-control" id="taskDescription" rows="3" required>${task ? task.description : ''}</textarea>
      </div>
      
      ${teamOptions} <div class="form-group">
        <label class="form-label">Assignee</label>
        <select class="form-control" id="taskAssignee" required>
          ${assignableUsers.map(u => `<option value="${u.uid}" ${task && task.assigneeId === u.uid ? 'selected' : ''}>${u.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Due Date</label>
        <input type="date" class="form-control" id="taskDueDate" value="${task ? task.dueDate : ''}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Priority</label>
        <select class="form-control" id="taskPriority" required>
          <option value="High" ${task && task.priority === 'High' ? 'selected' : ''}>High</option>
          <option value="Medium" ${!task || task.priority === 'Medium' ? 'selected' : ''}>Medium</option>
          <option value="Low" ${task && task.priority === 'Low' ? 'selected' : ''}>Low</option>
        </select>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn--outline" onclick="closeModal()">Cancel</button>
        ${isEditing ? `<button type="button" class="btn btn--secondary" style="margin-right: auto;" onclick="handleDeleteTask('${taskId}')">Delete Task</button>` : ''}
        <button type="submit" class="btn btn--primary">${isEditing ? 'Update Task' : 'Create Task'}</button>
      </div>
    </form>
  `);
  
  // Attach submit handler
  document.getElementById('taskForm').onsubmit = handleSaveTask;
}

/**
 * Opens a simple modal for Volunteers to update status.
 */
function openStatusUpdateModal(taskId) {
  const task = dbData.tasks[taskId];
  
  showModal('Update Task Status', `
    <h3 style="margin-bottom: 16px;">${task.title}</h3>
    <p>${task.description}</p>
    <div class="form-group" style="margin-top: 24px;">
      <label class="form-label">Set Status</label>
      <select class="form-control" id="taskStatusSelect">
        <option value="To Do" ${task.status === 'To Do' ? 'selected' : ''}>To Do</option>
        <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
        <option value="Done" ${task.status === 'Done' ? 'selected' : ''}>Done</option>
      </select>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn--outline" onclick="closeModal()">Cancel</button>
      <button type="button" class="btn btn--primary" onclick="handleUpdateStatus('${taskId}')">Update Status</button>
    </div>
  `);
}

/**
 * Saves task data (Create/Update) to Firebase.
 */
function handleSaveTask(event) {
  event.preventDefault();
  const form = event.target;
  
  const taskId = form.dataset.id || db.ref('tasks').push().key; // Get new key if needed
  const existingTask = dbData.tasks[taskId] || {};

  const taskData = {
    id: taskId,
    title: document.getElementById('taskTitle').value,
    description: document.getElementById('taskDescription').value,
    assigneeId: document.getElementById('taskAssignee').value,
    dueDate: document.getElementById('taskDueDate').value,
    priority: document.getElementById('taskPriority').value,
    // If admin, use the form's team value. If lead, use their own teamId.
    teamId: currentUser.role === 'admin' ? document.getElementById('taskTeam').value : currentUser.teamId,
    // Preserve existing status on edit, or default to 'To Do'
    status: existingTask.status || 'To Do',
    updatedAt: new Date().toISOString()
  };
  
  if (!existingTask.createdAt) {
    taskData.createdAt = new Date().toISOString();
  }

  // Final permission check
  if (!Permissions.canManageTask(taskData)) {
    alert("Permission denied. Your role cannot create or edit tasks for this team.");
    return;
  }
  
  // Write to Firebase
  db.ref(`tasks/${taskId}`).update(taskData)
    .then(() => {
      console.log("Task saved:", taskId);
      closeModal();
      // No need to refresh, real-time listener will handle it!
    })
    .catch(error => {
      console.error("Error saving task:", error);
      alert("Error saving task: " + error.message);
    });
}

/**
 * Updates *only* the status of a task.
 */
function handleUpdateStatus(taskId) {
  const newStatus = document.getElementById('taskStatusSelect').value;
  const task = dbData.tasks[taskId];
  
  // Final permission check
  if (!Permissions.canUpdateTaskStatus(task)) {
    alert("Permission denied.");
    return;
  }
  
  // Write *only* the status
  db.ref(`tasks/${taskId}/status`).set(newStatus)
    .then(() => {
      console.log("Status updated:", taskId);
      closeModal();
      // No need to refresh, real-time listener will handle it!
    })
    .catch(error => {
      console.error("Error updating status:", error);
      alert("Error updating status: " + error.message);
    });
}

/**
 * Deletes a task from Firebase.
 */
function handleDeleteTask(taskId) {
  const task = dbData.tasks[taskId];
  
  if (!Permissions.canManageTask(task)) {
    alert("You do not have permission to delete this task.");
    return;
  }
  
  if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
    db.ref(`tasks/${taskId}`).remove()
      .then(() => {
        console.log("Task deleted:", taskId);
        closeModal();
        // No need to refresh, real-time listener will handle it!
      })
      .catch(error => {
        console.error("Error deleting task:", error);
        alert("Error deleting task: " + error.message);
      });
  }
}

// Stub for creating an event
function openCreateEventModal() {
  alert("Event creation modal not implemented.");
}


// --- 7. Utility & Helper Functions ---

// Updates the user avatar/name in the sidebar
function updateUserProfileUI() {
  const initials = getInitials(currentUser.name);
  document.getElementById('sidebarAvatar').textContent = initials;
  document.getElementById('headerAvatar').textContent = initials;
  document.getElementById('sidebarUserName').textContent = currentUser.name;
  document.getElementById('sidebarUserRole').textContent = currentUser.role.replace('_', ' ');
}

// Countdown Timer
function startCountdown() {
  const interval = setInterval(() => {
    const now = new Date();
    const diff = SYMPOSIUM_DATE - now;
    
    if (diff <= 0 || !document.getElementById('countdownDays')) {
      clearInterval(interval);
      return;
    }
    
    document.getElementById('countdownDays').textContent = Math.floor(diff / (1000 * 60 * 60 * 24));
    document.getElementById('countdownHours').textContent = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    document.getElementById('countdownMinutes').textContent = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    document.getElementById('countdownSeconds').textContent = Math.floor((diff % (1000 * 60)) / 1000);
  }, 1000);
}

// Data Getters (safe access from cache)
function getObjectValues(obj) { return obj ? Object.values(obj) : []; }
function getUserById(uid) { return dbData.users[uid] || { name: 'Unknown' }; }
function getTeamById(id) { return dbData.teams[id] || { name: 'Unknown', icon: '?' }; }

function getInitials(name = "") { return name.split(' ').map(n => n[0]).join('').toUpperCase() || '?'; }
function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(date);
}
function isUrgent(dueDate) {
  const diff = new Date(dueDate) - new Date();
  return (diff / (1000 * 60 * 60 * 24)) <= 3;
}

// Progress Calculators
function calculateProgress(tasks) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Done').length;
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}
function calculateTeamProgress(teamId) {
  const teamTasks = getObjectValues(dbData.tasks).filter(t => t.teamId === teamId);
  return calculateProgress(teamTasks);
}

// Modal Functions
function showModal(title, content) {
  document.getElementById('modalContainer').innerHTML = `
    <div class="modal-overlay" onclick="closeModalOnOverlay(event)">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <div class="modal-body">${content}</div>
      </div>
    </div>
  `;
}
function closeModal() { document.getElementById('modalContainer').innerHTML = ''; }
function closeModalOnOverlay(event) { if (event.target.classList.contains('modal-overlay')) closeModal(); }

// Mock Notification Functions
function toggleNotificationPanel() { alert("Notification panel not implemented."); }
function markAllNotificationsRead() { }


// --- 8. Event Listeners (DOM Ready) ---

document.addEventListener('DOMContentLoaded', function() {
  // Login form
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      navigateToPage(this.dataset.page);
    });
  });
  
  // Logout
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  
  // Notification bell
  document.getElementById('notificationBell').addEventListener('click', toggleNotificationPanel);
  
  // Mark all read button
  document.getElementById('markAllRead').addEventListener('click', markAllNotificationsRead);
  
  // Sidebar toggle for mobile
  document.getElementById('sidebarToggle').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('open');
  });
});