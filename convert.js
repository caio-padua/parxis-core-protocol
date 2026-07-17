import Color from 'colorjs.io';
const hexes = ['#E5D4A8', '#C9B070', '#A68B4F', '#6E5A32'];
for (const h of hexes) {
  const c = new Color(h).to('oklch');
  console.log(h, `oklch(${c.l.toFixed(3)} ${c.c.toFixed(3)} ${c.h.toFixed(1)})`);
}
