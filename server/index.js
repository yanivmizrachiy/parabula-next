const http = require("http");
const fs = require("fs");
const path = require("path");

const statePath = path.join(process.cwd(), "storage", "system-state.json");
const port = process.env.PORT || 4010;

function sendJson(res, data, status = 200) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data, null, 2));
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/api/state") {
    const raw = fs.readFileSync(statePath, "utf8");
    return sendJson(res, JSON.parse(raw));
  }

  if (req.method === "GET" && req.url === "/api/diagnostics/summary") {
    return sendJson(res, {
      status: "מוכן לבדיקה",
      message: "האבחון מחזיר כרגע מידע מבוסס מצב שמור בלבד",
      verified: false
    });
  }

  if (req.method === "POST" && req.url === "/api/execute") {
    return sendJson(res, {
      accepted: false,
      status: "חסום",
      message: "מסלול הרצה טרם חובר בפועל ל-server-core או Termux",
      verified: false
    }, 501);
  }

  return sendJson(res, { error: "נתיב לא נמצא" }, 404);
});

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
