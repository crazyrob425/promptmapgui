# PromptMapGUI - Web Interface

A user-friendly web interface for PromptMap2, making LLM security testing accessible through your browser.

## Features

- **Intuitive Web Interface**: Configure and run scans through an easy-to-use web UI
- **Real-time Progress**: Live updates as scans progress
- **Multiple LLM Providers**: Support for OpenAI, Anthropic, Google, XAI, Ollama, and HTTP endpoints
- **Visual Results**: Clear presentation of test results with summary statistics
- **Flexible Configuration**: All command-line options available through the web UI

## Installation

1. Install the web interface dependencies:
```bash
pip install -r requirements-web.txt
```

2. Make sure you have the base PromptMap dependencies installed:
```bash
pip install -r requirements.txt
```

## Usage

### Starting the Web Interface

Run the Flask application:
```bash
python web/app.py
```

The web interface will be available at: `http://localhost:5000`

Open your web browser and navigate to this URL to access the GUI.

### Using the Web Interface

1. **Configure Target Model**:
   - Enter the model name (e.g., `gpt-4`, `claude-3-opus`, `llama2:7b`)
   - Select the model type from the dropdown

2. **Configure Controller Model (Optional)**:
   - Leave empty to use the same model as the target
   - Or specify a different model for more accurate evaluation

3. **Test Configuration**:
   - Set the number of iterations per test (default: 3)
   - Select specific rule categories or run all tests
   - Enable firewall mode if testing a firewall LLM

4. **Start Scan**:
   - Click "Start Scan" to begin testing
   - Monitor real-time progress in the output log
   - View results when the scan completes

5. **Review Results**:
   - Summary cards show total tests, passed, and failed
   - Detailed table lists each rule with its status
   - Export or save results as needed

## API Keys

Before running scans, set the appropriate API key for your chosen provider:

```bash
# OpenAI
export OPENAI_API_KEY="your-openai-key"

# Anthropic
export ANTHROPIC_API_KEY="your-anthropic-key"

# Google
export GOOGLE_API_KEY="your-google-key"

# XAI
export XAI_API_KEY="your-xai-key"
```

For Ollama, ensure the Ollama service is running locally or specify a custom URL.

## Black-Box Testing (HTTP Mode)

For testing external HTTP endpoints:

1. Create an HTTP configuration YAML file (see `http-examples/`)
2. Select "HTTP (Black-box)" as the target model type
3. Enter the path to your HTTP config file
4. Configure controller model for evaluation
5. Start the scan

## Firewall Testing Mode

To test firewall LLMs:

1. Check "Firewall Testing Mode"
2. Enter the pass condition (e.g., "true" if firewall responds "true" for malicious prompts)
3. Configure your firewall LLM as the target
4. Start the scan

## Features in Detail

### Real-Time Updates

The web interface uses WebSocket (Socket.IO) for real-time updates:
- Live scan progress
- Current rule being tested
- Console output streaming
- Instant result display

### Results Display

Results include:
- Total tests run
- Pass/fail summary
- Detailed results table with:
  - Rule name
  - Category type
  - Severity level
  - Pass/fail status
  - Pass rate across iterations

### Scan Configuration

All command-line options are available:
- Target and controller models
- Model types
- Iteration count
- Rule filtering
- HTTP configuration
- Firewall mode
- Custom pass conditions

## Troubleshooting

### Port Already in Use

If port 5000 is already in use, modify the port in `web/app.py`:
```python
socketio.run(app, host='0.0.0.0', port=5001, debug=False)
```

### Dependencies Not Installed

Make sure all dependencies are installed:
```bash
pip install -r requirements.txt
pip install -r requirements-web.txt
```

### API Key Not Set

Ensure the appropriate API key environment variable is set before starting the web interface.

### Ollama Not Found

If using Ollama models, ensure Ollama is installed and running:
```bash
# Check if Ollama is running
curl http://localhost:11434/api/version

# Start Ollama if needed
ollama serve
```

## Architecture

The web interface consists of:

- **Backend (Flask)**: 
  - `web/app.py` - Flask application with Socket.IO
  - Manages scan execution and real-time updates
  
- **Frontend**:
  - `web/templates/index.html` - Main HTML template
  - `web/static/css/style.css` - Styling
  - `web/static/js/app.js` - Client-side JavaScript and Socket.IO

## Security Considerations

- The web interface binds to `0.0.0.0` by default to allow network access
- For production use, consider:
  - Adding authentication
  - Using HTTPS
  - Restricting bind address
  - Rate limiting
  - Input validation

## License

This web interface is part of PromptMap and is licensed under GPL-3.0.
