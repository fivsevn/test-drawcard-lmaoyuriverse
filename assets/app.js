
// === 基础配置 ===
const CARD_COUNT = 10; // 卡片数量
const CARD_PATHS = Array.from({length: CARD_COUNT}, (_,i)=> `cards/${i+1}.png`);
const CANVAS_W = 720, CANVAS_H = 1080; // 画布尺寸（与图片尺寸一致最佳）

// === DOM ===
const canvas = document.getElementById('cardCanvas');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
const ctx = canvas.getContext('2d');
const drawBtn = document.getElementById('drawBtn');
const saveBtn = document.getElementById('saveBtn');

let currentDataURL = null;

// === 工具：序列号 ===
// 形如：SN-YYMMDD-HHMM-四位随机
function genSN(){
  const now = new Date();
  const y = (now.getFullYear() % 100).toString().padStart(2,'0');
  const m = (now.getMonth()+1).toString().padStart(2,'0');
  const d = now.getDate().toString().padStart(2,'0');
  const hh = now.getHours().toString().padStart(2,'0');
  const mm = now.getMinutes().toString().padStart(2,'0');
  const rnd = Math.floor(Math.random()*10000).toString().padStart(4,'0');
  return `SN-${y}${m}${d}-${hh}${mm}-${rnd}`;
}

// === 核心：抽卡绘制 ===
async function drawCard(){
  const img = new Image();
  // 同源资源可直接 toDataURL 保存；若使用 CDN，请确保允许 CORS，并设置：img.crossOrigin = 'anonymous'
  const path = CARD_PATHS[Math.floor(Math.random()*CARD_PATHS.length)];
  img.src = path + '?t=' + Math.random(); // 防缓存
  await new Promise((res, rej)=>{
    img.onload = res;
    img.onerror = rej;
  });

  // 清空 & 绘制卡面
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // 底部半透明条
  const barH = 60, pad = 20;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(0, canvas.height - barH, canvas.width, barH);

  // 序列号
  const sn = genSN();
  ctx.fillStyle = '#fff';
  ctx.font = '28px Arial, Helvetica, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(sn, pad, canvas.height - barH/2);

  // 右下角提示
  const tip = '长按截图保存';
  const tw = ctx.measureText(tip).width;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText(tip, canvas.width - pad - tw, canvas.height - barH/2);

  // 尝试导出
  try {
    currentDataURL = canvas.toDataURL('image/png');
  } catch (e){
    currentDataURL = null; // 跨域污染时无法导出，允许用户直接截图
  }
}

drawBtn.addEventListener('click', drawCard);

// === 可选：一键保存（同源图片时有效） ===
saveBtn.addEventListener('click', ()=>{
  if(!currentDataURL){
    alert('无法直接保存，请使用手机截图。');
    return;
  }
  const a = document.createElement('a');
  a.href = currentDataURL;
  a.download = 'card.png';
  document.body.appendChild(a);
  a.click();
  a.remove();
});
