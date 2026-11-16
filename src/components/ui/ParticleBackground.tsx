'use client'

import React, { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  alpha: number
  baseAlpha: number
  pulseSpeed: number
  pulsePhase: number
}

export default function ParticleBackground({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    let animationFrameId: number
    let isVisible = !document.hidden
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    // Adaptive particle count based on screen viewport area
    const getParticleCount = () => {
      const area = width * height
      return Math.min(75, Math.max(30, Math.floor(area / 24000)))
    }

    let particles: Particle[] = []

    const initParticles = () => {
      const count = getParticleCount()
      particles = []
      for (let i = 0; i < count; i++) {
        // Subtle depth: varied radius and opacity
        const depth = Math.random()
        const radius = 0.75 + depth * 1.35 // 0.75px to 2.1px
        const baseAlpha = 0.15 + depth * 0.38 // 0.15 to 0.53

        // Very slow, natural floating drift in different directions
        const angle = Math.random() * Math.PI * 2
        const speed = 0.12 + Math.random() * 0.18 // slow speed

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius,
          alpha: baseAlpha,
          baseAlpha,
          pulseSpeed: 0.5 + Math.random() * 1.0,
          pulsePhase: Math.random() * Math.PI * 2,
        })
      }
    }

    const resize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      initParticles()
      if (reduceMotion) {
        drawFrame()
      }
    }

    window.addEventListener('resize', resize, { passive: true })

    const handleVisibilityChange = () => {
      isVisible = !document.hidden
      if (isVisible && !reduceMotion) {
        lastTime = performance.now()
        animationFrameId = requestAnimationFrame(loop)
      } else {
        cancelAnimationFrame(animationFrameId)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    initParticles()

    let lastTime = performance.now()

    const drawFrame = () => {
      // Deep matte black canvas background
      ctx.fillStyle = '#080808'
      ctx.fillRect(0, 0, width, height)

      // Atmospheric radial gradient for rich depth without glowing neon
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.25,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.85
      )
      gradient.addColorStop(0, 'rgba(16, 16, 19, 0.5)')
      gradient.addColorStop(1, 'rgba(8, 8, 8, 0.95)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Extremely subtle, thin white connecting lines between nearby particles
      const maxDist = 95
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < maxDist) {
            // Keep connections very delicate and understated
            const lineAlpha = (1 - dist / maxDist) * 0.055
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`
            ctx.lineWidth = 0.65
            ctx.stroke()
          }
        }
      }

      // Draw pure white particles with varied opacity
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`
        ctx.fill()
      }
    }

    const loop = (currentTime: number) => {
      if (!isVisible) return

      const dt = Math.min((currentTime - lastTime) / 1000, 0.1)
      lastTime = currentTime

      // Move particles with gentle breathing/pulsing alpha
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx * dt * 60
        p.y += p.vy * dt * 60

        // Gentle subtle opacity variation
        p.pulsePhase += p.pulseSpeed * dt
        p.alpha = p.baseAlpha + Math.sin(p.pulsePhase) * 0.08
        if (p.alpha < 0.08) p.alpha = 0.08
        if (p.alpha > 0.6) p.alpha = 0.6

        // Smooth wrap-around screen boundaries
        if (p.x < -10) p.x = width + 10
        else if (p.x > width + 10) p.x = -10

        if (p.y < -10) p.y = height + 10
        else if (p.y > height + 10) p.y = -10
      }

      drawFrame()
      animationFrameId = requestAnimationFrame(loop)
    }

    if (reduceMotion) {
      drawFrame()
    } else {
      animationFrameId = requestAnimationFrame(loop)
    }

    return () => {
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      aria-hidden="true"
    />
  )
}
