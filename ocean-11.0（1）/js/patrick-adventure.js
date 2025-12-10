// ========== 派大星冒险场景逻辑 ==========

let currentPatrickDialogueIndex = 0;
let patrickUserFishData = null;
let patrickDialogueSequence = [];
let patrickDialogueActive = false;
let patrickAdventureInitialized = false;

// 初始化派大星冒险场景
function initPatrickAdventure() {
    if (patrickAdventureInitialized) return;
    patrickAdventureInitialized = true;
    
    console.log('初始化派大星冒险场景...');
    
    // 安全检查：必须拥有派大星且未完成冒险
    const hasPatrick = ownedItems && ownedItems.includes('patrick');
    const hasCompletedAdventure = localStorage.getItem('patrickAdventureCompleted') === 'true';
    
    console.log('检查条件:', { hasPatrick, hasCompletedAdventure });
    
    if (!hasPatrick) {
        alert('错误：未拥有派大星');
        goTo('sea');
        return;
    }
    
    if (hasCompletedAdventure) {
        alert('冒险已经完成过了！');
        goTo('sea');
        return;
    }
    
    // 获取用户最新画的小鱼
    patrickUserFishData = getUserLatestFish();
    
    if (!patrickUserFishData) {
        alert('你还没有画小鱼呢！先去画一条小鱼吧！');
        goTo('draw');
        return;
    }
    
    console.log('用户小鱼数据:', patrickUserFishData);
    
    // 设置对话序列（使用备忘录内容）
    patrickDialogueSequence = [
        {
            speaker: 'patrick',
            message: '突然从沙子里冒出来，头上顶着水母帽子，沙子还往下掉，嗨！我们要玩"假装不认识然后突然变好朋友" 的游戏吗？我演技超棒的！',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '忍住笑，那我就当神秘陌生人，咱们的秘密任务是什么？',
            delay: 2000
        },
        {
            speaker: 'patrick',
            message: '立刻压低声音，递来一块海绵，嘘... 我的代号是"星星"！咱们的秘密任务是找世界上最软的石头！这是通讯器，别暴露身份！',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '一本正经接过海绵，收到，保证完成任务！',
            delay: 2000
        },
        {
            speaker: 'patrick',
            message: '开心地跳起来，头上水母都晃掉了，那我们现在就去东边沙滩！找的时候还要伪装，遇到路人就装晒太阳！',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '明白，伪装工作肯定到位！',
            delay: 2000
        },
        {
            speaker: 'patrick',
            message: '今天是我当你朋友的第一天！我们要连续庆祝一百天，每天都玩不一样的新游戏！',
            delay: 2000
        }
    ];
    
    // 设置用户小鱼在场景中
    setupPatrickUserFishInScene();
    
    // 绑定按钮事件
    bindPatrickAdventureEvents();
    
    // 重置状态
    currentPatrickDialogueIndex = 0;
    patrickDialogueActive = true;
    
    // 显示对话容器
    const patrickDialogueContainer = document.querySelector('.patrick-dialogue-container');
    if (patrickDialogueContainer) {
        patrickDialogueContainer.classList.remove('hidden');
    }
    
    // 清除任何可能存在的旧对话
    const existingDialogueBoxes = document.querySelectorAll('.patrick-dialogue-box');
    existingDialogueBoxes.forEach(box => {
        box.classList.add('hidden');
    });
    
    // 立即开始对话
    showNextPatrickDialogue();
}

// 绑定派大星冒险场景事件
function bindPatrickAdventureEvents() {
    console.log('绑定派大星冒险场景事件...');
    
    // 移除可能存在的旧事件监听器
    const nextBtn = document.getElementById('nextPatrickDialogue');
    const skipBtn = document.getElementById('skipPatrickAdventure');
    const seaBtn = document.getElementById('goToSeaFromPatrickAdventure');
    
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
        newNextBtn.addEventListener('click', showNextPatrickDialogue);
    }
    
    if (newSkipBtn) {
        newSkipBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            skipPatrickAdventure();
        });
    }
    
    if (newSeaBtn) {
        newSeaBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            completePatrickAdventure();
            goTo('sea');
        });
    }
}

// 设置用户小鱼在派大星场景中
function setupPatrickUserFishInScene() {
    const userFishContainer = document.querySelector('.patrick-character-user-fish');
    const patrickContainer = document.querySelector('.patrick-character-patrick');
    
    if (!userFishContainer || !patrickContainer || !patrickUserFishData) {
        console.error('派大星场景角色容器或数据缺失');
        return;
    }
    
    // 清空容器
    userFishContainer.innerHTML = '';
    patrickContainer.innerHTML = '';
    
    // 创建派大星图片和名字 - 使用和海绵宝宝一样的样式
    const patrickImg = document.createElement('img');
    patrickImg.src = 'assets/patrick.png';
    patrickImg.alt = '派大星';
    patrickImg.className = 'adventure-character';  // 使用和海绵宝宝一样的类名
    patrickImg.style.width = '100px';  // 固定大小
    patrickImg.style.height = '100px'; // 固定大小
    patrickImg.style.objectFit = 'contain';
    
    const patrickName = document.createElement('div');
    patrickName.className = 'character-name';
    patrickName.textContent = '派大星';
    
    patrickContainer.appendChild(patrickImg);
    patrickContainer.appendChild(patrickName);
    
    // 创建用户小鱼图片和名字 - 使用和海绵宝宝一样的样式
    const userFishImg = document.createElement('img');
    // 确保图片URL有效
    if (patrickUserFishData.imgSrc && patrickUserFishData.imgSrc.startsWith('data:')) {
        userFishImg.src = patrickUserFishData.imgSrc;
    } else {
        userFishImg.src = patrickUserFishData.imgSrc || 'assets/fish.png';
    }
    userFishImg.alt = patrickUserFishData.name;
    userFishImg.className = 'adventure-character';  // 使用和海绵宝宝一样的类名
    userFishImg.style.width = '100px';   // 固定大小
    userFishImg.style.height = '100px';  // 固定大小
    userFishImg.style.objectFit = 'contain';
    
    const userFishName = document.createElement('div');
    userFishName.className = 'character-name';
    userFishName.textContent = patrickUserFishData.name;
    
    userFishContainer.appendChild(userFishImg);
    userFishContainer.appendChild(userFishName);
    
    console.log('派大星场景角色已添加');
}

// 显示派大星下一个对话 - 模仿海绵宝宝逻辑
function showNextPatrickDialogue() {
    console.log('显示派大星下一个对话，当前索引:', currentPatrickDialogueIndex);
    
    if (!patrickDialogueActive) return;
    
    if (currentPatrickDialogueIndex >= patrickDialogueSequence.length) {
        console.log('派大星对话已结束，进入海洋');
        completePatrickDialogue();
        return;
    }
    
    const dialogue = patrickDialogueSequence[currentPatrickDialogueIndex];
    console.log('当前派大星对话:', dialogue);
    
    // 获取对话历史
    const dialogueHistory = patrickDialogueSequence.slice(0, currentPatrickDialogueIndex + 1);
    
    // 只保留最新的两条对话
    const recentDialogues = dialogueHistory.slice(-2);
    console.log('派大星最近两条对话:', recentDialogues);
    
    // 获取对话容器
    const dialogueContainer = document.querySelector('.patrick-dialogue-container');
    if (!dialogueContainer) {
        console.error('派大星对话容器缺失');
        return;
    }
    
    // 确保对话容器可见
    dialogueContainer.classList.remove('hidden');
    
    // 优雅地移除所有旧对话（包括初始的空对话）
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
            const isPatrick = dialogueItem.speaker === 'patrick';
            const dialogueBox = document.createElement('div');
            dialogueBox.className = isPatrick ? 'dialogue-box spongebob-dialogue patrick-dialogue-left' : 'dialogue-box userfish-dialogue patrick-dialogue-right';
            
            // 设置说话者名字
            const speakerElement = document.createElement('div');
            speakerElement.className = 'speaker';
            speakerElement.textContent = isPatrick ? '派大星' : (patrickUserFishData ? patrickUserFishData.name : '你的小鱼');
            
            // 设置消息内容
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.textContent = dialogueItem.message;
            
            // 如果是用户小鱼对话，内容右对齐
            if (!isPatrick) {
                speakerElement.style.textAlign = 'right';
                messageElement.style.textAlign = 'right';
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
    
    currentPatrickDialogueIndex++;
    
    // 如果是最后一个对话，隐藏所有按钮
    if (currentPatrickDialogueIndex >= patrickDialogueSequence.length) {
        console.log('派大星对话结束，准备进入海洋');
        const nextBtn = document.getElementById('nextPatrickDialogue');
        const skipBtn = document.getElementById('skipPatrickAdventure');
        const seaBtn = document.getElementById('goToSeaFromPatrickAdventure');
        
        if (nextBtn) nextBtn.classList.add('hidden');
        if (skipBtn) skipBtn.classList.add('hidden');
        if (seaBtn) seaBtn.classList.add('hidden');
        
        // 等待3秒后自动跳转
        setTimeout(() => {
            completePatrickDialogue();
        }, 3000);
    }
}

// 完成派大星对话
function completePatrickDialogue() {
    if (!patrickDialogueActive) return;
    patrickDialogueActive = false;
    
    console.log('完成派大星对话序列');
    
    const patrickDialogueBox = document.querySelector('.patrick-dialogue-left');
    const userfishDialogueBox = document.querySelector('.patrick-dialogue-right');
    
    if (patrickDialogueBox) patrickDialogueBox.classList.add('hidden');
    if (userfishDialogueBox) userfishDialogueBox.classList.add('hidden');
    
    // 隐藏所有按钮
    const nextBtn = document.getElementById('nextPatrickDialogue');
    const skipBtn = document.getElementById('skipPatrickAdventure');
    const seaBtn = document.getElementById('goToSeaFromPatrickAdventure');
    
    if (nextBtn) nextBtn.classList.add('hidden');
    if (skipBtn) skipBtn.classList.add('hidden');
    if (seaBtn) seaBtn.classList.add('hidden');
    
    console.log('派大星对话完成，准备进入海洋');
    
    // 延迟后自动进入海洋
    setTimeout(() => {
        completePatrickAdventure();
        goTo('sea');
    }, 1000);
}

// 跳过派大星冒险
function skipPatrickAdventure() {
    console.log('跳过派大星冒险');
    if (confirm('确定要跳过派大星的冒险吗？')) {
        completePatrickAdventure();
        goTo('sea');
    }
}

// 完成派大星冒险
function completePatrickAdventure() {
    console.log('完成派大星冒险');
    
    // 标记冒险已完成
    localStorage.setItem('patrickAdventureCompleted', 'true');
    
    // 确保派大星在海洋中可见
    if (fishes && Array.isArray(fishes)) {
        const patrickFish = fishes.find(fish => fish && fish.id === 'store_patrick');
        if (patrickFish) {
            patrickFish.hidden = false;
            // 更新派大星的故事，使其包含特殊对话
            patrickFish.story = '海绵宝宝我们去抓水母吧！今天是我当你朋友的第一天！';
            if (typeof saveFishes === 'function') {
                saveFishes();
            }
        }
    }
    
    // 奖励一些贝壳
    if (typeof addShells === 'function') {
        addShells(20);
    }
    
    console.log('派大星冒险完成，获得奖励');
}

// 当页面加载时检查是否需要初始化派大星冒险场景
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded - 派大星冒险场景');
    
    // 监听场景切换
    const originalGoTo = window.goTo;
    if (originalGoTo) {
        window.goTo = function(name) {
            console.log('切换到场景:', name);
            originalGoTo(name);
            
            // 如果是派大星冒险场景，延迟初始化
            if (name === 'patrickAdventure') {
                setTimeout(() => {
                    initPatrickAdventure();
                }, 100);
            } else {
                // 重置初始化标志
                patrickAdventureInitialized = false;
            }
        };
    }
    
    // 检查当前是否在派大星冒险场景
    const adventureScreen = document.getElementById('patrickAdventure');
    if (adventureScreen && !adventureScreen.classList.contains('hidden')) {
        console.log('当前在派大星冒险场景，初始化...');
        setTimeout(() => {
            initPatrickAdventure();
        }, 500);
    }
});

// 添加全局访问
window.initPatrickAdventure = initPatrickAdventure;
window.goToPatrickAdventure = function() {
    goTo('patrickAdventure');
};