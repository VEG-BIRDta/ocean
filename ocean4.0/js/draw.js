/* ====== 画板参数 ====== */
const canvas  = document.getElementById('canvas');
const ctx     = canvas.getContext('2d');
const preview = document.getElementById('preview'); // 首页小动画用
let   drawing = false;
let   eraser  = false;
let   history = [];          // 撤销栈

// 初始化画笔颜色为选择器的默认值
ctx.strokeStyle = document.getElementById('color').value;
// 设置线条末端样式为圆角，使绘制更自然
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

function saveState(){ history.push(ctx.getImageData(0,0,canvas.width,canvas.height)); }

document.getElementById('color').oninput      = e=> ctx.strokeStyle = e.target.value;
document.getElementById('lineWidth').oninput  = e=> ctx.lineWidth   = e.target.value;
document.getElementById('clear').onclick = ()=>{
  ctx.clearRect(0,0,canvas.width,canvas.height);
  history=[];
  saveState();
};
document.getElementById('undo').onclick  = ()=>{
  if(history.length>1) history.pop(), ctx.putImageData(history.at(-1),0,0);
};
document.getElementById('eraser').onclick= ()=>{
  eraser=!eraser;
  document.getElementById('eraser').textContent= eraser?'画笔':'橡皮';
};

canvas.onpointerdown = e=>{
  drawing=true;
  const rect=canvas.getBoundingClientRect();
  ctx.beginPath();
  ctx.moveTo(e.clientX-rect.left, e.clientY-rect.top);
};
canvas.onpointermove= e=>{
  if(!drawing)return;
  const rect=canvas.getBoundingClientRect();
  ctx.globalCompositeOperation= eraser?'destination-out':'source-over';
  ctx.lineTo(e.clientX-rect.left, e.clientY-rect.top);
  ctx.stroke();
};
canvas.onpointerup=()=>{
  drawing=false; saveState();
};
/* 初始存一张空白图 */
saveState();

/* ====== 提交：带名字 ====== */
document.getElementById('submit').onclick=()=>{
  const imgData = canvas.toDataURL('image/png');
  const story = document.getElementById('story').value.trim() || '一条沉默的小鱼';
  const name  = document.getElementById('fishName').value.trim() || '小鱼';
  addFishToOcean({img:imgData, story, name});
  
  // 画小鱼获得贝壳数量
  addShells(10);
  
  // 重置画板
  ctx.clearRect(0,0,canvas.width,canvas.height); history=[]; saveState();
  document.getElementById('story').value='';
  document.getElementById('fishName').value='';
  goTo('sea');
};

/* ====== 直接进入海洋按钮 ====== */
document.getElementById('goToSea').onclick = () => {
  goTo('sea');
};

/* ====== 商店按钮 ====== */
document.getElementById('goToStore').onclick = () => {
  goTo('store');
};