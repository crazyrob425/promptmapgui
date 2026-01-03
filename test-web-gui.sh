#!/bin/bash
# Simple test script for PromptMap Web GUI

echo "=================================="
echo "PromptMap Web GUI - Quick Test"
echo "=================================="
echo

# Check if dependencies are installed
echo "1. Checking dependencies..."
python3 -c "import flask, flask_socketio, flask_cors" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "   ✓ Flask dependencies installed"
else
    echo "   ✗ Flask dependencies missing"
    echo "   Install with: pip install -r web/requirements-web.txt"
    exit 1
fi

python3 -c "import openai, anthropic, ollama" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "   ✓ PromptMap dependencies installed"
else
    echo "   ✗ PromptMap dependencies missing"
    echo "   Install with: pip install -r requirements.txt"
    exit 1
fi

# Start server in background
echo
echo "2. Starting web server..."
cd web
python3 app.py > /tmp/promptmap-web-test.log 2>&1 &
SERVER_PID=$!
cd ..

# Wait for server to start
sleep 3

# Test endpoints
echo
echo "3. Testing endpoints..."

# Test main page
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5000/)
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✓ Main dashboard (GET /): OK"
else
    echo "   ✗ Main dashboard failed: HTTP $HTTP_CODE"
fi

# Test settings page
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5000/settings)
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✓ Settings page (GET /settings): OK"
else
    echo "   ✗ Settings page failed: HTTP $HTTP_CODE"
fi

# Test results page
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5000/results)
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✓ Results page (GET /results): OK"
else
    echo "   ✗ Results page failed: HTTP $HTTP_CODE"
fi

# Test API endpoints
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5000/api/rules)
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✓ Rules API (GET /api/rules): OK"
else
    echo "   ✗ Rules API failed: HTTP $HTTP_CODE"
fi

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5000/api/test-status)
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✓ Test status API (GET /api/test-status): OK"
else
    echo "   ✗ Test status API failed: HTTP $HTTP_CODE"
fi

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5000/api/results)
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✓ Results API (GET /api/results): OK"
else
    echo "   ✗ Results API failed: HTTP $HTTP_CODE"
fi

# Cleanup
echo
echo "4. Cleaning up..."
kill $SERVER_PID 2>/dev/null

echo
echo "=================================="
echo "Test completed successfully!"
echo "=================================="
echo
echo "To start the web interface:"
echo "  cd web"
echo "  python app.py"
echo
echo "Then open your browser to:"
echo "  http://localhost:5000"
