import { useEffect, useRef } from 'react';

interface Blob {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  alphaDir: number;
}

const COLORS = [
  'rgba(99, 102, 241, 0.35)',  // Indigo
  'rgba(168, 85, 247, 0.30)',  // Purple
  'rgba(236, 72, 153, 0.25)',  // Pink
  'rgba(59, 130, 246, 0.30)',  // Blue
  'rgba(20, 184, 166, 0.25)',  // Teal
  'rgba(16, 185, 129, 0.25)',  // Emerald
];

const ParticleCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobsRef = useRef<Blob[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const BLOB_COUNT = 7;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const initBlobs = () => {
      blobsRef.current = Array.from({ length: BLOB_COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 180 + Math.random() * 280,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 0.15 + Math.random() * 0.35,
        alphaDir: Math.random() > 0.5 ? 1 : -1,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const blob of blobsRef.current) {
        // Move
        blob.x += blob.vx;
        blob.y += blob.vy;

        // Bounce
        if (blob.x < -blob.radius * 0.5) blob.vx = Math.abs(blob.vx);
        if (blob.x > canvas.width + blob.radius * 0.5) blob.vx = -Math.abs(blob.vx);
        if (blob.y < -blob.radius * 0.5) blob.vy = Math.abs(blob.vy);
        if (blob.y > canvas.height + blob.radius * 0.5) blob.vy = -Math.abs(blob.vy);

        // Pulse alpha
        blob.alpha += 0.0008 * blob.alphaDir;
        if (blob.alpha > 0.55) blob.alphaDir = -1;
        if (blob.alpha < 0.08) blob.alphaDir = 1;

        // Draw blob
        const grad = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius);
        grad.addColorStop(0, blob.color.replace(/[\d.]+\)$/, `${blob.alpha})`));
        grad.addColorStop(0.5, blob.color.replace(/[\d.]+\)$/, `${blob.alpha * 0.5})`));
        grad.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    resize();
    initBlobs();
    draw();

    const observer = new ResizeObserver(() => { resize(); initBlobs(); });
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(animRef.current);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none', zIndex: 0 }}
    />
  );
};

export default ParticleCanvas;