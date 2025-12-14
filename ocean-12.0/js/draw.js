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
  
// 替换 draw.js 中 submit 按钮点击事件中的以下部分代码：

// ========== 修改：按购买价格/优先级顺序检查角色冒险 ==========
// 设置角色检查顺序：章鱼哥 > 派大星 > 海绵宝宝 > 其他角色
const characterCheckOrder = [
    'squidward',   // 章鱼哥（40贝壳）
    'krabs',       // 蟹老板（50贝壳）
    'patrick',     // 派大星（30贝壳）
    'spongebob',   // 海绵宝宝（20贝壳）
    'aku',         // 阿酷（50贝壳）
    'bruce',       // 布鲁斯（50贝壳）
    'dory',        // 多莉（30贝壳）
    'marlin',      // 马林（40贝壳）
    'nemo',        // 尼莫（20贝壳）
    'shuangmiangui', // 双面龟（40贝壳）
    'meimei',       // 小美美（30贝壳）
    'paopao'        // 泡泡（20贝壳）
];

let adventureTriggered = false;

// 按顺序检查角色
for (const characterId of characterCheckOrder) {
    if (ownedItems && ownedItems.includes(characterId)) {
        const hasCompletedAdventure = localStorage.getItem(`${characterId}AdventureCompleted`) === 'true';
        
        if (!hasCompletedAdventure) {
            adventureTriggered = true;
            
            // 延迟跳转，确保鱼已添加到海洋
            setTimeout(() => {
                // 根据角色ID调用对应的跳转函数
                switch(characterId) {
                    case 'spongebob':
                        alert('太好了！现在你可以和海绵宝宝一起冒险了！');
                        goToSpongebobAdventure();
                        break;
                    case 'patrick':
                        alert('太好了！现在你可以和派大星一起冒险了！');
                        goToPatrickAdventure();
                        break;
                    case 'squidward':
                        alert('太好了！现在你可以和章鱼哥一起冒险了！');
                        goToSquidwardAdventure();
                        break;
                    case 'krabs':
                        alert('太好了！现在你可以和蟹老板一起冒险了！');
                        goToKrabsAdventure();
                        break;
                    case 'paopao':
                        alert('太好了！现在你可以和泡泡一起冒险了！');
                        goToPaopaoAdventure();
                        break;
                    case 'meimei':
                        alert('太好了！现在你可以和小美美一起冒险了！');
                        goToMeimeiAdventure();
                        break;
                    case 'shuangmiangui':
                        alert('太好了！现在你可以和双面龟一起冒险了！');
                        goToShuangmianguiAdventure();
                        break;
                    case 'aku':
                        alert('太好了！现在你可以和阿酷一起冒险了！');
                        goToAkuAdventure();
                        break;
                    case 'nemo':
                        alert('太好了！现在你可以和尼莫一起冒险了！');
                        goToNemoAdventure();
                        break;
                    case 'dory':
                        alert('太好了！现在你可以和多莉一起冒险了！');
                        goToDoryAdventure();
                        break;
                    case 'marlin':
                        alert('太好了！现在你可以和马林一起冒险了！');
                        goToMarlinAdventure();
                        break;
                    case 'bruce':
                        alert('太好了！现在你可以和布鲁斯一起冒险了！');
                        goToBruceAdventure();
                        break;
                    default:
                        goTo('sea');
                }
            }, 800);
            break; // 触发一个冒险后就退出循环
        }
    }
}

// 如果没有触发任何冒险，直接进入海洋
if (!adventureTriggered) {
    goTo('sea');
}







/* ====== 直接进入海洋按钮 ====== */
document.getElementById('goToSea').onclick = () => {
  goTo('sea');
};

// ========== 清除画板历史 ==========
function clearDrawingHistory() {
    // 清空撤销历史
    history = [];
    
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 保存初始状态
    saveState();
    
    // 重置输入框
    document.getElementById('story').value = '';
    document.getElementById('fishName').value = '';
    
    // 重置画笔设置
    ctx.strokeStyle = document.getElementById('color').value;
    ctx.lineWidth = document.getElementById('lineWidth').value;
    eraser = false;
    document.getElementById('eraser').textContent = '橡皮';
    
    console.log('画板历史已清除');
}
}
