const COLORS = ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#e94560']
const PLACEHOLDER_TYPES = ['abstract', 'nature', 'architecture', 'city', 'night']

export function generateMockImageUrl(seed = 'camera') {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)].replace('#', '')
  const w = 640
  const h = 480

  return `https://picsum.photos/seed/${seed}-${Date.now()}/${w}/${h}`
}

export function generateCanvasPlaceholder(canvas, deviceId) {
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height

  const seed = deviceId ? deviceId.charCodeAt(0) * 100 : Date.now() % 360

  const gradient = ctx.createLinearGradient(0, 0, w, h)
  gradient.addColorStop(0, '#0B1121')
  gradient.addColorStop(0.5, `hsl(${seed}, 30%, 15%)`)
  gradient.addColorStop(1, '#0B1121')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, w, h)

  ctx.fillStyle = 'rgba(255,255,255,0.04)'
  for (let i = 0; i < 20; i++) {
    const x = (Math.sin(seed + i * 47) * 0.5 + 0.5) * w
    const y = (Math.cos(seed + i * 31) * 0.5 + 0.5) * h
    const r = 40 + (i % 3) * 30
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.font = '14px "Inter", sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.textAlign = 'center'
  ctx.fillText(`${deviceId || 'Camera'} — Snapshot`, w / 2, h / 2)

  const ts = new Date().toLocaleString()
  ctx.font = '11px "Inter", sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.15)'
  ctx.fillText(ts, w / 2, h / 2 + 22)

  ctx.strokeStyle = 'rgba(255,255,255,0.05)'
  ctx.lineWidth = 2
  ctx.strokeRect(0, 0, w, h)
}
