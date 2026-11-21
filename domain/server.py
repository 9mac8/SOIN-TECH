import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path

ROOT = Path(__file__).parent
REGISTRY = ROOT / "data" / "apps.json"

HTML = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SOIN TECH | Control Center</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#080f20;color:#f1f5ff;
font-family:Arial,sans-serif}
header{padding:25px 7%;border-bottom:1px solid #233453}
.logo{font-size:25px;font-weight:800;letter-spacing:3px}
.logo span{color:#5599ff}
.tag{color:#92a9cb;font-size:12px;margin-top:8px}
main{max-width:1100px;margin:auto;padding:35px 20px}
.hero{padding:35px 25px;border-radius:22px;
background:linear-gradient(120deg,#142d55,#101a35);
border:1px solid #294b7c}
.hero h1{font-size:34px;margin:0 0 12px}
.hero p{color:#a9c2e8}
.status{color:#65e6a0;font-weight:bold}
h2{margin-top:35px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:15px}
.card{background:#111d34;border:1px solid #273c60;
padding:22px;border-radius:16px}
.card h3{margin:0 0 12px}
.card p{color:#a4b6d1;font-size:13px}
button{background:#246de0;color:white;border:0;
padding:11px 18px;border-radius:9px;font-weight:bold}
footer{text-align:center;color:#7086a8;padding:35px}
</style>
</head>
<body>
<header>
<div class="logo">SOIN <span>TECH</span></div>
<div class="tag">WHERE INTELLIGENCE MEETS YOU.</div>
</header>
<main>
<section class="hero">
<p class="status">● DOMAIN ENGINE ONLINE</p>
<h1>Welcome to SOIN TECH.</h1>
<p>One ecosystem. Multiple powerful applications.
One connected future.</p>
</section>
<h2>Our ecosystem</h2>
<div class="grid" id="apps">
<div class="card">Loading applications...</div>
</div>
<h2>System information</h2>
<div class="card">
<h3>SOIN Domain Engine</h3>
<p id="health">Checking system...</p>
<p>Local development server · Port 8080</p>
</div>
</main>
<footer>SOIN TECH © 2026 · Where Intelligence Meets You.</footer>
<script>
async function loadApps(){
const box=document.getElementById('apps');
try{
const response=await fetch('/apps');
const apps=await response.json();
box.innerHTML=apps.map(app=>`
<div class="card">
<h3>${app.name}</h3>
<p>Application URL: ${app.path}</p>
<p>Status: ${app.status}</p>
<button onclick="location.href='${app.path}'">Open application</button>
</div>`).join('');
}catch(e){
box.innerHTML='<div class="card">Unable to load applications.</div>';
}
}
async function health(){
try{
const r=await fetch('/health');
const data=await r.json();
document.getElementById('health').textContent=
data.status+' — '+data.service;
}catch(e){
document.getElementById('health').textContent='Connection unavailable';
}
}
loadApps();
health();
</script>
</body>
</html>"""

class SOINDomain(BaseHTTPRequestHandler):

    def respond(self, status, data, content_type="application/json"):
        output = data if isinstance(data, bytes) else json.dumps(data, indent=2).encode()
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(output)))
        self.end_headers()
        self.wfile.write(output)

    def do_GET(self):
        with open(REGISTRY, encoding="utf-8") as f:
            database = json.load(f)

        if self.path == "/":
            self.respond(200, HTML.encode(), "text/html; charset=utf-8")

        elif self.path == "/apps":
            self.respond(200, database["apps"])

        elif self.path == "/health":
            self.respond(200, {
                "status": "operational",
                "service": "SOIN Domain"
            })

        else:
            app = next(
                (a for a in database["apps"] if a["path"] == self.path),
                None
            )
            if app:
                self.respond(200, {
                    "application": app["name"],
                    "status": app["status"],
                    "message": "Registered in SOIN TECH"
                })
            else:
                self.respond(404, {"error": "Application not found"})

print("SOIN TECH DOMAIN CONTROL CENTER")
print("Where Intelligence Meets You.")
print("http://127.0.0.1:8080")

port = int(os.environ.get("PORT", "8080"))
HTTPServer(("0.0.0.0", port), SOINDomain).serve_forever()
