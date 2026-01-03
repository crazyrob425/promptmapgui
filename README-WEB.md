# PromptMap Web GUI

A modern, user-friendly web-based interface for the PromptMap LLM security scanner.

![PromptMap Web GUI](../screenshots/web-gui-dashboard.png)

## Features

- **Intuitive Dashboard**: Real-time test execution monitoring with live progress updates
- **Comprehensive Settings**: Easy configuration of API keys, models, and test parameters
- **Results Visualization**: Interactive results table with filtering and export capabilities
- **Real-time Updates**: WebSocket-based live test progress and results streaming
- **Settings Persistence**: Browser localStorage for saving and loading configurations
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Test History**: Automatic saving of last 10 test runs
- **Rule Management**: Browse and select specific security test rules or categories

## Installation

### Prerequisites

- Python 3.8 or higher
- PromptMap installed and configured (see main README.md)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Setup

1. **Navigate to the web directory**:
   ```bash
   cd web
   ```

2. **Install web-specific dependencies**:
   ```bash
   pip install -r requirements-web.txt
   ```

3. **Verify installation**:
   ```bash
   python app.py
   ```

## Usage

### Starting the Web Server

From the `web` directory, run:

```bash
python app.py
```

The server will start on `http://localhost:5000` by default.

Open your web browser and navigate to:
```
http://localhost:5000
```

### Configuration

1. **Navigate to Settings** (http://localhost:5000/settings)

2. **Configure API Keys**:
   - Enter API keys for the LLM providers you want to use
   - Supported providers: OpenAI, Anthropic, Google, XAI
   - API keys are stored securely in your browser's localStorage

3. **Configure Models**:
   - **Target Model**: The LLM being tested for vulnerabilities
   - **Target Model Type**: Provider type (openai, anthropic, google, xai, ollama, http)
   - **Controller Model**: The LLM used to evaluate test results
   - **Controller Model Type**: Provider type for controller
   
   **Recommended Controller Models**:
   - OpenAI GPT-4o or GPT-4
   - Google Gemini 2.5 Pro
   - Anthropic Claude 3.5 Sonnet or Claude 4 Opus

4. **Configure Testing Parameters**:
   - **System Prompts**: Path to your system prompts file (default: `system-prompts.txt`)
   - **Iterations**: Number of test attempts (1-20, default: 3)
   - **Firewall Mode**: Enable for testing firewall LLMs
   - **Pass Condition**: Expected response in firewall mode

5. **Select Rules**:
   - Choose specific test rules or entire categories
   - Available categories:
     - Distraction
     - Prompt Stealing
     - Jailbreak
     - Harmful Content
     - Hate Speech
     - Social Bias

6. **Save Settings**: Click "Save Settings" to persist your configuration

### Running Tests

1. **Navigate to Dashboard** (http://localhost:5000)

2. **Review Configuration**: Check the configuration summary at the top

3. **Start Test**: Click the "Start Test" button

4. **Monitor Progress**:
   - Watch the progress bar for overall completion
   - View live results in the results feed
   - See real-time statistics (total, passed, failed, pass rate)

5. **Stop Test** (if needed): Click the "Stop Test" button to halt execution

### Viewing Results

1. **Navigate to Results** (http://localhost:5000/results)

2. **Filter Results**:
   - By category (distraction, prompt_stealing, etc.)
   - By severity (high, medium, low)
   - By status (passed, failed, uncertain)

3. **View Details**: Click "Details" on any test to see full response and evaluation

4. **Export Results**: Click "Export JSON" to download results as a JSON file

5. **Test History**: View and reload previous test runs (last 10 stored)

## Configuration Examples

### Example 1: Testing GPT-3.5 with GPT-4o as Controller

```
Target Model: gpt-3.5-turbo
Target Model Type: openai
Controller Model: gpt-4o
Controller Model Type: openai
Iterations: 5
```

### Example 2: Testing Local Llama with Claude as Controller

```
Target Model: llama2:7b
Target Model Type: ollama
Ollama Server URL: http://localhost:11434
Controller Model: claude-3-opus-20240229
Controller Model Type: anthropic
Iterations: 3
```

### Example 3: Black-box HTTP Testing

```
Target Model: external
Target Model Type: http
HTTP Config File: http-examples/http-config-json.yaml
Controller Model: gpt-4
Controller Model Type: openai
```

### Example 4: Firewall Testing

```
Target Model: gpt-4
Target Model Type: openai
Firewall Mode: Enabled
Pass Condition: true
```

## Architecture

### Backend (Flask)

- **app.py**: Main Flask application with WebSocket support
- **REST API Endpoints**:
  - `GET /`: Main dashboard
  - `GET /settings`: Settings page
  - `GET /results`: Results page
  - `POST /api/start-test`: Start test execution
  - `POST /api/stop-test`: Stop running test
  - `GET /api/test-status`: Get current test status
  - `GET /api/results`: Get test results
  - `GET /api/rules`: Get available test rules

- **WebSocket Events**:
  - `test_progress`: Real-time progress updates
  - `test_result`: Individual test results
  - `test_complete`: Test completion notification
  - `test_error`: Error notifications

### Frontend

- **HTML Templates** (templates/):
  - `base.html`: Base template with navigation
  - `index.html`: Dashboard page
  - `settings.html`: Settings configuration page
  - `results.html`: Results visualization page

- **JavaScript** (static/js/):
  - `app.js`: Dashboard logic and test execution
  - `settings.js`: Settings management and localStorage
  - `websocket.js`: WebSocket connection and real-time updates

- **CSS** (static/css/):
  - `styles.css`: Responsive styling with modern design

## Troubleshooting

### Web Server Won't Start

**Issue**: `ModuleNotFoundError: No module named 'flask'`

**Solution**: Install web dependencies:
```bash
pip install -r web/requirements-web.txt
```

### Can't Connect to WebSocket

**Issue**: Real-time updates not working

**Solution**: 
- Check browser console for errors
- Ensure port 5000 is not blocked by firewall
- Try accessing via `http://127.0.0.1:5000` instead of `localhost`

### Settings Not Saving

**Issue**: Settings disappear after browser refresh

**Solution**:
- Check browser localStorage is enabled
- Ensure cookies/site data is not blocked
- Try a different browser

### API Key Errors

**Issue**: "API key not found" or authentication errors

**Solution**:
- Verify API keys are entered correctly in Settings
- Check API keys are valid and have sufficient quota
- Save settings after entering API keys

### Ollama Connection Failed

**Issue**: Can't connect to Ollama server

**Solution**:
- Ensure Ollama is installed and running
- Check Ollama server URL (default: `http://localhost:11434`)
- Verify the model is downloaded: `ollama pull <model-name>`

### Test Runs But No Results

**Issue**: Test completes but results page is empty

**Solution**:
- Check browser console for JavaScript errors
- Verify `/api/results` endpoint is returning data
- Clear browser cache and reload

## Security Considerations

- **API Keys**: Stored in browser localStorage - not transmitted to any external servers
- **Local Storage**: All data is stored locally in your browser
- **HTTPS**: For production use, deploy behind HTTPS proxy (nginx, Apache)
- **Secrets**: Never commit API keys to version control

## Production Deployment

For production deployment, consider:

1. **Use a production WSGI server** (Gunicorn, uWSGI):
   ```bash
   pip install gunicorn
   gunicorn -w 4 -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker app:app
   ```

2. **Set up reverse proxy** (nginx):
   ```nginx
   location / {
       proxy_pass http://127.0.0.1:5000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
   }
   ```

3. **Use environment variables** for configuration:
   ```bash
   export FLASK_SECRET_KEY="your-secret-key"
   export FLASK_ENV="production"
   ```

4. **Enable HTTPS** with SSL certificates

## Contributing

Contributions are welcome! Please ensure:

- Code follows existing style patterns
- All features are tested
- Documentation is updated
- Responsive design is maintained

## License

This project is licensed under the GPL-3.0 License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions:

- Open an issue on GitHub
- Check the main README.md for general PromptMap questions
- Review the troubleshooting section above

## Credits

- Built on top of PromptMap by Utku Sen
- Uses Flask, Flask-SocketIO, and Socket.IO for real-time features
- Responsive design with vanilla JavaScript and CSS3
