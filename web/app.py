"""
PromptMapGUI - Web Interface
Flask application for running promptmap2 with a graphical interface
"""

import os
import sys
import json
import subprocess
import threading
from datetime import datetime
from flask import Flask, render_template, request, jsonify, session
from flask_socketio import SocketIO, emit

# Add parent directory to path to import promptmap2
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
socketio = SocketIO(app, cors_allowed_origins="*")

# Global variables to track scan status
scan_status = {
    'running': False,
    'current_rule': None,
    'total_rules': 0,
    'completed_rules': 0,
    'results': {}
}

def get_available_rules():
    """Get list of available test rules from rules directory"""
    rules_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'rules')
    rules = []
    
    for category in os.listdir(rules_dir):
        category_path = os.path.join(rules_dir, category)
        if os.path.isdir(category_path):
            for rule_file in os.listdir(category_path):
                if rule_file.endswith('.yaml'):
                    rules.append({
                        'category': category,
                        'name': rule_file.replace('.yaml', '')
                    })
    
    return rules

def get_rule_categories():
    """Get list of rule categories"""
    rules_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'rules')
    categories = []
    
    for item in os.listdir(rules_dir):
        item_path = os.path.join(rules_dir, item)
        if os.path.isdir(item_path):
            categories.append(item)
    
    return sorted(categories)

@app.route('/')
def index():
    """Render main page"""
    return render_template('index.html')

@app.route('/api/rules')
def api_rules():
    """Get available rules and categories"""
    return jsonify({
        'rules': get_available_rules(),
        'categories': get_rule_categories()
    })

@app.route('/api/scan', methods=['POST'])
def api_scan():
    """Start a new scan"""
    global scan_status
    
    if scan_status['running']:
        return jsonify({'error': 'Scan already running'}), 400
    
    data = request.json
    
    # Validate input
    if not data.get('target_model') or not data.get('target_model_type'):
        return jsonify({'error': 'Target model and type required'}), 400
    
    # Reset scan status
    scan_status = {
        'running': True,
        'current_rule': None,
        'total_rules': 0,
        'completed_rules': 0,
        'results': {},
        'start_time': datetime.now().isoformat()
    }
    
    # Start scan in background thread
    thread = threading.Thread(target=run_scan, args=(data,))
    thread.daemon = True
    thread.start()
    
    return jsonify({'status': 'started'})

@app.route('/api/status')
def api_status():
    """Get current scan status"""
    return jsonify(scan_status)

@app.route('/api/stop', methods=['POST'])
def api_stop():
    """Stop current scan"""
    global scan_status
    scan_status['running'] = False
    return jsonify({'status': 'stopped'})

def run_scan(params):
    """Run promptmap2 scan in background"""
    global scan_status
    
    try:
        # Build command
        cmd = [
            sys.executable,
            os.path.join(os.path.dirname(os.path.dirname(__file__)), 'promptmap2.py'),
            '--target-model', params['target_model'],
            '--target-model-type', params['target_model_type']
        ]
        
        # Add optional parameters
        if params.get('controller_model'):
            cmd.extend(['--controller-model', params['controller_model']])
        if params.get('controller_model_type'):
            cmd.extend(['--controller-model-type', params['controller_model_type']])
        if params.get('iterations'):
            cmd.extend(['--iterations', str(params['iterations'])])
        if params.get('rules'):
            cmd.extend(['--rules', params['rules']])
        if params.get('rule_type'):
            cmd.extend(['--rule-type', params['rule_type']])
        if params.get('http_config'):
            cmd.extend(['--http-config', params['http_config']])
        if params.get('firewall'):
            cmd.append('--firewall')
        if params.get('pass_condition'):
            cmd.extend(['--pass-condition', params['pass_condition']])
        
        # Add JSON output to temp file
        output_file = os.path.join('/tmp', f'promptmap_results_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json')
        cmd.extend(['--output', output_file])
        
        # Emit start event
        socketio.emit('scan_started', {'command': ' '.join(cmd)})
        
        # Run the scan
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )
        
        # Read output line by line
        for line in iter(process.stdout.readline, ''):
            if not scan_status['running']:
                process.terminate()
                break
            
            line = line.strip()
            if line:
                # Emit progress updates
                socketio.emit('scan_progress', {'message': line})
                
                # Try to parse progress information
                if 'Testing rule:' in line:
                    rule_name = line.split('Testing rule:')[1].strip()
                    scan_status['current_rule'] = rule_name
                    socketio.emit('rule_started', {'rule': rule_name})
                elif 'PASS' in line or 'FAIL' in line:
                    scan_status['completed_rules'] = scan_status.get('completed_rules', 0) + 1
        
        process.wait()
        
        # Load results if available
        if os.path.exists(output_file):
            with open(output_file, 'r') as f:
                scan_status['results'] = json.load(f)
            os.remove(output_file)
        
        scan_status['running'] = False
        scan_status['end_time'] = datetime.now().isoformat()
        socketio.emit('scan_complete', {'results': scan_status['results']})
        
    except Exception as e:
        scan_status['running'] = False
        scan_status['error'] = str(e)
        socketio.emit('scan_error', {'error': str(e)})

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    emit('connected', {'status': 'connected'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    pass

if __name__ == '__main__':
    print("Starting PromptMapGUI Web Interface...")
    print("Open your browser to: http://localhost:5000")
    socketio.run(app, host='0.0.0.0', port=5000, debug=False, allow_unsafe_werkzeug=True)
