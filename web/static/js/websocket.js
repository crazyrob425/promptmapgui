// WebSocket connection for real-time updates

let socket = null;
let connected = false;

function initWebSocket() {
    // Initialize Socket.IO connection
    socket = io();

    socket.on('connect', () => {
        console.log('Connected to server via WebSocket');
        connected = true;
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        connected = false;
    });

    socket.on('connected', (data) => {
        console.log('Server message:', data.data);
    });

    socket.on('test_progress', (data) => {
        updateProgress(data.progress, data.message);
    });

    socket.on('test_result', (data) => {
        addResultToFeed(data.test_name, data.result);
        updateStats();
    });

    socket.on('test_complete', (data) => {
        onTestComplete(data.results);
    });

    socket.on('test_error', (data) => {
        showError(data.error);
    });
}

function updateProgress(progress, message) {
    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const progressPercentage = document.getElementById('progress-percentage');

    if (progressContainer) {
        progressContainer.style.display = 'block';
    }

    if (progressFill) {
        progressFill.style.width = progress + '%';
    }

    if (progressText) {
        progressText.textContent = message;
    }

    if (progressPercentage) {
        progressPercentage.textContent = progress + '%';
    }
}

function addResultToFeed(testName, result) {
    const feed = document.getElementById('results-feed');
    if (!feed) return;

    // Remove placeholder if exists
    const placeholder = feed.querySelector('.placeholder-text');
    if (placeholder) {
        placeholder.remove();
    }

    const status = result.status === 'uncertain' ? 'uncertain' : 
                  (result.passed ? 'pass' : 'fail');
    
    const resultItem = document.createElement('div');
    resultItem.className = `result-item ${status}`;
    
    let statusEmoji = status === 'pass' ? '✅' : 
                     status === 'uncertain' ? '⚠️' : '❌';
    
    resultItem.innerHTML = `
        <div class="result-name">${statusEmoji} ${testName}</div>
        <div class="result-details">
            Type: ${result.type} | 
            Severity: ${result.severity} | 
            Pass Rate: ${result.pass_rate || 'N/A'}
        </div>
    `;

    feed.appendChild(resultItem);
    
    // Auto-scroll to bottom
    feed.scrollTop = feed.scrollHeight;
}

function updateStats() {
    // This will be called from app.js to update the statistics
}

function onTestComplete(results) {
    updateProgress(100, 'Test completed');
    
    // Update buttons
    const startBtn = document.getElementById('start-test-btn');
    const stopBtn = document.getElementById('stop-test-btn');
    
    if (startBtn) {
        startBtn.disabled = false;
        startBtn.textContent = '▶️ Start Test';
    }
    
    if (stopBtn) {
        stopBtn.disabled = true;
    }

    // Show completion message
    setTimeout(() => {
        alert('Test run completed! View detailed results in the Results page.');
    }, 500);
}

function showError(error) {
    alert('Error: ' + error);
    
    // Reset buttons
    const startBtn = document.getElementById('start-test-btn');
    const stopBtn = document.getElementById('stop-test-btn');
    
    if (startBtn) {
        startBtn.disabled = false;
        startBtn.textContent = '▶️ Start Test';
    }
    
    if (stopBtn) {
        stopBtn.disabled = true;
    }
}

// Initialize WebSocket on page load
document.addEventListener('DOMContentLoaded', () => {
    initWebSocket();
});
