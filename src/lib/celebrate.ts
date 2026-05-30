import confetti from "canvas-confetti"

export function celebrateOne(originX = 0.5, originY = 0.6) {
  confetti({
    particleCount: 55,
    spread: 65,
    startVelocity: 32,
    origin: { x: originX, y: originY },
    colors: ["#0066cc", "#22A877", "#FF6B35", "#F59E0B", "#8B5CF6"],
    scalar: 0.85,
  })
}

export function celebrateAll() {
  const end = Date.now() + 700
  const colors = ["#0066cc", "#22A877", "#FF6B35", "#F59E0B", "#8B5CF6"]
  ;(function frame() {
    confetti({ particleCount: 4, angle: 60,  spread: 70, origin: { x: 0, y: 0.7 }, colors })
    confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
}
