// ========== 布鲁斯冒险场景逻辑 ==========

let currentBruceDialogueIndex = 0;
let bruceUserFishData = null;
let bruceDialogueSequence = [];
let bruceDialogueActive = false;
let bruceAdventureInitialized = false;

// 初始化布鲁斯冒险场景
function initBruceAdventure() {
    if (bruceAdventureInitialized) return;
    bruceAdventureInitialized = true;
    
    console.log('初始化布鲁斯冒险场景...');
    
    // 安全检查：必须拥有布鲁斯且未完成冒险
    const hasBruce = ownedItems && ownedItems.includes('bruce');
    const hasCompletedAdventure = localStorage.getItem('bruceAdventureCompleted') === 'true';
    
    console.log('检查条件:', { hasBruce, hasCompletedAdventure, ownedItems });
    
    if (!hasBruce) {
        alert('错误：未拥有布鲁斯');
        goTo('sea');
        return;
    }
    
    if (hasCompletedAdventure) {
        alert('冒险已经完成过了！');
        goTo('sea');
        return;
    }
    
    // 获取用户最新画的小鱼
    bruceUserFishData = getUserLatestFish();
    
    if (!bruceUserFishData) {
        alert('你还没有画小鱼呢！先去画一条小鱼吧！');
        goTo('draw');
        return;
    }
    
    console.log('用户小鱼数据:', bruceUserFishData);
    
    // 设置对话序列
    bruceDialogueSequence = [
        {
            speaker: 'bruce',
            message: '小心翼翼从礁石后游出，收起牙齿，尾巴也不敢大幅摆动，嘿兄弟… 今天绝对是交朋友的好日子，我发誓我脑子里只有海藻沙拉，没别的念头！',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '我相信你，要不要尝尝我带的素汉堡？',
            delay: 2000
        },
        {
            speaker: 'bruce',
            message: '眼睛瞬间发亮又强行克制，素的？真的有吗？小心咬了一口，眼睛瞪得更大，嗯…！比海藻好吃一百倍！这是什么魔法美食？',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '这是特制素汉堡，喜欢的话我以后常带给你。',
            delay: 2000
        },
        {
            speaker: 'bruce',
            message: '感动地晃了晃尾巴，我会记住这份信任的！我记忆力超好的！突然挠头，对了，你叫什么名字来着？我记下来免得忘了！',
            delay: 2000
        }
    ];
    
    // 设置用户小鱼在场景中
    setupBruceUserFishInScene();
    
    // 绑定按钮事件 - 确保只绑定一次
    bindBruceAdventureEvents();
    
    // 重置状态
    currentBruceDialogueIndex = 0;
    bruceDialogueActive = true;
    
    // 显示对话容器
    const dialogueContainer = document.querySelector('.bruce-dialogue-container');
    if (dialogueContainer) {
        dialogueContainer.classList.remove('hidden');
    }
    
    // 清除任何可能存在的旧对话
    const existingDialogueBoxes = document.querySelectorAll('.dialogue-box');
    existingDialogueBoxes.forEach(box => {
        box.classList.add('hidden');
    });
    
    // 立即开始对话
    showNextBruceDialogue();
}

// 绑定布鲁斯冒险场景事件
function bindBruceAdventureEvents() {
    console.log('绑定布鲁斯冒险场景事件...');
    
    // 移除可能存在的旧事件监听器
    const nextBtn = document.getElementById('nextBruceDialogue');
    const skipBtn = document.getElementById('skipBruceAdventure');
    const seaBtn = document.getElementById('goToSeaFromBruceAdventure');
    
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
        newNextBtn.addEventListener('click', showNextBruceDialogue);
    }
    
    if (newSkipBtn) {
        newSkipBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            skipBruceAdventure();
        });
    }
    
    if (newSeaBtn) {
        newSeaBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            completeBruceAdventure();
            goTo('sea');
        });
    }
}

// 设置用户小鱼在布鲁斯场景中
function setupBruceUserFishInScene() {
    const userFishContainer = document.querySelector('.bruce-character-user-fish');
    const bruceContainer = document.querySelector('.bruce-character-bruce');
    
    if (!userFishContainer || !bruceContainer || !bruceUserFishData) {
        console.error('布鲁斯场景角色容器或数据缺失');
        return;
    }
    
    // 清空容器
    userFishContainer.innerHTML = '';
    bruceContainer.innerHTML = '';
    
    // 创建布鲁斯图片和名字
    const bruceImg = document.createElement('img');
    bruceImg.src = 'assets/bruce.png';
    bruceImg.alt = '布鲁斯';
    bruceImg.className = 'adventure-character';
    bruceImg.style.objectFit = 'contain';
    
    const bruceName = document.createElement('div');
    bruceName.className = 'character-name';
    bruceName.textContent = '布鲁斯';
    
    bruceContainer.appendChild(bruceImg);
    bruceContainer.appendChild(bruceName);
    
    // 创建用户小鱼图片和名字
    const userFishImg = document.createElement('img');
    // 确保图片URL有效
    if (bruceUserFishData.imgSrc && bruceUserFishData.imgSrc.startsWith('data:')) {
        userFishImg.src = bruceUserFishData.imgSrc;
    } else {
        userFishImg.src = bruceUserFishData.imgSrc || 'assets/fish.png';
    }
    userFishImg.alt = bruceUserFishData.name;
    userFishImg.className = 'adventure-character';
    userFishImg.style.objectFit = 'contain';
    
    const userFishName = document.createElement('div');
    userFishName.className = 'character-name';
    userFishName.textContent = bruceUserFishData.name;
    
    userFishContainer.appendChild(userFishImg);
    userFishContainer.appendChild(userFishName);
    
    console.log('布鲁斯场景角色已添加到场景');
}

// 显示布鲁斯下一个对话 - 只保留最新两条对话，带有微信式滑动效果
function showNextBruceDialogue() {
    console.log('显示布鲁斯下一个对话，当前索引:', currentBruceDialogueIndex);
    
    if (!bruceDialogueActive) return;
    
    if (currentBruceDialogueIndex >= bruceDialogueSequence.length) {
        console.log('布鲁斯对话已结束，进入海洋');
        completeBruceDialogue();
        return;
    }
    
    const dialogue = bruceDialogueSequence[currentBruceDialogueIndex];
    console.log('当前布鲁斯对话:', dialogue);
    
    // 获取对话历史
    const dialogueHistory = bruceDialogueSequence.slice(0, currentBruceDialogueIndex + 1);
    
    // 只保留最新的两条对话
    const recentDialogues = dialogueHistory.slice(-2);
    console.log('布鲁斯最近两条对话:', recentDialogues);
    
    // 获取对话容器
    const dialogueContainer = document.querySelector('.bruce-dialogue-container');
    if (!dialogueContainer) {
        console.error('布鲁斯对话容器缺失');
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
            const isBruce = dialogueItem.speaker === 'bruce';
            const dialogueBox = document.createElement('div');
            dialogueBox.className = isBruce ? 'dialogue-box spongebob-dialogue bruce-dialogue-left' : 'dialogue-box userfish-dialogue bruce-dialogue-right';
            
            // 设置说话者名字
            const speakerElement = document.createElement('div');
            speakerElement.className = 'speaker';
            speakerElement.textContent = isBruce ? '布鲁斯' : (bruceUserFishData ? bruceUserFishData.name : '你的小鱼');
            
            // 设置消息内容
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.textContent = dialogueItem.message;
            
            // 如果是用户小鱼对话，内容右对齐
            if (!isBruce) {
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
    
    currentBruceDialogueIndex++;
    
    // 如果是最后一个对话，隐藏所有按钮
    if (currentBruceDialogueIndex >= bruceDialogueSequence.length) {
        console.log('布鲁斯对话结束，准备进入海洋');
        const nextBtn = document.getElementById('nextBruceDialogue');
        const skipBtn = document.getElementById('skipBruceAdventure');
        const seaBtn = document.getElementById('goToSeaFromBruceAdventure');
        
        if (nextBtn) nextBtn.classList.add('hidden');
        if (skipBtn) skipBtn.classList.add('hidden');
        if (seaBtn) seaBtn.classList.add('hidden');
        
        // 等待3秒后自动跳转
        setTimeout(() => {
            completeBruceDialogue();
        }, 3000);
    }
}

// 完成布鲁斯对话
function completeBruceDialogue() {
    if (!bruceDialogueActive) return;
    bruceDialogueActive = false;
    
    console.log('完成布鲁斯对话序列');
    
    const bruceDialogue = document.querySelector('.bruce-dialogue-left');
    const userfishDialogue = document.querySelector('.bruce-dialogue-right');
    
    if (bruceDialogue) bruceDialogue.classList.add('hidden');
    if (userfishDialogue) userfishDialogue.classList.add('hidden');
    
    // 隐藏所有按钮
    const nextBtn = document.getElementById('nextBruceDialogue');
    const skipBtn = document.getElementById('skipBruceAdventure');
    const seaBtn = document.getElementById('goToSeaFromBruceAdventure');
    
    if (nextBtn) nextBtn.classList.add('hidden');
    if (skipBtn) skipBtn.classList.add('hidden');
    if (seaBtn) seaBtn.classList.add('hidden');
    
    console.log('布鲁斯对话完成，准备进入海洋');
    
    // 延迟后自动进入海洋
    setTimeout(() => {
        completeBruceAdventure();
        goTo('sea');
    }, 1000);
}

// 跳过布鲁斯冒险
function skipBruceAdventure() {
    console.log('跳过布鲁斯冒险');
    if (confirm('确定要跳过布鲁斯的冒险吗？')) {
        completeBruceAdventure();
        goTo('sea');
    }
}

// 完成布鲁斯冒险
function completeBruceAdventure() {
    console.log('完成布鲁斯冒险');
    
    // 标记冒险已完成
    localStorage.setItem('bruceAdventureCompleted', 'true');
    
    // 确保布鲁斯在海洋中可见
    if (fishes && Array.isArray(fishes)) {
        const bruceFish = fishes.find(fish => fish && fish.id === 'store_bruce');
        if (bruceFish) {
            bruceFish.hidden = false;
            // 更新布鲁斯的故事，使其包含特殊对话
            bruceFish.story = '嘿兄弟！我发誓我脑子里只有素汉堡和海藻沙拉，绝对是交朋友的好日子！…对了，你叫什么名字来着？';
            if (typeof saveFishes === 'function') {
                saveFishes();
            }
        }
    }
    
    // 奖励一些贝壳
    if (typeof addShells === 'function') {
        addShells(20);
    }
    
    console.log('布鲁斯冒险完成，获得奖励');
}

// 当页面加载时检查是否需要初始化布鲁斯冒险场景
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded - 布鲁斯冒险场景');
    
    // 监听场景切换
    const originalGoTo = window.goTo;
    if (originalGoTo) {
        window.goTo = function(name) {
            console.log('切换到场景:', name);
            originalGoTo(name);
            
            // 如果是布鲁斯冒险场景，延迟初始化
            if (name === 'bruceAdventure') {
                setTimeout(() => {
                    initBruceAdventure();
                }, 100);
            } else {
                // 重置初始化标志
                bruceAdventureInitialized = false;
            }
        };
    }
    
    // 检查当前是否在布鲁斯冒险场景
    const adventureScreen = document.getElementById('bruceAdventure');
    if (adventureScreen && !adventureScreen.classList.contains('hidden')) {
        console.log('当前在布鲁斯冒险场景，初始化...');
        setTimeout(() => {
            initBruceAdventure();
        }, 500);
    }
});

// 添加全局访问
window.initBruceAdventure = initBruceAdventure;
window.goToBruceAdventure = function() {
    goTo('bruceAdventure');
};
