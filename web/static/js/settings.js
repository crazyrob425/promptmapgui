// Settings Management - handles saving/loading settings and rule management

// Load settings on page load
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadRules();
    setupEventListeners();
});

function setupEventListeners() {
    // Firewall mode toggle
    const firewallCheckbox = document.getElementById('firewall-mode');
    const passConditionGroup = document.getElementById('pass-condition-group');
    
    if (firewallCheckbox && passConditionGroup) {
        firewallCheckbox.addEventListener('change', (e) => {
            passConditionGroup.style.display = e.target.checked ? 'block' : 'none';
        });
    }

    // Form submission
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveSettings();
        });
    }

    // Target model type change
    const targetModelType = document.getElementById('target-model-type');
    if (targetModelType) {
        targetModelType.addEventListener('change', updateModelPlaceholders);
    }
}

function updateModelPlaceholders() {
    const targetType = document.getElementById('target-model-type').value;
    const targetModel = document.getElementById('target-model');
    
    const placeholders = {
        'openai': 'e.g., gpt-4o, gpt-4, gpt-3.5-turbo',
        'anthropic': 'e.g., claude-3-opus-20240229, claude-3-sonnet-20240229',
        'google': 'e.g., gemini-pro, gemini-1.5-pro',
        'xai': 'e.g., grok-beta',
        'ollama': 'e.g., llama2, mistral, deepseek-coder',
        'http': 'e.g., external'
    };
    
    if (targetModel && placeholders[targetType]) {
        targetModel.placeholder = placeholders[targetType];
    }
}

function loadSettings() {
    try {
        const settings = JSON.parse(localStorage.getItem('promptmap_settings') || '{}');
        
        // Load API keys (they are stored but not displayed for security)
        // Only show if they exist
        if (settings.openai_api_key) {
            document.getElementById('openai-api-key').value = settings.openai_api_key;
        }
        if (settings.anthropic_api_key) {
            document.getElementById('anthropic-api-key').value = settings.anthropic_api_key;
        }
        if (settings.google_api_key) {
            document.getElementById('google-api-key').value = settings.google_api_key;
        }
        if (settings.xai_api_key) {
            document.getElementById('xai-api-key').value = settings.xai_api_key;
        }
        
        // Load model configuration
        if (settings.target_model_type) {
            document.getElementById('target-model-type').value = settings.target_model_type;
        }
        if (settings.target_model) {
            document.getElementById('target-model').value = settings.target_model;
        }
        if (settings.controller_model_type) {
            document.getElementById('controller-model-type').value = settings.controller_model_type;
        }
        if (settings.controller_model) {
            document.getElementById('controller-model').value = settings.controller_model;
        }
        if (settings.ollama_url) {
            document.getElementById('ollama-url').value = settings.ollama_url;
        }
        
        // Load testing configuration
        if (settings.system_prompts_path) {
            document.getElementById('system-prompts').value = settings.system_prompts_path;
        }
        if (settings.http_config_path) {
            document.getElementById('http-config').value = settings.http_config_path;
        }
        if (settings.iterations) {
            document.getElementById('iterations').value = settings.iterations;
            document.getElementById('iterations-value').textContent = settings.iterations;
        }
        if (settings.firewall_mode) {
            document.getElementById('firewall-mode').checked = settings.firewall_mode;
            document.getElementById('pass-condition-group').style.display = 'block';
        }
        if (settings.pass_condition) {
            document.getElementById('pass-condition').value = settings.pass_condition;
        }
        
        // Load rule selections
        if (settings.selected_categories) {
            // Will be applied after rules are loaded
            window.savedCategories = settings.selected_categories;
        }
        if (settings.selected_rules) {
            window.savedRules = settings.selected_rules;
        }
        
        console.log('Settings loaded from localStorage');
    } catch (e) {
        console.error('Error loading settings:', e);
    }
}

function saveSettings() {
    try {
        const settings = {
            // API Keys
            openai_api_key: document.getElementById('openai-api-key').value,
            anthropic_api_key: document.getElementById('anthropic-api-key').value,
            google_api_key: document.getElementById('google-api-key').value,
            xai_api_key: document.getElementById('xai-api-key').value,
            
            // Model Configuration
            target_model_type: document.getElementById('target-model-type').value,
            target_model: document.getElementById('target-model').value,
            controller_model_type: document.getElementById('controller-model-type').value,
            controller_model: document.getElementById('controller-model').value,
            ollama_url: document.getElementById('ollama-url').value,
            
            // Testing Configuration
            system_prompts_path: document.getElementById('system-prompts').value,
            http_config_path: document.getElementById('http-config').value,
            iterations: parseInt(document.getElementById('iterations').value),
            firewall_mode: document.getElementById('firewall-mode').checked,
            pass_condition: document.getElementById('pass-condition').value,
            
            // Rule Selection
            selected_categories: getSelectedCategories(),
            selected_rules: getSelectedRules()
        };
        
        localStorage.setItem('promptmap_settings', JSON.stringify(settings));
        alert('Settings saved successfully!');
    } catch (e) {
        console.error('Error saving settings:', e);
        alert('Error saving settings: ' + e.message);
    }
}

function clearSettings() {
    if (confirm('Are you sure you want to clear all settings?')) {
        localStorage.removeItem('promptmap_settings');
        location.reload();
    }
}

function loadRules() {
    fetch('/api/rules')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayRules(data.rules, data.categories);
            } else {
                console.error('Error loading rules:', data.error);
            }
        })
        .catch(error => {
            console.error('Error fetching rules:', error);
            document.getElementById('rule-categories').innerHTML = 
                '<p class="placeholder-text">Error loading rules. Please try again.</p>';
        });
}

function displayRules(rulesByCategory, categories) {
    const container = document.getElementById('rule-categories');
    
    let html = '';
    categories.forEach(category => {
        const rules = rulesByCategory[category] || [];
        
        html += `
            <div class="rule-category">
                <div class="category-header" onclick="toggleCategory('${category}')">
                    <input type="checkbox" class="category-checkbox" id="cat-${category}" 
                           onchange="toggleCategoryRules('${category}')" onclick="event.stopPropagation()">
                    <h4>${formatCategoryName(category)} (${rules.length})</h4>
                    <span id="cat-arrow-${category}">▼</span>
                </div>
                <div class="rule-list" id="rules-${category}">
        `;
        
        rules.forEach(rule => {
            html += `
                <div class="rule-item">
                    <input type="checkbox" class="rule-checkbox" 
                           data-category="${category}" 
                           data-rule="${rule.name}"
                           id="rule-${rule.name}">
                    <label for="rule-${rule.name}">
                        ${rule.name}
                        <span class="badge badge-severity-${rule.severity}">${rule.severity}</span>
                    </label>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Apply saved selections
    if (window.savedCategories) {
        window.savedCategories.forEach(cat => {
            const checkbox = document.getElementById('cat-' + cat);
            if (checkbox) {
                checkbox.checked = true;
                toggleCategoryRules(cat);
            }
        });
    }
    
    if (window.savedRules) {
        window.savedRules.forEach(rule => {
            const checkbox = document.getElementById('rule-' + rule);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    }
}

function formatCategoryName(category) {
    return category.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function toggleCategory(category) {
    const ruleList = document.getElementById('rules-' + category);
    const arrow = document.getElementById('cat-arrow-' + category);
    
    if (ruleList.style.display === 'none') {
        ruleList.style.display = 'block';
        arrow.textContent = '▼';
    } else {
        ruleList.style.display = 'none';
        arrow.textContent = '▶';
    }
}

function toggleCategoryRules(category) {
    const categoryCheckbox = document.getElementById('cat-' + category);
    const ruleCheckboxes = document.querySelectorAll(`input[data-category="${category}"]`);
    
    ruleCheckboxes.forEach(checkbox => {
        checkbox.checked = categoryCheckbox.checked;
    });
}

function selectAllRules() {
    document.querySelectorAll('.rule-checkbox, .category-checkbox').forEach(checkbox => {
        checkbox.checked = true;
    });
}

function deselectAllRules() {
    document.querySelectorAll('.rule-checkbox, .category-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
}

function getSelectedCategories() {
    const categories = [];
    document.querySelectorAll('.category-checkbox:checked').forEach(checkbox => {
        categories.push(checkbox.id.replace('cat-', ''));
    });
    return categories;
}

function getSelectedRules() {
    const rules = [];
    document.querySelectorAll('.rule-checkbox:checked').forEach(checkbox => {
        rules.push(checkbox.dataset.rule);
    });
    return rules;
}

// Export for use in other scripts
window.getSettingsConfig = function() {
    return {
        openai_api_key: document.getElementById('openai-api-key').value,
        anthropic_api_key: document.getElementById('anthropic-api-key').value,
        google_api_key: document.getElementById('google-api-key').value,
        xai_api_key: document.getElementById('xai-api-key').value,
        target_model_type: document.getElementById('target-model-type').value,
        target_model: document.getElementById('target-model').value,
        controller_model_type: document.getElementById('controller-model-type').value,
        controller_model: document.getElementById('controller-model').value,
        ollama_url: document.getElementById('ollama-url').value,
        system_prompts_path: document.getElementById('system-prompts').value,
        http_config_path: document.getElementById('http-config').value,
        iterations: parseInt(document.getElementById('iterations').value),
        firewall_mode: document.getElementById('firewall-mode').checked,
        pass_condition: document.getElementById('pass-condition').value,
        selected_rules: getSelectedRules(),
        rule_categories: getSelectedCategories()
    };
};
