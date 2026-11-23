// Local stand-in for the Resend API (POST /emails). Records every request so tests can inspect recipients, bodies and attachments.
//   GET  /__log           -> recorded requests
//   POST /__reset         -> clear the log and set mode "ok"
//   POST /__mode/<mode>   -> ok | fail (HTTP 500) | slow
import http from "node:http";
const port = Number(process.env.MAIL_STUB_PORT || 3999);
let mode = "ok"; let log = [];
http.createServer((req, res) => {
  const json = (code, obj) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(obj)); };
  if (req.method === "GET" && req.url === "/__log") return json(200, log);
  if (req.method === "POST" && req.url === "/__reset") { log = []; mode = "ok"; return json(200, { ok: true }); }
  if (req.method === "POST" && req.url.startsWith("/__mode/")) { mode = req.url.split("/").pop(); return json(200, { mode }); }
  if (req.method === "POST" && req.url === "/emails") {
    let body = ""; req.on("data", (c) => (body += c));
    req.on("end", () => {
      let parsed; try { parsed = JSON.parse(body); } catch { return json(400, { message: "bad json" }); }
      log.push({ auth: req.headers.authorization, mode, body: parsed });
      if (mode === "fail") return json(500, { message: "stub: simulated mail provider failure" });
      return json(200, { id: "stub_" + log.length });
    });
    return;
  }
  json(404, { message: "not found" });
}).listen(port, () => console.log(`mail stub on :${port}`));
