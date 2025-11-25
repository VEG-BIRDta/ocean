// ========== 海洋画布初始化 ==========
const ocean = document.getElementById('ocean');
const octx = ocean.getContext('2d');
// 适配窗口大小
ocean.width = window.innerWidth;
ocean.height = window.innerHeight;
// 窗口大小变化时重新适配
window.addEventListener('resize', () => {
  ocean.width = window.innerWidth;
  ocean.height = window.innerHeight;
});

// 全局小鱼数组 & ID自增
const fishes = [];
let fishId = 0;

// ========== 本地存储：加载/保存小鱼数据 ==========
function loadFishes() {
  const saved = localStorage.getItem('oceanFishes');
  if (saved) {
    try {
      const fishData = JSON.parse(saved);
      fishData.forEach(data => {
        const fish = new Fish(data);
        fishes.push(fish);
        // 确保ID不重复
        if (fish.id >= fishId) fishId = fish.id + 1;
      });
    } catch (e) {
      console.error('加载小鱼数据失败：', e);
      localStorage.removeItem('oceanFishes'); // 清除损坏的存储
    }
  }
}

function saveFishes() {
  try {
    const fishData = fishes.map(fish => ({
      id: fish.id,
      imgSrc: fish.img.src,
      story: fish.story,
      name: fish.name,
      size: fish.size,
      x: fish.x,
      y: fish.y,
      speed: fish.speed,
      angle: fish.angle,
      vx: fish.vx,
      vy: fish.vy,
      wander: fish.wander
    }));
    localStorage.setItem('oceanFishes', JSON.stringify(fishData));
  } catch (e) {
    console.error('保存小鱼数据失败：', e);
    alert('小鱼数据保存失败，请重试！');
  }
}

// ========== 小鱼类定义 ==========
class Fish {
  constructor(data) {
    this.id = data.id;
    this.img = new Image();
    this.img.src = data.imgSrc || data.img; // 兼容新添加/存储的鱼
    this.story = data.story || '一条可爱的小鱼';
    this.name = data.name || `小鱼${this.id}`;
    this.showBubble = false;

    // 运动相关参数
    this.size = data.size || (90 + Math.random() * 40);
    this.x = data.x || (150 + Math.random() * (ocean.width - 300));
    this.y = data.y || (150 + Math.random() * (ocean.height - 300));
    this.speed = data.speed || (0.17 + Math.random() * 1.2);
    this.angle = data.angle || (Math.random() > 0.5 
      ? (Math.random() * Math.PI / 3) - Math.PI / 6 
      : Math.PI + (Math.random() * Math.PI / 3) - Math.PI / 6);
    this.vx = data.vx || Math.cos(this.angle) * this.speed;
    this.vy = data.vy || Math.sin(this.angle) * this.speed;
    this.wander = data.wander || (0.01 + Math.random() * 0.03);
    this.steering = 0;
  }

  // 更新小鱼位置（边界检测+随机游动）
  update() {
    this.steering = (Math.random() - 0.5) * this.wander;
    this.angle += this.steering;
    this.vx = Math.cos(this.angle) * this.speed;
    this.vy = Math.sin(this.angle) * this.speed;

    const halfSize = this.size / 2;
    const safeMargin = 50;

    // 左右边界检测
    if (this.x - halfSize < safeMargin) {
      this.angle = (Math.random() * Math.PI / 2) - Math.PI / 4;
      this.x = halfSize + safeMargin;
    } else if (this.x + halfSize > ocean.width - safeMargin) {
      this.angle = Math.PI + (Math.random() * Math.PI / 2) - Math.PI / 4;
      this.x = ocean.width - halfSize - safeMargin;
    }

    // 上下边界检测
    if (this.y - halfSize < safeMargin) {
      this.angle = (Math.random() * Math.PI / 2) + Math.PI / 6;
      this.y = halfSize + safeMargin;
    } else if (this.y + halfSize > ocean.height - safeMargin) {
      this.angle = (Math.random() * Math.PI / 2) + Math.PI * 2 / 3;
      this.y = ocean.height - halfSize - safeMargin;
    }

    this.x += this.vx;
    this.y += this.vy;
  }

  // 绘制小鱼（镜像处理方向）
  draw() {
    octx.save();
    octx.translate(this.x, this.y);
    // 小鱼朝左/右时镜像翻转
    if (this.vx > 0) octx.scale(-1, 1);
    octx.drawImage(this.img, -this.size/2, -this.size/2, this.size, this.size);
    octx.restore();
  }
}

// ========== 添加小鱼到海洋（供绘画页面调用） ==========
function addFishToOcean(obj) {
  const safeMargin = 150;
  const fish = new Fish({
    id: fishId++,
    img: obj.img,
    imgSrc: obj.img,
    story: obj.story,
    name: obj.name,
    size: 90 + Math.random() * 40,
    x: safeMargin + Math.random() * (ocean.width - 2 * safeMargin),
    y: safeMargin + Math.random() * (ocean.height - 2 * safeMargin),
    speed: 0.3 + Math.random() * 1.5,
    angle: Math.random() > 0.5 
      ? (Math.random() * Math.PI / 3) - Math.PI / 6 
      : Math.PI + (Math.random() * Math.PI / 3) - Math.PI / 6,
    vx: 0,
    vy: 0,
    wander: 0.01 + Math.random() * 0.03
  });
  // 初始化速度
  fish.vx = Math.cos(fish.angle) * fish.speed;
  fish.vy = Math.sin(fish.angle) * fish.speed;
  
  fishes.push(fish);
  saveFishes(); // 添加后立即保存到本地
}

// ========== 气泡弹窗逻辑 ==========
let currentBubble = null;
let currentFish = null;

function updateBubble() {
  if (!currentFish || !currentBubble) return;

  const bubbleWidth = 200;
  const bubbleHeight = 80;
  
  let bubbleX, bubbleY, direction;
  // 气泡显示在小鱼左侧/右侧
  if (currentFish.x < ocean.width / 2) {
    bubbleX = currentFish.x + currentFish.size/2 + 10;
    direction = 'left';
  } else {
    bubbleX = currentFish.x - currentFish.size/2 - bubbleWidth - 10;
    direction = 'right';
  }
  
  bubbleY = currentFish.y - bubbleHeight - 10;
  
  // 气泡边界限制
  if (bubbleY < 20) bubbleY = 20;
  if (bubbleX < 20) {
    bubbleX = 20;
    direction = 'right';
  }
  if (bubbleX + bubbleWidth > ocean.width - 20) {
    bubbleX = ocean.width - bubbleWidth - 20;
    direction = 'left';
  }
  
  currentBubble.style.left = `${bubbleX}px`;
  currentBubble.style.top = `${bubbleY}px`;
  currentBubble.className = 'fish-bubble';
  currentBubble.classList.add(direction);
}

function createBubble(fish) {
  // 移除已有气泡
  if (currentBubble) {
    document.body.removeChild(currentBubble);
  }
  
  currentFish = fish;
  fish.showBubble = true;
  
  // 创建新气泡
  const bubble = document.createElement('div');
  bubble.className = 'fish-bubble';
  bubble.innerHTML = `
    <div class="fish-name">${fish.name}</div>
    <div class="fish-story">${fish.story}</div>
  `;
  document.body.appendChild(bubble);
  currentBubble = bubble;
  
  updateBubble();
  
  // 2秒后自动隐藏气泡
  setTimeout(() => {
    if (currentBubble && currentFish === fish) {
      bubble.style.opacity = '0';
      setTimeout(() => {
        if (currentBubble === bubble) {
          document.body.removeChild(bubble);
          currentBubble = null;
          currentFish.showBubble = false;
          currentFish = null;
        }
      }, 300);
    }
  }, 2000);
}

// 点击小鱼显示气泡，点击空白处隐藏气泡
ocean.onclick = e => {
  const rect = ocean.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  
  let clickedFish = null;
  // 检测是否点击到小鱼
  for (const f of fishes) {
    if (Math.hypot(mx - f.x, my - f.y) < f.size / 2) {
      clickedFish = f;
      break;
    }
  }
  
  if (clickedFish) {
    // 点击已显示气泡的小鱼 → 隐藏气泡
    if (currentFish === clickedFish) {
      document.body.removeChild(currentBubble);
      currentFish.showBubble = false;
      currentBubble = null;
      currentFish = null;
    } else {
      // 点击新小鱼 → 显示气泡
      createBubble(clickedFish);
    }
  } else if (currentBubble) {
    // 点击空白处 → 隐藏气泡
    document.body.removeChild(currentBubble);
    currentFish.showBubble = false;
    currentBubble = null;
    currentFish = null;
  }
};

// ========== 动画循环 ==========
function animate() {
  // 清空画布
  octx.clearRect(0, 0, ocean.width, ocean.height);
  // 更新并绘制所有小鱼
  fishes.forEach(f => { f.update(); f.draw(); });
  // 更新气泡位置
  updateBubble();
  requestAnimationFrame(animate);
}

// ========== 初始化 ==========
loadFishes(); // 加载本地存储的小鱼
animate();    // 启动动画

// 返回绘画页面按钮
document.getElementById('back').onclick = () => goTo('draw');

// ========== 小鱼管理面板（DOM加载完成后初始化） ==========
document.addEventListener('DOMContentLoaded', function() {
  // 获取DOM元素
  const fishListPanel = document.getElementById('fishListPanel');
  const showFishesBtn = document.getElementById('showFishes');
  const fishItemsContainer = document.getElementById('fishItems');

  // 防呆：如果元素不存在则提示
  if (!fishListPanel || !showFishesBtn || !fishItemsContainer) {
    console.warn('小鱼管理面板元素缺失，请检查HTML结构');
    return;
  }

  // 点击「管理小鱼」按钮：切换面板显示/隐藏 + 刷新列表
  showFishesBtn.addEventListener('click', function(e) {
    e.stopPropagation(); // 防止触发海洋的click事件
    fishListPanel.classList.toggle('show');
    refreshFishList();
  });

  // 刷新小鱼列表
  function refreshFishList() {
    fishItemsContainer.innerHTML = '';
    
    // 无小鱼时显示提示
    if (fishes.length === 0) {
      fishItemsContainer.innerHTML = '<p style="text-align:center; color:#999; padding:20px 0;">暂无小鱼</p>';
      return;
    }
    
    // 遍历生成小鱼列表项
    fishes.forEach(fish => {
      const item = document.createElement('div');
      item.className = 'fish-item';
      item.innerHTML = `
        <div class="info">
          <div class="name">${fish.name}</div>
          <div class="story">${fish.story || '无介绍'}</div>
        </div>
        <button class="delete-btn" data-id="${fish.id}">删除</button>
      `;
      fishItemsContainer.appendChild(item);
    });
    
    // 绑定删除按钮事件
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const fishId = parseInt(this.dataset.id);
        // 确认删除
        if (confirm(`确定要删除「${fishes.find(f => f.id === fishId)?.name || '这条小鱼'}」吗？`)) {
          deleteFishById(fishId);
        }
      });
    });
  }

  // 根据ID删除小鱼（核心逻辑）
  function deleteFishById(id) {
    const index = fishes.findIndex(fish => fish.id === id);
    if (index === -1) return;
    
    // 清理该小鱼的气泡（如果显示中）
    if (currentFish && currentFish.id === id) {
      if (currentBubble) document.body.removeChild(currentBubble);
      currentBubble = null;
      currentFish = null;
    }
    
    // 从数组删除 + 更新本地存储 + 刷新列表
    fishes.splice(index, 1);
    saveFishes();
    refreshFishList();
  }

  // 点击海洋空白处：隐藏管理面板
  ocean.addEventListener('click', function() {
    fishListPanel.classList.remove('show');
  });

  // 点击面板内部：不隐藏（阻止事件冒泡）
  fishListPanel.addEventListener('click', function(e) {
    e.stopPropagation();
  });
});