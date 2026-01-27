// Content Creator Organizer - Main Application JavaScript

// Data Store
let appData = {
    content: [],
    meetings: [],
    projects: []
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initializeNavigation();
    initializeModals();
    initializeForms();
    initializeFilters();
    initializeExportImport();
    updateDashboard();
    renderContent();
    renderMeetings();
    renderProjects();
    updateCurrentDate();
});

// ==================== DATA MANAGEMENT ====================

function loadData() {
    const savedData = localStorage.getItem('contentCreatorOrganizerData');
    if (savedData) {
        appData = JSON.parse(savedData);
    }
}

function saveData() {
    localStorage.setItem('contentCreatorOrganizerData', JSON.stringify(appData));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ==================== NAVIGATION ====================

function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabName = item.dataset.tab;

            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Show corresponding tab content
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

function updateCurrentDate() {
    const dateDisplay = document.getElementById('currentDate');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = new Date().toLocaleDateString('en-US', options);
}

// ==================== MODALS ====================

function initializeModals() {
    // Close buttons
    document.querySelectorAll('[data-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.dataset.modal;
            closeModal(modalId);
        });
    });

    // Close on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Open modal buttons
    document.getElementById('addContentBtn').addEventListener('click', () => {
        openContentModal();
    });

    document.getElementById('addMeetingBtn').addEventListener('click', () => {
        openMeetingModal();
    });

    document.getElementById('addProjectBtn').addEventListener('click', () => {
        openProjectModal();
    });
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// ==================== CONTENT MANAGEMENT ====================

function openContentModal(content = null) {
    const modal = document.getElementById('contentModal');
    const form = document.getElementById('contentForm');
    const title = document.getElementById('contentModalTitle');

    form.reset();

    if (content) {
        title.textContent = 'Edit Content';
        document.getElementById('contentId').value = content.id;
        document.getElementById('contentTitle').value = content.title;
        document.getElementById('contentPlatform').value = content.platform;
        document.getElementById('contentStatus').value = content.status;
        document.getElementById('contentDeadline').value = content.deadline || '';
        document.getElementById('contentDescription').value = content.description || '';
        document.getElementById('contentNotes').value = content.notes || '';
    } else {
        title.textContent = 'Add Content';
        document.getElementById('contentId').value = '';
    }

    openModal('contentModal');
}

function initializeForms() {
    // Content Form
    document.getElementById('contentForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const id = document.getElementById('contentId').value;
        const contentItem = {
            id: id || generateId(),
            title: document.getElementById('contentTitle').value,
            platform: document.getElementById('contentPlatform').value,
            status: document.getElementById('contentStatus').value,
            deadline: document.getElementById('contentDeadline').value,
            description: document.getElementById('contentDescription').value,
            notes: document.getElementById('contentNotes').value,
            createdAt: id ? appData.content.find(c => c.id === id)?.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (id) {
            const index = appData.content.findIndex(c => c.id === id);
            appData.content[index] = contentItem;
        } else {
            appData.content.push(contentItem);
        }

        saveData();
        renderContent();
        updateDashboard();
        closeModal('contentModal');
    });

    // Meeting Form
    document.getElementById('meetingForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const id = document.getElementById('meetingId').value;
        const meetingItem = {
            id: id || generateId(),
            title: document.getElementById('meetingTitle').value,
            type: document.getElementById('meetingType').value,
            date: document.getElementById('meetingDate').value,
            time: document.getElementById('meetingTime').value,
            duration: document.getElementById('meetingDuration').value,
            link: document.getElementById('meetingLink').value,
            attendees: document.getElementById('meetingAttendees').value,
            notes: document.getElementById('meetingNotes').value,
            createdAt: id ? appData.meetings.find(m => m.id === id)?.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (id) {
            const index = appData.meetings.findIndex(m => m.id === id);
            appData.meetings[index] = meetingItem;
        } else {
            appData.meetings.push(meetingItem);
        }

        saveData();
        renderMeetings();
        updateDashboard();
        closeModal('meetingModal');
    });

    // Project Form
    document.getElementById('projectForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const id = document.getElementById('projectId').value;
        const tasks = getTasksFromForm();

        const projectItem = {
            id: id || generateId(),
            name: document.getElementById('projectName').value,
            status: document.getElementById('projectStatus').value,
            priority: document.getElementById('projectPriority').value,
            deadline: document.getElementById('projectDeadline').value,
            description: document.getElementById('projectDescription').value,
            tasks: tasks,
            createdAt: id ? appData.projects.find(p => p.id === id)?.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (id) {
            const index = appData.projects.findIndex(p => p.id === id);
            appData.projects[index] = projectItem;
        } else {
            appData.projects.push(projectItem);
        }

        saveData();
        renderProjects();
        updateDashboard();
        closeModal('projectModal');
    });

    // Add Task Button
    document.getElementById('addTaskBtn').addEventListener('click', addTaskInput);
}

function deleteContent(id) {
    showConfirmDialog('Are you sure you want to delete this content?', () => {
        appData.content = appData.content.filter(c => c.id !== id);
        saveData();
        renderContent();
        updateDashboard();
    });
}

function renderContent() {
    const grid = document.getElementById('contentGrid');
    const platformFilter = document.getElementById('contentPlatformFilter').value;
    const statusFilter = document.getElementById('contentStatusFilter').value;

    let filteredContent = appData.content;

    if (platformFilter !== 'all') {
        filteredContent = filteredContent.filter(c => c.platform === platformFilter);
    }

    if (statusFilter !== 'all') {
        filteredContent = filteredContent.filter(c => c.status === statusFilter);
    }

    // Sort by deadline
    filteredContent.sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
    });

    if (filteredContent.length === 0) {
        grid.innerHTML = '<div class="empty-state">No content items yet. Click "Add Content" to create one.</div>';
        return;
    }

    grid.innerHTML = filteredContent.map(content => {
        const deadlineClass = getDeadlineClass(content.deadline);
        const deadlineText = content.deadline ? formatDate(content.deadline) : 'No deadline';

        return `
            <div class="content-card">
                <div class="content-card-header">
                    <div>
                        <div class="content-card-title">${escapeHtml(content.title)}</div>
                        <span class="platform-badge platform-${content.platform}">${getPlatformLabel(content.platform)}</span>
                    </div>
                    <div class="content-card-actions">
                        <button onclick="openContentModal(appData.content.find(c => c.id === '${content.id}'))" title="Edit">&#9998;</button>
                        <button class="delete" onclick="deleteContent('${content.id}')" title="Delete">&#128465;</button>
                    </div>
                </div>
                ${content.description ? `<p class="content-card-description">${escapeHtml(content.description)}</p>` : ''}
                <div class="content-card-footer">
                    <span class="status-badge status-${content.status}">${getStatusLabel(content.status)}</span>
                    <span class="deadline ${deadlineClass}">${deadlineText}</span>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== MEETINGS MANAGEMENT ====================

function openMeetingModal(meeting = null) {
    const modal = document.getElementById('meetingModal');
    const form = document.getElementById('meetingForm');
    const title = document.getElementById('meetingModalTitle');

    form.reset();

    if (meeting) {
        title.textContent = 'Edit Meeting';
        document.getElementById('meetingId').value = meeting.id;
        document.getElementById('meetingTitle').value = meeting.title;
        document.getElementById('meetingType').value = meeting.type;
        document.getElementById('meetingDate').value = meeting.date;
        document.getElementById('meetingTime').value = meeting.time;
        document.getElementById('meetingDuration').value = meeting.duration || 30;
        document.getElementById('meetingLink').value = meeting.link || '';
        document.getElementById('meetingAttendees').value = meeting.attendees || '';
        document.getElementById('meetingNotes').value = meeting.notes || '';
    } else {
        title.textContent = 'Add Meeting';
        document.getElementById('meetingId').value = '';
        document.getElementById('meetingDate').value = new Date().toISOString().split('T')[0];
    }

    openModal('meetingModal');
}

function deleteMeeting(id) {
    showConfirmDialog('Are you sure you want to delete this meeting?', () => {
        appData.meetings = appData.meetings.filter(m => m.id !== id);
        saveData();
        renderMeetings();
        updateDashboard();
    });
}

function renderMeetings() {
    const list = document.getElementById('meetingsList');
    const typeFilter = document.getElementById('meetingTypeFilter').value;
    const dateFilter = document.getElementById('meetingDateFilter').value;

    let filteredMeetings = appData.meetings;

    if (typeFilter !== 'all') {
        filteredMeetings = filteredMeetings.filter(m => m.type === typeFilter);
    }

    if (dateFilter) {
        filteredMeetings = filteredMeetings.filter(m => m.date === dateFilter);
    }

    // Sort by date and time
    filteredMeetings.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
    });

    if (filteredMeetings.length === 0) {
        list.innerHTML = '<div class="empty-state">No meetings scheduled. Click "Add Meeting" to schedule one.</div>';
        return;
    }

    list.innerHTML = filteredMeetings.map(meeting => {
        const formattedTime = formatTime(meeting.time);
        const formattedDate = formatDate(meeting.date);

        return `
            <div class="meeting-card">
                <div class="meeting-time">
                    <div class="time">${formattedTime}</div>
                    <div class="date">${formattedDate}</div>
                </div>
                <div class="meeting-details">
                    <div class="meeting-title">${escapeHtml(meeting.title)}</div>
                    <div class="meeting-meta">
                        <span class="meeting-type type-${meeting.type}">${getMeetingTypeLabel(meeting.type)}</span>
                        <span>${meeting.duration || 30} min</span>
                        ${meeting.attendees ? `<span>${escapeHtml(meeting.attendees)}</span>` : ''}
                    </div>
                    ${meeting.link ? `<a href="${escapeHtml(meeting.link)}" target="_blank" class="meeting-link">Join Meeting</a>` : ''}
                </div>
                <div class="meeting-actions">
                    <button onclick="openMeetingModal(appData.meetings.find(m => m.id === '${meeting.id}'))" title="Edit">&#9998;</button>
                    <button class="delete" onclick="deleteMeeting('${meeting.id}')" title="Delete">&#128465;</button>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== PROJECTS MANAGEMENT ====================

function openProjectModal(project = null) {
    const modal = document.getElementById('projectModal');
    const form = document.getElementById('projectForm');
    const title = document.getElementById('projectModalTitle');
    const tasksContainer = document.getElementById('tasksContainer');

    form.reset();
    tasksContainer.innerHTML = '';

    if (project) {
        title.textContent = 'Edit Project';
        document.getElementById('projectId').value = project.id;
        document.getElementById('projectName').value = project.name;
        document.getElementById('projectStatus').value = project.status;
        document.getElementById('projectPriority').value = project.priority;
        document.getElementById('projectDeadline').value = project.deadline || '';
        document.getElementById('projectDescription').value = project.description || '';

        // Populate tasks
        if (project.tasks && project.tasks.length > 0) {
            project.tasks.forEach(task => {
                addTaskInput(task.text, task.completed);
            });
        }
    } else {
        title.textContent = 'Add Project';
        document.getElementById('projectId').value = '';
    }

    openModal('projectModal');
}

function addTaskInput(text = '', completed = false) {
    const tasksContainer = document.getElementById('tasksContainer');
    const taskRow = document.createElement('div');
    taskRow.className = 'task-input-row';
    taskRow.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${completed ? 'checked' : ''}>
        <input type="text" class="task-text-input" placeholder="Task description" value="${escapeHtml(text)}">
        <button type="button" class="task-remove-btn" onclick="this.parentElement.remove()">&times;</button>
    `;
    tasksContainer.appendChild(taskRow);
}

function getTasksFromForm() {
    const taskRows = document.querySelectorAll('#tasksContainer .task-input-row');
    const tasks = [];

    taskRows.forEach(row => {
        const text = row.querySelector('.task-text-input').value.trim();
        const completed = row.querySelector('.task-checkbox').checked;

        if (text) {
            tasks.push({ text, completed });
        }
    });

    return tasks;
}

function deleteProject(id) {
    showConfirmDialog('Are you sure you want to delete this project?', () => {
        appData.projects = appData.projects.filter(p => p.id !== id);
        saveData();
        renderProjects();
        updateDashboard();
    });
}

function toggleProjectTask(projectId, taskIndex) {
    const project = appData.projects.find(p => p.id === projectId);
    if (project && project.tasks[taskIndex]) {
        project.tasks[taskIndex].completed = !project.tasks[taskIndex].completed;
        saveData();
        renderProjects();
        updateDashboard();
    }
}

function renderProjects() {
    const grid = document.getElementById('projectsGrid');
    const statusFilter = document.getElementById('projectStatusFilter').value;
    const priorityFilter = document.getElementById('projectPriorityFilter').value;

    let filteredProjects = appData.projects;

    if (statusFilter !== 'all') {
        filteredProjects = filteredProjects.filter(p => p.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
        filteredProjects = filteredProjects.filter(p => p.priority === priorityFilter);
    }

    // Sort by priority then deadline
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    filteredProjects.sort((a, b) => {
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
    });

    if (filteredProjects.length === 0) {
        grid.innerHTML = '<div class="empty-state">No projects yet. Click "Add Project" to create one.</div>';
        return;
    }

    grid.innerHTML = filteredProjects.map(project => {
        const progress = calculateProgress(project.tasks);
        const completedTasks = project.tasks ? project.tasks.filter(t => t.completed).length : 0;
        const totalTasks = project.tasks ? project.tasks.length : 0;

        return `
            <div class="project-card">
                <div class="project-header">
                    <div class="project-title">${escapeHtml(project.name)}</div>
                    <div class="project-actions">
                        <button onclick="openProjectModal(appData.projects.find(p => p.id === '${project.id}'))" title="Edit">&#9998;</button>
                        <button class="delete" onclick="deleteProject('${project.id}')" title="Delete">&#128465;</button>
                    </div>
                </div>
                <div class="project-badges">
                    <span class="project-status-badge project-status-${project.status}">${getProjectStatusLabel(project.status)}</span>
                    <span class="priority-badge priority-${project.priority}">${project.priority}</span>
                </div>
                ${project.description ? `<p class="project-description">${escapeHtml(project.description)}</p>` : ''}
                <div class="project-progress">
                    <div class="progress-header">
                        <span class="progress-label">Progress</span>
                        <span class="progress-value">${progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                ${totalTasks > 0 ? `
                    <div class="project-tasks">
                        <h4>Tasks (${completedTasks}/${totalTasks})</h4>
                        <ul class="task-list">
                            ${project.tasks.map((task, index) => `
                                <li class="task-item">
                                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}
                                           onchange="toggleProjectTask('${project.id}', ${index})">
                                    <span class="task-text ${task.completed ? 'completed' : ''}">${escapeHtml(task.text)}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
                <div class="project-footer">
                    ${project.deadline ? `<span>Due: ${formatDate(project.deadline)}</span>` : '<span>No deadline</span>'}
                </div>
            </div>
        `;
    }).join('');
}

function calculateProgress(tasks) {
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
}

// ==================== FILTERS ====================

function initializeFilters() {
    // Content filters
    document.getElementById('contentPlatformFilter').addEventListener('change', renderContent);
    document.getElementById('contentStatusFilter').addEventListener('change', renderContent);

    // Meeting filters
    document.getElementById('meetingTypeFilter').addEventListener('change', renderMeetings);
    document.getElementById('meetingDateFilter').addEventListener('change', renderMeetings);

    // Project filters
    document.getElementById('projectStatusFilter').addEventListener('change', renderProjects);
    document.getElementById('projectPriorityFilter').addEventListener('change', renderProjects);
}

// ==================== DASHBOARD ====================

function updateDashboard() {
    // Update stats
    document.getElementById('totalContent').textContent = appData.content.length;

    // Meetings this week
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const meetingsThisWeek = appData.meetings.filter(m => {
        const meetingDate = new Date(m.date);
        return meetingDate >= now && meetingDate <= weekFromNow;
    });
    document.getElementById('totalMeetings').textContent = meetingsThisWeek.length;

    // Active projects
    const activeProjects = appData.projects.filter(p => p.status === 'active');
    document.getElementById('activeProjects').textContent = activeProjects.length;

    // Upcoming deadlines (content + projects within 7 days)
    const upcomingContent = appData.content.filter(c => {
        if (!c.deadline) return false;
        const deadline = new Date(c.deadline);
        return deadline >= now && deadline <= weekFromNow && c.status !== 'published';
    });
    const upcomingProjects = appData.projects.filter(p => {
        if (!p.deadline) return false;
        const deadline = new Date(p.deadline);
        return deadline >= now && deadline <= weekFromNow && p.status !== 'completed';
    });
    document.getElementById('upcomingDeadlines').textContent = upcomingContent.length + upcomingProjects.length;

    // Upcoming content list
    const upcomingContentList = document.getElementById('upcomingContent');
    const sortedContent = [...appData.content]
        .filter(c => c.status !== 'published')
        .sort((a, b) => {
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return new Date(a.deadline) - new Date(b.deadline);
        })
        .slice(0, 5);

    if (sortedContent.length === 0) {
        upcomingContentList.innerHTML = '<li class="empty-state">No upcoming content</li>';
    } else {
        upcomingContentList.innerHTML = sortedContent.map(c => `
            <li>
                <span class="item-title">${escapeHtml(c.title)}</span>
                <span class="item-meta">${c.deadline ? formatDate(c.deadline) : 'No deadline'}</span>
            </li>
        `).join('');
    }

    // Today's meetings
    const todayMeetingsList = document.getElementById('todayMeetings');
    const today = new Date().toISOString().split('T')[0];
    const todaysMeetings = appData.meetings
        .filter(m => m.date === today)
        .sort((a, b) => a.time.localeCompare(b.time));

    if (todaysMeetings.length === 0) {
        todayMeetingsList.innerHTML = '<li class="empty-state">No meetings today</li>';
    } else {
        todayMeetingsList.innerHTML = todaysMeetings.map(m => `
            <li>
                <span class="item-title">${escapeHtml(m.title)}</span>
                <span class="item-meta">${formatTime(m.time)}</span>
            </li>
        `).join('');
    }

    // Project progress
    const projectProgressList = document.getElementById('projectProgress');
    const projectsWithProgress = appData.projects
        .filter(p => p.status === 'active')
        .slice(0, 5);

    if (projectsWithProgress.length === 0) {
        projectProgressList.innerHTML = '<li class="empty-state">No active projects</li>';
    } else {
        projectProgressList.innerHTML = projectsWithProgress.map(p => `
            <li>
                <span class="item-title">${escapeHtml(p.name)}</span>
                <span class="item-meta">${calculateProgress(p.tasks)}% complete</span>
            </li>
        `).join('');
    }
}

// ==================== EXPORT / IMPORT ====================

function initializeExportImport() {
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', importData);
}

function exportData() {
    const dataStr = JSON.stringify(appData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `content-creator-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);

            // Validate structure
            if (!importedData.content || !importedData.meetings || !importedData.projects) {
                alert('Invalid file format. Please select a valid export file.');
                return;
            }

            showConfirmDialog('This will replace all existing data. Continue?', () => {
                appData = importedData;
                saveData();
                renderContent();
                renderMeetings();
                renderProjects();
                updateDashboard();
                alert('Data imported successfully!');
            });
        } catch (error) {
            alert('Error reading file. Please ensure it is a valid JSON file.');
        }
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = '';
}

// ==================== CONFIRMATION DIALOG ====================

let confirmCallback = null;

function showConfirmDialog(message, callback) {
    document.getElementById('confirmMessage').textContent = message;
    confirmCallback = callback;
    openModal('confirmModal');
}

document.getElementById('confirmBtn').addEventListener('click', () => {
    if (confirmCallback) {
        confirmCallback();
        confirmCallback = null;
    }
    closeModal('confirmModal');
});

// ==================== UTILITY FUNCTIONS ====================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatTime(timeStr) {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

function getDeadlineClass(deadline) {
    if (!deadline) return '';

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays <= 3) return 'soon';
    return '';
}

function getPlatformLabel(platform) {
    const labels = {
        youtube: 'YouTube',
        blog: 'Blog',
        instagram: 'Instagram',
        twitter: 'Twitter/X',
        tiktok: 'TikTok',
        podcast: 'Podcast',
        newsletter: 'Newsletter',
        other: 'Other'
    };
    return labels[platform] || platform;
}

function getStatusLabel(status) {
    const labels = {
        idea: 'Idea',
        'in-progress': 'In Progress',
        review: 'Review',
        scheduled: 'Scheduled',
        published: 'Published'
    };
    return labels[status] || status;
}

function getMeetingTypeLabel(type) {
    const labels = {
        client: 'Client Call',
        team: 'Team Sync',
        interview: 'Interview',
        collab: 'Collaboration',
        other: 'Other'
    };
    return labels[type] || type;
}

function getProjectStatusLabel(status) {
    const labels = {
        active: 'Active',
        'on-hold': 'On Hold',
        completed: 'Completed'
    };
    return labels[status] || status;
}
