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

// 添加贝壳
function addShells(amount) {
  shellCount += amount;
  saveShellCount();
  updateShellDisplay();
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
          updateShellDisplay(); // 切换界面时更新显示
        }, 50);
      }
    }, 300);
  });
}

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
function clearAllGameData() {
  if (!ensureFunctionsLoaded()) {
    alert('系统尚未完全加载，请稍后再试。');
    return;
  }
  
  if (confirm('确定要清除所有游戏数据吗？包括贝壳、鱼食、小鱼和已购买物品？')) {
    // 清除所有本地存储数据
    localStorage.clear();
    
    // 重置全局变量
    shellCount = 0;
    fishFoodCount = 0;
    ownedItems = [];
    
    // 清除用户绘制的小鱼
    if (typeof clearUserDrawnFishes === 'function') {
      const removedCount = clearUserDrawnFishes();
      console.log(`已清除 ${removedCount} 条用户绘制的小鱼`);
    }
    
    // 清除画板历史
    if (typeof clearDrawingHistory === 'function') {
      clearDrawingHistory();
    }
    
    // 重置装饰物品
    if (typeof decors !== 'undefined' && Array.isArray(decors)) {
      decors.length = 0;
      if (typeof saveDecors === 'function') {
        saveDecors();
      }
    }
    
    // 重置泡泡
    if (typeof bubbles !== 'undefined' && Array.isArray(bubbles)) {
      bubbles.forEach(bubble => {
        if (bubble.element && bubble.element.parentNode) {
          bubble.element.parentNode.removeChild(bubble.element);
        }
      });
      bubbles.length = 0;
    }
    
    // 重置购买解锁状态
    if (typeof purchaseOrder !== 'undefined') {
        Object.keys(purchaseOrder).forEach(itemId => {
            purchaseOrder[itemId].unlocked = false;
        });
        // 每组第一个角色默认解锁
        purchaseOrder['spongebob'].unlocked = true;
        purchaseOrder['paopao'].unlocked = true;
        purchaseOrder['nemo'].unlocked = true;
    }

    // 重置冒险完成状态
    localStorage.removeItem('spongebobAdventureCompleted');
    
    // 保存重置后的数据
    saveShellCount();
    saveFishFoodCount();
    saveOwnedItems();
    
    // 更新所有显示
    updateShellDisplay();
    updateFishFoodDisplay();
    updateFeedBtnStatus();
    
    // 更新商店显示
    if (typeof updateStoreDisplay === 'function') {
      updateStoreDisplay();
    }
    
    // 更新购买解锁状态
    if (typeof updatePurchaseUnlockStatus === 'function') {
      updatePurchaseUnlockStatus();
    }
    
    // 刷新小鱼管理面板
    if (typeof refreshFishList === 'function') {
      setTimeout(() => {
        refreshFishList();
      }, 100);
    }
    
    // 刷新海洋显示
    if (typeof fishes !== 'undefined') {
      setTimeout(() => {
        if (typeof saveFishes === 'function') {
          saveFishes();
        }
      }, 200);
    }
    
    alert('数据清除成功！\n✔ 所有用户绘制的小鱼已删除\n✔ 购买记录已重置\n✔ 贝壳和鱼食已清零\n✔ 画板已清空\n\n页面将刷新');
    
    // 延迟刷新页面，确保所有数据已保存
    setTimeout(() => {
      location.reload();
    }, 500);
  }
}

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