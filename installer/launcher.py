"""
PromptMapGUI Launcher
Windows launcher script that starts the Flask server and opens the browser
"""

import sys
import os
import subprocess
import webbrowser
import time
import signal
from threading import Thread
import tkinter as tk
from tkinter import messagebox

try:
    import pystray
    from PIL import Image, ImageDraw
    TRAY_AVAILABLE = True
except ImportError:
    TRAY_AVAILABLE = False


class PromptMapGUILauncher:
    def __init__(self):
        self.flask_process = None
        self.port = 5000
        self.icon = None
        self.running = True
        
    def check_dependencies(self):
        """Check if Python dependencies are installed"""
        try:
            import flask
            import flask_socketio
            return True
        except ImportError:
            return False
    
    def install_dependencies(self):
        """Install required dependencies"""
        root = tk.Tk()
        root.withdraw()
        
        response = messagebox.askyesno(
            "Dependencies Required",
            "PromptMapGUI requires additional Python packages.\n\n"
            "This will install:\n"
            "- Flask\n"
            "- Flask-SocketIO\n"
            "- Python-SocketIO\n"
            "- Eventlet\n\n"
            "Install now?"
        )
        
        if response:
            try:
                # Show installing message
                installing_window = tk.Toplevel()
                installing_window.title("Installing Dependencies")
                installing_window.geometry("400x100")
                label = tk.Label(installing_window, text="Installing dependencies...\nThis may take a minute.", pady=20)
                label.pack()
                installing_window.update()
                
                # Get the path to requirements-web.txt
                app_dir = os.path.dirname(os.path.abspath(__file__))
                requirements_file = os.path.join(app_dir, "requirements-web.txt")
                
                # Install dependencies
                subprocess.check_call(
                    [sys.executable, "-m", "pip", "install", "-r", requirements_file],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE
                )
                
                installing_window.destroy()
                
                messagebox.showinfo(
                    "Installation Complete",
                    "Dependencies installed successfully!\n\nPromptMapGUI will now start."
                )
                return True
                
            except subprocess.CalledProcessError as e:
                installing_window.destroy()
                messagebox.showerror(
                    "Installation Failed",
                    f"Failed to install dependencies:\n\n{str(e)}\n\n"
                    "Please install manually using:\n"
                    "pip install -r requirements-web.txt"
                )
                return False
        else:
            return False
    
    def check_api_keys(self):
        """Check if any API keys are configured"""
        api_keys = {
            'OPENAI_API_KEY': 'OpenAI',
            'ANTHROPIC_API_KEY': 'Anthropic',
            'GOOGLE_API_KEY': 'Google',
            'XAI_API_KEY': 'XAI'
        }
        
        configured_keys = []
        for key, name in api_keys.items():
            if os.environ.get(key):
                configured_keys.append(name)
        
        if not configured_keys:
            root = tk.Tk()
            root.withdraw()
            
            messagebox.showwarning(
                "No API Keys Configured",
                "No LLM provider API keys detected.\n\n"
                "To use PromptMapGUI with cloud providers, you need to set:\n"
                "- OPENAI_API_KEY (for OpenAI models)\n"
                "- ANTHROPIC_API_KEY (for Claude models)\n"
                "- GOOGLE_API_KEY (for Gemini models)\n"
                "- XAI_API_KEY (for Grok models)\n\n"
                "You can still use Ollama for local models.\n\n"
                "The application will start anyway."
            )
    
    def start_server(self):
        """Start Flask server in background"""
        try:
            # Change to the application directory
            app_dir = os.path.dirname(os.path.abspath(__file__))
            os.chdir(app_dir)
            
            # Start Flask server
            web_app_path = os.path.join(app_dir, "web", "app.py")
            
            self.flask_process = subprocess.Popen(
                [sys.executable, web_app_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == 'win32' else 0
            )
            
            # Wait for server to start
            print("Starting Flask server...")
            time.sleep(3)
            
            # Check if process is still running
            if self.flask_process.poll() is not None:
                raise Exception("Flask server failed to start")
            
            print("Flask server started successfully")
            return True
            
        except Exception as e:
            root = tk.Tk()
            root.withdraw()
            messagebox.showerror(
                "Server Error",
                f"Failed to start Flask server:\n\n{str(e)}\n\n"
                "Please check that all dependencies are installed."
            )
            return False
    
    def open_browser(self):
        """Open browser to application"""
        try:
            url = f"http://localhost:{self.port}"
            print(f"Opening browser to {url}")
            webbrowser.open(url)
        except Exception as e:
            print(f"Failed to open browser: {e}")
    
    def stop_server(self):
        """Stop Flask server"""
        if self.flask_process:
            try:
                self.flask_process.terminate()
                self.flask_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.flask_process.kill()
            except Exception as e:
                print(f"Error stopping server: {e}")
    
    def create_image(self):
        """Create icon image for system tray"""
        # Create a simple icon (blue circle with 'P' letter)
        width = 64
        height = 64
        image = Image.new('RGB', (width, height), color='white')
        dc = ImageDraw.Draw(image)
        
        # Draw blue circle
        dc.ellipse([8, 8, 56, 56], fill='#3498db', outline='#2c3e50')
        
        # Draw 'P' letter (simplified)
        dc.text((20, 15), 'P', fill='white')
        
        return image
    
    def setup_tray_icon(self):
        """Create system tray icon with menu"""
        if not TRAY_AVAILABLE:
            print("System tray not available (pystray not installed)")
            return
        
        # Create menu
        menu = pystray.Menu(
            pystray.MenuItem('Open PromptMapGUI', self.on_open),
            pystray.MenuItem('Stop Server', self.on_quit)
        )
        
        # Create icon
        self.icon = pystray.Icon(
            'PromptMapGUI',
            self.create_image(),
            'PromptMapGUI - Running',
            menu
        )
        
        # Run icon (this blocks until icon.stop() is called)
        self.icon.run()
    
    def on_open(self, icon=None, item=None):
        """Handle Open menu item"""
        self.open_browser()
    
    def on_quit(self, icon=None, item=None):
        """Handle Quit menu item"""
        self.running = False
        if self.icon:
            self.icon.stop()
        self.stop_server()
    
    def run(self):
        """Main launcher logic"""
        # Check and install dependencies if needed
        if not self.check_dependencies():
            if not self.install_dependencies():
                sys.exit(1)
        
        # Check API keys (warning only)
        self.check_api_keys()
        
        # Start Flask server
        if not self.start_server():
            sys.exit(1)
        
        # Open browser
        self.open_browser()
        
        # Setup system tray icon
        if TRAY_AVAILABLE:
            print("Setting up system tray icon...")
            self.setup_tray_icon()
        else:
            # If tray is not available, just wait for Ctrl+C
            print("\n" + "="*60)
            print("PromptMapGUI is running!")
            print(f"Access it at: http://localhost:{self.port}")
            print("Press Ctrl+C to stop the server")
            print("="*60 + "\n")
            
            try:
                # Keep the process alive
                while self.running:
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\nShutting down...")
                self.stop_server()


def main():
    """Main entry point"""
    launcher = PromptMapGUILauncher()
    launcher.run()


if __name__ == '__main__':
    main()
