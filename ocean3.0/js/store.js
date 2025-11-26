// ========== 商店系统 ==========
let ownedItems = [];

// 加载已拥有的物品
function loadOwnedItems() {
    const saved = localStorage.getItem('ownedItems');
    if (saved) {
        try {
            ownedItems = JSON.parse(saved);
        } catch (e) {
            console.error('加载已拥有物品失败：', e);
            ownedItems = [];
        }
    }
    updateStoreDisplay();
    // 加载已购买的角色和物品到海洋
    loadPurchasedItems();
}

// 保存已拥有的物品
function saveOwnedItems() {
    localStorage.setItem('ownedItems', JSON.stringify(ownedItems));
}

// 加载已购买的角色和物品到海洋
function loadPurchasedItems() {
    const characterItems = ['spongebob', 'patrick'];
    const decorItems = ['seaweed', 'reef'];
    
    // 加载角色
    characterItems.forEach(itemId => {
        if (isItemOwned(itemId)) {
            addPurchasedCharacterToOcean(itemId);
        }
    });
    
    // 加载装饰物品
    decorItems.forEach(itemId => {
        if (isItemOwned(itemId)) {
            addPurchasedDecorToOcean(itemId);
        }
    });
}

// 添加购买的角色到海洋
function addPurchasedCharacterToOcean(itemId) {
    // 检查是否已经存在该角色
    const existingFish = fishes.find(fish => fish.id === `store_${itemId}`);
    if (existingFish) return;
    
    const characterData = getCharacterData(itemId);
    if (!characterData) return;
    
    const fish = new Fish({
        id: `store_${itemId}`,
        imgSrc: characterData.imgSrc,
        img: characterData.imgSrc,
        story: characterData.story,
        name: characterData.name,
        size: characterData.size,
        x: 150 + Math.random() * (ocean.width - 300),
        y: 150 + Math.random() * (ocean.height - 300),
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

// 添加购买的装饰物品到海洋
function addPurchasedDecorToOcean(itemId) {
    // 检查是否已经存在该物品
    const existingDecor = decors.find(decor => decor.id === `store_${itemId}`);
    if (existingDecor) return;
    
    const decorData = getDecorData(itemId);
    if (!decorData) return;
    
    const decor = new Decor({
        id: `store_${itemId}`,
        imgSrc: decorData.imgSrc,
        name: decorData.name,
        story: decorData.story,
        size: decorData.size,
        x: 100 + Math.random() * (ocean.width - 200),
        y: 100 + Math.random() * (ocean.height - 200)
    });
    
    decors.push(decor);
    saveDecors();
}

// 获取角色数据
function getCharacterData(itemId) {
    const characters = {
        'spongebob': {
            imgSrc: 'assets/spongebob.png',
            name: '海绵宝宝',
            story: '快乐的海绵宝宝，永远乐观！',
            size: 100
        },
        'patrick': {
            imgSrc: 'assets/patrick.png',
            name: '派大星',
            story: '海绵宝宝的好朋友，有点呆萌',
            size: 110
        }
    };
    return characters[itemId];
}

// 获取装饰物品数据
function getDecorData(itemId) {
    const decors = {
        'seaweed': {
            imgSrc: 'assets/seaweed.png',
            name: '海草',
            story: '随波摇曳的绿色海草',
            size: 80
        },
        'reef': {
            imgSrc: 'assets/reef.png',
            name: '礁石',
            story: '色彩斑斓的珊瑚礁',
            size: 120
        }
    };
    return decors[itemId];
}

// 更新商店显示
function updateStoreDisplay() {
    // 更新贝壳数量显示
    const shellCountStore = document.getElementById('shellCountStore');
    if (shellCountStore) {
        shellCountStore.textContent = shellCount;
    }
    
    // 更新购买按钮状态
    document.querySelectorAll('.store-item').forEach(item => {
        const itemId = item.dataset.id;
        const price = parseInt(item.dataset.price);
        const buyBtn = item.querySelector('.buy-btn');
        
        if (isItemOwned(itemId)) {
            buyBtn.textContent = '已拥有';
            buyBtn.disabled = true;
            buyBtn.classList.add('owned');
        } else if (shellCount < price) {
            buyBtn.disabled = true;
            buyBtn.textContent = '贝壳不足';
        } else {
            buyBtn.disabled = false;
            buyBtn.textContent = '购买';
            buyBtn.classList.remove('owned');
        }
    });
}

// 检查是否已拥有物品
function isItemOwned(itemId) {
    return ownedItems.includes(itemId);
}

// 购买物品
function buyItem(itemId, price) {
    if (shellCount < price) {
        alert('贝壳不足！');
        return false;
    }
    
    if (isItemOwned(itemId)) {
        alert('您已经拥有这个物品了！');
        return false;
    }
    
    // 扣除贝壳
    addShells(-price);
    
    // 添加到已拥有物品
    ownedItems.push(itemId);
    saveOwnedItems();
    
    // 根据物品类型添加到海洋
    const characterItems = ['spongebob', 'patrick'];
    const decorItems = ['seaweed', 'reef'];
    
    if (characterItems.includes(itemId)) {
        addPurchasedCharacterToOcean(itemId);
    } else if (decorItems.includes(itemId)) {
        addPurchasedDecorToOcean(itemId);
    }
    
    // 显示购买成功动画
    showPurchaseAnimation(itemId);
    
    // 更新商店显示
    updateStoreDisplay();
    
    alert(`购买成功！获得了 ${getItemName(itemId)}`);
    return true;
}

// 显示购买成功动画
function showPurchaseAnimation(itemId) {
    const itemElement = document.querySelector(`[data-id="${itemId}"]`);
    if (itemElement) {
        itemElement.style.animation = 'purchasePulse 0.6s ease';
        setTimeout(() => {
            itemElement.style.animation = '';
        }, 600);
    }
}

// 获取物品名称
function getItemName(itemId) {
    const names = {
        'spongebob': '海绵宝宝',
        'patrick': '派大星',
        'seaweed': '海草',
        'reef': '礁石'
    };
    return names[itemId] || '未知物品';
}

// 商店界面初始化
function initStore() {
    // 分类切换
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // 更新按钮状态
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 显示对应分类
            document.querySelectorAll('.items-category').forEach(cat => cat.classList.remove('active'));
            document.querySelector(`.items-category.${category}`).classList.add('active');
        });
    });
    
    // 购买按钮事件
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const storeItem = this.closest('.store-item');
            const itemId = storeItem.dataset.id;
            const price = parseInt(storeItem.dataset.price);
            
            buyItem(itemId, price);
        });
    });
    
    // 返回按钮
    document.getElementById('backFromStore').addEventListener('click', () => {
        goTo('draw');
    });
}

// 在draw.js中添加商店按钮事件
document.addEventListener('DOMContentLoaded', function() {
    const goToStoreBtn = document.getElementById('goToStore');
    if (goToStoreBtn) {
        goToStoreBtn.addEventListener('click', () => {
            goTo('store');
        });
    }
});

// 初始化商店
loadOwnedItems();
initStore();