"use client";

import { useEffect, useRef } from "react";

/**
 * Living backdrop: three parallax star layers that twinkle and drift toward
 * the cursor, periodic shooting stars, drifting nebulae, film grain and a
 * soft cursor light. `mood` is a hue that tints the nebulae per game phase;
 * each new `warpKey` briefly streaks the stars (used on phase changes).
 */
export function Cosmos({ mood = 300, warpKey = "" }: { mood?: number; warpKey?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const warpRef = useRef(0);

  useEffect(() => {
    warpRef.current = 1;
  }, [warpKey]);

  useEffect(() => {
    document.documentElement.style.setProperty("--mood", String(mood));
  }, [mood]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    type Star = { x: number; y: number; z: number; r: number; tw: number; hue: number };
    type Meteor = { x: number; y: number; vx: number; vy: number; life: number; max: number };
    let stars: Star[] = [];
    const meteors: Meteor[] = [];

    const hues = [200, 210, 290, 300, 45, 0];

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(520, (w * h) / 3200));
      stars = Array.from({ length: count }, () => {
        const z = Math.random() ** 1.8; // most stars far away
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          r: 0.35 + z * 1.6,
          tw: Math.random() * Math.PI * 2,
          hue: hues[Math.floor(Math.random() * hues.length)],
        };
      });
    };

    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / w - 0.5;
      mouse.ty = e.clientY / h - 0.5;
      if (lightRef.current) {
        lightRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(50, now - last) / 16.67;
      last = now;
      mouse.x += (mouse.tx - mouse.x) * 0.04 * dt;
      mouse.y += (mouse.ty - mouse.y) * 0.04 * dt;
      warpRef.current = Math.max(0, warpRef.current - 0.03 * dt);
      const wp = warpRef.current * warpRef.current; // ease out fast

      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;

      for (const s of stars) {
        s.tw += 0.02 * dt * (0.5 + s.z);
        // slow cosmic drift
        s.y += (0.04 + s.z * 0.18) * dt;
        if (s.y > h + 4) {
          s.y = -4;
          s.x = Math.random() * w;
        }
        const px = s.x - mouse.x * 40 * s.z;
        const py = s.y - mouse.y * 40 * s.z;
        const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(s.tw)) * (0.4 + s.z * 0.6);

        if (wp > 0.03) {
          // warp streaks radiating from centre
          const dx = px - cx;
          const dy = py - cy;
          const len = wp * 0.3 * (0.3 + s.z);
          ctx.strokeStyle = `hsla(${s.hue}, 90%, 85%, ${a})`;
          ctx.lineWidth = s.r;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + dx * len, py + dy * len);
          ctx.stroke();
        } else {
          ctx.fillStyle = `hsla(${s.hue}, 85%, ${80 + s.z * 15}%, ${a})`;
          ctx.beginPath();
          ctx.arc(px, py, s.r, 0, Math.PI * 2);
          ctx.fill();
          if (s.z > 0.82) {
            // diffraction spikes on the nearest stars
            ctx.strokeStyle = `hsla(${s.hue}, 90%, 88%, ${a * 0.45})`;
            ctx.lineWidth = 0.6;
            const k = s.r * 4.5;
            ctx.beginPath();
            ctx.moveTo(px - k, py);
            ctx.lineTo(px + k, py);
            ctx.moveTo(px, py - k);
            ctx.lineTo(px, py + k);
            ctx.stroke();
          }
        }
      }

      // shooting stars
      if (!reduce && Math.random() < 0.006 * dt && meteors.length < 3) {
        const fromLeft = Math.random() < 0.5;
        meteors.push({
          x: fromLeft ? Math.random() * w * 0.5 : w * 0.5 + Math.random() * w * 0.5,
          y: Math.random() * h * 0.4,
          vx: (fromLeft ? 1 : -1) * (9 + Math.random() * 6),
          vy: 4 + Math.random() * 3,
          life: 0,
          max: 45 + Math.random() * 30,
        });
      }
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.life += dt;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        const t = 1 - m.life / m.max;
        if (t <= 0) {
          meteors.splice(i, 1);
          continue;
        }
        const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 9, m.y - m.vy * 9);
        g.addColorStop(0, `rgba(255,255,255,${0.95 * t})`);
        g.addColorStop(0.3, `rgba(160,210,255,${0.5 * t})`);
        g.addColorStop(1, "rgba(160,120,255,0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * 9, m.y - m.vy * 9);
        ctx.stroke();
        ctx.fillStyle = `rgba(255,255,255,${t})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduce) raf = requestAnimationFrame(frame);
    };

    build();
    window.addEventListener("resize", build);
    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <>
      <div className="cosmos" aria-hidden>
        <div className="nebula n1" />
        <div className="nebula n2" />
        <div className="nebula n3" />
        <canvas ref={canvasRef} />
        <div className="cosmos-grain" />
        <div className="cosmos-vignette" />
      </div>
      <div ref={lightRef} className="cursor-light" aria-hidden />
    </>
  );
}
