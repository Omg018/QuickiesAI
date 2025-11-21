import React, { useRef, useEffect, useState, useCallback } from "react";


export default function Game() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const keysRef = useRef({});
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);

  // Game entities stored in refs so they're mutable without causing rerenders
  const playerRef = useRef({ x: 300, y: 420, w: 30, h: 40, speed: 220 });
  const bulletsRef = useRef([]);
  const enemiesRef = useRef([]);
  const lastSpawnRef = useRef(0);
  const lastFrameRef = useRef(performance.now());

  // Utility - random
  const rand = (min, max) => Math.random() * (max - min) + min;

  // Reset game
  const resetGame = useCallback(() => {
    bulletsRef.current = [];
    enemiesRef.current = [];
    setScore(0);
    setLives(3);
    setLevel(1);
    playerRef.current.x = 300;
    playerRef.current.y = 420;
    setRunning(true);
    lastSpawnRef.current = 0;
    lastFrameRef.current = performance.now();
  }, []);

  // Input handlers
  useEffect(() => {
    const onKeyDown = (e) => {
      keysRef.current[e.key.toLowerCase()] = true;
      // space to shoot
      if (e.key === " " || e.code === "Space") {
        shoot();
        e.preventDefault();
      }
    };
    const onKeyUp = (e) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // Shoot function
  const shoot = useCallback(() => {
    if (!running) return;
    const p = playerRef.current;
    bulletsRef.current.push({ x: p.x + p.w / 2 - 3, y: p.y - 8, w: 6, h: 12, speed: 480 });
  }, [running]);

  // Mouse click to shoot
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onClick = (e) => {
      shoot();
    };
    canvas.addEventListener("click", onClick);
    return () => canvas.removeEventListener("click", onClick);
  }, [shoot]);

  // Spawn enemies based on time and level
  const maybeSpawnEnemy = (dt) => {
    lastSpawnRef.current += dt;
    const spawnInterval = Math.max(700 - level * 30, 300); // ms
    if (lastSpawnRef.current > spawnInterval) {
      lastSpawnRef.current = 0;
      const canvas = canvasRef.current;
      const w = rand(18, 36);
      enemiesRef.current.push({ x: rand(10, canvas.width - w - 10), y: -40, r: w / 2, speed: rand(60 + level * 10, 120 + level * 20) });
    }
  };

  // Collision helpers
  const rectCollide = (a, b) => {
    return !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);
  };
  const circleRectCollide = (c, r) => {
    // c: {x,y,r}, r: {x,y,w,h}
    const cx = Math.max(r.x, Math.min(c.x, r.x + r.w));
    const cy = Math.max(r.y, Math.min(c.y, r.y + r.h));
    const dx = c.x - cx;
    const dy = c.y - cy;
    return dx * dx + dy * dy < c.r * c.r;
  };

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const loop = (now) => {
      const dt = now - lastFrameRef.current;
      lastFrameRef.current = now;
      if (running) updateAndRender(dt / 1000, ctx, canvas);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running]);

  // Update & render
  const updateAndRender = (dt, ctx, canvas) => {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update player position from keys
    const p = playerRef.current;
    let dx = 0;
    let dy = 0;
    if (keysRef.current["arrowleft"] || keysRef.current["a"]) dx -= 1;
    if (keysRef.current["arrowright"] || keysRef.current["d"]) dx += 1;
    if (keysRef.current["arrowup"] || keysRef.current["w"]) dy -= 1;
    if (keysRef.current["arrowdown"] || keysRef.current["s"]) dy += 1;
    const len = Math.hypot(dx, dy) || 1;
    p.x += (dx / len) * p.speed * dt;
    p.y += (dy / len) * p.speed * dt;
    // clamp
    p.x = Math.max(8, Math.min(canvas.width - p.w - 8, p.x));
    p.y = Math.max(8, Math.min(canvas.height - p.h - 8, p.y));

    // Maybe spawn enemies
    maybeSpawnEnemy(dt * 1000);

    // Update bullets
    bulletsRef.current.forEach((b) => (b.y -= b.speed * dt));
    bulletsRef.current = bulletsRef.current.filter((b) => b.y + b.h > -10);

    // Update enemies
    enemiesRef.current.forEach((e) => (e.y += e.speed * dt));

    // Check collisions bullets <-> enemies
    for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
      const en = enemiesRef.current[i];
      let hit = false;
      for (let j = bulletsRef.current.length - 1; j >= 0; j--) {
        const b = bulletsRef.current[j];
        if (circleRectCollide({ x: en.x + en.r, y: en.y + en.r, r: en.r }, { x: b.x, y: b.y, w: b.w, h: b.h })) {
          // destroy both
          enemiesRef.current.splice(i, 1);
          bulletsRef.current.splice(j, 1);
          setScore((s) => s + 10);
          hit = true;
          break;
        }
      }
      if (hit) continue;
      // If enemy reached bottom -> hit player
      if (en.y - en.r > canvas.height) {
        enemiesRef.current.splice(i, 1);
        setLives((L) => {
          const next = L - 1;
          if (next <= 0) setRunning(false);
          return next;
        });
      }
    }

    // Check collision enemy <-> player
    for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
      const en = enemiesRef.current[i];
      if (circleRectCollide({ x: en.x + en.r, y: en.y + en.r, r: en.r }, { x: p.x, y: p.y, w: p.w, h: p.h })) {
        enemiesRef.current.splice(i, 1);
        setLives((L) => {
          const next = L - 1;
          if (next <= 0) setRunning(false);
          return next;
        });
      }
    }

    // Level up based on score
    const newLevel = Math.floor(score / 200) + 1;
    if (newLevel !== level) setLevel(newLevel);

    // Render background grid
    drawBackground(ctx, canvas);

    // Render player (a simple stylized man)
    drawPlayer(ctx, p);

    // Render bullets
    bulletsRef.current.forEach((b) => drawBullet(ctx, b));

    // Render enemies
    enemiesRef.current.forEach((e) => drawEnemy(ctx, e));

    // HUD
    drawHUD(ctx, canvas, score, lives, level);
  };

  // Drawing helpers
  const drawBackground = (ctx, canvas) => {
    // subtle gradient
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, "#0f172a");
    g.addColorStop(1, "#071033");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // stars
    for (let i = 0; i < 35; i++) {
      const x = (i * 97) % canvas.width;
      const y = ((i * 53) % canvas.height) * 0.6;
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(x, y, 2, 2);
    }
  };

  const drawPlayer = (ctx, p) => {
    // legs
    ctx.fillStyle = "#fef08a"; // head/skin
    // head
    ctx.beginPath();
    ctx.arc(p.x + p.w / 2, p.y - 8, 8, 0, Math.PI * 2);
    ctx.fill();
    // body
    ctx.fillStyle = "#60a5fa"; // shirt
    ctx.fillRect(p.x, p.y, p.w, p.h - 12);
    // simple eyes
    ctx.fillStyle = "#111827";
    ctx.fillRect(p.x + p.w / 2 - 5, p.y - 10, 2, 2);
    ctx.fillRect(p.x + p.w / 2 + 3, p.y - 10, 2, 2);
  };

  const drawBullet = (ctx, b) => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(b.x, b.y, b.w, b.h);
  };

  const drawEnemy = (ctx, e) => {
    // enemy body
    ctx.beginPath();
    ctx.fillStyle = "#fb7185";
    ctx.arc(e.x + e.r, e.y + e.r, e.r, 0, Math.PI * 2);
    ctx.fill();
    // eye
    ctx.fillStyle = "#111827";
    ctx.fillRect(e.x + e.r - 4, e.y + e.r - 3, 3, 3);
  };

  const drawHUD = (ctx, canvas, score, lives, level) => {
    ctx.font = "16px ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto";
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText(`Score: ${score}`, 12, 22);
    ctx.fillText(`Lives: ${lives}`, 12, 44);
    ctx.fillText(`Level: ${level}`, canvas.width - 100, 22);
  };

  // Canvas resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    const syncSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width);
      canvas.height = Math.floor(rect.height);
    };
    syncSize();
    window.addEventListener("resize", syncSize);
    return () => window.removeEventListener("resize", syncSize);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-slate-900/60 backdrop-blur-sm rounded-2xl shadow-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left - Game canvas */}
        <div className="md:col-span-2 p-2">
          <div className="rounded-xl overflow-hidden border border-slate-700">
            <div className="flex items-center justify-between bg-slate-800 px-4 py-2">
              <div className="text-white font-medium">Live Shooting - Dashboard</div>
              <div className="flex gap-2">
                <button
                  onClick={() => setRunning((r) => !r)}
                  className="px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm"
                >
                  {running ? "Pause" : "Resume"}
                </button>
                <button
                  onClick={() => resetGame()}
                  className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm"
                >
                  Restart
                </button>
              </div>
            </div>

            <div className="relative" style={{ height: 520 }}>
              <canvas
                ref={canvasRef}
                className="w-full h-full block"
                style={{ display: "block", touchAction: "none", cursor: "crosshair" }}
                onMouseDown={(e) => shoot()}
              />
              {!running && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                  <div className="text-white text-3xl font-semibold">Game Over</div>
                  <div className="text-slate-200 mt-2">Score: {score}</div>
                  <button
                    onClick={() => resetGame()}
                    className="mt-4 px-4 py-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-white"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right - Stats + Controls */}
        <div className="p-2 flex flex-col gap-3">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-sm text-slate-300">How to play</div>
            <ul className="text-sm text-slate-200 mt-2 list-disc ml-5">
              <li>Move: Arrow keys or W A S D</li>
              <li>Shoot: Click on canvas or press Space</li>
              <li>Destroy enemies before they reach bottom</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-300">Score</div>
                <div className="text-2xl font-semibold text-white">{score}</div>
              </div>
              <div>
                <div className="text-xs text-slate-300">Lives</div>
                <div className="text-2xl font-semibold text-white">{lives}</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs text-slate-300">Level</div>
              <div className="text-lg font-medium text-white">{level}</div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-3 flex-1 flex flex-col justify-center items-center gap-2">
            <div className="text-sm text-slate-300">Controls</div>
            <div className="flex gap-2">
              <button onClick={() => { keysRef.current["arrowleft"] = true; setTimeout(()=>keysRef.current["arrowleft"] = false, 120); }} className="px-3 py-1 rounded-md bg-slate-700 text-white">Left</button>
              <button onClick={() => { keysRef.current["arrowright"] = true; setTimeout(()=>keysRef.current["arrowright"] = false, 120); }} className="px-3 py-1 rounded-md bg-slate-700 text-white">Right</button>
              <button onClick={() => shoot()} className="px-3 py-1 rounded-md bg-rose-600 text-white">Shoot</button>
            </div>
            <div className="text-xs text-slate-400 mt-2">Tip: Click the canvas to focus for keyboard controls.</div>
          </div>

        </div>
      </div>
    </div>
  );
}
