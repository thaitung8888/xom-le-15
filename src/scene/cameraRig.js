// Đường bay của camera qua các trạm, cộng thêm chút liếc theo chuột.
import { T, camera, renderer } from './core.js';
import { reduce } from '../env.js';

export function createCameraRig(stations) {
  const N = stations.length;
  const posCurve = new T.CatmullRomCurve3(stations.map(s => new T.Vector3(...s.camera.pos)), false, 'centripetal');
  const lookCurve = new T.CatmullRomCurve3(stations.map(s => new T.Vector3(...s.camera.look)), false, 'centripetal');
  const p = new T.Vector3(), l = new T.Vector3(), fwd = new T.Vector3(), right = new T.Vector3(), UP = new T.Vector3(0, 1, 0);
  let mx = 0, my = 0, smx = 0, smy = 0;

  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1;
  });

  function place(progress) {
    const t = progress / (N - 1);
    posCurve.getPoint(t, p); lookCurve.getPoint(t, l);
    if (!reduce) {
      smx += (mx - smx) * 0.05; smy += (my - smy) * 0.05;
      fwd.subVectors(l, p).normalize(); right.crossVectors(fwd, UP).normalize();
      const d = p.distanceTo(l);
      l.addScaledVector(right, smx * d * 0.09).addScaledVector(UP, -smy * d * 0.05);
    }
    camera.position.copy(p); camera.lookAt(l);
  }

  // Màn hình dọc thì mở góc nhìn rộng hơn
  function fit() {
    const a = innerWidth / innerHeight;
    camera.aspect = a; camera.fov = a < 0.8 ? 72 : a < 1.2 ? 62 : 55; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  }
  addEventListener('resize', fit);

  return { place, fit };
}
