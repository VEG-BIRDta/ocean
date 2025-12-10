// ========== 商店系统 ==========
let ownedItems = [];

// ========== 购买顺序配置 ==========
const purchaseOrder = {
    // 海绵宝宝系列（第一组）
    'spongebob': {
        name: '海绵宝宝',
        prerequisite: null,
        unlocked: true,
        group: 'spongebob'
    },
    'patrick': {
        name: '派大星',
        prerequisite: 'spongebob',
        unlocked: false,
        group: 'spongebob'
    },
    'squidward': {
        name: '章鱼哥',
        prerequisite: ['spongebob', 'patrick'],
        unlocked: false,
        group: 'spongebob'
    },
    'krabs': {
        name: '蟹老板',
        prerequisite: ['spongebob', 'patrick', 'squidward'],
        unlocked: false,
        group: 'spongebob'
    },
    
    // 小鲤鱼历险记系列（第二组 - 独立解锁顺序）
    'paopao': {
        name: '泡泡',
        prerequisite: null,
        unlocked: true,
        group: 'fishAdventure'
    },
    'meimei': {
        name: '小美美',
        prerequisite: 'paopao',
        unlocked: false,
        group: 'fishAdventure'
    },
    'shuangmiangui': {
        name: '双面龟',
        prerequisite: ['paopao', 'meimei'],
        unlocked: false,
        group: 'fishAdventure'
    },
    'aku': {
        name: '阿酷',
        prerequisite: ['paopao', 'meimei', 'shuangmiangui'],
        unlocked: false,
        group: 'fishAdventure'
    },
    
    // 海底总动员系列（第三组 - 独立解锁顺序）
    'nemo': {
        name: '尼莫',
        prerequisite: null,
        unlocked: true,
        group: 'findingNemo'
    },
    'dory': {
        name: '多莉',
        prerequisite: 'nemo',
        unlocked: false,
        group: 'findingNemo'
    },
    'marlin': {
        name: '马林',
        prerequisite: ['nemo', 'dory'],
        unlocked: false,
        group: 'findingNemo'
    },
    'bruce': {
        name: '布鲁斯',
        prerequisite: ['nemo', 'dory', 'marlin'],
        unlocked: false,
        group: 'findingNemo'
    }
};

// ========== 加载已拥有的物品 ==========
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

// ========== 保存已拥有的物品 ==========
function saveOwnedItems() {
    localStorage.setItem('ownedItems', JSON.stringify(ownedItems));
}

// ========== 检查物品数量 ==========
function getItemCount(itemId) {
    return ownedItems.filter(id => id === itemId).length;
}

// ========== 检查购买解锁状态 ==========
function updatePurchaseUnlockStatus() {
    // 重置所有角色的解锁状态
    Object.keys(purchaseOrder).forEach(itemId => {
        purchaseOrder[itemId].unlocked = false;
    });
    
    // 每组第一个角色默认解锁
    purchaseOrder['spongebob'].unlocked = true;
    purchaseOrder['paopao'].unlocked = true;
    purchaseOrder['nemo'].unlocked = true;
    
    // 检查海绵宝宝系列解锁条件
    if (isItemOwned('spongebob')) {
        purchaseOrder['patrick'].unlocked = true;
        
        if (isItemOwned('patrick')) {
            purchaseOrder['squidward'].unlocked = true;
            
            if (isItemOwned('squidward')) {
                purchaseOrder['krabs'].unlocked = true;
            }
        }
    }
    
    // 检查小鲤鱼系列解锁条件
    if (isItemOwned('paopao')) {
        purchaseOrder['meimei'].unlocked = true;
        
        if (isItemOwned('meimei')) {
            purchaseOrder['shuangmiangui'].unlocked = true;
            
            if (isItemOwned('shuangmiangui')) {
                purchaseOrder['aku'].unlocked = true;
            }
        }
    }
    
    // 检查海底总动员系列解锁条件
    if (isItemOwned('nemo')) {
        purchaseOrder['dory'].unlocked = true;
        
        if (isItemOwned('dory')) {
            purchaseOrder['marlin'].unlocked = true;
            
            if (isItemOwned('marlin')) {
                purchaseOrder['bruce'].unlocked = true;
            }
        }
    }
    
    console.log('购买解锁状态更新:', purchaseOrder);
}

// ========== 检查购买资格 ==========
function canPurchaseItem(itemId) {
    // 非角色商品（装饰物品、鱼食）不受限制
    if (!purchaseOrder[itemId]) {
        return true;
    }
    
    const item = purchaseOrder[itemId];
    
    // 检查是否已解锁
    if (!item.unlocked) {
        return false;
    }
    
    // 检查前置条件
    if (item.prerequisite) {
        if (Array.isArray(item.prerequisite)) {
            // 多个前置条件
            return item.prerequisite.every(prereqId => isItemOwned(prereqId));
        } else {
            // 单个前置条件
            return isItemOwned(item.prerequisite);
        }
    }
    
    return true;
}

// ========== 获取解锁提示信息 ==========
function getUnlockHint(itemId) {
    if (!purchaseOrder[itemId]) {
        return '';
    }
    
    const item = purchaseOrder[itemId];
    
    if (item.unlocked && isItemOwned(itemId)) {
        return '已拥有';
    }
    
    if (!item.unlocked) {
        if (item.prerequisite) {
            if (Array.isArray(item.prerequisite)) {
                const prereqNames = item.prerequisite.map(id => purchaseOrder[id]?.name || getItemName(id));
                return `需先购买：${prereqNames.join('、')}`;
            } else {
                const prereqName = purchaseOrder[item.prerequisite]?.name || getItemName(item.prerequisite);
                return `需先购买：${prereqName}`;
            }
        }
    }
    
    return '';
}

// ========== 加载已购买的角色和物品到海洋 ==========
function loadPurchasedItems() {
    const characterItems = [
        'spongebob', 'patrick', 'squidward', 'krabs',
        'paopao', 'meimei', 'shuangmiangui', 'aku',
        'nemo', 'dory', 'marlin', 'bruce'
    ];
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

// ========== 添加购买的角色到海洋 ==========
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

// ========== 添加购买的装饰物品到海洋 ==========
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

// ========== 获取角色数据 ==========
function getCharacterData(itemId) {
    const characters = {
        // 海绵宝宝系列
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
        },
        'squidward': {
            imgSrc: 'assets/squidward.png',
            name: '章鱼哥',
            story: '艺术是我的生命！让我安静地吹我的单簧管...',
            size: 120
        },
        'krabs': {
            imgSrc: 'assets/krabs.png',
            name: '蟹老板',
            story: '钱！钱！钱！我最爱钱！',
            size: 105
        },
        
        // 小鲤鱼历险记系列
        'paopao': {
            imgSrc: 'assets/paopao.png',
            name: '泡泡',
            story: '我就是火热的泡泡！',
            size: 95
        },
        'meimei': {
            imgSrc: 'assets/meimei.png',
            name: '小美美',
            story: '歌声是最美的语言',
            size: 90
        },
        'shuangmiangui': {
            imgSrc: 'assets/shuangmiangui.png',
            name: '双面龟',
            story: '我有两张脸，但我很真诚',
            size: 105
        },
        'aku': {
            imgSrc: 'assets/aku.png',
            name: '阿酷',
            story: '冷静思考，智慧取胜',
            size: 100
        },
        
        // 海底总动员系列
        'nemo': {
            imgSrc: 'assets/nemo.png',
            name: '尼莫',
            story: '我只是一条小鱼，但我很勇敢！',
            size: 85
        },
        'dory': {
            imgSrc: 'assets/dory.png',
            name: '多莉',
            story: '我是多莉，我会找到我的家人！',
            size: 95
        },
        'marlin': {
            imgSrc: 'assets/marlin.png',
            name: '马林',
            story: '我会保护我的儿子，不惜一切代价！',
            size: 100
        },
        'bruce': {
            imgSrc: 'assets/bruce.png',
            name: '布鲁斯',
            story: '我们是朋友，不是食物！',
            size: 130
        }
    };
    return characters[itemId];
}

// ========== 获取装饰物品数据 ==========
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

// ========== 更新商店显示 ==========
function updateStoreDisplay() {
    // 更新贝壳数量显示
    const shellCountStore = document.getElementById('shellCountStore');
    if (shellCountStore) {
        shellCountStore.textContent = shellCount;
    }
    
    // 更新购买解锁状态
    updatePurchaseUnlockStatus();
    
    // 更新购买进度
    updatePurchaseProgress();
    
    // 更新购买按钮状态
    document.querySelectorAll('.store-item').forEach(item => {
        const itemId = item.dataset.id;
        const price = parseInt(item.dataset.price);
        const buyBtn = item.querySelector('.buy-btn');
        const itemInfo = item.querySelector('.item-info');
        
        if (itemId === 'fishfood') {
            buyBtn.disabled = false;
            buyBtn.textContent = '购买';
            return;
        }

        // 装饰物品可以重复购买
        const isDecor = ['seaweed', 'reef','coral'].includes(itemId);
        
        // 检查是否已拥有
        if (!isDecor && isItemOwned(itemId)) {
            buyBtn.textContent = '已拥有';
            buyBtn.disabled = true;
            buyBtn.classList.add('owned');
        } 
        // 检查贝壳是否足够
        else if (shellCount < price) {
            buyBtn.disabled = true;
            buyBtn.textContent = '贝壳不足';
            buyBtn.classList.remove('owned');
        } 
        // 检查购买资格
        else if (!canPurchaseItem(itemId)) {
            buyBtn.disabled = true;
            const hint = getUnlockHint(itemId);
            buyBtn.textContent = hint || '无法购买';
            buyBtn.classList.remove('owned');
            
            // 添加提示信息
            let hintElement = itemInfo.querySelector('.unlock-hint');
            if (!hintElement) {
                hintElement = document.createElement('div');
                hintElement.className = 'unlock-hint';
                hintElement.style.color = '#e74c3c';
                hintElement.style.fontSize = '12px';
                hintElement.style.marginTop = '5px';
                hintElement.style.fontWeight = 'bold';
                itemInfo.appendChild(hintElement);
            }
            hintElement.textContent = hint;
        } 
        // 可以购买
        else {
            buyBtn.disabled = false;
            buyBtn.textContent = '购买';
            buyBtn.classList.remove('owned');
            
            // 移除提示信息
            const hintElement = itemInfo.querySelector('.unlock-hint');
            if (hintElement) {
                hintElement.remove();
            }
        }
    });
}

// ========== 检查是否已拥有物品（对于角色） ==========
function isItemOwned(itemId) {
    return ownedItems.includes(itemId);
}

// ========== 购买物品 ==========
function buyItem(itemId, price) {
    if (shellCount < price) {
        alert('贝壳不足！');
        return false;
    }
    
    const isDecor = ['seaweed', 'reef','coral'].includes(itemId);
    const isBackground = ['haimianbaobao', 'xiaoliyu', 'haidizongdongyuan'].includes(itemId); // 新增
    
    // 角色，背景只能购买一次，装饰物品可以重复购买
    if ((!isDecor && !isBackground) && itemId !== 'fishfood' && isItemOwned(itemId)) {
        alert('您已经拥有这个物品了！');
        return false;
    }
    
    // 检查购买资格（只针对角色）
    if (!isDecor && !isBackground && itemId !== 'fishfood' && purchaseOrder[itemId] && !canPurchaseItem(itemId)) {
        const hint = getUnlockHint(itemId);
        alert(`无法购买！${hint}`);
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
     // 背景购买逻辑 - 新增
    if (isBackground) {
        // 添加到已拥有物品
        ownedItems.push(itemId);
        saveOwnedItems();
        
        // 显示购买成功动画
        showPurchaseAnimation(itemId);
        
        // 更新商店显示
        updateStoreDisplay();
        
        alert(`购买成功！获得了新背景：${getItemName(itemId)}，快去背景选择中更换吧！`);
        
        // 刷新背景选择器，让新购买的背景可用
        if (typeof highlightSelectedBackground === 'function') {
            highlightSelectedBackground();
        }
        
        return true;
    }

    // 添加到已拥有物品
    ownedItems.push(itemId);
    saveOwnedItems();
    

    // 添加获取物品名称的辅助函数
function getItemName(itemId) {
    const names = {
        'haimianbaobao': '海绵宝宝背景',
        'xiaoliyu': '小鲤鱼背景',
        'haidizongdongyuan': '海底总动员背景',
        // 可以添加其他物品的名称映射
    };
    return names[itemId] || itemId;
}


    // 更新购买解锁状态
    updatePurchaseUnlockStatus();
    
    // 根据物品类型添加到海洋
    const characterItems = Object.keys(purchaseOrder);
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
    
    // ========== 特殊购买提示 ==========
   if (itemId === 'spongebob') {
    setTimeout(() => {
        alert('购买成功！现在去画一条属于你自己的小鱼，然后就可以和海绵宝宝一起冒险了！');
        goTo('draw');
    }, 300);
    return true;
} else if (itemId === 'patrick') {
    setTimeout(() => {
        alert('购买成功！现在去画一条属于你自己的小鱼，然后就可以和派大星一起冒险了！');
        goTo('draw');
    }, 300);
    return true;
} else if (itemId === 'squidward') {
    setTimeout(() => {
        alert('购买成功！现在去画一条属于你自己的小鱼，然后就可以和章鱼哥一起冒险了！');
        goTo('draw');
    }, 300);
    return true;
} else if (itemId === 'krabs') {
    setTimeout(() => {
        alert('购买成功！现在去画一条属于你自己的小鱼，然后就可以和蟹老板一起冒险了！');
        goTo('draw');
    }, 300);
    return true;
} else if (itemId === 'paopao') {
    setTimeout(() => {
        alert('购买成功！泡泡加入海洋！现在去画一条属于你自己的小鱼，然后就可以和泡泡一起冒险了！');
        goTo('draw');
    }, 300);
    return true;
} else if (itemId === 'meimei') {
    setTimeout(() => {
        alert('购买成功！小美美加入海洋！美妙的歌声响起！现在去画一条属于你自己的小鱼，然后就可以和小美美一起冒险了！');
        goTo('draw');
    }, 300);
    return true;
} else if (itemId === 'shuangmiangui') {
    setTimeout(() => {
        alert('购买成功！双面龟加入海洋！真诚的朋友最可贵！现在去画一条属于你自己的小鱼，然后就可以和双面龟一起冒险了！');
        goTo('draw');
    }, 300);
    return true;
} else if (itemId === 'aku') {
    setTimeout(() => {
        alert('购买成功！阿酷加入海洋！智慧的力量！小鲤鱼系列集齐！现在去画一条属于你自己的小鱼，然后就可以和阿酷一起冒险了！');
        goTo('draw');
    }, 300);
    return true;
} else if (itemId === 'nemo') {
    setTimeout(() => {
        alert('购买成功！尼莫加入海洋！现在去画一条属于你自己的小鱼，然后就可以和尼莫一起冒险了！');
        goTo('draw');
    }, 300);
    return true;
} else if (itemId === 'dory') {
    setTimeout(() => {
        alert('购买成功！多莉加入海洋！记忆可能短暂，但友谊永恒！现在去画一条属于你自己的小鱼，然后就可以和多莉一起冒险了！');
        goTo('draw');
    }, 300);
    return true;
} else if (itemId === 'marlin') {
    setTimeout(() => {
        alert('购买成功！马林加入海洋！父爱如海深！现在去画一条属于你自己的小鱼，然后就可以和马林一起冒险了！');
        goTo('draw');
    }, 300);
    return true;
} else if (itemId === 'bruce') {
    setTimeout(() => {
        alert('购买成功！布鲁斯加入海洋！鲨鱼也可以是朋友！海底总动员系列集齐！现在去画一条属于你自己的小鱼，然后就可以和布鲁斯一起冒险了！');
        goTo('draw');
    }, 300);
    return true;
} else {
    alert(`购买成功！获得了 ${getItemName(itemId)}`);
}

return true;
}

// ========== 显示购买成功动画 ==========
function showPurchaseAnimation(itemId) {
    const itemElement = document.querySelector(`[data-id="${itemId}"]`);
    if (itemElement) {
        itemElement.style.animation = 'purchasePulse 0.6s ease';
        setTimeout(() => {
            itemElement.style.animation = '';
        }, 600);
    }
}

// ========== 获取物品名称 ==========
function getItemName(itemId) {
    const names = {
        // 海绵宝宝系列
        'spongebob': '海绵宝宝',
        'patrick': '派大星',
        'squidward': '章鱼哥',
        'krabs': '蟹老板',
        
        // 小鲤鱼历险记系列
        'paopao': '泡泡',
        'meimei': '小美美',
        'shuangmiangui': '双面龟',
        'aku': '阿酷',
        
        // 海底总动员系列
        'nemo': '尼莫',
        'dory': '多莉',
        'marlin': '马林',
        'bruce': '布鲁斯',
        
        // 装饰物品
        'seaweed': '海草',
        'reef': '礁石',
        'coral': '珊瑚',
        'fishfood': '鱼食'
    };
    return names[itemId] || '未知物品';
}

// ========== 更新购买进度 ==========
function updatePurchaseProgress() {
    // 统计各系列已拥有数量
    const seriesCounts = {
        spongebob: 0,
        fishAdventure: 0,
        findingNemo: 0
    };
    
    // 统计每个系列的拥有情况
    Object.keys(purchaseOrder).forEach(itemId => {
        const item = purchaseOrder[itemId];
        if (isItemOwned(itemId)) {
            if (item.group === 'spongebob') {
                seriesCounts.spongebob++;
            } else if (item.group === 'fishAdventure') {
                seriesCounts.fishAdventure++;
            } else if (item.group === 'findingNemo') {
                seriesCounts.findingNemo++;
            }
        }
    });
    
    // 更新海绵宝宝系列进度
    const spongebobCountElement = document.getElementById('spongebobCount');
    const spongebobProgressElement = document.getElementById('spongebobProgress');
    if (spongebobCountElement) {
        spongebobCountElement.textContent = seriesCounts.spongebob;
    }
    if (spongebobProgressElement) {
        const percentage = (seriesCounts.spongebob / 4) * 100;
        spongebobProgressElement.style.width = `${percentage}%`;
        // 根据完成度改变颜色深度
        spongebobProgressElement.style.opacity = seriesCounts.spongebob === 4 ? '1' : '0.9';
    }
    
    // 更新小鲤鱼历险记系列进度
    const fishAdventureCountElement = document.getElementById('fishAdventureCount');
    const fishAdventureProgressElement = document.getElementById('fishAdventureProgress');
    if (fishAdventureCountElement) {
        fishAdventureCountElement.textContent = seriesCounts.fishAdventure;
    }
    if (fishAdventureProgressElement) {
        const percentage = (seriesCounts.fishAdventure / 4) * 100;
        fishAdventureProgressElement.style.width = `${percentage}%`;
        fishAdventureProgressElement.style.opacity = seriesCounts.fishAdventure === 4 ? '1' : '0.9';
    }
    
    // 更新海底总动员系列进度
    const findingNemoCountElement = document.getElementById('findingNemoCount');
    const findingNemoProgressElement = document.getElementById('findingNemoProgress');
    if (findingNemoCountElement) {
        findingNemoCountElement.textContent = seriesCounts.findingNemo;
    }
    if (findingNemoProgressElement) {
        const percentage = (seriesCounts.findingNemo / 4) * 100;
        findingNemoProgressElement.style.width = `${percentage}%`;
        findingNemoProgressElement.style.opacity = seriesCounts.findingNemo === 4 ? '1' : '0.9';
    }
    
    // 检查是否有系列集齐
    checkSeriesCompletion();
}

// ========== 检查系列是否集齐 ==========
function checkSeriesCompletion() {
    const seriesNames = {
        spongebob: '海绵宝宝系列',
        fishAdventure: '小鲤鱼历险记系列',
        findingNemo: '海底总动员系列'
    };
    
    Object.keys(purchaseOrder).forEach(itemId => {
        const item = purchaseOrder[itemId];
        const group = item.group;
        
        // 统计该系列的拥有数量
        const seriesItems = Object.keys(purchaseOrder).filter(id => 
            purchaseOrder[id].group === group
        );
        const ownedCount = seriesItems.filter(id => isItemOwned(id)).length;
        const totalCount = seriesItems.length;
        
        // 如果集齐了该系列
        if (ownedCount === totalCount && !item.groupCompleted) {
            // 标记为已集齐
            purchaseOrder[item.group + '_completed'] = true;
            
            // 显示集齐提示
            setTimeout(() => {
                showSeriesCompletionToast(seriesNames[group]);
            }, 500);
        }
    });
}

// ========== 显示系列集齐提示 ==========
function showSeriesCompletionToast(seriesName) {
    const toast = document.createElement('div');
    toast.className = 'series-completion-toast';
    toast.innerHTML = `
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">🎉 恭喜！</div>
        <div>你已集齐 ${seriesName}！</div>
    `;
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = 'linear-gradient(135deg, #8e44ad, #9b59b6)';
    toast.style.color = 'white';
    toast.style.padding = '15px 25px';
    toast.style.borderRadius = '20px';
    toast.style.zIndex = '10000';
    toast.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
    toast.style.animation = 'fadeInUp 0.5s ease-out, fadeOut 0.5s ease-out 2.5s forwards';
    toast.style.textAlign = 'center';
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}
// ========== 商店界面初始化 ==========
function initStore() {
    updatePurchaseUnlockStatus(); // 初始化时更新解锁状态
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
            
            // 更新显示（确保提示信息正确）
            updateStoreDisplay();
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

// ========== 在draw.js中添加商店按钮事件 ==========
document.addEventListener('DOMContentLoaded', function() {
    const goToStoreBtn = document.getElementById('goToStore');
    if (goToStoreBtn) {
        goToStoreBtn.addEventListener('click', () => {
            goTo('store');
        });
    }
});

// ========== 更新已购买商品的描述 ==========
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

// ========== 初始化商店 ==========
loadOwnedItems();
initStore();