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

// 路由封装 - 增加动画效果
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

// 首页按钮绑定
document.getElementById('btnStart').addEventListener('click', () => goTo('draw'));

// 首页直接进入海洋按钮
document.getElementById('goToSeaFromHome').addEventListener('click', () => goTo('sea'));

// 添加从海洋返回画板的按钮功能
document.addEventListener('DOMContentLoaded', function() {
  const backButton = document.getElementById('back');
  if (backButton) {
    backButton.addEventListener('click', () => goTo('draw'));
  }
});

 document.getElementById('toStoreBtnSea').addEventListener('click', function() {
    goTo('store'); // 跳转同一个商店界面
    updateShellDisplay(); // 同步显示当前贝壳数量
  });


 // 清除数据按钮
  document.getElementById('clearDataBtn').addEventListener('click', function() {
    if (confirm('确定要清除所有游戏数据吗？包括贝壳、鱼食、小鱼和已购买物品？')) {
      localStorage.clear();
      shellCount = 0;
      fishFoodCount = 0;
      ownedItems = [];
      saveShellCount();
      saveFishFoodCount();
      saveOwnedItems();
      updateShellDisplay();
      updateFishFoodDisplay();
      updateFeedBtnStatus();
      alert('数据清除成功！页面将刷新');
      location.reload();
    }
     // 初始化喂食按钮状态
  updateFeedBtnStatus();
  }); 

  // 在 common.js 中添加画板商店按钮事件
document.addEventListener('DOMContentLoaded', function() {
  const toStoreBtnDraw = document.getElementById('toStoreBtnDraw');
  if (toStoreBtnDraw) {
    toStoreBtnDraw.addEventListener('click', function() {
      goTo('store');
      updateShellDisplay();
    });
  }
});
