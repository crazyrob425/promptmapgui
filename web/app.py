#!/usr/bin/env python3
"""
PromptMap Web GUI - Flask Application
Provides a web-based interface for the PromptMap LLM security scanner
"""

import os
import sys
import json
import threading
import time
from pathlib import Path
from typing import Dict, Optional, Any

from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_socketio import SocketIO, emit
from flask_cors import CORS

# Add parent directory to path to import promptmap2
sys.path.insert(0, str(Path(__file__).parent.parent))
import promptmap2

app = Flask(__name__)
app.config['SECRET_KEY'] = 'promptmap-web-secret-key-change-in-production'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Global state
test_state = {
    'running': False,
    'progress': 0,
    'current_test': '',
    'total_tests': 0,
    'completed_tests': 0,
    'results': {},
    'thread': None,
    'stop_requested': False
}


def emit_progress(progress: int, message: str):
    """Emit progress update via WebSocket"""
    socketio.emit('test_progress', {
        'progress': progress,
        'message': message
    })


def emit_test_result(test_name: str, result: Dict):
    """Emit individual test result via WebSocket"""
    socketio.emit('test_result', {
        'test_name': test_name,
        'result': result
    })


def emit_test_complete(results: Dict):
    """Emit test completion via WebSocket"""
    socketio.emit('test_complete', {
        'results': results
    })


class WebTestRunner:
    """Wrapper around promptmap2 to run tests with progress updates"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.results = {}
        self.stop_requested = False
        
    def run(self):
        """Run tests with progress updates"""
        global test_state
        
        try:
            # Validate configuration
            target_model = self.config.get('target_model')
            target_model_type = self.config.get('target_model_type')
            controller_model = self.config.get('controller_model')
            controller_model_type = self.config.get('controller_model_type')
            system_prompts_path = self.config.get('system_prompts_path', '../system-prompts.txt')
            iterations = int(self.config.get('iterations', 3))
            firewall_mode = self.config.get('firewall_mode', False)
            pass_condition = self.config.get('pass_condition')
            ollama_url = self.config.get('ollama_url', 'http://localhost:11434')
            http_config_path = self.config.get('http_config_path')
            selected_rules = self.config.get('selected_rules', [])
            rule_categories = self.config.get('rule_categories', [])
            
            # Set API keys from config if provided
            if self.config.get('openai_api_key'):
                os.environ['OPENAI_API_KEY'] = self.config['openai_api_key']
            if self.config.get('anthropic_api_key'):
                os.environ['ANTHROPIC_API_KEY'] = self.config['anthropic_api_key']
            if self.config.get('google_api_key'):
                os.environ['GOOGLE_API_KEY'] = self.config['google_api_key']
            if self.config.get('xai_api_key'):
                os.environ['XAI_API_KEY'] = self.config['xai_api_key']
            
            # Validate API keys
            promptmap2.validate_api_keys(target_model_type, controller_model_type)
            
            # Initialize clients
            target_http_config = None
            controller_prompt_override = None
            if target_model_type == "http":
                if not http_config_path:
                    raise ValueError("HTTP config path required for http model type")
                target_http_config = promptmap2.load_http_config(http_config_path)
                answer_focus_hint = target_http_config.get('answer_focus_hint')
                if answer_focus_hint:
                    controller_prompt_override = promptmap2.build_http_controller_prompt(answer_focus_hint)
            
            target_client, controller_client = promptmap2.initialize_clients(
                target_model_type, controller_model_type, ollama_url, target_http_config
            )
            
            # Load system prompts
            system_prompt = ""
            if target_model_type != "http":
                # Resolve path relative to parent directory
                prompts_path = Path(__file__).parent.parent / system_prompts_path
                system_prompt = promptmap2.load_system_prompts(str(prompts_path))
            
            # Load and filter rules
            test_rules = promptmap2.load_test_rules()
            
            # Filter rules based on selection
            filtered_rules = {}
            for test_name, rule in test_rules.items():
                # If specific rules selected, only include those
                if selected_rules:
                    if test_name in selected_rules:
                        filtered_rules[test_name] = rule
                # Otherwise filter by categories
                elif rule_categories:
                    if rule['type'] in rule_categories:
                        filtered_rules[test_name] = rule
                # If no filters, include all
                else:
                    filtered_rules[test_name] = rule
            
            total_tests = len(filtered_rules)
            test_state['total_tests'] = total_tests
            
            emit_progress(0, f"Starting {total_tests} tests...")
            
            # Run tests
            for i, (test_name, rule) in enumerate(filtered_rules.items(), 1):
                if test_state['stop_requested']:
                    emit_progress(100, "Test stopped by user")
                    break
                
                test_state['current_test'] = test_name
                test_state['completed_tests'] = i - 1
                
                progress = int((i - 1) / total_tests * 100)
                emit_progress(progress, f"Running test {i}/{total_tests}: {test_name}")
                
                # Run the test
                result = promptmap2.run_single_test(
                    target_client,
                    target_model,
                    target_model_type,
                    controller_client,
                    controller_model,
                    controller_model_type,
                    system_prompt,
                    test_name,
                    rule,
                    iterations,
                    firewall_mode,
                    pass_condition,
                    fail_only=False,
                    debug_prompt_leak=False,
                    controller_prompt_override=controller_prompt_override
                )
                
                self.results[test_name] = result
                test_state['results'] = self.results
                
                # Emit individual result
                emit_test_result(test_name, result)
                
                # Stop if API error
                if result.get('failed_result', {}).get('reason', '').startswith('API Error:'):
                    emit_progress(100, "Stopped due to API error")
                    break
            
            # Test complete
            test_state['completed_tests'] = len(self.results)
            emit_progress(100, f"Completed {len(self.results)} tests")
            emit_test_complete(self.results)
            
        except Exception as e:
            error_msg = f"Error running tests: {str(e)}"
            emit_progress(100, error_msg)
            socketio.emit('test_error', {'error': error_msg})
        finally:
            test_state['running'] = False


# Web Routes
@app.route('/')
def index():
    """Main dashboard page"""
    return render_template('index.html')


@app.route('/settings')
def settings():
    """Settings page"""
    return render_template('settings.html')


@app.route('/results')
def results():
    """Results visualization page"""
    return render_template('results.html')


# API Endpoints
@app.route('/api/rules', methods=['GET'])
def get_rules():
    """Get available test rules"""
    try:
        # Change to parent directory to load rules
        original_dir = os.getcwd()
        os.chdir(Path(__file__).parent.parent)
        
        rules = promptmap2.load_test_rules()
        
        # Organize rules by category
        rules_by_category = {}
        for rule_name, rule_data in rules.items():
            category = rule_data['type']
            if category not in rules_by_category:
                rules_by_category[category] = []
            rules_by_category[category].append({
                'name': rule_name,
                'severity': rule_data['severity'],
                'type': rule_data['type'],
                'prompt': rule_data.get('prompt', '')[:100] + '...' if len(rule_data.get('prompt', '')) > 100 else rule_data.get('prompt', '')
            })
        
        os.chdir(original_dir)
        
        return jsonify({
            'success': True,
            'rules': rules_by_category,
            'categories': list(rules_by_category.keys())
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/test-status', methods=['GET'])
def get_test_status():
    """Get current test status"""
    return jsonify({
        'running': test_state['running'],
        'progress': test_state['progress'],
        'current_test': test_state['current_test'],
        'total_tests': test_state['total_tests'],
        'completed_tests': test_state['completed_tests']
    })


@app.route('/api/results', methods=['GET'])
def get_results():
    """Get test results"""
    return jsonify({
        'success': True,
        'results': test_state['results']
    })


@app.route('/api/start-test', methods=['POST'])
def start_test():
    """Start a new test run"""
    global test_state
    
    if test_state['running']:
        return jsonify({
            'success': False,
            'error': 'A test is already running'
        }), 400
    
    config = request.json
    
    # Validate required fields
    if not config.get('target_model'):
        return jsonify({'success': False, 'error': 'Target model is required'}), 400
    if not config.get('target_model_type'):
        return jsonify({'success': False, 'error': 'Target model type is required'}), 400
    
    # Reset state
    test_state['running'] = True
    test_state['progress'] = 0
    test_state['current_test'] = ''
    test_state['total_tests'] = 0
    test_state['completed_tests'] = 0
    test_state['results'] = {}
    test_state['stop_requested'] = False
    
    # Start test in background thread
    runner = WebTestRunner(config)
    thread = threading.Thread(target=runner.run)
    thread.daemon = True
    thread.start()
    test_state['thread'] = thread
    
    return jsonify({
        'success': True,
        'message': 'Test started'
    })


@app.route('/api/stop-test', methods=['POST'])
def stop_test():
    """Stop the running test"""
    global test_state
    
    if not test_state['running']:
        return jsonify({
            'success': False,
            'error': 'No test is currently running'
        }), 400
    
    test_state['stop_requested'] = True
    
    return jsonify({
        'success': True,
        'message': 'Stop requested'
    })


# WebSocket Events
@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print('Client connected')
    emit('connected', {'data': 'Connected to PromptMap Web'})


@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print('Client disconnected')


if __name__ == '__main__':
    print("""
    PromptMap Web GUI
    =================
    Starting web server...
    Access the interface at: http://localhost:5000
    """)
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)
