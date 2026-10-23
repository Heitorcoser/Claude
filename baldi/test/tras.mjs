// Botão de olhar para trás (Mirror) e a versão no título
export default async function (p, out) {
  await p.screenshot({ path: out + '/frente.png' });
  await p.dispatchEvent('#bTras', 'pointerdown');
  await p.waitForTimeout(300);
  console.log('olhando para trás:', await p.evaluate(() => [Jogo.ent.tras, (() => { const v = Jogo.camera.getWorldDirection(new THREE.Vector3()); return +(v.x * -Math.sin(Jogo.G.p.yaw) + v.z * -Math.cos(Jogo.G.p.yaw)).toFixed(2); })()]));
  await p.screenshot({ path: out + '/tras.png' });
  await p.dispatchEvent('#bTras', 'pointerup');
  await p.waitForTimeout(300);
  console.log('voltou:', await p.evaluate(() => [Jogo.ent.tras, (() => { const v = Jogo.camera.getWorldDirection(new THREE.Vector3()); return +(v.x * -Math.sin(Jogo.G.p.yaw) + v.z * -Math.cos(Jogo.G.p.yaw)).toFixed(2); })()]));
  await p.evaluate(() => { Jogo.menu(); document.getElementById('menu').hidden = true; document.getElementById('titulo').hidden = false; });
  await p.waitForTimeout(500); await p.screenshot({ path: out + '/titulo.png' });
}
