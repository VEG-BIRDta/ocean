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
        }, 50);
      }
    }, 300);
  });
}

// 首页按钮绑定
document.getElementById('btnStart').addEventListener('click', () => goTo('draw'));