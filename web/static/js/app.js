// PromptMapGUI - Client-side JavaScript

// Initialize Socket.IO connection
const socket = io();

// DOM elements
const startScanBtn = document.getElementById('start-scan');
const stopScanBtn = document.getElementById('stop-scan');
const targetModelInput = document.getElementById('target-model');
const targetModelTypeSelect = document.getElementById('target-model-type');
const httpConfigGroup = document.getElementById('http-config-group');
const httpConfigInput = document.getElementById('http-config');
const controllerModelInput = document.getElementById('controller-model');
const controllerModelTypeSelect = document.getElementById('controller-model-type');
const iterationsInput = document.getElementById('iterations');
const ruleTypeSelect = document.getElementById('rule-type');
const firewallModeCheckbox = document.getElementById('firewall-mode');
const passConditionGroup = document.getElementById('pass-condition-group');
const passConditionInput = document.getElementById('pass-condition');
const statusDisplay = document.getElementById('status-display');
const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const currentRuleSpan = document.querySelector('#current-rule span');
const progressTextSpan = document.querySelector('#progress-text span');
const outputLog = document.getElementById('output-log');
const resultsContainer = document.getElementById('results-container');
const resultsSummary = document.getElementById('results-summary');
const resultsDetails = document.getElementById('results-details');

// State
let scanRunning = false;
let totalRules = 0;
let completedRules = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadRuleCategories();
    setupEventListeners();
});

// Load available rule categories
async function loadRuleCategories() {
    try {
        const response = await fetch('/api/rules');
        const data = await response.json();
        
        // Populate rule categories
        ruleTypeSelect.innerHTML = '<option value="">All Categories</option>';
        data.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            ruleTypeSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error loading rules:', error);
        addLogLine('Error loading available rules', 'error');
    }
}

// Setup event listeners
function setupEventListeners() {
    startScanBtn.addEventListener('click', startScan);
    stopScanBtn.addEventListener('click', stopScan);
    
    // Show/hide HTTP config input
    targetModelTypeSelect.addEventListener('change', () => {
        if (targetModelTypeSelect.value === 'http') {
            httpConfigGroup.style.display = 'block';
        } else {
            httpConfigGroup.style.display = 'none';
        }
    });
    
    // Show/hide pass condition input
    firewallModeCheckbox.addEventListener('change', () => {
        if (firewallModeCheckbox.checked) {
            passConditionGroup.style.display = 'block';
        } else {
            passConditionGroup.style.display = 'none';
        }
    });
}

// Start scan
async function startScan() {
    // Validate inputs
    if (!targetModelInput.value.trim()) {
        alert('Please enter a target model name');
        return;
    }
    
    if (targetModelTypeSelect.value === 'http' && !httpConfigInput.value.trim()) {
        alert('Please specify an HTTP config file for black-box testing');
        return;
    }
    
    // Get selected rule types
    const selectedRuleTypes = Array.from(ruleTypeSelect.selectedOptions)
        .map(option => option.value)
        .filter(value => value !== '');
    
    // Build request data
    const requestData = {
        target_model: targetModelInput.value.trim(),
        target_model_type: targetModelTypeSelect.value,
        iterations: parseInt(iterationsInput.value) || 3
    };
    
    if (controllerModelInput.value.trim()) {
        requestData.controller_model = controllerModelInput.value.trim();
    }
    
    if (controllerModelTypeSelect.value) {
        requestData.controller_model_type = controllerModelTypeSelect.value;
    }
    
    if (selectedRuleTypes.length > 0) {
        requestData.rule_type = selectedRuleTypes.join(',');
    }
    
    if (targetModelTypeSelect.value === 'http') {
        requestData.http_config = httpConfigInput.value.trim();
    }
    
    if (firewallModeCheckbox.checked) {
        requestData.firewall = true;
        if (passConditionInput.value.trim()) {
            requestData.pass_condition = passConditionInput.value.trim();
        }
    }
    
    // Reset UI
    resetScanUI();
    
    try {
        const response = await fetch('/api/scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to start scan');
        }
        
        scanRunning = true;
        startScanBtn.style.display = 'none';
        stopScanBtn.style.display = 'inline-block';
        
    } catch (error) {
        console.error('Error starting scan:', error);
        alert('Failed to start scan: ' + error.message);
        updateStatus('Error starting scan: ' + error.message, 'error');
    }
}

// Stop scan
async function stopScan() {
    try {
        const response = await fetch('/api/stop', {
            method: 'POST'
        });
        
        if (response.ok) {
            scanRunning = false;
            updateStatus('Scan stopped by user', 'idle');
            startScanBtn.style.display = 'inline-block';
            stopScanBtn.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error stopping scan:', error);
    }
}

// Reset scan UI
function resetScanUI() {
    outputLog.innerHTML = '';
    resultsContainer.style.display = 'none';
    resultsSummary.innerHTML = '';
    resultsDetails.innerHTML = '';
    completedRules = 0;
    totalRules = 0;
    updateProgress(0, 0);
}

// Update status display
function updateStatus(message, type = 'idle') {
    statusDisplay.className = `status-${type}`;
    statusDisplay.innerHTML = `<p>${message}</p>`;
    
    if (type === 'running') {
        progressContainer.style.display = 'block';
    } else if (type === 'complete' || type === 'error') {
        progressContainer.style.display = 'none';
    }
}

// Add line to output log
function addLogLine(message, type = 'normal') {
    const logLine = document.createElement('div');
    logLine.className = `log-line ${type}`;
    logLine.textContent = message;
    outputLog.appendChild(logLine);
    outputLog.scrollTop = outputLog.scrollHeight;
    
    // Remove empty message if exists
    const emptyMsg = outputLog.querySelector('.log-empty');
    if (emptyMsg) {
        emptyMsg.remove();
    }
}

// Update progress bar
function updateProgress(completed, total) {
    completedRules = completed;
    totalRules = total;
    
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    progressFill.style.width = `${percentage}%`;
    progressTextSpan.textContent = `${completed}/${total}`;
}

// Display results
function displayResults(results) {
    resultsContainer.style.display = 'block';
    
    // Calculate summary
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    
    for (const [ruleName, result] of Object.entries(results)) {
        totalTests++;
        if (result.passed) {
            passedTests++;
        } else {
            failedTests++;
        }
    }
    
    // Display summary cards
    resultsSummary.innerHTML = `
        <div class="result-card">
            <h3>${totalTests}</h3>
            <p>Total Tests</p>
        </div>
        <div class="result-card passed">
            <h3>${passedTests}</h3>
            <p>Passed</p>
        </div>
        <div class="result-card failed">
            <h3>${failedTests}</h3>
            <p>Failed</p>
        </div>
    `;
    
    // Display detailed results table
    let tableHTML = `
        <table class="results-table">
            <thead>
                <tr>
                    <th>Rule Name</th>
                    <th>Type</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Pass Rate</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    for (const [ruleName, result] of Object.entries(results)) {
        const statusBadge = result.passed 
            ? '<span class="badge passed">PASSED</span>' 
            : '<span class="badge failed">FAILED</span>';
        const severityBadge = `<span class="badge ${result.severity}">${result.severity.toUpperCase()}</span>`;
        
        tableHTML += `
            <tr>
                <td>${ruleName}</td>
                <td>${result.type}</td>
                <td>${severityBadge}</td>
                <td>${statusBadge}</td>
                <td>${result.pass_rate || 'N/A'}</td>
            </tr>
        `;
    }
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    resultsDetails.innerHTML = tableHTML;
}

// Socket.IO event handlers
socket.on('connected', (data) => {
    console.log('Connected to server:', data);
});

socket.on('scan_started', (data) => {
    updateStatus('Scan started...', 'running');
    addLogLine('Starting scan with command:', 'normal');
    addLogLine(data.command, 'normal');
    addLogLine('', 'normal');
});

socket.on('scan_progress', (data) => {
    addLogLine(data.message, 'normal');
});

socket.on('rule_started', (data) => {
    currentRuleSpan.textContent = data.rule;
    addLogLine(`Testing rule: ${data.rule}`, 'warning');
});

socket.on('scan_complete', (data) => {
    scanRunning = false;
    updateStatus('Scan completed successfully!', 'complete');
    startScanBtn.style.display = 'inline-block';
    stopScanBtn.style.display = 'none';
    
    addLogLine('', 'normal');
    addLogLine('Scan completed!', 'success');
    
    if (data.results && Object.keys(data.results).length > 0) {
        displayResults(data.results);
    }
});

socket.on('scan_error', (data) => {
    scanRunning = false;
    updateStatus('Scan failed: ' + data.error, 'error');
    startScanBtn.style.display = 'inline-block';
    stopScanBtn.style.display = 'none';
    
    addLogLine('Error: ' + data.error, 'error');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    if (scanRunning) {
        updateStatus('Connection lost', 'error');
    }
});
