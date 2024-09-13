const { createCanvas } = require('canvas');

async function generateCaptcha() {
  const canvasInstance = createCanvas(200, 100);
  const ctx = canvasInstance.getContext('2d');

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 200, 100);
  ctx.font = '30px Arial';
  ctx.fillStyle = 'black';

  const text = Math.random().toString(36).substring(2, 8);
  ctx.fillText(text, 50, 60);

  return { text, image: canvasInstance.toBuffer() };
}

module.exports = { generateCaptcha };