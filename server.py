#Use to create local host
import http.server
import socketserver

PORT = 10500

Handler = http.server.SimpleHTTPRequestHandler
Handler.extensions_map.update({
    ".js": "application/javascript",
    ".css": "text/css",
})

httpd = socketserver.TCPServer(("", PORT), Handler)

print ("Serving at port", PORT)
print(Handler.extensions_map[".js"])
print(Handler.extensions_map[".css"])
httpd.serve_forever()
#http://localhost:10500

