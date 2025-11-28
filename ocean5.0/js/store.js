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

// 检查物品数量
function getItemCount(itemId) {
    return ownedItems.filter(id => id === itemId).length;
}

// 加载已购买的角色和物品到海洋
function loadPurchasedItems() {
    const characterItems = ['spongebob', 'patrick'];
    const decorItems = ['seaweed', 'reef','coral'];
    
    // 加载角色
    characterItems.forEach(itemId => {
        if (isItemOwned(itemId)) {
            addPurchasedCharacterToOcean(itemId);
        }
    });
    
    // 加载装饰物品 - 根据数量创建对应数量的实例
    decorItems.forEach(itemId => {
        const count = getItemCount(itemId);
        for (let i = 0; i < count; i++) {
            addPurchasedDecorToOcean(itemId, i);
        }
    });
    loadFishFoodCount();
}

// 添加购买的角色到海洋
function addPurchasedCharacterToOcean(itemId) {
    // 检查是否已经存在该角色
    const existingFish = fishes.find(fish => fish.id === `store_${itemId}`);
    if (existingFish) {
        // 如果已存在但被隐藏了，就显示它
        if (existingFish.hidden) {
            existingFish.hidden = false;
            saveFishes();
        }
        return;
    }
    
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
        wander: 0.01 + Math.random() * 0.03,
        hidden: false
    });
    
    fish.vx = Math.cos(fish.angle) * fish.speed;
    fish.vy = Math.sin(fish.angle) * fish.speed;
    
    fishes.push(fish);
    saveFishes();
}

// 添加购买的装饰物品到海洋
function addPurchasedDecorToOcean(itemId, instanceIndex = 0) {
    const decorData = getDecorData(itemId);
    if (!decorData) return;
    
    // 为每个装饰物品实例创建唯一ID
    const decorId = `store_${itemId}_${instanceIndex}`;
    
    // 检查是否已经存在该装饰物品实例
    const existingDecor = decors.find(decor => decor.id === decorId);
    if (existingDecor) return;
    
    const decor = new Decor({
        id: decorId,
        baseId: itemId, // 保存基础ID用于分组
        imgSrc: decorData.imgSrc,
        name: decorData.name,
        story: decorData.story,
        size: decorData.size,
        x: 100 + Math.random() * (ocean.width - 200),
        y: 100 + Math.random() * (ocean.height - 200),
        visible: true // 默认可见
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
            story: '我准备好了！我准备好了！',
            size: 100
        },
        'patrick': {
            imgSrc: 'assets/patrick.png',
            name: '派大星',
            story: '海绵宝宝我们去抓水母吧',
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
            story: '像一颗海草海草',
            size: 80
        },
        'reef': {
            imgSrc: 'assets/reef.png',
            name: '礁石',
            story: '一块沉默的礁石...',
            size: 120
        },
        'coral': {
            imgSrc: 'assets/coral.png', 
            name: '珊瑚',
            story: '美丽的珊瑚丛，海洋中的宝石',
            size: 100
        },

        'fishfood': {
            imgSrc: 'assets/fishfood.png',
            name: '鱼食',
            story: '可以喂小鱼的美味食物',
            size: 30
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
        
        if (itemId === 'fishfood') {
            buyBtn.disabled = false;
            buyBtn.textContent = '购买';
            return;
        }

        // 装饰物品可以重复购买
        const isDecor = ['seaweed', 'reef','coral'].includes(itemId);
        
        if (!isDecor && isItemOwned(itemId)) {
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

// 检查是否已拥有物品（对于角色）
function isItemOwned(itemId) {
    return ownedItems.includes(itemId);
}

// 购买物品
function buyItem(itemId, price) {
    if (shellCount < price) {
        alert('贝壳不足！');
        return false;
    }
    
    const isDecor = ['seaweed', 'reef','coral'].includes(itemId);
    
    // 角色只能购买一次，装饰物品可以重复购买
    if (!isDecor && itemId !== 'fishfood' && isItemOwned(itemId)) {
        alert('您已经拥有这个角色了！');
        return false;
    }
    
    // 扣除贝壳
    addShells(-price);

    // 鱼食逻辑
    if (itemId === 'fishfood') {
        addFishFood(10);
        showPurchaseAnimation(itemId);
        updateStoreDisplay();
        alert(`购买成功！获得了 10 份鱼食`);
        return true;
    }

    // 添加到已拥有物品
    ownedItems.push(itemId);
    saveOwnedItems();
    
    // 根据物品类型添加到海洋
    const characterItems = ['spongebob', 'patrick'];
    const decorItems = ['seaweed', 'reef','coral'];
    
    if (characterItems.includes(itemId)) {
        addPurchasedCharacterToOcean(itemId);
    } else if (decorItems.includes(itemId)) {
        // 对于装饰物品，获取当前数量并添加新实例
        const currentCount = getItemCount(itemId);
        addPurchasedDecorToOcean(itemId, currentCount - 1);
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
        'reef': '礁石',
        'coral': '珊瑚',
        'fishfood': '鱼食' 
    };
    return names[itemId] || '未知物品';
}

// 商店界面初始化
function initStore() {
    updatePurchasedItemsDescription();
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

// 更新已购买商品的描述
function updatePurchasedItemsDescription() {
    // 更新已购买的小鱼描述
    fishes.forEach(fish => {
        if (typeof fish.id === 'string' && fish.id.startsWith('store_')) {
            const itemId = fish.id.replace('store_', '').split('_')[0]; // 获取基础ID
            const characterData = getCharacterData(itemId);
            if (characterData) {
                fish.story = characterData.story;
            }
        }
    });
    
    // 更新已购买的装饰物品描述
    decors.forEach(decor => {
        if (decor.baseId) {
            const decorData = getDecorData(decor.baseId);
            if (decorData) {
                decor.story = decorData.story;
            }
        }
    });
    
    // 保存更新后的数据
    saveFishes();
    saveDecors();
}



// 初始化商店
loadOwnedItems();
initStore();