import http.server
import socketserver
import os


class CustomRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', '*')
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')

        super().end_headers()


PORT = 1235
Handler = CustomRequestHandler
os.chdir("dist")

with socketserver.TCPServer(('0.0.0.0', PORT), Handler) as httpd:
    print(f"Serving at http://0.0.0.0:{PORT}")
    httpd.serve_forever()
