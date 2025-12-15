// ========== 泡泡冒险场景逻辑 ==========

let currentPaopaoDialogueIndex = 0;
let paopaoUserFishData = null;
let paopaoDialogueSequence = [];
let paopaoDialogueActive = false;
let paopaoAdventureInitialized = false;

// 初始化泡泡冒险场景
function initPaopaoAdventure() {
    if (paopaoAdventureInitialized) return;
    paopaoAdventureInitialized = true;
    
    console.log('初始化泡泡冒险场景...');
    
    // 安全检查：必须拥有泡泡且未完成冒险
    const hasPaopao = ownedItems && ownedItems.includes('paopao');
    const hasCompletedAdventure = localStorage.getItem('paopaoAdventureCompleted') === 'true';
    
    console.log('检查条件:', { hasPaopao, hasCompletedAdventure, ownedItems });
    
    if (!hasPaopao) {
        alert('错误：未拥有泡泡');
        goTo('sea');
        return;
    }
    
    if (hasCompletedAdventure) {
        alert('冒险已经完成过了！');
        goTo('sea');
        return;
    }
    
    // 获取用户最新画的小鱼
    paopaoUserFishData = getUserLatestFish();
    
    if (!paopaoUserFishData) {
        alert('你还没有画小鱼呢！先去画一条小鱼吧！');
        goTo('draw');
        return;
    }
    
    console.log('用户小鱼数据:', paopaoUserFishData);
    
    // 设置对话序列
    paopaoDialogueSequence = [
        {
            speaker: 'paopao',
            message: '你就是我的新搭档吗？我能感觉到你身上正义的气息，和我的龙鳞都产生共鸣了！',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '你好，泡泡！能和你一起守护这片水域，我很荣幸！',
            delay: 2000
        },
        {
            speaker: 'paopao',
            message: '嘿嘿，看来我们是一路人！我刚察觉到西北角有暗流波动，说不定藏着隐患，走，我们一起去调查，我还能给你露一手我的巡逻技巧！',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '好啊，正好我也想多学点守护水域的本事，咱们这就出发！',
            delay: 2000
        },
        {
            speaker: 'paopao',
            message: '不管遇到什么情况，只要我们并肩作战，就没有解决不了的麻烦！以后有任何危险，随时喊我，我第一时间赶到！',
            delay: 2000
        }
    ];
    
    // 设置用户小鱼在场景中
    setupPaopaoUserFishInScene();
    
    // 绑定按钮事件 - 确保只绑定一次
    bindPaopaoAdventureEvents();
    
    // 重置状态
    currentPaopaoDialogueIndex = 0;
    paopaoDialogueActive = true;
    
    // 显示对话容器
    const dialogueContainer = document.querySelector('.paopao-dialogue-container');
    if (dialogueContainer) {
        dialogueContainer.classList.remove('hidden');
    }
    
    // 清除任何可能存在的旧对话
    const existingDialogueBoxes = document.querySelectorAll('.dialogue-box');
    existingDialogueBoxes.forEach(box => {
        box.classList.add('hidden');
    });
    
    // 立即开始对话
    showNextPaopaoDialogue();
}

// 绑定泡泡冒险场景事件
function bindPaopaoAdventureEvents() {
    console.log('绑定泡泡冒险场景事件...');
    
    // 移除可能存在的旧事件监听器
    const nextBtn = document.getElementById('nextPaopaoDialogue');
    const skipBtn = document.getElementById('skipPaopaoAdventure');
    const seaBtn = document.getElementById('goToSeaFromPaopaoAdventure');
    
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
        newNextBtn.addEventListener('click', showNextPaopaoDialogue);
    }
    
    if (newSkipBtn) {
        newSkipBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            skipPaopaoAdventure();
        });
    }
    
    if (newSeaBtn) {
        newSeaBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            completePaopaoAdventure();
            goTo('sea');
        });
    }
}

// 设置用户小鱼在泡泡场景中
function setupPaopaoUserFishInScene() {
    const userFishContainer = document.querySelector('.paopao-character-user-fish');
    const paopaoContainer = document.querySelector('.paopao-character-paopao');
    
    if (!userFishContainer || !paopaoContainer || !paopaoUserFishData) {
        console.error('泡泡场景角色容器或数据缺失');
        return;
    }
    
    // 清空容器
    userFishContainer.innerHTML = '';
    paopaoContainer.innerHTML = '';
    
    // 创建泡泡图片和名字
    const paopaoImg = document.createElement('img');
    paopaoImg.src = 'assets/paopao.png';
    paopaoImg.alt = '泡泡';
    paopaoImg.className = 'adventure-character';
    paopaoImg.style.objectFit = 'contain';
    
    const paopaoName = document.createElement('div');
    paopaoName.className = 'character-name';
    paopaoName.textContent = '泡泡';
    
    paopaoContainer.appendChild(paopaoImg);
    paopaoContainer.appendChild(paopaoName);
    
    // 创建用户小鱼图片和名字
    const userFishImg = document.createElement('img');
    // 确保图片URL有效
    if (paopaoUserFishData.imgSrc && paopaoUserFishData.imgSrc.startsWith('data:')) {
        userFishImg.src = paopaoUserFishData.imgSrc;
    } else {
        userFishImg.src = paopaoUserFishData.imgSrc || 'assets/fish.png';
    }
    userFishImg.alt = paopaoUserFishData.name;
    userFishImg.className = 'adventure-character';
    userFishImg.style.objectFit = 'contain';
    
    const userFishName = document.createElement('div');
    userFishName.className = 'character-name';
    userFishName.textContent = paopaoUserFishData.name;
    
    userFishContainer.appendChild(userFishImg);
    userFishContainer.appendChild(userFishName);
    
    console.log('泡泡场景角色已添加到场景');
}

// 显示泡泡下一个对话 - 只保留最新两条对话，带有微信式滑动效果
function showNextPaopaoDialogue() {
    console.log('显示泡泡下一个对话，当前索引:', currentPaopaoDialogueIndex);
    
    if (!paopaoDialogueActive) return;
    
    if (currentPaopaoDialogueIndex >= paopaoDialogueSequence.length) {
        console.log('泡泡对话已结束，进入海洋');
        completePaopaoDialogue();
        return;
    }
    
    const dialogue = paopaoDialogueSequence[currentPaopaoDialogueIndex];
    console.log('当前泡泡对话:', dialogue);
    
    // 获取对话历史
    const dialogueHistory = paopaoDialogueSequence.slice(0, currentPaopaoDialogueIndex + 1);
    
    // 只保留最新的两条对话
    const recentDialogues = dialogueHistory.slice(-2);
    console.log('泡泡最近两条对话:', recentDialogues);
    
    // 获取对话容器
    const dialogueContainer = document.querySelector('.paopao-dialogue-container');
    if (!dialogueContainer) {
        console.error('泡泡对话容器缺失');
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
            const isPaopao = dialogueItem.speaker === 'paopao';
            const dialogueBox = document.createElement('div');
            dialogueBox.className = isPaopao ? 'dialogue-box spongebob-dialogue paopao-dialogue-left' : 'dialogue-box userfish-dialogue paopao-dialogue-right';
            
            // 设置说话者名字
            const speakerElement = document.createElement('div');
            speakerElement.className = 'speaker';
            speakerElement.textContent = isPaopao ? '泡泡' : (paopaoUserFishData ? paopaoUserFishData.name : '你的小鱼');
            
            // 设置消息内容
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.textContent = dialogueItem.message;
            
            // 如果是用户小鱼对话，内容右对齐
            if (!isPaopao) {
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
    
    currentPaopaoDialogueIndex++;
    
    // 如果是最后一个对话，隐藏所有按钮
    if (currentPaopaoDialogueIndex >= paopaoDialogueSequence.length) {
        console.log('泡泡对话结束，准备进入海洋');
        const nextBtn = document.getElementById('nextPaopaoDialogue');
        const skipBtn = document.getElementById('skipPaopaoAdventure');
        const seaBtn = document.getElementById('goToSeaFromPaopaoAdventure');
        
        if (nextBtn) nextBtn.classList.add('hidden');
        if (skipBtn) skipBtn.classList.add('hidden');
        if (seaBtn) seaBtn.classList.add('hidden');
        
        // 等待3秒后自动跳转
        setTimeout(() => {
            completePaopaoDialogue();
        }, 3000);
    }
}

// 完成泡泡对话
function completePaopaoDialogue() {
    if (!paopaoDialogueActive) return;
    paopaoDialogueActive = false;
    
    console.log('完成泡泡对话序列');
    
    const paopaoDialogue = document.querySelector('.paopao-dialogue-left');
    const userfishDialogue = document.querySelector('.paopao-dialogue-right');
    
    if (paopaoDialogue) paopaoDialogue.classList.add('hidden');
    if (userfishDialogue) userfishDialogue.classList.add('hidden');
    
    // 隐藏所有按钮
    const nextBtn = document.getElementById('nextPaopaoDialogue');
    const skipBtn = document.getElementById('skipPaopaoAdventure');
    const seaBtn = document.getElementById('goToSeaFromPaopaoAdventure');
    
    if (nextBtn) nextBtn.classList.add('hidden');
    if (skipBtn) skipBtn.classList.add('hidden');
    if (seaBtn) seaBtn.classList.add('hidden');
    
    console.log('泡泡对话完成，准备进入海洋');
    
    // 延迟后自动进入海洋
    setTimeout(() => {
        completePaopaoAdventure();
        goTo('sea');
    }, 1000);
}

// 跳过泡泡冒险
function skipPaopaoAdventure() {
    console.log('跳过泡泡冒险');
    if (confirm('确定要跳过泡泡的冒险吗？')) {
        completePaopaoAdventure();
        goTo('sea');
    }
}

// 完成泡泡冒险
function completePaopaoAdventure() {
    console.log('完成泡泡冒险');
    
    // 标记冒险已完成
    localStorage.setItem('paopaoAdventureCompleted', 'true');
    
    // 确保泡泡在海洋中可见
    if (fishes && Array.isArray(fishes)) {
        const paopaoFish = fishes.find(fish => fish && fish.id === 'store_paopao');
        if (paopaoFish) {
            paopaoFish.hidden = false;
            // 更新泡泡的故事，使其包含特殊对话
            paopaoFish.story = '我就是火热的泡泡！让我们一起守护这片水域！';
            if (typeof saveFishes === 'function') {
                saveFishes();
            }
        }
    }
    
    // 奖励一些贝壳
    if (typeof addShells === 'function') {
        addShells(20);
    }
    
    console.log('泡泡冒险完成，获得奖励');
}

// 当页面加载时检查是否需要初始化泡泡冒险场景
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded - 泡泡冒险场景');
    
    // 监听场景切换
    const originalGoTo = window.goTo;
    if (originalGoTo) {
        window.goTo = function(name) {
            console.log('切换到场景:', name);
            originalGoTo(name);
            
            // 如果是泡泡冒险场景，延迟初始化
            if (name === 'paopaoAdventure') {
                setTimeout(() => {
                    initPaopaoAdventure();
                }, 100);
            } else {
                // 重置初始化标志
                paopaoAdventureInitialized = false;
            }
        };
    }
    
    // 检查当前是否在泡泡冒险场景
    const adventureScreen = document.getElementById('paopaoAdventure');
    if (adventureScreen && !adventureScreen.classList.contains('hidden')) {
        console.log('当前在泡泡冒险场景，初始化...');
        setTimeout(() => {
            initPaopaoAdventure();
        }, 500);
    }
});

// 添加全局访问
window.initPaopaoAdventure = initPaopaoAdventure;
window.goToPaopaoAdventure = function() {
    goTo('paopaoAdventure');
};