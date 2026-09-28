import http from "node:http"
import { readFile, stat } from "node:fs/promises"
import { join, extname, normalize } from "node:path"

const { default: intake } = await import("./intake.bundle.mjs")

const DIST = new URL("../dist/", import.meta.url).pathname
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://internal")
    if (url.pathname === "/api/intake") {
      let body = ""
      for await (const chunk of req) body += chunk
      const webReq = new Request("http://internal/api/intake", {
        method: req.method,
        headers: req.headers,
        body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
      })
      const ip =
        (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
        req.socket.remoteAddress ||
        "unknown"
      const webRes = await intake(webReq, { ip })
      const headers = {}
      webRes.headers.forEach((v, k) => { headers[k] = v })
      res.writeHead(webRes.status, headers)
      res.end(Buffer.from(await webRes.arrayBuffer()))
      return
    }
    let pathname = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "")
    let file = join(DIST, pathname)
    let st = await stat(file).catch(() => null)
    if (st && st.isDirectory()) {
      file = join(file, "index.html")
      st = await stat(file).catch(() => null)
    }
    if (!st) {
      file = join(DIST, "index.html")
      st = await stat(file).catch(() => null)
    }
    if (!st) {
      res.writeHead(404)
      res.end("not found")
      return
    }
    res.writeHead(200, {
      "content-type": MIME[extname(file).toLowerCase()] || "application/octet-stream",
      "cache-control": file.includes("/assets/") ? "public, max-age=31536000, immutable" : "no-cache",
    })
    res.end(await readFile(file))
  } catch (error) {
    console.error(error)
    res.writeHead(500)
    res.end("server error")
  }
})

const port = Number(process.env.PORT || 3000)
server.listen(port, () => console.log(`spatchy server listening on ${port}`))
