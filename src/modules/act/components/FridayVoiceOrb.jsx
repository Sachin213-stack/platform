import React, { useRef, useEffect } from 'react';
import './FridayVoiceOrb.css';
import { voiceEngine } from '../services/voiceEngine';

/**
 * FridayVoiceOrb — ChatGPT-Style Living Harmonic Audio Orb
 *
 * Runs a 60fps Canvas 2D rendering loop using harmonic trigonometric deformation
 * coupled directly to Web Audio API frequency spectrum (mic input & voice playback).
 *
 * States:
 * - 'idle': Gentle hypnotic breathing wave with soft cyan/indigo aura.
 * - 'listening': Organic audio-reactive wave deforming dynamically to user voice pitch & gain.
 * - 'processing': Mesmerizing cosmic galaxy vortex with swirling orbital particles (violet/magenta).
 * - 'speaking': Radiant harmonic ripples and expanding shockwave auras pulsating to Friday's voice.
 */
export function FridayVoiceOrb({
  micState = 'idle',
  size = 280,
  onClick,
}) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina display support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const baseRadius = size * 0.28;

    // Particle pool for thinking/processing vortex
    const particles = Array.from({ length: 36 }, () => ({
      angle: Math.random() * Math.PI * 2,
      distance: baseRadius * (0.6 + Math.random() * 0.8),
      speed: 0.02 + Math.random() * 0.03,
      size: 1.5 + Math.random() * 2.5,
      alpha: 0.3 + Math.random() * 0.7,
    }));

    const render = () => {
      timeRef.current += 0.025;
      const t = timeRef.current;

      // Extract real audio frequency and amplitude
      const { amplitude, frequencies } = voiceEngine.getFrequencyData();

      // Clear frame
      ctx.clearRect(0, 0, size, size);

      // Derive color palette based on micState
      let primaryColor, secondaryColor, coreColor, glowColor;

      if (micState === 'listening') {
        // Vibrant emerald & neon cyan (listening to user)
        primaryColor = 'rgba(16, 185, 129, ';
        secondaryColor = 'rgba(6, 182, 212, ';
        coreColor = 'rgba(5, 150, 105, ';
        glowColor = 'rgba(16, 185, 129, 0.45)';
      } else if (micState === 'processing') {
        // Cosmic electric violet & magenta (AI reasoning)
        primaryColor = 'rgba(168, 85, 247, ';
        secondaryColor = 'rgba(236, 72, 153, ';
        coreColor = 'rgba(126, 34, 206, ';
        glowColor = 'rgba(168, 85, 247, 0.5)';
      } else if (micState === 'speaking') {
        // Radiant cyan, sky blue & emerald (assistant speaking)
        primaryColor = 'rgba(56, 189, 248, ';
        secondaryColor = 'rgba(99, 102, 241, ';
        coreColor = 'rgba(14, 165, 233, ';
        glowColor = 'rgba(56, 189, 248, 0.55)';
      } else {
        // Idle: Deep cyan & electric indigo ambient glow
        primaryColor = 'rgba(14, 165, 233, ';
        secondaryColor = 'rgba(99, 102, 241, ';
        coreColor = 'rgba(30, 58, 138, ';
        glowColor = 'rgba(14, 165, 233, 0.25)';
      }

      // ── Ambient Background Glow Aura ─────────────────────────────
      const glowGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.2,
        centerX,
        centerY,
        baseRadius * (1.6 + (micState === 'speaking' ? amplitude * 0.6 : 0.2))
      );
      glowGradient.addColorStop(0, glowColor);
      glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
      ctx.fill();

      // ── Outer Harmonic Wave Rings ────────────────────────────────
      const waveLayers = micState === 'speaking' ? 3 : micState === 'listening' ? 2 : 1;

      for (let layer = 0; layer < waveLayers; layer++) {
        ctx.beginPath();
        const numPoints = 120;
        const layerOffset = layer * 0.4;
        const layerAmp = (layer === 0 ? 1 : 0.6) * (0.15 + amplitude * 0.85);

        for (let i = 0; i <= numPoints; i++) {
          const angle = (i / numPoints) * Math.PI * 2;
          const freqIndex = Math.floor((i / numPoints) * (frequencies.length / 2));
          const freqAmp = (frequencies[freqIndex] || 0) / 255.0;

          // Harmonic deformation formula
          let deformation = 0;
          if (micState === 'listening') {
            deformation =
              Math.sin(angle * 4 + t * 2 + layerOffset) * (8 + freqAmp * 22) +
              Math.sin(angle * 7 - t * 3) * (4 + freqAmp * 14);
          } else if (micState === 'speaking') {
            deformation =
              Math.sin(angle * 5 + t * 4 + layerOffset) * (10 + freqAmp * 26) +
              Math.cos(angle * 3 - t * 2) * (6 + freqAmp * 16);
          } else if (micState === 'processing') {
            deformation =
              Math.sin(angle * 6 + t * 5) * 6 +
              Math.cos(angle * 2 - t * 4) * 4;
          } else {
            // Idle breathing
            deformation = Math.sin(angle * 3 + t * 1.2) * 4 + Math.sin(angle * 5 - t * 0.8) * 2;
          }

          const r = Math.max(10, baseRadius + deformation * layerAmp + (layer * 8));
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();

        const strokeAlpha = (0.5 - layer * 0.15).toFixed(2);
        ctx.strokeStyle = `${primaryColor}${strokeAlpha})`;
        ctx.lineWidth = 2.5 - layer * 0.6;
        ctx.stroke();
      }

      // ── Main Organic Core Orb ─────────────────────────────────────
      ctx.beginPath();
      const corePoints = 100;
      for (let i = 0; i <= corePoints; i++) {
        const angle = (i / corePoints) * Math.PI * 2;
        const wave1 = Math.sin(angle * 3 + t * 2) * (3 + amplitude * 12);
        const wave2 = Math.cos(angle * 4 - t * 2.5) * (2 + amplitude * 8);
        const r = Math.max(10, baseRadius * 0.85 + (wave1 + wave2));
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();

      // Fluid multi-stop radial gradient for inner core
      const coreGradient = ctx.createRadialGradient(
        centerX - baseRadius * 0.25,
        centerY - baseRadius * 0.25,
        baseRadius * 0.1,
        centerX,
        centerY,
        baseRadius * 0.95
      );
      coreGradient.addColorStop(0, '#ffffff');
      coreGradient.addColorStop(0.35, `${secondaryColor}0.9)`);
      coreGradient.addColorStop(0.75, `${primaryColor}0.85)`);
      coreGradient.addColorStop(1, `${coreColor}0.95)`);

      ctx.fillStyle = coreGradient;
      ctx.fill();

      // Core rim highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // ── Particle Nebula for Processing / Thinking State ──────────
      if (micState === 'processing') {
        particles.forEach((p) => {
          p.angle += p.speed;
          const px = centerX + Math.cos(p.angle) * p.distance;
          const py = centerY + Math.sin(p.angle) * p.distance;

          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(236, 72, 153, ${p.alpha})`;
          ctx.fill();
        });
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [micState, size]);

  return (
    <div
      className={`friday-voice-orb-container friday-voice-orb--${micState}`}
      onClick={onClick}
      style={{ width: size, height: size }}
      role="button"
      tabIndex={0}
      aria-label={`Friday voice status: ${micState}. Click to interact.`}
    >
      <canvas
        ref={canvasRef}
        className="friday-voice-orb-canvas"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
