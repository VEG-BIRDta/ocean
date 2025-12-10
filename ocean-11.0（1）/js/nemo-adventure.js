// ========== 尼莫冒险场景逻辑 ==========

let currentNemoDialogueIndex = 0;
let nemoUserFishData = null;
let nemoDialogueSequence = [];
let nemoDialogueActive = false;
let nemoAdventureInitialized = false;

// 初始化尼莫冒险场景
function initNemoAdventure() {
    if (nemoAdventureInitialized) return;
    nemoAdventureInitialized = true;
    
    console.log('初始化尼莫冒险场景...');
    
    // 安全检查：必须拥有尼莫且未完成冒险
    const hasNemo = ownedItems && ownedItems.includes('nemo');
    const hasCompletedAdventure = localStorage.getItem('nemoAdventureCompleted') === 'true';
    
    console.log('检查条件:', { hasNemo, hasCompletedAdventure, ownedItems });
    
    if (!hasNemo) {
        alert('错误：未拥有尼莫');
        goTo('sea');
        return;
    }
    
    if (hasCompletedAdventure) {
        alert('冒险已经完成过了！');
        goTo('sea');
        return;
    }
    
    // 获取用户最新画的小鱼
    nemoUserFishData = getUserLatestFish();
    
    if (!nemoUserFishData) {
        alert('你还没有画小鱼呢！先去画一条小鱼吧！');
        goTo('draw');
        return;
    }
    
    console.log('用户小鱼数据:', nemoUserFishData);
    
    // 设置对话序列
    nemoDialogueSequence = [
        {
            speaker: 'nemo',
            message: '摆动小鱼鳍灵活转圈，身后跟着几个小伙伴，嘿！我们要去探索沉船遗迹，听说里面有好多宝藏，要不要加入我们的探险小队？',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '沉船遗迹会不会有危险？你们都做好准备了吗？',
            delay: 2000
        },
        {
            speaker: 'nemo',
            message: '挠挠头小声说，有一点点，比如缠人的海草、黑漆漆的船舱。但我们有准备！我爸爸教了我避险技巧，小队还有分工，有的探路有的照明有的带急救海草！',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '准备得挺充分，那我加入，我来保护你们！',
            delay: 2000
        },
        {
            speaker: 'nemo',
            message: '开心地蹦起来，太棒了！我来当向导，我去过附近一次，记得路！到了先带你们看船舱外围的漂亮贝壳，还有船缝里的小鱼家！',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '好，你可得好好带路，我们都跟紧你。',
            delay: 2000
        },
        {
            speaker: 'nemo',
            message: '放心！跟着我肯定能发现宝藏！探险结束我还带你去我家，我爸爸会做超好吃的海藻饼！',
            delay: 2000
        }
    ];
    
    // 设置用户小鱼在场景中
    setupNemoUserFishInScene();
    
    // 绑定按钮事件 - 确保只绑定一次
    bindNemoAdventureEvents();
    
    // 重置状态
    currentNemoDialogueIndex = 0;
    nemoDialogueActive = true;
    
    // 显示对话容器
    const dialogueContainer = document.querySelector('.nemo-dialogue-container');
    if (dialogueContainer) {
        dialogueContainer.classList.remove('hidden');
    }
    
    // 清除任何可能存在的旧对话
    const existingDialogueBoxes = document.querySelectorAll('.dialogue-box');
    existingDialogueBoxes.forEach(box => {
        box.classList.add('hidden');
    });
    
    // 立即开始对话
    showNextNemoDialogue();
}

// 绑定尼莫冒险场景事件
function bindNemoAdventureEvents() {
    console.log('绑定尼莫冒险场景事件...');
    
    // 移除可能存在的旧事件监听器
    const nextBtn = document.getElementById('nextNemoDialogue');
    const skipBtn = document.getElementById('skipNemoAdventure');
    const seaBtn = document.getElementById('goToSeaFromNemoAdventure');
    
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
        newNextBtn.addEventListener('click', showNextNemoDialogue);
    }
    
    if (newSkipBtn) {
        newSkipBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            skipNemoAdventure();
        });
    }
    
    if (newSeaBtn) {
        newSeaBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            completeNemoAdventure();
            goTo('sea');
        });
    }
}

// 设置用户小鱼在尼莫场景中
function setupNemoUserFishInScene() {
    const userFishContainer = document.querySelector('.nemo-character-user-fish');
    const nemoContainer = document.querySelector('.nemo-character-nemo');
    
    if (!userFishContainer || !nemoContainer || !nemoUserFishData) {
        console.error('尼莫场景角色容器或数据缺失');
        return;
    }
    
    // 清空容器
    userFishContainer.innerHTML = '';
    nemoContainer.innerHTML = '';
    
    // 创建尼莫图片和名字
    const nemoImg = document.createElement('img');
    nemoImg.src = 'assets/nemo.png';
    nemoImg.alt = '尼莫';
    nemoImg.className = 'adventure-character';
    nemoImg.style.objectFit = 'contain';
    
    const nemoName = document.createElement('div');
    nemoName.className = 'character-name';
    nemoName.textContent = '尼莫';
    
    nemoContainer.appendChild(nemoImg);
    nemoContainer.appendChild(nemoName);
    
    // 创建用户小鱼图片和名字
    const userFishImg = document.createElement('img');
    // 确保图片URL有效
    if (nemoUserFishData.imgSrc && nemoUserFishData.imgSrc.startsWith('data:')) {
        userFishImg.src = nemoUserFishData.imgSrc;
    } else {
        userFishImg.src = nemoUserFishData.imgSrc || 'assets/fish.png';
    }
    userFishImg.alt = nemoUserFishData.name;
    userFishImg.className = 'adventure-character';
    userFishImg.style.objectFit = 'contain';
    
    const userFishName = document.createElement('div');
    userFishName.className = 'character-name';
    userFishName.textContent = nemoUserFishData.name;
    
    userFishContainer.appendChild(userFishImg);
    userFishContainer.appendChild(userFishName);
    
    console.log('尼莫场景角色已添加到场景');
}

// 显示尼莫下一个对话 - 只保留最新两条对话，带有微信式滑动效果
function showNextNemoDialogue() {
    console.log('显示尼莫下一个对话，当前索引:', currentNemoDialogueIndex);
    
    if (!nemoDialogueActive) return;
    
    if (currentNemoDialogueIndex >= nemoDialogueSequence.length) {
        console.log('尼莫对话已结束，进入海洋');
        completeNemoDialogue();
        return;
    }
    
    const dialogue = nemoDialogueSequence[currentNemoDialogueIndex];
    console.log('当前尼莫对话:', dialogue);
    
    // 获取对话历史
    const dialogueHistory = nemoDialogueSequence.slice(0, currentNemoDialogueIndex + 1);
    
    // 只保留最新的两条对话
    const recentDialogues = dialogueHistory.slice(-2);
    console.log('尼莫最近两条对话:', recentDialogues);
    
    // 获取对话容器
    const dialogueContainer = document.querySelector('.nemo-dialogue-container');
    if (!dialogueContainer) {
        console.error('尼莫对话容器缺失');
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
            const isNemo = dialogueItem.speaker === 'nemo';
            const dialogueBox = document.createElement('div');
            dialogueBox.className = isNemo ? 'dialogue-box spongebob-dialogue nemo-dialogue-left' : 'dialogue-box userfish-dialogue nemo-dialogue-right';
            
            // 设置说话者名字
            const speakerElement = document.createElement('div');
            speakerElement.className = 'speaker';
            speakerElement.textContent = isNemo ? '尼莫' : (nemoUserFishData ? nemoUserFishData.name : '你的小鱼');
            
            // 设置消息内容
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.textContent = dialogueItem.message;
            
            // 如果是用户小鱼对话，内容右对齐
            if (!isNemo) {
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
    
    currentNemoDialogueIndex++;
    
    // 如果是最后一个对话，隐藏所有按钮
    if (currentNemoDialogueIndex >= nemoDialogueSequence.length) {
        console.log('尼莫对话结束，准备进入海洋');
        const nextBtn = document.getElementById('nextNemoDialogue');
        const skipBtn = document.getElementById('skipNemoAdventure');
        const seaBtn = document.getElementById('goToSeaFromNemoAdventure');
        
        if (nextBtn) nextBtn.classList.add('hidden');
        if (skipBtn) skipBtn.classList.add('hidden');
        if (seaBtn) seaBtn.classList.add('hidden');
        
        // 等待3秒后自动跳转
        setTimeout(() => {
            completeNemoDialogue();
        }, 3000);
    }
}

// 完成尼莫对话
function completeNemoDialogue() {
    if (!nemoDialogueActive) return;
    nemoDialogueActive = false;
    
    console.log('完成尼莫对话序列');
    
    const nemoDialogue = document.querySelector('.nemo-dialogue-left');
    const userfishDialogue = document.querySelector('.nemo-dialogue-right');
    
    if (nemoDialogue) nemoDialogue.classList.add('hidden');
    if (userfishDialogue) userfishDialogue.classList.add('hidden');
    
    // 隐藏所有按钮
    const nextBtn = document.getElementById('nextNemoDialogue');
    const skipBtn = document.getElementById('skipNemoAdventure');
    const seaBtn = document.getElementById('goToSeaFromNemoAdventure');
    
    if (nextBtn) nextBtn.classList.add('hidden');
    if (skipBtn) skipBtn.classList.add('hidden');
    if (seaBtn) seaBtn.classList.add('hidden');
    
    console.log('尼莫对话完成，准备进入海洋');
    
    // 延迟后自动进入海洋
    setTimeout(() => {
        completeNemoAdventure();
        goTo('sea');
    }, 1000);
}

// 跳过尼莫冒险
function skipNemoAdventure() {
    console.log('跳过尼莫冒险');
    if (confirm('确定要跳过尼莫的冒险吗？')) {
        completeNemoAdventure();
        goTo('sea');
    }
}

// 完成尼莫冒险
function completeNemoAdventure() {
    console.log('完成尼莫冒险');
    
    // 标记冒险已完成
    localStorage.setItem('nemoAdventureCompleted', 'true');
    
    // 确保尼莫在海洋中可见
    if (fishes && Array.isArray(fishes)) {
        const nemoFish = fishes.find(fish => fish && fish.id === 'store_nemo');
        if (nemoFish) {
            nemoFish.hidden = false;
            // 更新尼莫的故事，使其包含特殊对话
            nemoFish.story = '嘿！要一起去探索沉船遗迹吗？我爸爸会做好吃的海藻饼等我们回来！';
            if (typeof saveFishes === 'function') {
                saveFishes();
            }
        }
    }
    
    // 奖励一些贝壳
    if (typeof addShells === 'function') {
        addShells(20);
    }
    
    console.log('尼莫冒险完成，获得奖励');
}

// 当页面加载时检查是否需要初始化尼莫冒险场景
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded - 尼莫冒险场景');
    
    // 监听场景切换
    const originalGoTo = window.goTo;
    if (originalGoTo) {
        window.goTo = function(name) {
            console.log('切换到场景:', name);
            originalGoTo(name);
            
            // 如果是尼莫冒险场景，延迟初始化
            if (name === 'nemoAdventure') {
                setTimeout(() => {
                    initNemoAdventure();
                }, 100);
            } else {
                // 重置初始化标志
                nemoAdventureInitialized = false;
            }
        };
    }
    
    // 检查当前是否在尼莫冒险场景
    const adventureScreen = document.getElementById('nemoAdventure');
    if (adventureScreen && !adventureScreen.classList.contains('hidden')) {
        console.log('当前在尼莫冒险场景，初始化...');
        setTimeout(() => {
            initNemoAdventure();
        }, 500);
    }
});

// 添加全局访问
window.initNemoAdventure = initNemoAdventure;
window.goToNemoAdventure = function() {
    goTo('nemoAdventure');
};
