export default async function (p) {
  console.log(await p.evaluate(() => JSON.stringify({ els: document.elementsFromPoint(60, 200).map((e) => e.id || e.tagName), c: [canvas = document.getElementById('c'), canvas.width, canvas.height, canvas.clientWidth, canvas.clientHeight, innerWidth, innerHeight, devicePixelRatio].slice(1) })));
}
