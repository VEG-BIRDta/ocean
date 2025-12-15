// ========== 贝壳系统逻辑（核心部分） ==========
let shellCount = 0;
let fishFoodCount = 0;

// 加载贝壳数量
function loadShellCount() {
  const saved = localStorage.getItem('shellCount');
  if (saved) {
    shellCount = parseInt(saved) || 0;
  }
  updateShellDisplay();
}

// 保存贝壳数量
function saveShellCount() {
  localStorage.setItem('shellCount', shellCount.toString());
}

// 更新贝壳显示
function updateShellDisplay() {
  const shellElements = document.querySelectorAll('#shellCountDraw, #shellCountSea, #shellCountStore');
  shellElements.forEach(element => {
    if (element) element.textContent = shellCount;
  });
}

function showShellCollectionAnimation(amount, x, y) {
  // 创建动画元素
  const animationEl = document.createElement('div');
  animationEl.className = 'shell-collect-animation';
  
  // 设置内容包含贝壳图标和数量
  animationEl.innerHTML = `<span class="shell-icon"></span>+${amount}`;
  
  // 设置位置（默认中心，可通过参数指定位置）
  const posX = x || window.innerWidth / 2;
  const posY = y || window.innerHeight / 2;
  
  animationEl.style.left = `${posX}px`;
  animationEl.style.top = `${posY}px`;
  
  // 添加到页面
  document.body.appendChild(animationEl);
  
  // 动画结束后移除元素
  setTimeout(() => {
    animationEl.remove();
  }, 1200);
}

// 添加贝壳
// 修改common.js中的addShells函数
function addShells(amount) {
    shellCount += amount;
    // 确保贝壳数量不会变成负数
    if (shellCount < 0) shellCount = 0;
    saveShellCount();
    
    // 强制更新所有可能的贝壳显示元素
    document.querySelectorAll('[id^="shellCount"]').forEach(element => {
        if (element) element.textContent = shellCount;
    });
    
    // 触发自定义事件，方便其他模块监听贝壳数量变化
    const event = new CustomEvent('shellsUpdated', { detail: { count: shellCount } });
    document.dispatchEvent(event);
}
// 初始化贝壳系统
loadShellCount();

// 加载鱼食数量
function loadFishFoodCount() {
  const saved = localStorage.getItem('fishFoodCount');
  if (saved) {
    fishFoodCount = parseInt(saved) || 0;
  }
  updateFishFoodDisplay();
}

// 保存鱼食数量
function saveFishFoodCount() {
  localStorage.setItem('fishFoodCount', fishFoodCount.toString());
}

// 更新鱼食显示
function updateFishFoodDisplay() {
  const fishFoodElement = document.getElementById('fishFoodCount');
  if (fishFoodElement) {
    fishFoodElement.textContent = fishFoodCount;
  }
}

// 添加鱼食
function addFishFood(amount) {
  fishFoodCount += amount;
  if (fishFoodCount < 0) fishFoodCount = 0;
  saveFishFoodCount();
  updateFishFoodDisplay();
}

loadFishFoodCount();

// ========== 路由封装 - 增加动画效果 ==========
// 修改common.js中的goTo函数
function goTo(name) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(s => {
    s.style.opacity = '0';
    s.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      s.classList.add('hidden');
      if (s.id === name) {
        s.classList.remove('hidden');
        setTimeout(() => {
          s.style.opacity = '1';
          s.style.transform = 'translateY(0)';
          // 强制更新贝壳显示
          document.querySelectorAll('[id^="shellCount"]').forEach(element => {
              if (element) element.textContent = shellCount;
          });
        }, 50);
      }
    }, 300);
  });
}
// 添加商店返回按钮
document.addEventListener('DOMContentLoaded', function() {
  // 商店购买按钮事件
    const buyButtons = document.querySelectorAll('.buy-btn');
    buyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const itemElement = this.closest('.store-item');
            const itemId = itemElement.getAttribute('data-id');
            const price = parseInt(itemElement.getAttribute('data-price'));
            
            buyItem(itemId, price);
        });
    });

  // 商店分类切换
  const categoryBtns = document.querySelectorAll('.category-btn');
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // 移除所有按钮的active类
      categoryBtns.forEach(b => b.classList.remove('active'));
      // 给当前点击的按钮添加active类
      btn.classList.add('active');
      
      // 隐藏所有分类
      const categories = document.querySelectorAll('.items-category');
      categories.forEach(cat => cat.classList.remove('active'));
      
      // 显示对应的分类
      const category = btn.getAttribute('data-category');
      const activeCategory = document.querySelector(`.items-category.${category}`);
      if (activeCategory) {
        activeCategory.classList.add('active');
      }
    });
  });

  // 商店返回海洋按钮
  const backToSeaButton = document.getElementById('backToSeaFromStore');
  if (backToSeaButton) {
    backToSeaButton.addEventListener('click', () => {
      goTo('sea');
    });
  }
  
  // 商店返回绘画按钮
  const backFromStoreButton = document.getElementById('backFromStore');
  if (backFromStoreButton) {
    backFromStoreButton.addEventListener('click', () => {
      goTo('draw');
    });
  }
});

// ========== 商店按钮绑定 ==========
document.getElementById('toStoreBtnSea').addEventListener('click', function() {
    goTo('store');
    // 强制更新贝壳显示
    updateShellDisplay();
    // 同时更新商店的贝壳显示
    if (document.getElementById('shellCountStore')) {
        document.getElementById('shellCountStore').textContent = shellCount;
    }
});

// ========== 背景选择功能 ==========
let currentBackground = 'sea'; // 默认背景

// 加载保存的背景
function loadBackground() {
  const saved = localStorage.getItem('oceanBackground');
  if (saved) {
    currentBackground = saved;
    applyBackground(currentBackground);
  } else {
    // 如果没有保存的背景，使用默认背景
    applyBackground('sea');
  }
}

// 应用背景
function applyBackground(bgName) {
  const oceanElement = document.getElementById('ocean');
  if (oceanElement) {
    // 对于默认背景使用原有图片，其他背景使用新图片
    if (bgName === 'sea') {
      oceanElement.style.backgroundImage = 'url(assets/sea.png)';
    } else {
      oceanElement.style.backgroundImage = `url(assets/${bgName}.png)`;
    }
  }
}

// 保存背景选择
function saveBackground(bgName) {
  currentBackground = bgName;
  localStorage.setItem('oceanBackground', bgName);
  applyBackground(bgName);
}

// 在common.js中添加（可放在initBackgroundSelector函数之前）
function getBackgroundName(bgName) {
    const bgNames = {
        'sea': '背景一',
        'seaone': '背景二',
        'seatwo': '背景三',
        'seathree': '背景四',
        'haimianbaobao': '海绵宝宝背景',
        'xiaoliyu': '小鲤鱼背景',
        'haidizongdongyuan': '海底总动员背景'
    };
    return bgNames[bgName] || bgName; // 默认为背景ID，避免显示"未知物品"
}

// 初始化背景选择功能
function initBackgroundSelector() {
    // 加载保存的背景
    loadBackground();
    
    // 背景选择按钮事件
    const changeBgBtn = document.getElementById('changeBgBtn');
    if (changeBgBtn) {
        changeBgBtn.addEventListener('click', () => {
            goTo('backgroundSelector');
            // 高亮当前选中的背景并过滤未购买的背景
            updateAvailableBackgrounds();
        });
    }
  

    // 新增函数：更新可用背景（只显示已购买的）
function updateAvailableBackgrounds() {
    const bgItems = document.querySelectorAll('.background-item');
    bgItems.forEach(item => {
        const bgName = item.getAttribute('data-bg');
        // 默认背景始终可用，其他背景需要已购买
        const isAvailable = bgName === 'sea' || bgName === 'seaone' || bgName === 'seatwo' || bgName === 'seathree' || isItemOwned(bgName);
        
        if (isAvailable) {
            item.style.display = 'block';
            // 高亮当前选中的背景
            if (bgName === currentBackground) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        } else {
            item.style.display = 'none';
        }
    });
    
    // 添加已购买的新背景到选择列表
    addPurchasedBackgroundsToSelector();
}

// 修改common.js中的addPurchasedBackgroundsToSelector函数
function addPurchasedBackgroundsToSelector() {
    const backgroundContainer = document.querySelector('.background-options');
    if (!backgroundContainer) return; // 防止容器不存在的错误
    
    const purchasedBackgrounds = ['haimianbaobao', 'xiaoliyu', 'haidizongdongyuan'].filter(bg => isItemOwned(bg));
    
    purchasedBackgrounds.forEach(bgName => {
        // 检查是否已添加，避免重复
        if (!document.querySelector(`.background-item[data-bg="${bgName}"]`)) {
            const bgItem = document.createElement('div');
            bgItem.className = 'background-item';
            bgItem.setAttribute('data-bg', bgName);
            
            // 使用getBackgroundName获取正确名称
            const bgDisplayName = getBackgroundName(bgName);
            
            bgItem.innerHTML = `
                <img src="assets/${bgName}.png" alt="${bgDisplayName}">
                <span>${bgDisplayName}</span>
            `;
            
            // 添加点击事件
            bgItem.addEventListener('click', () => {
                saveBackground(bgName);
                highlightSelectedBackground();
                showBackgroundSelectedToast(bgName);
            });
            
            backgroundContainer.appendChild(bgItem);
        }
    });
}


  // 返回海洋按钮事件
  const backToSeaFromBg = document.getElementById('backToSeaFromBg');
  if (backToSeaFromBg) {
    backToSeaFromBg.addEventListener('click', () => {
      goTo('sea');
    });
  }
  
  // 背景选项点击事件
  const bgItems = document.querySelectorAll('.background-item');
  bgItems.forEach(item => {
    item.addEventListener('click', () => {
      const bgName = item.getAttribute('data-bg');
      saveBackground(bgName);
      highlightSelectedBackground();
      // 显示选择成功提示
      showBackgroundSelectedToast(bgName);
    });
  });
}

// 高亮选中的背景
// 优化highlightSelectedBackground函数，确保名称正确
function highlightSelectedBackground() {
    const bgItems = document.querySelectorAll('.background-item');
    bgItems.forEach(item => {
        const bgName = item.getAttribute('data-bg');
        // 刷新显示名称（防止静态添加的背景名称错误）
        const bgDisplayName = getBackgroundName(bgName);
        const nameElement = item.querySelector('span');
        if (nameElement) {
            nameElement.textContent = bgDisplayName;
        }
        
        // 高亮当前选中项
        if (bgName === currentBackground) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

// 显示背景选择成功提示
// 修改common.js中的showBackgroundSelectedToast函数
function showBackgroundSelectedToast(bgName) {
    // 使用getBackgroundName获取正确名称
    const bgLabel = getBackgroundName(bgName);
    
    const toast = document.createElement('div');
    toast.className = 'bg-toast';
    toast.textContent = `已选择${bgLabel}`;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = 'rgba(0,0,0,0.7)';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '20px';
    toast.style.zIndex = '1000';
    toast.style.animation = 'fadein 0.5s, fadeout 0.5s 2.5s';
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// 在页面加载完成后初始化背景选择功能
document.addEventListener('DOMContentLoaded', function() {
  initBackgroundSelector();
});

// ========== 首页按钮绑定 ==========
document.getElementById('btnStart').addEventListener('click', () => goTo('draw'));

// 首页直接进入海洋按钮
document.getElementById('goToSeaFromHome').addEventListener('click', () => goTo('sea'));

// ========== 添加从海洋返回画板的按钮功能 ==========
document.addEventListener('DOMContentLoaded', function() {
  const backButton = document.getElementById('back');
  if (backButton) {
    backButton.addEventListener('click', () => goTo('draw'));
  }
});

// ========== 商店按钮绑定 ==========
document.getElementById('toStoreBtnSea').addEventListener('click', function() {
  goTo('store');
  updateShellDisplay();
});

// ========== 安全检查 ==========
function ensureFunctionsLoaded() {
  const requiredFunctions = [
    'saveFishes', 'saveDecors', 'updateStoreDisplay',
    'updatePurchaseUnlockStatus', 'refreshFishList'
  ];
  
  let missingFunctions = [];
  requiredFunctions.forEach(funcName => {
    if (typeof window[funcName] !== 'function') {
      missingFunctions.push(funcName);
    }
  });
  
  if (missingFunctions.length > 0) {
    console.warn('以下函数未加载:', missingFunctions);
    return false;
  }
  
  return true;
}

// ========== 清除用户绘制的小鱼（需在ocean.js中定义） ==========
function clearUserDrawnFishes() {
  if (!fishes || !Array.isArray(fishes)) return 0;
  
  const userFishes = fishes.filter(fish => {
    if (!fish || !fish.id) return false;
    
    // 判断是否为用户绘制的小鱼
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
  if (typeof saveFishes === 'function') {
    saveFishes();
  }
  
  return userFishes.length;
}

// ========== 清除所有游戏数据 ==========

// 核心：用变量标记是否已绑定，避免重复
let isClearBtnBound = false;

function clearAllGameData() {
  // 仅弹出一次确认框
  if (!confirm('确定要清除所有数据吗？')) return;

  try {
    localStorage.clear();
    alert('数据已清除，页面将刷新！');
    location.reload(true);
  } catch (e) {
    alert('清除失败：' + e.message);
  }
}

// 页面加载后绑定按钮（加防重复逻辑）
window.addEventListener('load', function() {
  const clearBtn = document.getElementById('clearDataBtn');
  if (!clearBtn) {
    alert('未找到清除按钮（ID: clearDataBtn）');
    return;
  }

  // 关键：只绑定一次，避免重复
  if (!isClearBtnBound) {
    // 先移除所有原有点击事件，再绑定新的
    clearBtn.onclick = null;
    clearBtn.addEventListener('click', clearAllGameData);
    isClearBtnBound = true; // 标记为已绑定
    console.log('清除按钮绑定成功（仅绑定一次）');
  }
});

// ========== 清除数据按钮事件监听 ==========
document.addEventListener('DOMContentLoaded', function() {
  const clearDataBtn = document.getElementById('clearDataBtn');
  if (clearDataBtn) {
    // 移除旧的事件监听器（如果有的话）
    clearDataBtn.replaceWith(clearDataBtn.cloneNode(true));
    
    // 重新获取按钮
    const newClearDataBtn = document.getElementById('clearDataBtn');
    
    // 绑定新的事件监听器
    newClearDataBtn.addEventListener('click', clearAllGameData);
  }
  // 页面加载完成后强制更新贝壳显示
    setTimeout(() => {
        document.querySelectorAll('[id^="shellCount"]').forEach(element => {
            if (element) element.textContent = shellCount;
        });
    }, 100);
});

// ========== 画板商店按钮事件 ==========
document.addEventListener('DOMContentLoaded', function() {
  const toStoreBtnDraw = document.getElementById('toStoreBtnDraw');
  if (toStoreBtnDraw) {
    toStoreBtnDraw.addEventListener('click', function() {
      goTo('store');
      updateShellDisplay();
    });
  }
});

// ========== 新增：海绵宝宝特殊场景跳转函数（只被store.js调用） ==========
function goToSpongebobAdventure() {
  goTo('spongebobAdventure');
}

// ========== 新增：派大星特殊场景跳转函数（只被draw.js调用） ==========
function goToPatrickAdventure() {
  goTo('patrickAdventure');
}

// ========== 新增：章鱼哥特殊场景跳转函数（只被draw.js调用） ==========
function goToSquidwardAdventure() {
  goTo('squidwardAdventure');
}

// ========== 新增：蟹老板特殊场景跳转函数（只被draw.js调用） ==========
function goToKrabsAdventure() {
  goTo('krabsAdventure');
}

// ========== 新增：泡泡特殊场景跳转函数（只被draw.js调用） ==========
function goToPaopaoAdventure() {
  goTo('paopaoAdventure');
}

// ========== 新增：小美美特殊场景跳转函数（只被draw.js调用） ==========
function goToMeimeiAdventure() {
  goTo('meimeiAdventure');
}

// ========== 新增：双面龟特殊场景跳转函数（只被draw.js调用） ==========
function goToShuangmianguiAdventure() {
  goTo('shuangmianguiAdventure');
}

// ========== 新增：阿酷特殊场景跳转函数（只被draw.js调用） ==========
function goToAkuAdventure() {
  goTo('akuAdventure');
}

// ========== 新增：尼莫特殊场景跳转函数（只被draw.js调用） ==========
function goToNemoAdventure() {
  goTo('nemoAdventure');
}

// ========== 新增：多莉特殊场景跳转函数（只被draw.js调用） ==========
function goToDoryAdventure() {
  goTo('doryAdventure');
}

// ========== 新增：马林特殊场景跳转函数（只被draw.js调用） ==========
function goToMarlinAdventure() {
  goTo('marlinAdventure');
}

// ========== 新增：布鲁斯特殊场景跳转函数（只被draw.js调用） ==========
function goToBruceAdventure() {
  goTo('bruceAdventure');
}

// ========== 喂食按钮状态更新 ==========
function updateFeedBtnStatus() {
  const feedBtn = document.getElementById('feedBtn');
  if (feedBtn) {
    if (fishFoodCount > 0) {
      feedBtn.disabled = false;
      feedBtn.style.opacity = '1';
    } else {
      feedBtn.disabled = true;
      feedBtn.style.opacity = '0.6';
    }
  }
}
// 初始化喂食按钮状态
updateFeedBtnStatus();

// 在common.js中找到updateFeedBtnStatus函数附近，添加喂食逻辑
function initFeedButton() {
  const feedBtn = document.getElementById('feedBtn');
  if (feedBtn) {
    feedBtn.addEventListener('click', function() {
      if (fishFoodCount <= 0) return;
      
      // 消耗一个鱼食
      addFishFood(-1);
      
      // 获取所有可见的小鱼
      const visibleFishes = fishes.filter(fish => !fish.hidden);
      if (visibleFishes.length === 0) return;
      
      // 随机选择一条小鱼
      const randomFish = visibleFishes[Math.floor(Math.random() * visibleFishes.length)];
      
      // 显示该小鱼的对话气泡
      createBubble(randomFish);
    });
  }
}

// 确保在页面加载时初始化喂食按钮事件
// 可以在现有的初始化函数中添加调用，或者添加到common.js的加载逻辑中
document.addEventListener('DOMContentLoaded', function() {
  initFeedButton();
});

// 在common.js的DOMContentLoaded事件中补充
document.addEventListener('DOMContentLoaded', function() {
    // 已有的代码...
    
    // 页面加载完成后强制更新贝壳显示
    setTimeout(() => {
        document.querySelectorAll('[id^="shellCount"]').forEach(element => {
            if (element) element.textContent = shellCount;
        });
    }, 100);
});