# PromptMap Web GUI - Quick Start Guide

## Installation (5 minutes)

1. **Install Dependencies**:
   ```bash
   # Main PromptMap dependencies
   pip install -r requirements.txt
   
   # Web GUI dependencies
   pip install -r web/requirements-web.txt
   ```

2. **Start the Web Server**:
   ```bash
   cd web
   python app.py
   ```

3. **Open Your Browser**:
   Navigate to: `http://localhost:5000`

## First Time Setup (2 minutes)

1. **Go to Settings** (click "Settings" in navigation)

2. **Add API Key** (at least one):
   - For OpenAI: Enter your `OPENAI_API_KEY`
   - For Anthropic: Enter your `ANTHROPIC_API_KEY`
   - For Google: Enter your `GOOGLE_API_KEY`
   - For XAI: Enter your `XAI_API_KEY`

3. **Configure Target Model**:
   - **Target Model Type**: Select provider (e.g., `openai`)
   - **Target Model**: Enter model name (e.g., `gpt-3.5-turbo`)

4. **Configure Controller Model**:
   - **Controller Model Type**: Select provider (e.g., `openai`)
   - **Controller Model**: Enter model name (e.g., `gpt-4o`)
   
   💡 **Tip**: Use a powerful model like GPT-4o, Claude 3.5 Sonnet, or Gemini 2.5 Pro as the controller for accurate evaluation.

5. **Select Test Rules** (optional):
   - Click "Select All" to run all tests, or
   - Choose specific categories or individual rules

6. **Save Settings**:
   Click "Save Settings" button

## Running Your First Test (1 minute)

1. **Go to Dashboard** (click "Dashboard" in navigation)

2. **Review Configuration**:
   - Verify your target and controller models are configured
   - Check the number of iterations (default: 3)

3. **Start Test**:
   - Click "Start Test" button
   - Watch real-time progress updates
   - See live results as they complete

4. **View Results** (click "Results" in navigation):
   - Filter by category, severity, or status
   - Click "Details" on any test to see full response
   - Export results as JSON

## Example Configurations

### Testing GPT-3.5 Turbo
```
Target Model Type: openai
Target Model: gpt-3.5-turbo
Controller Model Type: openai
Controller Model: gpt-4o
Iterations: 5
```

### Testing Claude with GPT-4 Controller
```
Target Model Type: anthropic
Target Model: claude-3-opus-20240229
Controller Model Type: openai
Controller Model: gpt-4
Iterations: 3
```

### Testing Local Llama
```
Target Model Type: ollama
Target Model: llama2:7b
Ollama Server URL: http://localhost:11434
Controller Model Type: anthropic
Controller Model: claude-3-sonnet-20240229
Iterations: 3
```

## Common Issues

### "API key not found" error
- **Solution**: Go to Settings and enter your API key, then click "Save Settings"

### Tests not starting
- **Solution**: Check that both target and controller models are configured
- **Solution**: Verify API keys are valid and have sufficient quota

### Ollama connection failed
- **Solution**: Make sure Ollama is installed and running
- **Solution**: Check Ollama server URL (default: `http://localhost:11434`)
- **Solution**: Download the model: `ollama pull llama2`

### Settings not persisting
- **Solution**: Make sure browser localStorage is enabled
- **Solution**: Check cookies/site data is not blocked
- **Solution**: Try a different browser

## Next Steps

- Read the full documentation: [README-WEB.md](README-WEB.md)
- Explore test rules in the `rules/` directory
- Customize system prompts in `system-prompts.txt`
- Try black-box testing with HTTP configs (see `http-examples/`)

## Support

- Test the installation: `./test-web-gui.sh`
- Check server logs if issues occur
- Review troubleshooting guide in README-WEB.md
- Open an issue on GitHub for bugs or questions

---

**Enjoy testing your LLM applications! 🤖🔒**
