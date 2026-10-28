import { CANVAS_HEIGHT, CANVAS_SIZE, LAYOUT } from '../config/layout.js';
import { FEEDBACK_FALLBACKS } from '../config/defaults.js';
import { getStars, formatScore, getTier, calculatePct } from './scoring.js';

function roundedRect(ctx, x, y, w, h, r) {
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

function drawStar(ctx, cx, cy, outerRadius, innerRadius, fill) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + Math.cos(angle) * (i % 2 === 0 ? outerRadius : innerRadius);
    const y = cy + Math.sin(angle) * (i % 2 === 0 ? outerRadius : innerRadius);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function setFittedFont(ctx, text, maxWidth, maxSize, family, weight = 800) {
  let size = maxSize;
  ctx.font = `${weight} ${size}px ${family}`;
  while (size > 20 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function drawBrandLogo(ctx, theme = {}) {
  const { x, y, width, height } = LAYOUT.logo;
  roundedRect(ctx, x, y, 150, height, 18);
  const grad = ctx.createLinearGradient(x, y, x + 150, y + height);
  grad.addColorStop(0, '#16B67A');
  grad.addColorStop(1, '#3B82F6');
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.font = '800 68px "Baloo 2", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('S²', x + 75, y + height / 2 + 5);

  ctx.font = '800 58px "Baloo 2", sans-serif';
  ctx.fillStyle = theme.text || '#1647a8';
  ctx.textAlign = 'left';
  ctx.fillText('SKILL²', x + 170, y + 48);

  ctx.font = '800 58px "Baloo 2", sans-serif';
  ctx.fillStyle = '#1b8f6d';
  ctx.fillText('SUCCESS', x + 170, y + 104);
}

function drawTitleChip(ctx, title, theme = {}) {
  const { x, y, width, height } = LAYOUT.titlePill;
  roundedRect(ctx, x, y, width, height, 60);
  ctx.fillStyle = theme.accentSoft || '#E8F2FD';
  ctx.fill();

  ctx.fillStyle = theme.accent || '#1E3FA8';
  setFittedFont(ctx, title, width - 140, 65, '"Baloo 2", sans-serif');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, x + width / 2, y + height / 2 + 12);

  ctx.fillStyle = theme.stars || '#FBBF24';
  for (let i = 0; i < 4; i++) {
    const cx = x + 60 + i * 160;
    drawStar(ctx, cx, y + 38, 16, 8, theme.stars || '#FBBF24');
  }
  for (let i = 0; i < 4; i++) {
    const cx = x + width - 60 - i * 160;
    drawStar(ctx, cx, y + 38, 16, 8, theme.stars || '#FBBF24');
  }
}

function drawCourseChip(ctx, course, theme = {}) {
  const { x, y, width, height } = LAYOUT.coursePill;
  roundedRect(ctx, x, y, width, height, 26);
  ctx.fillStyle = theme.accentSoft || '#F0F6FF';
  ctx.fill();

  ctx.fillStyle = theme.text || '#1E3FA8';
  setFittedFont(ctx, course, width - 40, 28, '"Nunito", sans-serif', 700);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(course, x + width / 2, y + height / 2 + 4);
}

function drawMainCard(ctx, feedbackText, showFeedback, theme = {}) {
  const { x, y, width, height } = LAYOUT.card;
  roundedRect(ctx, x, y, width, height, 28);
  ctx.fillStyle = theme.cardBg || '#fff';
  ctx.fill();
  ctx.strokeStyle = theme.cardBorder || '#B9D4F5';
  ctx.lineWidth = 2;
  ctx.stroke();

  if (showFeedback) {
    const cardHeight = height + 48;
    roundedRect(ctx, x, y, width, cardHeight, 28);
    ctx.fillStyle = theme.cardBg || '#fff';
    ctx.fill();
    ctx.strokeStyle = theme.cardBorder || '#B9D4F5';
    ctx.stroke();

    const textY = y + height + 48;
    ctx.fillStyle = theme.text || '#1E3FA8';
    ctx.font = '700 28px "Nunito", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const wrap = wrapText(ctx, feedbackText, 540);
    const renderedLines = wrap.slice(0, 2);
    renderedLines.forEach((line, idx) => {
      ctx.fillText(line, x + width / 2, textY + idx * 34);
    });
  }
}

function drawName(ctx, name, theme = {}) {
  const { x, y, width, height } = LAYOUT.namePill;
  roundedRect(ctx, x, y, width, height, 24);
  ctx.fillStyle = theme.accentSoft || '#E8F2FD';
  ctx.fill();

  ctx.fillStyle = theme.text || '#1E3FA8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const label = name || 'Student Name';
  setFittedFont(ctx, label, width - 60, 60, '"Baloo 2", sans-serif');
  ctx.fillText(label, x + width / 2, y + height / 2 + 8);
}

function drawStars(ctx, stars, theme = {}) {
  const { cx, y, radius, gap } = LAYOUT.stars;
  const total = 5;
  const startX = cx - ((total * 2 * radius) + (gap * (total - 1))) / 2 + radius;

  for (let i = 0; i < total; i++) {
    const x = startX + i * (radius * 2 + gap);
    drawStar(ctx, x, y, radius, radius * 0.58, i < stars ? (theme.stars || '#FBBF24') : (theme.neutral || '#C5CCE0'));
  }
}

function drawScore(ctx, scoreText, theme = {}) {
  const { x, y, width, height } = LAYOUT.score;
  roundedRect(ctx, x, y, width, height, 28);
  ctx.fillStyle = theme.scoreBg || '#FDF1DC';
  ctx.fill();

  ctx.fillStyle = theme.text || '#1E3FA8';
  ctx.font = '800 92px "Baloo 2", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(scoreText, x + width / 2, y + height / 2 + 8);
}

function drawCodeTag(ctx, theme = {}) {
  const { x, y, width, height } = LAYOUT.tag;
  roundedRect(ctx, x, y, width, height, 20);
  ctx.fillStyle = theme.accentSoft || '#E2EEFF';
  ctx.fill();
  ctx.strokeStyle = theme.accent || '#7AB0FF';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(-0.18);
  ctx.fillStyle = theme.accent || '#1E3FA8';
  ctx.font = '700 44px "Nunito", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('</>', 0, 10);
  ctx.restore();
}

function drawPythonMascot(ctx) {
  const { x, y, width, height } = LAYOUT.pythonLogo;
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.scale(1, 1);

  ctx.fillStyle = '#F4C241';
  ctx.beginPath();
  ctx.arc(0, 0, 55, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#3776f0';
  ctx.beginPath();
  ctx.arc(-20, 40, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(30, 40, 50, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f1f7ff';
  ctx.beginPath();
  ctx.arc(0, 20, 55, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#3776F0';
  ctx.font = '800 48px "Baloo 2", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Py', 0, 20);
  ctx.restore();
}

function drawLaptop(ctx) {
  const { x, y, width, height } = LAYOUT.laptop;
  roundedRect(ctx, x, y, width, height, 18);
  ctx.fillStyle = '#3B82F6';
  ctx.fill();

  ctx.fillStyle = '#dfeeff';
  roundedRect(ctx, x + 34, y + 30, width - 70, height - 80, 16);
  ctx.fill();

  ctx.fillStyle = '#16B67A';
  ctx.fillRect(x + 60, y + 58, 120, 16);
  ctx.fillStyle = '#FBBF24';
  ctx.fillRect(x + 60, y + 92, 160, 16);
  ctx.fillStyle = '#1E3FA8';
  ctx.fillRect(x + 60, y + 126, 110, 14);

  ctx.fillStyle = '#1d3f9f';
  roundedRect(ctx, x + 12, y + height - 22, width - 20, 26, 12);
  ctx.fill();
}

export function drawStudentPost(canvas, row, settings = {}) {
  const ctx = canvas.getContext('2d');
  const theme = settings.theme || {};
  const accent = theme.accent || '#154eb1';
  const textColor = theme.text || accent;
  const starsColor = theme.stars || '#ffbf32';
  const neutralColor = theme.neutral || '#c6cee0';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const background = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  background.addColorStop(0, theme.backgroundStart || '#ffffff');
  background.addColorStop(1, theme.backgroundEnd || '#ffffff');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#b9d9f8';
  ctx.beginPath(); ctx.ellipse(1060, 190, 210, 150, -0.25, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(120, 670, 210, 260, 0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.ellipse(-10, 150, 260, 170, 0.15, 0, Math.PI * 2); ctx.fill();

  ctx.strokeStyle = '#8fbaf0'; ctx.lineWidth = 6; ctx.setLineDash([24, 18]);
  ctx.beginPath(); ctx.moveTo(-20, 158); ctx.bezierCurveTo(70, 100, 130, 20, 245, 4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(920, 1080); ctx.bezierCurveTo(980, 940, 1040, 930, 1100, 895); ctx.stroke(); ctx.setLineDash([]);

  ctx.fillStyle = '#b9d9f8'; ctx.beginPath(); ctx.arc(1014, 328, 27, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffcf3a';
  drawStar(ctx, 76, 398, 31, 15, '#ffcf3a'); drawStar(ctx, 1068, 520, 28, 14, '#ffcf3a');

  const courseName = settings.courseName || 'Python Programming Course';
  const quizTitle = settings.quizTitle || 'Quiz 1 Report';
  const totalMarks = settings.totalMarks || row.total || 15;
  const marks = Number(row.marks ?? 0);
  const safeTotal = Number(totalMarks) > 0 ? totalMarks : 15;
  const scoreText = formatScore(marks, safeTotal);
  const starRules = settings.starRuleMode === 'custom'
    ? settings.starRules || null
    : undefined;
  const stars = starRules ? getStars(marks, safeTotal, starRules) : getStars(marks, safeTotal);
  const normalizedName = String(row.name || 'Student Name').trim() || 'Student Name';

  roundedRect(ctx, 318, 44, 126, 126, 18);
  const logoGrad = ctx.createLinearGradient(318, 44, 444, 170);
  logoGrad.addColorStop(0, '#17b69a'); logoGrad.addColorStop(1, '#3b82f6');
  ctx.fillStyle = logoGrad; ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.font = '800 72px "Baloo 2", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('S²', 381, 112);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.font = '800 58px "Baloo 2", sans-serif'; ctx.fillStyle = '#1647a8'; ctx.fillText('SKILL²', 460, 112);
  ctx.fillStyle = '#168b67'; ctx.fillText('SUCCESS', 460, 164);

  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#1b8f6d';
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,0); ctx.stroke();
  setFittedFont(ctx, quizTitle, 690, 92, '"Baloo 2", sans-serif', 800);
  ctx.fillStyle = textColor; ctx.fillText(quizTitle, 540, 270);
  ctx.strokeStyle = '#8ec2f5'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(218, 225); ctx.quadraticCurveTo(540, 208, 862, 225); ctx.stroke();

  ctx.strokeStyle = '#f8c84b'; ctx.lineWidth = 18; ctx.lineCap = 'round';
  [[164,178],[170,230],[174,282]].forEach(([x,y]) => { ctx.beginPath(); ctx.moveTo(x,y-20); ctx.lineTo(x+46,y+22); ctx.stroke(); });
  [[916,178],[910,230],[906,282]].forEach(([x,y]) => { ctx.beginPath(); ctx.moveTo(x,y-20); ctx.lineTo(x+46,y+22); ctx.stroke(); });

  ctx.font = '800 38px "Nunito", sans-serif'; ctx.fillStyle = '#184da8'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  roundedRect(ctx, 252, 318, 576, 80, 40); ctx.fillStyle = '#edf5ff'; ctx.fill(); ctx.strokeStyle = '#cfe1f7'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = textColor; ctx.fillText(courseName, 540, 358);

  roundedRect(ctx, 182, 430, 716, 470, 24); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = '#91b9ed'; ctx.lineWidth = 4; ctx.stroke();
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#5d607e'; ctx.font = '800 34px "Nunito", sans-serif'; ctx.fillText('Student Name:', 220, 505);
  roundedRect(ctx, 220, 520, 640, 112, 22); ctx.fillStyle = '#e7f2fc'; ctx.fill();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = textColor; setFittedFont(ctx, normalizedName, 580, 58, '"Baloo 2", sans-serif', 800); ctx.fillText(normalizedName, 540, 576);

  const startX = 540 - (5 * 90) / 2 + 45;
  for (let i = 0; i < 5; i++) drawStar(ctx, startX + i * 90, 690, 43, 21, i < stars ? starsColor : neutralColor);

  roundedRect(ctx, 358, 745, 364, 122, 22); ctx.fillStyle = '#fff5df'; ctx.fill();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = textColor; ctx.font = '800 82px "Baloo 2", sans-serif'; ctx.fillText(scoreText, 540, 806);

  ctx.strokeStyle = '#a9d0f5'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 944); ctx.quadraticCurveTo(220, 858, 390, 1010); ctx.quadraticCurveTo(650, 900, 1080, 990); ctx.stroke();

  ctx.save(); ctx.translate(155, 920); ctx.rotate(-0.10);
  ctx.fillStyle = '#3776f0'; roundedRect(ctx, -82, 20, 150, 120, 36); ctx.fill(); ctx.fillStyle = '#ffd43b'; roundedRect(ctx, 20, -55, 150, 120, 36); ctx.fill();
  ctx.fillStyle = '#3776f0'; roundedRect(ctx, -56, -112, 150, 120, 36); ctx.fill(); ctx.fillStyle = '#ffd43b'; roundedRect(ctx, 18, 28, 150, 120, 36); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-18, -82, 12, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(76, 74, 12, 0, Math.PI*2); ctx.fill(); ctx.restore();

  ctx.save(); ctx.translate(838, 928); ctx.rotate(-0.12);
  roundedRect(ctx, -130, -78, 310, 190, 26); ctx.fillStyle = '#5e86ef'; ctx.fill(); ctx.strokeStyle = '#174ba8'; ctx.lineWidth = 9; ctx.stroke();
  roundedRect(ctx, -108, -55, 266, 125, 16); ctx.fillStyle = '#173970'; ctx.fill();
  ctx.fillStyle = '#2ac6a5'; ctx.fillRect(-82,-32,95,10); ctx.fillStyle='#f1b94a'; ctx.fillRect(-82,-8,150,10); ctx.fillStyle='#8aa8ff'; ctx.fillRect(-82,16,120,10); ctx.fillStyle='#24a6d8'; ctx.fillRect(-82,40,70,10);
  ctx.fillStyle = '#6f9cff'; ctx.fillRect(-8,-32,55,10);
  ctx.fillStyle = '#1f5dc9'; roundedRect(ctx, -150, 82, 350, 50, 14); ctx.fill(); ctx.restore();

  ctx.save(); ctx.translate(892, 430); ctx.rotate(0.12); roundedRect(ctx, -62,-62,124,124,18); ctx.fillStyle='#a8cdf5'; ctx.fill(); ctx.fillStyle='#ffffff'; ctx.font='800 62px "Nunito", sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('</>',0,4); ctx.restore();

  if (settings.date) {
    ctx.fillStyle = textColor;
    ctx.font = '700 26px "Nunito", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(settings.date, 1018, 100);
  }

  if (settings.feedbackEnabled && row.feedback) {
    roundedRect(ctx, 250, 850, 580, 64, 32);
    ctx.fillStyle = theme.accentSoft || '#edf5ff';
    ctx.fill();
    ctx.fillStyle = textColor;
    ctx.font = '700 24px "Nunito", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(row.feedback).slice(0, 58), 540, 882);
  }

  return canvas;
}

export function buildCanvasForRow(row, settings = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_HEIGHT;
  return drawStudentPost(canvas, row, settings);
}
