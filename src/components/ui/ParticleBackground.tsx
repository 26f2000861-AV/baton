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
  isTeal: boolean
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

    const getParticleCount = () => {
      const area = width * height
      return Math.min(60, Math.max(24, Math.floor(area / 30000)))
    }

    let particles: Particle[] = []

    const initParticles = () => {
      const count = getParticleCount()
      particles = []
      for (let i = 0; i < count; i++) {
        const isTeal = Math.random() < 0.35
        const baseAlpha = isTeal ? Math.random() * 0.25 + 0.12 : Math.random() * 0.2 + 0.08
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          radius: Math.random() * 1.0 + 0.9,
          alpha: baseAlpha,
          baseAlpha,
          isTeal,
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
      // Clean obsidian background
      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, width, height)

      // Subtle ambient vignette
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.2,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      )
      gradient.addColorStop(0, 'rgba(15, 18, 20, 0.4)')
      gradient.addColorStop(1, 'rgba(10, 10, 10, 0.85)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Connect nearby particles with subtle faint lines
      const maxDist = 85
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.06
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = particles[i].isTeal || particles[j].isTeal
              ? `rgba(45, 212, 191, ${lineAlpha * 1.2})`
              : `rgba(220, 225, 230, ${lineAlpha})`
            ctx.lineWidth = 0.75
            ctx.stroke()
          }
        }
      }

      // Draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.isTeal
          ? `rgba(45, 212, 191, ${p.alpha})`
          : `rgba(240, 240, 245, ${p.alpha})`
        ctx.fill()
      }
    }

    const loop = (currentTime: number) => {
      if (!isVisible) return

      const dt = Math.min((currentTime - lastTime) / 1000, 0.1)
      lastTime = currentTime

      // Move particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx * dt * 60
        p.y += p.vy * dt * 60

        // Wrap around borders smoothly
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

