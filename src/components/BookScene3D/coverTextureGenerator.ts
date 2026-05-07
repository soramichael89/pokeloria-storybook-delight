/**
 * Génère une texture THREE.js reproduisant exactement la couverture du StoryCard.
 * Dessin via Canvas 2D API → THREE.Texture.
 */
import * as THREE from 'three';

const S = 4; // Scale ×4 pour une texture haute résolution
const W = 140 * S; // 560
const H = 224 * S; // 896
const GOLD      = '#c9a84c';
const GOLD_RGBA = 'rgba(201,168,76,';

const FRONT_COLORS: Record<string, [string, string, string]> = {
  peach:    ['hsl(18,48%,64%)',   'hsl(18,44%,56%)',   'hsl(20,40%,50%)'],
  lavender: ['hsl(270,32%,62%)',  'hsl(270,28%,54%)',  'hsl(270,25%,48%)'],
  sage:     ['hsl(148,30%,58%)',  'hsl(148,27%,50%)',  'hsl(148,24%,44%)'],
  sky:      ['hsl(205,40%,62%)',  'hsl(205,36%,54%)',  'hsl(205,32%,48%)'],
  winter:   ['hsl(210,34%,60%)',  'hsl(210,30%,52%)',  'hsl(210,26%,46%)'],
  snow:     ['hsl(30,20%,68%)',   'hsl(30,18%,60%)',   'hsl(30,15%,54%)'],
};

const IMG_BG_COLORS: Record<string, [string, string]> = {
  peach:    ['hsl(20,55%,74%)',   'hsl(20,48%,64%)'],
  lavender: ['hsl(270,35%,72%)',  'hsl(270,28%,62%)'],
  sage:     ['hsl(148,28%,68%)',  'hsl(148,24%,58%)'],
  sky:      ['hsl(205,42%,72%)',  'hsl(205,36%,62%)'],
  winter:   ['hsl(210,36%,70%)',  'hsl(210,30%,60%)'],
  snow:     ['hsl(30,22%,78%)',   'hsl(30,18%,68%)'],
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawCornerOrnament(ctx: CanvasRenderingContext2D, cx: number, cy: number, sx: number, sy: number) {
  const g = GOLD;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(sx, sy);

  // Outer L-bracket
  ctx.strokeStyle = g;
  ctx.lineWidth = 4.4;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.moveTo(4, 88);
  ctx.lineTo(4, 20);
  ctx.quadraticCurveTo(4, 4, 20, 4);
  ctx.lineTo(88, 4);
  ctx.stroke();

  // Inner L-bracket
  ctx.lineWidth = 2.2;
  ctx.globalAlpha = 0.50;
  ctx.beginPath();
  ctx.moveTo(16, 88);
  ctx.lineTo(16, 32);
  ctx.quadraticCurveTo(16, 16, 32, 16);
  ctx.lineTo(88, 16);
  ctx.stroke();

  // Corner dot
  ctx.beginPath();
  ctx.arc(22, 22, 7.2, 0, Math.PI * 2);
  ctx.fillStyle = g;
  ctx.globalAlpha = 0.85;
  ctx.fill();

  // Tick marks
  ctx.strokeStyle = g;
  ctx.lineWidth = 3.2;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(4, 48); ctx.lineTo(24, 48);  // horizontal tick
  ctx.moveTo(48, 4); ctx.lineTo(48, 24);  // vertical tick
  ctx.stroke();

  ctx.restore();
}

export function generateCoverTexture(
  story: { title: string; theme: string; coverImage: string; colorKey: string },
  onReady: (tex: THREE.Texture) => void
): void {
  const colors   = FRONT_COLORS[story.colorKey]  ?? FRONT_COLORS.peach;
  const imgBgCol = IMG_BG_COLORS[story.colorKey] ?? IMG_BG_COLORS.peach;
  const isPng    = story.coverImage?.toLowerCase().endsWith('.png');

  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  function render(coverImg: HTMLImageElement | null) {
    ctx.clearRect(0, 0, W, H);

    // ── 1. Background gradient (160deg) ──
    const angle = 160 * Math.PI / 180;
    const bx0 = W / 2 + Math.cos(angle + Math.PI) * W;
    const by0 = H / 2 + Math.sin(angle + Math.PI) * H;
    const bx1 = W / 2 + Math.cos(angle) * W;
    const by1 = H / 2 + Math.sin(angle) * H;
    const bg = ctx.createLinearGradient(bx0, by0, bx1, by1);
    bg.addColorStop(0,   colors[0]);
    bg.addColorStop(0.5, colors[1]);
    bg.addColorStop(1,   colors[2]);
    roundRect(ctx, 0, 0, W, H, 16);
    ctx.fillStyle = bg;
    ctx.fill();

    // ── 2. Spine shadow ──
    const spineShadow = ctx.createLinearGradient(0, 0, W, 0);
    spineShadow.addColorStop(0,    'rgba(0,0,0,0.30)');
    spineShadow.addColorStop(0.12, 'rgba(0,0,0,0.04)');
    spineShadow.addColorStop(0.26, 'rgba(0,0,0,0)');
    ctx.fillStyle = spineShadow;
    ctx.fillRect(0, 0, W, H);

    // ── 3. Gold outer border ──
    const oi = 20;
    ctx.strokeStyle = GOLD_RGBA + '0.70)';
    ctx.lineWidth = 4;
    ctx.strokeRect(oi, oi, W - oi * 2, H - oi * 2);

    // ── 4. Gold inner border ──
    const ii = 36;
    ctx.strokeStyle = GOLD_RGBA + '0.40)';
    ctx.lineWidth = 2;
    ctx.strokeRect(ii, ii, W - ii * 2, H - ii * 2);

    // ── 5. Corner ornaments ──
    drawCornerOrnament(ctx,  8,  8,  1,  1);  // top-left
    drawCornerOrnament(ctx, W-8, 8, -1,  1);  // top-right
    drawCornerOrnament(ctx,  8, H-8,  1, -1); // bottom-left
    drawCornerOrnament(ctx, W-8, H-8, -1, -1);// bottom-right

    // ── 6. Image area ──
    const padT = 56, padS = 32, padB = 28;
    const titleH = 156;
    const imgX = padS, imgY = padT;
    const imgW = W - padS * 2;
    const imgH = H - padT - padB - titleH;

    // Image background (PNG only)
    if (isPng) {
      const ibg = ctx.createLinearGradient(imgX, imgY, imgX + imgW, imgY + imgH);
      ibg.addColorStop(0, imgBgCol[0]);
      ibg.addColorStop(1, imgBgCol[1]);
      roundRect(ctx, imgX, imgY, imgW, imgH, 8);
      ctx.fillStyle = ibg;
      ctx.fill();
    }

    // Cover image
    if (coverImg) {
      ctx.save();
      roundRect(ctx, imgX, imgY, imgW, imgH, 8);
      ctx.clip();

      const iR  = coverImg.width / coverImg.height;
      const aR  = imgW / imgH;

      if (isPng) {
        const pad = 32;
        const dW = imgW - pad * 2, dH = imgH - pad * 2;
        const ratio = iR > dW / dH ? dW / iR : dH;
        const [dw, dh] = iR > dW / dH ? [dW, dW / iR] : [dH * iR, dH];
        ctx.drawImage(coverImg, imgX + pad + (dW - dw) / 2, imgY + pad + (dH - dh) / 2, dw, dh);
      } else {
        let dw, dh, dx, dy;
        if (iR > aR) { dh = imgH; dw = imgH * iR; dx = imgX + (imgW - dw) / 2; dy = imgY; }
        else         { dw = imgW; dh = imgW / iR;  dx = imgX; dy = imgY + (imgH - dh) / 2; }
        ctx.drawImage(coverImg, dx, dy, dw, dh);
      }

      // Vignette on image
      const vig = ctx.createRadialGradient(imgX + imgW / 2, imgY + imgH / 2, imgH * 0.25, imgX + imgW / 2, imgY + imgH / 2, Math.max(imgW, imgH) * 0.75);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.20)');
      ctx.fillStyle = vig;
      ctx.fillRect(imgX, imgY, imgW, imgH);

      ctx.restore();
    }

    // Image gold outline
    ctx.strokeStyle = GOLD_RGBA + '0.48)';
    ctx.lineWidth = 4;
    ctx.strokeRect(imgX + 8, imgY + 8, imgW - 16, imgH - 16);

    // ── 7. Title section ──
    const textY0 = padT + imgH;

    // Gold divider line
    const divW = 160;
    const divGrad = ctx.createLinearGradient(W / 2 - divW / 2, 0, W / 2 + divW / 2, 0);
    divGrad.addColorStop(0,   'rgba(201,168,76,0)');
    divGrad.addColorStop(0.5, 'rgba(201,168,76,0.70)');
    divGrad.addColorStop(1,   'rgba(201,168,76,0)');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(W / 2 - divW / 2, textY0 + 20);
    ctx.lineTo(W / 2 + divW / 2, textY0 + 20);
    ctx.stroke();

    // Title
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'rgba(0,0,0,0.50)';
    ctx.shadowBlur = 16;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = `700 ${38}px Quicksand, sans-serif`;

    const maxW = imgW - 16;
    const lines = wrapText(ctx, story.title, maxW);
    let ty = textY0 + 36;
    for (const line of lines) {
      ctx.fillText(line, W / 2, ty);
      ty += 48;
    }

    // Theme / subtitle
    ctx.shadowBlur = 6;
    ctx.shadowColor = 'rgba(0,0,0,0.40)';
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.font = `600 ${32}px Quicksand, sans-serif`;
    ctx.fillText(story.theme, W / 2, ty + 8);

    // ── 8. Build THREE.Texture ──
    const tex = new THREE.Texture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    onReady(tex);
  }

  const img = new window.Image();
  img.crossOrigin = 'anonymous';
  img.onload  = () => render(img);
  img.onerror = () => render(null);
  img.src = story.coverImage;
}
