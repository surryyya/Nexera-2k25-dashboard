// Data Storage
const SYMPOSIUM_DATE = new Date('2025-11-27T10:00:00');
const COLLEGE_DOMAIN = '@cit.edu.in';

let currentUser = null;
let currentPage = 'dashboard';
let notifications = [];

// Sample Data
/*const users = [
  { id: 1, name: 'Dr. Rajesh Kumar', email: 'admin@ececollege.edu.in', role: 'Admin', team: null },
  { id: 2, name: 'Priya Sharma', email: 'teamlead@ececollege.edu.in', role: 'Team Lead', team: 'Events' },
  { id: 3, name: 'Amit Patel', email: 'volunteer@ececollege.edu.in', role: 'Volunteer', team: 'Events' },
  { id: 4, name: 'Sneha Reddy', email: 'sneha@ececollege.edu.in', role: 'Team Lead', team: 'Logistics' },
  { id: 5, name: 'Rahul Verma', email: 'rahul@ececollege.edu.in', role: 'Volunteer', team: 'Logistics' },
  { id: 6, name: 'Kavya Nair', email: 'kavya@ececollege.edu.in', role: 'Team Lead', team: 'Sponsorship' },
  { id: 7, name: 'Arjun Singh', email: 'arjun@ececollege.edu.in', role: 'Volunteer', team: 'Media & PR' },
  { id: 8, name: 'Prof. Meera Iyer', email: 'meera@ececollege.edu.in', role: 'Admin', team: 'Faculty Oversight' }
];*/

const teams = [
  { id: 1, name: 'Events', icon: '🎯', leadId: 2, memberIds: [2, 3], whatsappLink: 'https://chat.whatsapp.com/events-symphony25', telegramLink: 'https://t.me/symphony25_events', description: 'Manages all technical and non-technical events for Symphony \'25' },
  { id: 2, name: 'Logistics', icon: '⚙️', leadId: 4, memberIds: [4, 5], whatsappLink: 'https://chat.whatsapp.com/logistics-symphony25', telegramLink: 'https://t.me/symphony25_logistics', description: 'Handles venue setup, certificates, kits, and equipment' },
  { id: 3, name: 'Sponsorship', icon: '💰', leadId: 6, memberIds: [6], whatsappLink: 'https://chat.whatsapp.com/sponsor-symphony25', telegramLink: 'https://t.me/symphony25_sponsors', description: 'Coordinates with sponsors and manages funding' },
  { id: 4, name: 'Media & PR', icon: '🎨', leadId: 7, memberIds: [7], whatsappLink: 'https://chat.whatsapp.com/media-symphony25', telegramLink: 'https://t.me/symphony25_media', description: 'Creates promotional content and manages social media' },
  { id: 5, name: 'Faculty Oversight', icon: '🧠', leadId: 8, memberIds: [8, 1], whatsappLink: 'https://chat.whatsapp.com/faculty-symphony25', telegramLink: 'https://t.me/symphony25_faculty', description: 'Faculty coordination and approval management' }
];

let tasks = [
  { id: 1, title: 'Book Main Auditorium', description: 'Coordinate with admin office for main hall booking for inauguration', teamId: 2, assigneeId: 5, dueDate: '2025-11-20', status: 'In Progress', priority: 'High', eventId: 1, files: [] },
  { id: 2, title: 'Design Event Posters', description: 'Create promotional posters for all events', teamId: 4, assigneeId: 7, dueDate: '2025-11-15', status: 'Done', priority: 'High', eventId: null, files: [] },
  { id: 3, title: 'Contact Tech Sponsors', description: 'Reach out to potential tech company sponsors', teamId: 3, assigneeId: 6, dueDate: '2025-11-18', status: 'To Do', priority: 'High', eventId: null, files: [] },
  { id: 4, title: 'Order Participant Kits', description: 'Order 500 participant kits with Symphony \'25 branding', teamId: 2, assigneeId: 4, dueDate: '2025-11-22', status: 'To Do', priority: 'Medium', eventId: null, files: [] },
  { id: 5, title: 'Setup TechQuest Registration', description: 'Create online registration form for hackathon', teamId: 1, assigneeId: 3, dueDate: '2025-11-14', status: 'Done', priority: 'High', eventId: 1, files: [] },
  { id: 6, title: 'Social Media Campaign Launch', description: 'Start Instagram and LinkedIn promotional campaign', teamId: 4, assigneeId: 7, dueDate: '2025-11-13', status: 'Done', priority: 'Medium', eventId: null, files: [] },
  { id: 7, title: 'Arrange Sound System', description: 'Coordinate with AV team for sound system setup', teamId: 2, assigneeId: 5, dueDate: '2025-11-25', status: 'To Do', priority: 'High', eventId: 2, files: [] },
  { id: 8, title: 'Print Certificates', description: 'Design and print 250 participation certificates', teamId: 2, assigneeId: 4, dueDate: '2025-11-24', status: 'In Progress', priority: 'Medium', eventId: null, files: [] },
  { id: 9, title: 'Confirm Chief Guest', description: 'Get confirmation from industry expert for inauguration', teamId: 5, assigneeId: 1, dueDate: '2025-11-16', status: 'In Progress', priority: 'High', eventId: 2, files: [] },
  { id: 10, title: 'Setup Workshop Venue', description: 'Arrange seating and projector for IoT workshop', teamId: 2, assigneeId: 5, dueDate: '2025-11-26', status: 'To Do', priority: 'Medium', eventId: 3, files: [] }
];

const events = [
  { id: 1, name: 'TechQuest Hackathon', type: 'Technical', date: '2025-11-27', time: '09:00 AM', venue: 'Computer Lab 1 & 2', coordinatorId: 2, description: '24-hour coding competition for students across all years' },
  { id: 2, name: 'Symphony Inauguration', type: 'Non-Technical', date: '2025-11-27', time: '10:00 AM', venue: 'Main Auditorium', coordinatorId: 1, description: 'Official opening ceremony with chief guest address' },
  { id: 3, name: 'IoT Workshop', type: 'Technical', date: '2025-11-28', time: '02:00 PM', venue: 'ECE Lab A', coordinatorId: 2, description: 'Hands-on workshop on IoT and embedded systems' },
  { id: 4, name: 'Project Expo', type: 'Technical', date: '2025-11-28', time: '10:00 AM', venue: 'Exhibition Hall', coordinatorId: 3, description: 'Student project showcase and competition' },
  { id: 5, name: 'Cultural Evening', type: 'Non-Technical', date: '2025-11-28', time: '06:00 PM', venue: 'Open Amphitheater', coordinatorId: 7, description: 'Music, dance, and entertainment performances' }
];

let sponsors = [
  { id: 1, name: 'Tech Innovators Pvt Ltd', tier: 'Platinum', amount: 50000, status: 'Confirmed', contactPerson: 'Mr. Rajesh Sharma', notes: 'Logo on all promotional materials' },
  { id: 2, name: 'CodeCraft Solutions', tier: 'Gold', amount: 30000, status: 'Confirmed', contactPerson: 'Ms. Priya Desai', notes: 'Workshop collaboration partner' },
  { id: 3, name: 'StartupHub India', tier: 'Silver', amount: 15000, status: 'In Discussion', contactPerson: 'Mr. Amit Kumar', notes: 'Pending final contract' },
  { id: 4, name: 'Digital Minds', tier: 'Bronze', amount: 10000, status: 'Confirmed', contactPerson: 'Ms. Sneha Rao', notes: 'Providing goodies for participants' },
  { id: 5, name: 'EduTech Corporation', tier: 'Gold', amount: 25000, status: 'Contacted', contactPerson: 'Dr. Venkat Reddy', notes: 'Awaiting response' }
];

let logistics = [
  { id: 1, itemName: 'Main Auditorium Booking', category: 'Venue', status: 'Completed', responsiblePersonId: 4, dueDate: '2025-11-20', notes: 'Booked for Nov 27, 10 AM - 12 PM' },
  { id: 2, itemName: 'Participant Certificates', category: 'Certificates', status: 'Ordered', responsiblePersonId: 5, dueDate: '2025-11-24', notes: '250 certificates from PrintHub, delivery on Nov 24' },
  { id: 3, itemName: 'Event Kits', category: 'Kits', status: 'Pending', responsiblePersonId: 4, dueDate: '2025-11-22', notes: '500 kits with pen, notebook, badge' },
  { id: 4, itemName: 'Projector and Screen', category: 'Equipment', status: 'Received', responsiblePersonId: 5, dueDate: '2025-11-25', notes: 'From IT department, tested and working' },
  { id: 5, itemName: 'Sound System', category: 'Equipment', status: 'Ordered', responsiblePersonId: 5, dueDate: '2025-11-25', notes: 'External vendor, setup on Nov 26' }
];

// Utility Functions
function getUserById(id) {
  return users.find(u => u.id === id);
}

function getTeamById(id) {
  return teams.find(t => t.id === id);
}

function getEventById(id) {
  return events.find(e => e.id === id);
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function isUrgent(dueDate) {
  const due = new Date(dueDate);
  const now = new Date();
  const diff = due - now;
  const days = diff / (1000 * 60 * 60 * 24);
  return days <= 3 && days >= 0;
}

function calculateProgress() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Done').length;
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

function calculateTeamProgress(teamId) {
  const teamTasks = tasks.filter(t => t.teamId === teamId);
  const total = teamTasks.length;
  const completed = teamTasks.filter(t => t.status === 'Done').length;
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

function addNotification(type, message, taskId = null) {
  const task = taskId ? tasks.find(t => t.id === taskId) : null;
  const notification = {
    id: Date.now(),
    type,
    message,
    taskId,
    taskName: task ? task.title : '',
    team: task ? getTeamById(task.teamId).name : '',
    assignee: task ? getUserById(task.assigneeId).email : '',
    dueDate: task ? task.dueDate : '',
    timestamp: new Date().toISOString(),
    read: false
  };
  notifications.unshift(notification);
  updateNotificationBadge();
  return notification;
}

function updateNotificationBadge() {
  const unreadCount = notifications.filter(n => !n.read).length;
  const badge = document.getElementById('notificationBadge');
  if (badge) {
    badge.textContent = unreadCount;
    badge.classList.toggle('hidden', unreadCount === 0);
  }
}

// Login Handler
function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('emailInput').value.trim();
  const errorElement = document.getElementById('emailError');
  
  if (!email.endsWith(COLLEGE_DOMAIN)) {
    errorElement.textContent = `Please use a valid ${COLLEGE_DOMAIN} email address`;
    errorElement.classList.add('show');
    return;
  }
  
  const user = users.find(u => u.email === email);
  if (!user) {
    errorElement.textContent = 'User not found. Please use one of the demo accounts.';
    errorElement.classList.add('show');
    return;
  }
  
  currentUser = user;
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('mainDashboard').style.display = 'flex';
  
  updateUserProfile();
  initializeNotifications();
  startCountdown();
  navigateToPage('dashboard');
}

function updateUserProfile() {
  const initials = getInitials(currentUser.name);
  document.getElementById('sidebarAvatar').textContent = initials;
  document.getElementById('headerAvatar').textContent = initials;
  document.getElementById('sidebarUserName').textContent = currentUser.name;
  document.getElementById('sidebarUserRole').textContent = currentUser.role;
}

function initializeNotifications() {
  // Add sample notifications
  addNotification('task_created', `New task assigned to ${currentUser.name}`, 3);
  addNotification('deadline_reminder', 'Task deadline approaching', 1);
  addNotification('task_completed', 'Task marked as complete', 2);
}

// Countdown Timer
function startCountdown() {
  function updateCountdown() {
    const now = new Date();
    const diff = SYMPOSIUM_DATE - now;
    
    if (diff <= 0) {
      document.getElementById('countdownDays').textContent = '0';
      document.getElementById('countdownHours').textContent = '0';
      document.getElementById('countdownMinutes').textContent = '0';
      document.getElementById('countdownSeconds').textContent = '0';
      return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('countdownDays').textContent = days;
    document.getElementById('countdownHours').textContent = hours;
    document.getElementById('countdownMinutes').textContent = minutes;
    document.getElementById('countdownSeconds').textContent = seconds;
  }
  
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// Navigation
function navigateToPage(page) {
  currentPage = page;
  
  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
  
  // Render page content
  const pageContent = document.getElementById('pageContent');
  
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
  }
}

// Dashboard Page
function renderDashboard(container) {
  const progress = calculateProgress();
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const activeEvents = events.length;
  const totalMembers = users.length;
  
  const urgentTasks = tasks
    .filter(t => t.status !== 'Done' && isUrgent(t.dueDate))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);
  
  container.innerHTML = `
    <div class="welcome-banner">
      <div class="welcome-content">
        <h1 class="welcome-title">Welcome back, ${currentUser.name}!</h1>
        <span class="role-badge">${currentUser.role}</span>
        <p>Symphony '25 is just around the corner. Let's make it amazing!</p>
        <div class="quick-actions">
          <button class="btn" onclick="openCreateTaskModal()">+ Create Task</button>
          <button class="btn" onclick="openCreateEventModal()">+ Add Event</button>
          <button class="btn" onclick="navigateToPage('teams')">View Teams</button>
        </div>
      </div>
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon bg-1">✓</div>
        <div class="stat-info">
          <div class="stat-label">Total Tasks</div>
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
    </div>
    
    <div class="grid-2">
      <div class="progress-section">
        <div class="section-header">
          <h3 class="section-title">Overall Progress</h3>
        </div>
        <div class="progress-circle-container">
          <div class="progress-circle">
            <svg class="progress-ring" width="200" height="200">
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#6366F1" />
                  <stop offset="100%" style="stop-color:#06B6D4" />
                </linearGradient>
              </defs>
              <circle class="progress-ring-bg" cx="100" cy="100" r="90" />
              <circle class="progress-ring-fill" cx="100" cy="100" r="90" 
                stroke-dasharray="${565}" 
                stroke-dashoffset="${565 - (565 * progress / 100)}" />
            </svg>
            <div class="progress-text">
              <div class="progress-percentage">${progress}%</div>
              <div class="progress-label">Complete</div>
            </div>
          </div>
        </div>
        <p class="text-center" style="color: var(--color-text-secondary); margin-top: var(--space-16);">
          ${completedTasks} of ${totalTasks} tasks completed
        </p>
      </div>
      
      <div class="tasks-section">
        <div class="section-header">
          <h3 class="section-title">Urgent Tasks</h3>
          <button class="btn btn--sm" onclick="navigateToPage('tasks')">View All</button>
        </div>
        <div class="task-list">
          ${urgentTasks.length === 0 ? '<p style="text-align: center; color: var(--color-text-secondary); padding: var(--space-24);">No urgent tasks</p>' : urgentTasks.map(task => {
            const assignee = getUserById(task.assigneeId);
            const team = getTeamById(task.teamId);
            return `
              <div class="task-item" onclick="openTaskDetail(${task.id})">
                <div class="task-priority ${task.priority.toLowerCase()}"></div>
                <div class="task-details">
                  <div class="task-title">${task.title}</div>
                  <div class="task-meta">
                    <span class="task-assignee">👤 ${assignee.name}</span>
                    <span class="status status--${task.status.toLowerCase().replace(' ', '')}">⚡ ${team.icon} ${team.name}</span>
                    <span class="task-due-date ${isUrgent(task.dueDate) ? 'urgent' : ''}">📅 ${formatDate(task.dueDate)}</span>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
    
    <div class="progress-section">
      <div class="section-header">
        <h3 class="section-title">Team Progress</h3>
      </div>
      <div class="team-progress-list">
        ${teams.map((team, index) => {
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
  `;
}

// Teams Page
function renderTeams(container) {
  container.innerHTML = `
    <h2 style="margin-bottom: var(--space-24);">Teams</h2>
    <div class="grid-3">
      ${teams.map(team => {
        const lead = getUserById(team.leadId);
        const members = team.memberIds.map(id => getUserById(id));
        const teamProgress = calculateTeamProgress(team.id);
        const teamTasks = tasks.filter(t => t.teamId === team.id);
        const todoCount = teamTasks.filter(t => t.status === 'To Do').length;
        const inProgressCount = teamTasks.filter(t => t.status === 'In Progress').length;
        const doneCount = teamTasks.filter(t => t.status === 'Done').length;
        
        return `
          <div class="card" onclick="viewTeamDetail(${team.id})" style="cursor: pointer;">
            <div class="card__body">
              <div style="font-size: 48px; text-align: center; margin-bottom: var(--space-16);">${team.icon}</div>
              <h3 style="text-align: center; margin-bottom: var(--space-8);">${team.name}</h3>
              <p style="text-align: center; color: var(--color-text-secondary); font-size: var(--font-size-sm); margin-bottom: var(--space-16);">Lead: ${lead.name}</p>
              <div style="margin-bottom: var(--space-16);">
                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-8); font-size: var(--font-size-sm);">
                  <span>Progress</span>
                  <span style="font-weight: var(--font-weight-semibold);">${teamProgress}%</span>
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar color-1" style="width: ${teamProgress}%"></div>
                </div>
              </div>
              <div style="display: flex; gap: var(--space-8); margin-bottom: var(--space-16); font-size: var(--font-size-sm);">
                <span class="status status--todo">${todoCount} To Do</span>
                <span class="status status--inprogress">${inProgressCount} In Progress</span>
                <span class="status status--done">${doneCount} Done</span>
              </div>
              <button class="btn btn--primary btn--full-width" onclick="event.stopPropagation(); viewTeamDetail(${team.id})">View Details</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function viewTeamDetail(teamId) {
  const team = getTeamById(teamId);
  const lead = getUserById(team.leadId);
  const members = team.memberIds.map(id => getUserById(id));
  const teamTasks = tasks.filter(t => t.teamId === teamId);
  
  const todoTasks = teamTasks.filter(t => t.status === 'To Do');
  const inProgressTasks = teamTasks.filter(t => t.status === 'In Progress');
  const doneTasks = teamTasks.filter(t => t.status === 'Done');
  
  const container = document.getElementById('pageContent');
  container.innerHTML = `
    <div style="margin-bottom: var(--space-24);">
      <button class="btn btn--outline btn--sm" onclick="navigateToPage('teams')">← Back to Teams</button>
    </div>
    
    <div class="card" style="margin-bottom: var(--space-24);">
      <div class="card__body">
        <div style="display: flex; align-items: center; gap: var(--space-16); margin-bottom: var(--space-16);">
          <div style="font-size: 48px;">${team.icon}</div>
          <div style="flex: 1;">
            <h2>${team.name}</h2>
            <p style="color: var(--color-text-secondary); margin: var(--space-8) 0;">${team.description}</p>
            <p style="font-size: var(--font-size-sm);">Team Lead: <strong>${lead.name}</strong></p>
          </div>
          <div style="display: flex; gap: var(--space-8);">
            <a href="${team.whatsappLink}" target="_blank" class="btn btn--outline btn--sm">📱 WhatsApp</a>
            <a href="${team.telegramLink}" target="_blank" class="btn btn--outline btn--sm">✈️ Telegram</a>
          </div>
        </div>
        <div>
          <strong>Members:</strong>
          <div style="display: flex; gap: var(--space-8); margin-top: var(--space-8); flex-wrap: wrap;">
            ${members.map(m => `<span class="status status--info">${m.name}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>
    
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-24);">
      <h3>Task Board</h3>
      ${canCreateTask() ? `<button class="btn btn--primary" onclick="openCreateTaskModal(${teamId})">+ Add Task</button>` : ''}
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
  return `
    <div class="kanban-card" onclick="openTaskDetail(${task.id})">
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

// Events Page
function renderEvents(container) {
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-24);">
      <h2>Events</h2>
      ${canCreateEvent() ? `<button class="btn btn--primary" onclick="openCreateEventModal()">+ Add Event</button>` : ''}
    </div>
    
    <div class="grid-3">
      ${events.map(event => {
        const coordinator = getUserById(event.coordinatorId);
        const eventTasks = tasks.filter(t => t.eventId === event.id);
        const completedTasks = eventTasks.filter(t => t.status === 'Done').length;
        const eventProgress = eventTasks.length > 0 ? Math.round((completedTasks / eventTasks.length) * 100) : 0;
        
        return `
          <div class="card" onclick="viewEventDetail(${event.id})" style="cursor: pointer;">
            <div class="card__body">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-12);">
                <h3 style="margin: 0; flex: 1;">${event.name}</h3>
                <span class="status status--${event.type === 'Technical' ? 'info' : 'success'}">${event.type}</span>
              </div>
              <div style="margin-bottom: var(--space-12); font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                <div style="margin-bottom: var(--space-4);">📅 ${formatDate(event.date)} at ${event.time}</div>
                <div style="margin-bottom: var(--space-4);">📍 ${event.venue}</div>
                <div>👤 ${coordinator.name}</div>
              </div>
              <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-16);">${event.description}</p>
              <div style="margin-bottom: var(--space-8);">
                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-4); font-size: var(--font-size-sm);">
                  <span>Progress</span>
                  <span style="font-weight: var(--font-weight-semibold);">${eventProgress}%</span>
                </div>
                <div class="progress-bar-container">
                  <div class="progress-bar color-2" style="width: ${eventProgress}%"></div>
                </div>
              </div>
              <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                ${eventTasks.length} tasks (${completedTasks} completed)
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function viewEventDetail(eventId) {
  const event = getEventById(eventId);
  const coordinator = getUserById(event.coordinatorId);
  const eventTasks = tasks.filter(t => t.eventId === eventId);
  
  showModal('Event Details', `
    <div style="margin-bottom: var(--space-20);">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-16);">
        <h3 style="margin: 0;">${event.name}</h3>
        <span class="status status--${event.type === 'Technical' ? 'info' : 'success'}">${event.type}</span>
      </div>
      <div style="margin-bottom: var(--space-12); font-size: var(--font-size-base);">
        <div style="margin-bottom: var(--space-8);"><strong>Date:</strong> ${formatDate(event.date)} at ${event.time}</div>
        <div style="margin-bottom: var(--space-8);"><strong>Venue:</strong> ${event.venue}</div>
        <div style="margin-bottom: var(--space-8);"><strong>Coordinator:</strong> ${coordinator.name}</div>
      </div>
      <p style="color: var(--color-text-secondary);">${event.description}</p>
    </div>
    
    <h4 style="margin-bottom: var(--space-16);">Associated Tasks (${eventTasks.length})</h4>
    ${eventTasks.length === 0 ? '<p style="text-align: center; color: var(--color-text-secondary); padding: var(--space-24);">No tasks associated with this event</p>' : `
      <div style="display: flex; flex-direction: column; gap: var(--space-12);">
        ${eventTasks.map(task => {
          const assignee = getUserById(task.assigneeId);
          const team = getTeamById(task.teamId);
          return `
            <div style="padding: var(--space-12); background: var(--color-background); border-radius: var(--radius-base); border: 1px solid var(--color-border);">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-8);">
                <strong>${task.title}</strong>
                <span class="status status--${task.status.toLowerCase().replace(' ', '')}">${task.status}</span>
              </div>
              <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                <div>${team.icon} ${team.name} • 👤 ${assignee.name} • 📅 ${formatDate(task.dueDate)}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `}
  `);
}

// Tasks Page
function renderTasks(container) {
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-24);">
      <h2>All Tasks</h2>
      ${canCreateTask() ? `<button class="btn btn--primary" onclick="openCreateTaskModal()">+ Create Task</button>` : ''}
    </div>
    
    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>Team</th>
            <th>Assignee</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${tasks.map(task => {
            const team = getTeamById(task.teamId);
            const assignee = getUserById(task.assigneeId);
            return `
              <tr>
                <td><strong>${task.title}</strong></td>
                <td>${team.icon} ${team.name}</td>
                <td>${assignee.name}</td>
                <td class="${isUrgent(task.dueDate) ? 'urgent' : ''}">${formatDate(task.dueDate)}</td>
                <td><span class="status status--${task.status.toLowerCase().replace(' ', '')}">${task.status}</span></td>
                <td><span class="status status--${task.priority.toLowerCase()}">${task.priority}</span></td>
                <td>
                  <div class="table-actions">
                    <button class="icon-btn" onclick="openTaskDetail(${task.id})" title="View">👁️</button>
                    ${canEditTask(task) ? `<button class="icon-btn" onclick="openEditTaskModal(${task.id})" title="Edit">✏️</button>` : ''}
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function openTaskDetail(taskId) {
  const task = tasks.find(t => t.id === taskId);
  const team = getTeamById(task.teamId);
  const assignee = getUserById(task.assigneeId);
  const event = task.eventId ? getEventById(task.eventId) : null;
  
  showModal('Task Details', `
    <div style="margin-bottom: var(--space-20);">
      <h3 style="margin-bottom: var(--space-16);">${task.title}</h3>
      <div style="margin-bottom: var(--space-16);">
        <div style="display: flex; gap: var(--space-8); margin-bottom: var(--space-12); flex-wrap: wrap;">
          <span class="status status--${task.status.toLowerCase().replace(' ', '')}">${task.status}</span>
          <span class="status status--${task.priority.toLowerCase()}">${task.priority} Priority</span>
          <span class="status status--info">${team.icon} ${team.name}</span>
        </div>
      </div>
      <div style="margin-bottom: var(--space-16);">
        <p style="color: var(--color-text-secondary);">${task.description}</p>
      </div>
      <div style="margin-bottom: var(--space-12); font-size: var(--font-size-base);">
        <div style="margin-bottom: var(--space-8);"><strong>Assignee:</strong> ${assignee.name}</div>
        <div style="margin-bottom: var(--space-8);"><strong>Due Date:</strong> ${formatDate(task.dueDate)}</div>
        ${event ? `<div style="margin-bottom: var(--space-8);"><strong>Event:</strong> ${event.name}</div>` : ''}
      </div>
      ${canEditTask(task) ? `
        <div style="margin-top: var(--space-20);">
          <label class="form-label">Update Status</label>
          <select class="form-control" id="taskStatusSelect">
            <option value="To Do" ${task.status === 'To Do' ? 'selected' : ''}>To Do</option>
            <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Done" ${task.status === 'Done' ? 'selected' : ''}>Done</option>
          </select>
          <button class="btn btn--primary btn--full-width" style="margin-top: var(--space-12);" onclick="updateTaskStatus(${task.id})">Update Status</button>
        </div>
      ` : ''}
    </div>
  `);
}

function updateTaskStatus(taskId) {
  const newStatus = document.getElementById('taskStatusSelect').value;
  const task = tasks.find(t => t.id === taskId);
  const oldStatus = task.status;
  task.status = newStatus;
  
  if (oldStatus !== newStatus) {
    addNotification('task_updated', `Task "${task.title}" moved to ${newStatus}`, taskId);
    if (newStatus === 'Done') {
      addNotification('task_completed', `Task "${task.title}" completed!`, taskId);
    }
  }
  
  closeModal();
  if (currentPage === 'tasks') {
    navigateToPage('tasks');
  } else {
    navigateToPage(currentPage);
  }
}

// Sponsors Page
function renderSponsors(container) {
  const totalSponsors = sponsors.length;
  const totalAmount = sponsors.reduce((sum, s) => sum + s.amount, 0);
  const confirmedSponsors = sponsors.filter(s => s.status === 'Confirmed').length;
  const pendingSponsors = sponsors.filter(s => s.status !== 'Confirmed').length;
  
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-24);">
      <h2>Sponsors</h2>
      ${canManageSponsors() ? `<button class="btn btn--primary" onclick="openAddSponsorModal()">+ Add Sponsor</button>` : ''}
    </div>
    
    <div class="stats-grid" style="margin-bottom: var(--space-32);">
      <div class="stat-card">
        <div class="stat-icon bg-1">💰</div>
        <div class="stat-info">
          <div class="stat-label">Total Amount</div>
          <div class="stat-value">₹${totalAmount.toLocaleString()}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-2">🏆</div>
        <div class="stat-info">
          <div class="stat-label">Total Sponsors</div>
          <div class="stat-value">${totalSponsors}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-3">✓</div>
        <div class="stat-info">
          <div class="stat-label">Confirmed</div>
          <div class="stat-value">${confirmedSponsors}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-4">⏳</div>
        <div class="stat-info">
          <div class="stat-label">Pending</div>
          <div class="stat-value">${pendingSponsors}</div>
        </div>
      </div>
    </div>
    
    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th>Sponsor Name</th>
            <th>Tier</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Contact Person</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${sponsors.map(sponsor => `
            <tr>
              <td><strong>${sponsor.name}</strong></td>
              <td><span class="status status--${sponsor.tier.toLowerCase()}">${sponsor.tier}</span></td>
              <td>₹${sponsor.amount.toLocaleString()}</td>
              <td><span class="status status--${sponsor.status === 'Confirmed' ? 'success' : 'warning'}">${sponsor.status}</span></td>
              <td>${sponsor.contactPerson}</td>
              <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${sponsor.notes}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Logistics Page
function renderLogistics(container) {
  const categories = ['All', 'Venue', 'Certificates', 'Kits', 'Equipment'];
  
  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-24);">
      <h2>Logistics</h2>
      ${canManageLogistics() ? `<button class="btn btn--primary" onclick="openAddLogisticsModal()">+ Add Item</button>` : ''}
    </div>
    
    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Status</th>
            <th>Responsible Person</th>
            <th>Due Date</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${logistics.map(item => {
            const person = getUserById(item.responsiblePersonId);
            return `
              <tr>
                <td><strong>${item.itemName}</strong></td>
                <td><span class="status status--info">${item.category}</span></td>
                <td><span class="status status--${item.status === 'Completed' || item.status === 'Received' ? 'success' : item.status === 'Ordered' ? 'warning' : 'info'}">${item.status}</span></td>
                <td>${person.name}</td>
                <td>${formatDate(item.dueDate)}</td>
                <td style="max-width: 250px;">${item.notes}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Communication Page
function renderCommunication(container) {
  container.innerHTML = `
    <h2 style="margin-bottom: var(--space-12);">Communication Hub</h2>
    <p style="color: var(--color-text-secondary); margin-bottom: var(--space-32);">Quick access to all team communication channels</p>
    
    <div class="grid-2">
      ${teams.map(team => {
        const members = team.memberIds.map(id => getUserById(id));
        return `
          <div class="card">
            <div class="card__body">
              <div style="display: flex; align-items: center; gap: var(--space-16); margin-bottom: var(--space-16);">
                <div style="font-size: 48px;">${team.icon}</div>
                <div>
                  <h3 style="margin: 0;">${team.name}</h3>
                  <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm); margin: var(--space-4) 0 0 0;">${members.length} members</p>
                </div>
              </div>
              <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm); margin-bottom: var(--space-16);">${team.description}</p>
              <div style="display: flex; gap: var(--space-12);">
                <a href="${team.whatsappLink}" target="_blank" class="btn btn--outline btn--full-width">📱 WhatsApp</a>
                <a href="${team.telegramLink}" target="_blank" class="btn btn--primary btn--full-width">✈️ Telegram</a>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// Analytics Page
function renderAnalytics(container) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  container.innerHTML = `
    <h2 style="margin-bottom: var(--space-32);">Analytics & Reports</h2>
    
    <div class="stats-grid" style="margin-bottom: var(--space-32);">
      <div class="stat-card">
        <div class="stat-icon bg-1">📊</div>
        <div class="stat-info">
          <div class="stat-label">Completion Rate</div>
          <div class="stat-value">${completionRate}%</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-2">⚡</div>
        <div class="stat-info">
          <div class="stat-label">Active Teams</div>
          <div class="stat-value">${teams.length}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-3">📅</div>
        <div class="stat-info">
          <div class="stat-label">Total Events</div>
          <div class="stat-value">${events.length}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-4">💰</div>
        <div class="stat-info">
          <div class="stat-label">Total Funding</div>
          <div class="stat-value">₹${sponsors.reduce((sum, s) => sum + s.amount, 0).toLocaleString()}</div>
        </div>
      </div>
    </div>
    
    <div class="grid-2">
      <div class="progress-section">
        <h3 class="section-title" style="margin-bottom: var(--space-20);">Team Performance</h3>
        <div class="team-progress-list">
          ${teams.map((team, index) => {
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
      
      <div class="progress-section">
        <h3 class="section-title" style="margin-bottom: var(--space-20);">Event Distribution</h3>
        <div style="padding: var(--space-24);">
          <div style="margin-bottom: var(--space-16);">
            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-8);">
              <span>Technical Events</span>
              <strong>${events.filter(e => e.type === 'Technical').length}</strong>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar color-1" style="width: ${(events.filter(e => e.type === 'Technical').length / events.length) * 100}%"></div>
            </div>
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-8);">
              <span>Non-Technical Events</span>
              <strong>${events.filter(e => e.type === 'Non-Technical').length}</strong>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar color-2" style="width: ${(events.filter(e => e.type === 'Non-Technical').length / events.length) * 100}%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Permission Helpers
function canCreateTask() {
  return currentUser.role === 'Admin' || currentUser.role === 'Team Lead';
}

function canEditTask(task) {
  if (currentUser.role === 'Admin') return true;
  if (currentUser.role === 'Team Lead') {
    const team = getTeamById(task.teamId);
    return team.leadId === currentUser.id;
  }
  return task.assigneeId === currentUser.id;
}

function canCreateEvent() {
  return currentUser.role === 'Admin';
}

function canManageSponsors() {
  return currentUser.role === 'Admin' || currentUser.team === 'Sponsorship';
}

function canManageLogistics() {
  return currentUser.role === 'Admin' || currentUser.team === 'Logistics';
}

// Modal Functions
function showModal(title, content) {
  const modalContainer = document.getElementById('modalContainer');
  modalContainer.innerHTML = `
    <div class="modal-overlay" onclick="closeModalOnOverlay(event)">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
      </div>
    </div>
  `;
}

function closeModal() {
  document.getElementById('modalContainer').innerHTML = '';
}

function closeModalOnOverlay(event) {
  if (event.target.classList.contains('modal-overlay')) {
    closeModal();
  }
}

function openCreateTaskModal(teamId = null) {
  showModal('Create New Task', `
    <form onsubmit="handleCreateTask(event)">
      <div class="form-group">
        <label class="form-label">Task Title</label>
        <input type="text" class="form-control" id="taskTitle" required>
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea class="form-control" id="taskDescription" rows="3" required></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Team</label>
        <select class="form-control" id="taskTeam" required>
          ${teams.map(t => `<option value="${t.id}" ${teamId === t.id ? 'selected' : ''}>${t.icon} ${t.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Assignee</label>
        <select class="form-control" id="taskAssignee" required>
          ${users.filter(u => u.role !== 'Admin').map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Due Date</label>
        <input type="date" class="form-control" id="taskDueDate" required>
      </div>
      <div class="form-group">
        <label class="form-label">Priority</label>
        <select class="form-control" id="taskPriority" required>
          <option value="High">High</option>
          <option value="Medium" selected>Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn--outline" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn--primary">Create Task</button>
      </div>
    </form>
  `);
}

function handleCreateTask(event) {
  event.preventDefault();
  
  const newTask = {
    id: tasks.length + 1,
    title: document.getElementById('taskTitle').value,
    description: document.getElementById('taskDescription').value,
    teamId: parseInt(document.getElementById('taskTeam').value),
    assigneeId: parseInt(document.getElementById('taskAssignee').value),
    dueDate: document.getElementById('taskDueDate').value,
    status: 'To Do',
    priority: document.getElementById('taskPriority').value,
    eventId: null,
    files: []
  };
  
  tasks.push(newTask);
  addNotification('task_created', `New task "${newTask.title}" created`, newTask.id);
  closeModal();
  navigateToPage(currentPage);
}

function openCreateEventModal() {
  showModal('Add New Event', `
    <form onsubmit="handleCreateEvent(event)">
      <div class="form-group">
        <label class="form-label">Event Name</label>
        <input type="text" class="form-control" id="eventName" required>
      </div>
      <div class="form-group">
        <label class="form-label">Type</label>
        <select class="form-control" id="eventType" required>
          <option value="Technical">Technical</option>
          <option value="Non-Technical">Non-Technical</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Date</label>
        <input type="date" class="form-control" id="eventDate" required>
      </div>
      <div class="form-group">
        <label class="form-label">Time</label>
        <input type="time" class="form-control" id="eventTime" required>
      </div>
      <div class="form-group">
        <label class="form-label">Venue</label>
        <input type="text" class="form-control" id="eventVenue" required>
      </div>
      <div class="form-group">
        <label class="form-label">Coordinator</label>
        <select class="form-control" id="eventCoordinator" required>
          ${users.map(u => `<option value="${u.id}">${u.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea class="form-control" id="eventDescription" rows="3" required></textarea>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn--outline" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn--primary">Create Event</button>
      </div>
    </form>
  `);
}

function handleCreateEvent(event) {
  event.preventDefault();
  
  const newEvent = {
    id: events.length + 1,
    name: document.getElementById('eventName').value,
    type: document.getElementById('eventType').value,
    date: document.getElementById('eventDate').value,
    time: document.getElementById('eventTime').value,
    venue: document.getElementById('eventVenue').value,
    coordinatorId: parseInt(document.getElementById('eventCoordinator').value),
    description: document.getElementById('eventDescription').value
  };
  
  events.push(newEvent);
  closeModal();
  navigateToPage('events');
}

function openAddSponsorModal() {
  showModal('Add Sponsor', '<p style="text-align: center; padding: var(--space-24);">Sponsor form would go here</p>');
}

function openAddLogisticsModal() {
  showModal('Add Logistics Item', '<p style="text-align: center; padding: var(--space-24);">Logistics item form would go here</p>');
}

// Notification Panel
function toggleNotificationPanel() {
  const panel = document.getElementById('notificationPanel');
  panel.classList.toggle('open');
  
  if (panel.classList.contains('open')) {
    renderNotifications();
  }
}

function renderNotifications() {
  const list = document.getElementById('notificationList');
  
  if (notifications.length === 0) {
    list.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: var(--space-24);">No notifications</p>';
    return;
  }
  
  list.innerHTML = notifications.map(notif => {
    const timeAgo = getTimeAgo(notif.timestamp);
    const icons = {
      task_created: '✨',
      task_updated: '🔄',
      task_completed: '✅',
      deadline_reminder: '⚠️'
    };
    
    return `
      <div class="notification-item ${notif.read ? '' : 'unread'}" onclick="markNotificationAsRead(${notif.id})">
        <div class="notification-icon">${icons[notif.type] || '🔔'}</div>
        <div class="notification-message">${notif.message}</div>
        ${notif.taskName ? `
          <div class="notification-meta">
            <strong>${notif.taskName}</strong> • ${notif.team}
          </div>
        ` : ''}
        <div class="notification-timestamp">${timeAgo}</div>
      </div>
    `;
  }).join('');
}

function getTimeAgo(timestamp) {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = now - time;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
}

function markNotificationAsRead(notifId) {
  const notif = notifications.find(n => n.id === notifId);
  if (notif) {
    notif.read = true;
    updateNotificationBadge();
    renderNotifications();
  }
}

function markAllNotificationsRead() {
  notifications.forEach(n => n.read = true);
  updateNotificationBadge();
  renderNotifications();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      navigateToPage(this.dataset.page);
    });
  });
  
  // Logout
  document.getElementById('logoutBtn').addEventListener('click', function() {
    currentUser = null;
    document.getElementById('mainDashboard').style.display = 'none';
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('emailInput').value = '';
    document.getElementById('passwordInput').value = '';
  });
  
  // Notification bell
  document.getElementById('notificationBell').addEventListener('click', toggleNotificationPanel);
  
  // Mark all read button
  document.getElementById('markAllRead').addEventListener('click', markAllNotificationsRead);
  
  // Sidebar toggle for mobile
  document.getElementById('sidebarToggle').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('open');
  });
  
  // Close notification panel when clicking outside
  document.addEventListener('click', function(e) {
    const panel = document.getElementById('notificationPanel');
    const bell = document.getElementById('notificationBell');
    if (!panel.contains(e.target) && !bell.contains(e.target)) {
      panel.classList.remove('open');
    }
  });
});