from http.server import HTTPServer, SimpleHTTPRequestHandler
import webbrowser
import os
import socket

def find_free_port(start_port=8000, max_port=8999):
    for port in range(start_port, max_port + 1):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('', port))
                return port
        except OSError:
            continue
    raise RuntimeError('No free ports found')

def run_server():
    port = find_free_port()
    server_address = ('', port)
    httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)
    print(f"Server running at http://localhost:{port}")
    webbrowser.open(f'http://localhost:{port}')
    httpd.serve_forever()

if __name__ == '__main__':
    run_server() 