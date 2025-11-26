// ========== 贝壳系统逻辑（核心部分） ==========
let shellCount = 0;

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
  const shellElements = document.querySelectorAll('#shellCountDraw, #shellCountSea');
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