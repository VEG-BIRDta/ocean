let activeBubbles = [];

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

// 全局装饰物品数组
const decors = [];

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
        // 检查是否为商店购买的角色
        if (typeof data.id === 'string' && data.id.startsWith('store_')) {
          // 商店角色的图片路径需要特殊处理
          const fish = new Fish(data);
          fishes.push(fish);
        } else {
          const fish = new Fish(data);
          fishes.push(fish);
          if (fish.id >= fishId) fishId = fish.id + 1;
        }
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
      wander: fish.wander,
      growth: fish.growth,      // 新增
      baseSize: fish.baseSize,  // 新增
      maxSize: fish.maxSize,
      hidden: fish.hidden || false 
    }));
    localStorage.setItem('oceanFishes', JSON.stringify(fishData));
  } catch (e) {
    console.error('保存小鱼数据失败：', e);
  }
}

// ========== 本地存储：加载/保存装饰物品数据 ==========
function loadDecors() {
  const saved = localStorage.getItem('oceanDecors');
  if (saved) {
    try {
      const decorData = JSON.parse(saved);
      decorData.forEach(data => {
        const decor = new Decor(data);
        decors.push(decor);
      });
    } catch (e) {
      console.error('加载装饰物品数据失败：', e);
      localStorage.removeItem('oceanDecors');
    }
  }
}

function saveDecors() {
  try {
    const decorData = decors.map(decor => ({
      id: decor.id,
      baseId: decor.baseId,
      imgSrc: decor.img.src,
      name: decor.name,
      story: decor.story,
      size: decor.size,
      x: decor.x,
      y: decor.y,
      visible: decor.visible
    }));
    localStorage.setItem('oceanDecors', JSON.stringify(decorData));
  } catch (e) {
    console.error('保存装饰物品数据失败：', e);
  }
}

// ========== 小鱼类定义 ==========
class Fish {
  constructor(data) {
    this.id = data.id;
    this.img = new Image();
    
    // 处理图片路径 - 商店角色和用户绘制的小鱼不同处理
    if (typeof data.id === 'string' && data.id.startsWith('store_')) {
      // 商店角色使用原始图片路径
      this.img.src = data.imgSrc || data.img;
    } else {
      // 用户绘制的小鱼使用 base64 数据
      this.img.src = data.imgSrc || data.img;
    }
    
    this.story = data.story || '一条可爱的小鱼';
    this.name = data.name || `小鱼${this.id}`;
    this.showBubble = false;

     this.maxSize = data.maxSize || 200; // 最大尺寸限制
    this.baseSize = data.size || (90 + Math.random() * 40); // 基础尺寸
    this.size = data.size || this.baseSize; // 当前尺寸

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

    this.hidden = data.hidden || false;
  }

  // 添加成长方法
  grow(amount) {
    // 只有当当前尺寸小于最大尺寸时才能继续成长
    if (this.size < this.maxSize) {
      this.growth += amount;
      // 每积累10点成长值增加1%的尺寸
      const newSize = this.baseSize * (1 + Math.min(this.growth / 10, 1));
      this.size = Math.min(newSize, this.maxSize);
      return true; // 成长成功
    }
    return false; // 已达到最大尺寸，无法继续成长
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

// ========== 装饰物品类定义 ==========
class Decor {
  constructor(data) {
    this.id = data.id;
    this.baseId = data.baseId;
    this.img = new Image();
    this.img.src = data.imgSrc;
    this.name = data.name || '装饰物品';
    this.story = data.story || '一个漂亮的装饰品';
    this.size = data.size || 80;
    this.x = data.x || 100;
    this.y = data.y || 100;
    this.isDragging = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.visible = data.visible !== undefined ? data.visible : true;
  }

  draw() {
    if (!this.visible) return;
    octx.save();
    octx.translate(this.x, this.y);
    octx.drawImage(this.img, -this.size/2, -this.size/2, this.size, this.size);
    octx.restore();
  }

  // 检查是否点击到装饰物品
  containsPoint(x, y) {
    const halfSize = this.size / 2;
    return x >= this.x - halfSize && x <= this.x + halfSize && 
           y >= this.y - halfSize && y <= this.y + halfSize;
  }

  // 开始拖动
  startDrag(mouseX, mouseY) {
    this.isDragging = true;
    this.dragOffsetX = mouseX - this.x;
    this.dragOffsetY = mouseY - this.y;
  }

  // 更新拖动位置
  updateDrag(mouseX, mouseY) {
    if (this.isDragging) {
      this.x = mouseX - this.dragOffsetX;
      this.y = mouseY - this.dragOffsetY;
      
      // 限制在画布范围内
      const halfSize = this.size / 2;
      this.x = Math.max(halfSize, Math.min(ocean.width - halfSize, this.x));
      this.y = Math.max(halfSize, Math.min(ocean.height - halfSize, this.y));
    }
  }

  // 停止拖动
  stopDrag() {
    this.isDragging = false;
    saveDecors(); // 保存位置
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

// 在 createBubble 函数中添加
function createBubble(fish) {
  if (currentBubble) {
    document.body.removeChild(currentBubble);
  }
  
  currentFish = fish;
  fish.showBubble = true;
  
  const bubble = document.createElement('div');
  bubble.className = 'fish-bubble';
  
  // ========== 新增：海绵宝宝特殊对话 ==========
  let bubbleContent = '';
  if (fish.id === 'store_spongebob') {
    // 海绵宝宝的特色对话
    const spongebobQuotes = [
      '我准备好了！我准备好了！',
      '嘿嘿嘿！我们去抓水母吧！',
      '章鱼哥，别那么严肃嘛！',
      '派大星，我们是最好的朋友！',
      '蟹堡王的美味蟹堡，我最爱吃了！',
      '小蜗～你在哪里呀～',
      '这就是我的秘密配方！嘿嘿！',
      '海绵宝宝永远不会放弃！'
    ];
    const randomQuote = spongebobQuotes[Math.floor(Math.random() * spongebobQuotes.length)];
    bubbleContent = `
      <div class="fish-name">海绵宝宝</div>
      <div class="fish-story">${randomQuote}</div>
    `;
    } else if (fish.id === 'store_squidward') {
  // 章鱼哥的特色对话
  const squidwardQuotes = [
    '艺术！艺术！我是艺术家！',
    '别来打扰我！我要练习单簧管！',
    '你们这些吵闹的邻居...',
    '我的鼻子！我的鼻子！',
    '我只想享受片刻的宁静...',
    '这太愚蠢了！',
    '哼！我才是最优雅的！',
    '你们能不能安静一点？'
  ];
  const randomQuote = squidwardQuotes[Math.floor(Math.random() * squidwardQuotes.length)];
  bubbleContent = `
    <div class="fish-name">章鱼哥</div>
    <div class="fish-story">${randomQuote}</div>
  `;
} else if (fish.id === 'store_krabs') {
  // 蟹老板的特色对话
  const krabsQuotes = [
    '钱！钱！钱！',
    '一分钱也不能浪费！',
    '我的美味蟹堡秘方！',
    '谁动了我的钱？',
    '赚钱！赚钱！',
    '每一分钱都很重要！',
    '我的第一块钱！',
    '这是我的！都是我的！'
  ];
  const randomQuote = krabsQuotes[Math.floor(Math.random() * krabsQuotes.length)];
  bubbleContent = `
    <div class="fish-name">蟹老板</div>
    <div class="fish-story">${randomQuote}</div>
  `;
} else if (fish.id === 'store_patrick') {
  // 派大星的特色对话
  const patrickQuotes = [
    '海绵宝宝我们去抓水母吧',
    '我饿了...',
    '嗯？什么？',
    '我是派大星！',
    '石头！我找到一块石头！',
    '肚子好饿啊...',
    '我想吃冰淇淋！',
    '嘿嘿嘿...'
  ];
  const randomQuote = patrickQuotes[Math.floor(Math.random() * patrickQuotes.length)];
  bubbleContent = `
    <div class="fish-name">派大星</div>
    <div class="fish-story">${randomQuote}</div>
  `;
  } else if (fish.id === 'store_paopao') {
    // 泡泡的特色对话
    const paopaoQuotes = [
        '我就是火热的泡泡！',
        '勇敢向前冲！',
        '没有什么能阻挡我！',
        '热情如火！',
        '我是最勇敢的泡泡！',
        '向前冲啊！',
        '激情燃烧！',
        '永不放弃！'
    ];
    const randomQuote = paopaoQuotes[Math.floor(Math.random() * paopaoQuotes.length)];
    bubbleContent = `
        <div class="fish-name">泡泡</div>
        <div class="fish-story">${randomQuote}</div>
    `;
} else if (fish.id === 'store_meimei') {
    // 小美美的特色对话
    const meimeiQuotes = [
        '歌声是最美的语言',
        '让我为你唱首歌吧',
        '美妙的旋律~',
        '听，这是大海的声音',
        '音乐让世界更美好',
        '啦啦啦~',
        '歌唱吧，朋友！',
        '用歌声传递快乐'
    ];
    const randomQuote = meimeiQuotes[Math.floor(Math.random() * meimeiQuotes.length)];
    bubbleContent = `
        <div class="fish-name">小美美</div>
        <div class="fish-story">${randomQuote}</div>
    `;
} else if (fish.id === 'store_shuangmiangui') {
    // 双面龟的特色对话
    const shuangmianguiQuotes = [
        '我有两张脸，但我很真诚',
        '不要只看表面',
        '真诚才是最重要的',
        '两面都是真实的我',
        '外表不代表内心',
        '请相信我的真诚',
        '双面也有真心',
        '看我真诚的眼睛'
    ];
    const randomQuote = shuangmianguiQuotes[Math.floor(Math.random() * shuangmianguiQuotes.length)];
    bubbleContent = `
        <div class="fish-name">双面龟</div>
        <div class="fish-story">${randomQuote}</div>
    `;
} else if (fish.id === 'store_aku') {
    // 阿酷的特色对话
    const akuQuotes = [
        '冷静思考，智慧取胜',
        '让我分析一下',
        '智慧是最强的力量',
        '思考比蛮力更重要',
        '用智慧解决问题',
        '冷静，再冷静',
        '智慧之光',
        '理性思考'
    ];
    const randomQuote = akuQuotes[Math.floor(Math.random() * akuQuotes.length)];
    bubbleContent = `
        <div class="fish-name">阿酷</div>
        <div class="fish-story">${randomQuote}</div>
    `;
  } else if (fish.id === 'store_nemo') {
    // 尼莫的特色对话
    const nemoQuotes = [
        '我只是一条小鱼，但我很勇敢！',
        '我的鳍有点小，但我不在乎！',
        '我要游过大洋，寻找自由！',
        '爸爸，我在这里！',
        '我可以做到的！',
        '勇敢的小鱼不怕困难！',
        '我的幸运鳍！',
        '我们一起回家吧！'
    ];
    const randomQuote = nemoQuotes[Math.floor(Math.random() * nemoQuotes.length)];
    bubbleContent = `
        <div class="fish-name">尼莫</div>
        <div class="fish-story">${randomQuote}</div>
    `;
} else if (fish.id === 'store_dory') {
    // 多莉的特色对话
    const doryQuotes = [
        '我是多莉，我会找到我的家人！',
        '等等，我刚刚想说什么来着？',
        '就一直游，一直游...',
        '我的记忆可能短暂，但我的心很大！',
        '哇，看那些漂亮的鱼！',
        '我说鲸鱼语！',
        '朋友永远都是朋友！',
        '找到家人，找到家！'
    ];
    const randomQuote = doryQuotes[Math.floor(Math.random() * doryQuotes.length)];
    bubbleContent = `
        <div class="fish-name">多莉</div>
        <div class="fish-story">${randomQuote}</div>
    `;
} else if (fish.id === 'store_marlin') {
    // 马林的特色对话
    const marlinQuotes = [
        '我会保护我的儿子，不惜一切代价！',
        '尼莫，小心危险！',
        '作为一个父亲，我总是担心...',
        '没有什么能阻挡我找到儿子！',
        '安全第一，尼莫！',
        '有时候需要勇敢一点',
        '家人的安全最重要',
        '我学会了要相信我的儿子'
    ];
    const randomQuote = marlinQuotes[Math.floor(Math.random() * marlinQuotes.length)];
    bubbleContent = `
        <div class="fish-name">马林</div>
        <div class="fish-story">${randomQuote}</div>
    `;
} else if (fish.id === 'store_bruce') {
    // 布鲁斯的特色对话
    const bruceQuotes = [
        '我们是朋友，不是食物！',
        '鲨鱼也可以是友善的！',
        '鱼是朋友，不是食物！',
        '我要控制我的本能...',
        '友善，友善，保持友善！',
        '做一条不吃鱼的鲨鱼！',
        '我们都是海洋大家庭',
        '和平相处最重要！'
    ];
    const randomQuote = bruceQuotes[Math.floor(Math.random() * bruceQuotes.length)];
    bubbleContent = `
        <div class="fish-name">布鲁斯</div>
        <div class="fish-story">${randomQuote}</div>
    `;
} else {
    bubbleContent = `
      <div class="fish-name">${fish.name}</div>
      <div class="fish-story">${fish.story}</div>
    `;
  }
  
  bubble.innerHTML = bubbleContent;
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

// 装饰物品气泡弹窗逻辑
let currentDecorBubble = null;
let currentDecor = null;

function createDecorBubble(decor) {
  if (currentDecorBubble) {
    document.body.removeChild(currentDecorBubble);
  }
  
  currentDecor = decor;
  
  const bubble = document.createElement('div');
  bubble.className = 'fish-bubble';
  bubble.innerHTML = `
    <div class="fish-name">${decor.name}</div>
    <div class="fish-story">${decor.story}</div>
  `;
  document.body.appendChild(bubble);
  currentDecorBubble = bubble;
  
  updateDecorBubble();
  
  setTimeout(() => {
    if (currentDecorBubble && currentDecor === decor) {
      bubble.style.opacity = '0';
      setTimeout(() => {
        if (currentDecorBubble === bubble) {
          document.body.removeChild(bubble);
          currentDecorBubble = null;
          currentDecor = null;
        }
      }, 300);
    }
  }, 2000);
}

function updateDecorBubble() {
  if (!currentDecor || !currentDecorBubble) return;

  const bubbleWidth = 200;
  const bubbleHeight = 80;
  
  let bubbleX, bubbleY, direction;
  if (currentDecor.x < ocean.width / 2) {
    bubbleX = currentDecor.x + currentDecor.size/2 + 10;
    direction = 'left';
  } else {
    bubbleX = currentDecor.x - currentDecor.size/2 - bubbleWidth - 10;
    direction = 'right';
  }
  
  bubbleY = currentDecor.y - bubbleHeight - 10;
  
  if (bubbleY < 20) bubbleY = 20;
  if (bubbleX < 20) {
    bubbleX = 20;
    direction = 'right';
  }
  if (bubbleX + bubbleWidth > ocean.width - 20) {
    bubbleX = ocean.width - bubbleWidth - 20;
    direction = 'left';
  }
  
  currentDecorBubble.style.left = `${bubbleX}px`;
  currentDecorBubble.style.top = `${bubbleY}px`;
  currentDecorBubble.className = 'fish-bubble';
  currentDecorBubble.classList.add(direction);
}

function createFeedBubble(fish) {
    // 1. 移除同鱼现有气泡（避免重复）
    activeBubbles = activeBubbles.filter(bubble => bubble.fish.id !== fish.id);

    // 2. 创建气泡元素（基础样式+专属类名）
    const bubble = document.createElement('div');
    bubble.className = 'fish-bubble fish-bubble--feed';
    bubble.dataset.fishId = fish.id;

    // 3. 喂食专属文案（确保有默认值，避免无内容）
    const feedQuotes = [
        `谢谢主人投喂！太美味啦～`,
        `哇！是我最爱的食物😋`,
        `真好吃！幸福感满满～`,
        `谢谢喂食！我变得更开心啦！`,
        `咕嘟咕嘟～吃饱啦，爱你哟❤️`,
        `这食物太香了，再来点呀！`,
        `好吃好吃，爽！爽！爽！`,
        `yummyyummy`,
        `被资本做局了，原来是饭局`,
        `芜湖！又是被投喂的一天！我游得更快啦～`,
        `喂我喂我！不然我就用尾巴拍水花溅你屏幕哦～`,
        `吃到好吃的就像这辈子都站着，吃到后坐下了`,
        `咀嚼咀嚼～感谢主人的爱心投喂！`
    ];
    const randomQuote = feedQuotes[Math.floor(Math.random() * feedQuotes.length)];

    // 4. 气泡HTML（确保结构完整）
    bubble.innerHTML = `
        <div class="fish-name">${fish.name || '小鱼'}</div>
        <div class="fish-story">${randomQuote}</div>
    `;

    // 5. 添加到页面（确保能被看到）
    document.body.appendChild(bubble);

    // 6. 记录活跃气泡
    const bubbleData = {
        element: bubble,
        fish: fish,
        timestamp: Date.now(),
        isHighPriority: true
    };
    activeBubbles.push(bubbleData);

    // 7. 计算气泡位置（关键！确保不超出屏幕）
    updateBubblePosition(bubbleData);

    // 8. 入场动画（确保能看到过渡效果）
    setTimeout(() => {
        bubble.style.opacity = '1';
        bubble.style.transform = 'translateY(0)';
    }, 10);

    // 9. 自动消失（2秒后移除）
    setTimeout(() => {
        removeBubble(fish.id);
    }, 1000);

    return true;
}

function updateBubblePosition(bubbleData) {
    const { element, fish } = bubbleData;
    const bubbleWidth = 180; // 气泡宽度（固定，避免计算错误）
    const bubbleHeight = 70; // 气泡高度（固定）

    // 关键：给鱼设置默认位置（如果鱼没有x/y坐标，气泡会出现在左上角）
    const fishX = fish.x || ocean.width / 2; // 默认屏幕中间
    const fishY = fish.y || ocean.height / 2; // 默认屏幕中间

    // 计算气泡基础位置（在鱼的上方）
    let bubbleX = fishX - bubbleWidth / 2; // 水平居中对齐鱼
    let bubbleY = fishY - bubbleHeight - 20; // 鱼上方20px

    // 边界检查（确保气泡在屏幕内）
    if (bubbleX < 20) bubbleX = 20; // 左边界
    if (bubbleX + bubbleWidth > ocean.width - 20) bubbleX = ocean.width - bubbleWidth - 20; // 右边界
    if (bubbleY < 20) bubbleY = 20; // 上边界
    if (bubbleY + bubbleHeight > ocean.height - 20) bubbleY = ocean.height - bubbleHeight - 20; // 下边界

    // 应用位置（使用fixed定位，确保不被其他元素遮挡）
    element.style.position = 'fixed';
    element.style.left = `${bubbleX}px`;
    element.style.top = `${bubbleY}px`;
    element.style.width = `${bubbleWidth}px`;
    element.style.opacity = '0'; // 初始透明（用于动画）
    element.style.transform = 'translateY(15px)'; // 初始向下偏移（用于动画）
    element.style.transition = 'opacity 0.3s ease, transform 0.3s ease'; // 过渡效果
}

function removeBubble(fishId) {
    const bubbleIndex = activeBubbles.findIndex(b => b.fish.id === fishId);
    if (bubbleIndex === -1) return;

    const bubbleData = activeBubbles[bubbleIndex];
    const bubble = bubbleData.element;

    // 退场动画
    bubble.style.opacity = '0';
    bubble.style.transform = 'translateY(15px)';

    // 动画结束后移除DOM
    setTimeout(() => {
        if (bubble.parentNode) {
            bubble.parentNode.removeChild(bubble);
        }
        activeBubbles.splice(bubbleIndex, 1);
    }, 300);
}

function initFeedButton() {
    const feedBtn = document.getElementById('feedBtn');
    if (!feedBtn) {
        console.warn('未找到喂食按钮！请检查按钮ID是否为 "feedBtn"');
        return;
    }

    // 绑定点击事件
    feedBtn.addEventListener('click', function() {
        // 1. 基础校验
        if (fishFoodCount <= 0) {
            alert('鱼食不够啦！');
            return;
        }

        // 2. 筛选可见鱼（确保有鱼可喂）
        const visibleFishes = fishes.filter(fish => !fish.hidden);
        if (visibleFishes.length === 0) {
            alert('没有可见的小鱼哦！');
            return;
        }

        // 3. 随机选一条鱼
        const randomFish = visibleFishes[Math.floor(Math.random() * visibleFishes.length)];

        // 4. 触发气泡（核心执行）
        createFeedBubble(randomFish);

        // 5. 消耗鱼食
        addFishFood(-1);

        
    });

    
}

function addBubbleStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* 基础气泡样式 */
        .fish-bubble {
            position: fixed;
            padding: 12px 16px;
            border-radius: 20px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.15);
            z-index: 9999; /* 最高层级，避免被遮挡 */
            box-sizing: border-box;
            font-family: "Microsoft YaHei", sans-serif;
        }

        /* 喂食专属气泡样式 */
        .fish-bubble--feed {
            background-color: #f0fff4 !important;
            border: 2px solid #4ade80 !important;
        }

        /* 鱼名字样式 */
        .fish-bubble .fish-name {
            font-size: 15px;
            font-weight: bold;
            margin-bottom: 4px;
            color: #166534 !important;
        }

        /* 对话内容样式 */
        .fish-bubble .fish-story {
            font-size: 14px;
            color: #0f766e !important;
            line-height: 1.5;
        }
    `;
    document.head.appendChild(style);
}

// 鼠标事件处理
let isDraggingDecor = false;
let currentDraggingDecor = null;

ocean.onpointerdown = e => {
  const rect = ocean.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  
  // 先检查是否点击到装饰物品
  for (const decor of decors) {
    if (decor.containsPoint(mx, my)) {
      decor.startDrag(mx, my);
      isDraggingDecor = true;
      currentDraggingDecor = decor;
      
      // 隐藏气泡
      if (currentDecorBubble) {
        document.body.removeChild(currentDecorBubble);
        currentDecorBubble = null;
        currentDecor = null;
      }
      return;
    }
  }
  
  // 如果没有点击到装饰物品，检查是否点击到小鱼
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
  
  // 检查是否点击到装饰物品显示气泡
  let clickedDecor = null;
  for (const decor of decors) {
    if (decor.containsPoint(mx, my)) {
      clickedDecor = decor;
      break;
    }
  }
  
  if (clickedDecor) {
    if (currentDecor === clickedDecor) {
      document.body.removeChild(currentDecorBubble);
      currentDecorBubble = null;
      currentDecor = null;
    } else {
      createDecorBubble(clickedDecor);
    }
  } else if (currentDecorBubble) {
    document.body.removeChild(currentDecorBubble);
    currentDecorBubble = null;
    currentDecor = null;
  }
};

ocean.onpointermove = e => {
  if (isDraggingDecor && currentDraggingDecor) {
    const rect = ocean.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    currentDraggingDecor.updateDrag(mx, my);
  }
};

ocean.onpointerup = () => {
  if (isDraggingDecor && currentDraggingDecor) {
    currentDraggingDecor.stopDrag();
    isDraggingDecor = false;
    currentDraggingDecor = null;
  }
};

// ========== 动画循环 ==========
function animate(currentTime) {
  // 计算时间增量（秒）
  const deltaTime = lastTime ? (currentTime - lastTime) / 1000 : 0;
  lastTime = currentTime;
  
  octx.clearRect(0, 0, ocean.width, ocean.height);
  
  fishes.forEach(f => { 
    if (!f.hidden) { // 只有不隐藏的鱼才更新和绘制
      f.update(); 
      f.draw(); 
    }
  });

  
  // 绘制所有装饰物品
  decors.forEach(decor => decor.draw());
  
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
  updateDecorBubble();
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
loadDecors();
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
    
    if (fishes.length === 0 && decors.length === 0) {
      fishItemsContainer.innerHTML = '<p style="text-align:center; color:#999; padding:20px 0;">暂无物品</p>';
      return;
    }
    
    // 显示小鱼
    fishes.forEach(fish => {
      const item = document.createElement('div');
      item.className = 'fish-item';
      
      const isStoreCharacter = typeof fish.id === 'string' && fish.id.startsWith('store_');
      const typeBadge = isStoreCharacter ? '<span class="store-badge">商店</span>' : '';
      
      const isHidden = isStoreCharacter && fish.hidden;
      const statusText = isHidden ? '（已隐藏）' : '';
      
      item.innerHTML = `
        <div class="info">
          <div class="name">${fish.name} ${typeBadge} ${statusText}</div>
          <div class="story">${fish.story || '无介绍'}</div>
        </div>
        <div class="fish-actions">
          ${isStoreCharacter ? 
            `<button class="toggle-visibility-btn" data-id="${fish.id}">${isHidden ? '投放' : '隐藏'}</button>` : 
            `<button class="delete-btn" data-id="${fish.id}">删除</button>`
          }
        </div>
      `;
      fishItemsContainer.appendChild(item);
    });
    
    // 显示装饰物品（按类型分组）
    const decorGroups = groupDecorsByType();
    
    Object.keys(decorGroups).forEach(baseId => {
      const group = decorGroups[baseId];
      const totalCount = group.totalCount;
      const visibleCount = group.visibleCount;
      
      const item = document.createElement('div');
      item.className = 'fish-item decor-group-item';
      
      item.innerHTML = `
        <div class="info">
          <div class="name">${group.name} <span class="decor-badge">装饰</span></div>
          <div class="story">${group.story || '无介绍'}</div>
          <div class="decor-count">已购买: ${totalCount} | 显示中: ${visibleCount}</div>
        </div>
        <div class="decor-controls">
          <button class="decor-decrease-btn" data-baseid="${baseId}">-</button>
          <span class="decor-count-display">${visibleCount}</span>
          <button class="decor-increase-btn" data-baseid="${baseId}">+</button>
        </div>
      `;
      fishItemsContainer.appendChild(item);
    });
    
    // 绑定删除按钮事件
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const id = this.dataset.id;
        const fishId = parseInt(id);
        if (confirm(`确定要删除「${fishes.find(f => f.id === fishId)?.name || '这条小鱼'}」吗？`)) {
          deleteFishById(fishId);
        }
      });
    });
    
    // 绑定隐藏/显示按钮事件
    document.querySelectorAll('.toggle-visibility-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const fishId = this.dataset.id;
        toggleFishVisibility(fishId);
      });
    });
    
    // 绑定装饰物品数量控制按钮事件
    document.querySelectorAll('.decor-increase-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const baseId = this.dataset.baseid;
        changeDecorCount(baseId, 1);
      });
    });
    
    document.querySelectorAll('.decor-decrease-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const baseId = this.dataset.baseid;
        changeDecorCount(baseId, -1);
      });
    });
  }

// 按类型分组装饰物品
function groupDecorsByType() {
  const groups = {};
  
  decors.forEach(decor => {
    // 确定装饰物品的基础ID
    let baseId = decor.baseId;
    
    // 如果没有baseId，尝试从id中提取（兼容旧数据）
    if (!baseId && typeof decor.id === 'string' && decor.id.startsWith('store_')) {
      const parts = decor.id.split('_');
      if (parts.length >= 2) {
        baseId = parts[1];
      }
    }
    
    if (!baseId) return;
    
    if (!groups[baseId]) {
      groups[baseId] = {
        name: decor.name,
        story: decor.story,
        totalCount: 0,
        visibleCount: 0,
        decors: []
      };
    }
    
    groups[baseId].totalCount++;
    if (decor.visible) groups[baseId].visibleCount++;
    groups[baseId].decors.push(decor);
  });
  
  return groups;
}

  // 改变装饰物品显示数量
  function changeDecorCount(baseId, change) {
    const group = groupDecorsByType()[baseId];
    if (!group) return;
    
    const newVisibleCount = group.visibleCount + change;
    const totalCount = group.totalCount;
    
    // 限制范围：0 到 总数量
    if (newVisibleCount < 0 || newVisibleCount > totalCount) return;
    
    // 更新装饰物品的可见性
    let visibleUpdated = 0;
    group.decors.forEach(decor => {
      if (change > 0 && visibleUpdated < change && !decor.visible) {
        // 增加显示数量
        decor.visible = true;
        visibleUpdated++;
      } else if (change < 0 && visibleUpdated < -change && decor.visible) {
        // 减少显示数量
        decor.visible = false;
        visibleUpdated++;
      }
    });
    
    saveDecors();
    refreshFishList();
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

  function toggleFishVisibility(fishId) {
    const fish = fishes.find(f => f.id === fishId);
    if (!fish) return;
    
    fish.hidden = !fish.hidden;
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


// ========== 清除用户绘制的小鱼 ==========
function clearUserDrawnFishes() {
    if (!fishes || !Array.isArray(fishes)) return;
    
    // 筛选出用户绘制的小鱼
    const userFishes = fishes.filter(fish => {
        if (!fish || !fish.id) return false;
        
        // 判断是否为用户绘制的小鱼
        // 1. ID是数字（用户绘制的小鱼）
        // 2. 图片是base64格式
        // 3. 不是商店角色
        const isStoreCharacter = typeof fish.id === 'string' && fish.id.startsWith('store_');
        const isBase64Image = (fish.img && fish.img.src && fish.img.src.startsWith('data:')) || 
                              (fish.imgSrc && fish.imgSrc.startsWith('data:'));
        
        return !isStoreCharacter && (typeof fish.id === 'number' || isBase64Image);
    });
    
    console.log('找到用户绘制的小鱼数量:', userFishes.length);
    
    // 删除用户绘制的小鱼
    userFishes.forEach(fish => {
        const index = fishes.indexOf(fish);
        if (index !== -1) {
            // 如果当前显示的气泡是这条鱼的，清除气泡
            if (currentFish === fish && currentBubble) {
                document.body.removeChild(currentBubble);
                currentBubble = null;
                currentFish = null;
            }
            
            // 移除鱼
            fishes.splice(index, 1);
        }
    });
    
    // 保存更新后的数据
    saveFishes();
    
    return userFishes.length;
}

// ========== 装饰物品数据迁移 ==========
function migrateDecorData() {
  const saved = localStorage.getItem('oceanDecors');
  if (!saved) return;
  
  try {
    const decorData = JSON.parse(saved);
    let needsMigration = false;
    
    // 检查是否需要迁移
    decorData.forEach(decor => {
      // 如果是旧的商店装饰物品（没有baseId且id是简单的store_xxx格式）
      if (typeof decor.id === 'string' && decor.id.startsWith('store_') && 
          !decor.id.includes('_') && !decor.baseId) {
        needsMigration = true;
      }
    });
    
    if (needsMigration) {
      console.log('开始迁移装饰物品数据...');
      const migratedData = [];
      const instanceCounters = {};
      
      decorData.forEach(decor => {
        const migratedDecor = {...decor};
        
        // 如果是旧的商店装饰物品
        if (typeof migratedDecor.id === 'string' && migratedDecor.id.startsWith('store_') && 
            !migratedDecor.id.includes('_') && !migratedDecor.baseId) {
          const baseId = migratedDecor.id.replace('store_', '');
          
          if (!instanceCounters[baseId]) instanceCounters[baseId] = 0;
          const instanceIndex = instanceCounters[baseId]++;
          
          // 创建新的实例ID和baseId
          migratedDecor.id = `store_${baseId}_${instanceIndex}`;
          migratedDecor.baseId = baseId;
          if (migratedDecor.visible === undefined) migratedDecor.visible = true;
        }
        
        migratedData.push(migratedDecor);
      });
      
      // 保存迁移后的数据
      localStorage.setItem('oceanDecors', JSON.stringify(migratedData));
      console.log('装饰物品数据迁移完成');
    }
  } catch (e) {
    console.error('迁移装饰物品数据失败：', e);
  }
}

// 在初始化时调用迁移函数（在loadDecors之前）
migrateDecorData();

document.addEventListener('DOMContentLoaded', function() {
    addBubbleStyles(); // 加载气泡样式（必执行）
    initFeedButton(); // 初始化喂食按钮（必执行）
    console.log('气泡系统初始化完成！'); // 调试用，可删除
});

// 重新绑定喂食按钮（覆盖之前的绑定，确保点击有效）
window.onload = function() {
    // 1. 找到喂食按钮（id必须是feedBtn，和你HTML里的一致）
    const feedBtn = document.getElementById('feedBtn');
    
    // 2. 找不到按钮就弹提示（避免白忙活）
    if (!feedBtn) {
        alert('找不到喂食按钮！请确保按钮id是 "feedBtn"（大小写一致）');
        return;
    }
    
    // 3. 给按钮绑定点击事件（核心：点击后执行的逻辑）
    feedBtn.onclick = function() {
        // 这里是你之前的核心逻辑（消耗鱼食+显示气泡）
        if (fishiFoodCount <= 0) { // 注意：如果你的鱼食变量名是fishFoodCount，就改成这个
            alert('鱼食不够啦！');
            return;
        }
        
        // 随机选一条鱼（用你定义的鱼数组，比如feedFishes或fishes）
        const fishArray = window.feedFishes || window.fishes; // 兼容两种数组名
        if (fishArray.length === 0) {
            alert('没有小鱼可以喂哦！');
            return;
        }
        const randomFish = fishArray[Math.floor(Math.random() * fishArray.length)];
        
        // 显示气泡（调用你之前的气泡函数，比如showFeedBubble或createFeedBubble）
        if (window.showFeedBubble) {
            showFeedBubble(randomFish.name);
        } else if (window.createFeedBubble) {
            createFeedBubble(randomFish);
        }
        
        // 消耗鱼食
        foodCount--; // 变量名和上面一致（比如fishFoodCount--）
        
        // 更新鱼食显示（如果页面有这个元素）
        const foodEl = document.getElementById('foodCount') || document.getElementById('fishFoodCount');
        if (foodEl) foodEl.textContent = foodCount;
    };
    
    console.log('按钮绑定成功！现在点击喂食会显示气泡啦～');
};

if (!window.feedButtonInited) { // 防止初始化多次
    window.feedButtonInited = true;
    window.onload = function() {
        initFeedButton();
        console.log('喂食功能初始化完成（仅一次）');
    };
}