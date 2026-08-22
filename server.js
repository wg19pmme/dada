#!/usr/bin/env node
/**
 * 零依赖静态服务器
 * ============================================================
 * 用于直接托管构建产物 `dist/`，让 GPT Image 本地便携版
 * 做到"解压即用、双击即开"，无需安装任何 npm 依赖。
 *
 * 用法：
 *   node server.js [端口] [静态目录]
 *   默认端口 5173，默认静态目录 ./dist
 * ============================================================
 */
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const PORT = Number(process.argv[2]) || 5173
const ROOT = normalize(join(__dirname, process.argv[3] || 'dist'))

// 常见静态资源的 MIME 类型
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.txt': 'text/plain; charset=utf-8',
}

function guessMime(path) {
  return MIME[extname(path).toLowerCase()] || 'application/octet-stream'
}

// 将请求路径安全地解析为 ROOT 下的绝对路径，防止目录穿越
function resolvePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0])
  let p = normalize(join(ROOT, decoded))
  if (!p.startsWith(ROOT)) p = ROOT
  return p
}

const server = createServer(async (req, res) => {
  try {
    let filePath = resolvePath(req.url === '/' ? '/index.html' : req.url)
    let data = null

    try {
      data = await readFile(filePath)
    } catch {
      // 文件不存在：若为路径型请求（无扩展名），SPA 回退到 index.html
      if (!extname(filePath) || filePath.endsWith('/')) {
        filePath = join(ROOT, 'index.html')
        data = await readFile(filePath)
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
        res.end('404 Not Found')
        return
      }
    }

    res.writeHead(200, {
      'Content-Type': guessMime(filePath),
      'Cache-Control': 'no-cache',
    })
    res.end(data)
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('500 Internal Server Error: ' + (err?.message || err))
  }
})

server.listen(PORT, () => {
  console.log(`\n  GPT Image 本地便携版 已启动`)
  console.log(`  >>> 请用浏览器访问：http://localhost:${PORT}\n`)
  console.log(`  （静态目录：${ROOT}）`)
  console.log(`  （提示：Ctrl+C 即可停止服务）\n`)
})
