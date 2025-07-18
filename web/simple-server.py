#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 8090

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            html = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>OiPet Saúde - Teste</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        display: flex; 
                        justify-content: center; 
                        align-items: center; 
                        height: 100vh; 
                        margin: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    }
                    .container { 
                        text-align: center; 
                        background: rgba(255,255,255,0.9); 
                        padding: 3rem; 
                        border-radius: 15px; 
                        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                        backdrop-filter: blur(10px);
                    }
                    h1 { color: #333; margin-bottom: 1rem; }
                    .status { color: #28a745; font-weight: bold; }
                    .url { color: #007bff; text-decoration: none; }
                    .info { margin: 1rem 0; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🐾 OiPet Saúde - Servidor Funcionando!</h1>
                    <p class="status">✅ STATUS: ONLINE</p>
                    <div class="info">
                        <p><strong>Aplicação:</strong> OiPet Saúde Web</p>
                        <p><strong>Servidor:</strong> Python HTTP Server</p>
                        <p><strong>Porta:</strong> 8080</p>
                        <p><strong>Backend:</strong> <a href="https://oipet-saude-production.up.railway.app" class="url">Railway Production</a></p>
                    </div>
                    <p>🎉 <strong>Sucesso!</strong> O servidor está respondendo corretamente.</p>
                </div>
            </body>
            </html>
            """
            self.wfile.write(html.encode())
        else:
            super().do_GET()

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🚀 Servidor rodando em http://localhost:{PORT}")
        print(f"📱 Acesse: http://localhost:{PORT}")
        print(f"🔗 Backend: https://oipet-saude-production.up.railway.app")
        print("Press Ctrl+C to stop")
        httpd.serve_forever()