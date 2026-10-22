export default async function (p, out) {
  await p.evaluate(() => { Jogo.spoop(); const G = Jogo.G; G.npcs.robo.x = 160; G.npcs.robo.z = -295; G.p.x = 200; G.p.z = -295; G.p.yaw = Math.PI / 2; });
  await p.waitForTimeout(800);
  const r = await p.evaluate(() => {
    const cam = Jogo.cena.children.find(() => false);
    const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000); const G = Jogo.G;
    camera.position.set(G.p.x, 5, G.p.z); camera.rotation.set(0, G.p.yaw, 0, 'YXZ'); camera.updateMatrixWorld(); camera.updateProjectionMatrix();
    const rc = new THREE.Raycaster(); const res = [];
    for (const x of [-0.9, -0.6, 0.6, 0.9]) {
      rc.setFromCamera({ x, y: 0 }, camera);
      const h = rc.intersectObjects(Jogo.cena.children, false).slice(0, 2);
      res.push(x + ': ' + h.map((i) => (i.object.material.map ? (i.object.material.map.image?.src || '').split('/').slice(-2).join('/') : 'cor') + ' d=' + i.distance.toFixed(1) + ' geo=' + i.object.geometry.type + ' vis=' + i.object.visible).join(' | '));
    }
    return res;
  });
  console.log(r.join('\n'));
}
