// ===== Global State =====
let currentToken = null;
let currentUser = null;

// ===== Utility Functions =====
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function formatJSON(data) {
    return JSON.stringify(data, null, 2);
}

function showResult(elementId, data, isError = false) {
    const element = document.getElementById(elementId);
    element.style.display = 'block';
    element.textContent = formatJSON(data);
    element.className = `result-box ${isError ? 'error' : 'success'}`;
}

function hideResult(elementId) {
    const element = document.getElementById(elementId);
    element.style.display = 'none';
}

async function apiRequest(method, endpoint, body = null, useAuth = false) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (useAuth && currentToken) {
        options.headers['Authorization'] = `Bearer ${currentToken}`;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(endpoint, options);
        const data = await response.json();
        
        return {
            status: response.status,
            ok: response.ok,
            data
        };
    } catch (error) {
        return {
            status: 0,
            ok: false,
            data: { error: error.message }
        };
    }
}

// ===== Navigation =====
function switchView(viewName) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.view === viewName) {
            item.classList.add('active');
        }
    });

    // Update views
    document.querySelectorAll('.view-content').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewName}View`).classList.add('active');

    // Update title
    const titles = {
        dashboard: 'Dashboard',
        auth: 'Authentication',
        teams: 'Teams',
        subscriptions: 'Subscriptions',
        tickets: 'Tickets',
        admin: 'Admin'
    };
    document.getElementById('viewTitle').textContent = titles[viewName] || viewName;
}

// ===== Dashboard Functions =====
async function loadDashboardStats() {
    try {
        // Load teams count
        const teamsResponse = await apiRequest('GET', '/api/teams');
        if (teamsResponse.ok && Array.isArray(teamsResponse.data)) {
            document.getElementById('totalTeams').textContent = teamsResponse.data.length;
        }

        // Update auth status
        updateAuthStatus();
        
        // Placeholder for other stats
        document.getElementById('activeSubscriptions').textContent = '0';
        document.getElementById('ticketsUsed').textContent = '0';
        document.getElementById('authSessions').textContent = currentToken ? '1' : '0';
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

function updateAuthStatus() {
    const statusDot = document.getElementById('authStatusDot');
    const statusBadge = document.getElementById('authStatusBadge');
    const userNameEl = document.getElementById('userName');
    const authStatusEl = document.getElementById('authStatus');

    if (currentToken) {
        statusDot.className = 'status-dot status-success';
        statusBadge.className = 'status-badge status-success';
        statusBadge.textContent = 'Active';
        userNameEl.textContent = currentUser?.email || 'Authenticated User';
        authStatusEl.textContent = 'Authenticated';
    } else {
        statusDot.className = 'status-dot';
        statusBadge.className = 'status-badge';
        statusBadge.textContent = 'Inactive';
        userNameEl.textContent = 'Guest User';
        authStatusEl.textContent = 'Not authenticated';
    }
}

// ===== Authentication Functions =====
async function generateToken(event) {
    event.preventDefault();
    hideResult('tokenResult');

    const userId = document.getElementById('userId').value;
    const email = document.getElementById('userEmail').value;

    const response = await apiRequest('POST', '/api/auth/token', {
        userId,
        email
    });

    showResult('tokenResult', response.data, !response.ok);

    if (response.ok && response.data.token) {
        currentToken = response.data.token;
        currentUser = { userId, email };
        showToast('Token generated successfully!', 'success');
        updateAuthStatus();
        loadDashboardStats();
    } else {
        showToast('Failed to generate token', 'error');
    }
}

async function validateToken(event) {
    event.preventDefault();
    hideResult('validateResult');

    const token = document.getElementById('validateToken').value;

    const response = await apiRequest('POST', '/api/auth/validate', { token });

    showResult('validateResult', response.data, !response.ok);

    if (response.ok) {
        showToast('Token is valid!', 'success');
    } else {
        showToast('Token validation failed', 'error');
    }
}

async function logout(event) {
    event.preventDefault();
    hideResult('logoutResult');

    const token = document.getElementById('logoutToken').value;

    const response = await apiRequest('POST', '/api/auth/logout', { token });

    showResult('logoutResult', response.data, !response.ok);

    if (response.ok) {
        if (token === currentToken) {
            currentToken = null;
            currentUser = null;
            updateAuthStatus();
            loadDashboardStats();
        }
        showToast('Logged out successfully!', 'success');
    } else {
        showToast('Logout failed', 'error');
    }
}

// ===== Teams Functions =====
async function loadTeams() {
    const listElement = document.getElementById('teamsList');
    listElement.innerHTML = '<p style="color: var(--text-muted);">Loading...</p>';

    const response = await apiRequest('GET', '/api/teams');

    if (response.ok && Array.isArray(response.data)) {
        if (response.data.length === 0) {
            listElement.innerHTML = '<p style="color: var(--text-muted);">No teams found</p>';
        } else {
            listElement.innerHTML = response.data.map(team => `
                <div class="data-item">
                    <div class="data-item-header">
                        <span class="data-item-title">${team.name || 'Unknown Team'}</span>
                        <span class="data-item-badge">ID: ${team.id}</span>
                    </div>
                    <div class="data-item-content">
                        ${team.sport || 'Unknown Sport'} • ${team.city || 'Unknown City'}
                    </div>
                </div>
            `).join('');
        }
        showToast('Teams loaded successfully!', 'success');
    } else {
        listElement.innerHTML = `<div class="result-box error">${formatJSON(response.data)}</div>`;
        showToast('Failed to load teams', 'error');
    }
}

async function loadPackages(event) {
    event.preventDefault();
    const listElement = document.getElementById('packagesList');
    listElement.innerHTML = '<p style="color: var(--text-muted);">Loading...</p>';

    const teamId = document.getElementById('teamId').value;

    const response = await apiRequest('GET', `/api/teams/${teamId}/packages`);

    if (response.ok && Array.isArray(response.data)) {
        if (response.data.length === 0) {
            listElement.innerHTML = '<p style="color: var(--text-muted);">No packages found</p>';
        } else {
            listElement.innerHTML = response.data.map(pkg => `
                <div class="data-item">
                    <div class="data-item-header">
                        <span class="data-item-title">${pkg.name || 'Unknown Package'}</span>
                        <span class="data-item-badge">$${pkg.price || '0'}</span>
                    </div>
                    <div class="data-item-content">
                        ID: ${pkg.id} • Games: ${pkg.games || 0} • Seats: ${pkg.seats || 0}
                    </div>
                </div>
            `).join('');
        }
        showToast('Packages loaded successfully!', 'success');
    } else {
        listElement.innerHTML = `<div class="result-box error">${formatJSON(response.data)}</div>`;
        showToast('Failed to load packages', 'error');
    }
}

// ===== Subscription Functions =====
async function createSubscription(event) {
    event.preventDefault();
    hideResult('createSubResult');

    const userId = document.getElementById('subUserId').value;
    const packageId = parseInt(document.getElementById('subPackageId').value);
    const seats = parseInt(document.getElementById('subSeats').value);
    const autoRenew = document.getElementById('subAutoRenew').value === 'true';

    const response = await apiRequest('POST', '/api/subscriptions', {
        userId,
        packageId,
        seats,
        autoRenew
    });

    showResult('createSubResult', response.data, !response.ok);

    if (response.ok) {
        showToast('Subscription created successfully!', 'success');
    } else {
        showToast('Failed to create subscription', 'error');
    }
}

async function getSubscription(event) {
    event.preventDefault();
    hideResult('getSubResult');

    const subId = document.getElementById('getSubId').value;

    const response = await apiRequest('GET', `/api/subscriptions/${subId}`);

    showResult('getSubResult', response.data, !response.ok);

    if (response.ok) {
        showToast('Subscription details loaded!', 'success');
    } else {
        showToast('Failed to get subscription', 'error');
    }
}

async function renewSubscription(event) {
    event.preventDefault();
    hideResult('renewSubResult');

    const subId = document.getElementById('renewSubId').value;

    const response = await apiRequest('PUT', `/api/subscriptions/${subId}/renew`);

    showResult('renewSubResult', response.data, !response.ok);

    if (response.ok) {
        showToast('Subscription renewed successfully!', 'success');
    } else {
        showToast('Failed to renew subscription', 'error');
    }
}

async function cancelSubscription(event) {
    event.preventDefault();
    hideResult('cancelSubResult');

    const subId = document.getElementById('cancelSubId').value;

    const response = await apiRequest('POST', `/api/subscriptions/${subId}/cancel`);

    showResult('cancelSubResult', response.data, !response.ok);

    if (response.ok) {
        showToast('Subscription cancelled successfully!', 'success');
    } else {
        showToast('Failed to cancel subscription', 'error');
    }
}

async function updateSettings(event) {
    event.preventDefault();
    hideResult('settingsResult');

    const subId = document.getElementById('settingsSubId').value;
    const autoRenew = document.getElementById('settingsAutoRenew').value === 'true';

    const response = await apiRequest('PUT', `/api/subscriptions/${subId}/settings`, {
        autoRenew
    });

    showResult('settingsResult', response.data, !response.ok);

    if (response.ok) {
        showToast('Settings updated successfully!', 'success');
    } else {
        showToast('Failed to update settings', 'error');
    }
}

async function calculatePrice(event) {
    event.preventDefault();
    hideResult('priceResult');

    const subId = document.getElementById('priceSubId').value;

    const response = await apiRequest('POST', `/api/subscriptions/${subId}/calculate-price`);

    showResult('priceResult', response.data, !response.ok);

    if (response.ok) {
        showToast('Price calculated successfully!', 'success');
    } else {
        showToast('Failed to calculate price', 'error');
    }
}

// ===== Ticket Functions =====
async function useTicket(event) {
    event.preventDefault();
    hideResult('useTicketResult');

    const subId = document.getElementById('useTicketSubId').value;
    const ticketId = parseInt(document.getElementById('useTicketId').value);

    const response = await apiRequest('POST', `/api/subscriptions/${subId}/use-ticket`, {
        ticketId
    });

    showResult('useTicketResult', response.data, !response.ok);

    if (response.ok) {
        showToast('Ticket used successfully!', 'success');
    } else {
        showToast('Failed to use ticket', 'error');
    }
}

async function assignTicket(event) {
    event.preventDefault();
    hideResult('assignTicketResult');

    const subId = document.getElementById('assignTicketSubId').value;
    const gameId = parseInt(document.getElementById('assignTicketGameId').value);
    const seatNumber = document.getElementById('assignTicketSeat').value;

    const response = await apiRequest('POST', `/api/subscriptions/${subId}/assign-ticket`, {
        gameId,
        seatNumber
    });

    showResult('assignTicketResult', response.data, !response.ok);

    if (response.ok) {
        showToast('Ticket assigned successfully!', 'success');
    } else {
        showToast('Failed to assign ticket', 'error');
    }
}

// ===== Admin Functions =====
async function processRenewals() {
    const resultElement = document.getElementById('renewalsResult');
    resultElement.style.display = 'block';
    resultElement.textContent = 'Processing renewals...';
    resultElement.className = 'result-box';

    const response = await apiRequest('POST', '/api/subscriptions/process-renewals');

    showResult('renewalsResult', response.data, !response.ok);

    if (response.ok) {
        showToast('Renewals processed successfully!', 'success');
    } else {
        showToast('Failed to process renewals', 'error');
    }
}

async function testEndpoint(event) {
    event.preventDefault();
    hideResult('apiTestResult');

    const method = document.getElementById('testMethod').value;
    const endpoint = document.getElementById('testEndpoint').value;
    const bodyText = document.getElementById('testBody').value;

    let body = null;
    if (bodyText.trim() && (method === 'POST' || method === 'PUT')) {
        try {
            body = JSON.parse(bodyText);
        } catch (error) {
            showToast('Invalid JSON in request body', 'error');
            showResult('apiTestResult', { error: 'Invalid JSON: ' + error.message }, true);
            return;
        }
    }

    const response = await apiRequest(method, endpoint, body);

    const result = {
        status: response.status,
        statusText: response.ok ? 'OK' : 'Error',
        data: response.data
    };

    showResult('apiTestResult', result, !response.ok);

    if (response.ok) {
        showToast('API request successful!', 'success');
    } else {
        showToast('API request failed', 'error');
    }
}

// ===== Refresh Function =====
async function refreshCurrentView() {
    const activeView = document.querySelector('.view-content.active');
    const viewId = activeView.id;

    showToast('Refreshing...', 'success');

    switch (viewId) {
        case 'dashboardView':
            await loadDashboardStats();
            break;
        case 'teamsView':
            await loadTeams();
            break;
        default:
            showToast('View refreshed', 'success');
    }
}

// ===== Event Listeners =====
document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            switchView(item.dataset.view);
        });
    });

    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', refreshCurrentView);

    // Authentication forms
    document.getElementById('tokenForm').addEventListener('submit', generateToken);
    document.getElementById('validateForm').addEventListener('submit', validateToken);
    document.getElementById('logoutForm').addEventListener('submit', logout);

    // Teams
    document.getElementById('loadTeamsBtn').addEventListener('click', loadTeams);
    document.getElementById('packagesForm').addEventListener('submit', loadPackages);

    // Subscriptions
    document.getElementById('createSubForm').addEventListener('submit', createSubscription);
    document.getElementById('getSubForm').addEventListener('submit', getSubscription);
    document.getElementById('renewSubForm').addEventListener('submit', renewSubscription);
    document.getElementById('cancelSubForm').addEventListener('submit', cancelSubscription);
    document.getElementById('settingsForm').addEventListener('submit', updateSettings);
    document.getElementById('priceForm').addEventListener('submit', calculatePrice);

    // Tickets
    document.getElementById('useTicketForm').addEventListener('submit', useTicket);
    document.getElementById('assignTicketForm').addEventListener('submit', assignTicket);

    // Admin
    document.getElementById('processRenewalsBtn').addEventListener('click', processRenewals);
    document.getElementById('apiTestForm').addEventListener('submit', testEndpoint);

    // Load initial dashboard stats
    loadDashboardStats();
});

// Make switchView globally available
window.switchView = switchView;
