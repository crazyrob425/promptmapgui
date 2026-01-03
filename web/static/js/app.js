// Main Application Logic for Dashboard

document.addEventListener('DOMContentLoaded', () => {
    loadConfigSummary();
    updateStats();
});

function loadConfigSummary() {
    try {
        const settings = JSON.parse(localStorage.getItem('promptmap_settings') || '{}');
        
        // Update target model summary
        const targetModel = settings.target_model || 'Not configured';
        const targetType = settings.target_model_type || '';
        document.getElementById('summary-target-model').textContent = 
            targetType ? `${targetModel} (${targetType})` : targetModel;
        
        // Update controller model summary
        const controllerModel = settings.controller_model || 'Not configured';
        const controllerType = settings.controller_model_type || '';
        document.getElementById('summary-controller-model').textContent = 
            controllerType ? `${controllerModel} (${controllerType})` : controllerModel;
        
        // Update iterations
        document.getElementById('summary-iterations').textContent = 
            settings.iterations || '3';
        
        // Update rules summary
        const selectedRules = settings.selected_rules || [];
        const selectedCategories = settings.selected_categories || [];
        
        let rulesSummary = 'All rules';
        if (selectedRules.length > 0) {
            rulesSummary = `${selectedRules.length} specific rules`;
        } else if (selectedCategories.length > 0) {
            rulesSummary = selectedCategories.join(', ');
        }
        
        document.getElementById('summary-rules').textContent = rulesSummary;
    } catch (e) {
        console.error('Error loading config summary:', e);
    }
}

function startTest() {
    // Validate settings
    const settings = JSON.parse(localStorage.getItem('promptmap_settings') || '{}');
    
    if (!settings.target_model || !settings.target_model_type) {
        alert('Please configure target model in Settings before starting a test.');
        window.location.href = '/settings';
        return;
    }
    
    if (!settings.controller_model || !settings.controller_model_type) {
        alert('Please configure controller model in Settings before starting a test.');
        window.location.href = '/settings';
        return;
    }
    
    // Validate API keys based on model types
    const requiredKeys = [];
    if (settings.target_model_type === 'openai' || settings.controller_model_type === 'openai') {
        if (!settings.openai_api_key) requiredKeys.push('OpenAI');
    }
    if (settings.target_model_type === 'anthropic' || settings.controller_model_type === 'anthropic') {
        if (!settings.anthropic_api_key) requiredKeys.push('Anthropic');
    }
    if (settings.target_model_type === 'google' || settings.controller_model_type === 'google') {
        if (!settings.google_api_key) requiredKeys.push('Google');
    }
    if (settings.target_model_type === 'xai' || settings.controller_model_type === 'xai') {
        if (!settings.xai_api_key) requiredKeys.push('XAI');
    }
    
    if (requiredKeys.length > 0) {
        alert(`Please configure ${requiredKeys.join(', ')} API key(s) in Settings.`);
        window.location.href = '/settings';
        return;
    }
    
    // Disable start button, enable stop button
    const startBtn = document.getElementById('start-test-btn');
    const stopBtn = document.getElementById('stop-test-btn');
    
    startBtn.disabled = true;
    startBtn.textContent = '⏳ Running...';
    stopBtn.disabled = false;
    
    // Clear results feed
    const feed = document.getElementById('results-feed');
    feed.innerHTML = '';
    
    // Show progress container
    const progressContainer = document.getElementById('progress-container');
    progressContainer.style.display = 'block';
    
    // Show stats grid
    const statsGrid = document.getElementById('stats-grid');
    if (statsGrid) {
        statsGrid.style.display = 'grid';
    }
    
    // Prepare configuration for API
    const config = {
        target_model: settings.target_model,
        target_model_type: settings.target_model_type,
        controller_model: settings.controller_model,
        controller_model_type: settings.controller_model_type,
        ollama_url: settings.ollama_url || 'http://localhost:11434',
        system_prompts_path: settings.system_prompts_path || 'system-prompts.txt',
        http_config_path: settings.http_config_path,
        iterations: settings.iterations || 3,
        firewall_mode: settings.firewall_mode || false,
        pass_condition: settings.pass_condition,
        selected_rules: settings.selected_rules || [],
        rule_categories: settings.selected_categories || [],
        openai_api_key: settings.openai_api_key,
        anthropic_api_key: settings.anthropic_api_key,
        google_api_key: settings.google_api_key,
        xai_api_key: settings.xai_api_key
    };
    
    // Start test via API
    fetch('/api/start-test', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            alert('Error starting test: ' + data.error);
            startBtn.disabled = false;
            startBtn.textContent = '▶️ Start Test';
            stopBtn.disabled = true;
        }
    })
    .catch(error => {
        console.error('Error starting test:', error);
        alert('Error starting test: ' + error.message);
        startBtn.disabled = false;
        startBtn.textContent = '▶️ Start Test';
        stopBtn.disabled = true;
    });
}

function stopTest() {
    if (!confirm('Are you sure you want to stop the running test?')) {
        return;
    }
    
    fetch('/api/stop-test', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Test stop requested');
        } else {
            alert('Error stopping test: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error stopping test:', error);
        alert('Error stopping test: ' + error.message);
    });
}

function updateStats() {
    // Get current results from API
    fetch('/api/results')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.results) {
                const results = data.results;
                const total = Object.keys(results).length;
                let passed = 0;
                let failed = 0;
                
                Object.values(results).forEach(result => {
                    if (result.passed) {
                        passed++;
                    } else if (result.status !== 'uncertain') {
                        failed++;
                    }
                });
                
                const statTotal = document.getElementById('stat-total');
                const statPassed = document.getElementById('stat-passed');
                const statFailed = document.getElementById('stat-failed');
                const statRate = document.getElementById('stat-rate');
                
                if (statTotal) statTotal.textContent = total;
                if (statPassed) statPassed.textContent = passed;
                if (statFailed) statFailed.textContent = failed;
                if (statRate) {
                    const rate = total > 0 ? Math.round((passed / total) * 100) : 0;
                    statRate.textContent = rate + '%';
                }
                
                // Show stats if there are results
                if (total > 0) {
                    const statsGrid = document.getElementById('stats-grid');
                    if (statsGrid) {
                        statsGrid.style.display = 'grid';
                    }
                }
            }
        })
        .catch(error => {
            console.error('Error fetching results for stats:', error);
        });
}

// Override updateStats from websocket.js
window.updateStats = updateStats;
