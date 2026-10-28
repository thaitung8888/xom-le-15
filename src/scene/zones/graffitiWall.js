// Khu bức tường graffiti (tường phải, giữa tiệm).
import { T, TX } from '../core.js';
import { plane, pool } from '../helpers.js';
import { muralTex } from '../textures/mural.js';

export function buildGraffitiWall() {
  const mt = muralTex(); TX.muralCanvas = mt.image;
  plane(8, 3.6, new T.MeshStandardMaterial({ map: mt, roughness: 0.85 }), 4.95, 1.95, -32, -Math.PI / 2);
  pool(4.93, 2.2, -32, -Math.PI / 2, 8.5, 4, 0.18, 'rgba(255,230,190,1)');
}
