// Bụi lơ lửng trong ánh đèn.
import { small, reduce } from '../../env.js';
import { T, scene, onFrame } from '../core.js';
import { rr } from '../random.js';
import { radialTex } from '../textures/canvas.js';

export function buildDust() {
  const n = small ? 220 : 480, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { pos[i * 3] = rr(-4.5, 4.5); pos[i * 3 + 1] = rr(0.3, 3.8); pos[i * 3 + 2] = rr(-43.5, -20.5); }
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3));
  const dust = new T.Points(geo, new T.PointsMaterial({ size: 0.018, color: '#ffe4bd', transparent: true, opacity: 0.5, depthWrite: false, blending: T.AdditiveBlending, map: radialTex('rgba(255,255,255,1)') }));
  scene.add(dust);
  if (!reduce) onFrame(t => { dust.position.y = Math.sin(t * 0.0002) * 0.12; dust.rotation.y = Math.sin(t * 0.00005) * 0.02; });
}
