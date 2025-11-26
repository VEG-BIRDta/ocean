// ========== 海洋画布初始化 ==========
const ocean = document.getElementById('ocean');
const octx = ocean.getContext('2d');
ocean.width = window.innerWidth;
ocean.height = window.innerHeight;

window.addEventListener('resize', () => {
  ocean.width = window.innerWidth;
  ocean.height = window.innerHeight;
});

// 全局小鱼数组 & ID自增
const fishes = [];
let fishId = 0;

// ========== 泡泡系统 ==========
let bubbles = [];
let bigBubbleTimer = 0; // 大泡泡计时器（秒）
let smallBubbleTimer = 0; // 小泡泡计时器（秒）
let lastTime = 0; // 用于时间计算

class Bubble {
  constructor(type) {
    this.type = type; // 'big' 或 'small'
    this.size = type === 'big' ? 80 : 40;
    this.x = Math.random() * (ocean.width - this.size);
    this.y = ocean.height + this.size;
    this.speed = 0.3 + Math.random() * 0.4;//泡泡游动速度
    this.element = null;
    this.createElement();
  }
  
  createElement() {
    this.element = document.createElement('div');
    this.element.className = 'bubble';
    
    
    this.element.style.width = `${this.size}px`;
    this.element.style.height = `${this.size}px`;
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
    this.element.style.position = 'absolute';
    this.element.style.zIndex = '5';
    this.element.style.borderRadius = '50%';
    this.element.style.background = 'transparent'; // 透明背景，使用图片
    this.element.style.border = 'none';
    this.element.style.boxShadow = 'none';
    this.element.style.cursor = 'pointer';
    this.element.style.transition = 'all 0.3s ease';
    this.element.style.overflow = 'hidden';
    
    // 创建图片元素
    const bubbleImg = document.createElement('img');
    bubbleImg.src = 'assets/3.jpg';
    bubbleImg.style.width = '100%';
    bubbleImg.style.height = '100%';
    bubbleImg.style.borderRadius = '50%';
    bubbleImg.style.objectFit = 'cover';
    
    this.element.appendChild(bubbleImg);
    
    // 点击泡泡获得贝壳
    this.element.onclick = (e) => {
      e.stopPropagation();
      const amount = this.type === 'big' ? 2 : 1;//戳破泡泡获得贝壳数
      this.pop(amount);
      addShells(amount);
    };
    
    // 确保海洋元素存在后再添加泡泡
    const seaElement = document.getElementById('sea');
    if (seaElement) {
      seaElement.appendChild(this.element);
    }
  }
  
  update() {
    this.y -= this.speed;
    if (this.element) {
      this.element.style.top = `${this.y}px`;
    }
    
    // 移除超出屏幕的泡泡
    if (this.y < -this.size) {
      this.remove();
      return false;
    }
    return true;
  }
  
  pop(amount) {
    if (this.element) {
      // 泡泡爆炸效果 - 只添加缩放和透明度变化，不改变颜色
      this.element.style.transform = 'scale(1.5)';
      this.element.style.opacity = '0';
      
      // 创建戳破泡泡的数字动画
      this.createNumberAnimation(amount);
    }
    setTimeout(() => {
      this.remove();
    }, 300);
  }
  
  createNumberAnimation(amount) {
    const numberElement = document.createElement('div');
    numberElement.className = 'shell-gain-animation';
    numberElement.textContent = `+${amount}`;
    numberElement.style.position = 'absolute';
    numberElement.style.left = `${this.x + this.size / 2}px`;
    numberElement.style.top = `${this.y}px`;
    numberElement.style.color = '#8b5cf6'; 
    numberElement.style.fontSize = '24px';
    numberElement.style.fontWeight = 'bold';
    numberElement.style.textShadow = '0 2px 4px rgba(0,0,0,0.3)';
    numberElement.style.zIndex = '100';
    numberElement.style.pointerEvents = 'none';
    numberElement.style.animation = 'floatUp 1.5s ease-out forwards';
    
    // 添加到海洋元素
    const seaElement = document.getElementById('sea');
    if (seaElement) {
      seaElement.appendChild(numberElement);
      
      // 动画结束后移除元素
      setTimeout(() => {
        if (numberElement.parentNode) {
          numberElement.parentNode.removeChild(numberElement);
        }
      }, 1500);
    }
  }
  
  remove() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    bubbles = bubbles.filter(b => b !== this);
  }
}

// ========== 本地存储：加载/保存小鱼数据 ==========
function loadFishes() {
  const saved = localStorage.getItem('oceanFishes');
  if (saved) {
    try {
      const fishData = JSON.parse(saved);
      fishData.forEach(data => {
        const fish = new Fish(data);
        fishes.push(fish);
        if (fish.id >= fishId) fishId = fish.id + 1;
      });
    } catch (e) {
      console.error('加载小鱼数据失败：', e);
      localStorage.removeItem('oceanFishes');
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
  }
}

// ========== 小鱼类定义 ==========
class Fish {
  constructor(data) {
    this.id = data.id;
    this.img = new Image();
    this.img.src = data.imgSrc || data.img;
    this.story = data.story || '一条可爱的小鱼';
    this.name = data.name || `小鱼${this.id}`;
    this.showBubble = false;

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

  update() {
    this.steering = (Math.random() - 0.5) * this.wander;
    this.angle += this.steering;
    this.vx = Math.cos(this.angle) * this.speed;
    this.vy = Math.sin(this.angle) * this.speed;

    const halfSize = this.size / 2;
    const safeMargin = 50;

    if (this.x - halfSize < safeMargin) {
      this.angle = (Math.random() * Math.PI / 2) - Math.PI / 4;
      this.x = halfSize + safeMargin;
    } else if (this.x + halfSize > ocean.width - safeMargin) {
      this.angle = Math.PI + (Math.random() * Math.PI / 2) - Math.PI / 4;
      this.x = ocean.width - halfSize - safeMargin;
    }

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

  draw() {
    octx.save();
    octx.translate(this.x, this.y);
    if (this.vx > 0) octx.scale(-1, 1);
    octx.drawImage(this.img, -this.size/2, -this.size/2, this.size, this.size);
    octx.restore();
  }
}

// ========== 添加小鱼到海洋 ==========
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
  fish.vx = Math.cos(fish.angle) * fish.speed;
  fish.vy = Math.sin(fish.angle) * fish.speed;
  
  fishes.push(fish);
  saveFishes();
}

// ========== 小鱼气泡弹窗逻辑 ==========
let currentBubble = null;
let currentFish = null;

function updateBubble() {
  if (!currentFish || !currentBubble) return;

  const bubbleWidth = 200;
  const bubbleHeight = 80;
  
  let bubbleX, bubbleY, direction;
  if (currentFish.x < ocean.width / 2) {
    bubbleX = currentFish.x + currentFish.size/2 + 10;
    direction = 'left';
  } else {
    bubbleX = currentFish.x - currentFish.size/2 - bubbleWidth - 10;
    direction = 'right';
  }
  
  bubbleY = currentFish.y - bubbleHeight - 10;
  
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
  if (currentBubble) {
    document.body.removeChild(currentBubble);
  }
  
  currentFish = fish;
  fish.showBubble = true;
  
  const bubble = document.createElement('div');
  bubble.className = 'fish-bubble';
  bubble.innerHTML = `
    <div class="fish-name">${fish.name}</div>
    <div class="fish-story">${fish.story}</div>
  `;
  document.body.appendChild(bubble);
  currentBubble = bubble;
  
  updateBubble();
  
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

// 点击小鱼显示气泡
ocean.onclick = e => {
  const rect = ocean.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  
  let clickedFish = null;
  for (const f of fishes) {
    if (Math.hypot(mx - f.x, my - f.y) < f.size / 2) {
      clickedFish = f;
      break;
    }
  }
  
  if (clickedFish) {
    if (currentFish === clickedFish) {
      document.body.removeChild(currentBubble);
      currentFish.showBubble = false;
      currentBubble = null;
      currentFish = null;
    } else {
      createBubble(clickedFish);
    }
  } else if (currentBubble) {
    document.body.removeChild(currentBubble);
    currentFish.showBubble = false;
    currentBubble = null;
    currentFish = null;
  }
};

// ========== 动画循环 ==========
function animate(currentTime) {
  // 计算时间增量（秒）
  const deltaTime = lastTime ? (currentTime - lastTime) / 1000 : 0;
  lastTime = currentTime;
  
  octx.clearRect(0, 0, ocean.width, ocean.height);
  
  // 更新并绘制所有小鱼
  fishes.forEach(f => { f.update(); f.draw(); });
  
  // 只在海洋界面显示泡泡
  const seaScreen = document.getElementById('sea');
  if (seaScreen && !seaScreen.classList.contains('hidden')) {
    // 更新泡泡计时器（使用真实时间）
    if (deltaTime > 0) {
      bigBubbleTimer += deltaTime;
      smallBubbleTimer += deltaTime;
      
      // 大泡泡：3分钟 = 180秒
      if (bigBubbleTimer >= 180) {
        bubbles.push(new Bubble('big'));
        bigBubbleTimer = 0;
      }
      
      // 小泡泡：1分钟 = 60秒
      if (smallBubbleTimer >= 60) {
        bubbles.push(new Bubble('small'));
        smallBubbleTimer = 0;
      }
    }
    
    // 更新泡泡位置
    bubbles = bubbles.filter(bubble => bubble.update());
  }
  
  // 更新气泡位置
  updateBubble();
  requestAnimationFrame(animate);
}

// 窗口大小变化时重新计算泡泡位置
window.addEventListener('resize', () => {
  ocean.width = window.innerWidth;
  ocean.height = window.innerHeight;
  bubbles.forEach(bubble => {
    if (bubble.x > ocean.width) bubble.x = ocean.width - bubble.size;
    if (bubble.y > ocean.height) bubble.y = ocean.height - bubble.size;
    if (bubble.element) {
      bubble.element.style.left = `${bubble.x}px`;
    }
  });
});

// ========== 初始化 ==========
loadFishes();
animate(0);

// 返回绘画页面按钮
document.getElementById('back').onclick = () => goTo('draw');

// ========== 小鱼管理面板 ==========
document.addEventListener('DOMContentLoaded', function() {
  const fishListPanel = document.getElementById('fishListPanel');
  const showFishesBtn = document.getElementById('showFishes');
  const fishItemsContainer = document.getElementById('fishItems');

  if (!fishListPanel || !showFishesBtn || !fishItemsContainer) {
    console.warn('小鱼管理面板元素缺失');
    return;
  }

  showFishesBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    fishListPanel.classList.toggle('show');
    refreshFishList();
  });

  function refreshFishList() {
    fishItemsContainer.innerHTML = '';
    
    if (fishes.length === 0) {
      fishItemsContainer.innerHTML = '<p style="text-align:center; color:#999; padding:20px 0;">暂无小鱼</p>';
      return;
    }
    
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
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const fishId = parseInt(this.dataset.id);
        if (confirm(`确定要删除「${fishes.find(f => f.id === fishId)?.name || '这条小鱼'}」吗？`)) {
          deleteFishById(fishId);
        }
      });
    });
  }

  function deleteFishById(id) {
    const index = fishes.findIndex(fish => fish.id === id);
    if (index === -1) return;
    
    if (currentFish && currentFish.id === id) {
      if (currentBubble) document.body.removeChild(currentBubble);
      currentBubble = null;
      currentFish = null;
    }
    
    fishes.splice(index, 1);
    saveFishes();
    refreshFishList();
  }

  ocean.addEventListener('click', function() {
    fishListPanel.classList.remove('show');
  });

  fishListPanel.addEventListener('click', function(e) {
    e.stopPropagation();
  });
});