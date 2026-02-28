import type { RouteStats } from "./statsStore.js";
import type { DiscoveredRoute } from "./routeDiscovery.js";

export function generateDashboardHtml(
  stats: RouteStats[],
  routes: DiscoveredRoute[],
  baseUrl: string
): string {
  const totalRequests = stats.reduce((s, r) => s + r.totalCalls, 0);
  const uniqueEndpoints = stats.length;
  const overallAvg =
    stats.length > 0
      ? stats.reduce((s, r) => s + r.avgResponseTimeMs, 0) / stats.length
      : 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Smart Inventory — API Status</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; background: #0f1117; color: #e1e4e8; line-height: 1.5; }
    a { color: #58a6ff; text-decoration: none; }
    a:hover { text-decoration: underline; }

    .container { max-width: 1200px; margin: 0 auto; padding: 24px; }

    /* Header */
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .header h1 { font-size: 22px; font-weight: 600; color: #f0f3f6; }
    .header h1 span { color: #58a6ff; }
    .header-actions { display: flex; align-items: center; gap: 16px; font-size: 13px; color: #8b949e; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }

    /* Nav links */
    .nav { margin-bottom: 20px; display: flex; gap: 16px; font-size: 13px; }
    .nav a { padding: 4px 0; border-bottom: 2px solid transparent; }
    .nav a:hover { border-bottom-color: #58a6ff; text-decoration: none; }

    /* Summary cards */
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px; }
    .card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 16px; }
    .card-label { font-size: 12px; color: #8b949e; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .card-value { font-size: 28px; font-weight: 700; color: #f0f3f6; }
    .card-value.green { color: #3fb950; }
    .card-value.blue { color: #58a6ff; }
    .card-value.purple { color: #bc8cff; }

    /* Toggle */
    .toggle-wrap { display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
    .toggle { width: 36px; height: 20px; background: #30363d; border-radius: 10px; position: relative; transition: background .2s; }
    .toggle.on { background: #238636; }
    .toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; background: #e1e4e8; border-radius: 50%; transition: transform .2s; }
    .toggle.on::after { transform: translateX(16px); }

    /* Table */
    .section-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #f0f3f6; }
    .table-wrap { background: #161b22; border: 1px solid #30363d; border-radius: 8px; overflow-x: auto; margin-bottom: 32px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead th { text-align: left; padding: 10px 14px; border-bottom: 1px solid #30363d; color: #8b949e; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
    tbody td { padding: 10px 14px; border-bottom: 1px solid #21262d; white-space: nowrap; }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:hover { background: #1c2128; }
    .method-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; min-width: 52px; text-align: center; }
    .method-GET { background: #0d419d; color: #79c0ff; }
    .method-POST { background: #1b4721; color: #56d364; }
    .method-PUT { background: #4a2d06; color: #e3b341; }
    .method-PATCH { background: #3d1d5c; color: #bc8cff; }
    .method-DELETE { background: #5c1d1d; color: #f85149; }
    .status-badge { display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 11px; margin: 1px 2px; font-weight: 600; }
    .status-2xx { background: #1b4721; color: #56d364; }
    .status-3xx { background: #0d419d; color: #79c0ff; }
    .status-4xx { background: #4a2d06; color: #e3b341; }
    .status-5xx { background: #5c1d1d; color: #f85149; }
    .empty-state { padding: 40px; text-align: center; color: #8b949e; }

    /* API Tester */
    .tester { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 20px; }
    .tester-row { display: flex; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
    .tester select, .tester input, .tester textarea { background: #0d1117; border: 1px solid #30363d; color: #e1e4e8; border-radius: 6px; padding: 8px 12px; font-size: 13px; font-family: inherit; }
    .tester select { min-width: 100px; }
    .tester input { flex: 1; min-width: 200px; }
    .tester textarea { width: 100%; min-height: 80px; resize: vertical; font-family: 'SF Mono', 'Fira Code', monospace; }
    .tester select:focus, .tester input:focus, .tester textarea:focus { outline: none; border-color: #58a6ff; box-shadow: 0 0 0 2px rgba(88,166,255,.15); }
    .tester label { font-size: 12px; color: #8b949e; margin-bottom: 4px; display: block; }
    .btn { padding: 8px 20px; border-radius: 6px; border: 1px solid transparent; font-size: 13px; font-weight: 600; cursor: pointer; transition: background .15s; }
    .btn-primary { background: #238636; color: #fff; }
    .btn-primary:hover { background: #2ea043; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { background: #21262d; color: #e1e4e8; border-color: #30363d; }
    .btn-secondary:hover { background: #30363d; }
    .route-picker { display: flex; gap: 8px; align-items: center; margin-bottom: 12px; }
    .route-picker select { flex: 1; }

    /* Response panel */
    .response-panel { margin-top: 16px; }
    .response-meta { display: flex; gap: 16px; margin-bottom: 8px; font-size: 12px; }
    .response-meta .tag { padding: 2px 8px; border-radius: 4px; font-weight: 600; }
    .response-body { background: #0d1117; border: 1px solid #30363d; border-radius: 6px; padding: 14px; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; white-space: pre-wrap; word-break: break-word; max-height: 400px; overflow-y: auto; line-height: 1.6; }
    .json-key { color: #79c0ff; }
    .json-string { color: #a5d6ff; }
    .json-number { color: #56d364; }
    .json-bool { color: #ff7b72; }
    .json-null { color: #8b949e; }

    /* Responsive */
    @media (max-width: 768px) {
      .tester-row { flex-direction: column; }
      .tester select, .tester input { width: 100%; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1><span>Smart Inventory</span> — API Status</h1>
      <div class="header-actions">
        <div class="toggle-wrap" id="autoRefreshToggle">
          <div class="toggle" id="toggleSwitch"></div>
          <span>Auto-refresh</span>
        </div>
        <span id="lastUpdated">Updated just now</span>
      </div>
    </div>

    <div class="nav">
      <a href="/api/docs">Swagger Docs</a>
      <a href="/api/health">Health Check</a>
      <a href="/api/docs/json">OpenAPI JSON</a>
    </div>

    <div class="summary" id="summaryCards">
      <div class="card">
        <div class="card-label">Total Requests</div>
        <div class="card-value green" id="totalRequests">${totalRequests}</div>
      </div>
      <div class="card">
        <div class="card-label">Endpoints Hit</div>
        <div class="card-value blue" id="uniqueEndpoints">${uniqueEndpoints}</div>
      </div>
      <div class="card">
        <div class="card-label">Avg Response Time</div>
        <div class="card-value purple" id="avgResponseTime">${overallAvg.toFixed(1)}ms</div>
      </div>
    </div>

    <h2 class="section-title">Endpoint Statistics</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Path</th>
            <th>Calls</th>
            <th>Status Codes</th>
            <th>Avg</th>
            <th>Min</th>
            <th>Max</th>
            <th>Last Called</th>
          </tr>
        </thead>
        <tbody id="statsBody">
          ${
            stats.length === 0
              ? '<tr><td colspan="8" class="empty-state">No API calls recorded yet. Make some requests and refresh.</td></tr>'
              : stats
                  .map(
                    (r) => `<tr>
              <td><span class="method-badge method-${r.method}">${r.method}</span></td>
              <td>${escapeHtml(r.path)}</td>
              <td>${r.totalCalls}</td>
              <td>${formatStatusCodes(r.statusCodes)}</td>
              <td>${r.avgResponseTimeMs.toFixed(1)}ms</td>
              <td>${r.minResponseTimeMs.toFixed(1)}ms</td>
              <td>${r.maxResponseTimeMs.toFixed(1)}ms</td>
              <td>${r.lastCalledAt ? new Date(r.lastCalledAt).toLocaleTimeString() : "—"}</td>
            </tr>`
                  )
                  .join("")
          }
        </tbody>
      </table>
    </div>

    <h2 class="section-title">API Tester</h2>
    <div class="tester">
      <div class="route-picker">
        <label style="margin:0;white-space:nowrap;color:#8b949e;">Quick pick:</label>
        <select id="routePicker">
          <option value="">— select a route —</option>
          ${routes
            .filter((r) => !["/api/status", "/api/status/json", "/api/docs", "/api/docs/json"].includes(r.path))
            .map((r) => `<option value="${r.method}|${r.path}">${r.method} ${escapeHtml(r.path)}</option>`)
            .join("")}
        </select>
      </div>
      <div class="tester-row">
        <select id="reqMethod">
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>PATCH</option>
          <option>DELETE</option>
        </select>
        <input id="reqUrl" type="text" placeholder="http://localhost:5000/api/health" value="${baseUrl}/api/health" />
        <button class="btn btn-primary" id="sendBtn">Send Request</button>
      </div>
      <div style="margin-bottom:12px;">
        <label>Headers <span style="color:#484f58;">(one per line, key: value)</span></label>
        <textarea id="reqHeaders" rows="2">Content-Type: application/json</textarea>
      </div>
      <div id="bodyWrap">
        <label>Body <span style="color:#484f58;">(JSON)</span></label>
        <textarea id="reqBody" rows="4" placeholder='{ "key": "value" }'></textarea>
      </div>

      <div class="response-panel" id="responsePanel" style="display:none;">
        <h3 class="section-title" style="font-size:14px;margin-top:12px;">Response</h3>
        <div class="response-meta">
          <span class="tag" id="resStatus"></span>
          <span style="color:#8b949e;" id="resTime"></span>
          <span style="color:#8b949e;" id="resSize"></span>
        </div>
        <div class="response-body" id="resBody"></div>
      </div>
    </div>
  </div>

  <script>
    const BASE = "";
    let autoRefresh = false;
    let refreshInterval = null;

    // Auto-refresh toggle
    const toggleWrap = document.getElementById("autoRefreshToggle");
    const toggleSwitch = document.getElementById("toggleSwitch");
    toggleWrap.addEventListener("click", () => {
      autoRefresh = !autoRefresh;
      toggleSwitch.classList.toggle("on", autoRefresh);
      if (autoRefresh) {
        refreshInterval = setInterval(fetchStats, 5000);
      } else {
        clearInterval(refreshInterval);
      }
    });

    async function fetchStats() {
      try {
        const res = await fetch(BASE + "/api/status/json");
        const data = await res.json();
        document.getElementById("lastUpdated").textContent = "Updated " + new Date(data.updatedAt).toLocaleTimeString();
        renderStats(data.stats);
        updateSummary(data.stats);
      } catch (e) { /* silent */ }
    }

    function updateSummary(stats) {
      const total = stats.reduce((s, r) => s + r.totalCalls, 0);
      const unique = stats.length;
      const avg = stats.length > 0 ? stats.reduce((s, r) => s + r.avgResponseTimeMs, 0) / stats.length : 0;
      document.getElementById("totalRequests").textContent = total;
      document.getElementById("uniqueEndpoints").textContent = unique;
      document.getElementById("avgResponseTime").textContent = avg.toFixed(1) + "ms";
    }

    function renderStats(stats) {
      const body = document.getElementById("statsBody");
      if (stats.length === 0) {
        body.innerHTML = '<tr><td colspan="8" class="empty-state">No API calls recorded yet.</td></tr>';
        return;
      }
      body.innerHTML = stats.map(r => {
        const codes = Object.entries(r.statusCodes).map(([code, count]) => {
          const c = parseInt(code);
          const cls = c < 300 ? "status-2xx" : c < 400 ? "status-3xx" : c < 500 ? "status-4xx" : "status-5xx";
          return '<span class="status-badge ' + cls + '">' + code + ': ' + count + '</span>';
        }).join(" ");
        return '<tr>' +
          '<td><span class="method-badge method-' + r.method + '">' + r.method + '</span></td>' +
          '<td>' + escapeHtml(r.path) + '</td>' +
          '<td>' + r.totalCalls + '</td>' +
          '<td>' + codes + '</td>' +
          '<td>' + r.avgResponseTimeMs.toFixed(1) + 'ms</td>' +
          '<td>' + r.minResponseTimeMs.toFixed(1) + 'ms</td>' +
          '<td>' + r.maxResponseTimeMs.toFixed(1) + 'ms</td>' +
          '<td>' + (r.lastCalledAt ? new Date(r.lastCalledAt).toLocaleTimeString() : "\\u2014") + '</td>' +
        '</tr>';
      }).join("");
    }

    function escapeHtml(str) {
      const d = document.createElement("div");
      d.textContent = str;
      return d.innerHTML;
    }

    // Route picker
    document.getElementById("routePicker").addEventListener("change", (e) => {
      if (!e.target.value) return;
      const [method, path] = e.target.value.split("|");
      document.getElementById("reqMethod").value = method;
      document.getElementById("reqUrl").value = window.location.origin + path;
      toggleBody();
    });

    // Show/hide body based on method
    const methodSelect = document.getElementById("reqMethod");
    methodSelect.addEventListener("change", toggleBody);
    function toggleBody() {
      const m = methodSelect.value;
      document.getElementById("bodyWrap").style.display = ["POST","PUT","PATCH"].includes(m) ? "" : "none";
    }
    toggleBody();

    // Send request
    document.getElementById("sendBtn").addEventListener("click", async () => {
      const method = document.getElementById("reqMethod").value;
      const url = document.getElementById("reqUrl").value;
      const headersText = document.getElementById("reqHeaders").value;
      const body = document.getElementById("reqBody").value;
      const btn = document.getElementById("sendBtn");

      const headers = {};
      headersText.split("\\n").forEach(line => {
        const idx = line.indexOf(":");
        if (idx > 0) headers[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
      });

      const opts = { method, headers };
      if (["POST","PUT","PATCH"].includes(method) && body.trim()) {
        opts.body = body;
      }

      btn.disabled = true;
      btn.textContent = "Sending...";
      const panel = document.getElementById("responsePanel");
      const start = performance.now();

      try {
        const res = await fetch(url, opts);
        const elapsed = (performance.now() - start).toFixed(0);
        const text = await res.text();
        const size = new Blob([text]).size;

        panel.style.display = "";
        const statusEl = document.getElementById("resStatus");
        statusEl.textContent = res.status + " " + res.statusText;
        const statusCls = res.status < 300 ? "status-2xx" : res.status < 400 ? "status-3xx" : res.status < 500 ? "status-4xx" : "status-5xx";
        statusEl.className = "tag " + statusCls;
        document.getElementById("resTime").textContent = elapsed + "ms";
        document.getElementById("resSize").textContent = formatBytes(size);

        try {
          const json = JSON.parse(text);
          document.getElementById("resBody").innerHTML = syntaxHighlight(JSON.stringify(json, null, 2));
        } catch {
          document.getElementById("resBody").textContent = text;
        }
      } catch (err) {
        panel.style.display = "";
        document.getElementById("resStatus").textContent = "Error";
        document.getElementById("resStatus").className = "tag status-5xx";
        document.getElementById("resTime").textContent = "";
        document.getElementById("resSize").textContent = "";
        document.getElementById("resBody").textContent = err.message;
      } finally {
        btn.disabled = false;
        btn.textContent = "Send Request";
      }
    });

    function formatBytes(bytes) {
      if (bytes < 1024) return bytes + " B";
      return (bytes / 1024).toFixed(1) + " KB";
    }

    function syntaxHighlight(json) {
      return json.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
        .replace(/"(\\\\u[\\da-fA-F]{4}|\\\\[^u]|[^\\\\"])*"(\\s*:)?/g, function(match) {
          let cls = "json-string";
          if (/:$/.test(match)) {
            cls = "json-key";
            match = match.replace(/:$/, "") + ":";
          }
          return '<span class="' + cls + '">' + match + '</span>';
        })
        .replace(/\\b(true|false)\\b/g, '<span class="json-bool">$&</span>')
        .replace(/\\bnull\\b/g, '<span class="json-null">$&</span>')
        .replace(/\\b(-?\\d+\\.?\\d*([eE][+-]?\\d+)?)\\b/g, '<span class="json-number">$&</span>');
    }
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatStatusCodes(codes: Record<number, number>): string {
  return Object.entries(codes)
    .map(([code, count]) => {
      const c = parseInt(code);
      const cls =
        c < 300
          ? "status-2xx"
          : c < 400
            ? "status-3xx"
            : c < 500
              ? "status-4xx"
              : "status-5xx";
      return `<span class="status-badge ${cls}">${code}: ${count}</span>`;
    })
    .join(" ");
}
