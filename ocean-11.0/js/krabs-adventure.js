// ========== 蟹老板冒险场景逻辑 ==========

let currentKrabsDialogueIndex = 0;
let krabsUserFishData = null;
let krabsDialogueSequence = [];
let krabsDialogueActive = false;
let krabsAdventureInitialized = false;

// 初始化蟹老板冒险场景
function initKrabsAdventure() {
    if (krabsAdventureInitialized) return;
    krabsAdventureInitialized = true;
    
    console.log('初始化蟹老板冒险场景...');
    
    // 安全检查：必须拥有蟹老板且未完成冒险
    const hasKrabs = ownedItems && ownedItems.includes('krabs');
    const hasCompletedAdventure = localStorage.getItem('krabsAdventureCompleted') === 'true';
    
    console.log('检查条件:', { hasKrabs, hasCompletedAdventure, ownedItems });
    
    if (!hasKrabs) {
        alert('错误：未拥有蟹老板');
        goTo('sea');
        return;
    }
    
    if (hasCompletedAdventure) {
        alert('冒险已经完成过了！');
        goTo('sea');
        return;
    }
    
    // 获取用户最新画的小鱼
    krabsUserFishData = getUserLatestFish();
    
    if (!krabsUserFishData) {
        alert('你还没有画小鱼呢！先去画一条小鱼吧！');
        goTo('draw');
        return;
    }
    
    console.log('用户小鱼数据:', krabsUserFishData);
    
    // 设置对话序列
    krabsDialogueSequence = [
        {
            speaker: 'krabs',
            message: '坐在收银台后攥着金币，算盘噼里啪啦响，嘿！年轻人！我看你是块做生意的料，要不要和我合作做大蟹黄堡生意？利润我七你三，很公道！',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '为什么我只有三成？我能帮忙干活还能招揽客人，能不能多给我分点？',
            delay: 2000
        },
        {
            speaker: 'krabs',
            message: '摸着下巴假装为难，哎呀，房租水电食材都要钱，成本很高！不过看你有诚意，就给你加一成，四成，不能再多了！',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '四成也可以，不过我得先尝尝蟹黄堡味道，不好吃生意也难做。',
            delay: 2000
        },
        {
            speaker: 'krabs',
            message: '犹豫片刻掏出蟹黄堡，喏，免费试吃！这可是招牌，要是觉得好吃，赶紧签合同别耽误我赚钱！',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '咬了一口点头，味道确实不错，我答应合作！',
            delay: 2000
        },
        {
            speaker: 'krabs',
            message: '眼睛瞬间发亮，拍你肩膀，好小子！从今天起你就是金牌合伙人！好好干，只要能赚钱，我们就是最好的伙伴！',
            delay: 2000
        }
    ];
    
    // 设置用户小鱼在场景中
    setupKrabsUserFishInScene();
    
    // 绑定按钮事件 - 确保只绑定一次
    bindKrabsAdventureEvents();
    
    // 重置状态
    currentKrabsDialogueIndex = 0;
    krabsDialogueActive = true;
    
    // 显示对话容器
    const dialogueContainer = document.querySelector('.krabs-dialogue-container');
    if (dialogueContainer) {
        dialogueContainer.classList.remove('hidden');
    }
    
    // 清除任何可能存在的旧对话
    const existingDialogueBoxes = document.querySelectorAll('.dialogue-box');
    existingDialogueBoxes.forEach(box => {
        box.classList.add('hidden');
    });
    
    // 立即开始对话
    showNextKrabsDialogue();
}

// 绑定蟹老板冒险场景事件
function bindKrabsAdventureEvents() {
    console.log('绑定蟹老板冒险场景事件...');
    
    // 移除可能存在的旧事件监听器
    const nextBtn = document.getElementById('nextKrabsDialogue');
    const skipBtn = document.getElementById('skipKrabsAdventure');
    const seaBtn = document.getElementById('goToSeaFromKrabsAdventure');
    
    // 克隆元素并替换以清除旧的事件监听器
    const replaceElement = (element) => {
        if (!element) return;
        const newElement = element.cloneNode(true);
        element.parentNode.replaceChild(newElement, element);
        return newElement;
    };
    
    // 替换元素
    const newNextBtn = replaceElement(nextBtn);
    const newSkipBtn = replaceElement(skipBtn);
    const newSeaBtn = replaceElement(seaBtn);
    
    // 绑定新事件
    if (newNextBtn) {
        newNextBtn.addEventListener('click', showNextKrabsDialogue);
    }
    
    if (newSkipBtn) {
        newSkipBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            skipKrabsAdventure();
        });
    }
    
    if (newSeaBtn) {
        newSeaBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            completeKrabsAdventure();
            goTo('sea');
        });
    }
}

// 设置用户小鱼在蟹老板场景中
function setupKrabsUserFishInScene() {
    const userFishContainer = document.querySelector('.krabs-character-user-fish');
    const krabsContainer = document.querySelector('.krabs-character-krabs');
    
    if (!userFishContainer || !krabsContainer || !krabsUserFishData) {
        console.error('蟹老板场景角色容器或数据缺失');
        return;
    }
    
    // 清空容器
    userFishContainer.innerHTML = '';
    krabsContainer.innerHTML = '';
    
    // 创建蟹老板图片和名字
    const krabsImg = document.createElement('img');
    krabsImg.src = 'assets/krabs.png';
    krabsImg.alt = '蟹老板';
    krabsImg.className = 'adventure-character';
    krabsImg.style.objectFit = 'contain';
    
    const krabsName = document.createElement('div');
    krabsName.className = 'character-name';
    krabsName.textContent = '蟹老板';
    
    krabsContainer.appendChild(krabsImg);
    krabsContainer.appendChild(krabsName);
    
    // 创建用户小鱼图片和名字
    const userFishImg = document.createElement('img');
    // 确保图片URL有效
    if (krabsUserFishData.imgSrc && krabsUserFishData.imgSrc.startsWith('data:')) {
        userFishImg.src = krabsUserFishData.imgSrc;
    } else {
        userFishImg.src = krabsUserFishData.imgSrc || 'assets/fish.png';
    }
    userFishImg.alt = krabsUserFishData.name;
    userFishImg.className = 'adventure-character';
    userFishImg.style.objectFit = 'contain';
    
    const userFishName = document.createElement('div');
    userFishName.className = 'character-name';
    userFishName.textContent = krabsUserFishData.name;
    
    userFishContainer.appendChild(userFishImg);
    userFishContainer.appendChild(userFishName);
    
    console.log('蟹老板场景角色已添加到场景');
}

// 显示蟹老板下一个对话 - 只保留最新两条对话，带有微信式滑动效果
function showNextKrabsDialogue() {
    console.log('显示蟹老板下一个对话，当前索引:', currentKrabsDialogueIndex);
    
    if (!krabsDialogueActive) return;
    
    if (currentKrabsDialogueIndex >= krabsDialogueSequence.length) {
        console.log('蟹老板对话已结束，进入海洋');
        completeKrabsDialogue();
        return;
    }
    
    const dialogue = krabsDialogueSequence[currentKrabsDialogueIndex];
    console.log('当前蟹老板对话:', dialogue);
    
    // 获取对话历史
    const dialogueHistory = krabsDialogueSequence.slice(0, currentKrabsDialogueIndex + 1);
    
    // 只保留最新的两条对话
    const recentDialogues = dialogueHistory.slice(-2);
    console.log('蟹老板最近两条对话:', recentDialogues);
    
    // 获取对话容器
    const dialogueContainer = document.querySelector('.krabs-dialogue-container');
    if (!dialogueContainer) {
        console.error('蟹老板对话容器缺失');
        return;
    }
    
    // 优雅地移除旧对话
    const existingDialogues = dialogueContainer.querySelectorAll('.dialogue-box');
    const removePromises = [];
    
    existingDialogues.forEach((dialogue, index) => {
        const promise = new Promise((resolve) => {
            // 添加淡出效果
            dialogue.classList.add('fade-out');
            
            // 设置不同延迟，让旧对话依次淡出
            setTimeout(() => {
                if (dialogue.parentNode === dialogueContainer) {
                    dialogueContainer.removeChild(dialogue);
                }
                resolve();
            }, 150 + (index * 50)); // 依次淡出
        });
        removePromises.push(promise);
    });
    
    // 等所有旧对话都移除后，添加新对话
    Promise.all(removePromises).then(() => {
        // 清空容器
        dialogueContainer.innerHTML = '';
        
        // 创建并显示最近的两条对话
        recentDialogues.forEach((dialogueItem, index) => {
            const isKrabs = dialogueItem.speaker === 'krabs';
            const dialogueBox = document.createElement('div');
            dialogueBox.className = isKrabs ? 'dialogue-box spongebob-dialogue krabs-dialogue-left' : 'dialogue-box userfish-dialogue krabs-dialogue-right';
            
            // 设置说话者名字
            const speakerElement = document.createElement('div');
            speakerElement.className = 'speaker';
            speakerElement.textContent = isKrabs ? '蟹老板' : (krabsUserFishData ? krabsUserFishData.name : '你的小鱼');
            
            // 设置消息内容
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.textContent = dialogueItem.message;
            
            // 如果是用户小鱼对话，内容右对齐
            if (!isKrabs) {
                speakerElement.style.textAlign = 'left';
                messageElement.style.textAlign = 'left';
            }
            
            dialogueBox.appendChild(speakerElement);
            dialogueBox.appendChild(messageElement);
            
            // 设置初始状态（在下方，准备向上滑动）
            dialogueBox.style.opacity = '0';
            dialogueBox.style.transform = 'translateY(25px) scale(0.97)';
            dialogueBox.style.transition = 'opacity 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            
            dialogueContainer.appendChild(dialogueBox);
            
            // 使用requestAnimationFrame确保流畅动画
            requestAnimationFrame(() => {
                // 添加轻微延迟，实现依次出现的效果
                setTimeout(() => {
                    dialogueBox.style.opacity = '1';
                    dialogueBox.style.transform = 'translateY(0) scale(1)';
                }, index * 120); // 第二条对话稍晚出现
            });
        });
    });
    
    currentKrabsDialogueIndex++;
    
    // 如果是最后一个对话，隐藏所有按钮
    if (currentKrabsDialogueIndex >= krabsDialogueSequence.length) {
        console.log('蟹老板对话结束，准备进入海洋');
        const nextBtn = document.getElementById('nextKrabsDialogue');
        const skipBtn = document.getElementById('skipKrabsAdventure');
        const seaBtn = document.getElementById('goToSeaFromKrabsAdventure');
        
        if (nextBtn) nextBtn.classList.add('hidden');
        if (skipBtn) skipBtn.classList.add('hidden');
        if (seaBtn) seaBtn.classList.add('hidden');
        
        // 等待3秒后自动跳转
        setTimeout(() => {
            completeKrabsDialogue();
        }, 3000);
    }
}

// 完成蟹老板对话
function completeKrabsDialogue() {
    if (!krabsDialogueActive) return;
    krabsDialogueActive = false;
    
    console.log('完成蟹老板对话序列');
    
    const krabsDialogue = document.querySelector('.krabs-dialogue-left');
    const userfishDialogue = document.querySelector('.krabs-dialogue-right');
    
    if (krabsDialogue) krabsDialogue.classList.add('hidden');
    if (userfishDialogue) userfishDialogue.classList.add('hidden');
    
    // 隐藏所有按钮
    const nextBtn = document.getElementById('nextKrabsDialogue');
    const skipBtn = document.getElementById('skipKrabsAdventure');
    const seaBtn = document.getElementById('goToSeaFromKrabsAdventure');
    
    if (nextBtn) nextBtn.classList.add('hidden');
    if (skipBtn) skipBtn.classList.add('hidden');
    if (seaBtn) seaBtn.classList.add('hidden');
    
    console.log('蟹老板对话完成，准备进入海洋');
    
    // 延迟后自动进入海洋
    setTimeout(() => {
        completeKrabsAdventure();
        goTo('sea');
    }, 1000);
}

// 跳过蟹老板冒险
function skipKrabsAdventure() {
    console.log('跳过蟹老板冒险');
    if (confirm('确定要跳过蟹老板的冒险吗？')) {
        completeKrabsAdventure();
        goTo('sea');
    }
}

// 完成蟹老板冒险
function completeKrabsAdventure() {
    console.log('完成蟹老板冒险');
    
    // 标记冒险已完成
    localStorage.setItem('krabsAdventureCompleted', 'true');
    
    // 确保蟹老板在海洋中可见
    if (fishes && Array.isArray(fishes)) {
        const krabsFish = fishes.find(fish => fish && fish.id === 'store_krabs');
        if (krabsFish) {
            krabsFish.hidden = false;
            // 更新蟹老板的故事，使其包含特殊对话
            krabsFish.story = '钱！钱！钱！我最爱钱！从今天起你就是金牌合伙人！好好干！';
            if (typeof saveFishes === 'function') {
                saveFishes();
            }
        }
    }
    
    // 奖励一些贝壳
    if (typeof addShells === 'function') {
        addShells(20);
    }
    
    console.log('蟹老板冒险完成，获得奖励');
}

// 当页面加载时检查是否需要初始化蟹老板冒险场景
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded - 蟹老板冒险场景');
    
    // 监听场景切换
    const originalGoTo = window.goTo;
    if (originalGoTo) {
        window.goTo = function(name) {
            console.log('切换到场景:', name);
            originalGoTo(name);
            
            // 如果是蟹老板冒险场景，延迟初始化
            if (name === 'krabsAdventure') {
                setTimeout(() => {
                    initKrabsAdventure();
                }, 100);
            } else {
                // 重置初始化标志
                krabsAdventureInitialized = false;
            }
        };
    }
    
    // 检查当前是否在蟹老板冒险场景
    const adventureScreen = document.getElementById('krabsAdventure');
    if (adventureScreen && !adventureScreen.classList.contains('hidden')) {
        console.log('当前在蟹老板冒险场景，初始化...');
        setTimeout(() => {
            initKrabsAdventure();
        }, 500);
    }
});

// 添加全局访问
window.initKrabsAdventure = initKrabsAdventure;
window.goToKrabsAdventure = function() {
    goTo('krabsAdventure');
};