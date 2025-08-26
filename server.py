#!/usr/bin/env python3
import http.server
import socketserver
import urllib.request
import urllib.parse
import urllib.error
import json
import os
from urllib.parse import urlparse, parse_qs

# API Configuration
API_BASE_URL = 'http://mainline.proxy.rlwy.net:35640'

class ProxyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        # Parse the URL
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        
        # Handle API proxy routes
        if path.startswith('/api/'):
            self.handle_api_request()
        else:
            # Serve static files
            super().do_GET()

    def handle_api_request(self):
        try:
            # Remove /api prefix and construct the full API URL
            api_path = self.path[4:]  # Remove '/api' prefix
            full_url = f"{API_BASE_URL}{api_path}"
            
            print(f"Proxying request to: {full_url}")
            
            # Make the request to the external API
            req = urllib.request.Request(full_url)
            
            try:
                with urllib.request.urlopen(req, timeout=10) as response:
                    # Read the response
                    content = response.read()
                    content_type = response.headers.get('Content-Type', 'application/json')
                    
                    # Send response
                    self.send_response(200)
                    self.send_header('Content-Type', content_type)
                    self.end_headers()
                    self.wfile.write(content)
                    
            except urllib.error.HTTPError as e:
                # Handle HTTP errors from the API
                error_content = e.read() if hasattr(e, 'read') else str(e)
                print(f"API returned error {e.code}: {error_content}")
                
                self.send_response(e.code)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                
                error_response = {
                    'error': f'API Error {e.code}',
                    'message': error_content.decode('utf-8') if isinstance(error_content, bytes) else str(error_content)
                }
                self.wfile.write(json.dumps(error_response).encode('utf-8'))
                
        except Exception as e:
            print(f"Proxy error: {e}")
            # Send error response
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            error_response = {
                'error': 'Proxy Error',
                'message': str(e)
            }
            self.wfile.write(json.dumps(error_response).encode('utf-8'))

    def log_message(self, format, *args):
        # Custom logging to show proxy activity
        if self.path.startswith('/api/'):
            print(f"API Proxy: {format % args}")
        else:
            # Only log non-static file requests to reduce noise
            if not any(self.path.endswith(ext) for ext in ['.css', '.js', '.ico', '.png', '.jpg']):
                print(f"Static: {format % args}")

if __name__ == "__main__":
    PORT = 5000
    
    # Change to the directory where static files are located
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("0.0.0.0", PORT), ProxyHTTPRequestHandler) as httpd:
        print(f"WhatsApp Bot Dashboard Server running on port {PORT}")
        print(f"Dashboard: http://localhost:{PORT}")
        print(f"API Proxy: Forwarding /api/* to {API_BASE_URL}")
        print("Press Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")